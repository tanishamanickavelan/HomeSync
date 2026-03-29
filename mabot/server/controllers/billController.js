const supabase = require('../utils/supabase');

const getBills = async (req, res) => {
  try {
    // Auto-mark overdue
    await supabase.from('bills')
      .update({ status: 'overdue' })
      .eq('family_id', req.user.family_id)
      .eq('status', 'unpaid')
      .lt('due_date', new Date().toISOString());

    let query = supabase.from('bills')
      .select('*')
      .eq('family_id', req.user.family_id)
      .order('due_date', { ascending: true });

    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.category) query = query.eq('category', req.query.category);

    const { data: bills, error } = await query;
    if (error) throw error;
    res.json({ success: true, bills: bills || [] });
  } catch (e) {
    console.error('getBills error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch bills.' });
  }
};

const createBill = async (req, res) => {
  try {
    const { bill_name, amount, due_date, category, recurring, recurring_cycle, notes } = req.body;
    const { data: bill, error } = await supabase.from('bills').insert({
      bill_name, amount, due_date,
      category: category || 'other',
      recurring: recurring || false,
      recurring_cycle: recurring_cycle || null,
      notes: notes || null,
      status: 'unpaid',
      created_by: req.user.id,
      family_id: req.user.family_id
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, message: 'Bill added!', bill });
  } catch (e) {
    console.error('createBill error:', e);
    res.status(500).json({ success: false, message: 'Failed to add bill.' });
  }
};

const updateBill = async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date() };
    if (req.body.status === 'paid') {
      updates.paid_at = new Date();
      updates.paid_by = req.user.id;
    }
    const { data: bill, error } = await supabase.from('bills')
      .update(updates)
      .eq('id', req.params.id)
      .eq('family_id', req.user.family_id)
      .select()
      .single();
    if (error) throw error;
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });
    res.json({ success: true, message: 'Bill updated!', bill });
  } catch (e) {
    console.error('updateBill error:', e);
    res.status(500).json({ success: false, message: 'Failed to update bill.' });
  }
};

const deleteBill = async (req, res) => {
  try {
    const { error } = await supabase.from('bills')
      .delete()
      .eq('id', req.params.id)
      .eq('family_id', req.user.family_id);
    if (error) throw error;
    res.json({ success: true, message: 'Bill deleted.' });
  } catch (e) {
    console.error('deleteBill error:', e);
    res.status(500).json({ success: false, message: 'Failed to delete bill.' });
  }
};

const getBillStats = async (req, res) => {
  try {
    const { data: bills } = await supabase.from('bills')
      .select('status, amount')
      .eq('family_id', req.user.family_id);
    const stats = {
      unpaid: bills.filter(b => b.status === 'unpaid').length,
      paid: bills.filter(b => b.status === 'paid').length,
      overdue: bills.filter(b => b.status === 'overdue').length,
      totalUnpaidAmount: bills
        .filter(b => ['unpaid', 'overdue'].includes(b.status))
        .reduce((s, b) => s + Number(b.amount), 0)
    };
    res.json({ success: true, stats });
  } catch (e) {
    console.error('getBillStats error:', e);
    res.status(500).json({ success: false, message: 'Failed to get stats.' });
  }
};

module.exports = { getBills, createBill, updateBill, deleteBill, getBillStats };