import { useNavigate, useParams } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import {
  ArrowLeft, Star, TrendingUp, TrendingDown, Bell, CheckCircle2, XCircle,
} from "lucide-react";
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

export default function CoinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, favorites, toggleFavorite } = useAuth();
  const { t } = useT();

  const coin = MOCK_COINS.find((c) => c.id === id);
  if (!coin) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">{t("detail.notFound")}</p>
        <button type="button" onClick={() => navigate("/coins")} className="mt-4 text-sm text-primary">
          {t("detail.backToList")}
        </button>
      </div>
    );
  }

  const idx = MOCK_COINS.findIndex((c) => c.id === coin.id);
  const fav = favorites.includes(coin.id);
  const up = coin.change24h >= 0;
  const predUp = coin.prediction.direction === "up";

  const sparkOption = {
    grid: { top: 8, right: 8, bottom: 8, left: 8 },
    xAxis: { type: "category", show: false, data: coin.priceHistory.map((_, i) => i) },
    yAxis: { type: "value", show: false, scale: true },
    tooltip: { show: false },
    series: [{
      type: "line", data: coin.priceHistory, showSymbol: false, smooth: true,
      lineStyle: { color: up ? "#16D98C" : "#FF4D6D", width: 2 },
      areaStyle: {
        color: {
          type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: up ? "rgba(22,217,140,0.3)" : "rgba(255,77,109,0.3)" },
            { offset: 1, color: "rgba(0,0,0,0)" },
          ],
        },
      },
    }],
  };

  const handleStar = () => {
    if (!user) {
      toast.info(t("toast.signinRequired"));
      navigate("/login");
      return;
    }
    toggleFavorite(coin.id);
  };

  return (
    <div className="px-5 py-4 pb-24">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
        </button>
        <button type="button" onClick={handleStar} className="p-1">
          <Star className={cn("h-5 w-5", fav ? "fill-accent text-accent" : "text-muted-foreground")} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <CoinIcon symbol={coin.symbol} index={idx} className="h-11 w-11 text-base" />
        <div>
          <div className="text-lg font-bold">{coin.name}</div>
          <div className="text-xs text-muted-foreground">
            {coin.symbol} · {t("detail.mcap")} ${(coin.marketCap / 1e9).toFixed(1)}B
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight">${formatPrice(coin.price)}</span>
        <span className={cn("flex items-center gap-0.5 text-sm font-semibold", up ? "text-primary" : "text-destructive")}>
          {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {up ? "+" : ""}{coin.change24h.toFixed(2)}%
        </span>
      </div>

      <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
        <ReactECharts option={sparkOption} style={{ height: 140, width: "100%" }} />
      </div>

      <div className="mt-5 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <Bell className="h-4 w-4 text-accent" />
            {t("detail.forecast", { horizon: coin.prediction.horizon })}
          </h2>
          <span className={cn(
            "rounded-md px-2 py-0.5 text-xs font-bold",
            predUp ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
          )}>
            {predUp ? t("detail.bullish") : t("detail.bearish")} {coin.prediction.confidence}%
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className={cn("h-full rounded-full", predUp ? "bg-primary" : "bg-destructive")} style={{ width: `${coin.prediction.confidence}%` }} />
        </div>
        <div className="mt-4 space-y-2">
          {coin.prediction.signals.map((s) => (
            <div key={s.name} className="flex items-start gap-2 text-xs">
              {s.bullish
                ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />}
              <div>
                <span className="font-semibold">{s.name}</span>
                <span className="text-muted-foreground"> · {s.detail}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">{t("detail.forecastNote")}</p>
      </div>

      <div className="mt-5">
        <h2 className="mb-2 text-sm font-semibold">{t("detail.community")}</h2>
        <div className="space-y-2">
          {coin.community.map((post) => (
            <div key={post.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-semibold text-foreground/80">{post.author}</span>
                <span>{post.source} · {post.time}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed">{post.content}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className={cn(
                  "rounded px-1.5 py-0.5 font-semibold",
                  post.sentiment === "bullish" ? "bg-primary/15 text-primary"
                    : post.sentiment === "bearish" ? "bg-destructive/15 text-destructive"
                    : "bg-secondary text-muted-foreground",
                )}>
                  {post.sentiment === "bullish" ? t("detail.sentBull")
                    : post.sentiment === "bearish" ? t("detail.sentBear")
                    : t("detail.sentNeutral")}
                </span>
                <span>{post.likes} {t("detail.likes")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
