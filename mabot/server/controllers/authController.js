const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const supabase = require('../utils/supabase');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  family_id: user.family_id,
  phone: user.phone,
  preferences: user.preferences,
  family: user.families || null
});

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password, family_name, invite_code, city } = req.body;

  try {
    // Check email uniqueness
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    let family_id = null;
    let role = 'member';

    if (invite_code) {
      // Join existing family
      const { data: family } = await supabase.from('families').select('id').eq('invite_code', invite_code.toUpperCase()).single();
      if (!family) return res.status(400).json({ success: false, message: 'Invalid invite code.' });
      family_id = family.id;
    } else if (family_name) {
      // Create new family
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: family, error } = await supabase.from('families').insert({
        family_name, city, invite_code: code
      }).select().single();
      if (error) throw error;
      family_id = family.id;
      role = 'admin';
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: userErr } = await supabase.from('users').insert({
      name, email, password: hashed, family_id, role
    }).select().single();
    if (userErr) throw userErr;

    // Set family admin if creating new family
    if (role === 'admin' && family_id) {
      await supabase.from('families').update({ admin_id: user.id }).eq('id', family_id);
    }

    const token = generateToken(user.id);
    res.status(201).json({ success: true, message: 'Registration successful!', token, user: formatUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*, families(id, family_name, invite_code, city)')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = generateToken(user.id);
    res.json({ success: true, message: 'Login successful!', token, user: formatUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*, families(id, family_name, invite_code, city)')
      .eq('id', req.user.id)
      .single();
    res.json({ success: true, user: formatUser(user) });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  const { name, phone, preferences } = req.body;
  try {
    const { data: user } = await supabase
      .from('users')
      .update({ name, phone, preferences, updated_at: new Date() })
      .eq('id', req.user.id)
      .select('*, families(id, family_name, invite_code, city)')
      .single();
    res.json({ success: true, message: 'Profile updated!', user: formatUser(user) });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

/**
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const { data: user } = await supabase.from('users').select('password').eq('id', req.user.id).single();
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await supabase.from('users').update({ password: hashed }).eq('id', req.user.id);
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
