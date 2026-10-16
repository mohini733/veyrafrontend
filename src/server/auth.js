import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'veyra_chat_super_secure_jwt_secret_key_2026_modern';

export function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export function getAuthUserId(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  return decoded ? decoded.id : null;
}
