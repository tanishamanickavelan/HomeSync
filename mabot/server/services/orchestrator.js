const supabase = require('../utils/supabase');
const { createFamilyNotification } = require('./notificationService');
const { sendNotificationEmail } = require('./emailService'); // ADD THIS

// Helper to get family members WITH emails
const getFamilyMembers = async (family_id) => {
  const { data } = await supabase
    .from('users')
    .select('id, name, email')  // ADD email here
    .eq('family_id', family_id);
  return data || [];
};

// ─── Updated Task Agent ───────────────────────────────────
const runTaskAgent = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: tasks } = await supabase.from('tasks')
      .select('id, title, family_id')
      .neq('status', 'completed')
      .eq('reminder_sent', false)
      .gte('due_date', now.toISOString())
      .lte('due_date', in24h.toISOString());

    for (const task of tasks || []) {
      const members = await getFamilyMembers(task.family_id);
      const memberIds = members.map(m => m.id);

      if (members.length > 0) {
        const message = `⏰ Task "${task.title}" is due within 24 hours!`;

        // Create in-app notification (existing)
        await createFamilyNotification({
          message, type: 'task', severity: 'warning',
          family_id: task.family_id,
          member_ids: memberIds, ref_id: task.id
        });

        // Send email notification (NEW)
        await sendNotificationEmail({
          users: members,
          subject: `Task Due Soon: ${task.title}`,
          message,
          type: 'Task Reminder',
          severity: 'warning'
        });

        await supabase.from('tasks')
          .update({ reminder_sent: true }).eq('id', task.id);
      }
    }
    console.log(`🤖 [TaskAgent] Done`);
  } catch (err) {
    console.error('[TaskAgent] Error:', err.message);
  }
};

// ─── Updated Finance Agent ────────────────────────────────
const runFinanceAgent = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Auto mark overdue
    await supabase.from('bills').update({ status: 'overdue' })
      .eq('status', 'unpaid').lt('due_date', now.toISOString());

    const { data: urgentBills } = await supabase.from('bills')
      .select('id, bill_name, amount, family_id')
      .eq('status', 'unpaid').eq('reminder_sent', false)
      .gte('due_date', now.toISOString())
      .lte('due_date', in24h.toISOString());

    for (const bill of urgentBills || []) {
      const members = await getFamilyMembers(bill.family_id);
      const memberIds = members.map(m => m.id);

      if (members.length > 0) {
        const message = `🚨 Bill "${bill.bill_name}" (₹${bill.amount}) is due within 24 hours!`;

        // In-app notification (existing)
        await createFamilyNotification({
          message, type: 'bill', severity: 'urgent',
          family_id: bill.family_id,
          member_ids: memberIds, ref_id: bill.id
        });

        // Email notification (NEW)
        await sendNotificationEmail({
          users: members,
          subject: `Urgent: ${bill.bill_name} ₹${bill.amount} Due Tomorrow`,
          message,
          type: 'Bill Reminder',
          severity: 'urgent'
        });

        await supabase.from('bills')
          .update({ reminder_sent: true }).eq('id', bill.id);
      }
    }
    console.log(`🤖 [FinanceAgent] Done`);
  } catch (err) {
    console.error('[FinanceAgent] Error:', err.message);
  }
};

// ─── Updated Grocery Agent ────────────────────────────────
const runGroceryAgent = async () => {
  try {
    const { data: items } = await supabase.from('groceries')
      .select('id, item_name, quantity, unit, family_id, low_stock_threshold')
      .eq('purchased', false).eq('reminder_sent', false);

    for (const item of items || []) {
      if (item.quantity <= item.low_stock_threshold) {
        const members = await getFamilyMembers(item.family_id);
        const memberIds = members.map(m => m.id);

        if (members.length > 0) {
          const message = `🛒 "${item.item_name}" is running low (${item.quantity} ${item.unit} left)!`;

          await createFamilyNotification({
            message, type: 'grocery', severity: 'warning',
            family_id: item.family_id,
            member_ids: memberIds, ref_id: item.id
          });

          // Email notification (NEW)
          await sendNotificationEmail({
            users: members,
            subject: `Low Stock: ${item.item_name}`,
            message,
            type: 'Grocery Alert',
            severity: 'warning'
          });

          await supabase.from('groceries')
            .update({ reminder_sent: true }).eq('id', item.id);
        }
      }
    }
    console.log(`🤖 [GroceryAgent] Done`);
  } catch (err) {
    console.error('[GroceryAgent] Error:', err.message);
  }
};

// ─── Updated Service Agent ────────────────────────────────
const runServiceAgent = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: services } = await supabase.from('services')
      .select('id, service_type, time, family_id')
      .eq('status', 'scheduled')
      .gte('date', now.toISOString())
      .lte('date', in24h.toISOString());

    for (const svc of services || []) {
      const members = await getFamilyMembers(svc.family_id);
      const memberIds = members.map(m => m.id);

      if (members.length > 0) {
        const message = `🔧 "${svc.service_type}" service scheduled tomorrow at ${svc.time}`;

        await createFamilyNotification({
          message, type: 'service', severity: 'info',
          family_id: svc.family_id,
          member_ids: memberIds, ref_id: svc.id
        });

        // Email notification (NEW)
        await sendNotificationEmail({
          users: members,
          subject: `Service Tomorrow: ${svc.service_type} at ${svc.time}`,
          message,
          type: 'Service Reminder',
          severity: 'info'
        });
      }
    }
    console.log(`🤖 [ServiceAgent] Done`);
  } catch (err) {
    console.error('[ServiceAgent] Error:', err.message);
  }
};

// ─── Master Orchestrator ──────────────────────────────────
const runAgentOrchestration = async () => {
  console.log('🤖 Starting Agent Orchestration...');
  await runTaskAgent();
  await runGroceryAgent();
  await runFinanceAgent();
  await runServiceAgent();
  console.log('✅ Orchestration Complete');
};

module.exports = { runAgentOrchestration };