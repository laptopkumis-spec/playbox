const jwt  = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Token is missing.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized. Token is invalid or expired.' });
  }

  // Re-verify user existence and role from DB on every request.
  // This ensures revoked/role-changed users cannot continue using old tokens.
  try {
    const [rows] = await pool.query(
      'SELECT id, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Unauthorized. User no longer exists.' });
    }

    // Use role from DB — never trust the role embedded in the JWT payload
    req.user = {
      id:   rows[0].id,
      role: rows[0].role,
    };

    next();
  } catch (dbErr) {
    console.error('[authenticateToken] DB error:', dbErr.message);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

const isAdmin = (req, res, next) => {
  // req.user.role is always sourced from DB (set in authenticateToken above)
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
};

module.exports = { authenticateToken, isAdmin };
