import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {
  CreateTaskRequest,
  ObjectApiResponse,
  TaskResponse,
  TasksResponse,
  UpdateTaskRequest
} from './tasks';

@Injectable({
  providedIn: 'root',
})
export class TaskResourceService {
  private http = inject(HttpClient);
  private baseUrl = 'https://backend.todoesomuygood.online/api/all';

  getAll(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(this.baseUrl, { headers: this.buildAuthHeaders() });
  }

  getById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.baseUrl}/get/${id}`, { headers: this.buildAuthHeaders() });
  }

  create(request: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.baseUrl}/create`, request, { headers: this.buildAuthHeaders() });
  }

  update(id: number, request: UpdateTaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.baseUrl}/update/${id}`, request, { headers: this.buildAuthHeaders() });
  }

  delete(id: number): Observable<ObjectApiResponse> {
    return this.http.delete<ObjectApiResponse>(`${this.baseUrl}/delete/${id}`, { headers: this.buildAuthHeaders() });
  }

  private buildAuthHeaders(): HttpHeaders {
    let token: string | null = null;

    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('token');
    }

    if (!token && typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      try {
        token = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage?.getItem('token') ?? null;
      } catch {
        token = null;
      }
    }

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
