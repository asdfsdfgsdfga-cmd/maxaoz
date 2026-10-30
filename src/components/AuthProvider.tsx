import { useCallback, useMemo, useState } from "react";
import { AuthContext, type StoredAccount } from "@/lib/auth-context";
import { store } from "@/lib/storage";
import type { IUser } from "@/lib/types";

const USERS_KEY = "auth:users";
const CURRENT_KEY = "auth:current";

function seedUsers(): StoredAccount[] {
  const existing = store.get<StoredAccount[] | null>(USERS_KEY, null);
  if (existing) return existing;
  const seeded: StoredAccount[] = [
    {
      email: "test123@gmail.com",
      name: "Test User",
      password: "123456",
      createdAt: new Date().toISOString(),
    },
  ];
  store.set(USERS_KEY, seeded);
  return seeded;
}

function favoritesKey(email: string) {
  return `favs:${email}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<StoredAccount[]>(() => seedUsers());
  const [currentEmail, setCurrentEmail] = useState<string | null>(() =>
    store.get<string | null>(CURRENT_KEY, null),
  );

  const currentUser: IUser | null = useMemo(() => {
    if (!currentEmail) return null;
    const acc = accounts.find((a) => a.email === currentEmail);
    if (!acc) return null;
    return { email: acc.email, name: acc.name, createdAt: acc.createdAt };
  }, [currentEmail, accounts]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const email = store.get<string | null>(CURRENT_KEY, null);
    return email ? store.get<string[]>(favoritesKey(email), []) : [];
  });

  const login = useCallback(
    (email: string, password: string) => {
      const acc = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!acc) return { ok: false, error: "账号不存在，请先注册" };
      if (acc.password !== password) return { ok: false, error: "密码错误" };
      store.set(CURRENT_KEY, acc.email);
      setCurrentEmail(acc.email);
      setFavorites(store.get<string[]>(favoritesKey(acc.email), []));
      return { ok: true };
    },
    [accounts],
  );

  const register = useCallback(
    (name: string, email: string, password: string) => {
      const normalized = email.trim().toLowerCase();
      if (accounts.some((a) => a.email.toLowerCase() === normalized)) {
        return { ok: false, error: "该邮箱已注册" };
      }
      const acc: StoredAccount = {
        email: normalized,
        name: name.trim() || normalized.split("@")[0],
        password,
        createdAt: new Date().toISOString(),
      };
      const next = [...accounts, acc];
      store.set(USERS_KEY, next);
      store.set(CURRENT_KEY, acc.email);
      setAccounts(next);
      setCurrentEmail(acc.email);
      setFavorites([]);
      return { ok: true };
    },
    [accounts],
  );

  const logout = useCallback(() => {
    store.remove(CURRENT_KEY);
    setCurrentEmail(null);
    setFavorites([]);
  }, []);

  const toggleFavorite = useCallback(
    (coinId: string) => {
      if (!currentEmail) return;
      setFavorites((prev) => {
        const next = prev.includes(coinId)
          ? prev.filter((id) => id !== coinId)
          : [...prev, coinId];
        store.set(favoritesKey(currentEmail), next);
        return next;
      });
    },
    [currentEmail],
  );

  const isFavorite = useCallback(
    (coinId: string) => favorites.includes(coinId),
    [favorites],
  );

  const value = useMemo(
    () => ({
      user: currentUser,
      login,
      register,
      logout,
      favorites,
      toggleFavorite,
      isFavorite,
    }),
    [currentUser, login, register, logout, favorites, toggleFavorite, isFavorite],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
