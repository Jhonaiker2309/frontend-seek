// Example: src/store/__mocks__/taskStore.ts
import { vi } from 'vitest';
import { TaskStatus } from '../../types/task'; // Adjust path as needed

const mockTasks = [
  { id: '1', title: 'Test Task 1', description: 'Desc 1', completed: 'to do' as TaskStatus },
  { id: '2', title: 'Test Task 2', completed: 'in progress' as TaskStatus },
];

export const useTaskStore = vi.fn().mockReturnValue({
  tasks: mockTasks,
  loading: false,
  error: null,
  fetchTasks: vi.fn().mockResolvedValue(undefined),
  addTask: vi.fn().mockResolvedValue(true),
  updateTask: vi.fn().mockResolvedValue(true),
  deleteTask: vi.fn().mockResolvedValue(true),
  clearError: vi.fn(),
});