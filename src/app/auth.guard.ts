import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {LoginService} from './login/login-service';

export const authGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['login']);
};
