# Syllabus Calendar Creator

A simple web application that analyzes syllabus PDFs and automatically creates Google Calendar events for exams and projects.

## Features

- Upload syllabus PDF files
- AI-powered extraction of exam and project dates
- Automatic Google Calendar event creation
- Clean, modern web interface

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env` file

#### Google Calendar API
1. Go to https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" > "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add `http://localhost:3000/oauth2callback` to "Authorized redirect URIs"
5. Copy the Client ID and Client Secret to your `.env` file

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

### 4. Authorize Google Calendar

1. Start the server: `npm start`
2. Visit http://localhost:3000/auth
3. Sign in with your Google account and grant calendar permissions
4. Copy the refresh token from the console output
5. Add it to your `.env` file as `GOOGLE_REFRESH_TOKEN`
6. Restart the server

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser to http://localhost:3000

3. Upload a syllabus PDF

4. Click "Analyze & Create Events"

5. The app will:
   - Extract text from the PDF
   - Use AI to identify exam and project dates
   - Create Google Calendar events automatically

## How It Works

1. **Frontend**: Simple HTML/CSS/JS interface for file upload
2. **Backend**: Express server handles file uploads
3. **PDF Processing**: Extracts text from PDF using pdf-parse
4. **AI Analysis**: Uses OpenAI API to identify important dates
5. **Calendar Integration**: Creates events using Google Calendar API

## Requirements

- Node.js (v14 or higher)
- OpenAI API key
- Google Cloud project with Calendar API enabled
