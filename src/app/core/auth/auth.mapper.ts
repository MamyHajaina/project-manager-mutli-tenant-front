// auth.mapper.ts
import { AuthUser, LoginResult, ServerLoginResponse } from './auth.types';

export function mapServerLoginResponse(res: ServerLoginResponse): LoginResult {
  if (!res?.data) {
    const msg = res?.messages || (res?.errorMessages?.join(', ') ?? 'Authentication failed');
    throw new Error(msg);
  }

  const { token, user } = res.data;

  const role = (user.role ?? '').toString().trim();
  const normalizedRole = role ? role.toUpperCase() : ''; // ADMIN / CLIENT / USER...

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    fullName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
    roles: normalizedRole ? [normalizedRole] : [],
    createdAt: user.createdAt,
    orgs: (user.organization ?? []).map(o => ({
      id: o.organization.id,
      slug: o.organization.slug,
      name: o.organization.name,
    })),
  };

  return {
    accessToken: token,
    user: authUser,
    serverMessage: res.messages,
  };
}
