import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json()); // Gelen şifreli paketleri okuyabilmek için

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. MAVİ BUTONLU GİRİŞ EKRANI (FRONTEND)
// Kullanıcı siteye girdiğinde senin o şık index.html sayfanı açar
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TShop - Güvenli Giriş</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
    <div class="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl text-center">
        <h1 class="text-3xl font-bold text-white mb-2">TShop v4.0</h1>
        <p class="text-sm text-slate-400 mb-8">Devam etmek için Telegram hesabınızla kimliğinizi doğrulayın.</p>
        <div id="status-box" class="hidden mb-4 p-3 rounded-xl text-sm border font-medium"></div>
        <button id="tg-login-btn" class="w-full bg-[#24A1DE] hover:bg-[#1e8bc2] text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-3">
            Telegram ile Giriş Yap
        </button>
        <div id="loading-spinner" class="hidden mx-auto w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mt-4"></div>
    </div>

    <script>
        const loginBtn = document.getElementById('tg-login-btn');
        const statusBox = document.getElementById('status-box');
        const spinner = document.getElementById('loading-spinner');

        function showMessage(msg, type) {
            statusBox.classList.remove('hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20', 'bg-red-500/10', 'text-red-400', 'border-red-500/20');
            statusBox.classList.add(type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10');
            statusBox.innerText = msg;
            statusBox.classList.remove('hidden');
        }

        loginBtn.addEventListener('click', async () => {
            const tg = window?.Telegram?.WebApp;
            if (!tg || !tg.initDataUnsafe?.user) {
                showMessage("Hata: Bu siteye direkt tarayıcıdan değil, Telegram botunuzun açtığı Mini App içinden girmelisiniz!", "error");
                return;
            }

            loginBtn.style.display = 'none';
            spinner.classList.remove('hidden');

            try {
                const response = await fetch('/api/auth/telegram', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ initData: tg.initData }),
                });

                const result = await response.json();
                spinner.classList.add('hidden');

                if (response.ok && result.success) {
                    showMessage("Giriş Başarılı! Kayıt oluşturuldu. Kullanıcı: " + result.user.username, "success");
                    if (tg.expand) tg.expand();
                } else {
                    loginBtn.style.display = 'flex';
                    showMessage(result.error || "Giriş reddedildi.", "error");
                }
            } catch (err) {
                loginBtn.style.display = 'flex';
                spinner.classList.add('hidden');
                showMessage("Güvenlik duvarına bağlanılamadı.", "error");
            }
        });
    </script>
</body>
</html>
    `);
});

// 2. GELİŞMİŞ GÜVENLİK ODASI (BACKEND API)
// Butona basıldığında arkada çalışan, bot şifrenle imzayı doğrulayan kısım
app.post('/api/auth/telegram', (req, res) => {
    try {
        const { initData } = req.body;
        if (!initData) return res.status(400).json({ error: 'Telegram verisi eksik.' });

        // Vercel paneline girdiğin gizli bot şifresi
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) return res.status(500).json({ error: 'Sunucu hatası: Bot Token tanımlanmamış!' });

        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        urlParams.delete('hash');

        const dataCheckArr = [];
        for (const [key, value] of urlParams.entries()) {
            dataCheckArr.push(`${key}=${value}`);
        }
        dataCheckArr.sort();
        const dataCheckString = dataCheckArr.join('\n');

        // HMAC-SHA256 Şifre Doğrulama Algoritması
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const myCalculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        // Güvenli imza karşılaştırması
        const isVerified = crypto.timingSafeEqual(
            Buffer.from(myCalculatedHash, 'utf-8'),
            Buffer.from(hash, 'utf-8')
        );

        if (!isVerified) {
            return res.status(401).json({ error: 'Güvenlik İhlali: Sahte İmza!' });
        }

        const userRaw = JSON.parse(urlParams.get('user'));

        // OTOMATİK HESAP KARTI OLUŞTURMA
        return res.status(200).json({
            success: true,
            user: {
                id: `tg_${userRaw.id}`,
                username: userRaw.username || userRaw.first_name,
                points: 1000,
                level: 1
            }
        });

    } catch (error) {
        return res.status(500).json({ error: 'Sistemsel doğrulama hatası.' });
    }
});

// Sunucunun Vercel üzerinde veya yerelde dinleyeceği kapı
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`);

export default app;
                showMessage("Güvenlik duvarına bağlanılamadı.", "error");
            }
        });
    </script>
</body>
</html>
    `);
});

// 2. GELİŞMİŞ GÜVENLİK ODASI (BACKEND API)
// Butona basıldığında arkada çalışan, bot şifrenle imzayı doğrulayan kısım
app.post('/api/auth/telegram', (req, res) => {
    try {
        const { initData } = req.body;
        if (!initData) return res.status(400).json({ error: 'Telegram verisi eksik.' });

        // Vercel paneline girdiğin gizli bot şifresi
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) return res.status(500).json({ error: 'Sunucu hatası: Bot Token tanımlanmamış!' });

        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        urlParams.delete('hash');

        const dataCheckArr = [];
        for (const [key, value] of urlParams.entries()) {
            dataCheckArr.push(`${key}=${value}`);
        }
        dataCheckArr.sort();
        const dataCheckString = dataCheckArr.join('\n');

        // HMAC-SHA256 Şifre Doğrulama Algoritması
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const myCalculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        // Güvenli imza karşılaştırması
        const isVerified = crypto.timingSafeEqual(
            Buffer.from(myCalculatedHash, 'utf-8'),
            Buffer.from(hash, 'utf-8')
        );

        if (!isVerified) {
            return res.status(401).json({ error: 'Güvenlik İhlali: Sahte İmza!' });
        }

        const userRaw = JSON.parse(urlParams.get('user'));

        // OTOMATİK HESAP KARTI OLUŞTURMA
        return res.status(200).json({
            success: true,
            user: {
                id: `tg_${userRaw.id}`,
                username: userRaw.username || userRaw.first_name,
                points: 1000,
                level: 1
            }
        });

    } catch (error) {
        return res.status(500).json({ error: 'Sistemsel doğrulama hatası.' });
    }
});

// Sunucunun Vercel üzerinde veya yerelde dinleyeceği kapı
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`);

export default app;
