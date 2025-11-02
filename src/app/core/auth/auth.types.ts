// src/app/core/auth/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

/** ==== Réponse SERVEUR telle qu’elle arrive ==== */
export interface ServerOrganization {
  id: number;
  organization: {
    id: number;
    slug: string;
    name: string;
    createdAt: string;
  };
}

export interface ServerUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string; // ISO
  role: 'ADMIN' | 'CLIENT' | 'USER' | string;
  organization: ServerOrganization[];
}

export interface ServerLoginData {
  token: string;
  user: ServerUser;
}

export interface ServerLoginResponse {
  success: boolean;
  errorMessages: string[] | null;
  messages: string | null;
  data: ServerLoginData | null;
}

/** ==== Modèle APP normalisé ==== */
export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  roles: string[];                // <- array pour le guard
  createdAt: string;
  orgs: { id: number; slug: string; name: string }[];
}

export interface LoginResult {
  accessToken: string;
  user: AuthUser;
  serverMessage?: string | null;
}
