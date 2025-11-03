import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiEnvelope,
  ApiMembershipResponse,
  AppUserDetails,
  AppUserList,
  ServerItemResponse,
  ServerListResponse,
  ServerUserItem,
  ServerUserWithOrgs, UpdateUserRequest
} from './user.types';
import { mapApiToAppUserDetails, mapServerUsersResponse, mapServerUserWithOrgs } from './user.mapper';
import { ApiResponse, UserModel } from '../../../core/models/model';
import { Org } from '../../../core/services/organisation.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = environment.API_BASE_URL;

  getAll(): Observable<AppUserList> {
    return this.http
      .get<ServerListResponse<ServerUserItem[]>>(`${this.base}/user/all`)
      .pipe(map(mapServerUsersResponse));
  }

  getOrgByUser(userId: number) {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<ApiResponse<Org[]>>(
      `${this.base}/org/byIdUser`,
      { params }
    );
  }

  updateUser(userId: number, payload: UpdateUserRequest): Observable<AppUserDetails> {
    return this.http
      .put<ServerItemResponse<ServerUserWithOrgs>>(`${this.base}/user/${userId}`, payload)
      .pipe(map(mapServerUserWithOrgs));
  }

  getUserById(userId: number) {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<ApiResponse<UserModel>>(
      `${this.base}/user/${userId}`,
      { params }
    );
  }
}
