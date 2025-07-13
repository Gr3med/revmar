const express = require('express');
const cors = require('cors');
// const cron = require('node-cron');  <-- لم نعد بحاجة لهذه الحزمة، يمكنك حذف السطر
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const { sendEmailNotification, sendWhatsAppNotification } = require('./notifications'); // سنغير أسماء الوظائف لتكون أوضح
const path = require('path'); // للتأكد من وجود هذا السطر

const app = express();
const PORT = 3000;

// إعدادات Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;

// وظيفة للاتصال بقاعدة البيانات
(async () => {
    db = await open({
        filename: './hotel_reviews.db',
        driver: sqlite3.Database
    });
})();

// لعرض صفحة HTML عند زيارة الرابط الرئيسي (الحل الاحترافي)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mr.html'));
});


// --- !! الجزء الرئيسي الذي تم تعديله !! ---
// 1. نقطة النهاية (Endpoint) لاستقبال التقييمات وإرسالها فورًا
app.post('/api/review', async (req, res) => {
    const { roomNumber, cleanliness, reception, services, comments } = req.body;

    if (!roomNumber || !cleanliness || !reception || !services) {
        return res.status(400).json({ message: 'الرجاء ملء جميع حقول التقييم المطلوبة.' });
    }

    try {
        // الخطوة أ: حفظ التقييم في قاعدة البيانات
        const sql = `INSERT INTO reviews (roomNumber, cleanliness, reception, services, comments) VALUES (?, ?, ?, ?, ?)`;
        await db.run(sql, [roomNumber, cleanliness, reception, services, comments]);
        
        // الخطوة ب: بناء رسالة الإشعار الفوري
        let notificationMessage = `🛎️ تقييم جديد وفوري من النزيل\n`;
        notificationMessage += `------------------------------------\n`;
        notificationMessage += `غرفة رقم: ${roomNumber}\n`;
        notificationMessage += `النظافة: ${'★'.repeat(cleanliness)}${'☆'.repeat(5 - cleanliness)}\n`;
        notificationMessage += `الاستقبال: ${'★'.repeat(reception)}${'☆'.repeat(5 - reception)}\n`;
        notificationMessage += `الخدمات: ${'★'.repeat(services)}${'☆'.repeat(5 - services)}\n`;
        notificationMessage += `ملاحظات: ${comments || 'لا يوجد'}\n`;
        notificationMessage += `------------------------------------`;

        // الخطوة ج: إرسال الإشعارات فورًا
        console.log("إرسال إشعار فوري...");
        await sendEmailNotification(notificationMessage);
        await sendWhatsAppNotification(notificationMessage);

        // الخطوة د: إرسال رد ناجح للنزيل
        res.status(201).json({ message: 'شكرًا لك! تم استلام تقييمك بنجاح.' });

    } catch (error) {
        console.error("خطأ في معالجة التقييم:", error);
        res.status(500).json({ message: 'حدث خطأ في السيرفر أثناء معالجة التقييم.' });
    }
});
// ----------------------------------------------------

// تم حذف مهمة cron.schedule(...) بالكامل لأنها لم تعد مطلوبة

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل الآن على http://localhost:${PORT}`);
    console.log(`- السيرفر الآن في وضع الإرسال الفوري للتقييمات.`);
});