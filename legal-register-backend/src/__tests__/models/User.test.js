import User from '../../models/User.js';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user successfully with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@123456',
        companyName: 'Test Company'
      };

      const user = await User.create(userData);

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.companyName).toBe(userData.companyName);
      expect(user.role).toBe('user');
      expect(user.isActive).toBe(true);
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test2@example.com',
        password: 'Test@123456'
      };

      const user = await User.create(userData);
      const userWithPassword = await User.findById(user._id).select('+password');

      expect(userWithPassword.password).not.toBe(userData.password);
      expect(userWithPassword.password).toMatch(/^\$2[ab]\$/);
    });

    it('should fail without required fields', async () => {
      const userData = {
        name: 'Test User'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with invalid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Test@123456'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'Test@123456'
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Password Comparison', () => {
    it('should return true for correct password', async () => {
      const password = 'Test@123456';
      const user = await User.create({
        name: 'Test User',
        email: 'password@example.com',
        password
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword(password);

      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'password2@example.com',
        password: 'Test@123456'
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('WrongPassword');

      expect(isMatch).toBe(false);
    });
  });

  describe('Password Reset Token', () => {
    it('should generate reset token', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'reset@example.com',
        password: 'Test@123456'
      });

      const resetToken = user.getResetPasswordToken();

      expect(resetToken).toBeDefined();
      expect(typeof resetToken).toBe('string');
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpire).toBeDefined();
    });
  });
});
