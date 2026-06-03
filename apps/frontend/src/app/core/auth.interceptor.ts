import { HttpInterceptorFn } from '@angular/common/http';

// Attaches the JWT bearer token (if present) to every outgoing API request.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('dispatch_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
