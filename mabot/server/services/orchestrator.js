const supabase = require('../utils/supabase');
const { createFamilyNotification } = require('./notificationService');

const getFamilyMembers = async (family_id) => {
  const { data } = await supabase.from('users').select('id').eq('family_id', family_id);
  return (data || []).map(u => u.id);
};

const runTaskAgent = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const { data: tasks } = await supabase.from('tasks')
      .select('id, title, family_id').neq('status', 'completed')
      .eq('reminder_sent', false).gte('due_date', now.toISOString()).lte('due_date', in24h.toISOString());

    for (const task of tasks || []) {
      const memberIds = await getFamilyMembers(task.family_id);
      if (memberIds.length > 0) {
        await createFamilyNotification({ message: `⏰ Task "${task.title}" is due within 24 hours!`, type: 'task', severity: 'warning', family_id: task.family_id, member_ids: memberIds, ref_id: task.id });
        await supabase.from('tasks').update({ reminder_sent: true }).eq('id', task.id);
      }
    }
    console.log(`🤖 [TaskAgent] Processed ${(tasks || []).length} tasks`);
  } catch (err) { console.error('[TaskAgent] Error:', err.message); }
};

const runGroceryAgent = async () => {
  try {
    const { data: items } = await supabase.from('groceries')
      .select('id, item_name, quantity, unit, family_id, low_stock_threshold')
      .eq('purchased', false).eq('reminder_sent', false);

    for (const item of items || []) {
      if (item.quantity <= item.low_stock_threshold) {
        const memberIds = await getFamilyMembers(item.family_id);
        if (memberIds.length > 0) {
          await createFamilyNotification({ message: `🛒 "${item.item_name}" is running low (${item.quantity} ${item.unit} left)!`, type: 'grocery', severity: 'warning', family_id: item.family_id, member_ids: memberIds, ref_id: item.id });
          await supabase.from('groceries').update({ reminder_sent: true }).eq('id', item.id);
        }
      }
    }
    console.log(`🤖 [GroceryAgent] Processed ${(items || []).length} items`);
  } catch (err) { console.error('[GroceryAgent] Error:', err.message); }
};

const runFinanceAgent = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Auto-mark overdue
    await supabase.from('bills').update({ status: 'overdue' }).eq('status', 'unpaid').lt('due_date', now.toISOString());

    const { data: urgentBills } = await supabase.from('bills')
      .select('id, bill_name, amount, family_id').eq('status', 'unpaid')
      .eq('reminder_sent', false).gte('due_date', now.toISOString()).lte('due_date', in24h.toISOString());

    for (const bill of urgentBills || []) {
      const memberIds = await getFamilyMembers(bill.family_id);
      if (memberIds.length > 0) {
        await createFamilyNotification({ message: `🚨 Bill "${bill.bill_name}" (₹${bill.amount}) is due within 24 hours!`, type: 'bill', severity: 'urgent', family_id: bill.family_id, member_ids: memberIds, ref_id: bill.id });
        await supabase.from('bills').update({ reminder_sent: true }).eq('id', bill.id);
      }
    }
    console.log(`🤖 [FinanceAgent] Processed ${(urgentBills || []).length} bills`);
  } catch (err) { console.error('[FinanceAgent] Error:', err.message); }
};

const runServiceAgent = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const { data: services } = await supabase.from('services')
      .select('id, service_type, time, family_id').eq('status', 'scheduled')
      .gte('date', now.toISOString()).lte('date', in24h.toISOString());

    for (const svc of services || []) {
      const memberIds = await getFamilyMembers(svc.family_id);
      if (memberIds.length > 0) {
        await createFamilyNotification({ message: `🔧 Service "${svc.service_type}" is scheduled for tomorrow at ${svc.time}.`, type: 'service', severity: 'info', family_id: svc.family_id, member_ids: memberIds, ref_id: svc.id });
      }
    }
    console.log(`🤖 [ServiceAgent] Processed ${(services || []).length} services`);
  } catch (err) { console.error('[ServiceAgent] Error:', err.message); }
};

const runAgentOrchestration = async () => {
  console.log('🤖 Starting MaBot Agent Orchestration...');
  await runTaskAgent();
  await runGroceryAgent();
  await runFinanceAgent();
  await runServiceAgent();
  console.log('✅ Agent Orchestration Complete');
};

module.exports = { runAgentOrchestration };
