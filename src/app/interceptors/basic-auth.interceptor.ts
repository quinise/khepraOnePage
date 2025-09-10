// src/app/interceptors/basic-auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const basicAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useBasicAuth) return next(req);
  if (!req.url.startsWith('/api')) return next(req);

  const creds = btoa(`${environment.apiUser}:${environment.apiPass}`);
  return next(req.clone({ setHeaders: { Authorization: `Basic ${creds}` } }));
};
