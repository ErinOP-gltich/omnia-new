import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { sha } from "@/lib/security";

// ponytail: accounts live in this browser's localStorage (salted SHA-256). Fine for a demo/MVP;
// swap for a real backend (Supabase/Firebase auth) before taking real signups.

export type User = { name: string; email: string; plan: string; createdAt: string };
type StoredUser = User & { salt: string; hash: string };

const USERS = "omnia:users";
const SESSION = "omnia:session";

const read = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
};
const users = () => read<Record<string, StoredUser>>(USERS, {});
const strip = ({ salt: _s, hash: _h, ...u }: StoredUser): User => u;

type Auth = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, plan?: string) => Promise<void>;
  signOut: () => void;
  updateUser: (patch: Partial<Pick<User, "name" | "plan">>) => void;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const email = read<string | null>(SESSION, null);
    const u = email ? users()[email] : undefined;
    return u ? strip(u) : null;
  });

  useEffect(() => {
    localStorage.setItem(SESSION, JSON.stringify(user?.email ?? null));
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const u = users()[email.trim().toLowerCase()];
    if (!u || (await sha("SHA-256", u.salt + password)) !== u.hash) throw new Error("Incorrect email or password.");
    setUser(strip(u));
  };

  const signUp = async (name: string, email: string, password: string, plan = "Starter") => {
    const key = email.trim().toLowerCase();
    const all = users();
    if (all[key]) throw new Error("An account with this email already exists. Sign in instead.");
    const salt = crypto.randomUUID();
    const u: StoredUser = { name: name.trim(), email: key, plan, createdAt: new Date().toISOString(), salt, hash: await sha("SHA-256", salt + password) };
    localStorage.setItem(USERS, JSON.stringify({ ...all, [key]: u }));
    setUser(strip(u));
  };

  const updateUser: Auth["updateUser"] = (patch) => {
    if (!user) return;
    const all = users();
    const u = { ...all[user.email], ...patch };
    localStorage.setItem(USERS, JSON.stringify({ ...all, [user.email]: u }));
    setUser(strip(u));
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut: () => setUser(null), updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  return user ? <>{children}</> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

/** useState that persists to localStorage under `key`. */
export function useStoredState<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(() => read<T | null>(key, null) ?? initial());
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}
