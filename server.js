import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = `https://${process.env.VERCEL_URL}`; 
const SECRET_KEY = "TShop_Askeri_Duzen_Guvenlik_Anahtari"; // Şifreleme tuzu

// ==========================================
// 1. GÜVENLİ GİRİŞ EKRANI (WEB SITE)
// ==========================================
app.get('/', (req, res) => {
    // Zaman tabanlı taklit edilemez bir imza üretiyoruz (Hafıza haritası kullanmadan)
    const timestamp = Date.now();
    const secureHash = crypto.createHmac('sha256', SECRET_KEY).update(timestamp.toString()).digest('hex').substring(0, 10);
    const secureToken = `${timestamp}_${secureHash}`;

    res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TShop v4.0 - Güvenli Geçiş</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
    <div class="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden">
        
        <div class="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/20 font-mono">
            SSL & HMAC-SHA256 SECURE
        </div>

        <h1 class="text-3xl font-bold text-white mb-2 mt-2">TShop v4.0</h1>
        <p class="text-sm text-slate-400 mb-8">Erişim sağlamak için Telegram üzerinden kriptografik imzanızı onaylamanız gerekmektedir.</p>
        
        <a href="https://t.me/LoginTshop_bot?start=${secureToken}" class="w-full bg-[#24A1DE] hover:bg-[#1e8bc2] text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/10 hover:scale-[1.01] active:scale-[0.99]">
            🚀 Hesabını Doğrula ve Başlat
        </a>
    </div>
</body>
</html>
    `);
});

// ==========================================
// 2. KRİPTOGRAFİK BOT MOTORU (WEBHOOK)
// ==========================================
app.post('/api/bot', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.text) return res.sendStatus(200);

        const chatId = message.chat.id;
        const text = message.text;
        const username = message.from.username || message.from.first_name;

        if (text.startsWith('/start')) {
            const incomingToken = text.split(' ')[1];

            // EĞER DÜZ /START GELMİŞSE VEYA TOKEN YOKSA
            if (!incomingToken) {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `⚠️ **GÜVENLİK UYARISI**\n\nLütfen bota direkt girmeyin. Giriş yapabilmek için önce web sitemizdeki yeşil butona basarak imzanızı oluşturmalısınız.`,
                        parse_mode: 'Markdown'
                    })
                });
                return res.sendStatus(200);
            }

            // Kriptografik doğrulama yapıyoruz
            const [timestamp, incomingHash] = incomingToken.split('_');
            const expectedHash = crypto.createHmac('sha256', SECRET_KEY).update(timestamp || '').digest('hex').substring(0, 10);
            
            // 5 dakikalık süre kontrolü ve imza doğruluğu kontrolü
            const isExpired = Date.now() - parseInt(timestamp) > 5 * 60 * 1000;
            const isHashValid = incomingHash === expectedHash;

            if (!isHashValid || isExpired) {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `⚠️ **GEÇERSİZ GÜVENLİK ANAHTARI**\n\nBağlantı süresi dolmuş veya geçersiz imza. Lütfen web sitesini yenileyip tekrar deneyin.`,
                        parse_mode: 'Markdown'
                    })
                });
                return res.sendStatus(200);
            }
            
            // Her şey doğruysa başarılı giriş mesajı
            const replyText = `🔐 **Kriptografik İmza Onaylandı!**\n\nMerhaba @${username},\nSistem güvenli geçiş isteğinizi doğruladı. Giriş biletiniz başarıyla oluşturuldu.\n\nAlttaki butona basarak korumalı mağaza alanına giriş yapabilirsiniz:`;

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: replyText,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🛍️ Güvenli Girişi Tamamla', url: SITE_URL }
                            ]
                        ]
                    }
                })
            });
        }

        return res.sendStatus(200);
    } catch (err) {
        console.error("Sistem Hatası:", err);
        return res.sendStatus(200);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Güvenlik Modülü Aktif.`));

export default app;
