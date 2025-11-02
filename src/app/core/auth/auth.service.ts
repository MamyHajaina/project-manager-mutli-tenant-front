import { Injectable, inject } from '@angular/core';
import {delay, Observable, of, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LoginRequest, ServerLoginResponse} from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  login(payload: LoginRequest): Observable<ServerLoginResponse> {
    return this.http.post<ServerLoginResponse>(`${this.base}/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: '*/*' },
    });
  }

  logout(): void {
    // Here you can add any server-side logout logic if needed
    // For now, we just clear the local storage
    localStorage.removeItem('app.auth');
  }
}
