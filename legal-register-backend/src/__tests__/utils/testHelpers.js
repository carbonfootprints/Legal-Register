import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

// Create a test user
export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test@123456',
    companyName: 'Test Company'
  };

  return await User.create({ ...defaultUser, ...userData });
};

// Generate JWT token for a user
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: '1d'
  });
};

// Create authenticated user with token
export const createAuthenticatedUser = async (userData = {}) => {
  const user = await createTestUser(userData);
  const token = generateToken(user._id);
  return { user, token };
};
