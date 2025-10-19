# Deployment Guide for Syllabot

This guide will help you deploy your Syllabot application to Render (free hosting).

## Prerequisites

Before deploying, make sure you have:
1. Your OpenAI API key from https://platform.openai.com/api-keys
2. Google Calendar API credentials from https://console.cloud.google.com/

## Step 1: Push to GitHub

1. Create a new repository on GitHub (don't initialize with README)
2. Run these commands in your project directory:

```bash
git add .
git commit -m "Initial commit - Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Render

1. Go to https://render.com and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect the settings from `render.yaml`, but verify:
   - **Name**: syllabot (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Free Plan**: Select the free tier

## Step 3: Set Environment Variables

In your Render dashboard for this service, go to "Environment" and add these variables:

1. **OPENAI_API_KEY**: Your OpenAI API key
2. **GOOGLE_CLIENT_ID**: Your Google OAuth client ID
3. **GOOGLE_CLIENT_SECRET**: Your Google OAuth client secret
4. **GOOGLE_REDIRECT_URI**: `https://YOUR_APP_NAME.onrender.com/oauth2callback`
   (Replace YOUR_APP_NAME with your actual Render app name)

Note: Leave GOOGLE_REFRESH_TOKEN empty for now - you'll set it after authorization.

## Step 4: Update Google OAuth Redirect URI

1. Go to https://console.cloud.google.com/
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID
4. Add your Render URL to "Authorized redirect URIs":
   - `https://YOUR_APP_NAME.onrender.com/oauth2callback`
5. Save the changes

## Step 5: Authorize Google Calendar

1. Once your app is deployed, visit: `https://YOUR_APP_NAME.onrender.com/auth`
2. Complete the Google authorization flow
3. Check your Render logs for the refresh token
4. Add the `GOOGLE_REFRESH_TOKEN` to your environment variables in Render
5. Restart the service

## Step 6: Test Your Deployment

Visit `https://YOUR_APP_NAME.onrender.com` and upload a test syllabus!

## Important Notes

- **Free Tier Limitations**: Render's free tier spins down after 15 minutes of inactivity. The first request after inactivity may take 30-60 seconds to wake up.
- **Uploads Folder**: The uploads folder is ephemeral on Render. Files are automatically cleaned up after processing, which is fine for this app.
- **Environment Variables**: Never commit your `.env` file. All secrets should be set in Render's dashboard.

## Alternative Hosting Options

### Railway
1. Go to https://railway.app
2. Click "New Project" > "Deploy from GitHub repo"
3. Add environment variables in the Variables tab
4. Railway will auto-deploy

### Heroku
1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Set config vars: `heroku config:set OPENAI_API_KEY=your_key`
4. Push: `git push heroku main`

## Troubleshooting

**"Cannot connect to Google Calendar"**
- Make sure all environment variables are set correctly
- Check that the redirect URI matches exactly in both Render and Google Console
- Verify you've generated the refresh token

**"App is slow to respond"**
- This is normal on free tier after inactivity
- Consider upgrading to a paid plan for always-on service

**Build fails**
- Check Render logs for specific errors
- Ensure all dependencies are in package.json
- Make sure Node version is compatible (check with `node --version` locally)

## Support

If you need help, check:
- Render documentation: https://render.com/docs
- Google Calendar API: https://developers.google.com/calendar
- OpenAI API: https://platform.openai.com/docs
