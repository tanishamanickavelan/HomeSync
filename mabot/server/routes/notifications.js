const express = require('express');
const { protect } = require('../middleware/auth');
const supabase = require('../utils/supabase');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { data: notifications } = await supabase.from('notifications')
      .select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(50);
    const unread = (notifications || []).filter(n => !n.read_status).length;
    res.json({ success: true, notifications: notifications || [], unread });
  } catch { res.status(500).json({ success: false }); }
});

router.put('/read-all', async (req, res) => {
  try {
    await supabase.from('notifications').update({ read_status: true, read_at: new Date() })
      .eq('user_id', req.user.id).eq('read_status', false);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch { res.status(500).json({ success: false }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    await supabase.from('notifications').update({ read_status: true, read_at: new Date() })
      .eq('id', req.params.id).eq('user_id', req.user.id);
    res.json({ success: true });
  } catch { res.status(500).json({ success: false }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await supabase.from('notifications').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    res.json({ success: true });
  } catch { res.status(500).json({ success: false }); }
});

module.exports = router;
