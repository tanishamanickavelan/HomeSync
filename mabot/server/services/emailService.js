const nodemailer = require('nodemailer');

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

/**
 * Send email to one user
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return false;
  }
};

/**
 * Send notification email to multiple users
 */
const sendNotificationEmail = async ({ users, subject, message, type, severity }) => {
  const severityColors = {
    urgent:  '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
    info:    '#14b8a6'
  };

  const severityIcons = {
    urgent:  '🚨',
    warning: '⚠️',
    success: '✅',
    info:    'ℹ️'
  };

  const color = severityColors[severity] || '#14b8a6';
  const icon = severityIcons[severity] || 'ℹ️';

  // HTML email template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0; padding:0; background:#0f172a; font-family:'Segoe UI',Arial,sans-serif;">
      
      <div style="max-width:560px; margin:40px auto; background:#1e293b; border-radius:16px; overflow:hidden; border:1px solid #334155;">
        
        <!-- Header -->
        <div style="background:${color}; padding:24px 32px;">
          <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:700;">
            ${icon} HomeSync Alert
          </h1>
          <p style="margin:4px 0 0; color:rgba(255,255,255,0.85); font-size:13px;">
            Household Coordination Platform
          </p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          
          <!-- Message Box -->
          <div style="background:#0f172a; border-left:4px solid ${color}; border-radius:8px; padding:16px 20px; margin-bottom:24px;">
            <p style="margin:0; color:#f1f5f9; font-size:16px; line-height:1.6;">
              ${message}
            </p>
          </div>

          <!-- Type Badge -->
          <div style="margin-bottom:24px;">
            <span style="background:${color}20; color:${color}; border:1px solid ${color}40; 
                         padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; 
                         text-transform:uppercase; letter-spacing:0.5px;">
              ${type}
            </span>
          </div>

          <!-- CTA Button -->
          <a href="http://localhost:3000/dashboard" 
             style="display:inline-block; background:${color}; color:#ffffff; 
                    padding:12px 24px; border-radius:8px; text-decoration:none; 
                    font-size:14px; font-weight:600; margin-bottom:24px;">
            Open HomeSync Dashboard →
          </a>

          <!-- Divider -->
          <hr style="border:none; border-top:1px solid #334155; margin:24px 0;">

          <!-- Footer -->
          <p style="margin:0; color:#64748b; font-size:12px; line-height:1.6;">
            This is an automated alert from HomeSync.<br>
            Your household coordination platform.<br>
            <em>Sent by HomeSync Agent Orchestrator</em>
          </p>

        </div>

      </div>

    </body>
    </html>
  `;

  // Send to all users
  const results = await Promise.all(
    users.map(user =>
      sendEmail({
        to: user.email,
        subject: `${icon} ${subject}`,
        html
      })
    )
  );

  return results;
};

module.exports = { sendEmail, sendNotificationEmail };