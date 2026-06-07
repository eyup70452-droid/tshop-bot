import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createActions } from './store-actions';

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
  { id: 'cat_1', name: 'Oyun Kodlari', icon: '\uD83C\uDFAE', subcats: ['Steam', 'Riot Games', 'Epic Games', 'Xbox', 'PlayStation'] },
  { id: 'cat_2', name: 'Streaming', icon: '\uD83D\uDCFA', subcats: ['Netflix', 'Disney+', 'BluTV', 'Exxen', 'Spotify', 'YouTube Premium'] },
  { id: 'cat_3', name: 'Hediye Kartlari', icon: '\uD83D\uDCB3', subcats: ['Google Play', 'Apple', 'Amazon', 'Razer Gold'] },
  { id: 'cat_4', name: 'Yazilim Lisanslari', icon: '\uD83D\uDCBB', subcats: ['Windows', 'Office', 'Adobe', 'Antivirus'] },
  { id: 'cat_5', name: 'Egitim', icon: '\uD83C\uDF93', subcats: ['Udemy', 'Coursera', 'MasterClass'] },
  { id: 'cat_6', name: 'Mobil Oyun', icon: '\uD83D\uDCF1', subcats: ['PUBG UC', 'Mobile Legends', 'Clash of Clans', 'Brawl Stars'] },
  { id: 'cat_7', name: 'VPN Guvenlik', icon: '\uD83D\uDEE1\uFE0F', subcats: ['NordVPN', 'ExpressVPN', 'Surfshark'] },
  { id: 'cat_8', name: 'Tasarim', icon: '\uD83C\uDFA8', subcats: ['Canva', 'Figma', 'Adobe CC'] },
  { id: 'cat_9', name: 'Sosyal Medya', icon: '\uD83D\uDCF1', subcats: ['Discord Nitro', 'Twitter Blue', 'Telegram Premium'] },
  { id: 'cat_10', name: 'Crypto Web3', icon: '\u20BF', subcats: ['NFT', 'Wallet Premium'] },
  { id: 'cat_11', name: 'AI Aracari', icon: '\uD83E\uDD16', subcats: ['ChatGPT Plus', 'Claude Pro', 'Midjourney'] },
  { id: 'cat_12', name: 'Ozel Urunler', icon: '\u2728', subcats: ['Limited', 'Bundle'] },];

export const BADGES_DEF = [
  { id: 'first_purchase', name: 'Ilk Adim', icon: '\uD83D\uDECD\uFE0F', desc: 'Ilk siparisini ver', condition: (u: any) => u?.stats?.orders >= 1, xp: 50, tier: 'D' },
  { id: 'task_master', name: 'Gorev Ustasi', icon: '\u2694\uFE0F', desc: '10 Gorev tamamla', condition: (u: any) => u?.stats?.tasksCompleted >= 10, xp: 200, tier: 'C' },
  { id: 'rich', name: 'Zengin', icon: '\uD83D\uDC8E', desc: '5000 TS biriktir', condition: (u: any) => u?.points >= 5000, xp: 500, tier: 'B' },
  { id: 'social', name: 'Sosyal', icon: '\uD83D\uDDE3\uFE0F', desc: '5 Yorum yap', condition: (u: any) => u?.stats?.reviewsWritten >= 5, xp: 150, tier: 'D' },
  { id: 'collector', name: 'Koleksiyoncu', icon: '\uD83C\uDFC6', desc: '10 Favori ekle', condition: (u: any) => u?.stats?.favorites >= 10, xp: 100, tier: 'C' },
  { id: 'vip', name: 'VIP Uye', icon: '\uD83D\uDC51', desc: 'VIP ol', condition: (u: any) => u?.vipLevel && u.vipLevel !== VIP_LEVELS.NONE, xp: 1000, tier: 'A' },
  { id: 'referrer', name: 'Davetci', icon: '\uD83D\uDCE2', desc: '5 Kisi davet et', condition: (u: any) => u?.referrals?.count >= 5, xp: 300, tier: 'B' },
  { id: 'shopaholic', name: 'Alisveris Tutkunu', icon: '\uD83D\uDED2', desc: '50 Siparis ver', condition: (u: any) => u?.stats?.orders >= 50, xp: 2000, tier: 'S' },
  { id: 'streak_7', name: 'Haftalik Seri', icon: '\uD83D\uDD25', desc: '7 gun ust uste giris', condition: (u: any) => u?.stats?.currentStreak >= 7, xp: 250, tier: 'C' },
  { id: 'reviewer_pro', name: 'Profesyonel Yorumcu', icon: '\uD83D\uDCDD', desc: '25 Yorum yap', condition: (u: any) => u?.stats?.reviewsWritten >= 25, xp: 500, tier: 'B' },
  { id: 'two_fa', name: 'Guvenlik Ustasi', icon: '\uD83D\uDD10', desc: '2FA aktif et', condition: (u: any) => u?.twoFA === true, xp: 200, tier: 'C' },
  { id: 'high_roller', name: 'Yuksek Bahis', icon: '\uD83C\uDFB0', desc: '100 oyun oyna', condition: (u: any) => u?.stats?.gamesPlayed >= 100, xp: 800, tier: 'A' },
  { id: 'lucky', name: 'Sansli', icon: '\uD83C\uDF40', desc: '500+ TS tek seferde kazan', condition: (u: any) => u?.stats?.biggestWin >= 500, xp: 400, tier: 'B' },
  { id: 'top_seller', name: 'Top Satici', icon: '\u2B50', desc: '100 urun sat', condition: (u: any) => u?.stats?.itemsSold >= 100, xp: 1500, tier: 'S' },
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

// =============================================================================
// MOCK DATABASE INITIALIZATION (TAM VERİ)
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
      { id: 'pkg_7', amount: 30000, price: 4600, bonus: 4000 },    ],
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
      { id: 'p1', name: "Steam 50 TL Bakiye", price: 250, category: 'cat_1', subcat: 'Steam', image: "https://placehold.co/400x300/1a202c/FFF?text=Steam+50TL", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'code', desc: "Aninda teslimat. Turkiye bolgesi icin gecerli.", tags: ['Populer'], stock: ['STEAM-A1B2', 'STEAM-C3D4', 'STEAM-E5F6'], sales: 147, status: 'ACTIVE', deliveryTime: 'Aninda', createdAt: now - 86400000 * 60, boostUntil: 0 },
      { id: 'p2', name: "Netflix Premium 1 Ay", price: 450, category: 'cat_2', subcat: 'Netflix', image: "https://placehold.co/400x300/e50914/FFF?text=Netflix", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'account', desc: "4K UHD kalite, 4 ekran.", tags: ['4K'], stock: ['NFLX-01@mail/p1', 'NFLX-02@mail/p2'], sales: 92, status: 'ACTIVE', deliveryTime: '5 Dk', createdAt: now - 86400000 * 45, boostUntil: 0 },
      { id: 'p3', name: "Valorant Hesabi - Immortal", price: 1250, category: 'cat_1', subcat: 'Riot Games', image: "https://placehold.co/400x300/ff4655/FFF?text=Valorant", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'account', desc: "Immortal 3, 50+ skin.", tags: ['Nadir'], stock: ['VAL-IMM-001'], sales: 23, status: 'ACTIVE', deliveryTime: '10 Dk', createdAt: now - 86400000 * 30, boostUntil: 0 },
      { id: 'p4', name: "Spotify Premium 3 Ay", price: 280, category: 'cat_2', subcat: 'Spotify', image: "https://placehold.co/400x300/1DB954/FFF?text=Spotify", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "3 aylik Premium.", tags: ['Muzik'], stock: ['SP-001', 'SP-002', 'SP-003'], sales: 154, status: 'ACTIVE', deliveryTime: 'Aninda', createdAt: now - 86400000 * 50, boostUntil: 0 },
      { id: 'p5', name: "Google Play 100 TL", price: 480, category: 'cat_3', subcat: 'Google Play', image: "https://placehold.co/400x300/34a853/FFF?text=Google+Play", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "Google Play hediye karti.", tags: ['Mobil'], stock: ['GP-100-A1', 'GP-100-A2'], sales: 112, status: 'ACTIVE', deliveryTime: 'Aninda', createdAt: now - 86400000 * 40, boostUntil: 0 },
      { id: 'p6', name: "Riot Points 1380 RP", price: 320, category: 'cat_1', subcat: 'Riot Games', image: "https://placehold.co/400x300/d13639/FFF?text=Riot+Points", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'code', desc: "LoL ve Valorant icin.", tags: ['RP'], stock: ['RP-X1', 'RP-X2'], sales: 134, status: 'ACTIVE', deliveryTime: 'Aninda', createdAt: now - 86400000 * 35, boostUntil: 0 },      { id: 'p7', name: "Discord Nitro 1 Ay", price: 180, category: 'cat_9', subcat: 'Discord Nitro', image: "https://placehold.co/400x300/5865F2/FFF?text=Discord+Nitro", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "Discord Nitro.", tags: ['Sosyal'], stock: ['NITRO-001', 'NITRO-002', 'NITRO-003'], sales: 267, status: 'ACTIVE', deliveryTime: 'Aninda', createdAt: now - 86400000 * 55, boostUntil: 0 },
      { id: 'p8', name: "Xbox Game Pass Ultimate", price: 550, category: 'cat_1', subcat: 'Xbox', image: "https://placehold.co/400x300/107C10/FFF?text=Xbox+GamePass", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "3 aylik Ultimate.", tags: ['Oyun'], stock: ['XGPU-01', 'XGPU-02'], sales: 145, status: 'ACTIVE', deliveryTime: 'Aninda', createdAt: now - 86400000 * 42, boostUntil: 0 },
      { id: 'p9', name: "Apple Gift Card 250 TL", price: 1150, category: 'cat_3', subcat: 'Apple', image: "https://placehold.co/400x300/000000/FFF?text=Apple", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'code', desc: "App Store, iTunes.", tags: ['Apple'], stock: ['APPLE-250-A'], sales: 56, status: 'ACTIVE', deliveryTime: 'Aninda', createdAt: now - 86400000 * 28, boostUntil: 0 },
      { id: 'p10', name: "CS2 Prime Status", price: 220, category: 'cat_1', subcat: 'Steam', image: "https://placehold.co/400x300/de9b35/FFF?text=CS2", sellerId: 'u_seller1', sellerName: 'ProSeller', verified: true, type: 'code', desc: "CS2 Prime.", tags: ['FPS'], stock: ['CSGO-P-01', 'CSGO-P-02'], sales: 292, status: 'ACTIVE', deliveryTime: 'Aninda', createdAt: now - 86400000 * 65, boostUntil: 0 },
      { id: 'p11', name: "Canva Pro 1 Yil", price: 150, category: 'cat_8', subcat: 'Canva', image: "https://placehold.co/400x300/00C4CC/FFF?text=Canva+Pro", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'account', desc: "1 yillik Pro.", tags: ['Tasarim'], stock: ['CANVA-01@mail', 'CANVA-02@mail'], sales: 178, status: 'ACTIVE', deliveryTime: '5 Dk', createdAt: now - 86400000 * 20, boostUntil: 0 },
      { id: 'p12', name: "ChatGPT Plus 1 Ay", price: 490, category: 'cat_11', subcat: 'ChatGPT Plus', image: "https://placehold.co/400x300/10a37f/FFF?text=ChatGPT+Plus", sellerId: 'u_founder', sellerName: 'TShop Official', verified: true, type: 'account', desc: "1 aylik Plus.", tags: ['AI'], stock: ['GPT-01@mail'], sales: 39, status: 'ACTIVE', deliveryTime: '10 Dk', createdAt: now - 86400000 * 15, boostUntil: 0 },
    ],
    orders: [] as any[],
    transactions: [] as any[],
    reviews: [] as any[],
    tickets: [] as any[],
    gameHistory: [] as any[],
    announcements: [
      { id: 'a1', title: 'TShop Ultimate Yayinda!', content: 'Yeni ozellikler: Tam admin yonetimi, Telegram giris, VIP sistem.', date: now - 3600000, priority: 'high' },
    ] as any[],
    flashSale: { active: false, productId: null, discount: 0, endsAt: 0 },
    usedCoupons: [] as string[],
    completedTasks: {} as Record<string, number>,
    tasks: [
      { id: 't1', title: "Telegram Kanalina Katil", reward: 50, category: "Sosyal", repeatable: false, icon: "\uD83D\uDCE2", description: "Telegram kanalimiza katil", verifyType: 'manual' },
      { id: 't2', title: "Gunluk Giris", reward: 10, category: "Gunluk", repeatable: true, cooldown: 86400000, icon: "\uD83D\uDCC5", description: "Her gun giris yap", verifyType: 'auto' },
      { id: 't3', title: "Profilini Tamamla", reward: 50, category: "Gunluk", repeatable: false, icon: "\u270F\uFE0F", description: "Profil bilgilerini doldur", verifyType: 'auto' },
      { id: 't4', title: "Ilk Yorumunu Yap", reward: 40, category: "Topluluk", repeatable: false, icon: "\uD83D\uDCAD", description: "Bir urune yorum yaz", verifyType: 'auto' },
      { id: 't5', title: "Arkadas Davet Et", reward: 100, category: "Referans", repeatable: true, cooldown: 86400000 * 7, icon: "\uD83D\uDC65", description: "Arkadasini davet et", verifyType: 'auto' },
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
  updateUser: (userId: string, updater: Partial<any> | ((u: any) => any)) => void;  updatePoints: (userId: string, amount: number, reason: string, type?: 'earn' | 'spend') => void;
  updateStat: (userId: string, key: string, delta?: number) => void;
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
      ...createInitialDB(),      currentUserId: null,
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

      addToCart: (product) => set((state) => {        const existing = state.cart.find(i => i.id === product.id);
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

      toggleCompare: (id) => set((state) => {
        const list = state.compareList || [];
        if (list.includes(id)) return { compareList: list.filter(x => x !== id) };
        if (list.length >= 3) {
          state.addNotification("En fazla 3 urun karsilastirabilirsin!", "warning");
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

      // Business logic actions imported from store-actions.ts
      ...createActions(set, get),
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
        pendingSellerApplications: state.pendingSellerApplications, auditLog: state.auditLog,        flashSale: state.flashSale, usedCoupons: state.usedCoupons,
      }),
    }
  )
);
