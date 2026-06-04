# Integración Copyleaks vía n8n

> Reemplaza la integración anterior, que **nunca funcionó** porque hacía *polling*
> contra `GET /v3/downloads/{scanId}` — un endpoint que **no existe**. La API de
> Copyleaks (Authenticity) es **asíncrona y push por webhook**: vos enviás un scan
> y Copyleaks te notifica por webhook cuando hay resultados.

## Por qué n8n

- **Backend local, base de datos desplegada.** El backend local no es alcanzable
  desde internet, así que Copyleaks no puede llamarlo. n8n sí es público y recibe
  los webhooks; la BD desplegada es alcanzable tanto por n8n como por el backend.
- **n8n = pipe tonto.** Orquesta el protocolo de Copyleaks y vuelca el payload
  **crudo** en la tabla `copyleaks_events`. No interpreta offsets ni toca el
  esquema de negocio.
- **Backend = cerebro.** Pollea `copyleaks_events`, extrae los spans (offsets de
  caracteres) en Python — testeable — ancla a `document_chunks` e inserta en
  `plagiarism_matches`.

## Diagrama

```
BACKEND (local)                  n8n (público)                     COPYLEAKS
───────────────                  ─────────────                     ─────────
enable_copyleaks?
  POST /webhook/copyleaks/submit ─▶ Login + Submit  ───────────────▶ (scanId = version_id)
     { version_id, base64,          status webhook = n8n/status
       filename }                       ?v={version_id}&s={STATUS}
                                   ◀──────── webhook "completed" ──── status?s=completed
                                     INSERT copyleaks_events(completed)
                                     POST /downloads/{scanId}/export ─▶
                                   ◀──────── webhook crawled ──────── (texto del doc)
                                     INSERT copyleaks_events(crawled)
                                   ◀──────── webhook result (xN) ──── (offsets por match)
                                     INSERT copyleaks_events(result)

  pollea copyleaks_events (BD desplegada)
  extrae spans + ancla a chunks (Python)
  INSERT plagiarism_matches
```

## Webhooks que expone n8n

| Path                                | Quién lo llama      | Qué hace n8n                                            |
|-------------------------------------|---------------------|--------------------------------------------------------|
| `POST /webhook/copyleaks/submit`    | tu backend          | login + submit del archivo a Copyleaks                 |
| `POST /webhook/copyleaks/status`    | Copyleaks           | guarda `completed`/`error`; si completed, dispara export |
| `POST /webhook/copyleaks/crawled`   | Copyleaks           | guarda el texto crawleado del documento                |
| `POST /webhook/copyleaks/result`    | Copyleaks           | guarda el detalle de cada match (offsets)              |
| `POST /webhook/copyleaks/export-completed` | Copyleaks    | ack de export terminado (debug)                        |

> El `scanId` enviado a Copyleaks **es** el `version_id` de la `SubmissionVersion`.
> Así la correlación es directa y no hace falta guardar un mapeo aparte.

## Configuración en n8n

1. **Importar** `copyleaks-workflow.json` (Workflows → Import from File).
2. **Credencial Postgres**: creá una credencial Postgres apuntando a la **BD
   desplegada** y asignala en los 3 nodos `Insert *`
   (reemplazá `REPLACE_WITH_PG_CREDENTIAL_ID`).
3. **Variables de entorno de n8n** (Settings → Variables, o env del contenedor):
   - `COPYLEAKS_EMAIL` — email de la cuenta Copyleaks
   - `COPYLEAKS_API_KEY` — API key (UUID) del dashboard
   - `N8N_PUBLIC_BASE` — base pública de n8n, **sin** slash final
     (ej: `https://n8n.tudominio.com`). Se usa para construir las URLs de los
     webhooks que recibe Copyleaks.
4. **Activar** el workflow (los webhooks productivos solo viven con el workflow activo).
5. La migración `e7d2a1c4f9b0_add_copyleaks_events_staging` debe estar aplicada en
   la BD desplegada (crea `copyleaks_events` + el enum + índices). Requiere
   `gen_random_uuid()` (Postgres ≥ 13, nativo).

## Contrato que tu backend manda a n8n

`POST {N8N_PUBLIC_BASE}/webhook/copyleaks/submit`

```json
{
  "version_id": "uuid-de-la-submission-version",
  "base64": "<PDF en base64>",
  "filename": "tesis.pdf"
}
```

n8n responde `200` inmediatamente (ack). Los resultados llegan después por los
otros webhooks y aterrizan en `copyleaks_events`.

## Lado backend (a implementar)

El cliente Python actual (`services/plagiarism/copyleaks_client.py`) y el polling
contra Copyleaks **se eliminan**. En su lugar:

1. **Trigger** (`_run_copyleaks_scan` en `pipeline.py`): en vez de login/submit/poll
   contra Copyleaks, hacer **un POST a n8n** `/webhook/copyleaks/submit` con el
   contrato de arriba. No espera resultados.
2. **Consumer** (nuevo): poller que lee `copyleaks_events` por `version_id` hasta
   tener `completed` + `crawled` + los `result`. Entonces:
   - extrae los fragmentos del documento del alumno usando los offsets
     `comparison.<tipo>.identity.chars.{starts,lengths}` contra el `text.value`
     del evento `crawled`;
   - usa el `map_copyleaks_hits` existente para anclar cada fragmento a un
     `DocumentChunk` e insertar `plagiarism_matches`;
   - marca los eventos `processed = true`.

> ⚠️ **Antes de escribir el extractor**: la estructura detallada del evento
> `result` (`text.comparison.*.identity.chars`) **no está completa en la doc
> pública** de Copyleaks. NO la adivines.
>
> **Capturá un payload real primero** corriendo un scan en `sandbox: true`
> (gratis, devuelve mock results). Mirá las filas que n8n deja en
> `copyleaks_events` (`event_type = 'result'` y `'crawled'`) y construí el
> extractor contra esa forma REAL. Así evitás repetir los "puros errores".

## Estado de fidelidad

Nivel 2 (fidelidad total): resaltado preciso del texto plagiado vía offsets de
caracteres. Requiere el paso de export + crawled + result (ya orquestado por n8n).
