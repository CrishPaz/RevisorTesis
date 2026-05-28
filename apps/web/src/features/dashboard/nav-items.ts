import type { UserRole } from "@/lib/auth/types";
import type { MessageKey } from "@/lib/i18n";

export type NavItem = {
  href: string;
  label: string;       // Spanish fallback for non-i18n consumers
  labelKey: MessageKey; // Translation key — use this via useTranslations() in client components
};

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  student: [
    { href: "/student", label: "Inicio", labelKey: "nav.student.home" },
    { href: "/student/submissions", label: "Mis avances", labelKey: "nav.student.submissions" },
    { href: "/student/reports", label: "Reportes", labelKey: "nav.student.reports" },
    { href: "/student/profile", label: "Mi perfil (ORCID)", labelKey: "nav.student.profile" },
  ],
  advisor: [
    { href: "/advisor", label: "Inicio", labelKey: "nav.advisor.home" },
    { href: "/advisor/reviews", label: "Revisiones", labelKey: "nav.advisor.reviews" },
    { href: "/advisor/profile", label: "Mi perfil (ORCID)", labelKey: "nav.advisor.profile" },
  ],
  coordinator: [
    { href: "/coordinator", label: "Dashboard", labelKey: "nav.coordinator.dashboard" },
    { href: "/coordinator/templates", label: "Documentos patrón", labelKey: "nav.coordinator.templates" },
    { href: "/coordinator/submissions", label: "Avances", labelKey: "nav.coordinator.submissions" },
    { href: "/coordinator/reports", label: "Reportes", labelKey: "nav.coordinator.reports" },
  ],
  admin: [
    { href: "/admin", label: "Inicio", labelKey: "nav.admin.home" },
    { href: "/admin/users", label: "Usuarios", labelKey: "nav.admin.users" },
    { href: "/admin/programs", label: "Programas", labelKey: "nav.admin.programs" },
    { href: "/admin/settings", label: "Configuración", labelKey: "nav.admin.settings" },
    { href: "/admin/fine-tuning", label: "Fine-tuning", labelKey: "nav.admin.finetuning" },
  ],
};
