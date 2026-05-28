// Submissions block — student/advisor/coordinator submission listing, detail,
// new, bulk upload, comparison table, version uploader, status badges.
// Owned by Bloque B. Keys MUST use the `submission.` prefix.

export const esSubmissions = {
  // ---- Status (mirror of SUBMISSION_STATUS_LABELS) ----
  "submission.status.draft": "Borrador",
  "submission.status.in_progress": "En proceso",
  "submission.status.observed": "Observado",
  "submission.status.approved": "Aprobado",
  "submission.status.rejected": "Rechazado",

  // ---- Version parsing status (mirror of VERSION_STATUS_LABELS) ----
  "submission.versionStatus.pending": "Pendiente",
  "submission.versionStatus.processing": "Procesando",
  "submission.versionStatus.parsed": "Procesado",
  "submission.versionStatus.failed": "Fallido",
  "submission.versionStatus.ai_queued": "En cola IA",
  "submission.versionStatus.ai_processing": "Análisis IA",
  "submission.versionStatus.ai_completed": "Análisis completado",

  // ---- Student listing page ----
  "submission.list.metadataTitle": "Mis avances · Tesis",
  "submission.list.studentBadge": "Estudiante",
  "submission.list.title": "Mis avances",
  "submission.list.subtitle":
    "Crea un avance y sube las versiones (.docx o .pdf) que quieras revisar.",
  "submission.list.newButton": "Nuevo avance",
  "submission.list.cardTitle": "Avances ({n})",
  "submission.list.cardDescription":
    "Cada avance puede tener múltiples versiones. La última versión es la que será revisada por la IA y tu asesor.",
  "submission.list.empty": "Aún no tienes avances.",
  "submission.list.createFirst": "Crear el primero",
  "submission.list.backToList": "← Volver a mis avances",
  "submission.list.createdOn": "Creado {date}",
  "submission.list.noVersions": "Sin versiones",
  "submission.list.orcidFit": "ORCID fit {n}%",
  "submission.list.orcidFitLowTitle": "La afinidad temática asesor↔tesis es baja",
  "submission.list.orcidFitGoodTitle": "Buena afinidad asesor↔tesis",

  // ---- Student submission detail page ----
  "submission.detail.metadataTitle": "Avance · Tesis",
  "submission.detail.upload.title": "Subir nueva versión",
  "submission.detail.upload.description":
    "Cada versión se analiza automáticamente. Recibirás una nueva evaluación cuando el pipeline termine (típicamente en segundos).",
  "submission.detail.versions.title": "Versiones ({n})",
  "submission.detail.versions.description":
    "Las versiones se ordenan de la más reciente a la más antigua.",
  "submission.detail.eval.noVersion":
    "Sube una versión para activar el análisis.",
  "submission.detail.eval.loading": "Evaluación cargando…",
  "submission.detail.eval.pending":
    "Aún no hay evaluación. Estado actual: {status}.",
  "submission.detail.citations.empty":
    "Aún no se han extraído referencias bibliográficas. Asegúrate de incluir una sección 'Referencias' al final del documento.",

  // ---- New submission page (bulk) ----
  "submission.new.metadataTitle": "Subir avances · Tesis",
  "submission.new.title": "Subir avances",
  "submission.new.subtitle":
    "Podés subir uno o varios archivos a la vez. Cada archivo se crea como un avance independiente con su propia evaluación IA.",
  "submission.new.card.title": "Datos de los avances",
  "submission.new.card.description":
    "Si tu programa tiene un documento patrón activo, se asociará automáticamente a cada avance creado.",

  // ---- Coordinator submissions page ----
  "submission.coordinator.metadataTitle": "Avances del programa · Tesis",
  "submission.coordinator.badge": "Coordinador",
  "submission.coordinator.title": "Avances",
  "submission.coordinator.subtitle":
    "Filtra por programa, estado y alerta ORCID. Asigna o cambia el asesor de cada avance — la afinidad temática se recalcula automáticamente.",
  "submission.coordinator.filters.title": "Filtros",
  "submission.coordinator.filters.description":
    "Los cambios se aplican en vivo. Los filtros van en la URL.",
  "submission.coordinator.results.title": "Resultados ({n})",
  "submission.coordinator.results.description":
    "Selecciona varios avances para aplicar acciones en lote o descargar un reporte comparativo en CSV.",
  "submission.coordinator.noResults":
    "No hay avances que coincidan con los filtros.",

  // ---- Advisor reviews page ----
  "submission.advisor.metadataTitle": "Revisiones · Tesis",
  "submission.advisor.badge": "Asesor",
  "submission.advisor.title": "Mis revisiones",
  "submission.advisor.subtitle":
    "Comparativa de los avances asignados a tu cuenta. Hacé clic en una columna para ordenar.",
  "submission.advisor.kpi.assigned": "Asignados",
  "submission.advisor.kpi.avgGrade": "Nota IA promedio",
  "submission.advisor.kpi.observed": "Observados",
  "submission.advisor.kpi.approved": "Aprobados",
  "submission.advisor.comparison.title": "Tabla comparativa ({n})",
  "submission.advisor.comparison.description":
    "Notas IA, % de cumplimiento y conteo de hallazgos del último archivo subido por cada estudiante. La asignación de asesores se hace desde el panel del coordinador.",

  // ---- Advisor review detail ----
  "submission.advisorDetail.metadataTitle": "Revisar avance · Tesis",
  "submission.advisorDetail.back": "← Volver a mis revisiones",
  "submission.advisorDetail.downloadActa": "Descargar acta PDF",
  "submission.advisorDetail.document.title": "Documento",
  "submission.advisorDetail.document.noVersion":
    "El estudiante aún no ha subido versiones.",
  "submission.advisorDetail.document.docxFallback":
    "Vista previa no disponible para documentos Word. Descarga el archivo para revisarlo.",
  "submission.advisorDetail.document.download": "Descargar {filename}",
  "submission.advisorDetail.eval.noVersion":
    "Sin versión subida — no hay nada que evaluar.",
  "submission.advisorDetail.eval.pending":
    "Aún no hay evaluación. Estado: {status}.",
  "submission.advisorDetail.plagiarism.empty":
    "No se detectaron similitudes significativas (≥85%) con otros avances del programa.",
  "submission.advisorDetail.citations.empty":
    "No se detectaron referencias bibliográficas en el avance (o la sección no se identificó). Asegúrate de incluir una sección 'Referencias' al final.",

  // ---- Single submission form ----
  "submission.form.noPrograms":
    "Aún no hay programas registrados. Contacta al administrador para que cree tu programa antes de poder subir avances.",
  "submission.form.programLabel": "Programa académico",
  "submission.form.titleLabel": "Título del avance",
  "submission.form.titlePlaceholder": "Avance del Capítulo 1",
  "submission.form.chapterLabel": "Capítulo (opcional)",
  "submission.form.chapterPlaceholder": "Capítulo 1, Tesis completa, etc.",
  "submission.form.creating": "Creando…",
  "submission.form.submit": "Crear avance",

  // ---- Bulk submission form ----
  "submission.bulk.noPrograms":
    "Aún no hay programas registrados. Contacta al administrador para que cree tu programa antes de poder subir avances.",
  "submission.bulk.programLabel": "Programa académico",
  "submission.bulk.filesLabel":
    "Archivos (.docx o .pdf) — hasta {max}, máx 5 MB c/u",
  "submission.bulk.filesHelp":
    "Cada archivo se crea como un avance independiente con su propia evaluación IA. Podés agregar archivos en varias tandas hasta llegar a {max}.",
  "submission.bulk.rowsReady": "{n} archivos listos · {size} MB total",
  "submission.bulk.rowsReadyOne": "{n} archivo listo · {size} MB total",
  "submission.bulk.clearAll": "Limpiar todos",
  "submission.bulk.remove": "Quitar",
  "submission.bulk.rowTitleLabel": "Título",
  "submission.bulk.rowChapterLabel": "Capítulo (opcional)",
  "submission.bulk.titlePlaceholder": "Avance del Capítulo 1",
  "submission.bulk.chapterPlaceholder": "Cap. 1, Tesis completa…",
  "submission.bulk.errors.unsupported": "Formato no soportado (.docx / .pdf)",
  "submission.bulk.errors.empty": "Archivo vacío",
  "submission.bulk.errors.tooBig": "Pesa {size} MB (máx 5 MB)",
  "submission.bulk.success": "{n} avances creados. Redirigiendo…",
  "submission.bulk.successOne": "{n} avance creado. Redirigiendo…",
  "submission.bulk.submitting": "Subiendo {n} archivos…",
  "submission.bulk.submittingOne": "Subiendo {n} archivo…",
  "submission.bulk.submit": "Subir {n} avances",
  "submission.bulk.submitOne": "Subir {n} avance",
  "submission.bulk.selectFirst": "Selecciona archivos primero",

  // ---- Version uploader ----
  "submission.uploader.fileLabel": "Archivo (.docx o .pdf)",
  "submission.uploader.maxLabel": "Máximo {size}.",
  "submission.uploader.commentLabel": "Comentario (opcional)",
  "submission.uploader.commentPlaceholder":
    "Cambios respecto a la versión anterior…",
  "submission.uploader.errors.unsupported":
    "Formato no soportado. Subí un archivo .docx o .pdf.",
  "submission.uploader.errors.empty": "El archivo está vacío.",
  "submission.uploader.errors.tooBig":
    "El archivo pesa {size} MB y el máximo permitido es {max}.",
  "submission.uploader.errors.selectFile":
    "Selecciona un archivo Word o PDF.",
  "submission.uploader.submitting": "Subiendo…",
  "submission.uploader.submit": "Subir nueva versión",
  "submission.uploader.success": "Versión {n} subida. Estado: {status}",

  // ---- Version list ----
  "submission.versionList.empty":
    "Aún no hay versiones. Sube la primera con el formulario de arriba.",
  "submission.versionList.pages": "{n} páginas",
  "submission.versionList.download": "Descargar",

  // ---- Filters bar ----
  "submission.filters.allPrograms": "Todos los programas",
  "submission.filters.anyStatus": "Cualquier estado",
  "submission.filters.fitAlert": "Solo ORCID fit alert",
  "submission.filters.clear": "Limpiar",

  // ---- Bulk toolbar ----
  "submission.toolbar.selected": "{n} seleccionados",
  "submission.toolbar.selectedOne": "{n} seleccionado",
  "submission.toolbar.op.reprocess": "Re-procesar IA",
  "submission.toolbar.op.setStatus": "Cambiar estado",
  "submission.toolbar.op.assignAdvisor": "Asignar asesor",
  "submission.toolbar.advisor.unassigned": "— Sin asignar —",
  "submission.toolbar.advisor.orcid": "  ·  ORCID",
  "submission.toolbar.advisor.noOrcid": "  ·  sin ORCID",
  "submission.toolbar.apply": "Aplicar",
  "submission.toolbar.applying": "Aplicando…",
  "submission.toolbar.downloadCsv": "Descargar reporte CSV →",
  "submission.toolbar.clearSelection": "Limpiar selección",
  "submission.toolbar.progress.label": "Procesando IA…",
  "submission.toolbar.progress.count": "{done} / {total} listos",
  "submission.toolbar.result":
    "Resultado: {ok} ok · {err} con error · {total} total.",
  "submission.toolbar.result.detail": "Ver detalle",

  // ---- Selectable list ----
  "submission.selectable.selectAll": "Seleccionar todos ({n})",

  // ---- Comparison table ----
  "submission.table.col.student": "Estudiante",
  "submission.table.col.title": "Título",
  "submission.table.col.chapter": "Capítulo",
  "submission.table.col.grade": "Nota IA",
  "submission.table.col.percentage": "% Cumpl.",
  "submission.table.col.findings": "Hallazgos",
  "submission.table.col.status": "Estado",
  "submission.table.col.createdAt": "Subido",
  "submission.table.empty":
    "No tienes avances asignados aún. Pide al coordinador que te asigne tesistas desde el panel de gestión.",
  "submission.table.review": "Revisar →",
  "submission.table.gradeOver20": "{n} / 20",

  // ---- Email report form ----
  "submission.email.openButton": "Enviar acta por correo",
  "submission.email.title": "Enviar acta por correo",
  "submission.email.close": "Cerrar",
  "submission.email.toLabel": "Correo destinatario",
  "submission.email.toPlaceholder": "alumno@unt.edu.pe",
  "submission.email.messageLabel": "Mensaje (opcional)",
  "submission.email.messagePlaceholder": "Notas para el destinatario…",
  "submission.email.counter": "{n} / 2000",
  "submission.email.submit": "Enviar correo",
  "submission.email.submitting": "Enviando…",
  "submission.email.help": "Se adjuntará el acta del último avance como PDF.",
  "submission.email.success": "Acta enviada a {to} ({filename}).",
} as const;

export const enSubmissions: Record<keyof typeof esSubmissions, string> = {
  // ---- Status ----
  "submission.status.draft": "Draft",
  "submission.status.in_progress": "In progress",
  "submission.status.observed": "Observed",
  "submission.status.approved": "Approved",
  "submission.status.rejected": "Rejected",

  // ---- Version parsing status ----
  "submission.versionStatus.pending": "Pending",
  "submission.versionStatus.processing": "Processing",
  "submission.versionStatus.parsed": "Parsed",
  "submission.versionStatus.failed": "Failed",
  "submission.versionStatus.ai_queued": "AI queued",
  "submission.versionStatus.ai_processing": "AI analyzing",
  "submission.versionStatus.ai_completed": "Analysis completed",

  // ---- Student listing page ----
  "submission.list.metadataTitle": "My submissions · Tesis",
  "submission.list.studentBadge": "Student",
  "submission.list.title": "My submissions",
  "submission.list.subtitle":
    "Create a submission and upload the versions (.docx or .pdf) you want reviewed.",
  "submission.list.newButton": "New submission",
  "submission.list.cardTitle": "Submissions ({n})",
  "submission.list.cardDescription":
    "Each submission can have multiple versions. The latest version is the one reviewed by the AI and your advisor.",
  "submission.list.empty": "You don't have any submissions yet.",
  "submission.list.createFirst": "Create the first one",
  "submission.list.backToList": "← Back to my submissions",
  "submission.list.createdOn": "Created {date}",
  "submission.list.noVersions": "No versions",
  "submission.list.orcidFit": "ORCID fit {n}%",
  "submission.list.orcidFitLowTitle": "Advisor↔thesis topical affinity is low",
  "submission.list.orcidFitGoodTitle": "Good advisor↔thesis affinity",

  // ---- Student submission detail page ----
  "submission.detail.metadataTitle": "Submission · Tesis",
  "submission.detail.upload.title": "Upload a new version",
  "submission.detail.upload.description":
    "Each version is analyzed automatically. You'll receive a new evaluation when the pipeline finishes (usually in seconds).",
  "submission.detail.versions.title": "Versions ({n})",
  "submission.detail.versions.description":
    "Versions are ordered from newest to oldest.",
  "submission.detail.eval.noVersion":
    "Upload a version to trigger the analysis.",
  "submission.detail.eval.loading": "Loading evaluation…",
  "submission.detail.eval.pending":
    "No evaluation yet. Current status: {status}.",
  "submission.detail.citations.empty":
    "No bibliographic references extracted yet. Make sure to include a 'References' section at the end of the document.",

  // ---- New submission page (bulk) ----
  "submission.new.metadataTitle": "Upload submissions · Tesis",
  "submission.new.title": "Upload submissions",
  "submission.new.subtitle":
    "You can upload one or several files at once. Each file is created as an independent submission with its own AI evaluation.",
  "submission.new.card.title": "Submission data",
  "submission.new.card.description":
    "If your program has an active template document, it will be linked automatically to each created submission.",

  // ---- Coordinator submissions page ----
  "submission.coordinator.metadataTitle": "Program submissions · Tesis",
  "submission.coordinator.badge": "Coordinator",
  "submission.coordinator.title": "Submissions",
  "submission.coordinator.subtitle":
    "Filter by program, status and ORCID alert. Assign or change the advisor for each submission — topical affinity is recalculated automatically.",
  "submission.coordinator.filters.title": "Filters",
  "submission.coordinator.filters.description":
    "Changes are applied live. Filters are stored in the URL.",
  "submission.coordinator.results.title": "Results ({n})",
  "submission.coordinator.results.description":
    "Select several submissions to apply bulk actions or download a comparative CSV report.",
  "submission.coordinator.noResults":
    "No submissions match the current filters.",

  // ---- Advisor reviews page ----
  "submission.advisor.metadataTitle": "Reviews · Tesis",
  "submission.advisor.badge": "Advisor",
  "submission.advisor.title": "My reviews",
  "submission.advisor.subtitle":
    "Comparison of submissions assigned to your account. Click a column to sort.",
  "submission.advisor.kpi.assigned": "Assigned",
  "submission.advisor.kpi.avgGrade": "Average AI grade",
  "submission.advisor.kpi.observed": "Observed",
  "submission.advisor.kpi.approved": "Approved",
  "submission.advisor.comparison.title": "Comparison table ({n})",
  "submission.advisor.comparison.description":
    "AI grades, compliance % and finding counts for the latest file uploaded by each student. Advisor assignment is managed from the coordinator panel.",

  // ---- Advisor review detail ----
  "submission.advisorDetail.metadataTitle": "Review submission · Tesis",
  "submission.advisorDetail.back": "← Back to my reviews",
  "submission.advisorDetail.downloadActa": "Download report PDF",
  "submission.advisorDetail.document.title": "Document",
  "submission.advisorDetail.document.noVersion":
    "The student hasn't uploaded any versions yet.",
  "submission.advisorDetail.document.docxFallback":
    "Preview not available for Word documents. Download the file to review it.",
  "submission.advisorDetail.document.download": "Download {filename}",
  "submission.advisorDetail.eval.noVersion":
    "No version uploaded — nothing to evaluate.",
  "submission.advisorDetail.eval.pending":
    "No evaluation yet. Status: {status}.",
  "submission.advisorDetail.plagiarism.empty":
    "No significant similarities (≥85%) detected against other program submissions.",
  "submission.advisorDetail.citations.empty":
    "No bibliographic references detected in the submission (or the section wasn't identified). Make sure to include a 'References' section at the end.",

  // ---- Single submission form ----
  "submission.form.noPrograms":
    "There are no programs registered yet. Contact the administrator to create your program before uploading submissions.",
  "submission.form.programLabel": "Academic program",
  "submission.form.titleLabel": "Submission title",
  "submission.form.titlePlaceholder": "Chapter 1 submission",
  "submission.form.chapterLabel": "Chapter (optional)",
  "submission.form.chapterPlaceholder": "Chapter 1, Full thesis, etc.",
  "submission.form.creating": "Creating…",
  "submission.form.submit": "Create submission",

  // ---- Bulk submission form ----
  "submission.bulk.noPrograms":
    "There are no programs registered yet. Contact the administrator to create your program before uploading submissions.",
  "submission.bulk.programLabel": "Academic program",
  "submission.bulk.filesLabel":
    "Files (.docx or .pdf) — up to {max}, max 5 MB each",
  "submission.bulk.filesHelp":
    "Each file is created as an independent submission with its own AI evaluation. You can add files in several batches up to {max}.",
  "submission.bulk.rowsReady": "{n} files ready · {size} MB total",
  "submission.bulk.rowsReadyOne": "{n} file ready · {size} MB total",
  "submission.bulk.clearAll": "Clear all",
  "submission.bulk.remove": "Remove",
  "submission.bulk.rowTitleLabel": "Title",
  "submission.bulk.rowChapterLabel": "Chapter (optional)",
  "submission.bulk.titlePlaceholder": "Chapter 1 submission",
  "submission.bulk.chapterPlaceholder": "Ch. 1, Full thesis…",
  "submission.bulk.errors.unsupported": "Unsupported format (.docx / .pdf)",
  "submission.bulk.errors.empty": "Empty file",
  "submission.bulk.errors.tooBig": "Weighs {size} MB (max 5 MB)",
  "submission.bulk.success": "{n} submissions created. Redirecting…",
  "submission.bulk.successOne": "{n} submission created. Redirecting…",
  "submission.bulk.submitting": "Uploading {n} files…",
  "submission.bulk.submittingOne": "Uploading {n} file…",
  "submission.bulk.submit": "Upload {n} submissions",
  "submission.bulk.submitOne": "Upload {n} submission",
  "submission.bulk.selectFirst": "Select files first",

  // ---- Version uploader ----
  "submission.uploader.fileLabel": "File (.docx or .pdf)",
  "submission.uploader.maxLabel": "Maximum {size}.",
  "submission.uploader.commentLabel": "Comment (optional)",
  "submission.uploader.commentPlaceholder":
    "Changes since the previous version…",
  "submission.uploader.errors.unsupported":
    "Unsupported format. Upload a .docx or .pdf file.",
  "submission.uploader.errors.empty": "The file is empty.",
  "submission.uploader.errors.tooBig":
    "The file weighs {size} MB and the maximum allowed is {max}.",
  "submission.uploader.errors.selectFile": "Select a Word or PDF file.",
  "submission.uploader.submitting": "Uploading…",
  "submission.uploader.submit": "Upload new version",
  "submission.uploader.success": "Version {n} uploaded. Status: {status}",

  // ---- Version list ----
  "submission.versionList.empty":
    "No versions yet. Upload the first one with the form above.",
  "submission.versionList.pages": "{n} pages",
  "submission.versionList.download": "Download",

  // ---- Filters bar ----
  "submission.filters.allPrograms": "All programs",
  "submission.filters.anyStatus": "Any status",
  "submission.filters.fitAlert": "Only ORCID fit alert",
  "submission.filters.clear": "Clear",

  // ---- Bulk toolbar ----
  "submission.toolbar.selected": "{n} selected",
  "submission.toolbar.selectedOne": "{n} selected",
  "submission.toolbar.op.reprocess": "Re-run AI",
  "submission.toolbar.op.setStatus": "Change status",
  "submission.toolbar.op.assignAdvisor": "Assign advisor",
  "submission.toolbar.advisor.unassigned": "— Unassigned —",
  "submission.toolbar.advisor.orcid": "  ·  ORCID",
  "submission.toolbar.advisor.noOrcid": "  ·  no ORCID",
  "submission.toolbar.apply": "Apply",
  "submission.toolbar.applying": "Applying…",
  "submission.toolbar.downloadCsv": "Download CSV report →",
  "submission.toolbar.clearSelection": "Clear selection",
  "submission.toolbar.progress.label": "Processing AI…",
  "submission.toolbar.progress.count": "{done} / {total} done",
  "submission.toolbar.result":
    "Result: {ok} ok · {err} failed · {total} total.",
  "submission.toolbar.result.detail": "See details",

  // ---- Selectable list ----
  "submission.selectable.selectAll": "Select all ({n})",

  // ---- Comparison table ----
  "submission.table.col.student": "Student",
  "submission.table.col.title": "Title",
  "submission.table.col.chapter": "Chapter",
  "submission.table.col.grade": "AI grade",
  "submission.table.col.percentage": "% Compl.",
  "submission.table.col.findings": "Findings",
  "submission.table.col.status": "Status",
  "submission.table.col.createdAt": "Uploaded",
  "submission.table.empty":
    "You don't have any assigned submissions yet. Ask the coordinator to assign students from the management panel.",
  "submission.table.review": "Review →",
  "submission.table.gradeOver20": "{n} / 20",

  // ---- Email report form ----
  "submission.email.openButton": "Send report by email",
  "submission.email.title": "Send report by email",
  "submission.email.close": "Close",
  "submission.email.toLabel": "Recipient email",
  "submission.email.toPlaceholder": "student@unt.edu.pe",
  "submission.email.messageLabel": "Message (optional)",
  "submission.email.messagePlaceholder": "Notes for the recipient…",
  "submission.email.counter": "{n} / 2000",
  "submission.email.submit": "Send email",
  "submission.email.submitting": "Sending…",
  "submission.email.help": "The latest submission's report will be attached as a PDF.",
  "submission.email.success": "Report sent to {to} ({filename}).",
};
