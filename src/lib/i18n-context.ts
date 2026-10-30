// EXPORTS: I18nCtx, useT
import { createContext, useContext } from "react";
import type { DictKey, Lang } from "./i18n-dict";

export interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
}

export const Ctx = createContext<I18nCtx | null>(null);

export function useT(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx;
}
