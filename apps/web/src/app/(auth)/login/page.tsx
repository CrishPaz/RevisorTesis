import Link from "next/link";

import { AuthSplit } from "@/features/auth/auth-split";
import { LoginForm } from "@/features/auth/login-form";
import { getMessages } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getMessages();
  return {
    title: t("authForm.login.metaTitle"),
  };
}

export default async function LoginPage() {
  const { t } = await getMessages();
  return (
    <AuthSplit
      pill={t("authForm.login.pill")}
      title={
        <>
          {t("authForm.login.titleLine1")}{" "}
          <span className="aurora-gradient-text">
            {t("authForm.login.titleLine2")}
          </span>
          <br />
          {t("authForm.login.titleLine3")}
        </>
      }
      description={
        <>
          {t("authForm.login.descriptionLead")}{" "}
          <strong className="text-[color:var(--aurora-cream)]">
            {t("authForm.login.descriptionEmphasis")}
          </strong>
          {t("authForm.login.descriptionTail")}
        </>
      }
      highlights={[
        {
          label: t("authForm.login.highlight.findings.label"),
          value: t("authForm.login.highlight.findings.value"),
        },
        {
          label: t("authForm.login.highlight.citations.label"),
          value: t("authForm.login.highlight.citations.value"),
        },
        {
          label: t("authForm.login.highlight.advisors.label"),
          value: t("authForm.login.highlight.advisors.value"),
        },
      ]}
      formTitle={t("authForm.login.formTitle")}
      formDescription={t("authForm.login.formDescription")}
      formChildren={<LoginForm />}
      formFooter={
        <>
          {t("authForm.login.footerQuestion")}{" "}
          <Link
            href="/register"
            className="font-medium text-[color:var(--aurora-primary-soft)] underline-offset-4 hover:underline"
          >
            {t("authForm.login.footerCta")}
          </Link>
        </>
      }
    />
  );
}
