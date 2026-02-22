import { describe, it, expect } from 'vitest';
import { validatePassword, getPasswordStrength, getStrengthInfo } from '../../utils/passwordValidation';

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const result = validatePassword('Test@123456');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short password', () => {
      const result = validatePassword('Te@1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('test@123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('TEST@123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePassword('Test@abcdef');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one number');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('Test123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one special character (!@#$%^&*...)');
    });
  });

  describe('getPasswordStrength', () => {
    it('should return 0 for empty password', () => {
      expect(getPasswordStrength('')).toBe(0);
    });

    it('should return low strength for weak password', () => {
      expect(getPasswordStrength('abc')).toBeLessThan(2);
    });

    it('should return high strength for strong password', () => {
      expect(getPasswordStrength('Test@123456789')).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getStrengthInfo', () => {
    it('should return Very Weak for strength 0', () => {
      const info = getStrengthInfo(0);
      expect(info.label).toBe('Very Weak');
    });

    it('should return Strong for strength 4', () => {
      const info = getStrengthInfo(4);
      expect(info.label).toBe('Strong');
    });

    it('should return correct colors', () => {
      const weak = getStrengthInfo(0);
      const strong = getStrengthInfo(4);

      expect(weak.color).toContain('red');
      expect(strong.color).toContain('green');
    });
  });
});
