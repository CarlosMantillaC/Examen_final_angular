import {ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID} from '@angular/core';
import {CommonModule, formatDate as intlFormatDate, isPlatformBrowser} from '@angular/common';
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
  private readonly platformId = inject(PLATFORM_ID);
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

  async exportToPDF() {
    if (this.tasks.length === 0 || !this.isBrowser()) {
      return;
    }

    try {
      const jsPDFModule = await import('jspdf');
      await import('jspdf-autotable');

      const JsPDFCtor = jsPDFModule.default ?? jsPDFModule.jsPDF;

      if (!JsPDFCtor) {
        console.error('Faltan dependencias para exportar PDF');
        return;
      }

      const doc = new JsPDFCtor({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const docWithAutoTable = doc as typeof doc & { autoTable?: (options: unknown) => void };

      if (typeof docWithAutoTable.autoTable !== 'function') {
        console.error('Faltan dependencias para exportar PDF');
        return;
      }

      const columns = ['ID', 'Título', 'Descripción', 'Estado', 'Prioridad', 'Completado', 'Vence', 'Horas estimadas', 'Creado', 'Actualizado'];
      const rows = this.buildTableRows();

      doc.setFontSize(16);
      doc.text('Reporte de tareas', 40, 40);
      doc.setFontSize(10);
      doc.text(`Generado: ${this.getNowLabel()}`, 40, 60);

      docWithAutoTable.autoTable({
        startY: 80,
        head: [columns],
        body: rows,
        styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
        headStyles: { fillColor: [124, 58, 237], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 140 },
          2: { cellWidth: 200 },
          3: { cellWidth: 90 },
          4: { cellWidth: 60 },
          5: { cellWidth: 80 },
          6: { cellWidth: 100 },
          7: { cellWidth: 100 },
          8: { cellWidth: 110 },
          9: { cellWidth: 110 },
        }
      });

      doc.save(`tareas_${this.getTimestamp()}.pdf`);
    } catch (error) {
      console.error('No se pudo generar el PDF', error);
    }
  }

  async exportToExcel() {
    if (this.tasks.length === 0 || !this.isBrowser()) {
      return;
    }

    try {
      const xlsxModule = await import('xlsx');
      const XLSX = xlsxModule.default ?? xlsxModule;
      const worksheet = XLSX.utils.json_to_sheet(this.buildWorksheetRows());
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tareas');
      XLSX.writeFile(workbook, `tareas_${this.getTimestamp()}.xlsx`);
    } catch (error) {
      console.error('No se pudo generar el Excel', error);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private buildTableRows(): string[][] {
    return this.tasks.map(task => [
      String(task.id),
      task.title ?? 'Sin título',
      task.description ?? '—',
      task.status,
      String(task.priority),
      task.isCompleted ? 'Sí' : 'No',
      this.formatDate(task.dueAt),
      task.estimatedHours != null ? `${task.estimatedHours}h` : '—',
      this.formatDate(task.createdAt, true),
      this.formatDate(task.updatedAt, true),
    ]);
  }

  private buildWorksheetRows() {
    return this.tasks.map(task => ({
      ID: task.id,
      Título: task.title ?? 'Sin título',
      Descripción: task.description ?? '—',
      Estado: task.status,
      Prioridad: task.priority,
      'Completado?': task.isCompleted ? 'Sí' : 'No',
      'Fecha de vencimiento': this.formatDate(task.dueAt),
      'Horas estimadas': task.estimatedHours ?? '—',
      'Creado el': this.formatDate(task.createdAt, true),
      'Actualizado el': this.formatDate(task.updatedAt, true),
    }));
  }

  private formatDate(date?: string | null, includeTime = false): string {
    if (!date) {
      return '—';
    }

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return intlFormatDate(parsed, includeTime ? 'medium' : 'long', 'es-ES');
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
  }

  private getNowLabel(): string {
    return intlFormatDate(new Date(), 'medium', 'es-ES');
  }

  private refreshView() {
    this.cdr.detectChanges();
  }
}
