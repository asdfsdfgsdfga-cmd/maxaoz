// EXPORTS: I18nProvider
import { useMemo, useState, type ReactNode } from "react";
import { store } from "@/lib/storage";
import { en, zhTW, type DictKey, type Lang } from "@/lib/i18n-dict";
import { Ctx, type I18nCtx } from "@/lib/i18n-context";

const DICTS: Record<Lang, Record<DictKey, string>> = { en, "zh-TW": zhTW };
const LANG_KEY = "i18n:lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = store.get<Lang | null>(LANG_KEY, null);
    return saved === "zh-TW" ? "zh-TW" : "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    store.set(LANG_KEY, l);
  };

  const value = useMemo<I18nCtx>(() => {
    const dict = DICTS[lang];
    const t = (key: DictKey, vars?: Record<string, string | number>) => {
      let s = dict[key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(`{${k}}`, String(v));
        }
      }
      return s;
    };
    return { lang, setLang, t };
  }, [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
