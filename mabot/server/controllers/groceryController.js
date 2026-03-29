const supabase = require('../utils/supabase');

const getGroceries = async (req, res) => {
  try {
    const { purchased, category } = req.query;
    let query = supabase.from('groceries')
      .select('*, added_by_user:users!groceries_added_by_fkey(id,name,email)')
      .eq('family_id', req.user.family_id)
      .order('purchased', { ascending: true })
      .order('created_at', { ascending: false });

    if (purchased !== undefined) query = query.eq('purchased', purchased === 'true');
    if (category) query = query.eq('category', category);

    const { data: groceries, error } = await query;
    if (error) throw error;
    res.json({ success: true, groceries: groceries || [] });
  } catch { res.status(500).json({ success: false, message: 'Failed to fetch groceries.' }); }
};

const createGrocery = async (req, res) => {
  try {
    const { item_name, quantity, unit, category, notes, low_stock_threshold } = req.body;
    const { data: grocery, error } = await supabase.from('groceries').insert({
      item_name, quantity, unit: unit || 'pcs', category: category || 'other',
      notes, low_stock_threshold: low_stock_threshold || 1,
      added_by: req.user.id, family_id: req.user.family_id, purchased: false
    }).select('*, added_by_user:users!groceries_added_by_fkey(id,name,email)').single();
    if (error) throw error;
    res.status(201).json({ success: true, message: 'Item added!', grocery });
  } catch { res.status(500).json({ success: false, message: 'Failed to add item.' }); }
};

const updateGrocery = async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date() };
    if (req.body.purchased === true) updates.purchased_at = new Date();
    const { data: grocery, error } = await supabase.from('groceries')
      .update(updates).eq('id', req.params.id).eq('family_id', req.user.family_id)
      .select('*, added_by_user:users!groceries_added_by_fkey(id,name,email)').single();
    if (error) throw error;
    res.json({ success: true, message: 'Item updated!', grocery });
  } catch { res.status(500).json({ success: false, message: 'Failed to update item.' }); }
};

const deleteGrocery = async (req, res) => {
  try {
    const { error } = await supabase.from('groceries')
      .delete().eq('id', req.params.id).eq('family_id', req.user.family_id);
    if (error) throw error;
    res.json({ success: true, message: 'Item deleted.' });
  } catch { res.status(500).json({ success: false, message: 'Failed to delete item.' }); }
};

const markAllPurchased = async (req, res) => {
  try {
    const { error } = await supabase.from('groceries')
      .update({ purchased: true, purchased_at: new Date() })
      .eq('family_id', req.user.family_id).eq('purchased', false);
    if (error) throw error;
    res.json({ success: true, message: 'All items marked as purchased!' });
  } catch { res.status(500).json({ success: false, message: 'Failed to update items.' }); }
};

const getGroceryStats = async (req, res) => {
  try {
    const { data: groceries } = await supabase.from('groceries')
      .select('purchased, category').eq('family_id', req.user.family_id);
    const total = groceries.length;
    const purchased = groceries.filter(g => g.purchased).length;
    const pending = total - purchased;
    const byCategory = groceries.filter(g => !g.purchased).reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1; return acc;
    }, {});
    res.json({ success: true, stats: { total, pending, purchased, byCategory } });
  } catch { res.status(500).json({ success: false, message: 'Failed to get stats.' }); }
};

module.exports = { getGroceries, createGrocery, updateGrocery, deleteGrocery, markAllPurchased, getGroceryStats };
