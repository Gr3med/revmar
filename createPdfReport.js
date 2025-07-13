const puppeteer = require('puppeteer'); // سنستخدم النسخة الكاملة
const fs = require('fs');
const path = require('path');

async function createCumulativePdfReport(stats, recentReviews) {
    const reportPath = path.join(__dirname, `Cumulative-Report-${Date.now()}.pdf`);
    const today = new Date();
    const htmlContent = `...`; // الكود الطويل لتصميم الـ PDF يبقى كما هو

    let browser = null;
    try {
        // --- !! هذا هو التعديل الأهم !! ---
        // إعدادات خاصة لتعمل في بيئة محدودة الموارد مثل Render
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-zygote',
                '--single-process' // مهم جدًا لتقليل استهلاك الذاكرة
            ]
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.pdf({ path: reportPath, format: 'A4', printBackground: true });
        console.log(`📄 PDF report created.`);
        return reportPath;

    } catch (error) {
        console.error("❌ Error during PDF generation:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { createCumulativePdfReport };
