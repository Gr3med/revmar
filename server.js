const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const { sendTextReport } = require('./notifications.js');
const config = require('./config.js');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

let newReviewsCounter = 0;

(async () => {
    try {
        await dbClient.connect();
        console.log('✅ Connected to PostgreSQL DB.');
        await dbClient.query(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, "roomNumber" VARCHAR(50), cleanliness INTEGER, reception INTEGER, services INTEGER, comments TEXT, "createdAt" TIMESTAMPTZ DEFAULT NOW());`);
    } catch (error) {
        console.error('❌ DB Connection Failed:', error);
        process.exit(1);
    }
})();

app.post('/api/review', async (req, res) => {
    try {
        console.log('➡️ Received a new review request.');
        const { roomNumber, cleanliness, reception, services, comments } = req.body;

        await dbClient.query('INSERT INTO reviews ("roomNumber", cleanliness, reception, services, comments) VALUES ($1, $2, $3, $4, $5)', [roomNumber, cleanliness, reception, services, comments]);
        console.log(`💾 Review from room ${roomNumber} saved to DB.`);
        newReviewsCounter++;

        if (newReviewsCounter >= 3) {
            console.log(`📬 Triggering text report. Counter: ${newReviewsCounter}`);
            const allStats = (await dbClient.query(`SELECT COUNT(id) as total_reviews, AVG(cleanliness) as avg_cleanliness, AVG(reception) as avg_reception, AVG(services) as avg_services FROM reviews`)).rows[0];
            const recentReviews = (await dbClient.query('SELECT * FROM reviews ORDER BY id DESC LIMIT 3')).rows;
            
            let reportHtml = `<div dir="rtl" style="font-family: Arial, sans-serif;"><h2>📊 تقرير تراكمي</h2>...</div>`; // (الكود الطويل هنا)
            
            await sendTextReport(reportHtml, allStats.total_reviews);
            newReviewsCounter = 0;
            console.log('🔄 Counter reset to 0.');
        } else {
            console.log(`⏳ Counter is at ${newReviewsCounter}. Waiting for more reviews.`);
        }
        
        res.status(201).json({ success: true, message: 'شكرًا لك! تم استلام تقييمك.' });
    } catch (error) {
        console.error('❌ CRITICAL ERROR in /api/review:', error);
        res.status(500).json({ success: false, message: 'خطأ فادح في السيرفر.' });
    }
});

app.listen(PORT, () => console.log(`🚀 Server is live on port ${PORT}`));
