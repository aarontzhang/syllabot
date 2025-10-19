# Vercel Deployment Guide for Syllabot

This guide will help you deploy your Syllabot application to Vercel.

## Prerequisites

Before deploying, make sure you have:
1. Your OpenAI API key from https://platform.openai.com/api-keys
2. Google Calendar API credentials from https://console.cloud.google.com/
3. A GitHub account
4. A Vercel account (sign up at https://vercel.com)

## Step 1: Push to GitHub

1. Create a new repository on GitHub (don't initialize with README)
2. Run these commands in your project directory:

```bash
git add .
git commit -m "Add Vercel configuration"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect it as a Node.js project

## Step 3: Configure Environment Variables

Before deploying, add these environment variables in Vercel:

1. Click "Environment Variables" section
2. Add the following variables:

   - **OPENAI_API_KEY**: Your OpenAI API key
   - **GOOGLE_CLIENT_ID**: Your Google OAuth client ID
   - **GOOGLE_CLIENT_SECRET**: Your Google OAuth client secret
   - **GOOGLE_REDIRECT_URI**: `https://YOUR_PROJECT_NAME.vercel.app/oauth2callback`
     (You can update this after getting your Vercel URL)
   - **NODE_ENV**: `production`

3. Click "Deploy"

## Step 4: Update Google OAuth Redirect URI

After your first deployment, you'll get your Vercel URL (e.g., `https://your-app.vercel.app`):

1. Go to https://console.cloud.google.com/
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID
4. Add to "Authorized redirect URIs":
   - `https://YOUR_PROJECT_NAME.vercel.app/oauth2callback`
   - If you have a custom domain: `https://yourdomain.com/oauth2callback`
5. Save the changes

6. Update the `GOOGLE_REDIRECT_URI` environment variable in Vercel:
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Edit `GOOGLE_REDIRECT_URI` to match your actual Vercel URL
   - Redeploy your project (Vercel will auto-redeploy, or click "Redeploy")

## Step 5: Authorize Google Calendar

1. Visit your deployed app: `https://YOUR_PROJECT_NAME.vercel.app/auth`
2. Complete the Google authorization flow
3. Check your Vercel deployment logs for the refresh token:
   - Go to your project in Vercel dashboard
   - Click on "Deployments"
   - Click on the latest deployment
   - Click "Functions" tab and find the `/auth` function logs
4. Copy the `GOOGLE_REFRESH_TOKEN` from the logs
5. Add it as an environment variable in Vercel:
   - Go to Settings → Environment Variables
   - Add `GOOGLE_REFRESH_TOKEN` with the value from logs
6. Redeploy the application

## Step 6: Test Your Deployment

Visit `https://YOUR_PROJECT_NAME.vercel.app` and upload a test syllabus!

## Important Notes

### Vercel Specifics
- **Serverless Functions**: Your Express app runs as serverless functions on Vercel
- **File Uploads**: Files are stored in `/tmp` which is ephemeral - files are cleaned up after each request completes
- **Function Timeout**: Free tier has 10-second timeout for serverless functions. If PDF processing takes longer, you may need to upgrade to Pro
- **Cold Starts**: First request may take a few seconds to warm up

### Custom Domain (Optional)
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain and follow DNS instructions
4. Update `GOOGLE_REDIRECT_URI` with your custom domain
5. Update Google OAuth redirect URIs accordingly

## Deployment Commands (Alternative to UI)

You can also deploy using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

When using CLI, you'll be prompted to set environment variables during first deployment.

## Automatic Deployments

Once connected to GitHub:
- **Push to main branch** = Automatic production deployment
- **Push to other branches** = Automatic preview deployments
- Pull requests get unique preview URLs

## Troubleshooting

### "Cannot connect to Google Calendar"
- Verify all environment variables are set correctly in Vercel dashboard
- Check that the redirect URI matches exactly in both Vercel settings and Google Console
- Ensure you've generated and added the refresh token

### "Function timeout exceeded"
- Large PDFs may take longer than 10 seconds to process
- Consider upgrading to Vercel Pro for 60-second timeout
- Or optimize PDF processing

### "Module not found" errors
- Make sure all dependencies are in `package.json`
- Try deleting `node_modules` and `.vercel` folder locally, then redeploy

### Environment variables not working
- Make sure to redeploy after adding/changing environment variables
- Check that variable names match exactly (case-sensitive)
- For multiple environments (Production/Preview/Development), make sure variables are set for the right environment

## Monitoring & Logs

- **Real-time logs**: Vercel Dashboard → Your Project → Deployments → Click deployment → View Function Logs
- **Analytics**: Available in Vercel dashboard (may require Pro plan for detailed analytics)

## Cost Considerations

**Free Tier includes:**
- 100 GB bandwidth per month
- Serverless function execution
- Automatic HTTPS
- Preview deployments

**When to upgrade to Pro:**
- Need longer function timeouts (60s instead of 10s)
- Higher bandwidth requirements
- Need password protection for previews
- Want advanced analytics

## Support Resources

- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Google Calendar API: https://developers.google.com/calendar
- OpenAI API: https://platform.openai.com/docs

## Next Steps

After successful deployment:
1. Test the app thoroughly with various PDF syllabi
2. Monitor function execution times in Vercel dashboard
3. Set up custom domain if desired
4. Consider adding error tracking (Sentry, LogRocket, etc.)
