# Fix for Email Function Error

## The Problem
You're getting a "FUNCTION_INVOCATION_FAILED" error when trying to send test emails. This happens because the Vercel functions don't have access to your database environment variables.

## Quick Fix Steps

### 1. Check Vercel Environment Variables
Go to your Vercel dashboard → Your Project → Settings → Environment Variables

**You need ALL 4 of these variables:**
- `TURSO_DATABASE_URL` = your database URL
- `TURSO_AUTH_TOKEN` = your database token  
- `VITE_TURSO_DATABASE_URL` = same database URL (with VITE_ prefix)
- `VITE_TURSO_AUTH_TOKEN` = same database token (with VITE_ prefix)

### 2. Deploy the Fixed Code
```bash
# Push these changes to trigger a new deployment
git add .
git commit -m "Fix Vercel function configuration and error handling"
git push
```

### 3. Test the Fix
After deployment completes:

1. **Test the basic API first:**
   - Go to: `https://your-app.vercel.app/api/test`
   - Should show: `{"status": "success", "environment": {"hasDbUrl": true, "hasDbToken": true}}`

2. **If the test API works, try the email test:**
   - Go to Admin Settings → Email Configuration
   - Click "Send Test Email"

## What Was Fixed

1. **Added proper Vercel function configuration** (`vercel.json`)
2. **Fixed environment variable handling** in the email function
3. **Added better error logging** to help debug issues
4. **Added CORS headers** for proper API communication
5. **Created a test endpoint** to verify function deployment

## Still Having Issues?

### Check Vercel Function Logs
1. Go to Vercel dashboard → Your Project → Functions tab
2. Click on the failing function to see detailed error logs

### Common Issues and Solutions

**"Database configuration not found"**
- Add the 4 environment variables listed above in Vercel dashboard
- Redeploy after adding variables

**"Authentication failed"** 
- Make sure you're using Gmail App Password (not regular password)
- Enable 2-Factor Authentication on Gmail first

**"SMTP connection failed"**
- Check SMTP settings: server = `smtp.gmail.com`, port = `587`
- Verify your Gmail App Password is correct (16 characters)

**Function still not working**
- Try the test endpoint first: `/api/test`
- Check if it shows `hasDbUrl: true` and `hasDbToken: true`
- If false, your environment variables aren't set correctly

## Next Steps
Once the email function is working:
1. Configure your SMTP settings in Admin Settings
2. Use "Send Test Email" to verify configuration  
3. Start sending fine receipts and employee reports

The email system will be fully functional after following these steps!
