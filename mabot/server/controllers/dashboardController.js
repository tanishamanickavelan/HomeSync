const supabase = require('../utils/supabase');

const getDashboard = async (req, res) => {
  try {
    const family_id = req.user.family_id;
    if (!family_id) return res.json({ success: true, data: null, message: 'No family linked.' });

    const now = new Date();
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      { data: tasksDueToday },
      { data: allTasks },
      { data: pendingBills },
      { data: groceryNeeded },
      { data: upcomingServices },
      { data: recentNotifications },
      { data: familyMembers }
    ] = await Promise.all([
      supabase.from('tasks').select('*, assigned_user:users!tasks_assigned_to_fkey(id,name)')
        .eq('family_id', family_id).neq('status', 'completed')
        .gte('due_date', todayStart.toISOString()).lte('due_date', todayEnd.toISOString()).limit(5),

      supabase.from('tasks').select('status, due_date').eq('family_id', family_id),

      supabase.from('bills').select('*')
        .eq('family_id', family_id).in('status', ['unpaid', 'overdue'])
        .lte('due_date', next7Days.toISOString()).order('due_date').limit(5),

      supabase.from('groceries').select('*, added_by_user:users!groceries_added_by_fkey(id,name)')
        .eq('family_id', family_id).eq('purchased', false).limit(10),

      supabase.from('services').select('*, booked_by_user:users!services_booked_by_fkey(id,name)')
        .eq('family_id', family_id).in('status', ['scheduled','confirmed'])
        .gte('date', now.toISOString()).order('date').limit(5),

      supabase.from('notifications').select('*')
        .eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(10),

      supabase.from('users').select('id, name, email, role').eq('family_id', family_id)
    ]);

    const taskSummary = {
      pending: (allTasks || []).filter(t => t.status === 'pending').length,
      in_progress: (allTasks || []).filter(t => t.status === 'in_progress').length,
      completed: (allTasks || []).filter(t => t.status === 'completed').length,
    };

    const overdueTaskCount = (allTasks || []).filter(t =>
      t.due_date && new Date(t.due_date) < todayStart && t.status !== 'completed'
    ).length;

    const totalUnpaidBills = (pendingBills || []).reduce((s, b) => s + Number(b.amount), 0);
    const unreadNotifications = (recentNotifications || []).filter(n => !n.read_status).length;

    res.json({
      success: true,
      data: {
        tasksDueToday: tasksDueToday || [],
        overdueTaskCount,
        pendingBills: pendingBills || [],
        groceryNeeded: groceryNeeded || [],
        upcomingServices: upcomingServices || [],
        recentNotifications: recentNotifications || [],
        familyMembers: familyMembers || [],
        taskSummary,
        totalUnpaidBills,
        unreadNotifications
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
};

module.exports = { getDashboard };
