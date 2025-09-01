const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// التحقق من وجود مفتاح API عند بدء التشغيل
if (!process.env.OPENAI_API_KEY) {
    console.error("FATAL ERROR: The OPENAI_API_KEY environment variable is not set on Render.");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// إعدادات الأمان (CORS)
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

// نقطة النهاية (Endpoint) للشات
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            // --- *** التغيير هنا *** ---
            // تم التبديل إلى الموديل الأساسي لضمان التوافق
            model: "gpt-3.5-turbo", 
            
            messages: [{ role: "user", content: message }],
        });

        res.json({ reply: completion.choices[0].message.content });

    } catch (error) {
        console.error('--- OpenAI API Error ---');
        // هذا السجل مهم جداً، سيظهر لنا تفاصيل الخطأ من OpenAI
        console.error(error); 
        console.error('------------------------');
        
        res.status(500).json({ error: 'Failed to get a response from the AI service. The model might be unavailable or an API key issue persists.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running successfully on port ${port}`);
});
