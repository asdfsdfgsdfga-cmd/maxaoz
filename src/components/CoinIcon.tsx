import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-amber-500/20 text-amber-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-sky-500/20 text-sky-400",
  "bg-rose-500/20 text-rose-400",
  "bg-violet-500/20 text-violet-400",
  "bg-cyan-500/20 text-cyan-400",
];

interface CoinIconProps {
  symbol: string;
  index: number;
  className?: string;
}

export default function CoinIcon({ symbol, index, className }: CoinIconProps) {
  const colorClass = PALETTE[index % PALETTE.length];
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold",
        colorClass,
        className,
      )}
    >
      {symbol.slice(0, 1)}
    </div>
  );
}
