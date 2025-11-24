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
  private baseUrl = 'http://178.18.250.162:8082/api/all';

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
    const token = localStorage.getItem('token');
    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
