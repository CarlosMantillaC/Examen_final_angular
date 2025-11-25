import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LoginResponse, RegisterRequest} from './user';
import {LoginService} from './login-service';

@Injectable({
  providedIn: 'root',
})
export class LoginResourceService {
  private http = inject(HttpClient);
  private loginService = inject(LoginService);
  private baseUrl = 'https://backend.todoesomuygood.online/api/auth';

  login(user: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, user);
  }

  register(user: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, user);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, { headers: this.buildAuthHeaders() });
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = this.loginService.getToken();

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
