import { TaskPriority, TaskStatus } from '../task';

export interface UpdateTaskRequest {
  name: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}
