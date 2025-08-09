import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useFormMutation } from "~/hooks/use-form-mutation";
import { getInstance } from "~/middlewares/i8n";
import { authTokenAtom } from "~/store/token";
import { apiClient } from "~/utils/axios";
import type { Route } from "./+types/login";

const schema = z.object({
  email: z.email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Minimal 8 karakter")
    .regex(/[a-z]/, "Harus ada huruf kecil")
    .regex(/[A-Z]/, "Harus ada huruf besar")
    .regex(/[0-9]/, "Harus ada angka")
    .regex(/[\W_]/, "Harus ada karakter khusus"),
});

type Schema = z.infer<typeof schema>;

export async function loader({ context }: Route.LoaderArgs) {
  const { t } = getInstance(context);

  return {
    meta: {
      title: `${t("appName", { ns: "common" })} | Login`,
      description:
        "Login ke Baguspay untuk membeli pulsa, voucher game, dan berbagai produk PPOB dengan mudah dan aman.",
    },
  };
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation("login");
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [, setAuthToken] = useAtom(authTokenAtom);

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const login = useFormMutation({
    form,
    mutationKey: ["login"],
    mutationFn: async (data: Schema) =>
      apiClient
        .post("/auth/login", data)
        .then((res) => res.data.data)
        .catch((err) => {
          console.error("Login error:", err);
          throw new Error(
            err.response?.data?.message || "Login failed. Please try again.",
          );
        }),
    onError: (error) => {
      console.error("Login error:", error);
    },
    onSuccess: (data) => {
      toast.success(t("loginSuccess"));
      setAuthToken({
        accessToken: data.access_token,
        accessTokenExpiresAt: data.access_token_expired_at,
        refreshToken: data.refresh_token,
        refreshTokenExpiresAt: data.refresh_token_expired_at,
      });
      queryClient.invalidateQueries({
        queryKey: ["userAtom"],
        exact: false,
      });
      form.reset();
      navigate(`/${i18n.language}/user/profile`, {
        replace: true,
      });
    },
  });

  const handleSubmit = (data: Schema) => {
    login.mutate(data);
  };

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
          onSubmit={form.handleSubmit(handleSubmit)}
          method="post"
          className="max-w-md mx-auto bg-white shadow-md rounded-lg space-y-4 mt-5"
        >
          <div>
            <Label htmlFor="email" className="block mb-2">
              {t("emailLabel")}
            </Label>
            <Input type="email" {...form.register("email")} required />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password" className="block mb-2">
              {t("passwordLabel")}
            </Label>
            <Input type="password" {...form.register("password")} required />
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
            <div className="text-end">
              <Link
                to="/auth/forgot-password"
                className="text-xs mt-1 hover:text-primary-foreground"
              >
                {t("forgotPassword")}
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Loading..." : t("submitButton")}
          </Button>
        </form>

        <div>
          <div className="text-center text-sm text-muted-foreground mt-4">
            {t("noAccount")}{" "}
            <Link
              to="/auth/register"
              className="text-primary-foreground font-medium hover:underline"
            >
              {t("registerLinkText")}
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-10">
            {t("orLoginWith")}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-accent border-3"
              asChild
            >
              <Link to="/auth/google">
                <svg
                  className="size-6"
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="100"
                  height="100"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
                {t("loginWithGoogle")}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
