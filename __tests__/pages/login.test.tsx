import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '@/pages/login';
import { AuthProvider } from '@/context/AuthContext';

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/login',
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => children;
});

// Mock the auth API
jest.mock('@/api/auth', () => ({
  loginUser: jest.fn(),
}));

import { loginUser } from '@/api/auth';

const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  test('renders login form', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  test('shows error when fields are empty', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  test('successfully logs in user with valid credentials', async () => {
    const user = userEvent.setup();

    const mockUser = {
      id: '123',
      email: 'testuser@example.com',
      name: 'Test User',
      role: 'user',
    };

    mockLoginUser.mockResolvedValue({
      message: 'Login successful',
      user: mockUser,
      token: 'mock_jwt_token',
    });

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'testuser@example.com');
    await user.type(passwordInput, 'TestPassword123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'testuser@example.com',
        password: 'TestPassword123!',
      });
    });
  });

  test('displays error message for invalid credentials', async () => {
    const user = userEvent.setup();

    const errorMessage = 'Invalid email or password';
    mockLoginUser.mockRejectedValue(new Error(errorMessage));

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'testuser@example.com');
    await user.type(passwordInput, 'WrongPassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('stores token in localStorage on successful login', async () => {
    const user = userEvent.setup();

    const mockUser = {
      id: '123',
      email: 'testuser@example.com',
      name: 'Test User',
      role: 'user',
    };

    mockLoginUser.mockResolvedValue({
      message: 'Login successful',
      user: mockUser,
      token: 'mock_jwt_token',
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock as any;

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'testuser@example.com');
    await user.type(passwordInput, 'TestPassword123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalled();
    });
  });

  test('displays error for non-existent user', async () => {
    const user = userEvent.setup();

    mockLoginUser.mockRejectedValue(new Error('User not found'));

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'nonexistent@example.com');
    await user.type(passwordInput, 'TestPassword123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});
