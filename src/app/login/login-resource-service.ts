import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LoginResponse, RegisterRequest} from './user';

@Injectable({
  providedIn: 'root',
})
export class LoginResourceService {
  private http = inject(HttpClient);
  private baseUrl = 'http://178.18.250.162:8082/api/auth';

  login(user: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, user);
  }

  register(user: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, user);
  }
}
