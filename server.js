const express = require('express');
const cors = require('cors');
// لاحظ أننا لم نعد نستخدم OpenAI مؤقتاً
// const OpenAI = require('openai'); 
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// طباعة رسالة عند بدء التشغيل للتأكد من أن الخادم يعمل
console.log("--- Server is starting up... ---");

// طباعة قيمة متغير البيئة (للتشخيص فقط)
// هذا سيظهر لنا ما إذا كان Render يقرأ المتغير بشكل صحيح أم لا
console.log("Value of OPENAI_API_KEY found:", process.env.OPENAI_API_KEY ? "Key is present" : "!!! KEY IS MISSING !!!");

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

// --- نقطة نهاية (Endpoint) تشخيصية ---
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    // طباعة رسالة في السجلات عند وصول طلب
    console.log(`Received a request on /chat with message: "${message}"`);

    if (!message) {
        console.log("Request failed: Message was empty.");
        return res.status(400).json({ error: 'Message is required.' });
    }

    // --- الرد التجريبي ---
    // بدلاً من الاتصال بـ OpenAI، سنرسل رداً ثابتاً فوراً
    const testReply = `This is a test response. Your original message was: "${message}". The server is working correctly.`;
    
    console.log("Sending a test response back to the user.");
    res.json({ reply: testReply });
});

app.listen(port, () => {
    console.log(`--- Server has successfully started and is listening on port ${port} ---`);
});
