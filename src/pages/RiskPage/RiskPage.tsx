import { useState } from "react";
import { ShieldCheck, ChevronRight, ChevronLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import { useT } from "@/lib/i18n-context";
import { store } from "@/lib/storage";
import { cn } from "@/lib/utils";

type RiskType = "conservative" | "balanced" | "aggressive";

interface StoredResult {
  score: number;
  type: RiskType;
  at: string;
}

const RESULT_KEY = "risk:result";

interface Question {
  qKey: "q1" | "q2" | "q3" | "q4" | "q5";
  options: [string, string, string]; // keys q1.a1..a5.a3
}

const QUESTIONS: Question[] = [
  { qKey: "q1", options: ["q1.a1", "q1.a2", "q1.a3"] },
  { qKey: "q2", options: ["q2.a1", "q2.a2", "q2.a3"] },
  { qKey: "q3", options: ["q3.a1", "q3.a2", "q3.a3"] },
  { qKey: "q4", options: ["q4.a1", "q4.a2", "q4.a3"] },
  { qKey: "q5", options: ["q5.a1", "q5.a2", "q5.a3"] },
];

const MAX_SCORE = QUESTIONS.length * 3;

function scoreToType(score: number): RiskType {
  if (score <= 8) return "conservative";
  if (score <= 12) return "balanced";
  return "aggressive";
}

const ALLOC: Record<RiskType, { btc: number; eth: number; large: number; mid: number; color: string }> = {
  conservative: { btc: 60, eth: 25, large: 15, mid: 0, color: "#16D98C" },
  balanced: { btc: 45, eth: 25, large: 20, mid: 10, color: "#FFB020" },
  aggressive: { btc: 25, eth: 15, large: 30, mid: 30, color: "#FF4D6D" },
};

export default function RiskPage() {
  const { t } = useT();
  const [stored, setStored] = useState<StoredResult | null>(() =>
    store.get<StoredResult | null>(RESULT_KEY, null),
  );
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  if (stored) {
    return <ResultView result={stored} onRetake={() => { setStored(null); setStep(0); setAnswers([]); }} />;
  }

  const q = QUESTIONS[step];
  const progress = ((step) / QUESTIONS.length) * 100;

  const choose = (optIndex: number) => {
    const next = [...answers, optIndex + 1]; // score 1..3
    if (step === QUESTIONS.length - 1) {
      const score = next.reduce((s, v) => s + v, 0);
      const result: StoredResult = { score, type: scoreToType(score), at: new Date().toISOString() };
      store.set(RESULT_KEY, result);
      setStored(result);
    } else {
      setAnswers(next);
      setStep(step + 1);
    }
  };

  return (
    <div className="px-5 py-5">
      <div className="mb-1">
        <h1 className="text-xl font-bold tracking-tight">{t("risk.title")}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{t("risk.subtitle")}</p>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{t("risk.step", { n: step + 1, total: QUESTIONS.length })}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold leading-snug">{t(`risk.${q.qKey}` as never)}</h2>
        <div className="mt-4 space-y-2">
          {q.options.map((optKey, i) => (
            <button
              key={optKey}
              type="button"
              onClick={() => choose(i)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3.5 text-left text-sm transition-colors hover:border-primary/50"
            >
              <span>{t(`risk.${optKey}` as never)}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {step > 0 && (
        <button
          type="button"
          onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }}
          className="mt-6 flex items-center gap-1 text-xs text-muted-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> {t("risk.prev")}
        </button>
      )}
    </div>
  );
}

function ResultView({ result, onRetake }: { result: StoredResult; onRetake: () => void }) {
  const { t } = useT();
  const typeLabel =
    result.type === "conservative" ? t("risk.result.conservative")
      : result.type === "balanced" ? t("risk.result.balanced")
      : t("risk.result.aggressive");
  const adviceTitle = t(`risk.advice.${result.type}.title` as never);
  const adviceBody = t(`risk.advice.${result.type}.body` as never);
  const alloc = ALLOC[result.type];

  const segments = [
    { label: t("risk.alloc.btc"), pct: alloc.btc, color: "#F7931A" },
    { label: t("risk.alloc.eth"), pct: alloc.eth, color: "#627EEA" },
    { label: t("risk.alloc.large"), pct: alloc.large, color: "#16D98C" },
    { label: t("risk.alloc.mid"), pct: alloc.mid, color: "#FF4D6D" },
  ].filter((s) => s.pct > 0);

  return (
    <div className="px-5 py-5">
      <h1 className="text-xl font-bold tracking-tight">{t("risk.result.title")}</h1>

      <div className="mt-4 rounded-xl border border-border bg-card p-5 text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${alloc.color}22`, color: alloc.color }}
        >
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="mt-3 text-2xl font-bold" style={{ color: alloc.color }}>
          {typeLabel}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {t("risk.result.score", { score: result.score, max: MAX_SCORE })}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          {adviceTitle}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{adviceBody}</p>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="mb-2 text-[10px] font-semibold text-muted-foreground">{t("risk.alloc")}</div>
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {segments.map((s) => (
            <div key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="text-muted-foreground">{s.label}</span>
              </div>
              <span className="font-semibold">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onRetake}
        className={cn(
          "mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm font-semibold text-foreground",
        )}
      >
        <RotateCcw className="h-4 w-4" />
        {t("risk.retake")}
      </button>
    </div>
  );
}
