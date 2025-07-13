const express = require('express');
const cors = require('cors');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
require('dotenv').config();

const { sendTextReport } = require('./notifications.js'); // استيراد الوظيفة الجديدة
const config = require('./config.js');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let db;
let newReviewsCounter = 0;

(async () => { /* ... نفس كود الاتصال بقاعدة البيانات ... */ })();

app.post('/api/review', async (req, res) => {
    try {
        const { roomNumber, cleanliness, reception, services, comments } = req.body;
        await db.run('INSERT INTO reviews (roomNumber, cleanliness, reception, services, comments) VALUES (?, ?, ?, ?, ?)', [roomNumber, cleanliness, reception, services, comments]);
        newReviewsCounter++;

        if (newReviewsCounter >= 3) {
            console.log(`📬 Triggering text report generation...`);
            
            const allStats = await db.get(`SELECT COUNT(id) as total_reviews, AVG(cleanliness) as avg_cleanliness, AVG(reception) as avg_reception, AVG(services) as avg_services FROM reviews`);
            const recentReviews = await db.all('SELECT * FROM reviews ORDER BY id DESC LIMIT 3');
            
            // بناء التقرير النصي كـ HTML
            let reportHtml = `<div dir="rtl" style="font-family: Arial, sans-serif;"><h2>تقرير تراكمي</h2>`;
            reportHtml += `<p><strong>إجمالي التقييمات:</strong> ${allStats.total_reviews}</p>`;
            reportHtml += `<p><strong>معدل النظافة:</strong> ${allStats.avg_cleanliness.toFixed(2)} / 5</p>`;
            reportHtml += `<p><strong>معدل الاستقبال:</strong> ${allStats.avg_reception.toFixed(2)} / 5</p>`;
            reportHtml += `<p><strong>معدل الخدمات:</strong> ${allStats.avg_services.toFixed(2)} / 5</p><hr>`;
            reportHtml += `<h3>آخر 3 تقييمات:</h3>`;
            recentReviews.forEach(r => {
                reportHtml += `<p><b>غرفة ${r.roomNumber}:</b> نظافة (${r.cleanliness}★), استقبال (${r.reception}★), خدمات (${r.services}★) - <em>${r.comments || 'لا تعليق'}</em></p>`;
            });
            reportHtml += `</div>`;

            await sendTextReport(reportHtml);
            newReviewsCounter = 0;
        }
        res.status(201).json({ success: true, message: 'شكرًا لك! تم استلام تقييمك.' });
    } catch (error) {
        console.error('❌ Error processing review:', error);
        res.status(500).json({ success: false, message: 'خطأ في السيرفر.' });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running in "Text Report" mode on port ${PORT}`));
