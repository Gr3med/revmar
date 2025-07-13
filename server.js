const express = require('express');
const cors = require('cors');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');
require('dotenv').config();

const { sendCumulativeReport } = require('./notifications.js');
const { createCumulativePdfReport } = require('./createPdfReport.js');

const app = express();
// في ملف server.js
const PORT = process.env.PORT || 3000; // هذا السطر مهم جدًا

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mr.html'));
});

let db;
// عدّاد لتتبع التقييمات الجديدة
let newReviewsCounter = 0;

(async () => {
    try {
        db = await open({ filename: './hotel_reviews.db', driver: sqlite3.Database });
        console.log('✅ DB Connected.');
        await db.exec(`CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY, roomNumber TEXT, cleanliness INTEGER, reception INTEGER, services INTEGER, comments TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    } catch (error) {
        console.error('❌ DB Connection Failed:', error.message);
        process.exit(1);
    }
})();

// =================================================================
//          ** المنطق الجديد: إرسال تقرير بعد كل 3 تقييمات **
// =================================================================
app.post('/api/review', async (req, res) => {
    try {
        const { roomNumber, cleanliness, reception, services, comments } = req.body;
        
        // 1. حفظ التقييم الجديد
        await db.run('INSERT INTO reviews (roomNumber, cleanliness, reception, services, comments) VALUES (?, ?, ?, ?, ?)', 
            [roomNumber, cleanliness, reception, services, comments]);
        console.log(`💾 Review from room ${roomNumber} saved. Counter incremented.`);

        // 2. زيادة العدّاد
        newReviewsCounter++;
        
        // 3. التحقق مما إذا كان يجب إرسال التقرير
        if (newReviewsCounter >= 3) {
            console.log(`📬 Triggering cumulative report generation (${newReviewsCounter} new reviews)...`);
            
            // --- بدء عملية إنشاء التقرير ---
            let pdfPath = null;
            try {
                // أ. جلب الإحصائيات التراكمية لكل التقييمات
                const allStats = await db.get(`SELECT COUNT(id) as total_reviews, AVG(cleanliness) as avg_cleanliness, AVG(reception) as avg_reception, AVG(services) as avg_services FROM reviews`);
                
                // ب. جلب آخر 3 تقييمات
                const recentReviews = await db.all('SELECT * FROM reviews ORDER BY id DESC LIMIT 3');
                
                // ج. إنشاء ملف الـ PDF
                pdfPath = await createCumulativePdfReport(allStats, recentReviews);
                
                // د. إرسال الإيميل
                await sendCumulativeReport(pdfPath, allStats.total_reviews);
                
                // هـ. إعادة تصفير العدّاد بعد الإرسال الناجح
                console.log('✅ Report sent successfully. Resetting counter.');
                newReviewsCounter = 0;

            } catch (reportError) {
                console.error('❌ Failed to generate or send the cumulative report:', reportError);
                // لا نرسل رد خطأ للمستخدم هنا، لأن تقييمه تم حفظه بنجاح
            } finally {
                // حذف الملف المؤقت دائمًا
                if (pdfPath && fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                    console.log(`🗑️ Temporary PDF file deleted.`);
                }
            }
        } else {
            console.log(`⏳ Counter is at ${newReviewsCounter}. Waiting for more reviews.`);
        }

        // إرسال رد ناجح للمستخدم فورًا (لأن تقييمه تم حفظه)
        res.status(201).json({ success: true, message: 'شكرًا لك! تم استلام تقييمك بنجاح.' });

    } catch (dbError) {
        console.error('❌ DB Error while saving review:', dbError);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ تقييمك.' });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running in "Cumulative Report" mode on http://localhost:${PORT}`));
