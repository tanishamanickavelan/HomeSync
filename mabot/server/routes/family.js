const express = require('express');
const { protect } = require('../middleware/auth');
const supabase = require('../utils/supabase');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    if (!req.user.family_id) return res.json({ success: true, family: null });
    const { data: family } = await supabase.from('families').select('*, members:users(id,name,email,role)')
      .eq('id', req.user.family_id).single();
    res.json({ success: true, family });
  } catch { res.status(500).json({ success: false, message: 'Error fetching family.' }); }
});

router.put('/', protect, async (req, res) => {
  try {
    const { data: family } = await supabase.from('families').update(req.body)
      .eq('id', req.user.family_id).select().single();
    res.json({ success: true, family });
  } catch { res.status(500).json({ success: false, message: 'Error updating family.' }); }
});

router.post('/join', protect, async (req, res) => {
  try {
    const { invite_code } = req.body;
    const { data: family } = await supabase.from('families').select('id')
      .eq('invite_code', invite_code.toUpperCase()).single();
    if (!family) return res.status(404).json({ success: false, message: 'Invalid invite code.' });
    await supabase.from('users').update({ family_id: family.id }).eq('id', req.user.id);
    res.json({ success: true, message: 'Joined family!', family });
  } catch { res.status(500).json({ success: false, message: 'Error joining family.' }); }
});

router.delete('/members/:userId', protect, async (req, res) => {
  try {
    await supabase.from('users').update({ family_id: null }).eq('id', req.params.userId)
      .eq('family_id', req.user.family_id);
    res.json({ success: true, message: 'Member removed.' });
  } catch { res.status(500).json({ success: false, message: 'Error removing member.' }); }
});

module.exports = router;
