import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Search, TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_COINS } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n-context";
import CoinIcon from "@/components/CoinIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return p.toFixed(2);
  if (p >= 0.01) return p.toFixed(4);
  return p.toFixed(6);
}

export default function CoinsPage() {
  const navigate = useNavigate();
  const { user, favorites, toggleFavorite } = useAuth();
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "favs">("all");

  const list = useMemo(() => {
    let out = MOCK_COINS;
    if (tab === "favs") out = out.filter((c) => favorites.includes(c.id));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(
        (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
      );
    }
    return out;
  }, [query, tab, favorites]);

  const handleStar = (e: React.MouseEvent, coinId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.info(t("toast.signinRequired"));
      navigate("/login");
      return;
    }
    toggleFavorite(coinId);
  };

  return (
    <div className="px-5 py-5">
      <h1 className="text-xl font-bold tracking-tight">{t("coins.title")}</h1>
      <p className="mt-1 text-xs text-muted-foreground">{t("coins.subtitle", { n: MOCK_COINS.length })}</p>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("coins.search")}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1">
        {(["all", "favs"] as const).map((tv) => (
          <button
            key={tv}
            type="button"
            onClick={() => setTab(tv)}
            className={cn(
              "rounded-md py-1.5 text-xs font-medium transition-colors",
              tab === tv ? "bg-primary/15 text-primary" : "text-muted-foreground",
            )}
          >
            {tv === "all" ? t("coins.all") : t("coins.watchlist", { n: favorites.length })}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {list.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            {tab === "favs" ? t("coins.emptyWatch") : t("coins.emptySearch")}
          </div>
        )}
        {list.map((coin) => {
          const idx = MOCK_COINS.findIndex((c) => c.id === coin.id);
          const fav = favorites.includes(coin.id);
          const up = coin.change24h >= 0;
          return (
            <div
              key={coin.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/coins/${coin.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/coins/${coin.id}`); }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
            >
              <CoinIcon symbol={coin.symbol} index={idx} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold">{coin.symbol}</span>
                  <span className="truncate text-xs text-muted-foreground">{coin.name}</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">${formatPrice(coin.price)}</div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "flex items-center justify-end gap-0.5 text-sm font-semibold",
                    up ? "text-primary" : "text-destructive",
                  )}
                >
                  {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {up ? "+" : ""}{coin.change24h.toFixed(2)}%
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">24h</div>
              </div>
              <button type="button" onClick={(e) => handleStar(e, coin.id)} className="p-1" aria-label="favorite">
                <Star className={cn("h-5 w-5", fav ? "fill-accent text-accent" : "text-muted-foreground")} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
