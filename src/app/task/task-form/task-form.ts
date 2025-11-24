import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDatepickerInput} from '@angular/material/datepicker';
import {MatDatepickerToggle} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {CreateTaskRequest, TaskDto, TaskStatus, UpdateTaskRequest} from '../tasks';

type TaskFormPayload = CreateTaskRequest | UpdateTaskRequest;
export type TaskFormSubmitEvent = { id?: number; payload: TaskFormPayload };

@Component({
  selector: 'app-task-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatNativeDateModule
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm implements OnChanges {
  @Input() task: TaskDto | null = null;
  @Output() formSubmit = new EventEmitter<TaskFormSubmitEvent>();
  @Output() cancel = new EventEmitter<void>();

  title = 'Crear';
  statuses = Object.values(TaskStatus);

  taskForm = new FormGroup({
    id: new FormControl<number | null>(null),
    title: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(255)]),
    description: new FormControl<string | null>(null),
    priority: new FormControl<number | null>(null, [Validators.required]),
    dueAt: new FormControl<Date | null>(null),
    status: new FormControl<TaskStatus | null>(TaskStatus.POR_HACER, [Validators.required]),
    estimatedHours: new FormControl<number | null>(null, [Validators.min(1), Validators.max(50)])
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']) {
      this.patchForm();
    }
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const value = this.taskForm.value;
    const payload: TaskFormPayload = {
      title: value.title ?? null,
      description: value.description ?? null,
      priority: value.priority ?? 0,
      dueAt: value.dueAt ? value.dueAt.toISOString() : null,
      status: (value.status as TaskStatus) ?? TaskStatus.POR_HACER,
      estimatedHours: value.estimatedHours ?? null
    };

    this.formSubmit.emit({ id: value.id ?? undefined, payload });
    this.resetForm();
  }

  onCancelEdit() {
    this.resetForm();
    this.cancel.emit();
  }

  private patchForm() {
    if (this.task) {
      this.title = 'Editar';
      this.taskForm.setValue({
        id: this.task.id,
        title: this.task.title ?? null,
        description: this.task.description ?? null,
        priority: this.task.priority,
        dueAt: this.task.dueAt ? new Date(this.task.dueAt) : null,
        status: this.task.status ?? TaskStatus.POR_HACER,
        estimatedHours: this.task.estimatedHours ?? null
      });
      return;
    }

    this.resetForm();
  }

  private resetForm() {
    this.title = 'Crear';
    this.taskForm.reset({
      id: null,
      title: null,
      description: null,
      priority: null,
      dueAt: null,
      status: TaskStatus.POR_HACER,
      estimatedHours: null
    });
  }
}
