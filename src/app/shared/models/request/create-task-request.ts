import { TaskPriority } from '../task';

export interface CreateTaskRequest {
  name: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string;
}
