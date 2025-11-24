import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly storageKey = 'token';

  setToken(token: string | null) {
    if (typeof localStorage === 'undefined') {
      return;
    }

    if (token) {
      localStorage.setItem(this.storageKey, token);
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearToken() {
    this.setToken(null);
  }
}
