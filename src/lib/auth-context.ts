// EXPORTS: AuthContext, useAuth
import { createContext, useContext } from "react";
import type { IUser } from "./types";

export interface StoredAccount {
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface AuthState {
  user: IUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  deleteAccount: () => void;
  favorites: string[];
  toggleFavorite: (coinId: string) => void;
  isFavorite: (coinId: string) => boolean;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
