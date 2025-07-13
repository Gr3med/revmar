// --- !! ملف الإعدادات الهامة: قم بتعديل هذه القيم !! ---

module.exports = {
    // إعدادات البريد الإلكتروني (استخدم Gmail كمثال)
   // في ملف config.js
email: {
    enabled: true, 
    // للتجربة، ضع نفس الإيميل هنا
    recipient: 'tst.re7122@gmail.com', 
    
    sender: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'tst.re7122@gmail.com',  
            // الصق كلمة المرور الجديدة المكونة من 16 حرفًا هنا (بدون مسافات)
            pass: 'rjdufnmwaumjiuml' 
        }
    }
},

    // إعدادات بوت الواتساب
    whatsapp: {
        enabled: true, // true لتفعيل إرسال الواتساب، false لإيقافه
        // هذا هو الرابط (Webhook) الذي يوفره البوت الخاص بك لاستقبال الرسائل
        botWebhookUrl: 'https://api.yourbot.com/sendMessage' 
    },

    // إعدادات الملخص الأسبوعي
    summary: {
        // توقيت إرسال الملخص (بصيغة Cron)
        // هذا المثال يعني: "في الساعة 9:00 صباحًا، كل يوم أحد"
        schedule: '0 9 * * 0'
    }
};