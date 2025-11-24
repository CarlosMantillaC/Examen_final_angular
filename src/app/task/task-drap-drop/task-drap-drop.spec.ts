import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDrapDrop } from './task-drap-drop';

describe('TaskDrapDrop', () => {
  let component: TaskDrapDrop;
  let fixture: ComponentFixture<TaskDrapDrop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDrapDrop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDrapDrop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
