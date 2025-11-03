import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthStore } from './auth.store';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  const token = auth.accessToken();
  const isApi = req.url.startsWith(environment.API_BASE_URL);

  const skipAuth =
    req.headers.has('X-Skip-Auth') ||
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register');

  let authReq = req;

  if (isApi && token && !skipAuth) {
    authReq = req.clone({
      setHeaders: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        const hadAuthHeader = authReq.headers.has('Authorization');
        if (isApi && hadAuthHeader && !skipAuth) {
          console.warn('[authInterceptor] 401 on API with Authorization → logout');
          auth.logout();
          router.navigateByUrl('/login');
        } else {
          console.warn('[authInterceptor] 401 ignoré (hors API ou sans Authorization)');
        }
      }
      return throwError(() => err);
    })
  );
};
