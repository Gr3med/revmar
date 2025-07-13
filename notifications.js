const nodemailer = require('nodemailer');
const axios = require('axios');
const config = require('./config');

// وظيفة لإرسال إشعار عبر البريد الإلكتروني
async function sendEmailNotification(message) {
    if (!config.email.enabled) {
        console.log("إرسال البريد الإلكتروني معطل في الإعدادات.");
        return;
    }

    try {
        const transporter = nodemailer.createTransport(config.email.sender);
        
        await transporter.sendMail({
            from: `"تقييمات فندق ماريوت" <${config.email.sender.auth.user}>`,
            to: config.email.recipient,
            subject: '🛎️ إشعار بتقييم جديد من نزيل!', // <-- عنوان جديد ومناسب
            text: message,
            html: `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; white-space: pre-wrap;">${message}</div>`
        });

        console.log('تم إرسال إشعار البريد الإلكتروني بنجاح.');
    } catch (error) {
        console.error('خطأ أثناء إرسال البريد الإلكتروني:', error);
    }
}

// وظيفة لإرسال إشعار عبر بوت الواتساب
async function sendWhatsAppNotification(message) {
    if (!config.whatsapp.enabled) {
        console.log("إرسال الواتساب معطل في الإعدادات.");
        return;
    }

    if (!config.whatsapp.botWebhookUrl || config.whatsapp.botWebhookUrl === 'https://api.yourbot.com/sendMessage') {
        console.error("الرجاء تحديد رابط Webhook صحيح لبوت الواتساب في ملف config.js");
        return;
    }

    try {
        await axios.post(config.whatsapp.botWebhookUrl, {
            message: message // افترضنا أن البوت الخاص بك يقبل حقل 'message'
        });
        console.log('تم إرسال إشعار الواتساب بنجاح.');
    } catch (error) {
        console.error('خطأ أثناء إرسال إشعار الواتساب:', error.message);
    }
}

module.exports = { sendEmailNotification, sendWhatsAppNotification };