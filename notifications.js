const nodemailer = require('nodemailer');
const config = require('./config.js');

async function sendTextReport(reportContent, totalReviews) {
    if (!config.email.enabled) {
        console.log("ℹ️ Email notifications are disabled.");
        return;
    }

    console.log("📧 Attempting to create email transporter...");
    const transporter = nodemailer.createTransport(config.email.sender);
    console.log("✅ Transporter created.");

    const mailOptions = {
        from: `"تقارير الفندق" <${config.email.sender.auth.user}>`,
        to: config.email.recipient,
        subject: `📊 تقرير تقييمات تراكمي جديد (الإجمالي: ${totalReviews})`,
        html: reportContent
    };

    console.log(`📤 Sending email to: ${config.email.recipient}...`);
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully.");
}

module.exports = { sendTextReport };
