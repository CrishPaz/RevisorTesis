// Panels block — admin/coordinator pages, evaluations, citations, plagiarism,
// templates, programs, users, fine-tuning, orcid, reports.
// Owned by Bloque D. Keys MUST use the `panel.` prefix.

export const esPanels = {
  // ---- Common (panels) ----
  "panel.common.administration": "Administración",
  "panel.common.coordinator": "Coordinador",
  "panel.common.administrator": "Administrador",
  "panel.common.student": "Estudiante",
  "panel.common.advisor": "Asesor",
  "panel.common.filter": "Filtrar",
  "panel.common.clear": "Limpiar",
  "panel.common.back": "Volver",
  "panel.common.dash": "—",
  "panel.common.saved": "Guardado.",
  "panel.common.saving": "Guardando…",
  "panel.common.save": "Guardar",
  "panel.common.creating": "Creando…",
  "panel.common.deleting": "Eliminando…",
  "panel.common.delete": "Eliminar",
  "panel.common.activate": "Activar",
  "panel.common.deactivate": "Desactivar",
  "panel.common.csv": "CSV",
  "panel.common.pdf": "PDF",

  // ---- Admin users page ----
  "panel.admin.users.title": "Usuarios",
  "panel.admin.users.subtitle":
    "Crea cuentas, cambia roles y desactiva accesos. Los usuarios desactivados no pueden iniciar sesión.",
  "panel.admin.users.kpi.students": "Estudiantes",
  "panel.admin.users.kpi.advisors": "Asesores",
  "panel.admin.users.kpi.coordinators": "Coordinadores",
  "panel.admin.users.kpi.admins": "Administradores",
  "panel.admin.users.create.title": "Crear usuario",
  "panel.admin.users.create.description":
    "La contraseña se almacena con Argon2id. El usuario podrá cambiarla después.",
  "panel.admin.users.list.title": "Listado ({count})",
  "panel.admin.users.list.descriptionAll":
    "Filtra por rol o búsqueda. Mostrando todos.",
  "panel.admin.users.list.descriptionActive":
    "Filtra por rol o búsqueda. Mostrando solo activos.",
  "panel.admin.users.search.placeholder": "Buscar por nombre o correo…",
  "panel.admin.users.filter.allRoles": "Todos los roles",
  "panel.admin.users.filter.includeInactive": "incluir inactivos",
  "panel.admin.users.empty": "No hay usuarios que coincidan con los filtros.",

  // ---- Admin programs page ----
  "panel.admin.programs.title": "Programas académicos",
  "panel.admin.programs.subtitle":
    "Maestrías, doctorados y pregrados. Cada programa puede tener uno o varios documentos patrón asociados.",
  "panel.admin.programs.create.title": "Crear programa",
  "panel.admin.programs.create.description":
    "Solo administradores. El código se almacena en mayúsculas.",
  "panel.admin.programs.list.title": "Programas registrados ({count})",
  "panel.admin.programs.list.description":
    "Eliminar un programa borrará sus plantillas asociadas en cascada.",
  "panel.admin.programs.empty": "Aún no hay programas. Crea el primero arriba.",

  // ---- Admin settings page ----
  "panel.admin.settings.title": "Configuración",
  "panel.admin.settings.subtitle":
    "Ajustes operativos del sistema. Los cambios se aplican en caliente sin reinicio.",
  "panel.admin.settings.model.title": "Modelo IA activo",
  "panel.admin.settings.model.description":
    "Selecciona el modelo base de OpenAI y, si tienes un fine-tuneado disponible, activa el toggle A/B.",
  "panel.admin.settings.ft.title": "Fine-tuning",
  "panel.admin.settings.ft.description":
    "Configura cuántos ejemplos de feedback humano son necesarios antes de permitir subir el dataset a OpenAI.",
  "panel.admin.settings.state.title": "Estado actual",
  "panel.admin.settings.state.description":
    "Valores aplicados ahora mismo. Útil para auditar cambios.",
  "panel.admin.settings.state.lastUpdate": "última actualización: {value}",
  "panel.admin.settings.state.defaultValue":
    "valor por defecto (sin override)",

  // ---- Admin fine-tuning page ----
  "panel.admin.ft.title": "Fine-tuning",
  "panel.admin.ft.subtitle":
    "Exporta el feedback humano acumulado como dataset JSONL. Con Gemini el envío programático no está cableado (vive en Vertex AI / Gemini Tuning); el dataset siempre se puede descargar para auditoría o entrenamiento offline.",
  "panel.admin.ft.exportReason":
    "Aún no hay feedback humano elegible. Cuando los asesores modifiquen o descarten hallazgos, podrás exportar el dataset.",
  "panel.admin.ft.kpi.eligible": "Ejemplos elegibles",
  "panel.admin.ft.kpi.thresholdHelper": "umbral sugerido: {value}",
  "panel.admin.ft.kpi.modified": "Modificados",
  "panel.admin.ft.kpi.rejected": "Descartados",
  "panel.admin.ft.kpi.programmaticTuning": "Tuning programático",
  "panel.admin.ft.kpi.available": "Disponible",
  "panel.admin.ft.kpi.unavailable": "No disponible",
  "panel.admin.ft.kpi.tuningHelper":
    "Con Gemini se exporta el JSONL para entrenar offline",
  "panel.admin.ft.newJob.title": "Nuevo job de fine-tuning",
  "panel.admin.ft.newJob.description":
    "Construye un snapshot del dataset con los hallazgos modificados, descartados y con severidad ajustada. Cada job genera su propio archivo JSONL inmutable.",
  "panel.admin.ft.belowThreshold":
    "Estás bajo el umbral sugerido ({current}/{threshold}). Puedes exportar igualmente, pero el proveedor puede rechazar datasets muy pequeños.",
  "panel.admin.ft.jobsList.title": "Jobs registrados ({count})",
  "panel.admin.ft.jobsList.description":
    "Cada job conserva su JSONL en disco. Con Gemini no se envía automáticamente — descarga el archivo para entrenar en Vertex AI.",
  "panel.admin.ft.jobsList.empty":
    "Aún no hay jobs. Crea el primero desde el botón de arriba.",
  "panel.admin.ft.examples": "{count} ejemplos",
  "panel.admin.ft.baseModel": "base {value}",
  "panel.admin.ft.jobId": "job {value}",
  "panel.admin.ft.modelLabel": "Modelo: {value}",
  "panel.admin.ft.created": "Creado {value}",
  "panel.admin.ft.submittedSuffix": " · enviado {value}",
  "panel.admin.ft.finishedSuffix": " · terminado {value}",
  "panel.admin.ft.modelAb.title": "Modelo activo (A/B)",
  "panel.admin.ft.modelAb.description":
    "Toggle entre el modelo Gemini base y un modelo fine-tuneado para todas las evaluaciones IA nuevas. El stub heurístico sigue siendo el fallback si no hay GEMINI_API_KEY configurada.",

  // ---- Coordinator templates ----
  "panel.coordinator.templates.title": "Documentos patrón",
  "panel.coordinator.templates.subtitle":
    "Sube la plantilla institucional (Word o PDF) para cada programa. El sistema extrae automáticamente la estructura de secciones.",
  "panel.coordinator.templates.upload.title": "Subir nueva plantilla",
  "panel.coordinator.templates.upload.description":
    "La versión se incrementa automáticamente por programa.",
  "panel.coordinator.templates.list.title": "Plantillas registradas ({count})",
  "panel.coordinator.templates.list.description":
    "Activa la versión vigente para cada programa.",
  "panel.coordinator.templates.empty":
    "Aún no hay plantillas. Sube la primera arriba.",

  // ---- Coordinator template detail ----
  "panel.coordinator.templateDetail.back": "← Volver a documentos patrón",
  "panel.coordinator.templateDetail.active": "Activa",
  "panel.coordinator.templateDetail.inactive": "Inactiva",
  "panel.coordinator.templateDetail.noDescription": "Sin descripción.",
  "panel.coordinator.templateDetail.program.title": "Programa asociado",
  "panel.coordinator.templateDetail.file.title": "Archivo original",
  "panel.coordinator.templateDetail.file.description":
    "Descarga el documento tal como fue subido.",
  "panel.coordinator.templateDetail.file.name": "Nombre",
  "panel.coordinator.templateDetail.file.mime": "MIME",
  "panel.coordinator.templateDetail.file.size": "Tamaño",
  "panel.coordinator.templateDetail.file.uploaded": "Subido",
  "panel.coordinator.templateDetail.structure.title": "Estructura detectada",
  "panel.coordinator.templateDetail.structure.description":
    "Heurística basada en estilos de encabezado y numeración. La Fase 4 refinará esta extracción con LLM.",
  "panel.coordinator.templateDetail.structure.parsingError":
    "Error desconocido al procesar.",
  "panel.coordinator.templateDetail.structure.processing": "Aún procesando…",
  "panel.coordinator.templateDetail.structure.summaryBase":
    "{sections} secciones de primer nivel · {paragraphs} párrafos · {chars} caracteres",
  "panel.coordinator.templateDetail.structure.summaryPages":
    " · {pages} páginas",

  // ---- Coordinator reports ----
  "panel.coordinator.reports.title": "Reportes",
  "panel.coordinator.reports.subtitle":
    "Vista consolidada de avances, métricas por programa y exportaciones listas para auditoría o reuniones con la escuela.",
  "panel.coordinator.reports.executive": "Reporte ejecutivo (PDF)",
  "panel.coordinator.reports.activity": "Actividad (PDF)",
  "panel.coordinator.reports.kpi.submissions": "Avances",
  "panel.coordinator.reports.kpi.avgGrade": "Nota IA promedio",
  "panel.coordinator.reports.kpi.avgGradeHelper": "/ 20 · {value}",
  "panel.coordinator.reports.kpi.lowCompliance": "Bajo cumplimiento",
  "panel.coordinator.reports.kpi.lowComplianceHelper": "< 60% en IA",
  "panel.coordinator.reports.kpi.criticalAlerts": "Alertas críticas",
  "panel.coordinator.reports.kpi.criticalAlertsHelper": "plagio + ORCID fit",
  "panel.coordinator.reports.rollup.title": "Rollup por programa",
  "panel.coordinator.reports.rollup.description":
    "Métricas agregadas por programa. Incluye avances totales, nota IA promedio y alertas activas.",
  "panel.coordinator.reports.rollup.empty":
    "Aún no hay programas con avances registrados.",
  "panel.coordinator.reports.rollup.code": "Código",
  "panel.coordinator.reports.rollup.program": "Programa",
  "panel.coordinator.reports.rollup.submissions": "Avances",
  "panel.coordinator.reports.rollup.aiGrade": "Nota IA",
  "panel.coordinator.reports.rollup.plagiarism": "Plagio",
  "panel.coordinator.reports.rollup.orcidFit": "ORCID fit",
  "panel.coordinator.reports.list.title": "Listado de avances ({count})",
  "panel.coordinator.reports.list.description":
    "Aplica filtros y descarga el reporte con la selección actual.",
  "panel.coordinator.reports.filter.allPrograms": "Todos los programas",
  "panel.coordinator.reports.filter.allStatuses": "Todos los estados",
  "panel.coordinator.reports.list.empty":
    "No hay avances que coincidan con los filtros.",
  "panel.coordinator.reports.table.program": "Programa",
  "panel.coordinator.reports.table.title": "Título",
  "panel.coordinator.reports.table.student": "Estudiante",
  "panel.coordinator.reports.table.advisor": "Asesor",
  "panel.coordinator.reports.table.status": "Estado",
  "panel.coordinator.reports.table.aiGrade": "Nota IA",
  "panel.coordinator.reports.table.alerts": "Alertas",
  "panel.coordinator.reports.alert.orcid": "ORCID",
  "panel.coordinator.reports.alert.low": "bajo",
  "panel.coordinator.reports.attention.title": "Necesitan atención ({count})",
  "panel.coordinator.reports.attention.description":
    "Avances con afinidad ORCID baja o cumplimiento IA < 60%.",
  "panel.coordinator.reports.attention.orcidFit": "ORCID fit",
  "panel.coordinator.reports.attention.ai": "IA {value}%",

  // ---- Student reports ----
  "panel.student.reports.title": "Mis reportes",
  "panel.student.reports.subtitle":
    "Descarga el acta de revisión PDF de cada avance que ya pasó por el análisis de IA. Útil para adjuntarla a tus borradores o entregarla al jurado.",
  "panel.student.reports.kpi.submissions": "Avances",
  "panel.student.reports.kpi.inProgress": "En proceso",
  "panel.student.reports.kpi.observed": "Observados",
  "panel.student.reports.kpi.approved": "Aprobados",
  "panel.student.reports.list.title": "Actas disponibles ({count})",
  "panel.student.reports.list.description":
    "El acta se genera al vuelo a partir de la última versión analizada. Incluye membrete Tesis, resumen ejecutivo, hallazgos por severidad, plagio y validación de citas.",
  "panel.student.reports.empty": "Aún no tienes avances.",
  "panel.student.reports.createFirst": "Crear el primero",
  "panel.student.reports.viewDetail": "Ver detalle",
  "panel.student.reports.downloadActa": "Descargar acta (PDF)",
  "panel.student.reports.noVersionTitle":
    "Sube una versión para generar el acta",
  "panel.student.reports.noVersion": "Sin versión",
  "panel.student.reports.includes.title": "¿Qué incluye el acta?",
  "panel.student.reports.includes.item1":
    "• Membrete institucional Tesis · UNT · Escuela de Posgrado.",
  "panel.student.reports.includes.item2":
    "• Metadatos del avance (programa, capítulo, asesor, ORCID fit).",
  "panel.student.reports.includes.item3":
    "• Resumen ejecutivo de IA + scores por dimensión + nota /20.",
  "panel.student.reports.includes.item4":
    "• Hallazgos agrupados por severidad, con la acción del asesor.",
  "panel.student.reports.includes.item5":
    "• Detección de plagio intra-programa y validación de citas (CrossRef).",

  // ---- Advisor profile (ORCID) ----
  "panel.advisor.profile.title": "Mi perfil ORCID",
  "panel.advisor.profile.subtitle":
    "Vincula tu identidad académica con ORCID para que el sistema valide automáticamente la afinidad temática con cada avance que supervises.",
  "panel.advisor.profile.status.title": "Estado",
  "panel.advisor.profile.status.linked": "Tu cuenta ORCID está vinculada.",
  "panel.advisor.profile.status.notLinked":
    "Aún no has vinculado tu cuenta ORCID.",
  "panel.advisor.profile.field.orcidId": "ORCID iD",
  "panel.advisor.profile.field.affiliation": "Afiliación",
  "panel.advisor.profile.field.lastSync": "Última sincronización",
  "panel.advisor.profile.field.publicationsCount": "Publicaciones importadas",
  "panel.advisor.profile.publications.title": "Publicaciones ({count})",
  "panel.advisor.profile.publications.description":
    "Los embeddings de estos títulos se usan para validar afinidad temática asesor↔tesis cuando el coordinador te asigna avances.",
  "panel.advisor.profile.publications.emptyLinked":
    "No se encontraron publicaciones públicas en tu ORCID.",
  "panel.advisor.profile.publications.emptyNotLinked":
    "Vincula ORCID para ver tus publicaciones.",

  // ---- Evaluation panel ----
  "panel.evaluation.empty.title": "Evaluación de IA",
  "panel.evaluation.summary.title": "Resumen ejecutivo",
  "panel.evaluation.summary.description":
    "Calificación automatizada Tesis · {count} hallazgos",
  "panel.evaluation.findingsOne": "{count} hallazgo",
  "panel.evaluation.findingsMany": "{count} hallazgos",
  "panel.evaluation.severity.critical": "Crítico",
  "panel.evaluation.severity.major": "Mayor",
  "panel.evaluation.severity.minor": "Menor",
  "panel.evaluation.severity.suggestion": "Sugerencia",

  // ---- Evaluation summary ----
  "panel.evaluation.score.structure": "Estructura",
  "panel.evaluation.score.content": "Contenido",
  "panel.evaluation.score.form": "Forma",
  "panel.evaluation.score.originality": "Originalidad",
  "panel.evaluation.summary.prompt": "prompt {value}",
  "panel.evaluation.summary.duration": "{ms} ms",
  "panel.evaluation.summary.totalCompliance": "Cumplimiento total",
  "panel.evaluation.summary.grade": "Nota:",
  "panel.evaluation.summary.gradeScale": "{value} / 20",
  "panel.evaluation.summary.weight": "peso {value}%",

  // ---- Finding card ----
  "panel.finding.howToFix": "Cómo corregir",
  "panel.finding.example": "Ejemplo",
  "panel.finding.recommendation": "Recomendación:",
  "panel.finding.advisorNote": "Nota del asesor",
  "panel.finding.type.missing_section": "Sección faltante",
  "panel.finding.type.structural_error": "Error estructural",
  "panel.finding.type.content_error": "Error de contenido",
  "panel.finding.type.form_error": "Error de forma",
  "panel.finding.type.coherence_issue": "Incoherencia",
  "panel.finding.type.suggestion": "Sugerencia",
  "panel.finding.humanAction.accepted": "Aceptado",
  "panel.finding.humanAction.modified": "Modificado",
  "panel.finding.humanAction.rejected": "Descartado",

  // ---- Finding actions ----
  "panel.findingActions.severityLabel": "Severidad ajustada (modify)",
  "panel.findingActions.commentLabel": "Comentario (modify / reject)",
  "panel.findingActions.commentPlaceholder": "Justifica tu decisión…",
  "panel.findingActions.accept": "Aceptar",
  "panel.findingActions.modify": "Modificar",
  "panel.findingActions.reject": "Descartar",

  // ---- Citations panel ----
  "panel.citations.title": "Validación de citas (CrossRef)",
  "panel.citations.summary": "{count} referencias detectadas:",
  "panel.citations.viewOriginal": "Ver texto original",
  "panel.citations.searchScholar": "Buscar en Google Scholar →",
  "panel.citations.status.pending": "Pendiente",
  "panel.citations.status.verified": "Verificada",
  "panel.citations.status.partial": "Parcial",
  "panel.citations.status.not_found": "No encontrada",
  "panel.citations.status.hallucinated": "Posible invento",
  "panel.citations.statusLower.pending": "pendiente",
  "panel.citations.statusLower.verified": "verificada",
  "panel.citations.statusLower.partial": "parcial",
  "panel.citations.statusLower.not_found": "no encontrada",
  "panel.citations.statusLower.hallucinated": "posible invento",

  // ---- Plagiarism panel ----
  "panel.plagiarism.title": "Detección de plagio",
  "panel.plagiarism.summaryOne": "{count} avance con texto similar · máximo {max}%",
  "panel.plagiarism.summaryMany": "{count} avances con texto similar · máximo {max}%",
  "panel.plagiarism.fragmentsOne": "{count} fragmento con alta similitud",
  "panel.plagiarism.fragmentsMany": "{count} fragmentos con alta similitud",
  "panel.plagiarism.upTo": "hasta {value}%",
  "panel.plagiarism.inSection": "en {section}",
  "panel.plagiarism.sourceFragment": "Fragmento del avance",
  "panel.plagiarism.matchedFragment": "Fragmento similar",

  // ---- Templates feature ----
  "panel.templates.status.pending": "Pendiente",
  "panel.templates.status.processing": "Procesando",
  "panel.templates.status.parsed": "Procesado",
  "panel.templates.status.failed": "Fallido",
  "panel.templates.active": "Activa",
  "panel.templates.inactive": "Inactiva",
  "panel.templates.confirmDelete": '¿Eliminar la plantilla "{title}"?',
  "panel.templates.activate": "Activar",
  "panel.templates.delete": "Eliminar",
  "panel.templates.form.noPrograms":
    "Aún no hay programas académicos creados. Pide al administrador que cree al menos uno antes de subir documentos patrón.",
  "panel.templates.form.program": "Programa académico",
  "panel.templates.form.title": "Título de la plantilla",
  "panel.templates.form.titlePlaceholder": "Plantilla MIS v1",
  "panel.templates.form.description": "Descripción (opcional)",
  "panel.templates.form.descriptionPlaceholder":
    "Estructura institucional para tesis de maestría",
  "panel.templates.form.file": "Documento (Word .docx o PDF)",
  "panel.templates.form.fileHelp": "Máximo 50 MB.",
  "panel.templates.form.uploading": "Subiendo…",
  "panel.templates.form.upload": "Subir y analizar",
  "panel.templates.structure.empty":
    "No se detectaron secciones. Verifica que el documento use estilos de encabezado o numeración (1., 1.1, etc.).",
  "panel.templates.structure.paragraphsChars": "· {paragraphs} ¶ · {chars} chars",

  // ---- Programs feature ----
  "panel.programs.level.undergraduate": "Pregrado",
  "panel.programs.level.masters": "Maestría",
  "panel.programs.level.doctorate": "Doctorado",
  "panel.programs.confirmDelete": '¿Eliminar el programa "{name}"?',
  "panel.programs.form.name": "Nombre del programa",
  "panel.programs.form.namePlaceholder": "Maestría en Ingeniería de Software",
  "panel.programs.form.code": "Código",
  "panel.programs.form.codePlaceholder": "MIS",
  "panel.programs.form.level": "Nivel",
  "panel.programs.form.success": "Programa creado: {code} — {name}",
  "panel.programs.form.creating": "Creando…",
  "panel.programs.form.create": "Crear programa",

  // ---- Users feature ----
  "panel.users.inactive": "Inactivo",
  "panel.users.you": "tú",
  "panel.users.createdOn": "creado {date}",
  "panel.users.cantChangeOwnRole": "No puedes cambiar tu propio rol",
  "panel.users.cantDeactivateSelf": "No puedes desactivarte",
  "panel.users.deactivate": "Desactivar",
  "panel.users.activate": "Activar",
  "panel.users.resetPassword": "Resetear clave",
  "panel.users.promptNewPassword":
    "Nueva contraseña para {email} (mín. 8 caracteres):",
  "panel.users.passwordTooShort":
    "La contraseña debe tener al menos 8 caracteres.",
  "panel.users.form.fullName": "Nombre completo",
  "panel.users.form.fullNamePlaceholder": "Ana Torres",
  "panel.users.form.email": "Correo",
  "panel.users.form.emailPlaceholder": "ana.torres@unt.edu.pe",
  "panel.users.form.password": "Contraseña (mín. 8)",
  "panel.users.form.role": "Rol",
  "panel.users.form.success": "Usuario creado: {email}",
  "panel.users.form.creating": "Creando…",
  "panel.users.form.create": "Crear usuario",

  // ---- Fine-tuning feature (actions-bar / model-toggle) ----
  "panel.ft.actions.building": "Construyendo dataset…",
  "panel.ft.actions.exportDataset": "Exportar dataset (nuevo job)",
  "panel.ft.actions.downloadJsonl": "Descargar JSONL",
  "panel.ft.actions.submitting": "Enviando…",
  "panel.ft.actions.submitToProvider": "Enviar a proveedor",
  "panel.ft.actions.refresh": "Refrescar",
  "panel.ft.model.active": "Activo: {value}",
  "panel.ft.model.provider": "proveedor: {value}",
  "panel.ft.model.geminiLabel": "Modelo Gemini",
  "panel.ft.model.geminiHelp":
    "Configura GEMINI_API_KEY en apps/api/.env. Por defecto: gemini-2.0-flash.",
  "panel.ft.model.ftLabel": "Modelo fine-tuneado (opcional)",
  "panel.ft.model.ftPlaceholder": "tunedModels/…",
  "panel.ft.model.ftHelp":
    "ID de un modelo tuneado en Vertex AI / Gemini Tuning. Déjalo vacío si no aplica.",
  "panel.ft.model.useFt":
    "Usar modelo fine-tuneado para nuevas evaluaciones (A/B)",

  // ---- ORCID link button ----
  "panel.orcid.confirmUnlink":
    "¿Desvincular tu cuenta de ORCID? Se eliminarán las publicaciones sincronizadas.",
  "panel.orcid.unlinking": "Desvinculando…",
  "panel.orcid.unlink": "Desvincular ORCID",
  "panel.orcid.redirecting": "Redirigiendo…",
  "panel.orcid.link": "Vincular con ORCID",

  // ---- FT threshold form (settings) ----
  "panel.settings.ft.minExamples": "Mínimo de ejemplos para entrenar",
  "panel.settings.ft.help":
    'Umbral mínimo de feedback humano (acciones "modificado" o "descartado") antes de habilitar el envío del dataset a OpenAI.',
  "panel.settings.ft.saving": "Guardando…",
  "panel.settings.ft.save": "Guardar umbral",
} as const;

export const enPanels: Record<keyof typeof esPanels, string> = {
  // ---- Common (panels) ----
  "panel.common.administration": "Administration",
  "panel.common.coordinator": "Coordinator",
  "panel.common.administrator": "Administrator",
  "panel.common.student": "Student",
  "panel.common.advisor": "Advisor",
  "panel.common.filter": "Filter",
  "panel.common.clear": "Clear",
  "panel.common.back": "Back",
  "panel.common.dash": "—",
  "panel.common.saved": "Saved.",
  "panel.common.saving": "Saving…",
  "panel.common.save": "Save",
  "panel.common.creating": "Creating…",
  "panel.common.deleting": "Deleting…",
  "panel.common.delete": "Delete",
  "panel.common.activate": "Activate",
  "panel.common.deactivate": "Deactivate",
  "panel.common.csv": "CSV",
  "panel.common.pdf": "PDF",

  // ---- Admin users page ----
  "panel.admin.users.title": "Users",
  "panel.admin.users.subtitle":
    "Create accounts, change roles, and disable access. Deactivated users cannot sign in.",
  "panel.admin.users.kpi.students": "Students",
  "panel.admin.users.kpi.advisors": "Advisors",
  "panel.admin.users.kpi.coordinators": "Coordinators",
  "panel.admin.users.kpi.admins": "Administrators",
  "panel.admin.users.create.title": "Create user",
  "panel.admin.users.create.description":
    "Passwords are stored with Argon2id. The user can change it later.",
  "panel.admin.users.list.title": "List ({count})",
  "panel.admin.users.list.descriptionAll":
    "Filter by role or search. Showing all.",
  "panel.admin.users.list.descriptionActive":
    "Filter by role or search. Showing active only.",
  "panel.admin.users.search.placeholder": "Search by name or email…",
  "panel.admin.users.filter.allRoles": "All roles",
  "panel.admin.users.filter.includeInactive": "include inactive",
  "panel.admin.users.empty": "No users match the filters.",

  // ---- Admin programs page ----
  "panel.admin.programs.title": "Academic programs",
  "panel.admin.programs.subtitle":
    "Master's, doctoral, and undergraduate programs. Each program may have one or more template documents linked.",
  "panel.admin.programs.create.title": "Create program",
  "panel.admin.programs.create.description":
    "Admins only. The code is stored in uppercase.",
  "panel.admin.programs.list.title": "Registered programs ({count})",
  "panel.admin.programs.list.description":
    "Deleting a program will cascade-delete its associated templates.",
  "panel.admin.programs.empty":
    "No programs yet. Create the first one above.",

  // ---- Admin settings page ----
  "panel.admin.settings.title": "Settings",
  "panel.admin.settings.subtitle":
    "Operational settings. Changes apply on the fly without restart.",
  "panel.admin.settings.model.title": "Active AI model",
  "panel.admin.settings.model.description":
    "Choose the OpenAI base model and, if you have a fine-tuned one available, toggle A/B.",
  "panel.admin.settings.ft.title": "Fine-tuning",
  "panel.admin.settings.ft.description":
    "Configure how many human-feedback examples are needed before allowing the dataset upload to OpenAI.",
  "panel.admin.settings.state.title": "Current state",
  "panel.admin.settings.state.description":
    "Values currently applied. Useful for auditing changes.",
  "panel.admin.settings.state.lastUpdate": "last update: {value}",
  "panel.admin.settings.state.defaultValue": "default value (no override)",

  // ---- Admin fine-tuning page ----
  "panel.admin.ft.title": "Fine-tuning",
  "panel.admin.ft.subtitle":
    "Export accumulated human feedback as a JSONL dataset. With Gemini, programmatic submission is not wired (it lives in Vertex AI / Gemini Tuning); the dataset can always be downloaded for auditing or offline training.",
  "panel.admin.ft.exportReason":
    "No eligible human feedback yet. Once advisors modify or reject findings, you'll be able to export the dataset.",
  "panel.admin.ft.kpi.eligible": "Eligible examples",
  "panel.admin.ft.kpi.thresholdHelper": "suggested threshold: {value}",
  "panel.admin.ft.kpi.modified": "Modified",
  "panel.admin.ft.kpi.rejected": "Rejected",
  "panel.admin.ft.kpi.programmaticTuning": "Programmatic tuning",
  "panel.admin.ft.kpi.available": "Available",
  "panel.admin.ft.kpi.unavailable": "Unavailable",
  "panel.admin.ft.kpi.tuningHelper":
    "With Gemini the JSONL is exported for offline training",
  "panel.admin.ft.newJob.title": "New fine-tuning job",
  "panel.admin.ft.newJob.description":
    "Build a dataset snapshot with modified, rejected, and severity-adjusted findings. Each job creates its own immutable JSONL file.",
  "panel.admin.ft.belowThreshold":
    "You are below the suggested threshold ({current}/{threshold}). You can still export, but the provider may reject very small datasets.",
  "panel.admin.ft.jobsList.title": "Registered jobs ({count})",
  "panel.admin.ft.jobsList.description":
    "Each job keeps its JSONL on disk. With Gemini it is not auto-submitted — download the file to train in Vertex AI.",
  "panel.admin.ft.jobsList.empty":
    "No jobs yet. Create the first one from the button above.",
  "panel.admin.ft.examples": "{count} examples",
  "panel.admin.ft.baseModel": "base {value}",
  "panel.admin.ft.jobId": "job {value}",
  "panel.admin.ft.modelLabel": "Model: {value}",
  "panel.admin.ft.created": "Created {value}",
  "panel.admin.ft.submittedSuffix": " · submitted {value}",
  "panel.admin.ft.finishedSuffix": " · finished {value}",
  "panel.admin.ft.modelAb.title": "Active model (A/B)",
  "panel.admin.ft.modelAb.description":
    "Toggle between the Gemini base model and a fine-tuned model for all new AI evaluations. The heuristic stub remains the fallback if no GEMINI_API_KEY is configured.",

  // ---- Coordinator templates ----
  "panel.coordinator.templates.title": "Template documents",
  "panel.coordinator.templates.subtitle":
    "Upload the institutional template (Word or PDF) for each program. The system automatically extracts the section structure.",
  "panel.coordinator.templates.upload.title": "Upload new template",
  "panel.coordinator.templates.upload.description":
    "The version is auto-incremented per program.",
  "panel.coordinator.templates.list.title": "Registered templates ({count})",
  "panel.coordinator.templates.list.description":
    "Activate the current version for each program.",
  "panel.coordinator.templates.empty":
    "No templates yet. Upload the first one above.",

  // ---- Coordinator template detail ----
  "panel.coordinator.templateDetail.back": "← Back to template documents",
  "panel.coordinator.templateDetail.active": "Active",
  "panel.coordinator.templateDetail.inactive": "Inactive",
  "panel.coordinator.templateDetail.noDescription": "No description.",
  "panel.coordinator.templateDetail.program.title": "Linked program",
  "panel.coordinator.templateDetail.file.title": "Original file",
  "panel.coordinator.templateDetail.file.description":
    "Download the document as it was uploaded.",
  "panel.coordinator.templateDetail.file.name": "Name",
  "panel.coordinator.templateDetail.file.mime": "MIME",
  "panel.coordinator.templateDetail.file.size": "Size",
  "panel.coordinator.templateDetail.file.uploaded": "Uploaded",
  "panel.coordinator.templateDetail.structure.title": "Detected structure",
  "panel.coordinator.templateDetail.structure.description":
    "Heuristic based on heading styles and numbering. Phase 4 will refine this extraction with an LLM.",
  "panel.coordinator.templateDetail.structure.parsingError":
    "Unknown processing error.",
  "panel.coordinator.templateDetail.structure.processing":
    "Still processing…",
  "panel.coordinator.templateDetail.structure.summaryBase":
    "{sections} top-level sections · {paragraphs} paragraphs · {chars} characters",
  "panel.coordinator.templateDetail.structure.summaryPages":
    " · {pages} pages",

  // ---- Coordinator reports ----
  "panel.coordinator.reports.title": "Reports",
  "panel.coordinator.reports.subtitle":
    "Consolidated view of submissions, per-program metrics, and exports ready for audits or school meetings.",
  "panel.coordinator.reports.executive": "Executive report (PDF)",
  "panel.coordinator.reports.activity": "Activity (PDF)",
  "panel.coordinator.reports.kpi.submissions": "Submissions",
  "panel.coordinator.reports.kpi.avgGrade": "Avg AI grade",
  "panel.coordinator.reports.kpi.avgGradeHelper": "/ 20 · {value}",
  "panel.coordinator.reports.kpi.lowCompliance": "Low compliance",
  "panel.coordinator.reports.kpi.lowComplianceHelper": "< 60% in AI",
  "panel.coordinator.reports.kpi.criticalAlerts": "Critical alerts",
  "panel.coordinator.reports.kpi.criticalAlertsHelper":
    "plagiarism + ORCID fit",
  "panel.coordinator.reports.rollup.title": "Per-program rollup",
  "panel.coordinator.reports.rollup.description":
    "Aggregated metrics per program. Includes total submissions, average AI grade, and active alerts.",
  "panel.coordinator.reports.rollup.empty":
    "No programs with submissions yet.",
  "panel.coordinator.reports.rollup.code": "Code",
  "panel.coordinator.reports.rollup.program": "Program",
  "panel.coordinator.reports.rollup.submissions": "Submissions",
  "panel.coordinator.reports.rollup.aiGrade": "AI grade",
  "panel.coordinator.reports.rollup.plagiarism": "Plagiarism",
  "panel.coordinator.reports.rollup.orcidFit": "ORCID fit",
  "panel.coordinator.reports.list.title": "Submission list ({count})",
  "panel.coordinator.reports.list.description":
    "Apply filters and download the report with the current selection.",
  "panel.coordinator.reports.filter.allPrograms": "All programs",
  "panel.coordinator.reports.filter.allStatuses": "All statuses",
  "panel.coordinator.reports.list.empty":
    "No submissions match the filters.",
  "panel.coordinator.reports.table.program": "Program",
  "panel.coordinator.reports.table.title": "Title",
  "panel.coordinator.reports.table.student": "Student",
  "panel.coordinator.reports.table.advisor": "Advisor",
  "panel.coordinator.reports.table.status": "Status",
  "panel.coordinator.reports.table.aiGrade": "AI grade",
  "panel.coordinator.reports.table.alerts": "Alerts",
  "panel.coordinator.reports.alert.orcid": "ORCID",
  "panel.coordinator.reports.alert.low": "low",
  "panel.coordinator.reports.attention.title": "Needs attention ({count})",
  "panel.coordinator.reports.attention.description":
    "Submissions with low ORCID affinity or AI compliance < 60%.",
  "panel.coordinator.reports.attention.orcidFit": "ORCID fit",
  "panel.coordinator.reports.attention.ai": "AI {value}%",

  // ---- Student reports ----
  "panel.student.reports.title": "My reports",
  "panel.student.reports.subtitle":
    "Download the PDF review record of each submission that has been through AI analysis. Useful to attach it to drafts or hand it to the jury.",
  "panel.student.reports.kpi.submissions": "Submissions",
  "panel.student.reports.kpi.inProgress": "In progress",
  "panel.student.reports.kpi.observed": "Observed",
  "panel.student.reports.kpi.approved": "Approved",
  "panel.student.reports.list.title": "Available records ({count})",
  "panel.student.reports.list.description":
    "The record is generated on the fly from the latest analyzed version. Includes Tesis letterhead, executive summary, findings by severity, plagiarism, and citation validation.",
  "panel.student.reports.empty": "You don't have submissions yet.",
  "panel.student.reports.createFirst": "Create the first one",
  "panel.student.reports.viewDetail": "View detail",
  "panel.student.reports.downloadActa": "Download record (PDF)",
  "panel.student.reports.noVersionTitle":
    "Upload a version to generate the record",
  "panel.student.reports.noVersion": "No version",
  "panel.student.reports.includes.title": "What does the record include?",
  "panel.student.reports.includes.item1":
    "• Tesis · UNT · Graduate School institutional letterhead.",
  "panel.student.reports.includes.item2":
    "• Submission metadata (program, chapter, advisor, ORCID fit).",
  "panel.student.reports.includes.item3":
    "• AI executive summary + per-dimension scores + grade /20.",
  "panel.student.reports.includes.item4":
    "• Findings grouped by severity, with the advisor's action.",
  "panel.student.reports.includes.item5":
    "• Intra-program plagiarism detection and citation validation (CrossRef).",

  // ---- Advisor profile (ORCID) ----
  "panel.advisor.profile.title": "My ORCID profile",
  "panel.advisor.profile.subtitle":
    "Link your academic identity with ORCID so the system can automatically validate topical affinity with every submission you supervise.",
  "panel.advisor.profile.status.title": "Status",
  "panel.advisor.profile.status.linked":
    "Your ORCID account is linked.",
  "panel.advisor.profile.status.notLinked":
    "You haven't linked your ORCID account yet.",
  "panel.advisor.profile.field.orcidId": "ORCID iD",
  "panel.advisor.profile.field.affiliation": "Affiliation",
  "panel.advisor.profile.field.lastSync": "Last sync",
  "panel.advisor.profile.field.publicationsCount": "Imported publications",
  "panel.advisor.profile.publications.title": "Publications ({count})",
  "panel.advisor.profile.publications.description":
    "The embeddings of these titles are used to validate advisor↔thesis topical affinity when the coordinator assigns submissions to you.",
  "panel.advisor.profile.publications.emptyLinked":
    "No public publications were found on your ORCID.",
  "panel.advisor.profile.publications.emptyNotLinked":
    "Link ORCID to see your publications.",

  // ---- Evaluation panel ----
  "panel.evaluation.empty.title": "AI evaluation",
  "panel.evaluation.summary.title": "Executive summary",
  "panel.evaluation.summary.description":
    "Tesis automated grading · {count} findings",
  "panel.evaluation.findingsOne": "{count} finding",
  "panel.evaluation.findingsMany": "{count} findings",
  "panel.evaluation.severity.critical": "Critical",
  "panel.evaluation.severity.major": "Major",
  "panel.evaluation.severity.minor": "Minor",
  "panel.evaluation.severity.suggestion": "Suggestion",

  // ---- Evaluation summary ----
  "panel.evaluation.score.structure": "Structure",
  "panel.evaluation.score.content": "Content",
  "panel.evaluation.score.form": "Form",
  "panel.evaluation.score.originality": "Originality",
  "panel.evaluation.summary.prompt": "prompt {value}",
  "panel.evaluation.summary.duration": "{ms} ms",
  "panel.evaluation.summary.totalCompliance": "Total compliance",
  "panel.evaluation.summary.grade": "Grade:",
  "panel.evaluation.summary.gradeScale": "{value} / 20",
  "panel.evaluation.summary.weight": "weight {value}%",

  // ---- Finding card ----
  "panel.finding.howToFix": "How to fix",
  "panel.finding.example": "Example",
  "panel.finding.recommendation": "Recommendation:",
  "panel.finding.advisorNote": "Advisor note",
  "panel.finding.type.missing_section": "Missing section",
  "panel.finding.type.structural_error": "Structural error",
  "panel.finding.type.content_error": "Content error",
  "panel.finding.type.form_error": "Form error",
  "panel.finding.type.coherence_issue": "Inconsistency",
  "panel.finding.type.suggestion": "Suggestion",
  "panel.finding.humanAction.accepted": "Accepted",
  "panel.finding.humanAction.modified": "Modified",
  "panel.finding.humanAction.rejected": "Rejected",

  // ---- Finding actions ----
  "panel.findingActions.severityLabel": "Adjusted severity (modify)",
  "panel.findingActions.commentLabel": "Comment (modify / reject)",
  "panel.findingActions.commentPlaceholder": "Justify your decision…",
  "panel.findingActions.accept": "Accept",
  "panel.findingActions.modify": "Modify",
  "panel.findingActions.reject": "Reject",

  // ---- Citations panel ----
  "panel.citations.title": "Citation validation (CrossRef)",
  "panel.citations.summary": "{count} references detected:",
  "panel.citations.viewOriginal": "View original text",
  "panel.citations.searchScholar": "Search on Google Scholar →",
  "panel.citations.status.pending": "Pending",
  "panel.citations.status.verified": "Verified",
  "panel.citations.status.partial": "Partial",
  "panel.citations.status.not_found": "Not found",
  "panel.citations.status.hallucinated": "Possibly hallucinated",
  "panel.citations.statusLower.pending": "pending",
  "panel.citations.statusLower.verified": "verified",
  "panel.citations.statusLower.partial": "partial",
  "panel.citations.statusLower.not_found": "not found",
  "panel.citations.statusLower.hallucinated": "possibly hallucinated",

  // ---- Plagiarism panel ----
  "panel.plagiarism.title": "Plagiarism detection",
  "panel.plagiarism.summaryOne":
    "{count} submission with similar text · up to {max}%",
  "panel.plagiarism.summaryMany":
    "{count} submissions with similar text · up to {max}%",
  "panel.plagiarism.fragmentsOne":
    "{count} fragment with high similarity",
  "panel.plagiarism.fragmentsMany":
    "{count} fragments with high similarity",
  "panel.plagiarism.upTo": "up to {value}%",
  "panel.plagiarism.inSection": "in {section}",
  "panel.plagiarism.sourceFragment": "Submission fragment",
  "panel.plagiarism.matchedFragment": "Similar fragment",

  // ---- Templates feature ----
  "panel.templates.status.pending": "Pending",
  "panel.templates.status.processing": "Processing",
  "panel.templates.status.parsed": "Parsed",
  "panel.templates.status.failed": "Failed",
  "panel.templates.active": "Active",
  "panel.templates.inactive": "Inactive",
  "panel.templates.confirmDelete": 'Delete template "{title}"?',
  "panel.templates.activate": "Activate",
  "panel.templates.delete": "Delete",
  "panel.templates.form.noPrograms":
    "There are no academic programs yet. Ask the administrator to create at least one before uploading template documents.",
  "panel.templates.form.program": "Academic program",
  "panel.templates.form.title": "Template title",
  "panel.templates.form.titlePlaceholder": "MIS Template v1",
  "panel.templates.form.description": "Description (optional)",
  "panel.templates.form.descriptionPlaceholder":
    "Institutional structure for master's theses",
  "panel.templates.form.file": "Document (Word .docx or PDF)",
  "panel.templates.form.fileHelp": "Max 50 MB.",
  "panel.templates.form.uploading": "Uploading…",
  "panel.templates.form.upload": "Upload and analyze",
  "panel.templates.structure.empty":
    "No sections detected. Verify the document uses heading styles or numbering (1., 1.1, etc.).",
  "panel.templates.structure.paragraphsChars":
    "· {paragraphs} ¶ · {chars} chars",

  // ---- Programs feature ----
  "panel.programs.level.undergraduate": "Undergraduate",
  "panel.programs.level.masters": "Master's",
  "panel.programs.level.doctorate": "Doctorate",
  "panel.programs.confirmDelete": 'Delete program "{name}"?',
  "panel.programs.form.name": "Program name",
  "panel.programs.form.namePlaceholder":
    "Master's in Software Engineering",
  "panel.programs.form.code": "Code",
  "panel.programs.form.codePlaceholder": "MIS",
  "panel.programs.form.level": "Level",
  "panel.programs.form.success": "Program created: {code} — {name}",
  "panel.programs.form.creating": "Creating…",
  "panel.programs.form.create": "Create program",

  // ---- Users feature ----
  "panel.users.inactive": "Inactive",
  "panel.users.you": "you",
  "panel.users.createdOn": "created {date}",
  "panel.users.cantChangeOwnRole": "You can't change your own role",
  "panel.users.cantDeactivateSelf": "You can't deactivate yourself",
  "panel.users.deactivate": "Deactivate",
  "panel.users.activate": "Activate",
  "panel.users.resetPassword": "Reset password",
  "panel.users.promptNewPassword":
    "New password for {email} (min. 8 chars):",
  "panel.users.passwordTooShort":
    "Password must be at least 8 characters.",
  "panel.users.form.fullName": "Full name",
  "panel.users.form.fullNamePlaceholder": "Ana Torres",
  "panel.users.form.email": "Email",
  "panel.users.form.emailPlaceholder": "ana.torres@unt.edu.pe",
  "panel.users.form.password": "Password (min. 8)",
  "panel.users.form.role": "Role",
  "panel.users.form.success": "User created: {email}",
  "panel.users.form.creating": "Creating…",
  "panel.users.form.create": "Create user",

  // ---- Fine-tuning feature (actions-bar / model-toggle) ----
  "panel.ft.actions.building": "Building dataset…",
  "panel.ft.actions.exportDataset": "Export dataset (new job)",
  "panel.ft.actions.downloadJsonl": "Download JSONL",
  "panel.ft.actions.submitting": "Submitting…",
  "panel.ft.actions.submitToProvider": "Submit to provider",
  "panel.ft.actions.refresh": "Refresh",
  "panel.ft.model.active": "Active: {value}",
  "panel.ft.model.provider": "provider: {value}",
  "panel.ft.model.geminiLabel": "Gemini model",
  "panel.ft.model.geminiHelp":
    "Configure GEMINI_API_KEY in apps/api/.env. Default: gemini-2.0-flash.",
  "panel.ft.model.ftLabel": "Fine-tuned model (optional)",
  "panel.ft.model.ftPlaceholder": "tunedModels/…",
  "panel.ft.model.ftHelp":
    "ID of a model tuned in Vertex AI / Gemini Tuning. Leave empty if not applicable.",
  "panel.ft.model.useFt":
    "Use the fine-tuned model for new evaluations (A/B)",

  // ---- ORCID link button ----
  "panel.orcid.confirmUnlink":
    "Unlink your ORCID account? Synced publications will be removed.",
  "panel.orcid.unlinking": "Unlinking…",
  "panel.orcid.unlink": "Unlink ORCID",
  "panel.orcid.redirecting": "Redirecting…",
  "panel.orcid.link": "Link with ORCID",

  // ---- FT threshold form (settings) ----
  "panel.settings.ft.minExamples": "Minimum examples to train",
  "panel.settings.ft.help":
    'Minimum threshold of human feedback ("modified" or "rejected" actions) before enabling the dataset upload to OpenAI.',
  "panel.settings.ft.saving": "Saving…",
  "panel.settings.ft.save": "Save threshold",
};
