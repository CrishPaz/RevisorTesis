// Spanish translations (default locale).
// Keys are dot-notation, flat. Add new keys here AND in en.ts together.
export const es = {
  // Brand / shell
  "brand.name": "Tesis",
  "brand.tagline": "Revisión académica con IA",

  // Locale toggle
  "locale.es": "ES",
  "locale.en": "EN",
  "locale.aria.switchToEs": "Cambiar idioma a español",
  "locale.aria.switchToEn": "Cambiar idioma a inglés",

  // Theme toggle
  "theme.light": "Claro",
  "theme.dark": "Oscuro",
  "theme.aria.toLight": "Activar modo claro",
  "theme.aria.toDark": "Activar modo oscuro",

  // Auth
  "auth.signIn": "Iniciar sesión",
  "auth.signOut": "Cerrar sesión",
  "auth.signUp": "Crear cuenta",
  "auth.support": "Soporte",
  "auth.pill.review": "Revisión",
  "auth.pill.evidence": "Evidencia",
  "auth.pill.rigor": "Rigor",
  "auth.footer.institution": "Universidad Nacional de Trujillo · Escuela de Posgrado",
  "auth.footer.product": "Tesis v0.1 · Revisión académica con IA",
  "auth.access": "Acceso institucional",

  // Roles
  "role.student": "Estudiante",
  "role.advisor": "Asesor",
  "role.coordinator": "Coordinador",
  "role.admin": "Administrador",

  // Sidebar nav (student)
  "nav.student.home": "Inicio",
  "nav.student.submissions": "Mis avances",
  "nav.student.reports": "Reportes",
  "nav.student.profile": "Mi perfil (ORCID)",
  // Sidebar nav (advisor)
  "nav.advisor.home": "Inicio",
  "nav.advisor.reviews": "Revisiones",
  "nav.advisor.profile": "Mi perfil (ORCID)",
  // Sidebar nav (coordinator)
  "nav.coordinator.dashboard": "Dashboard",
  "nav.coordinator.templates": "Documentos patrón",
  "nav.coordinator.submissions": "Avances",
  "nav.coordinator.reports": "Reportes",
  // Sidebar nav (admin)
  "nav.admin.home": "Inicio",
  "nav.admin.users": "Usuarios",
  "nav.admin.programs": "Programas",
  "nav.admin.settings": "Configuración",
  "nav.admin.finetuning": "Fine-tuning",

  // Common actions
  "action.create": "Crear",
  "action.save": "Guardar",
  "action.cancel": "Cancelar",
  "action.delete": "Eliminar",
  "action.edit": "Editar",
  "action.send": "Enviar",
  "action.upload": "Subir",
  "action.download": "Descargar",
  "action.back": "Volver",
  "action.next": "Siguiente",
  "action.previous": "Anterior",
  "action.viewDetail": "Ver detalle",
  "action.loading": "Cargando…",

  // Home (greeting)
  "home.greeting": "Hola, {name}",
  "home.subtitle.student": "Sube tus avances, revisa los hallazgos de la IA y atiende las observaciones del asesor.",
  "home.subtitle.advisor": "Avances asignados a tu cuenta. Calificá la IA y enviá el acta por correo.",
  "home.subtitle.coordinator": "Gestiona avances, asesores y reportes de los programas a tu cargo.",
  "home.subtitle.admin": "Configura programas, usuarios y parámetros del sistema.",

  // KPIs
  "kpi.totalSubmissions": "Avances totales",
  "kpi.inProgress": "En proceso",
  "kpi.observed": "Observados",
  "kpi.approved": "Aprobados",
  "kpi.assigned": "Asignados",
  "kpi.avgGrade": "Nota IA promedio",
} as const;

// MessageKey is exported from ../index.ts after merging all blocks.
export type MessageKeyBase = keyof typeof es;
