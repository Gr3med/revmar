const sqlite3 = require('sqlite3').verbose();

// اسم ملف قاعدة البيانات
const DB_SOURCE = "hotel_reviews.db";

// الاتصال بقاعدة البيانات (أو إنشائها إذا لم تكن موجودة)
const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        // لا يمكن فتح قاعدة البيانات
        console.error(err.message);
        throw err;
    } else {
        console.log('تم الاتصال بقاعدة بيانات SQLite.');
        // إنشاء جدول التقييمات
        db.run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roomNumber TEXT,
            cleanliness INTEGER,
            reception INTEGER,
            services INTEGER,
            comments TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                // حدث خطأ أثناء إنشاء الجدول
                console.error("خطأ في إنشاء الجدول:", err.message);
            } else {
                console.log("الجدول 'reviews' جاهز للاستخدام.");
            }
        });
    }
});

module.exports = db;