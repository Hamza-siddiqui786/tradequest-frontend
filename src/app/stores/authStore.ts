import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API } from '../lib/config';

async function parseApiResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    return { ok: false } as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return { ok: false } as T;
  }
}

type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username?: string;
};

type MePayload = {
  user: {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
    xp: string;
    level: number;
    created_at: string;
  };
  balance: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  username: string | null;
  me: MePayload | null;
  setSession: (p: SessionPayload) => void;
  setMe: (me: MePayload | null) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  fetchMe: () => Promise<MePayload | null>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      username: null,
      me: null,

      setSession: (p) =>
        set({
          accessToken: p.accessToken,
          refreshToken: p.refreshToken,
          userId: p.userId,
          username: p.username ?? null,
        }),

      setMe: (me) => set({ me }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          username: null,
          me: null,
        }),

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return false;
        try {
          const res = await fetch(API('/auth/refresh'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          const json = await parseApiResponse<{
            ok: boolean;
            data?: { accessToken: string; refreshToken: string };
          }>(res);
          if (!json.ok || !json.data) return false;
          set({
            accessToken: json.data.accessToken,
            refreshToken: json.data.refreshToken,
          });
          return true;
        } catch {
          return false;
        }
      },

      fetchMe: async () => {
        const token = get().accessToken;
        if (!token) return null;
        const res = await fetch(API('/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          const ok = await get().refreshAccessToken();
          if (!ok) return null;
          return get().fetchMe();
        }
        const json = await parseApiResponse<{ ok: boolean; data?: MePayload }>(res);
        if (!json.ok || !json.data) return null;
        set({
          me: json.data,
          username: json.data.user.username,
          userId: json.data.user.id,
        });
        return json.data;
      },
    }),
    {
      name: 'tradequest-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        userId: s.userId,
        username: s.username,
      }),
    }
  )
);
