import Link from "next/link";

import { AuthSplit } from "@/features/auth/auth-split";
import { RegisterForm } from "@/features/auth/register-form";
import { getMessages } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getMessages();
  return {
    title: t("authForm.register.metaTitle"),
  };
}

export default async function RegisterPage() {
  const { t } = await getMessages();
  return (
    <AuthSplit
      pill={t("authForm.register.pill")}
      title={
        <>
          {t("authForm.register.titleLine1")} <br />
          <span className="aurora-gradient-text">
            {t("authForm.register.titleHighlight")}
          </span>{" "}
          {t("authForm.register.titleTail")}
        </>
      }
      description={t("authForm.register.description")}
      highlights={[
        {
          label: t("authForm.register.highlight.structure.label"),
          value: t("authForm.register.highlight.structure.value"),
        },
        {
          label: t("authForm.register.highlight.plagiarism.label"),
          value: t("authForm.register.highlight.plagiarism.value"),
        },
        {
          label: t("authForm.register.highlight.roles.label"),
          value: t("authForm.register.highlight.roles.value"),
        },
      ]}
      formTitle={t("authForm.register.formTitle")}
      formDescription={t("authForm.register.formDescription")}
      formChildren={<RegisterForm />}
      formFooter={
        <>
          {t("authForm.register.footerQuestion")}{" "}
          <Link
            href="/login"
            className="font-medium text-[color:var(--aurora-primary-soft)] underline-offset-4 hover:underline"
          >
            {t("authForm.register.footerCta")}
          </Link>
        </>
      }
    />
  );
}
