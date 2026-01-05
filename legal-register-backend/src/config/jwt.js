// Export getter functions to ensure process.env is loaded
export const getSecret = () => process.env.JWT_SECRET;
export const getExpiresIn = () => process.env.JWT_EXPIRE || '7d';

// For backward compatibility, also export as properties
export const secret = process.env.JWT_SECRET;
export const expiresIn = process.env.JWT_EXPIRE || '7d';
