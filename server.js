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

let dbReady = false;
let newReviewsCounter = 0;

app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
    
    dbClient.connect()
        .then(() => {
            console.log('✅ Connected to PostgreSQL DB.');
            return dbClient.query(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, "roomNumber" VARCHAR(50), cleanliness INTEGER, reception INTEGER, services INTEGER, comments TEXT, "createdAt" TIMESTAMPTZ DEFAULT NOW());`);
        })
        .then(() => {
            dbReady = true;
            console.log("✅ Database is ready to accept reviews.");
        })
        .catch(error => {
            console.error('❌ CRITICAL DB Connection/Setup Failed:', error);
        });
});

app.post('/api/review', async (req, res) => {
    if (!dbReady) {
        console.error("⚠️ Received request, but DB is not ready. Aborting.");
        return res.status(503).json({ success: false, message: 'السيرفر غير جاهز حاليًا، يرجى المحاولة بعد قليل.' });
    }

    try {
        console.log('➡️ Received a new review request.');
        const { roomNumber, cleanliness, reception, services, comments } = req.body;
        
        await dbClient.query('INSERT INTO reviews ("roomNumber", cleanliness, reception, services, comments) VALUES ($1, $2, $3, $4, $5)', [roomNumber, cleanliness, reception, services, comments]);
        console.log(`💾 Review from room ${roomNumber} saved to DB.`);
        newReviewsCounter++;

        if (newReviewsCounter >= 3) {
            console.log(`📬 Triggering text report. Counter: ${newReviewsCounter}`);
            
            const allStatsResult = await dbClient.query(`SELECT COUNT(id) as total_reviews, AVG(cleanliness) as avg_cleanliness, AVG(reception) as avg_reception, AVG(services) as avg_services FROM reviews`);
            const allStats = allStatsResult.rows[0];

            const recentReviewsResult = await dbClient.query('SELECT * FROM reviews ORDER BY id DESC LIMIT 3');
            const recentReviews = recentReviewsResult.rows;
            
            let reportHtml = `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>📊 تقرير تقييمات تراكمي</h2>`;
            reportHtml += `<p><strong>إجمالي التقييمات:</strong> ${allStats.total_reviews}</p>`;
            reportHtml += `<p><strong>معدل النظافة:</strong> ${Number(allStats.avg_cleanliness).toFixed(2)} / 5</p>`;
            reportHtml += `<p><strong>معدل الاستقبال:</strong> ${Number(allStats.avg_reception).toFixed(2)} / 5</p>`;
            reportHtml += `<p><strong>معدل الخدمات:</strong> ${Number(allStats.avg_services).toFixed(2)} / 5</p><hr>`;
            reportHtml += `<h3>آخر 3 تقييمات:</h3><ul>`;
            recentReviews.forEach(r => {
                reportHtml += `<li><b>غرفة ${r.roomNumber}:</b> (نظافة: ${r.cleanliness}★) (استقبال: ${r.reception}★) (خدمات: ${r.services}★) - <em>${r.comments || 'لا تعليق'}</em></li>`;
            });
            reportHtml += `</ul></div>`;

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
