// Auth forms block — login page, register page, login-form, register-form, auth-split.
// Owned by Bloque C. Keys MUST use the `authForm.` prefix.

export const esAuthForms = {
  // Shared (auth-split)
  "authForm.split.institutionalAccess": "Acceso institucional",

  // Login page
  "authForm.login.metaTitle": "Iniciar sesión · Tesis",
  "authForm.login.pill": "Revisión académica con IA",
  "authForm.login.titleLine1": "PENSAR.",
  "authForm.login.titleLine2": "ESCRIBIR.",
  "authForm.login.titleLine3": "SUSTENTAR.",
  "authForm.login.descriptionLead": "La plataforma donde la",
  "authForm.login.descriptionEmphasis": "inteligencia artificial institucional",
  "authForm.login.descriptionTail":
    ", la validación de citas y la revisión de tu asesor convergen en una sola sesión de trabajo.",
  "authForm.login.highlight.findings.label": "Hallazgos IA",
  "authForm.login.highlight.findings.value": "6 capas",
  "authForm.login.highlight.citations.label": "Citas verificadas",
  "authForm.login.highlight.citations.value": "CrossRef",
  "authForm.login.highlight.advisors.label": "Asesores",
  "authForm.login.highlight.advisors.value": "ORCID",
  "authForm.login.formTitle": "Iniciar sesión",
  "authForm.login.formDescription":
    "Usa tu correo institucional UNT y la contraseña que te entregó la coordinación.",
  "authForm.login.footerQuestion": "¿No tienes cuenta?",
  "authForm.login.footerCta": "Crear una",

  // Login form
  "authForm.login.emailLabel": "Correo institucional",
  "authForm.login.passwordLabel": "Contraseña",
  "authForm.login.submit": "Ingresar",
  "authForm.login.submitting": "Ingresando…",

  // Register page
  "authForm.register.metaTitle": "Crear cuenta · Tesis",
  "authForm.register.pill": "Únete a la plataforma",
  "authForm.register.titleLine1": "UN PASO MÁS",
  "authForm.register.titleHighlight": "CERCA",
  "authForm.register.titleTail": "DE TU Tesis.",
  "authForm.register.description":
    "Crea tu cuenta para subir avances, recibir retroalimentación de la IA y trabajar en paralelo con tu asesor. La revisión queda registrada, auditada y disponible para tu jurado.",
  "authForm.register.highlight.structure.label": "Estructura",
  "authForm.register.highlight.structure.value": "APA 7",
  "authForm.register.highlight.plagiarism.label": "Plagio",
  "authForm.register.highlight.plagiarism.value": "pgvector",
  "authForm.register.highlight.roles.label": "Roles",
  "authForm.register.highlight.roles.value": "4",
  "authForm.register.formTitle": "Crear cuenta",
  "authForm.register.formDescription":
    "Selecciona tu rol con cuidado: define qué pantallas verás y qué acciones podrás realizar.",
  "authForm.register.footerQuestion": "¿Ya tienes cuenta?",
  "authForm.register.footerCta": "Iniciar sesión",

  // Register form
  "authForm.register.fullNameLabel": "Nombre completo",
  "authForm.register.emailLabel": "Correo institucional",
  "authForm.register.passwordLabel": "Contraseña",
  "authForm.register.passwordHint": "Mínimo 8 caracteres.",
  "authForm.register.roleLabel": "Rol",
  "authForm.register.submit": "Crear cuenta",
  "authForm.register.submitting": "Creando cuenta…",
} as const;

export const enAuthForms: Record<keyof typeof esAuthForms, string> = {
  // Shared (auth-split)
  "authForm.split.institutionalAccess": "Institutional access",

  // Login page
  "authForm.login.metaTitle": "Sign in · Thesis",
  "authForm.login.pill": "AI-powered academic review",
  "authForm.login.titleLine1": "THINK.",
  "authForm.login.titleLine2": "WRITE.",
  "authForm.login.titleLine3": "DEFEND.",
  "authForm.login.descriptionLead": "The platform where",
  "authForm.login.descriptionEmphasis": "institutional artificial intelligence",
  "authForm.login.descriptionTail":
    ", citation validation, and your advisor's review converge in a single working session.",
  "authForm.login.highlight.findings.label": "AI findings",
  "authForm.login.highlight.findings.value": "6 layers",
  "authForm.login.highlight.citations.label": "Verified citations",
  "authForm.login.highlight.citations.value": "CrossRef",
  "authForm.login.highlight.advisors.label": "Advisors",
  "authForm.login.highlight.advisors.value": "ORCID",
  "authForm.login.formTitle": "Sign in",
  "authForm.login.formDescription":
    "Use your UNT institutional email and the password provided by the coordination office.",
  "authForm.login.footerQuestion": "Don't have an account?",
  "authForm.login.footerCta": "Create one",

  // Login form
  "authForm.login.emailLabel": "Institutional email",
  "authForm.login.passwordLabel": "Password",
  "authForm.login.submit": "Sign in",
  "authForm.login.submitting": "Signing in…",

  // Register page
  "authForm.register.metaTitle": "Create account · Thesis",
  "authForm.register.pill": "Join the platform",
  "authForm.register.titleLine1": "ONE STEP",
  "authForm.register.titleHighlight": "CLOSER",
  "authForm.register.titleTail": "TO YOUR Thesis.",
  "authForm.register.description":
    "Create your account to upload progress, receive AI feedback, and work in parallel with your advisor. The review is recorded, audited, and available for your committee.",
  "authForm.register.highlight.structure.label": "Structure",
  "authForm.register.highlight.structure.value": "APA 7",
  "authForm.register.highlight.plagiarism.label": "Plagiarism",
  "authForm.register.highlight.plagiarism.value": "pgvector",
  "authForm.register.highlight.roles.label": "Roles",
  "authForm.register.highlight.roles.value": "4",
  "authForm.register.formTitle": "Create account",
  "authForm.register.formDescription":
    "Choose your role carefully: it defines which screens you'll see and which actions you can perform.",
  "authForm.register.footerQuestion": "Already have an account?",
  "authForm.register.footerCta": "Sign in",

  // Register form
  "authForm.register.fullNameLabel": "Full name",
  "authForm.register.emailLabel": "Institutional email",
  "authForm.register.passwordLabel": "Password",
  "authForm.register.passwordHint": "Minimum 8 characters.",
  "authForm.register.roleLabel": "Role",
  "authForm.register.submit": "Create account",
  "authForm.register.submitting": "Creating account…",
};
