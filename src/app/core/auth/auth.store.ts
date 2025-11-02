// src/app/core/auth/auth.store.ts
import { Injectable, computed, signal, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { LoginRequest, AuthUser, LoginResult } from './auth.types';
import { firstValueFrom } from 'rxjs';
import { mapServerLoginResponse } from './auth.mapper';

export type Session = {
  token: string | null;
  user: any | null;
  orgs?: number[]; // si tu veux
};

type AuthState = {
  loading: boolean;
  error: string | null;
  user: AuthUser | null;
  accessToken: string | null;
  remember: boolean;
  lastServerMessage?: string | null;
};

function readFromStorage(): AuthState | null {
  try {
    const rawLS = localStorage.getItem(STORAGE_KEY);
    if (rawLS) return JSON.parse(rawLS);
    const rawSS = sessionStorage.getItem(STORAGE_KEY);
    if (rawSS) return JSON.parse(rawSS);
  } catch {}
  return null;
}

function writeToStorage(s: AuthState) {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  try {
    const raw = JSON.stringify(s);
    if (s.remember) {
      localStorage.setItem(STORAGE_KEY, raw);
    } else {
      sessionStorage.setItem(STORAGE_KEY, raw);
    }
  } catch {}
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

const STORAGE_KEY = 'app.auth';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private state = signal<AuthState>({
    loading: false,
    error: null,
    user: null,
    accessToken: null,
    remember: false,
    lastServerMessage: null,
  });

  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly user = computed(() => this.state().user);
  readonly accessToken = computed(() => this.state().accessToken);
  readonly lastServerMessage = computed(() => this.state().lastServerMessage);

  constructor(private api: AuthService) {
    const parsed = readFromStorage();
    if (parsed) {
      this.state.set({ ...this.state(), ...parsed, loading: false, error: null });
    }

    effect(() => {
      const s = this.state();
      if (s.accessToken && s.user) {
        const raw = JSON.stringify(s);
        try {
          if (s.remember) {
            localStorage.setItem('app.auth', raw);
          } else {
            sessionStorage.setItem('app.auth', raw);
          }
        } catch {}
      }
    });
  }

  setRemember(value: boolean) {
    this.state.update(s => ({ ...s, remember: value }));
  }

  async login(payload: LoginRequest, remember: boolean): Promise<LoginResult> {
    this.state.update(s => ({ ...s, loading: true, error: null, lastServerMessage: null, remember }));
    try {
      const raw = await firstValueFrom(this.api.login(payload));
      const mapped = mapServerLoginResponse(raw);

      this.state.update(s => ({
        ...s,
        loading: false,
        error: null,
        user: mapped.user,
        accessToken: mapped.accessToken,
        lastServerMessage: mapped.serverMessage ?? null,
      }));

      return mapped;
    } catch (e: any) {
      const msg = e?.message ?? 'Login failed';
      this.state.update(s => ({ ...s, loading: false, error: msg }));
      throw e;
    }
  }

  logout() {
    this.state.set({
      loading: false,
      error: null,
      user: null,
      accessToken: null,
      remember: false,
      lastServerMessage: null,
    });
    localStorage.removeItem('app.auth');
    sessionStorage.removeItem('app.auth');
  }

  hasRole(role: string): boolean {
    const user = this.user();
    if (!user) return false;
    const wanted = role.toUpperCase();
    return (user.roles ?? []).some(r => r.toUpperCase() === wanted);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.user();
    if (!user) return false;
    const set = new Set((user.roles ?? []).map(r => r.toUpperCase()));
    return roles.some(r => set.has(r.toUpperCase()));
  }

  isAuthenticated(): boolean {
    return !!this.accessToken();
  }

  persistNow() {
    const s = this.state();
    if (s.accessToken && s.user) {
      const raw = JSON.stringify(s);
      if (s.remember) {
        localStorage.setItem('app.auth', raw);
        console.info('[AuthStore] wrote to localStorage', { len: raw.length });
      } else {
        sessionStorage.setItem('app.auth', raw);
        console.info('[AuthStore] wrote to sessionStorage', { len: raw.length });
      }
    } else {
      console.warn('[AuthStore] nothing to persist (no token/user)');
    }
  }

  public session(): Session {
    return {
      token: this.accessToken?.() ?? null,
      user: this.user?.() ?? null,
    };
  }

}
