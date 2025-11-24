export enum TaskStatus {
  POR_HACER = 'Por hacer',
  HACIENDO = 'Haciendo',
  HECHO = 'Hecho'
}

export interface TaskDto {
  id: number;
  title?: string | null;
  description?: string | null;
  isCompleted: boolean;
  priority: number;
  dueAt?: string | null;
  status: TaskStatus;
  estimatedHours?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  messages?: string[] | null;
}

export type TasksResponse = ApiResponse<TaskDto[]>;
export type TaskResponse = ApiResponse<TaskDto>;

export interface CreateTaskRequest {
  title?: string | null;
  description?: string | null;
  priority: number;
  dueAt?: string | null;
  status: TaskStatus;
  estimatedHours?: number | null;
}

export interface UpdateTaskRequest {
  title?: string | null;
  description?: string | null;
  isCompleted?: boolean | null;
  priority?: number | null;
  dueAt?: string | null;
  status?: TaskStatus;
  estimatedHours?: number | null;
}

export interface ObjectApiResponse {
  code: number;
  data: unknown;
  messages?: string[] | null;
}
