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

// Generate test email HTML
function generateTestEmailHTML(settings) {
  const testDate = new Date().toLocaleDateString();
  const testTime = new Date().toLocaleTimeString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Configuration Test</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #27ae60; padding-bottom: 20px; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #27ae60; margin-bottom: 5px; }
        .email-title { font-size: 18px; color: #7f8c8d; }
        .success-icon { font-size: 48px; color: #27ae60; text-align: center; margin: 20px 0; }
        .test-info { background: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60; }
        .info-row { margin-bottom: 10px; }
        .label { font-weight: bold; }
        .config-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="company-name">${settings.company_name || 'ThexSol Fine Management'}</div>
          <div class="email-title">Email Configuration Test</div>
        </div>
        
        <div class="success-icon">✅</div>
        
        <div class="test-info">
          <h3 style="margin-top: 0; color: #27ae60;">Email Configuration Test Successful!</h3>
          <p>Congratulations! Your email configuration is working correctly. This test email was sent successfully from your fine management system.</p>
          
          <div class="info-row">
            <span class="label">Test Date:</span> ${testDate}
          </div>
          <div class="info-row">
            <span class="label">Test Time:</span> ${testTime}
          </div>
          <div class="info-row">
            <span class="label">SMTP Server:</span> ${settings.smtp_server}
          </div>
          <div class="info-row">
            <span class="label">SMTP Port:</span> ${settings.smtp_port || 587}
          </div>
          <div class="info-row">
            <span class="label">From Email:</span> ${settings.smtp_username}
          </div>
        </div>
        
        <div class="config-details">
          <h4 style="margin-top: 0; color: #34495e;">What this means:</h4>
          <ul style="margin-bottom: 0;">
            <li>✅ SMTP server connection established</li>
            <li>✅ Authentication successful</li>
            <li>✅ Email sending capability confirmed</li>
            <li>✅ Your fine management system can now send receipts and reports</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 20px 0; padding: 15px; background: #e8f4f8; border-radius: 5px;">
          <strong>Your email system is ready to use!</strong><br>
          You can now send fine receipts and employee reports automatically.
        </div>
        
        <div class="footer">
          ${settings.email_signature || 'Best regards,<br>ThexSol Fine Management System'}
          <br><br>
          <small>This is an automated test email from your fine management system.</small>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default async function handler(req, res) {
  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { testEmail } = req.body || {};

    if (!testEmail) {
      return res.status(400).json({ error: 'Test email address is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    // Check if environment variables are set
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      return res.status(500).json({
        error: 'Database configuration not found',
        hint: 'Please check your environment variables'
      });
    }

    // Get admin settings for SMTP configuration
    let settingsResult;
    try {
      settingsResult = await turso.execute({
        sql: 'SELECT * FROM admin_settings WHERE id = 1',
        args: []
      });
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        error: 'Database connection failed',
        hint: 'Please check your database configuration',
        details: dbError.message
      });
    }

    const settings = settingsResult.rows[0] || {};

    if (!settings.smtp_server || !settings.smtp_username || !settings.smtp_password) {
      return res.status(400).json({
        error: 'SMTP configuration not complete. Please configure all email settings first.',
        missing: {
          smtp_server: !settings.smtp_server,
          smtp_username: !settings.smtp_username,
          smtp_password: !settings.smtp_password
        }
      });
    }

    // Create email transporter
    let transporter;
    try {
      transporter = createTransporter(settings);
    } catch (transportError) {
      console.error('Transporter creation error:', transportError);
      return res.status(500).json({
        error: 'Failed to create email transporter',
        details: transportError.message
      });
    }

    // Test connection first
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);

      if (verifyError.code === 'EAUTH') {
        return res.status(400).json({
          error: 'SMTP Authentication failed. Please check your email username and password.',
          hint: 'For Gmail, make sure you are using an App Password, not your regular password.',
          code: 'EAUTH'
        });
      }

      if (verifyError.code === 'ENOTFOUND') {
        return res.status(400).json({
          error: 'SMTP server not found. Please check your SMTP server address.',
          hint: 'Common SMTP servers: smtp.gmail.com (Gmail), smtp-mail.outlook.com (Outlook)',
          code: 'ENOTFOUND'
        });
      }

      if (verifyError.code === 'ECONNECTION') {
        return res.status(400).json({
          error: 'Connection failed. Please check your SMTP port and server settings.',
          hint: 'Common ports: 587 (TLS), 465 (SSL), 25 (unsecured)',
          code: 'ECONNECTION'
        });
      }

      return res.status(400).json({
        error: 'SMTP connection failed',
        details: verifyError.message,
        code: verifyError.code || 'UNKNOWN'
      });
    }

    // Generate HTML content
    let htmlContent;
    try {
      htmlContent = generateTestEmailHTML(settings);
    } catch (htmlError) {
      console.error('HTML generation error:', htmlError);
      return res.status(500).json({
        error: 'Failed to generate email content',
        details: htmlError.message
      });
    }

    // Send test email
    const mailOptions = {
      from: `"${settings.company_name || 'ThexSol Fine Management'}" <${settings.smtp_username}>`,
      to: testEmail,
      subject: 'Email Configuration Test - ThexSol Fine Management',
      html: htmlContent,
    };

    let result;
    try {
      result = await transporter.sendMail(mailOptions);
    } catch (sendError) {
      console.error('Email send error:', sendError);

      if (sendError.code === 'EAUTH') {
        return res.status(400).json({
          error: 'Authentication failed during send. Please check your email username and password.',
          hint: 'For Gmail, make sure you are using an App Password (16 characters), not your regular Gmail password.',
          code: 'EAUTH'
        });
      }

      return res.status(500).json({
        error: 'Failed to send email',
        details: sendError.message,
        code: sendError.code || 'SEND_ERROR'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: `Test email sent successfully to ${testEmail}`,
      details: {
        messageId: result.messageId,
        smtp_server: settings.smtp_server,
        smtp_port: settings.smtp_port || 587,
        from: settings.smtp_username,
        to: testEmail
      }
    });

  } catch (error) {
    console.error('Unexpected error in test email handler:', error);

    // Ensure we always return a JSON response, even for unexpected errors
    return res.status(500).json({
      error: 'An unexpected error occurred',
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
