import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_COINS } from "@/lib/data";
import { useT } from "@/lib/i18n-context";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

const DIMENSIONS = ["24h Chg", "Volume", "Social", "Search"];

export default function HeatmapPage() {
  const navigate = useNavigate();
  const { t } = useT();
  const { theme } = useTheme();

  const c = theme === "dark"
    ? {
        tooltipBg: "#161B26", tooltipBorder: "#2A3345", tooltipText: "#E8ECEF",
        axisLine: "#2A3345", axisLabel: "#A0AAB8", axisLabelDim: "#6B7689",
        splitLine: "#232B3A", gaugeTrack: "#232B3A", heatLabel: "#E8ECEF", heatBorder: "#0E1116",
      }
    : {
        tooltipBg: "#FFFFFF", tooltipBorder: "#E5E7EB", tooltipText: "#1F2937",
        axisLine: "#E5E7EB", axisLabel: "#374151", axisLabelDim: "#6B7280",
        splitLine: "#F0F1F5", gaugeTrack: "#E5E7EB", heatLabel: "#1F2937", heatBorder: "#FFFFFF",
      };

  const totalMcap = useMemo(() => MOCK_COINS.reduce((s, c) => s + c.marketCap, 0), []);
  const totalVol = useMemo(() => MOCK_COINS.reduce((s, c) => s + c.volume24h, 0), []);
  const btc = MOCK_COINS[0];
  const btcDom = (btc.marketCap / totalMcap) * 100;
  const advancers = MOCK_COINS.filter((c) => c.change24h >= 0).length;
  const decliners = MOCK_COINS.length - advancers;

  const topCoins = useMemo(
    () => [...MOCK_COINS].sort((a, b) => b.heatScore - a.heatScore).slice(0, 15),
    [],
  );
  const maxVolume = useMemo(() => Math.max(...MOCK_COINS.map((c) => c.volume24h)), []);

  const heatData: [number, number, number][] = [];
  topCoins.forEach((coin, yi) => {
    const chg = Math.max(0, Math.min(100, Math.round(50 + coin.change24h * 5)));
    const vol = Math.round((coin.volume24h / maxVolume) * 100);
    heatData.push([0, yi, chg]);
    heatData.push([1, yi, vol]);
    heatData.push([2, yi, coin.socialScore]);
    heatData.push([3, yi, coin.searchScore]);
  });

  const heatOption = {
    grid: { top: 30, right: 16, bottom: 30, left: 70 },
    tooltip: {
      trigger: "item",
      backgroundColor: c.tooltipBg,
      borderColor: c.axisLine,
      textStyle: { color: c.tooltipText, fontSize: 12 },
      formatter: (p: { value: [number, number, number] }) => {
        const coin = topCoins[p.value[1]];
        const dim = DIMENSIONS[p.value[0]];
        return `<b>${coin.symbol}</b> · ${dim}<br/>Heat: <b>${p.value[2]}</b>`;
      },
    },
    xAxis: {
      type: "category",
      data: [...DIMENSIONS],
      position: "top",
      axisLine: { lineStyle: { color: c.axisLine } },
      axisLabel: { color: c.axisLabel, fontSize: 11, fontWeight: 600 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "category",
      data: topCoins.map((c) => c.symbol),
      inverse: true,
      axisLine: { lineStyle: { color: c.axisLine } },
      axisLabel: { color: c.axisLabel, fontSize: 11, fontWeight: 600 },
      axisTick: { show: false },
    },
    visualMap: {
      min: 0, max: 100, show: false,
      inRange: { color: ["#1A2233", "#3A3520", "#8A6A1E", "#C8901E", "#FFB020"] },
    },
    series: [{
      name: "Heat", type: "heatmap", data: heatData,
      label: { show: true, color: c.tooltipText, fontSize: 10 },
      itemStyle: { borderColor: c.heatBorder, borderWidth: 2 },
      emphasis: { itemStyle: { borderColor: "#FFB020", borderWidth: 2 } },
    }],
  };

  const onHeatClick = (params: { value: [number, number, number] }) => {
    const coin = topCoins[params.value[1]];
    if (coin) navigate(`/coins/${coin.id}`);
  };

  const mcapTrend = useMemo(() => {
    const arr: number[] = [];
    let v = totalMcap * 0.94;
    for (let i = 0; i < 30; i++) {
      v = v * (1 + Math.sin(i / 4) * 0.008 + (((i * 37) % 13) - 6) * 0.0015);
      arr.push(Math.round(v / 1e9));
    }
    return arr;
  }, [totalMcap]);

  const mcapOption = {
    grid: { top: 16, right: 12, bottom: 24, left: 40 },
    tooltip: {
      trigger: "axis",
      backgroundColor: c.tooltipBg, borderColor: c.axisLine,
      textStyle: { color: c.tooltipText, fontSize: 12 },
      valueFormatter: (v: number) => `$${v}B`,
    },
    xAxis: {
      type: "category",
      data: mcapTrend.map((_, i) => `D-${29 - i}`),
      axisLabel: { color: c.axisLabelDim, fontSize: 9, interval: 4 },
      axisLine: { lineStyle: { color: c.axisLine } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: c.axisLabelDim, fontSize: 10, formatter: "${value}B" },
      splitLine: { lineStyle: { color: c.splitLine } },
    },
    series: [{
      type: "line", data: mcapTrend, showSymbol: false, smooth: true,
      lineStyle: { color: "#FFB020", width: 2 },
      areaStyle: {
        color: {
          type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(255,176,32,0.35)" },
            { offset: 1, color: "rgba(255,176,32,0)" },
          ],
        },
      },
    }],
  };

  const fgOption = {
    series: [{
      type: "gauge", startAngle: 210, endAngle: -30, min: 0, max: 100,
      radius: "95%",
      progress: { show: true, width: 10, itemStyle: { color: "#FFB020" } },
      axisLine: { lineStyle: { width: 10, color: [[1, c.splitLine]] } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      pointer: { show: false }, anchor: { show: false },
      detail: { valueAnimation: true, offsetCenter: [0, 0], fontSize: 22, fontWeight: "bold", color: c.tooltipText, formatter: "{value}" },
      data: [{ value: 72 }],
    }],
  };

  const sectorOption = {
    tooltip: { trigger: "item", backgroundColor: c.tooltipBg, borderColor: c.axisLine, textStyle: { color: c.tooltipText, fontSize: 12 } },
    legend: { bottom: 0, textStyle: { color: c.axisLabel, fontSize: 10 }, itemWidth: 8, itemHeight: 8 },
    series: [{
      type: "pie", radius: ["45%", "70%"], center: ["50%", "42%"], avoidLabelOverlap: true,
      label: { show: false },
      data: [
        { value: 1328, name: "Layer1", itemStyle: { color: "#16D98C" } },
        { value: 423, name: "L2", itemStyle: { color: "#FFB020" } },
        { value: 180, name: "DeFi", itemStyle: { color: "#4D9FFF" } },
        { value: 95, name: "Meme", itemStyle: { color: "#FF4D6D" } },
        { value: 70, name: "Storage", itemStyle: { color: "#B07CFF" } },
      ],
    }],
  };

  return (
    <div className="px-5 py-5">
      <div className="mb-1">
        <h1 className="text-xl font-bold tracking-tight">{t("home.title")}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{t("home.subtitle", { n: MOCK_COINS.length })}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground">{t("home.totalMcap")}</div>
          <div className="mt-0.5 text-base font-bold">${(totalMcap / 1e12).toFixed(2)}T</div>
          <div className="mt-0.5 flex items-center gap-0.5 text-[10px] text-primary">
            <TrendingUp className="h-3 w-3" /> +1.8% 24h
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground">{t("home.vol24h")}</div>
          <div className="mt-0.5 text-base font-bold">${(totalVol / 1e9).toFixed(1)}B</div>
          <div className="mt-0.5 flex items-center gap-0.5 text-[10px] text-destructive">
            <TrendingDown className="h-3 w-3" /> -4.2%
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground">{t("home.btcDom")}</div>
          <div className="mt-0.5 text-base font-bold">{btcDom.toFixed(1)}%</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">{t("home.ofMcap")}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] text-muted-foreground">{t("home.advDec")}</div>
          <div className="mt-0.5 flex items-baseline gap-1.5 text-base font-bold">
            <span className="text-primary">{advancers}</span>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="text-destructive">{decliners}</span>
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {MOCK_COINS.length} {t("home.assetsTracked")}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        <div className="col-span-3 rounded-xl border border-border bg-card p-3">
          <div className="mb-1 text-[10px] font-semibold text-muted-foreground">{t("home.mcapTrend")}</div>
          <ReactECharts option={mcapOption} style={{ height: 140, width: "100%" }} />
        </div>
        <div className="col-span-2 rounded-xl border border-border bg-card p-3">
          <div className="mb-1 text-[10px] font-semibold text-muted-foreground">{t("home.fearGreed")}</div>
          <ReactECharts option={fgOption} style={{ height: 110, width: "100%" }} />
          <div className="text-center text-[10px] text-accent">{t("home.greed")}</div>
        </div>
      </div>

      <div className="mt-2 rounded-xl border border-border bg-card p-3">
        <div className="mb-1 text-[10px] font-semibold text-muted-foreground">{t("home.sector")}</div>
        <ReactECharts option={sectorOption} style={{ height: 170, width: "100%" }} />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-3">
        <div className="mb-2 flex items-baseline justify-between">
          <div className="text-[10px] font-semibold text-muted-foreground">{t("home.heatmap")}</div>
          <div className="text-[10px] text-muted-foreground">{t("home.tapCell")}</div>
        </div>
        <ReactECharts option={heatOption} style={{ height: 380, width: "100%" }} onEvents={{ click: onHeatClick }} />
      </div>

      <div className="mt-5">
        <h2 className="mb-2 text-sm font-semibold">{t("home.topMovers")}</h2>
        <div className="grid grid-cols-2 gap-2">
          {[...MOCK_COINS].sort((a, b) => b.change24h - a.change24h).slice(0, 4).map((coin) => (
            <div
              key={coin.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/coins/${coin.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/coins/${coin.id}`); }}
              className="rounded-lg border border-border bg-card p-2.5 text-left"
            >
              <div className="text-xs font-semibold">{coin.symbol}</div>
              <div className={cn("mt-0.5 text-sm font-bold text-primary")}>
                +{coin.change24h.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
