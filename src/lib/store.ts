// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// SABITLER & TİPLER
// =============================================================================
export const ROLES = {
  FOUNDER: 'founder',
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  AUTHORITY: 'authority',
  MODERATOR: 'moderator',
  SELLER: 'seller',
  USER: 'user',
} as const;

export const ROLE_HIERARCHY: Record<string, number> = {
  [ROLES.FOUNDER]: 7,
  [ROLES.SUPER_ADMIN]: 6,
  [ROLES.ADMIN]: 5,
  [ROLES.AUTHORITY]: 4,
  [ROLES.MODERATOR]: 3,
  [ROLES.SELLER]: 2,
  [ROLES.USER]: 1,
};

export const hasPermission = (userRole: string, requiredLevel: number): boolean => {
  return (ROLE_HIERARCHY[userRole] || 0) >= requiredLevel;
};

export const VIP_LEVELS = {
  NONE: 'none',
  STANDARD: 'standard',
  PRO: 'pro',
  MAX: 'max',
} as const;

export const VIP_BENEFITS: Record<string, any> = {
  [VIP_LEVELS.STANDARD]: {
    name: "Standart VIP", icon: "\u2B50", frame: "frame-silver",
    wheelRewards: [10, 20, 50, 100, 150, 200, 250, 300],
    wheelBelowChance: 0.70, boostProducts: 7, boostDays: 2,
    transferTaxRate: 0.01, monthlyGift: 0, priorityReturn: "normal",
  },
  [VIP_LEVELS.PRO]: {
    name: "Pro VIP", icon: "\uD83D\uDC8E", frame: "frame-gold",
    wheelRewards: [20, 40, 60, 100, 150, 175, 200, 225, 260, 300, 325],
    wheelBelowChance: 0.75, boostProducts: 14, boostDays: 4,
    transferTaxRate: 0.005, monthlyGift: 500, priorityReturn: "12h",  },
  [VIP_LEVELS.MAX]: {
    name: "Max VIP", icon: "\uD83D\uDC51", frame: "frame-diamond",
    wheelRewards: [20, 40, 60, 90, 130, 160, 190, 230, 270, 325, 380, 420],
    wheelBelowChance: 0.70, boostProducts: 28, boostDays: 8,
    transferTaxRate: 0, monthlyGift: 1500, priorityReturn: "6h",
  },
};

export const DEFAULT_CONFIG = {
  siteName: "TShop Ultimate",
  version: "20.0",
  telegramBotToken: "",
  telegramBotUsername: "",
  supportEmail: "destek@tshop.com",
  whatsappContact: "+905551234567",
  paymentMethods: {
    papara: { name: "TShop Official", number: "1234567890" },
    bank: { name: "TShop", iban: "TR00 0000 0000 0000 0000 0000 00" },
    crypto: { usdt_trc20: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }
  },
  commissionRate: 0.05,
  transferTax: 0.02,
  returnWindowHours: 48,
  maxBetLimit: 5000,
  minTransfer: 50,
  minWithdraw: 500,
  withdrawCommission: 0.03,
  dailyWithdrawCount: 3,
  maxReviewLength: 500,
  maxTicketsPerDay: 3,
  scratchCardCooldown: 86400000,
  sessionTimeout: 30 * 60 * 1000,
  tsRate: 0.20,
  settings: { maintenanceMode: false, registrationOpen: true },
};

export const DEFAULT_CATEGORIES = [
  { id: 'cat_1', name: 'Oyun Kodlar\u0131', icon: '\uD83C\uDFAE', subcats: ['Steam', 'Riot Games', 'Epic Games', 'Xbox', 'PlayStation'] },
  { id: 'cat_2', name: 'Streaming', icon: '\uD83D\uDCFA', subcats: ['Netflix', 'Disney+', 'BluTV', 'Exxen', 'Spotify', 'YouTube Premium'] },
  { id: 'cat_3', name: 'Hediye Kartlar\u0131', icon: '\uD83D\uDCB3', subcats: ['Google Play', 'Apple', 'Amazon', 'Razer Gold'] },
  { id: 'cat_4', name: 'Yaz\u0131l\u0131m Lisanslar\u0131', icon: '\uD83D\uDCBB', subcats: ['Windows', 'Office', 'Adobe', 'Antivir\u00FCs'] },
  { id: 'cat_5', name: 'E\u011Fitim', icon: '\uD83C\uDF93', subcats: ['Udemy', 'Coursera', 'MasterClass'] },
  { id: 'cat_6', name: 'Mobil Oyun', icon: '\uD83D\uDCF1', subcats: ['PUBG UC', 'Mobile Legends', 'Clash of Clans', 'Brawl Stars'] },
  { id: 'cat_7', name: 'VPN & G\u00FCvenlik', icon: '\uD83D\uDEE1\uFE0F', subcats: ['NordVPN', 'ExpressVPN', 'Surfshark'] },
  { id: 'cat_8', name: 'Tasar\u0131m', icon: '\uD83C\uDFA8', subcats: ['Canva', 'Figma', 'Adobe CC'] },
  { id: 'cat_9', name: 'Sosyal Medya', icon: '\uD83D\uDCF1', subcats: ['Discord Nitro', 'Twitter Blue', 'Telegram Premium'] },
  { id: 'cat_10', name: 'Crypto & Web3', icon: '\u20BF', subcats: ['NFT', 'Wallet Premium'] },
  { id: 'cat_11', name: 'AI Ara\u00E7lar\u0131', icon: '\uD83E\uDD16', subcats: ['ChatGPT Plus', 'Claude Pro', 'Midjourney'] },
  { id: 'cat_12', name: '\u00D6zel \u00DCr\u00FCnler', icon: '\u2728', subcats: ['Limited', 'Bundle'] },];

export const BADGES_DEF = [
  { id: 'first_purchase', name: '\u0130lk Ad\u0131m', icon: '\uD83D\uDECD\uFE0F', desc: '\u0130lk sipari\u015Fini ver', condition: (u: any) => u?.stats?.orders >= 1, xp: 50, tier: 'D' },
  { id: 'task_master', name: 'G\u00F6rev Ustas\u0131', icon: '\u2694\uFE0F', desc: '10 G\u00F6rev tamamla', condition: (u: any) => u?.stats?.tasksCompleted >= 10, xp: 200, tier: 'C' },
  { id: 'rich', name: 'Zengin', icon: '\uD83D\uDC8E', desc: '5000 TS biriktir', condition: (u: any) => u?.points >= 5000, xp: 500, tier: 'B' },
  { id: 'social', name: 'Sosyal', icon: '\uD83D\uDDE3\uFE0F', desc: '5 Yorum yap', condition: (u: any) => u?.stats?.reviewsWritten >= 5, xp: 150, tier: 'D' },
  { id: 'collector', name: 'Koleksiyoncu', icon: '\uD83C\uDFC6', desc: '10 Favori ekle', condition: (u: any) => u?.stats?.favorites >= 10, xp: 100, tier: 'C' },
  { id: 'vip', name: 'VIP \u00DCye', icon: '\uD83D\uDC51', desc: 'VIP ol', condition: (u: any) => u?.vipLevel && u.vipLevel !== VIP_LEVELS.NONE, xp: 1000, tier: 'A' },
  { id: 'referrer', name: 'Davet\u00E7i', icon: '\uD83D\uDCE2', desc: '5 Ki\u015Fi davet et', condition: (u: any) => u?.referrals?.count >= 5, xp: 300, tier: 'B' },
  { id: 'shopaholic', name: 'Al\u0131\u015Fveri\u015F Tutkunu', icon: '\uD83D\uDED2', desc: '50 Sipari\u015F ver', condition: (u: any) => u?.stats?.orders >= 50, xp: 2000, tier: 'S' },
  { id: 'streak_7', name: 'Haftal\u0131k Seri', icon: '\uD83D\uDD25', desc: '7 g\u00FCn \u00FCst \u00FCste giri\u015F', condition: (u: any) => u?.stats?.currentStreak >= 7, xp: 250, tier: 'C' },
  { id: 'reviewer_pro', name: 'Profesyonel Yorumcu', icon: '\uD83D\uDCDD', desc: '25 Yorum yap', condition: (u: any) => u?.stats?.reviewsWritten >= 25, xp: 500, tier: 'B' },
  { id: 'two_fa', name: 'G\u00FCvenlik Ustas\u0131', icon: '\uD83D\uDD10', desc: "2FA'y\u0131 aktif et", condition: (u: any) => u?.twoFA === true, xp: 200, tier: 'C' },
  { id: 'high_roller', name: 'Y\u00FCksek Bahis\u00E7i', icon: '\uD83C\uDFB0', desc: '100 oyun oyna', condition: (u: any) => u?.stats?.gamesPlayed >= 100, xp: 800, tier: 'A' },
  { id: 'lucky', name: '\u015Eansl\u0131', icon: '\uD83C\uDF40', desc: '500+ TS tek seferde kazan', condition: (u: any) => u?.stats?.biggestWin >= 500, xp: 400, tier: 'B' },
  { id: 'top_seller', name: 'Top Sat\u0131c\u0131', icon: '\u2B50', desc: '100 \u00FCr\u00FCn sat', condition: (u: any) => u?.stats?.itemsSold >= 100, xp: 1500, tier: 'S' },
];

// =============================================================================
// YARDIMCI FONKSİYONLAR
// =============================================================================
export const generateId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) { /* fallback */ }
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * GÜVENLİ SANITIZE - CharCode Tabanlı
 * GitHub web editörü bu kodu ASLA bozamaz
 */
const safeSanitize = (str: string, maxLen: number = 1000): string => {
  if (typeof str !== 'string') return '';
  const truncated = str.slice(0, maxLen);
  let result = '';
  for (let i = 0; i < truncated.length; i++) {
    const code = truncated.charCodeAt(i);
    if (code < 32 || code === 127) continue;
    if (code === 38) result += String.fromCharCode(38, 97, 109, 112, 59);
    else if (code === 60) result += String.fromCharCode(38, 108, 116, 59);
    else if (code === 62) result += String.fromCharCode(38, 103, 116, 59);
    else if (code === 34) result += String.fromCharCode(38, 113, 117, 111, 116, 59);
    else if (code === 39) result += String.fromCharCode(38, 35, 120, 50, 55, 59);
    else result += truncated[i];
  }
  return result;
};
// =============================================================================
// ATOMIC TRANSACTION MANAGER
// =============================================================================
class TransactionManager {
  private lock = false;
  private queue: (() => Promise<void>)[] = [];

  async execute(callback: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const task = async () => {
        try { resolve(await callback()); }
        catch (err) { reject(err); }
      };
      if (!this.lock) {
        this.lock = true;
        task().finally(() => {
          this.lock = false;
          if (this.queue.length > 0) this.queue.shift()!();
        });
      } else {
        this.queue.push(task);
      }
    });
  }
}

export const txManager = new TransactionManager();

// =============================================================================
// MOCK DATABASE INITIALIZATION
// =============================================================================
const createInitialDB = () => {
  const now = Date.now();
  return {
    config: DEFAULT_CONFIG,
    categories: DEFAULT_CATEGORIES,
    vipPrices: {
      standard: { weekly: 1200, monthly: 3700 },
      pro: { weekly: 2000, monthly: 5700 },
      max: { weekly: 3000, monthly: 6800 },
    },
    topUpPackages: [
      { id: 'pkg_1', amount: 300, price: 55, bonus: 0 },
      { id: 'pkg_2', amount: 750, price: 135, bonus: 25 },
      { id: 'pkg_3', amount: 1500, price: 265, bonus: 75, popular: true },
      { id: 'pkg_4', amount: 3000, price: 520, bonus: 150 },
      { id: 'pkg_5', amount: 6000, price: 1000, bonus: 400 },
      { id: 'pkg_6', amount: 15000, price: 2400, bonus: 1500 },
      { id: 'pkg_7', amount: 30000, price: 4600, bonus: 4000 },
    ],    users: [
      {
        id: 'u_founder', username: 'Founder', email: 'founder@tshop.com',
        telegramUsername: '@founder', role: ROLES.FOUNDER,
        points: 999999, sellerBalance: 0,
        referralCode: 'FOUNDER01', referredBy: null,
        referrals: { count: 0, l1: 0, l2: 0 },
        banned: false, badges: [], level: 99, xp: 0,
        vipLevel: VIP_LEVELS.MAX, vipExpiresAt: now + 365 * 86400000,
        stats: { orders: 0, tasksCompleted: 0, reviewsWritten: 0, favorites: 0, spent: 0, earned: 0, gamesPlayed: 0, biggestWin: 0, itemsSold: 0, currentStreak: 0, longestStreak: 0, flashPurchases: 0, lastSpin: 0, lastScratch: 0 },
        twoFA: true, passwordHash: '', passwordSalt: '', fingerprint: 'founder_fp',
        isSeller: false, sellerInfo: null, createdAt: now - 86400000 * 30, lastLogin: now,
        notifications: { orders: true, promotions: true, tasks: true }
      },
      {
        id: 'u_admin', username: 'Admin', email: 'admin@tshop.com',
        telegramUsername: '@admin', role: ROLES.ADMIN,
        points: 100000, sellerBalance: 0,
        referralCode: 'ADMIN01', referredBy: null,
        referrals: { count: 0, l1: 0, l2: 0 },
        banned: false, badges: [], level: 50, xp: 0,
        vipLevel: VIP_LEVELS.MAX, vipExpiresAt: now + 365 * 86400000,
        stats: { orders: 0, tasksCompleted: 0, reviewsWritten: 0, favorites: 0, spent: 0, earned: 0, gamesPlayed: 0, biggestWin: 0, itemsSold: 0, currentStreak: 0, longestStreak: 0, flashPurchases: 0, lastSpin: 0, lastScratch: 0 },
        twoFA: true, passwordHash: '', passwordSalt: '', fingerprint: 'admin_fp',
        isSeller: false, sellerInfo: null, createdAt: now - 86400000 * 25, lastLogin: now,
        notifications: { orders: true, promotions: true, tasks: true }
      },
      {
        id: 'u_seller1', username: 'ProSeller', email: 'seller@tshop.com',
        telegramUsername: '@proseller', role: ROLES.SELLER,
        points: 5000, sellerBalance: 12450,
        referralCode: 'SELL99', referredBy: null,
        referrals: { count: 5, l1: 5, l2: 12 },
        banned: false, badges: ['top_seller', 'rich'], level: 15, xp: 2400,
        vipLevel: VIP_LEVELS.PRO, vipExpiresAt: now + 30 * 86400000,
        stats: { orders: 0, tasksCompleted: 0, reviewsWritten: 0, favorites: 0, spent: 0, earned: 45000, gamesPlayed: 0, biggestWin: 0, itemsSold: 142, currentStreak: 0, longestStreak: 0, flashPurchases: 0, lastSpin: 0, lastScratch: 0 },
        twoFA: true, passwordHash: '', passwordSalt: '', fingerprint: 'seller1_fp',
        isSeller: true, sellerInfo: { verifiedAt: now - 86400000 * 60, totalSales: 142 },
        createdAt: now - 86400000 * 60, lastLogin: now,
        notifications: { orders: true, promotions: true, tasks: true }
      },
    ],
    products: [
      { id: 'p1', name: "Steam 50 TL Bakiye", price: 250, category: 'cat_1', subcat: 'Steam', image: "https://placehold.co/400x300/1a202c/FFF?text=Steam+50TL", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'code', desc: "An\u0131nda teslimat. T\u00FCrkiye b\u00F6lgesi i\u00E7in ge\u00E7erli.", tags: ['Pop\u00FCler'], stock: ['STEAM-A1B2', 'STEAM-C3D4', 'STEAM-E5F6'], sales: 147, status: 'ACTIVE', deliveryTime: 'An\u0131nda', createdAt: now - 86400000 * 60, boostUntil: 0 },
      { id: 'p2', name: "Netflix Premium 1 Ay", price: 450, category: 'cat_2', subcat: 'Netflix', image: "https://placehold.co/400x300/e50914/FFF?text=Netflix", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'account', desc: "4K UHD kalite, 4 ekran.", tags: ['4K'], stock: ['NFLX-01@mail/p1', 'NFLX-02@mail/p2'], sales: 92, status: 'ACTIVE', deliveryTime: '5 Dk', createdAt: now - 86400000 * 45, boostUntil: 0 },
      { id: 'p3', name: "Valorant Hesab\u0131 - Immortal", price: 1250, category: 'cat_1', subcat: 'Riot Games', image: "https://placehold.co/400x300/ff4655/FFF?text=Valorant", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'account', desc: "Immortal 3, 50+ skin.", tags: ['Nadir'], stock: ['VAL-IMM-001'], sales: 23, status: 'ACTIVE', deliveryTime: '10 Dk', createdAt: now - 86400000 * 30, boostUntil: 0 },
      { id: 'p4', name: "Spotify Premium 3 Ay", price: 280, category: 'cat_2', subcat: 'Spotify', image: "https://placehold.co/400x300/1DB954/FFF?text=Spotify", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "3 ayl\u0131k Premium.", tags: ['M\u00FCzik'], stock: ['SP-001', 'SP-002', 'SP-003'], sales: 154, status: 'ACTIVE', deliveryTime: 'An\u0131nda', createdAt: now - 86400000 * 50, boostUntil: 0 },
      { id: 'p5', name: "Google Play 100 TL", price: 480, category: 'cat_3', subcat: 'Google Play', image: "https://placehold.co/400x300/34a853/FFF?text=Google+Play", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "Google Play hediye kart\u0131.", tags: ['Mobil'], stock: ['GP-100-A1', 'GP-100-A2'], sales: 112, status: 'ACTIVE', deliveryTime: 'An\u0131nda', createdAt: now - 86400000 * 40, boostUntil: 0 },
      { id: 'p6', name: "Riot Points 1380 RP", price: 320, category: 'cat_1', subcat: 'Riot Games', image: "https://placehold.co/400x300/d13639/FFF?text=Riot+Points", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'code', desc: "LoL & Valorant i\u00E7in.", tags: ['RP'], stock: ['RP-X1', 'RP-X2'], sales: 134, status: 'ACTIVE', deliveryTime: 'An\u0131nda', createdAt: now - 86400000 * 35, boostUntil: 0 },
      { id: 'p7', name: "Discord Nitro 1 Ay", price: 180, category: 'cat_9', subcat: 'Discord Nitro', image: "https://placehold.co/400x300/5865F2/FFF?text=Discord+Nitro", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "Discord Nitro.", tags: ['Sosyal'], stock: ['NITRO-001', 'NITRO-002', 'NITRO-003'], sales: 267, status: 'ACTIVE', deliveryTime: 'An\u0131nda', createdAt: now - 86400000 * 55, boostUntil: 0 },      { id: 'p8', name: "Xbox Game Pass Ultimate", price: 550, category: 'cat_1', subcat: 'Xbox', image: "https://placehold.co/400x300/107C10/FFF?text=Xbox+GamePass", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "3 ayl\u0131k Ultimate.", tags: ['Oyun'], stock: ['XGPU-01', 'XGPU-02'], sales: 145, status: 'ACTIVE', deliveryTime: 'An\u0131nda', createdAt: now - 86400000 * 42, boostUntil: 0 },
      { id: 'p9', name: "Apple Gift Card 250 TL", price: 1150, category: 'cat_3', subcat: 'Apple', image: "https://placehold.co/400x300/000000/FFF?text=Apple", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "App Store, iTunes.", tags: ['Apple'], stock: ['APPLE-250-A'], sales: 56, status: 'ACTIVE', deliveryTime: 'An\u0131nda', createdAt: now - 86400000 * 28, boostUntil: 0 },
      { id: 'p10', name: "CS2 Prime Status", price: 220, category: 'cat_1', subcat: 'Steam', image: "https://placehold.co/400x300/de9b35/FFF?text=CS2", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'code', desc: "CS2 Prime.", tags: ['FPS'], stock: ['CSGO-P-01', 'CSGO-P-02'], sales: 292, status: 'ACTIVE', deliveryTime: 'An\u0131nda', createdAt: now - 86400000 * 65, boostUntil: 0 },
      { id: 'p11', name: "Canva Pro 1 Y\u0131l", price: 150, category: 'cat_8', subcat: 'Canva', image: "https://placehold.co/400x300/00C4CC/FFF?text=Canva+Pro", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'account', desc: "1 y\u0131ll\u0131k Pro.", tags: ['Tasar\u0131m'], stock: ['CANVA-01@mail', 'CANVA-02@mail'], sales: 178, status: 'ACTIVE', deliveryTime: '5 Dk', createdAt: now - 86400000 * 20, boostUntil: 0 },
      { id: 'p12', name: "ChatGPT Plus 1 Ay", price: 490, category: 'cat_11', subcat: 'ChatGPT Plus', image: "https://placehold.co/400x300/10a37f/FFF?text=ChatGPT+Plus", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'account', desc: "1 ayl\u0131k Plus.", tags: ['AI'], stock: ['GPT-01@mail'], sales: 39, status: 'ACTIVE', deliveryTime: '10 Dk', createdAt: now - 86400000 * 15, boostUntil: 0 },
    ],
    orders: [] as any[],
    transactions: [] as any[],
    reviews: [] as any[],
    tickets: [] as any[],
    gameHistory: [] as any[],
    announcements: [
      { id: 'a1', title: 'TShop Ultimate Yay\u0131nda!', content: 'Yeni \u00F6zellikler: Tam admin y\u00F6netimi, Telegram giri\u015F, VIP sistem.', date: now - 3600000, priority: 'high' },
    ] as any[],
    flashSale: { active: false, productId: null, discount: 0, endsAt: 0 },
    usedCoupons: [] as string[],
    completedTasks: {} as Record<string, number>,
    tasks: [
      { id: 't1', title: "Telegram Kanal\u0131na Kat\u0131l", reward: 50, category: "Sosyal", repeatable: false, icon: "\uD83D\uDCE2", description: "Telegram kanal\u0131m\u0131za kat\u0131l", verifyType: 'manual' },
      { id: 't2', title: "G\u00FCnl\u00FCk Giri\u015F", reward: 10, category: "G\u00FCnl\u00FCk", repeatable: true, cooldown: 86400000, icon: "\uD83D\uDCC5", description: "Her g\u00FCn giri\u015F yap", verifyType: 'auto' },
      { id: 't3', title: "Profilini Tamamla", reward: 50, category: "G\u00FCnl\u00FCk", repeatable: false, icon: "\u270F\uFE0F", description: "Profil bilgilerini doldur", verifyType: 'auto' },
      { id: 't4', title: "\u0130lk Yorumunu Yap", reward: 40, category: "Topluluk", repeatable: false, icon: "\uD83D\uDCAD", description: "Bir \u00FCr\u00FCne yorum yaz", verifyType: 'auto' },
      { id: 't5', title: "Arkada\u015F Davet Et", reward: 100, category: "Referans", repeatable: true, cooldown: 86400000 * 7, icon: "\uD83D\uDC65", description: "Arkada\u015F\u0131n\u0131 davet et", verifyType: 'auto' },
    ] as any[],
    pendingTopUps: [] as any[],
    pendingWithdrawals: [] as any[],
    pendingSellerApplications: [] as any[],
    coupons: [
      { code: 'HOSGELDIN', type: 'flat', value: 50, desc: '50 TS indirim', active: true, maxUses: 1, usedCount: 0 },
      { code: 'SAVE10', type: 'percent', value: 10, desc: '%10 indirim', active: true, maxUses: 1, usedCount: 0 },
    ] as any[],
    auditLog: [] as any[],
  };
};

export type DB = ReturnType<typeof createInitialDB>;

// =============================================================================
// ZUSTAND STORE INTERFACE
// =============================================================================
interface StoreState extends DB {
  currentUserId: string | null;
  cart: any[];
  favorites: string[];
  compareList: string[];
  notifications: any[];

  setCurrentUser: (id: string | null) => void;
  updateUser: (userId: string, updater: Partial<any> | ((u: any) => any)) => void;
  updatePoints: (userId: string, amount: number, reason: string, type?: 'earn' | 'spend') => void;  updateStat: (userId: string, key: string, delta?: number) => void;
  addNotification: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, delta: number) => void;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  setDB: (updater: (prev: DB) => DB) => void;

  purchaseVIP: (level: string, duration: 'weekly' | 'monthly') => void;
  requestTopUp: (pkg: any, receiptData: string | null, paymentMethod: string) => void;
  approveTopUp: (topUpId: string) => void;
  rejectTopUp: (topUpId: string, reason: string) => void;
  requestWithdraw: (amount: number, method: string, details: any) => void;
  approveWithdraw: (withdrawId: string) => void;
  rejectWithdraw: (withdrawId: string, reason: string) => void;
  submitSellerApplication: (data: any) => void;
  approveSellerApplication: (appId: string) => void;
  rejectSellerApplication: (appId: string, reason: string) => void;
  submitReview: (productId: string, rating: number, text: string) => void;
  completeTask: (task: any) => void;
  playGame: (type: string, betAmount: number, guess: any) => void;
  spinWheel: () => number;
  sendTS: (recipientUsername: string, amount: number, message: string) => void;
  requestReturn: (orderId: string, itemId: string, reason: string) => void;
  approveReturn: (ticketId: string) => void;
  rejectReturn: (ticketId: string) => void;
  addProduct: (newProd: any) => void;
  deleteProduct: (productId: string) => void;
  boostProduct: (productId: string) => void;
  banUser: (userId: string, reason?: string) => void;
  setUserRole: (userId: string, newRole: string) => void;
  exportData: () => void;
  deleteAccount: () => void;
  addAnnouncement: (title: string, content: string, priority: string) => void;
  updateConfig: (newConfig: any) => void;
  updateCategories: (newCategories: any[]) => void;
  updateVipPrices: (newPrices: any) => void;
  updateTopUpPackages: (newPackages: any[]) => void;
  addAuditLog: (action: string, details: string) => void;
}

// =============================================================================
// ZUSTAND STORE IMPLEMENTATION
// =============================================================================
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createInitialDB(),
      currentUserId: null,      cart: [],
      favorites: [],
      compareList: [],
      notifications: [],

      setCurrentUser: (id) => set({ currentUserId: id }),

      updateUser: (userId, updater) => set((state) => ({
        users: state.users.map(u => u.id === userId
          ? (typeof updater === 'function' ? updater(u) : { ...u, ...updater })
          : u)
      })),

      updatePoints: (userId, amount, reason, type = 'earn') => set((state) => {
        const user = state.users.find(u => u.id === userId);
        if (!user || (type === 'spend' && user.points < amount)) return state;
        const tx = { id: generateId(), userId, amount, reason, type, date: Date.now() };
        const newXp = (user.xp || 0) + (type === 'earn' ? Math.floor(amount / 2) : 0);
        const newLevel = Math.floor(newXp / 1000) + 1;
        return {
          users: state.users.map(u => u.id === userId ? {
            ...u,
            points: u.points + (type === 'spend' ? -amount : amount),
            xp: newXp, level: newLevel,
            stats: {
              ...u.stats,
              spent: type === 'spend' ? (u.stats.spent || 0) + amount : u.stats.spent,
              earned: type === 'earn' ? (u.stats.earned || 0) + amount : u.stats.earned,
            }
          } : u),
          transactions: [tx, ...state.transactions].slice(0, 500)
        };
      }),

      updateStat: (userId, key, delta = 1) => set((state) => ({
        users: state.users.map(u => {
          if (u.id !== userId) return u;
          const currentVal = u.stats[key] || 0;
          const newVal = Math.max(0, currentVal + delta);
          if (currentVal === newVal) return u;
          return { ...u, stats: { ...u.stats, [key]: newVal } };
        })
      })),

      addNotification: (msg, type = 'success') => set((state) => ({
        notifications: [{ id: generateId(), msg, type, date: new Date().toISOString(), read: false }, ...state.notifications].slice(0, 50)
      })),

      addToCart: (product) => set((state) => {
        const existing = state.cart.find(i => i.id === product.id);        if (existing) return { cart: state.cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
        return { cart: [...state.cart, { ...product, qty: 1 }] };
      }),

      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(i => i.id !== id) })),

      updateCartQty: (id, delta) => set((state) => ({
        cart: state.cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
      })),

      toggleFavorite: (id) => set((state) => ({
        favorites: state.favorites.includes(id) ? state.favorites.filter(f => f !== id) : [...state.favorites, id]
      })),

      toggleCompare: (id) => set((state) => {
        const list = state.compareList || [];
        if (list.includes(id)) return { compareList: list.filter(x => x !== id) };
        if (list.length >= 3) {
          state.addNotification("En fazla 3 \u00FCr\u00FCn kar\u015F\u0131la\u015Ft\u0131rabilirsin!", "warning");
          return state;
        }
        return { compareList: [...list, id] };
      }),

      setDB: (updater) => set((state) => updater(state)),

      addAuditLog: (action, details) => set((state) => {
        const user = state.users.find(u => u.id === state.currentUserId);
        return {
          ...state,
          auditLog: [{ id: generateId(), userId: user?.id, username: user?.username, role: user?.role, action, details, date: Date.now() }, ...state.auditLog].slice(0, 1000)
        };
      }),

      // === VIP SATIN ALMA ===
      purchaseVIP: (level, duration) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const prices = state.vipPrices[level as keyof typeof state.vipPrices];
        if (!prices) return;
        const price = duration === 'weekly' ? prices.weekly : prices.monthly;
        const days = duration === 'weekly' ? 7 : 30;
        if (user.points < price) {
          state.addNotification("Yetersiz bakiye!", "error");
          return;
        }
        state.updatePoints(user.id, price, `${VIP_BENEFITS[level]?.name} - ${duration === 'weekly' ? 'Haftal\u0131k' : 'Ayl\u0131k'}`, 'spend');
        const currentExpiry = user.vipExpiresAt && user.vipExpiresAt > Date.now() ? user.vipExpiresAt : Date.now();
        const newExpiry = currentExpiry + (days * 86400000);        state.updateUser(user.id, { vipLevel: level, vipExpiresAt: newExpiry });
        state.addAuditLog('VIP_PURCHASE', `${user.username} ${VIP_BENEFITS[level]?.name} sat\u0131n ald\u0131`);
        state.addNotification(`${VIP_BENEFITS[level]?.name} aktif edildi!`, "success");
      },

      // === BAKİYE YÜKLEME TALEBİ ===
      requestTopUp: (pkg, receiptData, paymentMethod) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const topUpRequest = {
          id: 'tu_' + generateId(), userId: user.id, username: user.username,
          packageId: pkg.id, amount: pkg.amount + pkg.bonus, price: pkg.price,
          paymentMethod, receiptData, status: 'PENDING', date: Date.now(),
          reviewedBy: null, reviewedAt: null,
        };
        set((s) => ({ ...s, pendingTopUps: [topUpRequest, ...s.pendingTopUps] }));
        state.addAuditLog('TOP_UP_REQUEST', `${user.username} ${pkg.amount + pkg.bonus} TS y\u00FCkleme talebi olu\u015Fturdu`);
        state.addNotification("Y\u00FCkleme talebi olu\u015Fturuldu. Admin onay\u0131 bekleniyor.", "info");
      },

      approveTopUp: (topUpId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        const topUp = state.pendingTopUps.find(t => t.id === topUpId);
        if (!topUp) return;
        state.updatePoints(topUp.userId, topUp.amount, `Bakiye Y\u00FCkleme (${topUp.price})`, 'earn');
        set((s) => ({ ...s, pendingTopUps: s.pendingTopUps.filter(t => t.id !== topUpId) }));
        state.addAuditLog('TOP_UP_APPROVE', `${topUp.username} i\u00E7in ${topUp.amount} TS onayland\u0131`);
        state.addNotification("Bakiye y\u00FCklendi", "success");
      },

      rejectTopUp: (topUpId, reason) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        set((s) => ({ ...s, pendingTopUps: s.pendingTopUps.filter(t => t.id !== topUpId) }));
        state.addAuditLog('TOP_UP_REJECT', `${topUpId} reddedildi: ${reason}`);
        state.addNotification("Reddedildi", "info");
      },

      // === PARA ÇEKME ===
      requestWithdraw: (amount, method, details) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !user.isSeller) return;
        if (amount < state.config.minWithdraw || amount > user.sellerBalance) return;
        const todayWithdraws = state.pendingWithdrawals.filter(w =>
          w.userId === user.id && new Date(w.date).toDateString() === new Date().toDateString()        );
        if (todayWithdraws.length >= state.config.dailyWithdrawCount) {
          state.addNotification(`G\u00FCnde max ${state.config.dailyWithdrawCount} \u00E7ekim yapabilirsin`, "warning");
          return;
        }
        const commission = Math.floor(amount * state.config.withdrawCommission);
        const netAmount = amount - commission;
        const withdrawRequest = {
          id: 'wd_' + generateId(), userId: user.id, username: user.username,
          amount, commission, netAmount, method, details, status: 'PENDING', date: Date.now(),
        };
        state.updateUser(user.id, { sellerBalance: user.sellerBalance - amount });
        set((s) => ({ ...s, pendingWithdrawals: [withdrawRequest, ...s.pendingWithdrawals] }));
        state.addAuditLog('WITHDRAW_REQUEST', `${user.username} ${amount} TS \u00E7ekim talebi`);
        state.addNotification(`\u00C7ekim talebi olu\u015Fturuldu. Net: ${netAmount} TS`, "info");
      },

      approveWithdraw: (withdrawId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 5)) return;
        const withdraw = state.pendingWithdrawals.find(w => w.id === withdrawId);
        if (!withdraw) return;
        set((s) => ({ ...s, pendingWithdrawals: s.pendingWithdrawals.filter(w => w.id !== withdrawId) }));
        state.addAuditLog('WITHDRAW_APPROVE', `${withdraw.username} i\u00E7in ${withdraw.netAmount} TS onayland\u0131`);
        state.addNotification("\u00C7ekim onayland\u0131", "success");
      },

      rejectWithdraw: (withdrawId, reason) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 5)) return;
        const withdraw = state.pendingWithdrawals.find(w => w.id === withdrawId);
        if (!withdraw) return;
        state.updateUser(withdraw.userId, (u: any) => ({ ...u, sellerBalance: u.sellerBalance + withdraw.amount }));
        set((s) => ({ ...s, pendingWithdrawals: s.pendingWithdrawals.filter(w => w.id !== withdrawId) }));
        state.addAuditLog('WITHDRAW_REJECT', `${withdrawId} reddedildi: ${reason}`);
        state.addNotification("Reddedildi, bakiye iade edildi", "info");
      },

      // === SATICI BAŞVURU ===
      submitSellerApplication: (data) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || user.isSeller) return;
        const existingApp = state.pendingSellerApplications.find(a => a.userId === user.id && a.status === 'PENDING');
        if (existingApp) { state.addNotification("Zaten bekleyen ba\u015Fvurun var", "warning"); return; }
        const application = { id: 'sa_' + generateId(), userId: user.id, username: user.username, ...data, status: 'PENDING', date: Date.now() };
        set((s) => ({ ...s, pendingSellerApplications: [application, ...s.pendingSellerApplications] }));
        state.addAuditLog('SELLER_APPLICATION', `${user.username} sat\u0131c\u0131 ba\u015Fvurusu yapt\u0131`);        state.addNotification("Ba\u015Fvurun al\u0131nd\u0131.", "success");
      },

      approveSellerApplication: (appId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        const app = state.pendingSellerApplications.find(a => a.id === appId);
        if (!app) return;
        state.updateUser(app.userId, { isSeller: true, sellerInfo: { verifiedAt: Date.now(), totalSales: 0 } });
        set((s) => ({ ...s, pendingSellerApplications: s.pendingSellerApplications.map(a => a.id === appId ? { ...a, status: 'APPROVED', reviewedBy: user.username, reviewedAt: Date.now() } : a) }));
        state.addAuditLog('SELLER_APPROVED', `${app.username} sat\u0131c\u0131 olarak onayland\u0131`);
        state.addNotification("Sat\u0131c\u0131 onayland\u0131", "success");
      },

      rejectSellerApplication: (appId, reason) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        set((s) => ({ ...s, pendingSellerApplications: s.pendingSellerApplications.map(a => a.id === appId ? { ...a, status: 'REJECTED', reviewedBy: user.username, reviewedAt: Date.now(), rejectReason: reason } : a) }));
        state.addAuditLog('SELLER_REJECTED', `${appId} reddedildi: ${reason}`);
        state.addNotification("Reddedildi", "info");
      },

      // === YORUM ===
      submitReview: (productId, rating, text) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const cleanText = safeSanitize(text);
        if (!cleanText.trim() || cleanText.length < 5) { state.addNotification("Yorum en az 5 karakter", "error"); return; }
        if (cleanText.length > state.config.maxReviewLength) { state.addNotification(`Max ${state.config.maxReviewLength} karakter`, "error"); return; }
        const hasBought = state.orders.some(o => o.userId === user.id && o.items.some(i => i.id === productId));
        if (!hasBought) { state.addNotification("Bu \u00FCr\u00FCn\u00FC sat\u0131n almadan yorum yapamazs\u0131n", "error"); return; }
        const product = state.products.find(p => p.id === productId);
        if (product && product.sellerId === user.id) { state.addNotification("Kendi \u00FCr\u00FCn\u00FCn i\u00E7in yorum yapamazs\u0131n", "error"); return; }
        if (state.reviews.some(r => r.productId === productId && r.userId === user.id)) { state.addNotification("Zaten yorum yapt\u0131n", "error"); return; }
        const newReview = { id: generateId(), productId, userId: user.id, userName: user.username, rating, text: cleanText, date: Date.now() };
        set((s) => ({ ...s, reviews: [newReview, ...s.reviews] }));
        state.updateStat(user.id, 'reviewsWritten');
        state.updatePoints(user.id, 10, "Yorum \u00D6d\u00FCl\u00FC", "earn");
        state.addNotification("Yorum yay\u0131nland\u0131! +10 TS", "success");
      },

      // === GÖREV ===
      completeTask: (task) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const now = Date.now();        const lastCompleted = state.completedTasks[task.id] || 0;
        if (!task.repeatable && lastCompleted > 0) { state.addNotification("Bu g\u00F6rev zaten tamamland\u0131!", "error"); return; }
        if (task.repeatable && task.cooldown && (now - lastCompleted) < task.cooldown) { state.addNotification("Bekleme s\u00FCresinde...", "error"); return; }
        set((s) => ({ ...s, completedTasks: { ...s.completedTasks, [task.id]: now } }));
        state.updatePoints(user.id, task.reward, `G\u00F6rev: ${task.title}`, 'earn');
        state.updateStat(user.id, 'tasksCompleted');
        state.addNotification(`+${task.reward} TS Kazand\u0131n\u0131z!`, "success");
      },

      // === OYUNLAR ===
      playGame: (type, betAmount, guess) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        if (betAmount < 10 || betAmount > state.config.maxBetLimit || user.points < betAmount) {
          state.addNotification("Ge\u00E7ersiz bahis veya yetersiz bakiye", "error");
          return;
        }
        let won = false, payout = 0, result = "", details: any = {};
        if (type === 'dice') {
          const d1 = Math.floor(Math.random() * 6) + 1;
          const d2 = Math.floor(Math.random() * 6) + 1;
          const sum = d1 + d2; const isEven = sum % 2 === 0;
          result = `Zarlar: ${d1} + ${d2} = ${sum} (${isEven ? '\u00C7ift' : 'Tek'})`;
          details = { d1, d2, sum, isEven };
          if ((guess === 'even' && isEven) || (guess === 'odd' && !isEven)) { won = true; payout = Math.floor(betAmount * 1.95); }
        } else if (type === 'coin') {
          const flip = Math.random() < 0.5 ? 'heads' : 'tails';
          result = `Madeni para: ${flip === 'heads' ? 'Tura' : 'Yaz\u0131'}`;
          details = { flip };
          if (guess === flip) { won = true; payout = Math.floor(betAmount * 1.95); }
        } else if (type === 'crash') {
          const crashPoint = Math.max(1.0, (100 / (Math.random() * 100 + 1)));
          result = `\u00C7\u00F6k\u00FC\u015F: ${crashPoint.toFixed(2)}x`;
          details = { crashPoint };
          if (guess <= crashPoint) { won = true; payout = Math.floor(betAmount * guess); }
        }
        const profit = won ? payout - betAmount : -betAmount;
        set((s) => {
          const newHistory = { id: generateId(), userId: user.id, type, bet: betAmount, won, payout: won ? payout : 0, profit, result, details, date: Date.now() };
          const newStats = { ...s.users.find(u => u.id === user.id)!.stats, gamesPlayed: (s.users.find(u => u.id === user.id)!.stats.gamesPlayed || 0) + 1, biggestWin: Math.max(s.users.find(u => u.id === user.id)!.stats.biggestWin || 0, profit) };
          return { ...s, users: s.users.map(u => u.id === user.id ? { ...u, points: u.points + profit, stats: newStats } : u), gameHistory: [newHistory, ...s.gameHistory].slice(0, 500) };
        });
        state.addNotification(won ? `Kazand\u0131n! +${payout} TS` : `Kaybettin. ${result}`, won ? 'success' : 'error');
      },

      // === ÇARK ===
      spinWheel: () => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);        if (!user) return 0;
        const lastSpin = user.stats?.lastSpin || 0;
        if (Date.now() - lastSpin < 86400000) { state.addNotification("\u00C7ark\u0131 g\u00FCnde 1 kez \u00E7evirebilirsin!", "error"); return 0; }
        const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel] : null;
        const rewards = vipBenefits ? vipBenefits.wheelRewards : [5, 10, 15, 20, 25, 30, 50, 100];
        const belowChance = vipBenefits ? vipBenefits.wheelBelowChance : 0.7;
        let prize;
        if (Math.random() < belowChance) {
          const threshold = user.vipLevel === VIP_LEVELS.STANDARD ? 100 : user.vipLevel === VIP_LEVELS.PRO ? 150 : 190;
          const lowRewards = rewards.filter((r: number) => r < threshold);
          prize = lowRewards[Math.floor(Math.random() * lowRewards.length)] || rewards[0];
        } else {
          const threshold = user.vipLevel === VIP_LEVELS.STANDARD ? 100 : user.vipLevel === VIP_LEVELS.PRO ? 150 : 190;
          const highRewards = rewards.filter((r: number) => r >= threshold);
          prize = highRewards[Math.floor(Math.random() * highRewards.length)] || rewards[rewards.length - 1];
        }
        state.updatePoints(user.id, prize, "G\u00FCnl\u00FCk \u00C7ark", "earn");
        state.updateUser(user.id, { stats: { ...user.stats, lastSpin: Date.now() } });
        state.addNotification(`+${prize} TS kazand\u0131n!`, "success");
        return prize;
      },

      // === TS GÖNDERME ===
      sendTS: (recipientUsername, amount, message) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        if (!recipientUsername || recipientUsername.length < 3) return state.addNotification("Ge\u00E7ersiz al\u0131c\u0131", "error");
        if (recipientUsername.toLowerCase() === user.username.toLowerCase()) return state.addNotification("Kendine TS g\u00F6nderemezsin", "error");
        if (!amount || amount < state.config.minTransfer) return state.addNotification(`Min: ${state.config.minTransfer} TS`, "error");
        if (amount > user.points) return state.addNotification("Yetersiz bakiye", "error");
        const recipient = state.users.find(u => u.username.toLowerCase() === recipientUsername.toLowerCase());
        if (!recipient) return state.addNotification("Al\u0131c\u0131 bulunamad\u0131", "error");
        if (recipient.banned) return state.addNotification("Al\u0131c\u0131 yasaklanm\u0131\u015F", "error");
        const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel] : null;
        const taxRate = vipBenefits ? vipBenefits.transferTaxRate : state.config.transferTax;
        const tax = amount > 1000 ? Math.floor(amount * taxRate) : 0;
        const totalCost = amount + tax;
        if (user.points < totalCost) return state.addNotification("Vergi dahil yetersiz bakiye", "error");
        set((s) => {
          const senderTx = { id: generateId(), userId: user.id, amount: totalCost, reason: `@${recipient.username} kullan\u0131c\u0131s\u0131na g\u00F6nderildi${message ? ': ' + safeSanitize(message) : ''}${tax > 0 ? ` (Vergi: ${tax} TS)` : ''}`, type: 'spend', date: Date.now() };
          const recipientTx = { id: generateId(), userId: recipient.id, amount: amount, reason: `@${user.username} kullan\u0131c\u0131s\u0131ndan al\u0131nd\u0131${message ? ': ' + safeSanitize(message) : ''}`, type: 'earn', date: Date.now() };
          return { ...s, users: s.users.map(u => { if (u.id === user.id) return { ...u, points: u.points - totalCost }; if (u.id === recipient.id) return { ...u, points: u.points + amount }; return u; }), transactions: [senderTx, recipientTx, ...s.transactions].slice(0, 1000) };
        });
        state.addNotification(`${amount} TS g\u00F6nderildi!${tax > 0 ? ` (${tax} TS vergi)` : ''}`, "success");
      },

      // === İADE TALEBİ ===
      requestReturn: (orderId, itemId, reason) => {
        const state = get();        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const today = new Date().toDateString();
        const todayTickets = state.tickets.filter(t => new Date(t.date).toDateString() === today);
        if (todayTickets.length >= state.config.maxTicketsPerDay) { state.addNotification(`G\u00FCnde en fazla ${state.config.maxTicketsPerDay} talep`, "warning"); return; }
        const order = state.orders.find(o => o.id === orderId);
        const item = order?.items.find(i => i.id === itemId);
        if (!order || !item) return;
        const hoursPassed = (Date.now() - order.date) / (1000 * 60 * 60);
        if (hoursPassed > state.config.returnWindowHours) { state.addNotification(`\u0130ade s\u00FCresi doldu (${state.config.returnWindowHours} saat)`, "error"); return; }
        if (state.tickets.some(t => t.orderId === orderId && t.itemId === itemId && t.status === 'OPEN')) { state.addNotification("Zaten a\u00E7\u0131k talep var", "error"); return; }
        const ticket = { id: generateId(), type: 'RETURN', orderId, itemId, itemName: item.name, userId: user.id, reason: safeSanitize(reason), status: 'OPEN', date: Date.now() };
        set((s) => ({ ...s, tickets: [ticket, ...s.tickets] }));
        state.addNotification("\u0130ade talebi olu\u015Fturuldu.", "info");
      },

      // === İADE ONAYLAMA ===
      approveReturn: (ticketId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        const ticket = state.tickets.find(t => t.id === ticketId);
        if (!ticket) return;
        const order = state.orders.find(o => o.id === ticket.orderId);
        const item = order?.items.find(i => i.id === ticket.itemId);
        if (!order || !item) return;
        set((s) => {
          const refundAmount = item.price * item.qty;
          const prod = s.products.find(p => p.id === item.id);
          let updatedUsers = s.users.map(u => {
            if (u.id === ticket.userId) return { ...u, points: u.points + refundAmount };
            if (prod && u.id === prod.sellerId) return { ...u, sellerBalance: Math.max(0, u.sellerBalance - refundAmount) };
            return u;
          });
          let updatedProducts = s.products;
          if (prod) {
            const codes = item.deliveryCodes || (item.deliveryAccount ? item.deliveryAccount.split(', ') : []);
            updatedProducts = s.products.map(p => p.id === prod.id ? { ...p, stock: [...p.stock, ...codes] } : p);
          }
          return { ...s, users: updatedUsers, products: updatedProducts, tickets: s.tickets.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED' } : t), transactions: [{ id: generateId(), userId: ticket.userId, amount: refundAmount, reason: `\u0130ade: ${item.name}`, type: 'earn', date: Date.now() }, ...s.transactions].slice(0, 1000) };
        });
        state.addNotification("\u0130ade onayland\u0131, stok geri eklendi.", "success");
      },

      rejectReturn: (ticketId) => {
        set((s) => ({ ...s, tickets: s.tickets.map(t => t.id === ticketId ? { ...t, status: 'REJECTED' } : t) }));
        get().addNotification("Talep reddedildi", "info");
      },

      // === ÜRÜN YÖNETİMİ ===      addProduct: (newProd) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !user.isSeller) { state.addNotification("Yetkiniz yok", "error"); return; }
        if (!newProd.name || !newProd.price) { state.addNotification("Eksik bilgi", "error"); return; }
        const invList = newProd.inventory.split('\n').filter((x: string) => x.trim());
        if (invList.length === 0) { state.addNotification("En az 1 stok kodu gerekli", "error"); return; }
        const prod = {
          id: 'p_' + generateId(), name: safeSanitize(newProd.name).slice(0, 100),
          price: Math.max(1, Number(newProd.price)), category: newProd.category, subcat: newProd.subcat || '',
          sellerId: user.id, sellerName: user.username, image: newProd.image || "https://placehold.co/400x300/333/FFF?text=New",
          sales: 0, type: 'code', tags: newProd.tags.split(',').map((t: string) => safeSanitize(t.trim())).filter(Boolean).slice(0, 3),
          desc: safeSanitize(newProd.desc).slice(0, 500), stock: invList, verified: hasPermission(user.role, 5),
          status: 'ACTIVE', deliveryTime: 'An\u0131nda', createdAt: Date.now(), boostUntil: 0,
        };
        set((s) => ({ ...s, products: [...s.products, prod] }));
        state.addNotification("\u00DCr\u00FCn eklendi!", "success");
      },

      deleteProduct: (productId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        const prod = state.products.find(p => p.id === productId);
        if (!prod) return;
        if (prod.sellerId !== user?.id && !hasPermission(user?.role || '', 5)) { state.addNotification("Yetkiniz yok", "error"); return; }
        set((s) => ({ ...s, products: s.products.filter(p => p.id !== productId) }));
        state.addNotification("\u00DCr\u00FCn silindi", "info");
      },

      boostProduct: (productId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel] : null;
        if (!vipBenefits) { state.addNotification("Sadece VIP \u00FCyeler \u00FCr\u00FCn \u00F6ne \u00E7\u0131karabilir", "error"); return; }
        const boostedProducts = state.products.filter(p => p.sellerId === user.id && p.boostUntil > Date.now());
        if (boostedProducts.length >= vipBenefits.boostProducts) { state.addNotification(`Boost limitin doldu`, "warning"); return; }
        const boostUntil = Date.now() + (vipBenefits.boostDays * 86400000);
        set((s) => ({ ...s, products: s.products.map(p => p.id === productId ? { ...p, boostUntil } : p) }));
        state.addNotification(`\u00DCr\u00FCn ${vipBenefits.boostDays} g\u00FCn \u00F6ne \u00E7\u0131kar\u0131ld\u0131!`, "success");
      },

      // === ADMIN USER MANAGEMENT ===
      banUser: (userId, reason = '') => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        const targetUser = state.users.find(u => u.id === userId);
        if (!targetUser) return;
        if (ROLE_HIERARCHY[targetUser.role] >= ROLE_HIERARCHY[user.role]) { state.addNotification("Kendinizden y\u00FCksek yetkiliyi banlayamazs\u0131n", "error"); return; }        state.updateUser(userId, { banned: !targetUser.banned });
        state.addAuditLog('USER_BAN_TOGGLE', `${targetUser.username} ${targetUser.banned ? 'yasa\u011F\u0131 kald\u0131r\u0131ld\u0131' : 'banland\u0131'}. Sebep: ${reason}`);
        state.addNotification(targetUser.banned ? "Yasak kald\u0131r\u0131ld\u0131" : "Kullan\u0131c\u0131 banland\u0131", "info");
      },

      setUserRole: (userId, newRole) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const targetUser = state.users.find(u => u.id === userId);
        if (!targetUser) return;
        if (newRole === ROLES.FOUNDER && user.role !== ROLES.FOUNDER) { state.addNotification("Kurucu yetkisi sadece kurucu taraf\u0131ndan verilebilir", "error"); return; }
        if (newRole === ROLES.SUPER_ADMIN && user.role !== ROLES.FOUNDER && user.role !== ROLES.SUPER_ADMIN) { state.addNotification("Sadece kurucu/s\u00FCper admin atayabilir", "error"); return; }
        if (newRole === ROLES.ADMIN && !hasPermission(user.role, 6)) { state.addNotification("S\u00FCper admin+ yetkisi gerekli", "error"); return; }
        if (newRole === ROLES.AUTHORITY && !hasPermission(user.role, 5)) { state.addNotification("Admin+ yetkisi gerekli", "error"); return; }
        if (newRole === ROLES.MODERATOR && !hasPermission(user.role, 4)) { state.addNotification("Yetkili+ yetkisi gerekli", "error"); return; }
        state.updateUser(userId, { role: newRole });
        state.addAuditLog('ROLE_CHANGE', `${targetUser.username} rol\u00FC ${newRole} yap\u0131ld\u0131`);
        state.addNotification(`Rol g\u00FCncellendi: ${newRole}`, "success");
      },

      // === KVKK / GDPR ===
      exportData: () => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const data = {
          user: { ...user, passwordHash: undefined, passwordSalt: undefined },
          orders: state.orders.filter(o => o.userId === user.id),
          transactions: state.transactions.filter(t => t.userId === user.id),
          reviews: state.reviews.filter(r => r.userId === user.id),
          gameHistory: state.gameHistory.filter(g => g.userId === user.id),
          exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `tshop_verilerim_${user.username}.json`; a.click();
        URL.revokeObjectURL(url);
        state.addNotification("Verilerin indirildi.", "success");
      },

      deleteAccount: () => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        set((s) => ({
          ...s,
          users: s.users.filter(u => u.id !== user.id),
          reviews: s.reviews.filter(r => r.userId !== user.id),          orders: s.orders.filter(o => o.userId !== user.id),
          transactions: s.transactions.filter(t => t.userId !== user.id),
          gameHistory: s.gameHistory.filter(g => g.userId !== user.id),
          currentUserId: null,
        }));
        state.addNotification("Hesab\u0131n ve verilerin KVKK gere\u011Fi silindi.", "info");
      },

      // === ADMIN CONFIG & CONTENT ===
      addAnnouncement: (title, content, priority) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        set((s) => ({ ...s, announcements: [{ id: 'a_' + generateId(), title: safeSanitize(title), content: safeSanitize(content), priority, date: Date.now() }, ...s.announcements] }));
        state.addAuditLog('ANNOUNCEMENT_ADD', `Duyuru: ${title}`);
        state.addNotification("Duyuru eklendi", "success");
      },

      updateConfig: (newConfig) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || user.role !== ROLES.FOUNDER) { state.addNotification("Sadece kurucu yapabilir", "error"); return; }
        set((s) => ({ ...s, config: { ...s.config, ...newConfig } }));
        state.addAuditLog('CONFIG_UPDATE', 'Site ayarlar\u0131 g\u00FCncellendi');
        state.addNotification("Ayarlar kaydedildi", "success");
      },

      updateCategories: (newCategories) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 5)) return;
        set((s) => ({ ...s, categories: newCategories }));
        state.addAuditLog('CATEGORIES_UPDATE', 'Kategoriler g\u00FCncellendi');
        state.addNotification("Kategoriler g\u00FCncellendi", "success");
      },

      updateVipPrices: (newPrices) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || user.role !== ROLES.FOUNDER) return;
        set((s) => ({ ...s, vipPrices: newPrices }));
        state.addAuditLog('VIP_PRICES_UPDATE', 'VIP fiyatlar\u0131 g\u00FCncellendi');
        state.addNotification("VIP fiyatlar\u0131 g\u00FCncellendi", "success");
      },

      updateTopUpPackages: (newPackages) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 5)) return;
        set((s) => ({ ...s, topUpPackages: newPackages }));        state.addAuditLog('PACKAGES_UPDATE', 'TS paketleri g\u00FCncellendi');
        state.addNotification("Paketler g\u00FCncellendi", "success");
      },
    }),
    {
      name: 'tshop-ultimate-storage',
      partialize: (state) => ({
        users: state.users, products: state.products, orders: state.orders,
        transactions: state.transactions, reviews: state.reviews, tickets: state.tickets,
        gameHistory: state.gameHistory, announcements: state.announcements, tasks: state.tasks,
        completedTasks: state.completedTasks, coupons: state.coupons, currentUserId: state.currentUserId,
        cart: state.cart, favorites: state.favorites, compareList: state.compareList,
        config: state.config, categories: state.categories,
        vipPrices: state.vipPrices, topUpPackages: state.topUpPackages,
        pendingTopUps: state.pendingTopUps, pendingWithdrawals: state.pendingWithdrawals,
        pendingSellerApplications: state.pendingSellerApplications, auditLog: state.auditLog,
        flashSale: state.flashSale, usedCoupons: state.usedCoupons,
      }),
    }
  )
);
