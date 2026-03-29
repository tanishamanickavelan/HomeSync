const supabase = require('../utils/supabase');

const getServices = async (req, res) => {
  try {
    let query = supabase.from('services')
      .select('*, booked_by_user:users(id,name,email)')
      .eq('family_id', req.user.family_id)
      .order('date', { ascending: true });
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data: services, error } = await query;
    if (error) throw error;
    res.json({ success: true, services: services || [] });
  } catch (e) {
    console.error('getServices error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
};

const createService = async (req, res) => {
  try {
    const { service_type, provider_name, date, time, notes, estimated_cost } = req.body;
    const { data: service, error } = await supabase.from('services').insert({
      service_type,
      provider_name: provider_name || null,
      date,
      time,
      notes: notes || null,
      estimated_cost: estimated_cost || null,
      status: 'scheduled',
      booked_by: req.user.id,
      family_id: req.user.family_id
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, message: 'Service booked!', service });
  } catch (e) {
    console.error('createService error:', e);
    res.status(500).json({ success: false, message: 'Failed to book service.' });
  }
};

const updateService = async (req, res) => {
  try {
    const { data: service, error } = await supabase.from('services')
      .update({ ...req.body, updated_at: new Date() })
      .eq('id', req.params.id)
      .eq('family_id', req.user.family_id)
      .select()
      .single();
    if (error) throw error;
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, message: 'Service updated!', service });
  } catch (e) {
    console.error('updateService error:', e);
    res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
};

const deleteService = async (req, res) => {
  try {
    const { error } = await supabase.from('services')
      .delete()
      .eq('id', req.params.id)
      .eq('family_id', req.user.family_id);
    if (error) throw error;
    res.json({ success: true, message: 'Service cancelled.' });
  } catch (e) {
    console.error('deleteService error:', e);
    res.status(500).json({ success: false, message: 'Failed to cancel service.' });
  }
};

module.exports = { getServices, createService, updateService, deleteService };