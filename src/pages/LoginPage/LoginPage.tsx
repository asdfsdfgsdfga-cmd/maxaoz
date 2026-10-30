import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n-context";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useT();
  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 400));
    const res = login(values.email, values.password);
    if (!res.ok) {
      toast.error(res.error || "Login failed");
      return;
    }
    toast.success("Welcome back");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-10">
      <div className="flex flex-col items-center">
        <img
          src={`${(import.meta.env.MIAODA_CLIENT_BASE_PATH || "").replace(/\/$/, "")}/logo.png`}
          alt="maxAOZ"
          className="h-14 w-14 rounded-2xl"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{t("login.welcome")}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{t("login.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-3">
        <div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              placeholder={t("login.email")}
              autoComplete="email"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder={t("login.password")}
              autoComplete="current-password"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              {...register("password")}
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />
          {isSubmitting ? t("login.signingIn") : t("login.signIn")}
        </button>
      </form>

      <p className="mt-auto pt-8 text-center text-xs text-muted-foreground">
        {t("login.noAccount")}{" "}
        <Link to="/register" className="font-semibold text-primary">{t("login.signUp")}</Link>
      </p>
    </div>
  );
}
