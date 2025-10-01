# Email Setup Guide

✅ **Email functionality has been fixed!** Your application now supports real email sending via Gmail SMTP.

## What Was Fixed

1. **Added Server-Side Email Support**: Created Vercel Functions to handle email sending
2. **Real SMTP Integration**: Using nodemailer for actual email delivery
3. **Three Email Endpoints**:
   - `/api/send-email-receipt` - Send fine receipts to employees
   - `/api/send-employee-report` - Send complete fine reports to employees
   - `/api/send-test-email` - Test your email configuration

## Setup Requirements

### 1. Environment Variables

Create a `.env.local` file in your project root with your Turso database credentials:

```bash
# Turso Database Configuration
TURSO_DATABASE_URL=your_turso_database_url_here
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# Admin Credentials (optional - these have defaults)
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123
VITE_VIEWER_USERNAME=viewer
VITE_VIEWER_PASSWORD=view123
```

### 2. Gmail App Password Setup

For Gmail SMTP to work, you need an **App Password** (not your regular Gmail password):

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Click "2-Step Verification" → "App passwords"
4. Generate a new App Password for "Mail"
5. Use this 16-character App Password in your SMTP configuration

### 3. Configure Email Settings

1. Go to **Admin Settings** → **Email Configuration**
2. Fill in your SMTP details:
   - **SMTP Server**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP Username**: Your Gmail address
   - **SMTP Password**: Your Gmail App Password (16 characters)
   - **Email Signature**: Custom signature for emails

3. Click **"Send Test Email"** to verify your configuration

## Deployment

### Vercel Deployment

1. **Push your changes** to your Git repository
2. **Deploy to Vercel** (automatic if connected to Git)
3. **Add environment variables** in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## How It Works

### Email Features Available:

1. **Fine Receipts**: 
   - Click the mail icon (📧) next to any fine in the Fines Table
   - Sends a professional receipt to the employee's email

2. **Employee Reports**: 
   - Go to Dashboard → Employee Totals
   - Click the mail icon (📧) next to any employee
   - Sends a complete fine history report

3. **Test Emails**: 
   - Admin Settings → Email Configuration → "Send Test Email"
   - Verifies your SMTP configuration is working

### Email Templates Include:
- Professional styling with your company branding
- Fine details (date, amount, violation type, reason)
- Employee information
- Company signature
- Responsive design for mobile devices

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Make sure you're using Gmail App Password, not regular password
   - Verify 2FA is enabled on Gmail account

2. **"SMTP server not found"**
   - Check SMTP server address: `smtp.gmail.com`
   - Verify port: `587`

3. **"Connection failed"**
   - Check your internet connection
   - Verify Gmail allows "Less secure app access" or use App Password

4. **"Employee email not found"**
   - Make sure the employee has an email address in their profile
   - Go to Manage Employees → Edit employee to add email

### Testing Tips:

1. **Always test first**: Use the "Send Test Email" button before sending to employees
2. **Check spam folder**: First emails might go to spam
3. **Verify employee emails**: Make sure employee email addresses are correct

## Security Notes

- Environment variables are stored securely in Vercel
- SMTP passwords are encrypted in transit
- No email credentials are stored in your database
- All email sending happens server-side for security

Your email system is now fully functional! 🎉
