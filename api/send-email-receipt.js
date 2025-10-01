import nodemailer from 'nodemailer';
import { createClient } from '@libsql/client';

// Initialize Turso client
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create email transporter
function createTransporter(smtpConfig) {
  return nodemailer.createTransporter({
    host: smtpConfig.smtp_server,
    port: smtpConfig.smtp_port || 587,
    secure: false, // Use TLS
    auth: {
      user: smtpConfig.smtp_username,
      pass: smtpConfig.smtp_password,
    },
  });
}

// Generate receipt HTML
function generateReceiptHTML(fine, employee, violation, settings) {
  const receiptDate = new Date().toLocaleDateString();
  const fineDate = new Date(fine.fine_date).toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Fine Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .receipt-container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #e74c3c; padding-bottom: 20px; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 5px; }
        .receipt-title { font-size: 18px; color: #7f8c8d; }
        .receipt-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .label { font-weight: bold; }
        .amount { font-size: 24px; font-weight: bold; color: #e74c3c; text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="company-name">${settings.company_name || 'ThexSol Fine Management'}</div>
          <div class="receipt-title">Fine Receipt</div>
        </div>
        
        <div class="receipt-info">
          <div class="info-row">
            <span class="label">Receipt Date:</span>
            <span>${receiptDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Employee:</span>
            <span>${employee.name}</span>
          </div>
          <div class="info-row">
            <span class="label">Employee ID:</span>
            <span>${employee.employee_id || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Violation:</span>
            <span>${violation.name}</span>
          </div>
          <div class="info-row">
            <span class="label">Fine Date:</span>
            <span>${fineDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Reason:</span>
            <span>${fine.reason}</span>
          </div>
          ${fine.notes ? `
          <div class="info-row">
            <span class="label">Notes:</span>
            <span>${fine.notes}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="amount">
          Fine Amount: $${parseFloat(fine.amount).toFixed(2)}
        </div>
        
        <div class="footer">
          ${settings.email_signature || 'Best regards,<br>ThexSol Fine Management System'}
          <br><br>
          <small>This is an automated receipt. Please contact ${settings.admin_email || 'admin'} if you have any questions.</small>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fineId } = req.query;

    if (!fineId) {
      return res.status(400).json({ error: 'Fine ID is required' });
    }

    // Get fine details with employee and violation info
    const fine = await turso.execute({
      sql: `
        SELECT f.*, e.name as employee_name, e.email as employee_email, e.employee_id,
               vt.name as violation_name
        FROM fines f
        JOIN employees e ON f.employee_id = e.id
        JOIN violation_types vt ON f.violation_type_id = vt.id
        WHERE f.id = ?
      `,
      args: [fineId]
    });

    if (fine.rows.length === 0) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    const fineData = fine.rows[0];

    if (!fineData.employee_email) {
      return res.status(400).json({ error: 'Employee email not found' });
    }

    // Get admin settings for SMTP configuration
    const settingsResult = await turso.execute({
      sql: 'SELECT * FROM admin_settings WHERE id = 1',
      args: []
    });

    const settings = settingsResult.rows[0] || {};

    if (!settings.smtp_server || !settings.smtp_username || !settings.smtp_password) {
      return res.status(400).json({ error: 'SMTP configuration not complete. Please configure email settings in Admin Settings.' });
    }

    // Create email transporter
    const transporter = createTransporter(settings);

    // Prepare email data
    const employee = {
      name: fineData.employee_name,
      email: fineData.employee_email,
      employee_id: fineData.employee_id
    };

    const violation = {
      name: fineData.violation_name
    };

    // Generate HTML content
    const htmlContent = generateReceiptHTML(fineData, employee, violation, settings);

    // Send email
    const mailOptions = {
      from: `"${settings.company_name || 'ThexSol Fine Management'}" <${settings.smtp_username}>`,
      to: fineData.employee_email,
      subject: `Fine Receipt - ${violation.name}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: 'success',
      message: `Receipt sent successfully to ${fineData.employee_email}`,
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    // Provide specific error messages for common issues
    if (error.code === 'EAUTH') {
      return res.status(400).json({
        error: 'Authentication failed. Please check your email username and password (use App Password for Gmail).'
      });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(400).json({
        error: 'SMTP server not found. Please check your SMTP server address.'
      });
    }

    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}
