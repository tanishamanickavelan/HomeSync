const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

/**
 * Middleware: Protect routes — verify JWT token
 */
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    const { data: user, error } = await supabase
      .from('users')
      .select('*, families(id, family_name, invite_code, city)')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Flatten family info
    req.user = {
      ...user,
      family_id: user.families ? user.family_id : null,
      family: user.families || null
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

const requireFamily = (req, res, next) => {
  if (!req.user.family_id) {
    return res.status(400).json({
      success: false,
      message: 'You must be part of a family to access this feature.'
    });
  }
  next();
};

module.exports = { protect, adminOnly, requireFamily };
