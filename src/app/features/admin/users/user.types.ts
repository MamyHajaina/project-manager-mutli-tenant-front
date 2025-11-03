export interface ServerUserItem {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  createdAt?: string;
  role: string;                 // "ADMIN" | "CLIENT" | ...
  organization?: unknown | null;
}

/** Envelope serveur générique */
export interface ServerListResponse<T> {
  success: boolean;             // ⚠️ peut être false même si data OK
  errorMessages: string[] | null;
  messages: string | null;
  data: T | null;
}

/** Modèle app */
export interface AppUser {
  id: number;
  fullName: string;
  email: string;
  role: string;                  // normalisé en UPPERCASE
  createdAt?: string;
}

// --- serveur ---
export interface ServerOrgItem {
  id: number;
  organization: { id: number; slug: string; name: string; createdAt: string };
  user?: unknown; // on ne l'utilise pas côté app
}
export interface ServerUserWithOrgs {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  createdAt?: string;
  role: string;
  organization: ServerOrgItem[] | null;
}
export interface ServerItemResponse<T> {
  success: boolean;
  errorMessages: string[] | null;
  messages: string | null;
  data: T | null;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: string; // "ADMIN" | "CLIENT" | "MEMBER" | "PROJECT_MANAGER" | ...
}

// user.types.ts
export interface ApiMembershipResponse {
  id: number | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  createdAt: string | null;
  role: 'ADMIN' | 'CLIENT' | 'MEMBER' | 'PROJECT_MANAGER' | null;
  organization: Array<{
    id: number;
    organization: {
      id: number;
      slug: string;
      name: string;
      createdAt: string;
    };
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      passwordHash: string;
      createdAt: string;
      role: string;
    };
  }>;
}

export interface AppUserDetails {
  id: number;
  fullName: string;
  email: string;
  createdAt?: string;  // ISO
  role: string;
  organizations: Array<{
    id: number;
    name: string;
    slug: string;
    createdAt: string; // ISO
  }>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  errorMessages: any;
  messages: string | null;
  data: T;
}

export type AppUserList = AppUser[];
