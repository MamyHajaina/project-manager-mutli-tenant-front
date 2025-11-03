import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../models/model';
import { environment } from '../../../environments/environment';

export interface USER {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string; // ISO
  role: 'ADMIN' | 'CLIENT' | 'USER' | string;
  organization: any[];
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private base = environment.API_BASE_URL;

  getByIdUser(id: number) {
    return this.http.get<ApiResponse<USER>>(
      `${this.base}/user/${id}`
    );
  }
}
