export type TaskStatus = 'to do' | 'in progress' | 'finished';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: TaskStatus;
}

export interface NewTaskData {
    title: string;
    description?: string;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    completed?: TaskStatus;
}