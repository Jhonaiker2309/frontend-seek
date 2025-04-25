import { create } from 'zustand';
import { Task, NewTaskData, UpdateTaskData } from '../types/task';
import { useAuthStore } from './authStore'; // Adjust path as needed

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (newTaskData: NewTaskData) => Promise<boolean>; // Return true on success
  updateTask: (taskId: string, updates: UpdateTaskData) => Promise<boolean>; // Return true on success
  deleteTask: (taskId: string) => Promise<boolean>; // Return true on success
  _getAuthHeaders: () => { Authorization: string; 'Content-Type': string } | null;
}

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  // Helper to get headers and handle potential logout
  _getAuthHeaders: () => {
    const { token, logout } = useAuthStore.getState(); // Get current auth state
    if (!token) {
      logout(); // Log out if no token
      return null;
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },

  // --- FETCH TASKS ---
  fetchTasks: async () => {
    const headers = get()._getAuthHeaders();
    if (!headers) return set({ loading: false, error: 'Not authenticated' }); // Stop if not authenticated

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/tasks`, { headers });

      if (response.status === 401) {
         useAuthStore.getState().logout(); // Logout on 401
         set({ loading: false, error: 'Authentication failed', tasks: [] });
         return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch tasks' }));
        throw new Error(errorData.message || 'Failed to fetch tasks');
      }

      const fetchedTasks: Task[] = await response.json();
      set({ tasks: fetchedTasks, loading: false });
    } catch (error: any) {
      console.error("Fetch tasks error:", error);
      set({ error: error.message || 'An unknown error occurred', loading: false });
    }
  },

  // --- ADD TASK ---
  addTask: async (newTaskData) => {
    const headers = get()._getAuthHeaders();
    if (!headers) return false; // Stop if not authenticated

    set({ loading: true, error: null }); // Indicate loading
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(newTaskData),
      });

       if (response.status === 401) {
         useAuthStore.getState().logout();
         set({ loading: false, error: 'Authentication failed' });
         return false;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create task' }));
        throw new Error(errorData.message || 'Failed to create task');
      }

      const createdTask: Task = await response.json();
      // Add the new task to the existing state
      set((state) => ({
        tasks: [...state.tasks, createdTask],
        loading: false,
      }));
      return true; // Indicate success
    } catch (error: any) {
      console.error("Add task error:", error);
      set({ error: error.message || 'An unknown error occurred', loading: false });
      return false; // Indicate failure
    }
  },

  // --- UPDATE TASK ---
  updateTask: async (taskId, updates) => {
    const headers = get()._getAuthHeaders();
    if (!headers) return false;

    const originalTasks = get().tasks;
    set((state) => ({
        tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
        ),
        error: null
    }));

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(updates),
      });

       if (response.status === 401) {
         useAuthStore.getState().logout();
         set({ loading: false, error: 'Authentication failed', tasks: originalTasks });
         return false;
      }
       if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update task' }));
        throw new Error(errorData.message || 'Failed to update task');
      }

      const updatedTaskFromServer: Task = await response.json();
      // Update state with confirmed data from server
      set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? updatedTaskFromServer : task
        ),
        loading: false,
      }));
       return true;
    } catch (error: any) {
      console.error("Update task error:", error);
      // Revert optimistic update on error
      set({ error: error.message || 'An unknown error occurred', tasks: originalTasks, loading: false });
      return false; // Indicate failure
    }
  },

deleteTask: async (taskId) => {
  const headers = get()._getAuthHeaders();
  if (!headers) return false;

  // Crear un nuevo objeto headers sin 'Content-Type'
  const deleteHeaders = { ...headers };

  // Optimistic UI update
  const originalTasks = get().tasks;
  set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== taskId),
    error: null,
  }));

  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: deleteHeaders,
    });

    if (response.status === 401) {
      useAuthStore.getState().logout();
      set({ loading: false, error: 'Authentication failed', tasks: originalTasks }); // Revert
      return false;
    }
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete task' }));
      throw new Error(errorData.message || 'Failed to delete task');
    }

    // State is already updated optimistically, just confirm loading is false
    set({ loading: false }); // Assuming loading state was handled differently
    return true; // Indicate success
  } catch (error: any) {
    console.error('Delete task error:', error);
    // Revert optimistic update
    set({ error: error.message || 'An unknown error occurred', tasks: originalTasks, loading: false });
    return false; // Indicate failure
  }
},
}));