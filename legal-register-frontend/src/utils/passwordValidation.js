// Password validation rules
export const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < passwordRules.minLength) {
    errors.push(`At least ${passwordRules.minLength} characters`);
  }

  if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }

  if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter');
  }

  if (passwordRules.requireNumber && !/\d/.test(password)) {
    errors.push('At least one number');
  }

  if (passwordRules.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('At least one special character (!@#$%^&*...)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get password strength level (0-4)
export const getPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  return Math.min(strength, 4);
};

// Get strength label and color
export const getStrengthInfo = (strength) => {
  const levels = [
    { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-500' },
    { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    { label: 'Good', color: 'bg-lime-500', textColor: 'text-lime-500' },
    { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' },
  ];

  return levels[strength] || levels[0];
};
