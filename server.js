const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client } = require('pg'); // استيراد الحزمة الجديدة
require('dotenv').config();

const { sendTextReport } = require('./notifications.js');
const config = require('./config.js');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- !! إعداد الاتصال بـ PostgreSQL !! ---
const dbClient = new Client({
    // سنضع رابط الاتصال في متغيرات البيئة
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

let newReviewsCounter = 0;

(async () => {
    try {
        await dbClient.connect();
        console.log('✅ Connected to PostgreSQL database.');
        // إنشاء الجدول إذا لم يكن موجودًا
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                "roomNumber" VARCHAR(50),
                cleanliness INTEGER,
                reception INTEGER,
                services INTEGER,
                comments TEXT,
                "createdAt" TIMESTAMPTZ DEFAULT NOW()
            );
        `);
    } catch (error) {
        console.error('❌ DB Connection Failed:', error);
        process.exit(1);
    }
})();

app.post('/api/review', async (req, res) => {
    try {
        const { roomNumber, cleanliness, reception, services, comments } = req.body;
        // استخدام dbClient بدلاً من db
        await dbClient.query('INSERT INTO reviews ("roomNumber", cleanliness, reception, services, comments) VALUES ($1, $2, $3, $4, $5)', [roomNumber, cleanliness, reception, services, comments]);
        newReviewsCounter++;

        if (newReviewsCounter >= 3) {
            // ... (باقي الكود يبقى كما هو، فقط استبدل db.get و db.all بـ dbClient.query)
        }
        res.status(201).json({ success: true, message: 'شكرًا لك! تم استلام تقييمك.' });
    } catch (error) {
        console.error('❌ Error processing review:', error);
        res.status(500).json({ success: false, message: 'خطأ في السيرفر.' });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running in "Text Report" mode on port ${PORT}`));
