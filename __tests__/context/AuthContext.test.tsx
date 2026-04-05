import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AuthContext Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    localStorage.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  test('initial state is not authenticated', () => {
    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  test('login stores token and user data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'mock_jwt_token',
        user: {
          id: '123',
          email: 'testuser@example.com',
          name: 'Test User',
          role: 'user',
        },
      }),
    });

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('testuser@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user?.email).toBe('testuser@example.com');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock_jwt_token');
  });

  test('login redirects to dashboard', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'mock_jwt_token',
        user: {
          id: '123',
          email: 'testuser@example.com',
          name: 'Test User',
          role: 'user',
        },
      }),
    });

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('testuser@example.com', 'password');
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/job-seeker/dashboard');
    });
  });

  test('login redirects admin to admin dashboard', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'mock_jwt_token',
        user: {
          id: '123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
      }),
    });

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('admin@example.com', 'password');
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  test('logout clears user data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'mock_jwt_token',
        user: {
          id: '123',
          email: 'testuser@example.com',
          name: 'Test User',
          role: 'user',
        },
      }),
    });

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login
    await act(async () => {
      await result.current.login('testuser@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  test('register calls registerUser API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'OTP sent',
      }),
    });

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'TestPassword123!',
    };

    await act(async () => {
      await result.current.register(userData);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/register'),
      expect.any(Object)
    );
  });

  test('login handles error response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials',
      }),
    });

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login('testuser@example.com', 'wrongpassword');
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
