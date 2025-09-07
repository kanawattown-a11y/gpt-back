const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const mongoose = require('mongoose');
require('dotenv').config();

// --- إعدادات الخادم و OpenAI ---
const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY || !process.env.DATABASE_URL) {
    console.error("FATAL ERROR: Make sure OPENAI_API_KEY and DATABASE_URL are set in the environment variables.");
    process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- الاتصال بقاعدة البيانات ---
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("Successfully connected to MongoDB Atlas."))
    .catch(err => {
        console.error("Failed to connect to MongoDB Atlas.", err);
        process.exit(1);
    });

// --- تعريف نموذج البيانات (Schema) ---
const conversationSchema = new mongoose.Schema({
    userMessage: {
        type: String,
        required: true
    },
    botReply: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

// --- إعدادات CORS و Express ---
const allowedOrigins = ['https://kanawattown-a11y.github.io'];
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

// --- نقطة النهاية (Endpoint) للشات ---
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        // 1. الحصول على الرد من OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant. Format your responses using Markdown." },
                { role: "user", content: message }
            ],
        });

        const botReply = completion.choices[0].message.content;

        // 2. حفظ المحادثة في قاعدة البيانات
        try {
            const newConversation = new Conversation({
                userMessage: message,
                botReply: botReply
            });
            await newConversation.save();
            console.log("Conversation saved to database.");
        } catch (dbError) {
            console.error("Failed to save conversation to database.", dbError);
            // لا نوقف العملية إذا فشل الحفظ، نرسل الرد للمستخدم على أي حال
        }

        // 3. إرسال الرد إلى المستخدم
        res.json({ reply: botReply });

    } catch (error) {
        console.error('--- OpenAI API Error ---', error);
        res.status(500).json({ error: 'Failed to get a response from the AI service.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running successfully on port ${port}`);
});
