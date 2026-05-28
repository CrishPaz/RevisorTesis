# KIMY — Manual completo de funcionalidades

> Plataforma web + móvil para gestión, revisión y evaluación automatizada de avances de tesis universitarias.
> Este documento describe **todo lo que hace el sistema, quién lo hace y cómo se conecta entre sí**.

---

## Tabla de contenidos

1. [Qué es KIMY](#qué-es-kimy)
2. [Arquitectura de alto nivel](#arquitectura-de-alto-nivel)
3. [Los 4 roles del sistema](#los-4-roles-del-sistema)
4. [Flujo end-to-end (visión global)](#flujo-end-to-end-visión-global)
5. [Rol 1 — Administrador](#-rol-1--administrador)
6. [Rol 2 — Coordinador](#-rol-2--coordinador)
7. [Rol 3 — Asesor](#-rol-3--asesor)
8. [Rol 4 — Estudiante](#-rol-4--estudiante)
9. [Aplicación móvil](#aplicación-móvil)
10. [Las 4 capas de análisis automático](#las-4-capas-de-análisis-automático)
11. [Estados que viven los avances](#estados-que-viven-los-avances)
12. [Glosario](#glosario)

---

## Qué es KIMY

KIMY recibe la tesis de un estudiante (en Word o PDF), la **compara contra un documento patrón institucional** y le devuelve:

1. Un **puntaje sobre 20** con desglose por dimensión (estructura, contenido, forma, originalidad).
2. Una lista de **hallazgos accionables** ("en el capítulo 3 falta justificación metodológica", etc).
3. Un **informe de plagio** comparando contra todas las otras tesis del programa.
4. Una **validación bibliográfica** que detecta citas inventadas o mal redactadas.
5. Un **acta PDF** lista para firmar.

El asesor humano revisa esos hallazgos y decide cuáles aceptar, modificar o rechazar. El sistema **aprende de esas decisiones** para mejorar el modelo con fine-tuning.

---

## Arquitectura de alto nivel

```
┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
│   WEB        │      │   MOBILE     │      │  ADMIN/SWAGGER   │
│  Next.js 16  │      │  Expo SDK 52 │      │     /docs        │
└──────┬───────┘      └──────┬───────┘      └────────┬─────────┘
       │ HTTPS                │ HTTPS                  │
       └──────────────┬───────┴────────────────────────┘
                      ▼
              ┌───────────────────┐
              │   API FastAPI     │
              │   Python 3.12     │
              │   :8005           │
              └─┬───┬───┬───┬───┬─┘
                │   │   │   │   │
        ┌───────┘   │   │   │   └────────────────┐
        ▼           ▼   ▼   ▼                    ▼
   ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────────────┐
   │POSTGRES │ │ REDIS   │ │ CrossRef │ │ OpenAI/Anthropic│
   │+pgvector│ │rate-lim │ │   API    │ │   /  Stub local │
   └─────────┘ └─────────┘ └──────────┘ └────────────────┘
```

| Capa | Tecnología | Para qué |
|---|---|---|
| Web | Next.js 16, React 19, Tailwind 4 | UI para los 4 roles |
| Mobile | Expo SDK 52, expo-router | App de estudiante |
| API | FastAPI, SQLAlchemy 2.0 async | Toda la lógica de negocio |
| DB | PostgreSQL + pgvector | Datos + embeddings |
| Cache | Redis | Rate-limit + push tokens |
| IA | OpenAI GPT-4o-mini / Anthropic Claude 3.5 / Stub heurístico | Evaluación de tesis |
| ORCID | OAuth real o stub | Identidad académica del asesor |
| CrossRef | API pública | Validación de citas bibliográficas |

---

## Los 4 roles del sistema

| Rol | Para qué existe |
|---|---|
| **Administrador** | Configura la institución: crea programas académicos, gestiona usuarios, opera fine-tuning del modelo IA |
| **Coordinador** | Define los estándares de su programa: sube documentos patrón, configura rúbricas, supervisa todos los avances |
| **Asesor** | Guía al estudiante: revisa los hallazgos generados por la IA, los acepta/modifica/rechaza, conecta su ORCID |
| **Estudiante** | Sube su tesis y recibe retroalimentación: ve scores, hallazgos, plagio, citas problemáticas |

---

## Flujo end-to-end (visión global)

Antes de meternos rol por rol, este es el flujo completo del sistema:

```
1. ADMIN crea programa académico
                │
                ▼
2. COORDINADOR sube documento patrón del programa
   ├─ Extracción heurística de estructura
   └─ Configura rúbrica (pesos por sección)
                │
                ▼
3. ASESOR conecta su ORCID (opcional pero recomendado)
   └─ Sistema baja sus publicaciones + las embebe en pgvector
                │
                ▼
4. ESTUDIANTE crea avance (submission)
   ├─ Elige programa
   ├─ Título del avance + capítulo
   └─ Sube versión 1 (Word/PDF)
                │
                ▼
5. SISTEMA ejecuta pipeline en background:
   a) Extracción de texto + estructura
   b) Evaluación IA contra patrón → scores + findings
   c) Plagio: embebe chunks + cosine vs. otros avances
   d) Citas: extrae + valida con CrossRef
   e) Advisor-fit: similitud tema↔publicaciones ORCID
                │
                ▼
6. ESTUDIANTE recibe push notification — "Tu revisión IA está lista"
                │
                ▼
7. ASESOR revisa los findings:
   ├─ Accept → la IA tuvo razón
   ├─ Modify → ajusta el comentario antes de mandarlo al alumno
   └─ Reject → la IA se equivocó
                │
                ▼
8. ESTUDIANTE corrige + sube versión 2 → vuelve al paso 5
                │
                ▼
9. Cuando todo OK → ASESOR/COORDINADOR aprueba
                │
                ▼
10. ASESOR descarga acta PDF firmable (reportlab)
                │
                ▼
11. ADMIN exporta las decisiones del asesor como JSONL
    └─ Dispara fine-tuning OpenAI → mejor modelo para el próximo ciclo
```

---

## 🛡️ Rol 1 — Administrador

**Login**: `admin@unt.edu.pe / AdminPass123` (seed por defecto)
**Home**: `/admin`

### Qué hace

El admin es el **root institucional**. Configura la base sobre la que trabajan los demás roles.

### Pantallas

| Ruta | Funcionalidad |
|---|---|
| `/admin` | Dashboard general del sistema |
| `/admin/programs` | **CRUD de programas académicos** |
| `/admin/users` | Activar/desactivar usuarios, cambiar roles |
| `/admin/settings` | Configuración global (preferencia de modelo IA, thresholds) |
| `/admin/fine-tuning` | Pipeline de fine-tuning del modelo IA |

### Crear un programa académico (paso a paso)

Esto es **lo primero** que tiene que hacer un admin en una instalación nueva. Sin programas, nadie puede subir nada.

1. Login como admin.
2. Sidebar → **Programas académicos** (`/admin/programs`).
3. Llenar el formulario:
   - **Nombre**: ej. *"Maestría en Ingeniería de Software"*
   - **Código**: corto y único, ej. *"MIS"* (se guarda en mayúsculas)
   - **Nivel**: `undergraduate` / `masters` / `doctorate`
4. Submit. Aparece en la lista de abajo.

**Por API** (también funciona para coordinator):

```bash
curl -X POST http://localhost:8005/api/v1/programs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maestría en Ingeniería de Software","code":"MIS","level":"masters"}'
```

Restricciones:
- `code` es **único** en toda la DB (409 si se repite).
- Borrado en **CASCADE** — se lleva las plantillas y todo lo asociado.

### Fine-tuning del modelo (función avanzada)

`/admin/fine-tuning` permite:

1. **Exportar JSONL** — toma todas las decisiones de los asesores (accept/modify/reject sobre findings) y arma el dataset en formato OpenAI.
2. **Crear fine-tuning job** — sube ese JSONL a OpenAI y dispara el job.
3. **Toggle A/B** — activa el modelo fine-tuneado por programa, o vuelve al base.
4. **Métricas** — compara performance del nuevo modelo vs. el base.

Esto es lo que hace que KIMY **mejore con el tiempo**: cuanto más usan el sistema los asesores, mejor evalúa la IA.

---

## 🧑‍💼 Rol 2 — Coordinador

**Login**: `coord@unt.edu.pe / CoordPass123` (seed por defecto)
**Home**: `/coordinator`

### Qué hace

El coordinador define los **estándares de su programa** y supervisa todos los avances de los estudiantes del programa.

### Pantallas

| Ruta | Funcionalidad |
|---|---|
| `/coordinator` | Dashboard con KPIs y charts (recharts) |
| `/coordinator/templates` | Lista y CRUD de documentos patrón |
| `/coordinator/templates/[id]` | Configurar rúbrica de evaluación |
| `/coordinator/submissions` | Ver TODOS los avances del programa |
| `/coordinator/reports` | Exportar CSV comparativo + acta PDF |

### Documento patrón — qué es y cómo se sube

El **documento patrón** es la "tesis ideal" del programa. Es contra ese documento que el sistema compara cada tesis nueva.

**Para subir uno:**

1. Tiene que existir al menos un programa académico (ver [admin](#-rol-1--administrador)).
2. `/coordinator/templates` → botón "Subir documento patrón".
3. Formulario:
   - **Programa** (dropdown con programas existentes)
   - **Título** ej. *"Patrón de tesis MIS 2024"*
   - **Descripción** (opcional)
   - **Archivo**: Word (.docx) o PDF, máx 50MB
4. Submit. El sistema:
   - Guarda el archivo en `storage/templates/`
   - **Extrae heurísticamente** la estructura (capítulos, secciones)
   - Genera `structure_json` que se usará después en evaluaciones

### Rúbrica

Una vez subido, el coordinador entra al detalle (`/coordinator/templates/[id]`) y configura:

- **Pesos por dimensión** — qué tanto pesa estructura vs. contenido vs. forma vs. originalidad.
- **Pesos por sección** — qué tanto pesa cada capítulo (Resumen, Marco Teórico, Metodología, etc).
- **Criterios específicos** por sección.

La rúbrica se guarda como `rubric_json` y la IA la lee en cada evaluación.

### Operaciones bulk (`POST /api/v1/submissions/bulk`)

Sobre **múltiples avances** a la vez, el coord puede:

| Operación | Qué hace |
|---|---|
| `reprocess_ai` | Vuelve a correr el pipeline IA (útil tras subir patrón nuevo o cambiar rúbrica) |
| `set_status` | Cambia el status de todos a `approved`, `rejected`, etc |
| `assign_advisor` | Asigna o reasigna asesor a varios avances |

### Reportes

- **CSV comparativo** (`GET /api/v1/submissions/batch-report.csv?ids=...`):
  Devuelve una fila por avance ordenada por nota IA descendente. Incluye: title, student, grade_20, percentage, scores por dimensión, advisor_fit_score, findings_count, backend usado (LLM o stub), evaluated_at. BOM UTF-8 para que Excel lo abra bien.

- **Acta PDF** (`GET /api/v1/submissions/{id}/report.pdf`):
  PDF profesional con reportlab. Incluye datos del estudiante, asesor, ORCID, resumen ejecutivo de la IA, scores, plagio agrupado por avance similar, citas por status.

### Asignar asesores

`PATCH /api/v1/submissions/{id}/advisor` con `{"advisor_id": "..."}`.

Cuando se asigna, el sistema **automáticamente recalcula advisor-fit** comparando el tema de la tesis con las publicaciones ORCID del asesor.

---

## 👨‍🏫 Rol 3 — Asesor

**Login**: `asesor@unt.edu.pe / AsesorPass123` (seed por defecto)
**Home**: `/advisor`

### Qué hace

El asesor es el **profesor humano** que guía al estudiante. La IA hace el primer pase; el asesor valida, refina o rechaza.

### Pantallas

| Ruta | Funcionalidad |
|---|---|
| `/advisor` | Dashboard con avances asignados |
| `/advisor/reviews` | Lista de avances que tiene que revisar |
| `/advisor/reviews/[id]` | Revisar un avance: findings agrupados por severidad |
| `/advisor/profile` | Perfil + **conexión ORCID** |

### Conectar ORCID — la feature clave del asesor

ORCID (Open Researcher and Contributor ID) es un identificador único para investigadores académicos. Al conectarlo, KIMY:

1. Hace OAuth con orcid.org (o sandbox en dev).
2. Baja todas las **publicaciones** del asesor.
3. Embebe sus títulos y abstracts con pgvector (1536 dims).
4. Cuando se asigna ese asesor a un avance, calcula la **similitud coseno** entre el tema de la tesis y las publicaciones del asesor.
5. Si la similitud está por debajo de un threshold (default 0.35), marca **`advisor_fit_alert = true`**.

Esto **alerta al coordinador** cuando se asigna un asesor que no tiene background en el tema.

### Revisar findings — el corazón del trabajo del asesor

En `/advisor/reviews/[id]`, el asesor ve:

- Datos del estudiante + avance
- **Score sobre 20** + desglose por dimensión
- **Findings agrupados por severidad**: `critical`, `major`, `minor`
- Por cada finding:
  - Sección/capítulo afectado
  - Descripción del problema
  - **Instruction**: qué tiene que hacer el estudiante
  - **Example**: ejemplo de cómo debería ser
  - **Recommendation**: sugerencia adicional

Para cada finding, el asesor elige una acción humana:

| Acción | Qué pasa |
|---|---|
| ✅ **Accept** | La IA tuvo razón. El finding queda como está. No notifica al estudiante (sería spam). |
| ✏️ **Modify** | El asesor ajusta el comentario antes de mandarlo. Notifica al estudiante por push. |
| ❌ **Reject** | La IA se equivocó. El finding queda marcado como inválido. Notifica al estudiante. |

Endpoint: `PATCH /api/v1/findings/{id}` con `{"action": "modified", "comment": "...", "severity_override": "minor"}`.

**Importante**: cada acción humana queda registrada con timestamp + reviewer_id. Estos datos son los que alimentan el fine-tuning del modelo (paso 11 del flujo global).

---

## 🎓 Rol 4 — Estudiante

**Login**: `alumno@unt.edu.pe / SuperSecure123` (seed por defecto)
**Home**: `/student`

### Qué hace

El estudiante **sube su tesis** y recibe retroalimentación automatizada + humana.

### Pantallas

| Ruta | Funcionalidad |
|---|---|
| `/student` | Dashboard con sus avances + estado actual |
| `/student/submissions` | Lista de todos sus avances |
| `/student/submissions/new` | Crear un nuevo avance |
| `/student/submissions/[id]` | Detalle: versiones, evaluación IA, findings |
| `/student/reports` | Historial de evaluaciones recibidas |

### Crear un avance (submission)

1. `/student/submissions/new`.
2. Formulario:
   - **Título** del avance (ej. *"Análisis comparativo de algoritmos de consenso blockchain"*)
   - **Programa** (dropdown — debe estar creado por el admin)
   - **Capítulo** (opcional, ej. *"Capítulo 3 — Metodología"*)
3. Submit → el avance se crea en estado `draft`.

### Subir una versión

Una vez creado el avance, se suben **versiones** (archivos):

1. `/student/submissions/[id]` → botón "Subir nueva versión".
2. Selecciona archivo (Word .docx o PDF, máx 50MB).
3. Comentario opcional ("agregué la sección de discusión").
4. Submit. El sistema:
   - Guarda el archivo
   - Calcula `file_sha256` (para detectar duplicados)
   - **Dispara el pipeline IA en background** (no bloquea la UI)
   - Devuelve `version_id` con status `ai_queued`

### Esperar la evaluación

El pipeline tarda entre 5 segundos (stub) y 1-2 minutos (LLM real con plagio + citas).

**Estados de la versión**:

| Estado | Significado |
|---|---|
| `pending` | Subida, sin procesar |
| `processing` | Extracción de texto en curso |
| `parsed` | Texto extraído, esperando IA |
| `ai_queued` | En cola del pipeline IA |
| `ai_processing` | IA evaluando ahora |
| `ai_completed` | ✅ Evaluación lista |
| `failed` | ❌ Algo falló (ver `parsing_error`) |

Cuando llega a `ai_completed`, el estudiante recibe **push notification** (si tiene la mobile).

### Ver la evaluación

`/student/submissions/[id]` muestra:

- **Score sobre 20** + nota porcentual
- Breakdown:
  - Estructura (sigue el patrón del programa)
  - Contenido (calidad de la argumentación)
  - Forma (redacción, ortografía, formato)
  - Originalidad (qué tan distinto al resto)
- **Resumen ejecutivo** generado por la IA
- **Findings ordenados por severidad** (critical → major → minor)
- Por cada finding: sección, descripción, instrucción, ejemplo
- Anotaciones del asesor (si ya revisó)

### Descargar archivos

El estudiante puede descargar:
- Su propia versión: `GET /api/v1/submissions/{id}/versions/{vid}/file`
- El acta PDF: `GET /api/v1/submissions/{id}/report.pdf`

---

## Aplicación móvil

Stack: **Expo SDK 52 + expo-router + expo-secure-store + expo-notifications**.

### Pantallas

- `/login` — autenticación
- Tabs:
  - **Inicio** — dashboard de avances
  - **Avances** — lista de submissions
  - **Perfil** — datos del usuario
- Detalle de avance — findings agrupados por severidad

### Push notifications

Al loguear desde un dispositivo físico, expo-notifications pide permiso. Si el usuario acepta:

1. El cliente genera un push token (Expo).
2. Se registra en backend: `POST /api/v1/push/tokens`.
3. El backend almacena `device_id + token + platform + last_seen_at`.

Eventos que disparan notificación:

| Evento | Quién la recibe |
|---|---|
| Evaluación IA completada | Estudiante dueño del avance |
| Asesor modificó un finding | Estudiante dueño del avance |
| Asesor rechazó un finding | Estudiante dueño del avance |

---

## Las 4 capas de análisis automático

Cuando un estudiante sube una versión, el sistema ejecuta **4 análisis independientes** en paralelo. Es lo más sofisticado del proyecto.

### 1. Evaluación IA contra patrón

**Servicio**: `apps/api/src/kimy/services/ai/`

**Cómo funciona**:
- Toma el `structure_json` del documento patrón.
- Toma el texto + estructura del avance.
- Arma un prompt versionado (`prompt_version`) con la rúbrica.
- Llama al LLM configurado:
  - **OpenAI GPT-4o-mini** (default si `OPENAI_API_KEY` está seteada)
  - **Anthropic Claude 3.5 Sonnet** (fallback si solo está `ANTHROPIC_API_KEY`)
  - **Stub heurístico** (si no hay ninguna key — evaluador determinístico que puntúa por palabras clave, longitud, estructura).
- Parsea la respuesta JSON en un `AIEvaluationDraft`:
  - 4 scores (estructura, contenido, forma, originalidad)
  - Resumen ejecutivo
  - Lista de findings con severidad
- Convierte a nota sobre 20 (`decimal_grade`).

**Modo A/B con fine-tuning**: si el admin activó un modelo fine-tuneado, el pipeline lo usa (campo `KEY_AI_MODEL_PREFERENCE` en `system_settings`).

### 2. Detección de plagio intra-programa

**Servicio**: `apps/api/src/kimy/services/plagiarism/`

**Cómo funciona**:
1. **Chunking**: trocea el texto del avance en bloques de ~512 tokens.
2. **Embedding**: cada chunk se vectoriza a 1536 dimensiones (OpenAI `text-embedding-3-small` o hashed-BoW si no hay key).
3. **Persistencia**: se guarda en `document_chunks` con columna `embedding VECTOR(1536)` (pgvector).
4. **Búsqueda**: para cada chunk del avance nuevo, busca los **K más similares** entre todos los chunks de **otros avances del mismo programa**, usando cosine distance (`<=>` de pgvector).
5. **Threshold**: si la similitud supera el umbral (default 0.85), se crea un registro en `plagiarism_matches`.
6. **Agrupación**: los matches se agrupan por `matched_version_id` y se generan **findings tipo `structural_error` con severidad `major`** que se mergean con los findings de la IA.

**Índice**: `HNSW` (Hierarchical Navigable Small World) — soporta búsquedas en miles de tesis en milisegundos.

### 3. Validación de citas con CrossRef

**Servicio**: `apps/api/src/kimy/services/citations/`

**Cómo funciona**:
1. **Extracción**: regex sobre el texto detecta citas en formatos APA, Vancouver, IEEE.
2. **Validación**: cada cita se envía a la API pública de **CrossRef** (`api.crossref.org`).
3. **Clasificación**:

| Status | Significado |
|---|---|
| ✅ `verified` | DOI + título + autores coinciden con CrossRef |
| 🟡 `partial` | Match parcial (ej. título sí, autores no) |
| ❌ `not_found` | CrossRef no devuelve nada con esos datos |
| 🚨 `hallucinated` | La cita tiene rasgos de invención (formato perfecto pero datos inexistentes — típico de citas generadas por ChatGPT) |

4. Cada cita no-verified se convierte en finding:
   - `not_found` / `hallucinated` → severidad `major`
   - `partial` → severidad `minor`

### 4. ORCID Advisor-fit

**Servicio**: `apps/api/src/kimy/services/orcid/`

**Cómo funciona**:
1. Cuando un asesor conecta su ORCID, baja sus publicaciones (`orcid_publications`).
2. Embebe título + abstract de cada publicación → vector 1536 dims.
3. Cuando se asigna ese asesor a un avance:
   - Toma el título + chapter del avance.
   - Embebe → vector.
   - Calcula **cosine similarity** contra todas las publicaciones del asesor.
   - Promedia los top-K.
   - Si `mean_similarity < orcid_advisor_fit_threshold` (default 0.35), marca `advisor_fit_alert = true`.

Esto le permite al coordinador detectar asignaciones donde el asesor no tiene expertise en el tema.

---

## Estados que viven los avances

```
draft  ──── upload ────▶  in_progress  ──── ai_completed ────▶  observed
                                                                    │
                                                                    ▼
                                                      ┌─────────────┴─────────────┐
                                                      ▼                            ▼
                                                  approved                     rejected
```

**Quién puede cambiar el status**:

| De | A | Quién |
|---|---|---|
| `draft` | `in_progress` | Sistema (al subir primera versión) |
| `in_progress` | `observed` | Sistema (al completar IA con findings) |
| `observed` | `approved` | Asesor o Coordinador |
| `observed` | `rejected` | Asesor o Coordinador |
| Cualquiera | Cualquiera | Coordinador/Admin vía bulk (`set_status`) |

---

## Endpoints clave (referencia rápida)

Swagger completo: `http://localhost:8005/docs`

### Auth
- `POST /api/v1/auth/register` — alta de usuario
- `POST /api/v1/auth/login` — devuelve `{access_token, refresh_token}`
- `POST /api/v1/auth/refresh` — refresca el access token
- `GET /api/v1/auth/me` — info del usuario actual

### Programas
- `GET /api/v1/programs` — listar
- `POST /api/v1/programs` — crear (admin/coordinator)
- `DELETE /api/v1/programs/{id}` — borrar en cascada (admin)

### Templates
- `GET /api/v1/templates?program_id=...` — listar
- `POST /api/v1/templates` — subir (multipart con archivo)
- `PATCH /api/v1/templates/{id}` — editar rúbrica
- `POST /api/v1/templates/{id}/activate` — marcar como activa
- `GET /api/v1/templates/{id}/file` — descargar archivo

### Submissions
- `GET /api/v1/submissions` — listar (filtra por rol y query params)
- `POST /api/v1/submissions` — crear (estudiante)
- `GET /api/v1/submissions/{id}` — detalle
- `POST /api/v1/submissions/{id}/versions` — subir nueva versión
- `GET /api/v1/submissions/{id}/versions/{vid}/file` — descargar archivo
- `PATCH /api/v1/submissions/{id}/advisor` — asignar asesor (coord/admin)
- `GET /api/v1/submissions/{id}/report.pdf` — acta PDF

### Evaluations
- `GET /api/v1/submissions/{id}/versions/{vid}/evaluation` — ver eval IA
- `PATCH /api/v1/findings/{id}` — accept/modify/reject (asesor)

### Bulk (coord/admin)
- `POST /api/v1/submissions/bulk` — operaciones masivas
- `GET /api/v1/submissions/batch-report.csv?ids=...` — CSV comparativo

### ORCID
- `GET /api/v1/orcid/authorize` — inicia OAuth
- `GET /api/v1/orcid/callback` — callback OAuth
- `POST /api/v1/orcid/sync` — re-baja publicaciones

### Fine-tuning (admin)
- `GET /api/v1/fine-tuning/dataset.jsonl` — exportar dataset
- `POST /api/v1/fine-tuning/jobs` — crear job en OpenAI
- `GET /api/v1/fine-tuning/jobs` — listar jobs

### Push (mobile)
- `POST /api/v1/push/tokens` — registrar token

### Audit
- `GET /api/v1/audit/logs?...` — ver auditoría

---

## Glosario

| Término | Definición |
|---|---|
| **Avance / Submission** | Una entrega de tesis del estudiante. Tiene múltiples versiones. |
| **Versión / Version** | Un archivo concreto (.docx/.pdf) dentro de un avance. Cada versión tiene su propia evaluación. |
| **Documento patrón / Template** | El "modelo institucional" contra el que se comparan las tesis. Define estructura + rúbrica. |
| **Rúbrica** | JSON con pesos por dimensión y por sección. La IA la lee al evaluar. |
| **Finding / Hallazgo** | Un problema concreto detectado en el avance. Tiene severidad, sección, descripción, instrucción. |
| **HumanAction** | La decisión del asesor sobre un finding: accept / modify / reject. |
| **Chunk** | Trozo de ~512 tokens del texto, embebido en pgvector. Usado para plagio. |
| **Advisor-fit** | Score 0-1 de similitud entre el tema del avance y las publicaciones ORCID del asesor. |
| **Backend** | El motor que evaluó: `openai`, `anthropic`, o `stub`. Queda registrado para auditoría. |
| **pgvector** | Extensión de PostgreSQL para almacenar y buscar embeddings (vectores densos). |
| **HNSW** | Algoritmo de búsqueda aproximada de vecinos más cercanos, usado por pgvector. |
| **CrossRef** | Base de datos pública de citas académicas con DOI. API gratuita. |
| **ORCID** | Identificador único de investigador. KIMY usa OAuth para conectar. |

---

## Checklist mínimo para una demo

Para mostrarle el sistema a alguien (jurado de tesis, asesor, lo que sea):

1. ✅ Sistema arriba (`pnpm api:dev` + `pnpm dev`)
2. ✅ 4 usuarios seeded (admin/coord/asesor/alumno)
3. ✅ Al menos 1 programa académico creado
4. ✅ Al menos 1 documento patrón subido al programa
5. ✅ Asesor con ORCID conectado (puede ser sandbox)
6. ✅ 2-3 avances subidos por el alumno con versiones distintas (para que haya plagio detectable entre ellos)
7. ✅ Asesor con findings revisados (algunos accept, alguno modify, alguno reject)
8. ✅ Acta PDF generada y descargada

Con eso podés mostrar el **flujo completo** en menos de 10 minutos.
