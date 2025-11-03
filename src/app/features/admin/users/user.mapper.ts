import {
  ApiMembershipResponse,
  AppUserDetails,
  AppUserList,
  ServerItemResponse,
  ServerListResponse,
  ServerUserItem,
  ServerUserWithOrgs
} from './user.types';

export function mapServerUsersResponse(res: ServerListResponse<ServerUserItem[]>): AppUserList {
  if (!res?.data) {
    const msg = res?.messages || (res?.errorMessages?.join(', ') ?? 'Failed to load users');
    throw new Error(msg);
  }
  return res.data.map(u => ({
    id: u.id,
    fullName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    email: u.email,
    role: (u.role ?? '').toString().trim().toUpperCase(),
    createdAt: u.createdAt,
  }));
}

export function mapServerUserWithOrgs(res: ServerItemResponse<ServerUserWithOrgs>): AppUserDetails {
  if (!res?.data) {
    const msg = res?.messages || (res?.errorMessages?.join(', ') ?? 'Unable to load user');
    throw new Error(msg);
  }
  const u = res.data;
  return {
    id: u.id,
    fullName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    email: u.email,
    role: (u.role ?? '').toString().toUpperCase(),
    createdAt: u.createdAt,
    organizations: (u.organization ?? []).map(o => ({
      id: o.organization.id,
      slug: o.organization.slug,
      name: o.organization.name,
      createdAt: o.organization.createdAt,
    })),
  };
}

export function mapApiToAppUserDetails(src: ApiMembershipResponse): AppUserDetails {
  const firstMembership = src.organization?.[0];
  const u = firstMembership?.user;

  const firstName = u?.firstName ?? src.firstName ?? '';
  const lastName  = u?.lastName  ?? src.lastName  ?? '';
  return {
    id: u?.id ?? 0,
    fullName: `${firstName} ${lastName}`.trim(),
    email: u?.email ?? src.email ?? '',
    createdAt: u?.createdAt ?? src.createdAt ?? '',
    role: u?.role ?? src.role ?? '',
    organizations: (src.organization ?? []).map(m => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      createdAt: m.organization.createdAt,
    })),
  };
}
