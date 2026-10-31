import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, Star, LogOut, Globe, Sun, Moon, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n-context";
import { LANGS, type Lang } from "@/lib/i18n-dict";
import { useTheme } from "@/lib/use-theme";
import { MOCK_COINS } from "@/lib/data";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, favorites, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang } = useT();
  const { theme, setTheme } = useTheme();

  if (!user) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <User className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-lg font-semibold">{t("profile.guestTitle")}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{t("profile.guestSub")}</p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {t("profile.signIn")}
        </button>
        <LanguageSwitcher lang={lang} setLang={setLang} />
        <ThemeSwitcher theme={theme} setTheme={setTheme} t={t} />
      </div>
    );
  }

  const favCoins = MOCK_COINS.filter((c) => favorites.includes(c.id));

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-lg font-bold">{user.name}</h1>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" /> {user.email}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-accent" /> {t("profile.watchlist")}
          </div>
          <div className="mt-1 text-2xl font-bold">{favorites.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5 text-primary" /> {t("profile.assetsTracked")}
          </div>
          <div className="mt-1 text-2xl font-bold">{MOCK_COINS.length}</div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" /> {t("profile.memberSince")}
        </div>
        <div className="mt-1 text-sm">{format(new Date(user.createdAt), "yyyy-MM-dd")}</div>
      </div>

      <LanguageSwitcher lang={lang} setLang={setLang} />
      <ThemeSwitcher theme={theme} setTheme={setTheme} t={t} />

      {favCoins.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-2 text-sm font-semibold">{t("profile.myWatchlist")}</h2>
          <div className="space-y-1.5">
            {favCoins.map((c) => (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/coins/${c.id}`)}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/coins/${c.id}`); }}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm"
              >
                <span className="font-semibold">{c.symbol}</span>
                <span className="text-xs text-muted-foreground">${c.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => { logout(); navigate("/"); }}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 py-3 text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4" /> {t("profile.signOut")}
      </button>

      <DeleteAccountButton
        onConfirm={() => { deleteAccount(); navigate("/"); }}
        t={t}
      />
    </div>
  );
}

function DeleteAccountButton({
  onConfirm,
  t,
}: {
  onConfirm: () => void;
  t: (
    k:
      | "profile.deleteAccount"
      | "profile.deleteAccountHint"
      | "profile.deleteConfirmTitle"
      | "profile.deleteConfirmDesc"
      | "profile.cancel"
      | "profile.confirmDelete",
  ) => string;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="mt-3">
      {confirming ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <Trash2 className="h-4 w-4" /> {t("profile.deleteConfirmTitle")}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{t("profile.deleteConfirmDesc")}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-lg border border-border bg-card py-2.5 text-sm font-medium text-muted-foreground"
            >
              {t("profile.cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground"
            >
              {t("profile.confirmDelete")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 py-3 text-sm font-medium text-destructive"
        >
          <Trash2 className="h-4 w-4" /> {t("profile.deleteAccount")}
        </button>
      )}
    </div>
  );
}

function LanguageSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="mt-5 rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Globe className="h-3.5 w-3.5" /> Language / 語言
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-md bg-secondary p-1">
        {LANGS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setLang(l.value)}
            className={cn(
              "rounded px-2 py-1.5 text-xs font-medium transition-colors",
              lang === l.value ? "bg-primary/15 text-primary" : "text-muted-foreground",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThemeSwitcher({
  theme,
  setTheme,
  t,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  t: (k: "profile.theme" | "profile.light" | "profile.dark") => string;
}) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        {t("profile.theme")}
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-md bg-secondary p-1">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors",
            theme === "light" ? "bg-primary/15 text-primary" : "text-muted-foreground",
          )}
        >
          <Sun className="h-3.5 w-3.5" /> {t("profile.light")}
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors",
            theme === "dark" ? "bg-primary/15 text-primary" : "text-muted-foreground",
          )}
        >
          <Moon className="h-3.5 w-3.5" /> {t("profile.dark")}
        </button>
      </div>
    </div>
  );
}
