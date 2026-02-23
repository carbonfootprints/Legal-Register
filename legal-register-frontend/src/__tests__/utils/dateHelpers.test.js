import { describe, it, expect } from 'vitest';
import { formatDate, getDaysUntilRenewal, getStatusBadgeClass, getRenewalUrgencyBadge } from '../../utils/dateHelpers';

describe('Date Helpers', () => {
  describe('formatDate', () => {
    it('should return N/A for null date', () => {
      expect(formatDate(null)).toBe('N/A');
    });

    it('should return N/A for undefined date', () => {
      expect(formatDate(undefined)).toBe('N/A');
    });

    it('should format valid date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should format Date object', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDate(date);
      expect(result).toContain('15');
      expect(result).toContain('01');
      expect(result).toContain('2024');
    });
  });

  describe('getDaysUntilRenewal', () => {
    it('should return null for null date', () => {
      expect(getDaysUntilRenewal(null)).toBeNull();
    });

    it('should return positive days for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const result = getDaysUntilRenewal(futureDate.toISOString());
      expect(result).toBeGreaterThan(0);
    });

    it('should return negative days for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const result = getDaysUntilRenewal(pastDate.toISOString());
      expect(result).toBeLessThan(0);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const result = getDaysUntilRenewal(today.toISOString());
      expect(Math.abs(result)).toBeLessThanOrEqual(1);
    });
  });

  describe('getStatusBadgeClass', () => {
    it('should return green class for Active status', () => {
      const result = getStatusBadgeClass('Active');
      expect(result).toContain('green');
    });

    it('should return red class for Expired status', () => {
      const result = getStatusBadgeClass('Expired');
      expect(result).toContain('red');
    });

    it('should return yellow class for Pending Renewal status', () => {
      const result = getStatusBadgeClass('Pending Renewal');
      expect(result).toContain('yellow');
    });

    it('should return gray class for unknown status', () => {
      const result = getStatusBadgeClass('Unknown');
      expect(result).toContain('gray');
    });
  });

  describe('getRenewalUrgencyBadge', () => {
    it('should return overdue badge for negative days', () => {
      const result = getRenewalUrgencyBadge(-5);
      expect(result.label).toBe('Overdue');
      expect(result.class).toContain('red');
    });

    it('should return due today badge for 0 days', () => {
      const result = getRenewalUrgencyBadge(0);
      expect(result.label).toContain('Today');
      expect(result.class).toContain('red');
    });

    it('should return orange badge for 2 days', () => {
      const result = getRenewalUrgencyBadge(2);
      expect(result.class).toContain('orange');
    });

    it('should return yellow badge for days <= 7 and > 2', () => {
      const result = getRenewalUrgencyBadge(5);
      expect(result.class).toContain('yellow');
    });

    it('should return green badge for days > 7', () => {
      const result = getRenewalUrgencyBadge(10);
      expect(result.class).toContain('green');
    });
  });
});
