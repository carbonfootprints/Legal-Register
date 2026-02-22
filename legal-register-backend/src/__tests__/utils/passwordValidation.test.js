// Password validation tests
describe('Password Validation', () => {
  // Inline validation function (matches authController)
  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  describe('Valid Passwords', () => {
    it('should accept a valid password with all requirements', () => {
      const result = validatePassword('Test@123456');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept password with various special characters', () => {
      const passwords = ['Test@123', 'Test!123', 'Test#123', 'Test$123', 'Test%123'];
      passwords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Invalid Passwords', () => {
    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Te@1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('test@123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('TEST@123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePassword('Test@abcdef');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('Test123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for password missing multiple requirements', () => {
      const result = validatePassword('test');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
