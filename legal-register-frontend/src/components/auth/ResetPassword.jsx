import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import authService from '../../services/authService';
import { validatePassword, getPasswordStrength, getStrengthInfo } from '../../utils/passwordValidation';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Password validation
  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthInfo = useMemo(() => getStrengthInfo(passwordStrength), [passwordStrength]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setResetSuccess(true);
      toast.success('Password reset successful!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. The link may be expired.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/90 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-green-100 text-center">
            <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mb-6 shadow-lg">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Password Reset!
            </h1>
            <p className="text-gray-600 mb-8">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/90 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-green-100">
          <div className="text-center mb-10">
            <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mb-6 shadow-lg">
              <span className="text-5xl">🔑</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm">
              Create a new strong password for your account
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none block w-full px-4 py-3 pr-12 border border-green-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-white/50"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          index < passwordStrength ? strengthInfo.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthInfo.textColor}`}>
                    {strengthInfo.label}
                  </p>

                  {/* Password Requirements */}
                  <div className="mt-2 space-y-1">
                    {[
                      { test: password.length >= 8, label: 'At least 8 characters' },
                      { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
                      { test: /[a-z]/.test(password), label: 'One lowercase letter' },
                      { test: /\d/.test(password), label: 'One number' },
                      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: 'One special character' },
                    ].map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        {req.test ? (
                          <FiCheck className="text-green-500 mr-1" size={12} />
                        ) : (
                          <FiX className="text-gray-400 mr-1" size={12} />
                        )}
                        <span className={req.test ? 'text-green-600' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="appearance-none block w-full px-4 py-3 pr-12 border border-green-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-white/50"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-green-500 text-xs mt-1 flex items-center">
                  <FiCheck className="mr-1" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordValidation.isValid || password !== confirmPassword}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="text-center pt-6">
            <Link to="/login" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
