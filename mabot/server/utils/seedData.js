/**
 * MaBot Seed Data Script (Supabase Edition)
 * Run: node utils/seedData.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./supabase');

const seed = async () => {
  console.log('🌱 Starting seed...');

  // Clear existing data in order
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('groceries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('families').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Cleared existing data');

  // Create family
  const { data: family, error: famErr } = await supabase.from('families').insert({
    family_name: 'The Sharma Family',
    invite_code: 'SHARMA',
    city: 'Chennai'
  }).select().single();
  if (famErr) { console.error('Family error:', famErr); process.exit(1); }
  console.log('✅ Created family');

  // Hash password once
  const password = await bcrypt.hash('password123', 12);

  // Create users
  const { data: ravi, error: raviErr } = await supabase.from('users').insert({
    name: 'Ravi Sharma', email: 'ravi@example.com', password,
    family_id: family.id, role: 'admin'
  }).select().single();
  if (raviErr) { console.error('User error:', raviErr); process.exit(1); }

  const { data: priya } = await supabase.from('users').insert({
    name: 'Priya Sharma', email: 'priya@example.com', password,
    family_id: family.id, role: 'member'
  }).select().single();

  // Set admin
  await supabase.from('families').update({ admin_id: ravi.id }).eq('id', family.id);
  console.log('✅ Created users');

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in3days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Tasks
  await supabase.from('tasks').insert([
    { title: 'Fix kitchen faucet', description: 'The faucet has been leaking for 3 days', assigned_to: ravi.id, due_date: tomorrow, priority: 'high', status: 'pending', created_by: priya.id, family_id: family.id },
    { title: 'Pay electricity bill', description: 'TNEB bill due', assigned_to: priya.id, due_date: in3days, priority: 'urgent', status: 'in_progress', created_by: ravi.id, family_id: family.id },
    { title: 'Grocery shopping', description: 'Weekly groceries from Big Bazaar', assigned_to: priya.id, due_date: tomorrow, priority: 'medium', status: 'pending', created_by: ravi.id, family_id: family.id },
    { title: 'Car service appointment', description: 'Maruti service center – 10k km service', assigned_to: ravi.id, due_date: in7days, priority: 'low', status: 'pending', created_by: ravi.id, family_id: family.id },
    { title: 'Kids school fees', description: 'Submit before 20th', assigned_to: priya.id, due_date: in3days, priority: 'high', status: 'completed', completed_at: now, created_by: priya.id, family_id: family.id }
  ]);
  console.log('✅ Created tasks');

  // Groceries
  await supabase.from('groceries').insert([
    { item_name: 'Aavin Milk', quantity: 2, unit: 'L', category: 'dairy', purchased: false, added_by: priya.id, family_id: family.id, low_stock_threshold: 1 },
    { item_name: 'Toor Dal', quantity: 1, unit: 'kg', category: 'grains', purchased: false, added_by: priya.id, family_id: family.id },
    { item_name: 'Tomatoes', quantity: 0.5, unit: 'kg', category: 'vegetables', purchased: false, added_by: ravi.id, family_id: family.id, low_stock_threshold: 1 },
    { item_name: 'Onions', quantity: 2, unit: 'kg', category: 'vegetables', purchased: false, added_by: priya.id, family_id: family.id },
    { item_name: 'Rice (Ponni)', quantity: 5, unit: 'kg', category: 'grains', purchased: false, added_by: priya.id, family_id: family.id },
    { item_name: 'Colgate Toothpaste', quantity: 1, unit: 'pcs', category: 'household_items', purchased: true, purchased_at: yesterday, added_by: ravi.id, family_id: family.id },
    { item_name: 'Biscuits (Parle-G)', quantity: 3, unit: 'pcs', category: 'snacks', purchased: false, added_by: ravi.id, family_id: family.id },
    { item_name: 'Coconut Oil', quantity: 1, unit: 'L', category: 'other', purchased: false, added_by: priya.id, family_id: family.id }
  ]);
  console.log('✅ Created groceries');

  // Bills
  await supabase.from('bills').insert([
    { bill_name: 'TNEB Electricity', amount: 1850, due_date: tomorrow, status: 'unpaid', category: 'electricity', recurring: true, recurring_cycle: 'monthly', created_by: ravi.id, family_id: family.id },
    { bill_name: 'Airtel Broadband', amount: 999, due_date: in3days, status: 'unpaid', category: 'internet', recurring: true, recurring_cycle: 'monthly', created_by: ravi.id, family_id: family.id },
    { bill_name: 'LIC Premium', amount: 12500, due_date: in7days, status: 'unpaid', category: 'insurance', recurring: true, recurring_cycle: 'quarterly', created_by: priya.id, family_id: family.id },
    { bill_name: 'Home Loan EMI', amount: 35000, due_date: in3days, status: 'unpaid', category: 'emi', recurring: true, recurring_cycle: 'monthly', created_by: ravi.id, family_id: family.id },
    { bill_name: 'Water Board', amount: 450, due_date: yesterday, status: 'overdue', category: 'water', created_by: priya.id, family_id: family.id },
    { bill_name: 'Jio Mobile', amount: 599, due_date: in7days, status: 'paid', paid_at: yesterday, paid_by: priya.id, category: 'phone', recurring: true, recurring_cycle: 'monthly', created_by: priya.id, family_id: family.id }
  ]);
  console.log('✅ Created bills');

  // Services
  await supabase.from('services').insert([
    { service_type: 'cleaning', provider_name: 'UrbanClap Cleaning', date: tomorrow, time: '10:00 AM', status: 'scheduled', estimated_cost: 799, booked_by: priya.id, family_id: family.id },
    { service_type: 'plumber', provider_name: 'Local Plumber – Murugan', date: in3days, time: '2:00 PM', status: 'scheduled', estimated_cost: 500, booked_by: ravi.id, family_id: family.id, notes: 'Kitchen faucet repair' },
    { service_type: 'maid', provider_name: 'Domestic Help – Lakshmi', date: yesterday, time: '7:00 AM', status: 'completed', actual_cost: 600, rating: 4, booked_by: priya.id, family_id: family.id }
  ]);
  console.log('✅ Created services');

  // Notifications
  await supabase.from('notifications').insert([
    { message: '🚨 Electricity bill ₹1,850 due tomorrow!', type: 'bill', severity: 'urgent', user_id: ravi.id, family_id: family.id, read_status: false },
    { message: '🛒 Toor Dal is running low. Add to shopping list!', type: 'grocery', severity: 'warning', user_id: priya.id, family_id: family.id, read_status: false },
    { message: '⏰ Task "Fix kitchen faucet" is due within 24 hours!', type: 'task', severity: 'warning', user_id: ravi.id, family_id: family.id, read_status: false },
    { message: '✅ Welcome to MaBot! Your household coordination platform is ready.', type: 'system', severity: 'info', user_id: ravi.id, family_id: family.id, read_status: true },
    { message: '✅ Welcome to MaBot, Priya! Manage your home smarter.', type: 'system', severity: 'info', user_id: priya.id, family_id: family.id, read_status: true }
  ]);
  console.log('✅ Created notifications');

  console.log(`
✅ Seed complete!

Test Accounts:
─────────────────────────────────────────
  Admin : ravi@example.com  / password123
  Member: priya@example.com / password123
─────────────────────────────────────────
Family Invite Code: SHARMA
  `);
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
