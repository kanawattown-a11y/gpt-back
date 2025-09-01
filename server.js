const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
    console.error("FATAL ERROR: OPENAI_API_KEY is not set.");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const allowedOrigins = [
    'https://kanawattown-a11y.github.io'
];
const corsOptions = {
    origin: function (origin, callback ) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by CORS.'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            // --- *** التغيير هنا *** ---
            // الترقية إلى موديل أحدث وأكثر ذكاءً
            model: "gpt-4o-mini", 
            
            messages: [
                // إضافة رسالة نظام لتشجيعه على استخدام Markdown
                { role: "system", content: "You are a helpful assistant. Format your responses using Markdown when appropriate (e.g., for lists, bold text, code snippets)." },
                { role: "user", content: message }
            ],
        });

        res.json({ reply: completion.choices[0].message.content });

    } catch (error) {
        console.error('--- OpenAI API Error ---');
        console.error(error);
        console.error('------------------------');
        
        res.status(500).json({ error: 'Failed to get a response from the AI service. Check server logs (this model may require a paid plan).' });
    }
});

app.listen(port, () => {
    console.log(`Server is running successfully on port ${port}`);
});
