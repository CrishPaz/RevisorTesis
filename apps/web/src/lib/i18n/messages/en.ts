import type { MessageKeyBase } from "./es";

// English translations. Keep keys in sync with es.ts.
export const en: Record<MessageKeyBase, string> = {
  // Brand / shell
  "brand.name": "Tesis",
  "brand.tagline": "Academic review with AI",

  // Locale toggle
  "locale.es": "ES",
  "locale.en": "EN",
  "locale.aria.switchToEs": "Switch language to Spanish",
  "locale.aria.switchToEn": "Switch language to English",

  // Theme toggle
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.aria.toLight": "Switch to light mode",
  "theme.aria.toDark": "Switch to dark mode",

  // Auth
  "auth.signIn": "Sign in",
  "auth.signOut": "Sign out",
  "auth.signUp": "Create account",
  "auth.support": "Support",
  "auth.pill.review": "Review",
  "auth.pill.evidence": "Evidence",
  "auth.pill.rigor": "Rigor",
  "auth.footer.institution": "Universidad Nacional de Trujillo · Graduate School",
  "auth.footer.product": "Tesis v0.1 · Academic review with AI",
  "auth.access": "Institutional access",

  // Roles
  "role.student": "Student",
  "role.advisor": "Advisor",
  "role.coordinator": "Coordinator",
  "role.admin": "Administrator",

  // Sidebar nav (student)
  "nav.student.home": "Home",
  "nav.student.submissions": "My submissions",
  "nav.student.reports": "Reports",
  // Sidebar nav (advisor)
  "nav.advisor.home": "Home",
  "nav.advisor.reviews": "Reviews",
  "nav.advisor.profile": "My profile (ORCID)",
  // Sidebar nav (coordinator)
  "nav.coordinator.dashboard": "Dashboard",
  "nav.coordinator.templates": "Templates",
  "nav.coordinator.submissions": "Submissions",
  "nav.coordinator.reports": "Reports",
  // Sidebar nav (admin)
  "nav.admin.home": "Home",
  "nav.admin.users": "Users",
  "nav.admin.programs": "Programs",
  "nav.admin.settings": "Settings",
  "nav.admin.finetuning": "Fine-tuning",

  // Common actions
  "action.create": "Create",
  "action.save": "Save",
  "action.cancel": "Cancel",
  "action.delete": "Delete",
  "action.edit": "Edit",
  "action.send": "Send",
  "action.upload": "Upload",
  "action.download": "Download",
  "action.back": "Back",
  "action.next": "Next",
  "action.previous": "Previous",
  "action.viewDetail": "View detail",
  "action.loading": "Loading…",

  // Home (greeting)
  "home.greeting": "Hi, {name}",
  "home.subtitle.student": "Upload your submissions, review AI findings and address advisor remarks.",
  "home.subtitle.advisor": "Submissions assigned to your account. Grade the AI and send the report by email.",
  "home.subtitle.coordinator": "Manage submissions, advisors and reports of the programs you oversee.",
  "home.subtitle.admin": "Configure programs, users and system parameters.",

  // KPIs
  "kpi.totalSubmissions": "Total submissions",
  "kpi.inProgress": "In progress",
  "kpi.observed": "Observed",
  "kpi.approved": "Approved",
  "kpi.assigned": "Assigned",
  "kpi.avgGrade": "Avg AI grade",
};
