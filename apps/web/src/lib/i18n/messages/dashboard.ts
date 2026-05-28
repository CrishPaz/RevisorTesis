// Dashboard block — student/advisor/coordinator/admin home pages + role-home + dashboard widgets.
// Owned by Bloque A. Keys MUST use the `dashboard.` prefix to avoid collisions.

export const esDashboard = {
  // Common (reusable across dashboards)
  "dashboard.common.newSubmission": "Nuevo avance",
  "dashboard.common.viewAll": "Ver todos los avances ({count}) →",
  "dashboard.common.viewAllReviews": "Ver todas las revisiones →",

  // Student home
  "dashboard.student.recentTitle": "Últimos avances",
  "dashboard.student.recentDescription":
    "Tus 3 entregas más recientes. El detalle muestra hallazgos IA y citaciones.",
  "dashboard.student.empty":
    "Aún no tienes avances. Crea el primero con el botón de arriba.",
  "dashboard.student.howTitle": "¿Cómo funciona?",
  "dashboard.student.howStep1":
    "Crea un avance indicando programa, título y capítulo.",
  "dashboard.student.howStep2": "Sube el archivo Word/PDF de tu avance.",
  "dashboard.student.howStep3":
    "Tesis analiza estructura, contenido, citas y plagio.",
  "dashboard.student.howStep4":
    "Tu asesor valida los hallazgos. Recibes una notificación cuando hay cambios.",
  "dashboard.student.metaTitle": "Estudiante · Tesis",

  // Advisor home
  "dashboard.advisor.kpiPending": "Pendientes",
  "dashboard.advisor.kpiFitAlerts": "Alerta ORCID fit",
  "dashboard.advisor.kpiFitAlertsHelper": "afinidad temática baja",
  "dashboard.advisor.toReviewTitle": "Por revisar",
  "dashboard.advisor.toReviewDescription": "Avances activos asignados a ti.",
  "dashboard.advisor.empty":
    "No hay avances pendientes. Cuando un estudiante suba una nueva versión, aparecerá aquí.",
  "dashboard.advisor.viewProfile": "Mi perfil ORCID →",
  "dashboard.advisor.metaTitle": "Asesor · Tesis",

  // Coordinator home
  "dashboard.coordinator.role": "Coordinador",
  "dashboard.coordinator.title": "Dashboard",
  "dashboard.coordinator.subtitle":
    "KPIs agregados de todos los programas. Descarga el reporte ejecutivo para imprimir o compartir con la dirección de escuela.",
  "dashboard.coordinator.executiveReport": "Reporte ejecutivo (PDF)",
  "dashboard.coordinator.kpiAvgGradeHelper": "/ 20 · {pct} de cumplimiento",
  "dashboard.coordinator.kpiConcordance": "Concordancia IA-Humano",
  "dashboard.coordinator.kpiConcordanceHelper":
    "% de hallazgos aceptados sin modificar",
  "dashboard.coordinator.kpiAdvisorsOrcid": "Asesores con ORCID",
  "dashboard.coordinator.kpiPlagiarism": "Alertas de plagio",
  "dashboard.coordinator.kpiPlagiarismHelper": "similitud ≥ 85% intra-programa",
  "dashboard.coordinator.kpiFitAlerts": "Alertas ORCID fit",
  "dashboard.coordinator.kpiFitAlertsHelper": "asesor↔tesis poco afín",
  "dashboard.coordinator.kpiLowCompliance": "Bajo cumplimiento",
  "dashboard.coordinator.kpiLowComplianceHelper": "< 60% en evaluación IA",
  "dashboard.coordinator.kpiCitationsProblematic": "Citas problemáticas",
  "dashboard.coordinator.kpiCitationsProblematicHelper": "de {total} extraídas",
  "dashboard.coordinator.statusDistributionTitle": "Distribución por estado",
  "dashboard.coordinator.statusDistributionDescription":
    "Cantidad de avances en cada etapa del flujo.",
  "dashboard.coordinator.programGradesTitle": "Nota IA promedio por programa",
  "dashboard.coordinator.programGradesDescription":
    "Promedio de la última evaluación IA por avance, sobre 20.",
  "dashboard.coordinator.recentActivityTitle": "Actividad reciente",
  "dashboard.coordinator.recentActivityDescription":
    "Últimos {count} eventos relevantes.",
  "dashboard.coordinator.recentActivityEmpty": "Sin actividad reciente.",
  "dashboard.coordinator.metaTitle": "Dashboard · Tesis",

  // Admin home
  "dashboard.admin.subtitle": "Panorama del sistema en este momento.",
  "dashboard.admin.kpiUsers": "Usuarios",
  "dashboard.admin.kpiUsersHelper": "{count} programas",
  "dashboard.admin.kpiPlagiarismAlerts": "Alertas plagio",
  "dashboard.admin.kpiOrcidAlerts": "Alertas ORCID",
  "dashboard.admin.roleDistributionTitle": "Distribución por rol",
  "dashboard.admin.roleDistributionDescription":
    "Cuentas activas e inactivas combinadas.",
  "dashboard.admin.manageUsers": "Gestionar usuarios →",
  "dashboard.admin.fineTuningTitle": "IA y fine-tuning",
  "dashboard.admin.fineTuningDescription":
    "Modelo en producción y avance del entrenamiento personalizado.",
  "dashboard.admin.activeModel": "Modelo activo",
  "dashboard.admin.eligibleFeedback": "Feedback elegible",
  "dashboard.admin.programmaticTuning": "Tuning programático",
  "dashboard.admin.yes": "sí",
  "dashboard.admin.no": "no",
  "dashboard.admin.adjustSettings": "Ajustar configuración →",
  "dashboard.admin.viewPipeline": "Ver pipeline →",
  "dashboard.admin.quickAccessTitle": "Accesos rápidos",
  "dashboard.admin.quickCreateUsers": "Crear o desactivar usuarios",
  "dashboard.admin.quickManagePrograms": "Administrar programas académicos",
  "dashboard.admin.quickSettings": "Configuración del sistema",
  "dashboard.admin.quickFineTuning": "Pipeline de fine-tuning",
  "dashboard.admin.metaTitle": "Administrador · Tesis",

  // Role-home shared component
  "dashboard.roleHome.sessionTitle": "Tu sesión",
  "dashboard.roleHome.sessionDescription":
    "Información obtenida desde el backend Tesis.",
  "dashboard.roleHome.fieldId": "ID",
  "dashboard.roleHome.fieldEmail": "Correo",
  "dashboard.roleHome.fieldRole": "Rol",
  "dashboard.roleHome.fieldCreated": "Creado",
  "dashboard.roleHome.upcomingTitle": "Próximas funcionalidades",
  "dashboard.roleHome.upcomingDescription":
    "Lo que llegará a este panel en las siguientes fases.",

  // Widgets
  "dashboard.statusDonut.empty": "Sin avances registrados aún.",
  "dashboard.programBars.empty": "Aún no hay calificaciones IA registradas.",
  "dashboard.programBars.tooltipGrade": "Nota IA promedio",
  "dashboard.programBars.tooltipSubmissions": "Avances",
} as const;

export const enDashboard: Record<keyof typeof esDashboard, string> = {
  // Common
  "dashboard.common.newSubmission": "New submission",
  "dashboard.common.viewAll": "View all submissions ({count}) →",
  "dashboard.common.viewAllReviews": "View all reviews →",

  // Student home
  "dashboard.student.recentTitle": "Latest submissions",
  "dashboard.student.recentDescription":
    "Your 3 most recent submissions. Details show AI findings and citations.",
  "dashboard.student.empty":
    "You don't have any submissions yet. Create the first one using the button above.",
  "dashboard.student.howTitle": "How does it work?",
  "dashboard.student.howStep1":
    "Create a submission specifying program, title and chapter.",
  "dashboard.student.howStep2": "Upload the Word/PDF file of your draft.",
  "dashboard.student.howStep3":
    "Tesis analyzes structure, content, citations and plagiarism.",
  "dashboard.student.howStep4":
    "Your advisor validates the findings. You get a notification when there are changes.",
  "dashboard.student.metaTitle": "Student · Tesis",

  // Advisor home
  "dashboard.advisor.kpiPending": "Pending",
  "dashboard.advisor.kpiFitAlerts": "ORCID fit alert",
  "dashboard.advisor.kpiFitAlertsHelper": "low topical affinity",
  "dashboard.advisor.toReviewTitle": "To review",
  "dashboard.advisor.toReviewDescription": "Active submissions assigned to you.",
  "dashboard.advisor.empty":
    "No pending submissions. When a student uploads a new version, it will appear here.",
  "dashboard.advisor.viewProfile": "My ORCID profile →",
  "dashboard.advisor.metaTitle": "Advisor · Tesis",

  // Coordinator home
  "dashboard.coordinator.role": "Coordinator",
  "dashboard.coordinator.title": "Dashboard",
  "dashboard.coordinator.subtitle":
    "Aggregated KPIs across all programs. Download the executive report to print or share with the school office.",
  "dashboard.coordinator.executiveReport": "Executive report (PDF)",
  "dashboard.coordinator.kpiAvgGradeHelper": "/ 20 · {pct} compliance",
  "dashboard.coordinator.kpiConcordance": "AI-Human concordance",
  "dashboard.coordinator.kpiConcordanceHelper":
    "% of findings accepted without changes",
  "dashboard.coordinator.kpiAdvisorsOrcid": "Advisors with ORCID",
  "dashboard.coordinator.kpiPlagiarism": "Plagiarism alerts",
  "dashboard.coordinator.kpiPlagiarismHelper":
    "similarity ≥ 85% within program",
  "dashboard.coordinator.kpiFitAlerts": "ORCID fit alerts",
  "dashboard.coordinator.kpiFitAlertsHelper": "advisor↔thesis low affinity",
  "dashboard.coordinator.kpiLowCompliance": "Low compliance",
  "dashboard.coordinator.kpiLowComplianceHelper": "< 60% in AI evaluation",
  "dashboard.coordinator.kpiCitationsProblematic": "Problematic citations",
  "dashboard.coordinator.kpiCitationsProblematicHelper":
    "out of {total} extracted",
  "dashboard.coordinator.statusDistributionTitle": "Status distribution",
  "dashboard.coordinator.statusDistributionDescription":
    "Number of submissions in each stage of the flow.",
  "dashboard.coordinator.programGradesTitle": "Average AI grade by program",
  "dashboard.coordinator.programGradesDescription":
    "Average of the last AI evaluation per submission, out of 20.",
  "dashboard.coordinator.recentActivityTitle": "Recent activity",
  "dashboard.coordinator.recentActivityDescription":
    "Latest {count} relevant events.",
  "dashboard.coordinator.recentActivityEmpty": "No recent activity.",
  "dashboard.coordinator.metaTitle": "Dashboard · Tesis",

  // Admin home
  "dashboard.admin.subtitle": "System overview right now.",
  "dashboard.admin.kpiUsers": "Users",
  "dashboard.admin.kpiUsersHelper": "{count} programs",
  "dashboard.admin.kpiPlagiarismAlerts": "Plagiarism alerts",
  "dashboard.admin.kpiOrcidAlerts": "ORCID alerts",
  "dashboard.admin.roleDistributionTitle": "Role distribution",
  "dashboard.admin.roleDistributionDescription":
    "Active and inactive accounts combined.",
  "dashboard.admin.manageUsers": "Manage users →",
  "dashboard.admin.fineTuningTitle": "AI and fine-tuning",
  "dashboard.admin.fineTuningDescription":
    "Production model and custom training progress.",
  "dashboard.admin.activeModel": "Active model",
  "dashboard.admin.eligibleFeedback": "Eligible feedback",
  "dashboard.admin.programmaticTuning": "Programmatic tuning",
  "dashboard.admin.yes": "yes",
  "dashboard.admin.no": "no",
  "dashboard.admin.adjustSettings": "Adjust settings →",
  "dashboard.admin.viewPipeline": "View pipeline →",
  "dashboard.admin.quickAccessTitle": "Quick access",
  "dashboard.admin.quickCreateUsers": "Create or deactivate users",
  "dashboard.admin.quickManagePrograms": "Manage academic programs",
  "dashboard.admin.quickSettings": "System settings",
  "dashboard.admin.quickFineTuning": "Fine-tuning pipeline",
  "dashboard.admin.metaTitle": "Administrator · Tesis",

  // Role-home shared component
  "dashboard.roleHome.sessionTitle": "Your session",
  "dashboard.roleHome.sessionDescription":
    "Information fetched from the Tesis backend.",
  "dashboard.roleHome.fieldId": "ID",
  "dashboard.roleHome.fieldEmail": "Email",
  "dashboard.roleHome.fieldRole": "Role",
  "dashboard.roleHome.fieldCreated": "Created",
  "dashboard.roleHome.upcomingTitle": "Upcoming features",
  "dashboard.roleHome.upcomingDescription":
    "What's coming to this panel in the next phases.",

  // Widgets
  "dashboard.statusDonut.empty": "No submissions registered yet.",
  "dashboard.programBars.empty": "No AI grades registered yet.",
  "dashboard.programBars.tooltipGrade": "Average AI grade",
  "dashboard.programBars.tooltipSubmissions": "Submissions",
};
