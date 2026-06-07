// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// SABITLER & TİPLER (ts.txt & v.txt'den alındı)
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

export const hasPermission = (userRole: string, requiredLevel: number) => {
  return (ROLE_HIERARCHY[userRole] || 0) >= requiredLevel;
};

export const VIP_LEVELS = {
  NONE: 'none',
  STANDARD: 'standard',
  PRO: 'pro',
  MAX: 'max',
} as const;

export const VIP_BENEFITS = {
  [VIP_LEVELS.STANDARD]: {
    name: "Standart VIP", icon: "⭐", frame: "frame-silver",
    wheelRewards: [10, 20, 50, 100, 150, 200, 250, 300],
    wheelBelowChance: 0.70, boostProducts: 7, boostDays: 2,
    transferTaxRate: 0.01, monthlyGift: 0, priorityReturn: "normal",
  },
  [VIP_LEVELS.PRO]: {
    name: "Pro VIP", icon: "💎", frame: "frame-gold",
    wheelRewards: [20, 40, 60, 100, 150, 175, 200, 225, 260, 300, 325],
    wheelBelowChance: 0.75, boostProducts: 14, boostDays: 4,
    transferTaxRate: 0.005, monthlyGift: 500, priorityReturn: "12h",  },
  [VIP_LEVELS.MAX]: {
    name: "Max VIP", icon: "👑", frame: "frame-diamond",
    wheelRewards: [20, 40, 60, 90, 130, 160, 190, 230, 270, 325, 380, 420],
    wheelBelowChance: 0.70, boostProducts: 28, boostDays: 8,
    transferTaxRate: 0, monthlyGift: 1500, priorityReturn: "6h",
  },
};

export const DEFAULT_CONFIG = {
  siteName: "TShop Ultimate",
  version: "20.0",
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
  telegramBotToken: "",
  telegramBotUsername: "",
  supportEmail: "destek@tshop.com",
  whatsappContact: "+905551234567",
  paymentMethods: {
    papara: { name: "TShop Official", number: "1234567890" },
    bank: { name: "TShop", iban: "TR00 0000 0000 0000 0000 0000 00" },
    crypto: { usdt_trc20: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }
  },
  settings: { maintenanceMode: false, registrationOpen: true },
};

export const DEFAULT_CATEGORIES = [
  { id: 'cat_1', name: 'Oyun Kodları', icon: '🎮', subcats: ['Steam', 'Riot Games', 'Epic Games', 'Xbox', 'PlayStation'] },
  { id: 'cat_2', name: 'Streaming', icon: '📺', subcats: ['Netflix', 'Disney+', 'BluTV', 'Exxen', 'Spotify', 'YouTube Premium'] },
  { id: 'cat_3', name: 'Hediye Kartları', icon: '💳', subcats: ['Google Play', 'Apple', 'Amazon', 'Razer Gold'] },
  { id: 'cat_4', name: 'Yazılım Lisansları', icon: '💻', subcats: ['Windows', 'Office', 'Adobe', 'Antivirüs'] },
  { id: 'cat_5', name: 'Eğitim', icon: '🎓', subcats: ['Udemy', 'Coursera', 'MasterClass'] },
  { id: 'cat_6', name: 'Mobil Oyun', icon: '📱', subcats: ['PUBG UC', 'Mobile Legends', 'Clash of Clans', 'Brawl Stars'] },
  { id: 'cat_7', name: 'VPN & Güvenlik', icon: '🛡️', subcats: ['NordVPN', 'ExpressVPN', 'Surfshark'] },
  { id: 'cat_8', name: 'Tasarım', icon: '🎨', subcats: ['Canva', 'Figma', 'Adobe CC'] },
  { id: 'cat_9', name: 'Sosyal Medya', icon: '📱', subcats: ['Discord Nitro', 'Twitter Blue', 'Telegram Premium'] },
  { id: 'cat_10', name: 'Crypto & Web3', icon: '₿', subcats: ['NFT', 'Wallet Premium'] },
  { id: 'cat_11', name: 'AI Araçları', icon: '🤖', subcats: ['ChatGPT Plus', 'Claude Pro', 'Midjourney'] },
  { id: 'cat_12', name: 'Özel Ürünler', icon: '✨', subcats: ['Limited', 'Bundle'] },];

export const BADGES_DEF = [
  { id: 'first_purchase', name: 'İlk Adım', icon: '🛍️', desc: 'İlk siparişini ver', condition: (u: any) => u?.stats?.orders >= 1, xp: 50, tier: 'D' },
  { id: 'task_master', name: 'Görev Ustası', icon: '⚔️', desc: '10 Görev tamamla', condition: (u: any) => u?.stats?.tasksCompleted >= 10, xp: 200, tier: 'C' },
  { id: 'rich', name: 'Zengin', icon: '💎', desc: '5000 TS biriktir', condition: (u: any) => u?.points >= 5000, xp: 500, tier: 'B' },
  { id: 'social', name: 'Sosyal', icon: '🗣️', desc: '5 Yorum yap', condition: (u: any) => u?.stats?.reviewsWritten >= 5, xp: 150, tier: 'D' },
  { id: 'collector', name: 'Koleksiyoncu', icon: '🏆', desc: '10 Favori ekle', condition: (u: any) => u?.stats?.favorites >= 10, xp: 100, tier: 'C' },
  { id: 'vip', name: 'VIP Üye', icon: '👑', desc: 'VIP ol', condition: (u: any) => u?.vipLevel && u.vipLevel !== VIP_LEVELS.NONE, xp: 1000, tier: 'A' },
  { id: 'referrer', name: 'Davetçi', icon: '📢', desc: '5 Kişi davet et', condition: (u: any) => u?.referrals?.count >= 5, xp: 300, tier: 'B' },
  { id: 'shopaholic', name: 'Alışveriş Tutkunu', icon: '🛒', desc: '50 Sipariş ver', condition: (u: any) => u?.stats?.orders >= 50, xp: 2000, tier: 'S' },
  { id: 'streak_7', name: 'Haftalık Seri', icon: '🔥', desc: '7 gün üst üste giriş', condition: (u: any) => u?.stats?.currentStreak >= 7, xp: 250, tier: 'C' },
  { id: 'reviewer_pro', name: 'Profesyonel Yorumcu', icon: '📝', desc: '25 Yorum yap', condition: (u: any) => u?.stats?.reviewsWritten >= 25, xp: 500, tier: 'B' },
  { id: 'two_fa', name: 'Güvenlik Ustası', icon: '🔐', desc: "2FA'yı aktif et", condition: (u: any) => u?.twoFA === true, xp: 200, tier: 'C' },
  { id: 'high_roller', name: 'Yüksek Bahisçi', icon: '🎰', desc: '100 oyun oyna', condition: (u: any) => u?.stats?.gamesPlayed >= 100, xp: 800, tier: 'A' },
  { id: 'lucky', name: 'Şanslı', icon: '🍀', desc: '500+ TS tek seferde kazan', condition: (u: any) => u?.stats?.biggestWin >= 500, xp: 400, tier: 'B' },
  { id: 'top_seller', name: 'Top Satıcı', icon: '⭐', desc: '100 ürün sat', condition: (u: any) => u?.stats?.itemsSold >= 100, xp: 1500, tier: 'S' },
];

// =============================================================================
// YARDIMCI FONKSİYONLAR
// =============================================================================
export const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const sanitize = (str: string, maxLen = 1000) => {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLen)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/</g, '<').replace(/>/g, '>')
    .replace(/"/g, '"').replace(/'/g, ''');
};

// =============================================================================
// ATOMIC TRANSACTION MANAGER (ts.txt'den)
// =============================================================================
class TransactionManager {
  private lock = false;
  private queue: (() => Promise<void>)[] = [];

  async execute(callback: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      const task = async () => {
        try { resolve(await callback()); } 
        catch (err) { reject(err); }
      };      if (!this.lock) {
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
    ],
    users: [
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
      },      {
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
      { id: 'p1', name: "Steam 50 TL Bakiye", price: 250, category: 'cat_1', subcat: 'Steam', image: "https://placehold.co/400x300/1a202c/FFF?text=Steam+50TL", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'code', desc: "Anında teslimat. Türkiye bölgesi için geçerli.", tags: ['Popüler'], stock: ['STEAM-A1B2', 'STEAM-C3D4', 'STEAM-E5F6'], sales: 147, status: 'ACTIVE', deliveryTime: 'Anında', createdAt: now - 86400000 * 60, boostUntil: 0 },
      { id: 'p2', name: "Netflix Premium 1 Ay", price: 450, category: 'cat_2', subcat: 'Netflix', image: "https://placehold.co/400x300/e50914/FFF?text=Netflix", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'account', desc: "4K UHD kalite, 4 ekran.", tags: ['4K'], stock: ['NFLX-01@mail/p1', 'NFLX-02@mail/p2'], sales: 92, status: 'ACTIVE', deliveryTime: '5 Dk', createdAt: now - 86400000 * 45, boostUntil: 0 },
      { id: 'p3', name: "Valorant Hesabı - Immortal", price: 1250, category: 'cat_1', subcat: 'Riot Games', image: "https://placehold.co/400x300/ff4655/FFF?text=Valorant", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'account', desc: "Immortal 3, 50+ skin.", tags: ['Nadir'], stock: ['VAL-IMM-001'], sales: 23, status: 'ACTIVE', deliveryTime: '10 Dk', createdAt: now - 86400000 * 30, boostUntil: 0 },
      { id: 'p4', name: "Spotify Premium 3 Ay", price: 280, category: 'cat_2', subcat: 'Spotify', image: "https://placehold.co/400x300/1DB954/FFF?text=Spotify", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "3 aylık Premium.", tags: ['Müzik'], stock: ['SP-001', 'SP-002', 'SP-003'], sales: 154, status: 'ACTIVE', deliveryTime: 'Anında', createdAt: now - 86400000 * 50, boostUntil: 0 },
      { id: 'p5', name: "Google Play 100 TL", price: 480, category: 'cat_3', subcat: 'Google Play', image: "https://placehold.co/400x300/34a853/FFF?text=Google+Play", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "Google Play hediye kartı.", tags: ['Mobil'], stock: ['GP-100-A1', 'GP-100-A2'], sales: 112, status: 'ACTIVE', deliveryTime: 'Anında', createdAt: now - 86400000 * 40, boostUntil: 0 },
      { id: 'p6', name: "Riot Points 1380 RP", price: 320, category: 'cat_1', subcat: 'Riot Games', image: "https://placehold.co/400x300/d13639/FFF?text=Riot+Points", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'code', desc: "LoL & Valorant için.", tags: ['RP'], stock: ['RP-X1', 'RP-X2'], sales: 134, status: 'ACTIVE', deliveryTime: 'Anında', createdAt: now - 86400000 * 35, boostUntil: 0 },
      { id: 'p7', name: "Discord Nitro 1 Ay", price: 180, category: 'cat_9', subcat: 'Discord Nitro', image: "https://placehold.co/400x300/5865F2/FFF?text=Discord+Nitro", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "Discord Nitro.", tags: ['Sosyal'], stock: ['NITRO-001', 'NITRO-002', 'NITRO-003'], sales: 267, status: 'ACTIVE', deliveryTime: 'Anında', createdAt: now - 86400000 * 55, boostUntil: 0 },
      { id: 'p8', name: "Xbox Game Pass Ultimate", price: 550, category: 'cat_1', subcat: 'Xbox', image: "https://placehold.co/400x300/107C10/FFF?text=Xbox+GamePass", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "3 aylık Ultimate.", tags: ['Oyun'], stock: ['XGPU-01', 'XGPU-02'], sales: 145, status: 'ACTIVE', deliveryTime: 'Anında', createdAt: now - 86400000 * 42, boostUntil: 0 },
      { id: 'p9', name: "Apple Gift Card 250 TL", price: 1150, category: 'cat_3', subcat: 'Apple', image: "https://placehold.co/400x300/000000/FFF?text=Apple", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "App Store, iTunes.", tags: ['Apple'], stock: ['APPLE-250-A'], sales: 56, status: 'ACTIVE', deliveryTime: 'Anında', createdAt: now - 86400000 * 28, boostUntil: 0 },
      { id: 'p10', name: "CS2 Prime Status", price: 220, category: 'cat_1', subcat: 'Steam', image: "https://placehold.co/400x300/de9b35/FFF?text=CS2", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'code', desc: "CS2 Prime.", tags: ['FPS'], stock: ['CSGO-P-01', 'CSGO-P-02'], sales: 292, status: 'ACTIVE', deliveryTime: 'Anında', createdAt: now - 86400000 * 65, boostUntil: 0 },
      { id: 'p11', name: "Canva Pro 1 Yıl", price: 150, category: 'cat_8', subcat: 'Canva', image: "https://placehold.co/400x300/00C4CC/FFF?text=Canva+Pro", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'account', desc: "1 yıllık Pro.", tags: ['Tasarım'], stock: ['CANVA-01@mail', 'CANVA-02@mail'], sales: 178, status: 'ACTIVE', deliveryTime: '5 Dk', createdAt: now - 86400000 * 20, boostUntil: 0 },
      { id: 'p12', name: "ChatGPT Plus 1 Ay", price: 490, category: 'cat_11', subcat: 'ChatGPT Plus', image: "https://placehold.co/400x300/10a37f/FFF?text=ChatGPT+Plus", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'account', desc: "1 aylık Plus.", tags: ['AI'], stock: ['GPT-01@mail'], sales: 39, status: 'ACTIVE', deliveryTime: '10 Dk', createdAt: now - 86400000 * 15, boostUntil: 0 },
    ],
    orders: [] as any[],
    transactions: [] as any[],
    reviews: [] as any[],
    tickets: [] as any[],
    gameHistory: [] as any[],
    announcements: [
      { id: 'a1', title: 'TShop Ultimate Yayında!', content: 'Yeni özellikler: Tam admin yönetim, Telegram giriş, VIP sistem.', date: now - 3600000, priority: 'high' },
    ] as any[],    flashSale: { active: false, productId: null, discount: 0, endsAt: 0 },
    usedCoupons: [] as string[],
    completedTasks: {} as Record<string, number>,
    tasks: [
      { id: 't1', title: "Telegram Kanalına Katıl", reward: 50, category: "Sosyal", repeatable: false, icon: "📢", description: "Telegram kanalımıza katıl", verifyType: 'manual' },
      { id: 't2', title: "Günlük Giriş", reward: 10, category: "Günlük", repeatable: true, cooldown: 86400000, icon: "📅", description: "Her gün giriş yap", verifyType: 'auto' },
      { id: 't3', title: "Profilini Tamamla", reward: 50, category: "Günlük", repeatable: false, icon: "✏️", description: "Profil bilgilerini doldur", verifyType: 'auto' },
      { id: 't4', title: "İlk Yorumunu Yap", reward: 40, category: "Topluluk", repeatable: false, icon: "💭", description: "Bir ürüne yorum yaz", verifyType: 'auto' },
      { id: 't5', title: "Arkadaş Davet Et", reward: 100, category: "Referans", repeatable: true, cooldown: 86400000 * 7, icon: "👥", description: "Arkadaşını davet et", verifyType: 'auto' },
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
// ZUSTAND STORE (FULL LOGIC)
// =============================================================================
interface StoreState extends DB {
  currentUserId: string | null;
  cart: any[];
  favorites: string[];
  compareList: string[];
  notifications: any[];
  
  // Core Actions
  setCurrentUser: (id: string | null) => void;
  updateUser: (userId: string, updater: Partial<any> | ((u: any) => any)) => void;
  updatePoints: (userId: string, amount: number, reason: string, type?: 'earn' | 'spend') => void;
  updateStat: (userId: string, key: string, delta?: number) => void;
  addNotification: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, delta: number) => void;
  toggleFavorite: (id: string) => void;
  setDB: (updater: (prev: DB) => DB) => void;
  
  // BUSINESS LOGIC ACTIONS (ts.txt & v.txt'den)
  purchaseVIP: (level: string, duration: 'weekly' | 'monthly') => void;
  requestTopUp: (pkg: any, receiptData: string | null, paymentMethod: string) => void;
  approveTopUp: (topUpId: string) => void;
  rejectTopUp: (topUpId: string, reason: string) => void;  requestWithdraw: (amount: number, method: string, details: any) => void;
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

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createInitialDB(),
      currentUserId: null,
      cart: [],
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
        if (!user || (type === 'spend' && user.points < amount)) return state;        const tx = { id: generateId(), userId, amount, reason, type, date: Date.now() };
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
        const existing = state.cart.find(i => i.id === product.id);
        if (existing) return { cart: state.cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
        return { cart: [...state.cart, { ...product, qty: 1 }] };
      }),

      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(i => i.id !== id) })),
      
      updateCartQty: (id, delta) => set((state) => ({
        cart: state.cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
      })),

      toggleFavorite: (id) => set((state) => ({
        favorites: state.favorites.includes(id) ? state.favorites.filter(f => f !== id) : [...state.favorites, id]
      })),

      setDB: (updater) => set((state) => updater(state)),
      addAuditLog: (action, details) => set((state) => {
        const user = state.users.find(u => u.id === state.currentUserId);
        return {
          ...state,
          auditLog: [{ id: generateId(), userId: user?.id, username: user?.username, role: user?.role, action, details, date: Date.now() }, ...state.auditLog].slice(0, 1000)
        };
      }),

      // === VIP SATIN ALMA (ts.txt'den) ===
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
        state.updatePoints(user.id, price, `${VIP_BENEFITS[level as keyof typeof VIP_BENEFITS]?.name} - ${duration === 'weekly' ? 'Haftalık' : 'Aylık'}`, 'spend');
        const currentExpiry = user.vipExpiresAt && user.vipExpiresAt > Date.now() ? user.vipExpiresAt : Date.now();
        const newExpiry = currentExpiry + (days * 86400000);
        state.updateUser(user.id, { vipLevel: level, vipExpiresAt: newExpiry });
        state.addAuditLog('VIP_PURCHASE', `${user.username} ${VIP_BENEFITS[level as keyof typeof VIP_BENEFITS]?.name} satın aldı`);
        state.addNotification(`✓ ${VIP_BENEFITS[level as keyof typeof VIP_BENEFITS]?.name} aktif edildi!`, "success");
      },

      // === BAKİYE YÜKLEME TALEBİ (ts.txt'den) ===
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
        state.addAuditLog('TOP_UP_REQUEST', `${user.username} ${pkg.amount + pkg.bonus} TS yükleme talebi`);
        state.addNotification("✓ Yükleme talebi oluşturuldu. Admin onayı bekleniyor.", "info");
      },

      approveTopUp: (topUpId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        const topUp = state.pendingTopUps.find(t => t.id === topUpId);        if (!topUp) return;
        state.updatePoints(topUp.userId, topUp.amount, `Bakiye Yükleme (${topUp.price}₺)`, 'earn');
        set((s) => ({ ...s, pendingTopUps: s.pendingTopUps.filter(t => t.id !== topUpId) }));
        state.addAuditLog('TOP_UP_APPROVE', `${topUp.username} için ${topUp.amount} TS onaylandı`);
        state.addNotification("✓ Bakiye yüklendi", "success");
      },

      rejectTopUp: (topUpId, reason) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        set((s) => ({ ...s, pendingTopUps: s.pendingTopUps.filter(t => t.id !== topUpId) }));
        state.addAuditLog('TOP_UP_REJECT', `${topUpId} reddedildi: ${reason}`);
        state.addNotification("Reddedildi", "info");
      },

      // === PARA ÇEKME (ts.txt'den) ===
      requestWithdraw: (amount, method, details) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !user.isSeller) return;
        if (amount < state.config.minWithdraw || amount > user.sellerBalance) return;
        const todayWithdraws = state.pendingWithdrawals.filter(w =>
          w.userId === user.id && new Date(w.date).toDateString() === new Date().toDateString()
        );
        if (todayWithdraws.length >= state.config.dailyWithdrawCount) {
          state.addNotification(`Günde max ${state.config.dailyWithdrawCount} çekim yapabilirsin`, "warning");
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
        state.addAuditLog('WITHDRAW_REQUEST', `${user.username} ${amount} TS çekim talebi`);
        state.addNotification(`✓ Çekim talebi oluşturuldu. Net: ${netAmount} TS`, "info");
      },

      approveWithdraw: (withdrawId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 5)) return;
        const withdraw = state.pendingWithdrawals.find(w => w.id === withdrawId);
        if (!withdraw) return;
        set((s) => ({ ...s, pendingWithdrawals: s.pendingWithdrawals.filter(w => w.id !== withdrawId) }));
        state.addAuditLog('WITHDRAW_APPROVE', `${withdraw.username} için ${withdraw.netAmount} TS onaylandı`);
        state.addNotification("✓ Çekim onaylandı", "success");      },

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

      // === SATICI BAŞVURU (ts.txt'den) ===
      submitSellerApplication: (data) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || user.isSeller) return;
        const existingApp = state.pendingSellerApplications.find(a => a.userId === user.id && a.status === 'PENDING');
        if (existingApp) { state.addNotification("Zaten bekleyen başvurun var", "warning"); return; }
        const application = { id: 'sa_' + generateId(), userId: user.id, username: user.username, ...data, status: 'PENDING', date: Date.now() };
        set((s) => ({ ...s, pendingSellerApplications: [application, ...s.pendingSellerApplications] }));
        state.addAuditLog('SELLER_APPLICATION', `${user.username} satıcı başvurusu yaptı`);
        state.addNotification("✓ Başvurun alındı.", "success");
      },

      approveSellerApplication: (appId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        const app = state.pendingSellerApplications.find(a => a.id === appId);
        if (!app) return;
        state.updateUser(app.userId, { isSeller: true, sellerInfo: { verifiedAt: Date.now(), totalSales: 0 } });
        set((s) => ({ ...s, pendingSellerApplications: s.pendingSellerApplications.map(a => a.id === appId ? { ...a, status: 'APPROVED', reviewedBy: user.username, reviewedAt: Date.now() } : a) }));
        state.addAuditLog('SELLER_APPROVED', `${app.username} satıcı olarak onaylandı`);
        state.addNotification("✓ Satıcı onaylandı", "success");
      },

      rejectSellerApplication: (appId, reason) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        set((s) => ({ ...s, pendingSellerApplications: s.pendingSellerApplications.map(a => a.id === appId ? { ...a, status: 'REJECTED', reviewedBy: user.username, reviewedAt: Date.now(), rejectReason: reason } : a) }));
        state.addAuditLog('SELLER_REJECTED', `${appId} reddedildi: ${reason}`);
        state.addNotification("Reddedildi", "info");
      },

      // === YORUM (v.txt'den) ===
      submitReview: (productId, rating, text) => {        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const cleanText = sanitize(text);
        if (!cleanText.trim() || cleanText.length < 5) { state.addNotification("Yorum en az 5 karakter", "error"); return; }
        if (cleanText.length > state.config.maxReviewLength) { state.addNotification(`Max ${state.config.maxReviewLength} karakter`, "error"); return; }
        const hasBought = state.orders.some(o => o.userId === user.id && o.items.some(i => i.id === productId));
        if (!hasBought) { state.addNotification("Bu ürünü satın almadan yorum yapamazsın", "error"); return; }
        const product = state.products.find(p => p.id === productId);
        if (product && product.sellerId === user.id) { state.addNotification("Kendi ürünün için yorum yapamazsın", "error"); return; }
        if (state.reviews.some(r => r.productId === productId && r.userId === user.id)) { state.addNotification("Zaten yorum yaptın", "error"); return; }
        const newReview = { id: generateId(), productId, userId: user.id, userName: user.username, rating, text: cleanText, date: Date.now() };
        set((s) => ({ ...s, reviews: [newReview, ...s.reviews] }));
        state.updateStat(user.id, 'reviewsWritten');
        state.updatePoints(user.id, 10, "Yorum Ödülü", "earn");
        state.addNotification("Yorum yayınlandı! +10 TS", "success");
      },

      // === GÖREV (v.txt'den) ===
      completeTask: (task) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const now = Date.now();
        const lastCompleted = state.completedTasks[task.id] || 0;
        if (!task.repeatable && lastCompleted > 0) { state.addNotification("Bu görev zaten tamamlandı!", "error"); return; }
        if (task.repeatable && task.cooldown && (now - lastCompleted) < task.cooldown) { state.addNotification("Bekleme süresinde...", "error"); return; }
        set((s) => ({ ...s, completedTasks: { ...s.completedTasks, [task.id]: now } }));
        state.updatePoints(user.id, task.reward, `Görev: ${task.title}`, 'earn');
        state.updateStat(user.id, 'tasksCompleted');
        state.addNotification(`+${task.reward} TS Kazandınız!`, "success");
      },

      // === OYUNLAR (v.txt'den - Fair Math) ===
      playGame: (type, betAmount, guess) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        if (betAmount < 10 || betAmount > state.config.maxBetLimit || user.points < betAmount) {
          state.addNotification("Geçersiz bahis veya yetersiz bakiye", "error");
          return;
        }
        let won = false, payout = 0, result = "", details: any = {};
        if (type === 'dice') {
          const d1 = Math.floor(Math.random() * 6) + 1;
          const d2 = Math.floor(Math.random() * 6) + 1;
          const sum = d1 + d2; const isEven = sum % 2 === 0;
          result = `Zarlar: ${d1} + ${d2} = ${sum} (${isEven ? 'Çift' : 'Tek'})`;
          details = { d1, d2, sum, isEven };
          if ((guess === 'even' && isEven) || (guess === 'odd' && !isEven)) { won = true; payout = Math.floor(betAmount * 1.95); }        } else if (type === 'coin') {
          const flip = Math.random() < 0.5 ? 'heads' : 'tails';
          result = `Madeni para: ${flip === 'heads' ? 'Tura' : 'Yazı'}`;
          details = { flip };
          if (guess === flip) { won = true; payout = Math.floor(betAmount * 1.95); }
        } else if (type === 'crash') {
          const crashPoint = Math.max(1.0, (100 / (Math.random() * 100 + 1)));
          result = `Çöküş: ${crashPoint.toFixed(2)}x`;
          details = { crashPoint };
          if (guess <= crashPoint) { won = true; payout = Math.floor(betAmount * guess); }
        }
        const profit = won ? payout - betAmount : -betAmount;
        set((s) => {
          const newHistory = { id: generateId(), userId: user.id, type, bet: betAmount, won, payout: won ? payout : 0, profit, result, details, date: Date.now() };
          const newStats = { ...s.users.find(u => u.id === user.id)!.stats, gamesPlayed: (s.users.find(u => u.id === user.id)!.stats.gamesPlayed || 0) + 1, biggestWin: Math.max(s.users.find(u => u.id === user.id)!.stats.biggestWin || 0, profit) };
          return { ...s, users: s.users.map(u => u.id === user.id ? { ...u, points: u.points + profit, stats: newStats } : u), gameHistory: [newHistory, ...s.gameHistory].slice(0, 500) };
        });
        state.addNotification(won ? `Kazandın! +${payout} TS` : `Kaybettin. ${result}`, won ? 'success' : 'error');
      },

      // === ÇARK (ts.txt'den - VIP Weighted) ===
      spinWheel: () => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return 0;
        const lastSpin = user.stats?.lastSpin || 0;
        if (Date.now() - lastSpin < 86400000) { state.addNotification("Çarkı günde 1 kez çevirebilirsin!", "error"); return 0; }
        const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel as keyof typeof VIP_BENEFITS] : null;
        const rewards = vipBenefits ? vipBenefits.wheelRewards : [5, 10, 15, 20, 25, 30, 50, 100];
        const belowChance = vipBenefits ? vipBenefits.wheelBelowChance : 0.7;
        let prize;
        if (Math.random() < belowChance) {
          const threshold = user.vipLevel === VIP_LEVELS.STANDARD ? 100 : user.vipLevel === VIP_LEVELS.PRO ? 150 : 190;
          const lowRewards = rewards.filter(r => r < threshold);
          prize = lowRewards[Math.floor(Math.random() * lowRewards.length)] || rewards[0];
        } else {
          const threshold = user.vipLevel === VIP_LEVELS.STANDARD ? 100 : user.vipLevel === VIP_LEVELS.PRO ? 150 : 190;
          const highRewards = rewards.filter(r => r >= threshold);
          prize = highRewards[Math.floor(Math.random() * highRewards.length)] || rewards[rewards.length - 1];
        }
        state.updatePoints(user.id, prize, "Günlük Çark", "earn");
        state.updateUser(user.id, { stats: { ...user.stats, lastSpin: Date.now() } });
        state.addNotification(`+${prize} TS kazandın!`, "success");
        return prize;
      },

      // === TS GÖNDERME (ts.txt'den - Tax Logic) ===
      sendTS: (recipientUsername, amount, message) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);        if (!user) return;
        if (!recipientUsername || recipientUsername.length < 3) { state.addNotification("Geçersiz alıcı", "error"); return; }
        if (recipientUsername.toLowerCase() === user.username.toLowerCase()) { state.addNotification("Kendine TS gönderemezsin", "error"); return; }
        if (!amount || amount < state.config.minTransfer) { state.addNotification(`Min: ${state.config.minTransfer} TS`, "error"); return; }
        if (amount > user.points) { state.addNotification("Yetersiz bakiye", "error"); return; }
        const recipient = state.users.find(u => u.username.toLowerCase() === recipientUsername.toLowerCase());
        if (!recipient) { state.addNotification("Alıcı bulunamadı", "error"); return; }
        if (recipient.banned) { state.addNotification("Alıcı yasaklanmış", "error"); return; }
        const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel as keyof typeof VIP_BENEFITS] : null;
        const taxRate = vipBenefits ? vipBenefits.transferTaxRate : state.config.transferTax;
        const tax = amount > 1000 ? Math.floor(amount * taxRate) : 0;
        const totalCost = amount + tax;
        if (user.points < totalCost) { state.addNotification("Vergi dahil yetersiz bakiye", "error"); return; }
        set((s) => {
          const senderTx = { id: generateId(), userId: user.id, amount: totalCost, reason: `@${recipient.username} kullanıcısına gönderildi${message ? ': ' + sanitize(message) : ''}${tax > 0 ? ` (Vergi: ${tax} TS)` : ''}`, type: 'spend', date: Date.now() };
          const recipientTx = { id: generateId(), userId: recipient.id, amount: amount, reason: `@${user.username} kullanıcısından alındı${message ? ': ' + sanitize(message) : ''}`, type: 'earn', date: Date.now() };
          return { ...s, users: s.users.map(u => { if (u.id === user.id) return { ...u, points: u.points - totalCost }; if (u.id === recipient.id) return { ...u, points: u.points + amount }; return u; }), transactions: [senderTx, recipientTx, ...s.transactions].slice(0, 1000) };
        });
        state.addNotification(`✓ ${amount} TS gönderildi!${tax > 0 ? ` (${tax} TS vergi)` : ''}`, "success");
      },

      // === İADE TALEBİ (v.txt'den) ===
      requestReturn: (orderId, itemId, reason) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const today = new Date().toDateString();
        const todayTickets = state.tickets.filter(t => new Date(t.date).toDateString() === today);
        if (todayTickets.length >= state.config.maxTicketsPerDay) { state.addNotification(`Günde en fazla ${state.config.maxTicketsPerDay} talep`, "warning"); return; }
        const order = state.orders.find(o => o.id === orderId);
        const item = order?.items.find(i => i.id === itemId);
        if (!order || !item) return;
        const hoursPassed = (Date.now() - order.date) / (1000 * 60 * 60);
        if (hoursPassed > state.config.returnWindowHours) { state.addNotification(`İade süresi doldu (${state.config.returnWindowHours} saat)`, "error"); return; }
        if (state.tickets.some(t => t.orderId === orderId && t.itemId === itemId && t.status === 'OPEN')) { state.addNotification("Zaten açık talep var", "error"); return; }
        const ticket = { id: generateId(), type: 'RETURN', orderId, itemId, itemName: item.name, userId: user.id, reason: sanitize(reason), status: 'OPEN', date: Date.now() };
        set((s) => ({ ...s, tickets: [ticket, ...s.tickets] }));
        state.addNotification("İade talebi oluşturuldu.", "info");
      },

      // === İADE ONAYLAMA (ts.txt'den - Stock Restore) ===
      approveReturn: (ticketId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        const ticket = state.tickets.find(t => t.id === ticketId);
        if (!ticket) return;
        const order = state.orders.find(o => o.id === ticket.orderId);
        const item = order?.items.find(i => i.id === ticket.itemId);
        if (!order || !item) return;        set((s) => {
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
          return { ...s, users: updatedUsers, products: updatedProducts, tickets: s.tickets.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED' } : t), transactions: [{ id: generateId(), userId: ticket.userId, amount: refundAmount, reason: `İade: ${item.name}`, type: 'earn', date: Date.now() }, ...s.transactions].slice(0, 1000) };
        });
        state.addNotification("İade onaylandı, stok geri eklendi.", "success");
      },

      rejectReturn: (ticketId) => {
        set((s) => ({ ...s, tickets: s.tickets.map(t => t.id === ticketId ? { ...t, status: 'REJECTED' } : t) }));
        get().addNotification("Talep reddedildi", "info");
      },

      // === ÜRÜN YÖNETİMİ (ts.txt'den) ===
      addProduct: (newProd) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !user.isSeller) { state.addNotification("Yetkiniz yok", "error"); return; }
        if (!newProd.name || !newProd.price) { state.addNotification("Eksik bilgi", "error"); return; }
        const invList = newProd.inventory.split('\n').filter((x: string) => x.trim());
        if (invList.length === 0) { state.addNotification("En az 1 stok kodu gerekli", "error"); return; }
        const prod = {
          id: 'p_' + generateId(), name: sanitize(newProd.name).slice(0, 100),
          price: Math.max(1, Number(newProd.price)), category: newProd.category, subcat: newProd.subcat || '',
          sellerId: user.id, sellerName: user.username, image: newProd.image || "https://placehold.co/400x300/333/FFF?text=New",
          sales: 0, type: 'code', tags: newProd.tags.split(',').map((t: string) => sanitize(t.trim())).filter(Boolean).slice(0, 3),
          desc: sanitize(newProd.desc).slice(0, 500), stock: invList, verified: hasPermission(user.role, 5),
          status: 'ACTIVE', deliveryTime: 'Anında', createdAt: Date.now(), boostUntil: 0,
        };
        set((s) => ({ ...s, products: [...s.products, prod] }));
        state.addNotification("Ürün eklendi!", "success");
      },

      deleteProduct: (productId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        const prod = state.products.find(p => p.id === productId);
        if (!prod) return;
        if (prod.sellerId !== user?.id && !hasPermission(user?.role || '', 5)) { state.addNotification("Yetkiniz yok", "error"); return; }
        set((s) => ({ ...s, products: s.products.filter(p => p.id !== productId) }));        state.addNotification("Ürün silindi", "info");
      },

      boostProduct: (productId) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel as keyof typeof VIP_BENEFITS] : null;
        if (!vipBenefits) { state.addNotification("Sadece VIP üyeler ürün öne çıkarabilir", "error"); return; }
        const boostedProducts = state.products.filter(p => p.sellerId === user.id && p.boostUntil > Date.now());
        if (boostedProducts.length >= vipBenefits.boostProducts) { state.addNotification(`Boost limitin doldu`, "warning"); return; }
        const boostUntil = Date.now() + (vipBenefits.boostDays * 86400000);
        set((s) => ({ ...s, products: s.products.map(p => p.id === productId ? { ...p, boostUntil } : p) }));
        state.addNotification(`✓ Ürün ${vipBenefits.boostDays} gün öne çıkarıldı!`, "success");
      },

      // === ADMIN USER MANAGEMENT (ts.txt'den) ===
      banUser: (userId, reason = '') => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        const targetUser = state.users.find(u => u.id === userId);
        if (!targetUser) return;
        if (ROLE_HIERARCHY[targetUser.role] >= ROLE_HIERARCHY[user.role]) { state.addNotification("Kendinizden yüksek yetkiliyi banlayamazsın", "error"); return; }
        state.updateUser(userId, { banned: !targetUser.banned });
        state.addAuditLog('USER_BAN_TOGGLE', `${targetUser.username} ${targetUser.banned ? 'yasağı kaldırıldı' : 'banlandı'}. Sebep: ${reason}`);
        state.addNotification(targetUser.banned ? "Yasak kaldırıldı" : "Kullanıcı banlandı", "info");
      },

      setUserRole: (userId, newRole) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;
        const targetUser = state.users.find(u => u.id === userId);
        if (!targetUser) return;
        if (newRole === ROLES.FOUNDER && user.role !== ROLES.FOUNDER) { state.addNotification("Kurucu yetkisi sadece kurucu tarafından verilebilir", "error"); return; }
        if (newRole === ROLES.SUPER_ADMIN && user.role !== ROLES.FOUNDER && user.role !== ROLES.SUPER_ADMIN) { state.addNotification("Sadece kurucu/süper admin atayabilir", "error"); return; }
        if (newRole === ROLES.ADMIN && !hasPermission(user.role, 6)) { state.addNotification("Süper admin+ yetkisi gerekli", "error"); return; }
        if (newRole === ROLES.AUTHORITY && !hasPermission(user.role, 5)) { state.addNotification("Admin+ yetkisi gerekli", "error"); return; }
        if (newRole === ROLES.MODERATOR && !hasPermission(user.role, 4)) { state.addNotification("Yetkili+ yetkisi gerekli", "error"); return; }
        state.updateUser(userId, { role: newRole });
        state.addAuditLog('ROLE_CHANGE', `${targetUser.username} rolü ${newRole} yapıldı`);
        state.addNotification(`✓ Rol güncellendi: ${newRole}`, "success");
      },

      // === KVKK / GDPR (v.txt'den) ===
      exportData: () => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user) return;        const data = {
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
          reviews: s.reviews.filter(r => r.userId !== user.id),
          orders: s.orders.filter(o => o.userId !== user.id),
          transactions: s.transactions.filter(t => t.userId !== user.id),
          gameHistory: s.gameHistory.filter(g => g.userId !== user.id),
          currentUserId: null,
        }));
        state.addNotification("Hesabın ve verilerin KVKK gereği silindi.", "info");
      },

      // === ADMIN CONFIG & CONTENT (ts.txt'den) ===
      addAnnouncement: (title, content, priority) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 4)) return;
        set((s) => ({ ...s, announcements: [{ id: 'a_' + generateId(), title: sanitize(title), content: sanitize(content), priority, date: Date.now() }, ...s.announcements] }));
        state.addAuditLog('ANNOUNCEMENT_ADD', `Duyuru: ${title}`);
        state.addNotification("Duyuru eklendi", "success");
      },

      updateConfig: (newConfig) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || user.role !== ROLES.FOUNDER) { state.addNotification("Sadece kurucu yapabilir", "error"); return; }
        set((s) => ({ ...s, config: { ...s.config, ...newConfig } }));
        state.addAuditLog('CONFIG_UPDATE', 'Site ayarları güncellendi');
        state.addNotification("✓ Ayarlar kaydedildi", "success");
      },
      updateCategories: (newCategories) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 5)) return;
        set((s) => ({ ...s, categories: newCategories }));
        state.addAuditLog('CATEGORIES_UPDATE', 'Kategoriler güncellendi');
        state.addNotification("✓ Kategoriler güncellendi", "success");
      },

      updateVipPrices: (newPrices) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || user.role !== ROLES.FOUNDER) return;
        set((s) => ({ ...s, vipPrices: newPrices }));
        state.addAuditLog('VIP_PRICES_UPDATE', 'VIP fiyatları güncellendi');
        state.addNotification("✓ VIP fiyatları güncellendi", "success");
      },

      updateTopUpPackages: (newPackages) => {
        const state = get();
        const user = state.users.find(u => u.id === state.currentUserId);
        if (!user || !hasPermission(user.role, 5)) return;
        set((s) => ({ ...s, topUpPackages: newPackages }));
        state.addAuditLog('PACKAGES_UPDATE', 'TS paketleri güncellendi');
        state.addNotification("✓ Paketler güncellendi", "success");
      },
    }),
    {
      name: 'tshop-ultimate-storage',
      partialize: (state) => ({
        users: state.users, products: state.products, orders: state.orders,
        transactions: state.transactions, reviews: state.reviews, tickets: state.tickets,
        gameHistory: state.gameHistory, announcements: state.announcements, tasks: state.tasks,
        completedTasks: state.completedTasks, coupons: state.coupons, currentUserId: state.currentUserId,
        cart: state.cart, favorites: state.favorites, config: state.config, categories: state.categories,
        vipPrices: state.vipPrices, topUpPackages: state.topUpPackages,
        pendingTopUps: state.pendingTopUps, pendingWithdrawals: state.pendingWithdrawals,
        pendingSellerApplications: state.pendingSellerApplications, auditLog: state.auditLog,
        flashSale: state.flashSale, usedCoupons: state.usedCoupons,
      }),
    }
  )
);
