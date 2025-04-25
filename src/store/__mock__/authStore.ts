// Example: src/store/__mocks__/authStore.ts (create a __mocks__ folder)
import { vi } from 'vitest';

export const useAuthStore = vi.fn().mockReturnValue({
  isAuthenticated: false,
  loading: false,
  error: null,
  login: vi.fn().mockResolvedValue(true), // Mock login action
  register: vi.fn().mockResolvedValue(true), // Mock register action
  logout: vi.fn(),
  clearError: vi.fn(),
});