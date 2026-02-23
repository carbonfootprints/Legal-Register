import LegalRegister from '../../models/LegalRegister.js';
import User from '../../models/User.js';

describe('LegalRegister Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123456'
    });
  });

  describe('LegalRegister Creation', () => {
    it('should create a legal register successfully with valid data', async () => {
      // Use future dates to avoid auto-archive
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      const elevenMonthsFromNow = new Date();
      elevenMonthsFromNow.setMonth(elevenMonthsFromNow.getMonth() + 11);

      const registerData = {
        permit: 'Environmental Clearance',
        documentNo: 'EC-2024-001',
        issuingAuthority: 'State Pollution Control Board',
        dateOfIssue: new Date(),
        dateOfExpiry: oneYearFromNow,
        dueDateForRenewal: elevenMonthsFromNow,
        responsibility: 'Environment Manager',
        createdBy: testUser._id
      };

      const register = await LegalRegister.create(registerData);

      expect(register.permit).toBe(registerData.permit);
      expect(register.documentNo).toBe(registerData.documentNo);
      expect(register.issuingAuthority).toBe(registerData.issuingAuthority);
      expect(register.status).toBe('Active');
      expect(register.isArchived).toBe(false);
    });

    it('should auto-increment slNo for same user', async () => {
      const baseData = {
        permit: 'Test Permit',
        documentNo: 'DOC-001',
        issuingAuthority: 'Test Authority',
        dateOfIssue: new Date(),
        responsibility: 'Test Person',
        createdBy: testUser._id
      };

      const register1 = await LegalRegister.create({ ...baseData, documentNo: 'DOC-001' });
      const register2 = await LegalRegister.create({ ...baseData, documentNo: 'DOC-002' });

      expect(register1.slNo).toBe(1);
      expect(register2.slNo).toBe(2);
    });

    it('should fail without required fields', async () => {
      const registerData = {
        permit: 'Test Permit'
      };

      await expect(LegalRegister.create(registerData)).rejects.toThrow();
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate daysUntilRenewal correctly', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const register = await LegalRegister.create({
        permit: 'Test Permit',
        documentNo: 'DOC-003',
        issuingAuthority: 'Test Authority',
        dateOfIssue: new Date(),
        dueDateForRenewal: futureDate,
        responsibility: 'Test Person',
        createdBy: testUser._id
      });

      expect(register.daysUntilRenewal).toBeGreaterThanOrEqual(9);
      expect(register.daysUntilRenewal).toBeLessThanOrEqual(11);
    });
  });

  describe('Instance Methods', () => {
    it('should detect renewal due soon', async () => {
      const nearFuture = new Date();
      nearFuture.setDate(nearFuture.getDate() + 5);

      const register = await LegalRegister.create({
        permit: 'Test Permit',
        documentNo: 'DOC-004',
        issuingAuthority: 'Test Authority',
        dateOfIssue: new Date(),
        dueDateForRenewal: nearFuture,
        responsibility: 'Test Person',
        createdBy: testUser._id
      });

      expect(register.isRenewalDueSoon(7)).toBe(true);
      expect(register.isRenewalDueSoon(3)).toBe(false);
    });
  });

  describe('Status Values', () => {
    it('should accept valid status values', async () => {
      const validStatuses = ['Active', 'Expired', 'Pending Renewal', 'Cancelled'];

      for (const status of validStatuses) {
        const register = await LegalRegister.create({
          permit: `Test Permit ${status}`,
          documentNo: `DOC-${status}`,
          issuingAuthority: 'Test Authority',
          dateOfIssue: new Date(),
          responsibility: 'Test Person',
          status,
          createdBy: testUser._id
        });

        expect(register.status).toBe(status);
      }
    });
  });

  describe('Reporting Frequency', () => {
    it('should accept valid reporting frequencies', async () => {
      const validFrequencies = ['N/A', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly once'];

      for (const frequency of validFrequencies) {
        const register = await LegalRegister.create({
          permit: `Test Permit ${frequency}`,
          documentNo: `DOC-FREQ-${frequency}`,
          issuingAuthority: 'Test Authority',
          dateOfIssue: new Date(),
          responsibility: 'Test Person',
          reportingFrequency: frequency,
          createdBy: testUser._id
        });

        expect(register.reportingFrequency).toBe(frequency);
      }
    });
  });
});
