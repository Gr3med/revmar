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
    connectionString: process---

### خطة العمل النهائية (الانتقال إلى Brevo)

#### المرحلة الأولى: إعداد حساب Brevo

1.  اذهب إلى [Brevo.com](https://www.brevo.com/) وأنشئ حسابًا مجانيًا.
2.  أكمل خطوات تفعيل الحساب (قد يطلبون منك إضافة بعض المعلومات).
3.  من لوحة التحكم، اذهب إلى `Transactional` في القائمة العلوية.
4.  في القائمة الجانبية، اذهب إلى `Settings` ثم `Senders & Domains`. قم.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

let dbReady = false; // متغير لتتبع حالة الاتصال بقاعدة البيانات

// --- تعديل مهم: بدء السيرفر أولاً ---
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
    
    // --- ثم محاولة الاتصال بقاعدة البيانات في الخلفية ---
    dbClient.connect()
        .then(() => {
            console.log('✅ Connected to PostgreSQL DB.');
            // إنشاء الجدول
            return dbClient.query(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, "roomNumber" VARCHAR(50), بإضافة وتأكيد عنوان بريدك الإلكتروني (الذي سترسل منه).
5.  الآن، اذهب إلى `SMTP & API` في القائمة الجانبية.
6.  ستجد **بيانات SMTP** الخاصة بك. **انسخ هذه المعلومات واحتفظ بها:**
    *   **SMTP Server:** (عادة `smtp-relay.brevo.com`)
    *   **Port:** (عادة `587`)
    * cleanliness INTEGER, reception INTEGER, services INTEGER, comments TEXT, "createdAt" TIMESTAMPTZ DEFAULT NOW());`);
        })
        .then(() => {
            dbReady = true; // تمكين معالجة الطلبات بعد نجاح الاتصال
            console.log("✅ Database is ready.");
        })
        .catch(error => {
   **Login:** (بريدك الإلكتروني الذي سجلت به)
    *   **Password:** (ستجد زرًا لإنشاء كلمة مرور SMTP، أنشئ واحدة وانسخها).

#### المرحلة الثانية: تعديل الكود ومتغيرات البيئة

1.  **ملف `config.js`:**
    *   افتح الملف وقم بتعديل قسم `sender` ليتناسب مع Brevo.

    ```javascript
    // في config.js
    sender: {
        host: process.env.SMTP_HOST, // سنقرأ كل شيء من متغيرات البيئة
        port: process.env.SMTP_PORT,
        secure: false            console.error('❌ CRITICAL DB Connection/Setup Failed:', error);
            // لا نوقف السيرفر، لكننا لن نتمكن من معالجة الطلبات
        });
});

let newReviewsCounter = 0;

app.post('/api/review', async (req, res) => {
    // التحقق من أن قاعدة البيانات جاهزة قبل معالجة أي طلب
    if (!dbReady) {
        console.error("⚠️ Received request, but DB is not ready. Aborting.");
        return res.status(503).json({ success: false, message: 'السيرفر غير جاهز حاليًا، يرجى المحاولة بعد قليل.' });, // Brevo يستخدم TLS على المنفذ 587، لذا secure تكون false
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS 
        }
    }
    ```

2.  **لوحة تحكم Render - `Environment`:**
    *   اذهب إلى قسم `Environment` في Render.
    *   **احذف المتغيرين القديمين:** `SENDER_EMAIL` و `SENDER_PASS`.
    *   **أضف المتغيرات الجديدة
    }

    try {
        // ... (باقي كود معالجة الطلب يبقى كما هو)
    } catch (error) {
        // ...
    }
});
