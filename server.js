// في ملف server.js
const express = require('express' );
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// التحقق من وجود مفتاح API عند بدء التشغيل
if (!process.env.OPENAI_API_KEY) {
    console.error("FATAL ERROR: OPENAI_API_KEY is not defined.");
    process.exit(1); // إيقاف الخادم إذا لم يكن المفتاح موجوداً
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// إعدادات الأمان (CORS)
const allowedOrigins = [
    'https://kanawattown-a11y.github.io' // الرابط الخاص بك
];

const corsOptions = {
    origin: function (origin, callback ) {
        // السماح بالطلبات التي لا تحمل origin (مثل Postman أو الاختبارات المحلية)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", 
            messages: [{ role: "user", content: userMessage }],
        });

        res.json({ reply: completion.choices[0].message.content });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
