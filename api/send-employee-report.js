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

// Generate employee report HTML
function generateEmployeeReportHTML(employee, fines, settings) {
  const reportDate = new Date().toLocaleDateString();
  const totalAmount = fines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);
  
  const finesTableRows = fines.map(fine => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(fine.fine_date).toLocaleDateString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${fine.violation_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${fine.reason}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${parseFloat(fine.amount).toFixed(2)}</td>
    </tr>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Employee Fine Report</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .report-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #e74c3c; padding-bottom: 20px; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 5px; }
        .report-title { font-size: 18px; color: #7f8c8d; }
        .employee-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .label { font-weight: bold; }
        .summary { background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .total-amount { font-size: 28px; font-weight: bold; color: #e74c3c; margin: 10px 0; }
        .fines-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .fines-table th { background: #34495e; color: white; padding: 12px 8px; text-align: left; }
        .fines-table td { padding: 8px; border-bottom: 1px solid #ddd; }
        .no-fines { text-align: center; color: #7f8c8d; font-style: italic; padding: 40px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <div class="company-name">${settings.company_name || 'ThexSol Fine Management'}</div>
          <div class="report-title">Employee Fine Report</div>
        </div>
        
        <div class="employee-info">
          <div class="info-row">
            <span class="label">Report Date:</span>
            <span>${reportDate}</span>
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
            <span class="label">Department:</span>
            <span>${employee.department || 'N/A'}</span>
          </div>
        </div>
        
        <div class="summary">
          <h3 style="margin-top: 0; color: #34495e;">Summary</h3>
          <div><strong>Total Fines:</strong> ${fines.length}</div>
          <div class="total-amount">Total Amount: $${totalAmount.toFixed(2)}</div>
        </div>
        
        ${fines.length > 0 ? `
        <h3 style="color: #34495e;">Fine Details</h3>
        <table class="fines-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Violation</th>
              <th>Reason</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${finesTableRows}
          </tbody>
          <tfoot>
            <tr style="background: #f8f9fa;">
              <td colspan="3" style="padding: 12px 8px; font-weight: bold;">Total:</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #e74c3c;">$${totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        ` : `
        <div class="no-fines">
          <h3>No fines found for this employee</h3>
          <p>This employee has a clean record!</p>
        </div>
        `}
        
        <div class="footer">
          ${settings.email_signature || 'Best regards,<br>ThexSol Fine Management System'}
          <br><br>
          <small>This report was generated automatically. Please contact ${settings.admin_email || 'admin'} if you have any questions.</small>
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
    const { employeeName } = req.query;

    if (!employeeName) {
      return res.status(400).json({ error: 'Employee name is required' });
    }

    // Get employee details
    const employeeResult = await turso.execute({
      sql: 'SELECT * FROM employees WHERE name = ?',
      args: [decodeURIComponent(employeeName)]
    });

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employeeResult.rows[0];

    if (!employee.email) {
      return res.status(400).json({ error: 'Employee email not found' });
    }

    // Get all fines for this employee
    const finesResult = await turso.execute({
      sql: `
        SELECT f.*, vt.name as violation_name
        FROM fines f
        JOIN violation_types vt ON f.violation_type_id = vt.id
        WHERE f.employee_id = ?
        ORDER BY f.fine_date DESC
      `,
      args: [employee.id]
    });

    const fines = finesResult.rows;

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

    // Generate HTML content
    const htmlContent = generateEmployeeReportHTML(employee, fines, settings);

    // Send email
    const mailOptions = {
      from: `"${settings.company_name || 'ThexSol Fine Management'}" <${settings.smtp_username}>`,
      to: employee.email,
      subject: `Fine Report for ${employee.name}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: 'success',
      message: `Employee report sent successfully to ${employee.email}`,
      employee: employee.name,
      fineCount: fines.length,
      totalAmount: fines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0)
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
