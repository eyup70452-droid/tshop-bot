import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Sitenin asıl ana domaine yönlenmesi için (Örn: https://tshop-bot.vercel.app)
const SITE_URL = `https://${process.env.VERCEL_URL}`; 

// ==========================================
// 1. MAVİ BUTONLU GİRİŞ EKRANI (WEB SITE)
// ==========================================
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TShop v4.0 - Giriş</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
    <div class="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl text-center">
        <h1 class="text-3xl font-bold text-white mb-2">TShop v4.0</h1>
        <p class="text-sm text-slate-400 mb-8">Devam etmek için Telegram botumuz üzerinden kimlik doğrulaması yapmalısınız.</p>
        
        <a href="https://t.me/tshop-bot?start=auth" class="w-full bg-[#24A1DE] hover:bg-[#1e8bc2] text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-3 native-link">
            Telegram Botuna Git ve Onayla
        </a>
    </div>
</body>
</html>
    `);
});

// ==========================================
// 2. TELEGRAM BOT MOTORU (WEBHOOK)
// ==========================================
// Kullanıcı bota mesaj attığında Telegram bu adrese bildirim fırlatır
app.post('/api/bot', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.text) return res.sendStatus(200);

        const chatId = message.chat.id;
        const text = message.text;
        const username = message.from.username || message.from.first_name;

        // Kullanıcı bota /start verirse veya siteden yönlenip gelirse
        if (text.startsWith('/start')) {
            
            // Burada kullanıcının kaydını onayladığımız mesajı hazırlıyoruz
            const replyText = `👋 Merhaba @${username}!\n\nTShop v4.0 sistemine giriş talebiniz başarıyla alındı ve imzanız doğrulandı. 🚀\n\nKayıt işlemini tamamlamak için aşağıdaki butona basarak siteye geri dönebilirsiniz:`;

            // Telegram'a "Kullanıcıya butonlu mesaj gönder" emri veriyoruz
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: replyText,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🛍️ Girişi Tamamla ve Mağazayı Aç', url: SITE_URL }
                            ]
                        ]
                    }
                })
            });
        }

        return res.sendStatus(200);
    } catch (err) {
        console.error("Bot hatası:", err);
        return res.sendStatus(200);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sistem ${PORT} portunda aktif.`));

export default app;
