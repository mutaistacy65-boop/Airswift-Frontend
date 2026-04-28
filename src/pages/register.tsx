import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import API from "@/services/apiClient";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isConfirmationPage, setIsConfirmationPage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (emailAddress: string) => {
    if (!emailAddress) {
      return {
        valid: false,
        message: '📧 Email address is required'
      };
    }

    if (!emailAddress.endsWith('@gmail.com')) {
      return {
        valid: false,
        message: '❌ Only Gmail addresses (@gmail.com) are allowed for user registration. Please use a valid Gmail account.'
      };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(emailAddress)) {
      return {
        valid: false,
        message: '❌ Invalid Gmail address format. Example: yourname@gmail.com'
      };
    }

    return {
      valid: true,
      message: '✅ Valid Gmail address'
    };
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return {
        valid: false,
        message: 'Password is required'
      };
    }

    if (password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        valid: false,
        message: 'Password must contain uppercase, lowercase, and numbers'
      };
    }

    return {
      valid: true,
      message: '✅ Password is strong'
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (generalError) {
      setGeneralError('');
    }

    if (name === 'email') {
      if (value) {
        const validation = validateEmail(value);
        setErrors(prev => ({
          ...prev,
          email: validation.valid ? '' : validation.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: ''
        }));
      }
    }

    if (name === 'password') {
      if (value) {
        const validation = validatePassword(value);
        setErrors(prev => ({
          ...prev,
          password: validation.valid ? '' : validation.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          password: ''
        }));
      }
    }

    if (name === 'confirmPassword' || name === 'password') {
      const pwd = name === 'password' ? value : formData.password;
      const confirm = name === 'confirmPassword' ? value : formData.confirmPassword;

      if (confirm && pwd && pwd !== confirm) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: '❌ Passwords do not match'
        }));
      } else if (confirm) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '❌ Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Registering user with Gmail:', formData.email);

      const response = await API.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'user'
      });

      console.log('✅ Registration successful:', response.data);

      const emailToShow = response.data.email || formData.email;
      setRegisteredEmail(emailToShow);

      try {
        await router.push(`/verify-email?email=${encodeURIComponent(emailToShow)}`);
        return;
      } catch (routeError) {
        console.warn('Unable to navigate to confirmation page, using inline fallback:', routeError);
        setIsConfirmationPage(true);
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';

      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isConfirmationPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden p-4">
        {/* Decorative animated blobs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-5000"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Success Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-full p-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>
            </div>

            <h1 className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Check Your Email
            </h1>
            <p className="text-center text-gray-600 text-base font-medium mb-8">
              We sent an activation link to <br />
              <span className="font-bold text-gray-900">{registeredEmail}</span>
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8">
              <p className="text-sm text-blue-900 font-medium">
                ⏰ <strong>Activation links expire after 24 hours.</strong> Please verify your account promptly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-95"
            >
              Back to Login
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden p-4">
      {/* Decorative animated blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-5000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-10000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">

          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <img
              src="/logo.svg"
              alt="TALEX Logo"
              className="h-12 w-auto drop-shadow-lg"
              onError={(e: any) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-base font-medium">
              Join TALEX using your Gmail account
            </p>
          </div>

          {/* Error Alert */}
          {generalError && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium shadow-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>{generalError}</div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Email Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Gmail Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="yourname@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (formData.email) {
                      const validation = validateEmail(formData.email);
                      if (!validation.valid) {
                        setErrors(prev => ({
                          ...prev,
                          email: validation.message
                        }));
                      }
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <span className="absolute right-4 top-3 text-gray-400">📧</span>
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {errors.email}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                ℹ️ Only Gmail addresses (@gmail.com) are accepted
              </p>
            </div>

            {/* Full Name Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <span className="absolute right-4 top-3 text-gray-400">👤</span>
              </div>
              {errors.name && (
                <p className="text-red-600 text-sm mt-2">{errors.name}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-2">{errors.password}</p>
              )}
              
              {/* Password Requirements */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password requirements:</p>
                <ul className="space-y-1.5 text-xs">
                  <li className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    {/[A-Z]/.test(formData.password) ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    Uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-center gap-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    {/[a-z]/.test(formData.password) ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    Lowercase letter (a-z)
                  </li>
                  <li className={`flex items-center gap-2 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    {/\d/.test(formData.password) ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    Number (0-9)
                  </li>
                  <li className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.password.length >= 8 ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    At least 8 characters
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-2">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading || Object.values(errors).some(e => e)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 transition-all mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin">⌛</span>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ✅ Create Account
                </span>
              )}
            </button>

          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import API from "@/services/apiClient";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isConfirmationPage, setIsConfirmationPage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (emailAddress: string) => {
    if (!emailAddress) {
      return {
        valid: false,
        message: '📧 Email address is required'
      };
    }

    if (!emailAddress.endsWith('@gmail.com')) {
      return {
        valid: false,
        message: '❌ Only Gmail addresses (@gmail.com) are allowed for user registration. Please use a valid Gmail account.'
      };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(emailAddress)) {
      return {
        valid: false,
        message: '❌ Invalid Gmail address format. Example: yourname@gmail.com'
      };
    }

    return {
      valid: true,
      message: '✅ Valid Gmail address'
    };
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return {
        valid: false,
        message: 'Password is required'
      };
    }

    if (password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        valid: false,
        message: 'Password must contain uppercase, lowercase, and numbers'
      };
    }

    return {
      valid: true,
      message: '✅ Password is strong'
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (generalError) {
      setGeneralError('');
    }

    if (name === 'email') {
      if (value) {
        const validation = validateEmail(value);
        setErrors(prev => ({
          ...prev,
          email: validation.valid ? '' : validation.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: ''
        }));
      }
    }

    if (name === 'password') {
      if (value) {
        const validation = validatePassword(value);
        setErrors(prev => ({
          ...prev,
          password: validation.valid ? '' : validation.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          password: ''
        }));
      }
    }

    if (name === 'confirmPassword' || name === 'password') {
      const pwd = name === 'password' ? value : formData.password;
      const confirm = name === 'confirmPassword' ? value : formData.confirmPassword;

      if (confirm && pwd && pwd !== confirm) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: '❌ Passwords do not match'
        }));
      } else if (confirm) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '❌ Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Registering user with Gmail:', formData.email);

      const response = await API.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'user'
      });

      console.log('✅ Registration successful:', response.data);

      const emailToShow = response.data.email || formData.email;
      setRegisteredEmail(emailToShow);

      try {
        await router.push(`/verify-email?email=${encodeURIComponent(emailToShow)}`);
        return;
      } catch (routeError) {
        console.warn('Unable to navigate to confirmation page, using inline fallback:', routeError);
        setIsConfirmationPage(true);
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';

      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isConfirmationPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden p-4">
        {/* Decorative animated blobs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-5000"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Success Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-full p-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>
            </div>

            <h1 className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Check Your Email
            </h1>
            <p className="text-center text-gray-600 text-base font-medium mb-8">
              We sent an activation link to <br />
              <span className="font-bold text-gray-900">{registeredEmail}</span>
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8">
              <p className="text-sm text-blue-900 font-medium">
                ⏰ <strong>Activation links expire after 24 hours.</strong> Please verify your account promptly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-95"
            >
              Back to Login
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden p-4">
      {/* Decorative animated blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-5000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-10000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">

          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <img
              src="/logo.svg"
              alt="TALEX Logo"
              className="h-12 w-auto drop-shadow-lg"
              onError={(e: any) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-base font-medium">
              Join TALEX using your Gmail account
            </p>
          </div>

          {/* Error Alert */}
          {generalError && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium shadow-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>{generalError}</div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Email Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Gmail Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="yourname@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (formData.email) {
                      const validation = validateEmail(formData.email);
                      if (!validation.valid) {
                        setErrors(prev => ({
                          ...prev,
                          email: validation.message
                        }));
                      }
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <span className="absolute right-4 top-3 text-gray-400">📧</span>
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {errors.email}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                ℹ️ Only Gmail addresses (@gmail.com) are accepted
              </p>
            </div>

            {/* Full Name Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <span className="absolute right-4 top-3 text-gray-400">👤</span>
              </div>
              {errors.name && (
                <p className="text-red-600 text-sm mt-2">{errors.name}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-2">{errors.password}</p>
              )}
              
              {/* Password Requirements */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password requirements:</p>
                <ul className="space-y-1.5 text-xs">
                  <li className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    {/[A-Z]/.test(formData.password) ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    Uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-center gap-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    {/[a-z]/.test(formData.password) ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    Lowercase letter (a-z)
                  </li>
                  <li className={`flex items-center gap-2 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    {/\d/.test(formData.password) ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    Number (0-9)
                  </li>
                  <li className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.password.length >= 8 ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    At least 8 characters
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-2">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading || Object.values(errors).some(e => e)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 transition-all mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin">⌛</span>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ✅ Create Account
                </span>
              )}
            </button>

          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import API from '@/services/apiClient';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isConfirmationPage, setIsConfirmationPage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (emailAddress: string) => {
    if (!emailAddress) {
      return {
        valid: false,
        message: '📧 Email address is required'
      };
    }

    if (!emailAddress.endsWith('@gmail.com')) {
      return {
        valid: false,
        message: '❌ Only Gmail addresses (@gmail.com) are allowed for user registration. Please use a valid Gmail account.'
      };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(emailAddress)) {
      return {
        valid: false,
        message: '❌ Invalid Gmail address format. Example: yourname@gmail.com'
      };
    }

    return {
      valid: true,
      message: '✅ Valid Gmail address'
    };
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return {
        valid: false,
        message: 'Password is required'
      };
    }

    if (password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        valid: false,
        message: 'Password must contain uppercase, lowercase, and numbers'
      };
    }

    return {
      valid: true,
      message: '✅ Password is strong'
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (generalError) {
      setGeneralError('');
    }

    if (name === 'email') {
      if (value) {
        const validation = validateEmail(value);
        setErrors(prev => ({
          ...prev,
          email: validation.valid ? '' : validation.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: ''
        }));
      }
    }

    if (name === 'password') {
      if (value) {
        const validation = validatePassword(value);
        setErrors(prev => ({
          ...prev,
          password: validation.valid ? '' : validation.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          password: ''
        }));
      }
    }

    if (name === 'confirmPassword' || name === 'password') {
      const pwd = name === 'password' ? value : formData.password;
      const confirm = name === 'confirmPassword' ? value : formData.confirmPassword;

      if (confirm && pwd && pwd !== confirm) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: '❌ Passwords do not match'
        }));
      } else if (confirm) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '❌ Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Registering user with Gmail:', formData.email);

      const response = await API.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'user'
      });

      console.log('✅ Registration successful:', response.data);

      const emailToShow = response.data.email || formData.email;
      setRegisteredEmail(emailToShow);

      try {
        await router.push(`/verify-email?email=${encodeURIComponent(emailToShow)}`);
        return;
      } catch (routeError) {
        console.warn('Unable to navigate to confirmation page, using inline fallback:', routeError);
        setIsConfirmationPage(true);
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';

      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isConfirmationPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden p-4">
        {/* Decorative animated blobs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-5000"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Success Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-full p-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>
            </div>

            <h1 className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Check Your Email
            </h1>
            <p className="text-center text-gray-600 text-base font-medium mb-8">
              We sent an activation link to <br />
              <span className="font-bold text-gray-900">{registeredEmail}</span>
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8">
              <p className="text-sm text-blue-900 font-medium">
                ⏰ <strong>Activation links expire after 24 hours.</strong> Please verify your account promptly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-95"
            >
              Back to Login
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden p-4">
      {/* Decorative animated blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-5000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-10000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">

          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <img
              src="/logo.svg"
              alt="TALEX Logo"
              className="h-12 w-auto drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-base font-medium">
              Join TALEX using your Gmail account
            </p>
          </div>

          {/* Error Alert */}
          {generalError && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium shadow-md">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>{generalError}</div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Email Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Gmail Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="yourname@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (formData.email) {
                      const validation = validateEmail(formData.email);
                      if (!validation.valid) {
                        setErrors(prev => ({
                          ...prev,
                          email: validation.message
                        }));
                      }
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <span className="absolute right-4 top-3 text-gray-400">📧</span>
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {errors.email}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                ℹ️ Only Gmail addresses (@gmail.com) are accepted
              </p>
            </div>

            {/* Full Name Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <span className="absolute right-4 top-3 text-gray-400">👤</span>
              </div>
              {errors.name && (
                <p className="text-red-600 text-sm mt-2">{errors.name}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-2">{errors.password}</p>
              )}
              
              {/* Password Requirements */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password requirements:</p>
                <ul className="space-y-1.5 text-xs">
                  <li className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    {/[A-Z]/.test(formData.password) ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    Uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-center gap-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    {/[a-z]/.test(formData.password) ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    Lowercase letter (a-z)
                  </li>
                  <li className={`flex items-center gap-2 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                    {/\d/.test(formData.password) ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    Number (0-9)
                  </li>
                  <li className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.password.length >= 8 ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full"></div>}
                    At least 8 characters
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition duration-200 text-gray-900 placeholder-gray-400 group-hover:border-gray-300 ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-2">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading || Object.values(errors).some(e => e)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 transition-all mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin">⌛</span>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ✅ Create Account
                </span>
              )}
            </button>

          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import API from '@/services/apiClient';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isConfirmationPage, setIsConfirmationPage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (emailAddress: string) => {
    if (!emailAddress) {
      return {
        valid: false,
        message: '📧 Email address is required'
      };
    }

    if (!emailAddress.endsWith('@gmail.com')) {
      return {
        valid: false,
        message: '❌ Only Gmail addresses (@gmail.com) are allowed for user registration. Please use a valid Gmail account.'
      };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(emailAddress)) {
      return {
        valid: false,
        message: '❌ Invalid Gmail address format. Example: yourname@gmail.com'
      };
    }

    return {
      valid: true,
      message: '✅ Valid Gmail address'
    };
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return {
        valid: false,
        message: 'Password is required'
      };
    }

    if (password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        valid: false,
        message: 'Password must contain uppercase, lowercase, and numbers'
      };
    }

    return {
      valid: true,
      message: '✅ Password is strong'
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (generalError) {
      setGeneralError('');
    }

    if (name === 'email') {
      if (value) {
        const validation = validateEmail(value);
        setErrors(prev => ({
          ...prev,
          email: validation.valid ? '' : validation.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: ''
        }));
      }
    }

    if (name === 'password') {
      if (value) {
        const validation = validatePassword(value);
        setErrors(prev => ({
          ...prev,
          password: validation.valid ? '' : validation.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          password: ''
        }));
      }
    }

    if (name === 'confirmPassword' || name === 'password') {
      const pwd = name === 'password' ? value : formData.password;
      const confirm = name === 'confirmPassword' ? value : formData.confirmPassword;

      if (confirm && pwd && pwd !== confirm) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: '❌ Passwords do not match'
        }));
      } else if (confirm) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '❌ Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Registering user with Gmail:', formData.email);

      const response = await API.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'user'
      });

      console.log('✅ Registration successful:', response.data);

      const emailToShow = response.data.email || formData.email;
      setSuccessMessage('✅ Account created successfully! Please check your email to verify your account.');
      setRegisteredEmail(emailToShow);

      try {
        await router.push(`/verify-email?email=${encodeURIComponent(emailToShow)}`);
        return;
      } catch (routeError) {
        console.warn('Unable to navigate to confirmation page, using inline fallback:', routeError);
        setIsConfirmationPage(true);
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';

      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isConfirmationPage) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-card confirmation-card">
            <div className="confirmation-icon">✓</div>
            <h1>Check Your Email</h1>
            <p className="confirmation-text">
              We sent an activation link to <strong>{registeredEmail}</strong>.
              Please open your inbox and click the link to verify your account.
            </p>
            <div className="confirmation-tip">
              <strong>Tip:</strong> Activation links expire after 24 hours. Use it promptly.
            </div>
            <div className="confirmation-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push('/login')}
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Join TALEX using your Gmail account</p>
          </div>

          {generalError && (
            <div className="alert alert-error">
              <span>❌ {generalError}</span>
              <button
                onClick={() => setGeneralError('')}
                className="alert-close"
              >
                ✕
              </button>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                📧 Gmail Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="yourname@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => {
                  if (formData.email) {
                    const validation = validateEmail(formData.email);
                    if (!validation.valid) {
                      setErrors(prev => ({
                        ...prev,
                        email: validation.message
                      }));
                    }
                  }
                }}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                required
              />
              {errors.email && (
                <p className="field-error">{errors.email}</p>
              )}
              <p className="field-hint">
                ℹ️ Only Gmail addresses (@gmail.com) are accepted for user registration
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                👤 Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                required
              />
              {errors.name && (
                <p className="field-error">{errors.name}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                🔒 Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 8 characters (uppercase, lowercase, number)"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                required
              />
              {errors.password && (
                <p className="field-error">{errors.password}</p>
              )}
              <div className="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                    ✓ Uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
                    ✓ Lowercase letter (a-z)
                  </li>
                  <li className={/\d/.test(formData.password) ? 'met' : ''}>
                    ✓ Number (0-9)
                  </li>
                  <li className={formData.password.length >= 8 ? 'met' : ''}>
                    ✓ At least 8 characters
                  </li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                🔒 Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                required
              />
              {errors.confirmPassword && (
                <p className="field-error">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || Object.values(errors).some(e => e)}
              className="btn btn-primary btn-block"
            >
              {loading ? '⏳ Creating Account...' : '✅ Create Account'}
            </button>
          </form>

          <div className="login-link">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }

        .register-container {
          width: 100%;
          max-width: 450px;
        }

        .register-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
        }

        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .register-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin: 0 0 10px;
        }

        .register-header p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .alert {
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .alert-error {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c33;
        }

        .alert-success {
          background-color: #efe;
          border: 1px solid #cfc;
          color: #3c3;
        }

        .alert-close {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: inherit;
          padding: 0;
          width: 24px;
          height: 24px;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .form-input {
          padding: 12px 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.input-error {
          border-color: #ff6b6b;
          background-color: #fff5f5;
        }

        .field-error {
          font-size: 13px;
          color: #c33;
          margin: 0;
        }

        .field-hint {
          font-size: 12px;
          color: #999;
          margin: 0;
        }

        .password-requirements {
          font-size: 12px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 6px;
          margin-top: 8px;
        }

        .password-requirements p {
          margin: 0 0 8px;
          font-weight: 600;
          color: #666;
        }

        .password-requirements ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .password-requirements li {
          padding: 4px 0;
          color: #999;
          transition: color 0.3s;
        }

        .password-requirements li.met {
          color: #3c3;
          font-weight: 600;
        }

        .btn {
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-block {
          width: 100%;
        }

        .info-box {
          margin-top: 20px;
          padding: 12px;
          background-color: #fef3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          font-size: 13px;
          color: #856404;
        }

        .info-box p {
          margin: 0;
        }

        .login-link {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
        }

        .login-link a {
          color: #667eea;
          text-decoration: none;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        .confirmation-card {
          text-align: center;
          padding: 50px 35px;
        }

        .confirmation-icon {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background-color: #e6ffed;
          color: #2f855a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          margin: 0 auto 20px;
          border: 2px solid #9ae6b4;
        }

        .confirmation-card h1 {
          font-size: 28px;
          margin-bottom: 16px;
          color: #2d3748;
        }

        .confirmation-text {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 18px;
          line-height: 1.7;
        }

        .confirmation-tip {
          margin: 0 auto 28px;
          padding: 16px;
          max-width: 420px;
          background-color: #ebf8ff;
          border: 1px solid #bee3f8;
          border-radius: 10px;
          color: #2c5282;
          font-size: 14px;
        }

        .confirmation-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}

