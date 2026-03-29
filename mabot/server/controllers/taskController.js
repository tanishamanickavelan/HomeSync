const supabase = require('../utils/supabase');
const { createNotification } = require('../services/notificationService');

const getTasks = async (req, res) => {
  try {
    const { status, priority, assigned_to } = req.query;
    let query = supabase
      .from('tasks')
      .select('*, assigned_user:users!tasks_assigned_to_fkey(id,name,email), creator:users!tasks_created_by_fkey(id,name,email)')
      .eq('family_id', req.user.family_id)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (assigned_to) query = query.eq('assigned_to', assigned_to);

    const { data: tasks, error } = await query;
    if (error) throw error;
    res.json({ success: true, tasks: tasks || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, due_date, priority, tags } = req.body;
    const { data: task, error } = await supabase.from('tasks').insert({
      title, description,
      assigned_to: assigned_to || null,
      due_date: due_date || null,
      priority: priority || 'medium',
      tags: tags || [],
      created_by: req.user.id,
      family_id: req.user.family_id,
      status: 'pending'
    }).select('*, assigned_user:users!tasks_assigned_to_fkey(id,name,email), creator:users!tasks_created_by_fkey(id,name,email)').single();

    if (error) throw error;

    if (assigned_to && assigned_to !== req.user.id) {
      await createNotification({
        message: `New task assigned to you: "${title}"`,
        type: 'task', severity: 'info',
        user_id: assigned_to, family_id: req.user.family_id, ref_id: task.id
      });
    }

    res.status(201).json({ success: true, message: 'Task created!', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date() };
    if (req.body.status === 'completed') updates.completed_at = new Date();

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', req.params.id)
      .eq('family_id', req.user.family_id)
      .select('*, assigned_user:users!tasks_assigned_to_fkey(id,name,email), creator:users!tasks_created_by_fkey(id,name,email)')
      .single();

    if (error) throw error;
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (req.body.status === 'completed') {
      await createNotification({
        message: `Task "${task.title}" has been completed! ✅`,
        type: 'task', severity: 'success',
        user_id: task.created_by, family_id: req.user.family_id, ref_id: task.id
      });
    }

    res.json({ success: true, message: 'Task updated!', task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { error } = await supabase.from('tasks')
      .delete().eq('id', req.params.id).eq('family_id', req.user.family_id);
    if (error) throw error;
    res.json({ success: true, message: 'Task deleted.' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const { data: tasks } = await supabase.from('tasks')
      .select('status, priority, due_date').eq('family_id', req.user.family_id);

    const now = new Date();
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      dueToday: tasks.filter(t => t.due_date && new Date(t.due_date) >= todayStart && new Date(t.due_date) <= todayEnd && t.status !== 'completed').length,
      overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < todayStart && t.status !== 'completed').length
    };

    res.json({ success: true, stats });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to get stats.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getTaskStats };
