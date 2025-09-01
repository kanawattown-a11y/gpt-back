const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// إعداد OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// إعدادات الأمان (CORS)
// **مهم:** قم بتغيير الرابط إلى رابط GitHub Pages الخاص بك
const allowedOrigins = ['https://kanawattown-a11y.github.io/gpt-front'];
const corsOptions = {
    origin: function (origin, callback ) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json());

// نقطة النهاية (Endpoint) للشات
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const completion = await openai.chat.completions.create({
            // استخدم gpt-3.5-turbo لأنه الأسرع والأكثر فعالية من حيث التكلفة
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
