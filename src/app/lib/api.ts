import { API } from './config';
import { useAuthStore } from '../stores/authStore';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: { message: text || 'Invalid response' } };
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(API(path), { ...init, headers });
  const json = (await parse(res)) as {
    ok: boolean;
    data?: T;
    error?: { message?: string; code?: string };
  };

  if (res.status === 401 && retry) {
    const refreshed = await useAuthStore.getState().refreshAccessToken();
    if (refreshed) return apiFetch<T>(path, init, false);
    useAuthStore.getState().logout();
  }

  if (!res.ok || !json.ok) {
    throw new ApiError(
      json.error?.message ?? `Request failed (${res.status})`,
      res.status,
      json.error?.code
    );
  }
  return json.data as T;
}
