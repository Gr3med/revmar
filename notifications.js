const nodemailer = require('nodemailer');
const config = require('./config.js');

async function sendCumulativeReport(pdfPath, totalReviews) {
    if (!config.email.enabled) return;

    try {
        const transporter = nodemailer.createTransport(config.email.sender);
        await transporter.sendMail({
            from: `"تقارير الفندق التراكمية" <${config.email.sender.auth.user}>`,
            to: config.email.recipient,
            subject: `📊 تقرير تقييم تراكمي جديد (الإجمالي: ${totalReviews} تقييم)`,
            html: `<div dir="rtl"><p>مرحبًا،</p><p>تم استلام مجموعة جديدة من التقييمات. مرفق طيه التقرير التراكمي المحدّث.</p></div>`,
            attachments: [{
                filename: `Cumulative-Report-${totalReviews}-reviews.pdf`,
                path: pdfPath,
                contentType: 'application/pdf'
            }]
        });
        console.log('📧 Cumulative PDF report sent successfully.');
    } catch (error) {
        console.error('❌ Error sending cumulative PDF report:', error);
        throw error;
    }
}

module.exports = { sendCumulativeReport };