const nodemailer = require('nodemailer');
const config = require('./config.js');

async function sendTextReport(reportContent, totalReviews) {
    if (!config.email.enabled) return;
    try {
        const transporter = nodemailer.createTransport(config.email.sender);
        await transporter.sendMail({
            from: `"تقارير الفندق" <${config.email.sender.auth.user}>`,
            to: config.email.recipient,
            subject: `📊 تقرير تقييمات تراكمي جديد (الإجمالي: ${totalReviews})`,
            html: reportContent
        });
        console.log('📧 Text report sent successfully.');
    } catch (error) {
        console.error('❌ Error sending text report:', error);
    }
}
module.exports = { sendTextReport };
