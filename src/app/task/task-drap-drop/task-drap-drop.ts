import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {TaskDto, TaskStatus} from '../tasks';

export interface TaskStatusChange {
  task: TaskDto;
  status: TaskStatus;
}

@Component({
  selector: 'app-task-drap-drop',
  imports: [CommonModule, DragDropModule],
  templateUrl: './task-drap-drop.html',
  styleUrl: './task-drap-drop.scss',
})
export class TaskDrapDrop {
  @Input() tasksPorHacer: TaskDto[] = [];
  @Input() tasksHaciendo: TaskDto[] = [];
  @Input() tasksHecho: TaskDto[] = [];

  @Output() changes = new EventEmitter<TaskStatusChange>();
  @Output() edit = new EventEmitter<TaskDto>();
  @Output() delete = new EventEmitter<TaskDto>();

  protected readonly TaskStatus = TaskStatus;

  onDrop(event: CdkDragDrop<TaskDto[]>, status: TaskStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const task = event.container.data[event.currentIndex];
    if (!task) {
      return;
    }

    if (task.status === status) {
      return;
    }

    task.status = status;
    this.changes.emit({ task, status });
  }

  trackByTaskId(_index: number, task: TaskDto) {
    return task.id;
  }
}
