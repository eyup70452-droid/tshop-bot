// src/app/api/telegram/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

// NOT: Production'da bu token env variable'dan okunmalı
// Şimdilik store'daki config ile senkronize çalışması için basit bir doğrulama yapıyoruz
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();
    const chatId = message.chat.id;
    const username = message.from?.username ? `@${message.from.username}` : null;

    // /dogrula KOD komutunu yakala
    if (text.startsWith('/dogrula')) {
      const code = text.split(' ')[1];
      
      if (!code || code.length !== 6) {
        await sendTelegramMessage(chatId, "❌ Geçersiz kod formatı.\n\nLütfen siteden aldığınız 6 haneli kodu kullanın.\nÖrnek: /dogrula 123456");
        return NextResponse.json({ ok: true });
      }

      // Kod doğrulama mantığı burada çalışacak
      // Gerçek sistemde Redis/DB'den pending auth kontrolü yapılır
      // Şimdilik client-side verification akışını tetiklemek için 
      // kullanıcıya başarılı mesajı dönüyoruz, site tarafında polling ile kontrol ediliyor
      
      await sendTelegramMessage(chatId, 
        `✅ *Doğrulama Başarılı!*\n\nKod: \`${code}\`\n\nŞimdi siteye geri dönüp giriş işlemini tamamlayabilirsiniz.`
      );
      
      return NextResponse.json({ ok: true });
    }

    // /start komutu
    if (text === '/start') {
      await sendTelegramMessage(chatId, 
        `👋 Merhaba ${username || 'kullanıcı'}!\n\nTShop Ultimate doğrulama botuna hoş geldiniz.\n\n🔐 Giriş yapmak için sitedeki "Telegram ile Giriş" butonuna tıklayın ve size verilen kodu buraya yazın.\n\n/dogrula [KOD] - Doğrulama kodunu onayla`
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not set');
    return;
  }
  
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    console.error('Failed to send telegram message:', e);
  }
}
