import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TaskDrapDrop, TaskStatusChange} from './task-drap-drop/task-drap-drop';
import {TaskResourceService} from './task-resource-service';
import {CreateTaskRequest, TaskDto, TaskStatus, TasksResponse, UpdateTaskRequest} from './tasks';
import {TaskForm, TaskFormSubmitEvent} from './task-form/task-form';
import {LoginResourceService} from '../login/login-resource-service';
import {LoginService} from '../login/login-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-task',
  imports: [
    CommonModule,
    TaskDrapDrop,
    TaskForm,
  ],
  templateUrl: './task.html',
  styleUrl: './task.scss',
})
export class Task implements OnInit {
  private readonly taskResourceService = inject(TaskResourceService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly loginResourceService = inject(LoginResourceService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  tasks: TaskDto[] = [];
  tasksHecho: TaskDto[] = [];
  tasksHaciendo: TaskDto[] = [];
  tasksPorHacer: TaskDto[] = [];

  isLoading = false;
  showForm = false;
  selectedTask: TaskDto | null = null;

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.taskResourceService.getAll().subscribe({
      next: (response: TasksResponse) => {
        this.tasks = response.data ?? [];
        this.isLoading = false;
        this.splitByStatus();
        this.refreshView();
      },
      error: () => {
        this.isLoading = false;
        this.refreshView();
      }
    });
  }

  splitByStatus() {
    this.tasksHecho = this.tasks.filter(task => task.status === TaskStatus.HECHO);
    this.tasksHaciendo = this.tasks.filter(task => task.status === TaskStatus.HACIENDO);
    this.tasksPorHacer = this.tasks.filter(task => task.status === TaskStatus.POR_HACER);
  }

  openCreateForm() {
    this.selectedTask = null;
    this.showForm = true;
  }

  onEditTask(task: TaskDto) {
    this.selectedTask = task;
    this.showForm = true;
  }

  onDeleteTask(task: TaskDto) {
    this.taskResourceService.delete(task.id).subscribe({
      next: () => this.loadTasks(),
    });
  }

  handleFormSubmit(event: TaskFormSubmitEvent) {
    const payload = event.payload;
    const request$ = event.id
      ? this.taskResourceService.update(event.id, payload as UpdateTaskRequest)
      : this.taskResourceService.create(payload as CreateTaskRequest);

    request$.subscribe({
      next: () => {
        this.closeForm();
        this.loadTasks();
        this.refreshView();
      }
    });
  }

  handleStatusChange(change: TaskStatusChange) {
    this.taskResourceService.update(change.task.id, { status: change.status }).subscribe({
      next: () => this.loadTasks(),
    });
  }

  closeForm() {
    this.showForm = false;
    this.selectedTask = null;
    this.refreshView();
  }

  onLogout() {
    this.loginResourceService.logout().subscribe({
      next: () => this.handleLogoutNavigation(),
      error: () => this.handleLogoutNavigation()
    });
  }

  private handleLogoutNavigation() {
    this.loginService.clearToken();
    this.router.navigate(['login']);
  }

  private refreshView() {
    this.cdr.detectChanges();
  }
}
