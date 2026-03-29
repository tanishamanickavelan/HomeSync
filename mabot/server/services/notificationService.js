const supabase = require('../utils/supabase');

const createNotification = async ({ message, type, severity = 'info', user_id, family_id, ref_id, action_url }) => {
  try {
    const { data, error } = await supabase.from('notifications').insert({
      message, type, severity, user_id, family_id, ref_id: ref_id || null,
      action_url: action_url || null, read_status: false
    }).select().single();
    return data;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

const createFamilyNotification = async ({ message, type, severity = 'info', family_id, member_ids, ref_id }) => {
  try {
    const notifications = member_ids.map(user_id => ({
      message, type, severity, user_id, family_id, ref_id: ref_id || null, read_status: false
    }));
    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Failed to create family notifications:', error.message);
  }
};

module.exports = { createNotification, createFamilyNotification };
