import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '@/pages/register';
import { AuthProvider } from '@/context/AuthContext';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/register',
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => children;
});

// Mock the auth API
jest.mock('@/api/auth', () => ({
  registerUser: jest.fn(),
}));

import { registerUser } from '@/api/auth';

const mockRegisterUser = registerUser as jest.MockedFunction<typeof registerUser>;

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );

    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a strong password')).toBeInTheDocument();
  });

  test('shows error when fields are empty', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );

    const form = screen.getByTestId('register-form');
    const termsCheckbox = screen.getByLabelText(/i agree to the/i);
    
    await user.click(termsCheckbox);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  test('successfully registers user with valid data', async () => {
    const user = userEvent.setup();

    mockRegisterUser.mockResolvedValue({
      message: 'OTP sent',
      email: 'testuser@example.com',
    });

    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Create a strong password');
    const termsCheckbox = screen.getByLabelText(/i agree to the/i);
    const form = screen.getByTestId('register-form');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'testuser@example.com');
    await user.type(passwordInput, 'TestPassword123!');
    await user.click(termsCheckbox);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'TestPassword123!',
      });
    });
  });

  test('displays error message when registration fails', async () => {
    const user = userEvent.setup();

    const errorMessage = 'Email already exists';
    mockRegisterUser.mockRejectedValue(new Error(errorMessage));

    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Create a strong password');
    const termsCheckbox = screen.getByLabelText(/i agree to the/i);
    const form = screen.getByTestId('register-form');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'TestPassword123!');
    await user.click(termsCheckbox);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
