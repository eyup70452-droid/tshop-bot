import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Geçersiz yöntem.' });
    }

    try {
        const { initData } = req.body; 
        if (!initData) {
            return res.status(400).json({ error: 'Telegram verisi bulunamadı.' });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return res.status(500).json({ error: 'Sunucu hatası: Bot Token kilitli veya eksik!' });
        }

        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash'); 
        urlParams.delete('hash'); 

        const dataCheckArr = [];
        for ( const [key, value] of urlParams.entries() ) {
            dataCheckArr.push(`${key}=${value}`);
        }
        dataCheckArr.sort();
        const dataCheckString = dataCheckArr.join('\n');

        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const myCalculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        const isVerified = crypto.timingSafeEqual(
            Buffer.from(myCalculatedHash, 'utf-8'),
            Buffer.from(hash, 'utf-8')
        );

        if (!isVerified) {
            return res.status(401).json({ error: 'Gelişmiş Güvenlik İhlali: Sahte veya Değiştirilmiş İmza!' });
        }

        const userRaw = JSON.parse(urlParams.get('user'));

        // OTOMATİK HESAP OLUŞTURMA KARTI
        const createdUser = {
            id: `tg_${userRaw.id}`, 
            username: userRaw.username || `${userRaw.first_name}`, 
            role: 'user', 
            points: 1000, 
            level: 1,
            xp: 0
        };

        return res.status(200).json({
            success: true,
            user: createdUser
        });

    } catch (error) {
        return res.status(500).json({ error: 'Doğrulama esnasında sistemsel bir hata meydana geldi.' });
    }
}
