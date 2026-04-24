import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

// Mock next/router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    pathname: '/',
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AuthContext Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
    localStorage.clear();
  });

  test('initial state has no user and is loading', async () => {
    const wrapper = ({ children }: any) => (
      <NotificationProvider>
        <AuthProvider>{children}</AuthProvider>
      </NotificationProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the provider to mount
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  test('login sets user data', async () => {
    const wrapper = ({ children }: any) => (
      <NotificationProvider>
        <AuthProvider>{children}</AuthProvider>
      </NotificationProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the provider to mount
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const userData = {
      token: 'test-token',
      user: {
        id: '123',
        email: 'testuser@example.com',
        name: 'Test User',
        role: 'user',
      }
    };

    act(() => {
      result.current.login(userData);
    });

    expect(result.current.user?.email).toBe('testuser@example.com');
    expect(result.current.user?.role).toBe('user');
  });

  test('logout clears user data and redirects', async () => {
    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the provider to mount
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // First login
    const userData = {
      token: 'test-token',
      user: {
        id: '123',
        email: 'testuser@example.com',
        name: 'Test User',
        role: 'user',
      }
    };

    act(() => {
      result.current.login(userData);
    });

    expect(result.current.user).not.toBeNull();

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

});
