import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { getInstance } from "~/middlewares/i8n";
import type { Route } from "./+types/register";

export async function loader({ context }: Route.LoaderArgs) {
  const { t } = getInstance(context);

  return {
    meta: {
      title: `${t("appName", { ns: "common" })} | Daftar`,
      description:
        "Login ke Baguspay untuk membeli pulsa, voucher game, dan berbagai produk PPOB dengan mudah dan aman.",
    },
  };
}

export default function Register({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("register");

  return (
    <>
      <title>{loaderData?.meta.title}</title>
      <meta property="og:title" content={loaderData.meta.title} />
      <meta name="description" content={loaderData.meta.description} />

      <main className="container mx-auto p-6 md:p-0">
        <div className="max-w-md mx-auto text-center mt-10">
          <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
        <form
          action=""
          className="max-w-md mx-auto bg-white shadow-md rounded-lg space-y-4 mt-5"
        >
          <div>
            <Label htmlFor="name" className="block mb-2">
              {t("nameLabel")}
            </Label>
            <Input name="name" />
          </div>
          <div>
            <Label htmlFor="email" className="block mb-2">
              {t("emailLabel")}
            </Label>
            <Input name="email" />
          </div>
          <div>
            <Label htmlFor="password" className="block mb-2">
              {t("passwordLabel")}
            </Label>
            <Input type="password" name="password" />
          </div>
          <div>
            <Label htmlFor="password" className="block mb-2">
              {t("confirmPasswordLabel")}
            </Label>
            <Input type="password" name="confirm_password" />
          </div>
          <Button type="submit" className="w-full">
            {t("submitButton")}
          </Button>
        </form>
        <div>
          <div className="text-center text-sm text-muted-foreground mt-4">
            {t("alreadyHaveAccount")}{" "}
            <Link
              to="/auth/login"
              className="text-primary-foreground font-medium hover:underline"
            >
              {t("loginLinkText")}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
