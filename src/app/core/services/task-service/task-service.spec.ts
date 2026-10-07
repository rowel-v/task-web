import { TestBed } from '@angular/core/testing';

import { TaskService } from './task-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Task } from '../../models/task';
import { CreateTaskRequest } from '../../models/request/create-task-request';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no unmatched requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch tasks and update signal', () => {
    const mockTasks: Task[] = [
      { name: 'Test', description: 'Sample Description', priority: 'MEDIUM' } as Task,
    ];

    service.getAllTask().subscribe((tasks) => {
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne('http://localhost:8080/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks); // simulate server response

    expect(service.tasks()).toEqual(mockTasks); // signal updated
    expect(service.totalTasks()).toBe(1); // computed updated
  });

  it('should create a task and append to signal', () => {
    const newTask: CreateTaskRequest = {
      name: 'New',
      description: 'Description',
      priority: 'MEDIUM',
      dueDate: new Date().toISOString(),
    };

    service.createTask(newTask).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/tasks');
    expect(req.request.method).toBe('POST');
    req.flush(newTask);

    expect(service.tasks()).toContain(newTask);
  });
});
