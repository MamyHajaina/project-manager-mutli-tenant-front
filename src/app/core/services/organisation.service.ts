import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Org {
  id: number;
  slug: string;
  name: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  errorMessages: string[] | null;
  messages: string | null;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080'; // adapte si tu as un env

  getAll(): Observable<ApiResponse<Org[]>> {
    return this.http.get<ApiResponse<Org[]>>(`${this.base}/org/all`);
  }

  assignMember(organizationId: number, userId: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams()
      .set('organizationId', organizationId)
      .set('userId', userId);
    // Corps vide, params en query string (token via interceptor)
    return this.http.post<ApiResponse<unknown>>(`${this.base}/org/assignedMember`, null, { params });
  }

  getOrgByUserId(userId: number): any {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<any>(`${this.base}/org/byIdUser`, { params });
  }
}
