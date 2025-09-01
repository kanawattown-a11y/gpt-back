const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// --- التحقق من وجود مفتاح API عند بدء التشغيل ---
if (!process.env.OPENAI_API_KEY) {
    console.error("FATAL ERROR: The OPENAI_API_KEY environment variable is not set on Render.");
    console.error("Please go to your service's 'Environment' tab and add it.");
    process.exit(1); // إيقاف الخادم إذا لم يكن المفتاح موجوداً
}

// --- إعداد OpenAI ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- إعدادات الأمان (CORS) ---
// هذه القائمة تحدد المواقع المسموح لها بالاتصال بالخادم
const allowedOrigins = [
    'https://kanawattown-a11y.github.io' // الرابط الخاص بواجهتك الأمامية
];

const corsOptions = {
    origin: function (origin, callback ) {
        // السماح بالطلبات التي لا تحمل origin (مثل أدوات الاختبار) أو الطلبات من المواقع المسموح بها
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // رفض الطلبات من أي موقع آخر
            console.warn(`CORS blocked request from origin: ${origin}`);
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
        return res.status(400).json({ error: 'Message is required in the request body.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", 
            messages: [{ role: "user", content: message }],
        });

        res.json({ reply: completion.choices[0].message.content });

    } catch (error) {
        // تسجيل الخطأ بالتفصيل في سجلات Render
        console.error('--- OpenAI API Error ---');
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.message);
        console.error('------------------------');
        
        // إرسال رسالة خطأ واضحة للواجهة الأمامية
        res.status(500).json({ error: 'Failed to get a response from the AI service. Please check the server logs on Render.' });
    }
});

// --- تشغيل الخادم ---
app.listen(port, () => {
    console.log(`Server is running successfully on port ${port}`);
});
