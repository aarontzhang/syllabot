require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const OpenAI = require('openai');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads (use /tmp for serverless)
const upload = multer({ dest: '/tmp/uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('/tmp/uploads')) {
    fs.mkdirSync('/tmp/uploads', { recursive: true });
}

// Serve static files
app.use(express.static('.'));

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Google Calendar setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
);

// Set credentials if we have a refresh token
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Function to get emoji based on class subject
function getEmojiForClass(className) {
    const lowerClass = className.toLowerCase();

    // Math & Science
    if (lowerClass.includes('math') || lowerClass.includes('calculus') || lowerClass.includes('algebra') || lowerClass.includes('statistics')) return '🔢';
    if (lowerClass.includes('physics')) return '⚛️';
    if (lowerClass.includes('chemistry') || lowerClass.includes('chem')) return '🧪';
    if (lowerClass.includes('biology') || lowerClass.includes('bio')) return '🧬';
    if (lowerClass.includes('computer') || lowerClass.includes('programming') || lowerClass.includes('coding') || lowerClass.includes('software')) return '💻';
    if (lowerClass.includes('data') || lowerClass.includes('algorithm')) return '📊';

    // Humanities
    if (lowerClass.includes('english') || lowerClass.includes('literature') || lowerClass.includes('writing')) return '📚';
    if (lowerClass.includes('history')) return '📜';
    if (lowerClass.includes('philosophy')) return '🤔';
    if (lowerClass.includes('psychology') || lowerClass.includes('psych')) return '🧠';
    if (lowerClass.includes('sociology')) return '👥';
    if (lowerClass.includes('political') || lowerClass.includes('government')) return '🏛️';
    if (lowerClass.includes('economics') || lowerClass.includes('econ')) return '💰';

    // Arts
    if (lowerClass.includes('art') || lowerClass.includes('drawing') || lowerClass.includes('painting')) return '🎨';
    if (lowerClass.includes('music')) return '🎵';
    if (lowerClass.includes('theatre') || lowerClass.includes('theater') || lowerClass.includes('drama')) return '🎭';
    if (lowerClass.includes('film') || lowerClass.includes('cinema')) return '🎬';
    if (lowerClass.includes('design')) return '✏️';

    // Languages
    if (lowerClass.includes('spanish')) return '🇪🇸';
    if (lowerClass.includes('french')) return '🇫🇷';
    if (lowerClass.includes('chinese') || lowerClass.includes('mandarin')) return '🇨🇳';
    if (lowerClass.includes('japanese')) return '🇯🇵';
    if (lowerClass.includes('german')) return '🇩🇪';
    if (lowerClass.includes('language')) return '🗣️';

    // Other subjects
    if (lowerClass.includes('business') || lowerClass.includes('management')) return '💼';
    if (lowerClass.includes('law') || lowerClass.includes('legal')) return '⚖️';
    if (lowerClass.includes('medicine') || lowerClass.includes('medical')) return '⚕️';
    if (lowerClass.includes('engineering')) return '⚙️';
    if (lowerClass.includes('architecture')) return '🏗️';
    if (lowerClass.includes('geography')) return '🌍';
    if (lowerClass.includes('astronomy')) return '🔭';
    if (lowerClass.includes('environmental') || lowerClass.includes('ecology')) return '🌱';
    if (lowerClass.includes('education')) return '👨‍🏫';
    if (lowerClass.includes('communication')) return '📢';

    // Default
    return '📖';
}

// Extract dates from syllabus using AI
async function extractDatesFromPDF(pdfText) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that extracts IMPORTANT dates from syllabus documents. Only extract events that significantly impact grades or course structure. Include: exams (midterms, finals, quizzes), major project due dates, assignment deadlines, presentation dates, paper submissions, class cancellations, breaks/holidays, and important administrative deadlines. DO NOT include: regular class meetings, office hours, discussion sections, or minor homework unless specifically weighted heavily. Return ONLY a JSON array with no markdown formatting or code blocks. Each item should have: {\"className\": \"name of the course/class\", \"type\": \"Exam\", \"Project\", \"Assignment\", \"Presentation\", \"Paper\", \"Break\", or \"Deadline\", \"title\": \"description\", \"date\": \"YYYY-MM-DD\", \"location\": \"location if specified, otherwise empty string\", \"additionalDetails\": \"any other relevant details like chapter coverage, format, etc., otherwise empty string\"}. If you cannot determine a specific date, omit that entry."
            },
            {
                role: "user",
                content: `Extract all important academic dates from this syllabus. Identify the class/course name from the document:\n\n${pdfText}`
            }
        ],
        temperature: 0.3
    });

    const responseText = completion.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    const jsonText = responseText.replace(/```json\n?|\n?```/g, '').trim();

    return JSON.parse(jsonText);
}

// Create Google Calendar events
async function createCalendarEvents(events) {
    const createdEvents = [];

    for (const event of events) {
        // Get emoji for the class
        const emoji = getEmojiForClass(event.className || '');

        // Build the event title: emoji + class name + type + title
        let summary = `${emoji} ${event.className} - ${event.type}: ${event.title}`;

        // Build description with all available details
        let description = `From syllabus - ${event.type}\n\nClass: ${event.className}`;

        // Add location if provided
        if (event.location && event.location.trim()) {
            description += `\nLocation: ${event.location}`;
        }

        // Add additional details if provided
        if (event.additionalDetails && event.additionalDetails.trim()) {
            description += `\n\nDetails: ${event.additionalDetails}`;
        }

        const calendarEvent = {
            summary: summary,
            description: description,
            start: {
                date: event.date
            },
            end: {
                date: event.date
            },
            // Add location to the event if available
            ...(event.location && event.location.trim() && { location: event.location }),
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 60 } // 1 hour before
                ]
            }
        };

        try {
            const response = await calendar.events.insert({
                calendarId: 'primary',
                resource: calendarEvent
            });
            createdEvents.push(response.data);
        } catch (error) {
            console.error('Error creating event:', error.message);
            throw error;
        }
    }

    return createdEvents;
}

// Upload endpoint - now only extracts events without creating them
app.post('/upload', upload.single('syllabus'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Read and parse PDF
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdf(dataBuffer);

        console.log('PDF extracted, text length:', pdfData.text.length);

        // Extract dates using AI
        const extractedEvents = await extractDatesFromPDF(pdfData.text);

        console.log('Extracted events:', extractedEvents);

        // Add emoji to each event for preview
        const eventsWithEmoji = extractedEvents.map(event => ({
            ...event,
            emoji: getEmojiForClass(event.className || '')
        }));

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            events: eventsWithEmoji
        });

    } catch (error) {
        console.error('Error processing syllabus:', error);

        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            error: error.message || 'Failed to process syllabus'
        });
    }
});

// New endpoint to create selected events
app.post('/create-events', express.json(), async (req, res) => {
    try {
        const { events } = req.body;

        if (!events || !Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ error: 'No events provided' });
        }

        console.log('Creating selected events:', events.length);

        // Create calendar events
        const createdEvents = await createCalendarEvents(events);

        res.json({
            success: true,
            eventsCreated: createdEvents.length
        });

    } catch (error) {
        console.error('Error creating events:', error);

        res.status(500).json({
            error: error.message || 'Failed to create calendar events'
        });
    }
});

// OAuth callback endpoint (for initial setup)
app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('No authorization code provided');
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Refresh Token:', tokens.refresh_token);
        console.log('\nAdd this to your .env file:');
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

        res.send('Authorization successful! Check your console for the refresh token and add it to your .env file.');
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).send('Error during authorization');
    }
});

// Start authorization flow
app.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/calendar.events']
    });
    res.redirect(authUrl);
});

// Only start server if not in serverless environment
if (process.env.VERCEL !== '1') {
    app.listen(port, () => {
        console.log(`\nSyllabus Calendar Creator running at http://localhost:${port}`);
        console.log('\nMake sure you have set up your .env file with the required API keys!');

        if (!process.env.GOOGLE_REFRESH_TOKEN) {
            console.log('\nTo authorize Google Calendar, visit: http://localhost:3000/auth');
        }
    });
}

// Export for Vercel serverless
module.exports = app;
