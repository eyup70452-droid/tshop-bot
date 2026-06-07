// src/app/dashboard/page.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useStore, hasPermission, ROLES, VIP_LEVELS, VIP_BENEFITS, BADGES_DEF } from '@/lib/store';
import { RippleButton, Icon, Badge, Modal, ConfirmDialog, Toast, Confetti, CountdownTimer } from '@/components/ui';
import { cn, formatNumber, formatDate, formatTime, timeAgo, sanitize } from '@/lib/utils';

export default function Dashboard() {
  const {
    users, currentUserId, products, cart, favorites, compareList, orders, transactions,
    reviews, tickets, gameHistory, announcements, tasks, completedTasks, coupons,
    config, categories, vipPrices, topUpPackages, flashSale,
    setCurrentUser, updateUser, updatePoints, updateStat, addNotification,
    addToCart, removeFromCart, updateCartQty, toggleFavorite, setDB
  } = useStore();

  const user = useMemo(() => users.find(u => u.id === currentUserId), [users, currentUserId]);

  // UI State
  const [view, setView] = useState('dashboard');
  const [notification, setNotification] = useState<any>(null);
  const [confetti, setConfetti] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcat, setSelectedSubcat] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [productDetail, setProductDetail] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showSendTS, setShowSendTS] = useState(false);
  const [showVIP, setShowVIP] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showConfirm, setShowConfirm] = useState<any>(null);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState<any>(null);

  // Helpers
  const notify = useCallback((msg: string, type = "success") => {
    setNotification({ msg, type });
    addNotification(msg, type as any);
  }, [addNotification]);

  const triggerConfetti = useCallback(() => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  }, []);
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Badge checker
  useEffect(() => {
    if (!user) return;
    const currentBadges = user.badges || [];
    let newBadges = [...currentBadges];
    let newXpBonus = 0;
    BADGES_DEF.forEach(badge => {
      if (!newBadges.includes(badge.id) && badge.condition(user)) {
        newBadges.push(badge.id);
        newXpBonus += badge.xp || 0;
        setShowBadgeUnlock(badge);
        setTimeout(() => setShowBadgeUnlock(null), 4000);
      }
    });
    if (newBadges.length !== currentBadges.length) {
      updateUser(user.id, {
        badges: newBadges,
        xp: (user.xp || 0) + newXpBonus,
        level: Math.floor(((user.xp || 0) + newXpBonus) / 1000) + 1
      });
    }
  }, [user?.stats?.orders, user?.stats?.tasksCompleted, user?.stats?.reviewsWritten, user?.stats?.favorites, user?.stats?.currentStreak, user?.points, user?.level, user?.referrals?.count, user?.twoFA, user?.stats?.gamesPlayed, user?.stats?.biggestWin, user?.stats?.itemsSold, user?.vipLevel, updateUser]);

  // Computed values
  const productRatingMap = useMemo(() => {
    const map: any = {};
    reviews.forEach(r => {
      if (!map[r.productId]) map[r.productId] = { sum: 0, count: 0 };
      map[r.productId].sum += r.rating;
      map[r.productId].count += 1;
    });
    Object.keys(map).forEach(k => { map[k].avg = Number((map[k].sum / map[k].count).toFixed(1)); });
    return map;
  }, [reviews]);

  const getProductRating = useCallback((productId: string) => productRatingMap[productId] || { avg: 0, count: 0 }, [productRatingMap]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.status === 'ACTIVE');
    const boosted = result.filter(p => p.boostUntil > Date.now()).sort((a, b) => b.boostUntil - a.boostUntil);
    const notBoosted = result.filter(p => !p.boostUntil || p.boostUntil <= Date.now());
    result = [...boosted, ...notBoosted];
    result = result.filter(p => {
      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;      const matchesSubcat = selectedSubcat === "all" || p.subcat === selectedSubcat;
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = !searchLower ||
        p.name.toLowerCase().includes(searchLower) ||
        p.desc.toLowerCase().includes(searchLower) ||
        p.sellerName.toLowerCase().includes(searchLower);
      return matchesCat && matchesSubcat && matchesSearch;
    });
    return [...result].sort((a, b) => {
      const aBoost = a.boostUntil > Date.now();
      const bBoost = b.boostUntil > Date.now();
      if (aBoost && !bBoost) return -1;
      if (!aBoost && bBoost) return 1;
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "popular") return b.sales - a.sales;
      if (sortBy === "rating") return (getProductRating(b.id).avg || 0) - (getProductRating(a.id).avg || 0);
      if (sortBy === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
      return 0;
    });
  }, [debouncedSearch, selectedCategory, selectedSubcat, sortBy, products, getProductRating]);

  const leaderboardData = useMemo(() => {
    return [...users].filter(u => !u.banned).sort((a, b) => b.points - a.points).slice(0, 50).map((u, i) => ({
      id: u.id, name: u.username, pts: u.points, lvl: u.level, badges: u.badges?.length || 0,
      isMe: u.id === currentUserId, rank: i + 1, vipLevel: u.vipLevel
    }));
  }, [users, currentUserId]);

  const currentCategory = useMemo(() => categories.find(c => c.id === selectedCategory), [categories, selectedCategory]);

  // Actions
  const handleCheckout = async (couponCode: string | null) => {
    if (!cart.length || !user) return;
    try {
      let discount = 0;
      const cleanCoupon = couponCode ? sanitize(couponCode).toUpperCase() : '';
      let usedCoupon: any = null;
      if (cleanCoupon) {
        const coupon = coupons.find(c => c.code === cleanCoupon && c.active);
        if (!coupon) throw new Error("Geçersiz kupon");
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new Error("Kupon kullanımı doldu");
        const sub = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        discount = coupon.type === 'flat' ? coupon.value : Math.floor(sub * (coupon.value / 100));
        usedCoupon = coupon;
      }
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
      let bulkDiscount = 0;
      const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
      if (totalItems >= 3) bulkDiscount = Math.floor(subtotal * 0.05);      let flashDiscount = 0;
      if (flashSale.active && flashSale.productId) {
        const flashItem = cart.find(c => c.id === flashSale.productId);
        if (flashItem) flashDiscount = Math.floor(flashItem.price * flashItem.qty * (flashSale.discount / 100));
      }
      const total = Math.max(0, subtotal - discount - bulkDiscount - flashDiscount);
      if (user.points < total) throw new Error("Yetersiz bakiye!");

      const orderItems: any[] = [];
      const stockUpdates: any = {};
      for (const cartItem of cart) {
        const prod = products.find(p => p.id === cartItem.id);
        if (!prod || prod.status !== 'ACTIVE') throw new Error(`${cartItem.name} artık satılmıyor.`);
        if (prod.stock.length < cartItem.qty) throw new Error(`${prod.name} için yetersiz stok.`);
        const purchasedStock = prod.stock.slice(0, cartItem.qty);
        stockUpdates[prod.id] = purchasedStock;
        orderItems.push({
          ...cartItem,
          deliveryCodes: prod.type === 'code' ? purchasedStock : null,
          deliveryAccount: prod.type === 'account' ? purchasedStock.join(', ') : null,
        });
      }

      setDB(prev => {
        const newPoints = prev.users.find(u => u.id === user.id)!.points - total;
        const tx = { id: crypto.randomUUID(), userId: user.id, amount: total, reason: "Satın Alma", type: 'spend', date: Date.now() };
        const updatedProducts = prev.products.map(p => {
          if (stockUpdates[p.id]) return { ...p, stock: p.stock.filter(s => !stockUpdates[p.id].includes(s)), sales: p.sales + cart.find(c => c.id === p.id)!.qty };
          return p;
        });
        const sellerUpdates: any = {};
        orderItems.forEach(item => {
          const prod = prev.products.find(p => p.id === item.id);
          if (prod) {
            const revenue = item.price * item.qty;
            const commission = Math.floor(revenue * config.commissionRate);
            const payout = revenue - commission;
            if (!sellerUpdates[prod.sellerId]) sellerUpdates[prod.sellerId] = { balance: 0, transactions: [] };
            sellerUpdates[prod.sellerId].balance += payout;
            sellerUpdates[prod.sellerId].transactions.push({ id: crypto.randomUUID(), userId: prod.sellerId, amount: payout, reason: `Satış: ${item.name} (${item.qty}x)`, type: 'earn', date: Date.now() });
          }
        });
        const updatedUsers = prev.users.map(u => {
          if (u.id === user.id) return { ...u, points: newPoints, stats: { ...u.stats, spent: (u.stats.spent || 0) + total, orders: (u.stats.orders || 0) + 1 } };
          if (sellerUpdates[u.id]) return { ...u, sellerBalance: u.sellerBalance + sellerUpdates[u.id].balance, stats: { ...u.stats, itemsSold: (u.stats.itemsSold || 0) + orderItems.filter(i => { const p = prev.products.find(pr => pr.id === i.id); return p && p.sellerId === u.id; }).reduce((sum, i) => sum + i.qty, 0) } };
          return u;
        });
        const newOrder = { id: `ORD-${Date.now().toString().slice(-6)}`, userId: user.id, date: Date.now(), items: orderItems, total, discount: discount + bulkDiscount + flashDiscount, status: 'COMPLETED' };
        const allNewTx = [tx, ...Object.values(sellerUpdates).flatMap((s: any) => s.transactions), ...prev.transactions].slice(0, 1000);
        let updatedCoupons = prev.coupons;        if (usedCoupon) updatedCoupons = prev.coupons.map(c => c.code === usedCoupon.code ? { ...c, usedCount: c.usedCount + 1 } : c);
        return { ...prev, users: updatedUsers, products: updatedProducts, orders: [newOrder, ...prev.orders], transactions: allNewTx, coupons: updatedCoupons };
      });

      useStore.getState().setCart([]);
      setIsCartOpen(false);
      notify("✓ Satın alma başarılı! Ürünler siparişlerimde.", "success");
      triggerConfetti();
    } catch (err: any) {
      notify(err.message || "Ödeme hatası", "error");
      if (err.message === "Yetersiz bakiye!") setShowTopUp(true);
    }
  };

  const completeTask = (task: any) => {
    if (!user) return;
    const now = Date.now();
    const lastCompleted = completedTasks[task.id] || 0;
    if (!task.repeatable && lastCompleted > 0) return notify("Bu görev zaten tamamlandı!", "error");
    if (task.repeatable && task.cooldown && (now - lastCompleted) < task.cooldown) return notify("Bekleme süresinde...", "error");
    setDB(prev => ({ ...prev, completedTasks: { ...prev.completedTasks, [task.id]: now } }));
    updatePoints(user.id, task.reward, `Görev: ${task.title}`, 'earn');
    updateStat(user.id, 'tasksCompleted');
    notify(`+${task.reward} TS Kazandınız!`, "success");
    triggerConfetti();
  };

  const submitReview = (productId: string, rating: number, text: string) => {
    if (!user) return;
    const cleanText = sanitize(text);
    if (!cleanText.trim() || cleanText.length < 5) return notify("Yorum en az 5 karakter", "error");
    if (cleanText.length > config.maxReviewLength) return notify(`Max ${config.maxReviewLength} karakter`, "error");
    const hasBought = orders.some(o => o.userId === user.id && o.items.some(i => i.id === productId));
    if (!hasBought) return notify("Bu ürünü satın almadan yorum yapamazsın", "error");
    const product = products.find(p => p.id === productId);
    if (product && product.sellerId === user.id) return notify("Kendi ürünün için yorum yapamazsın", "error");
    if (reviews.some(r => r.productId === productId && r.userId === user.id)) return notify("Zaten yorum yaptın", "error");
    const newReview = { id: crypto.randomUUID(), productId, userId: user.id, userName: user.username, rating, text: cleanText, date: Date.now() };
    setDB(prev => ({ ...prev, reviews: [newReview, ...prev.reviews] }));
    updateStat(user.id, 'reviewsWritten');
    updatePoints(user.id, 10, "Yorum Ödülü", "earn");
    notify("Yorum yayınlandı! +10 TS", "success");
  };

  const playGame = (type: string, betAmount: number, guess: any) => {
    if (!user) return;
    if (betAmount < 10) return notify("Min bahis 10 TS", "error");
    if (betAmount > config.maxBetLimit) return notify(`Maks bahis ${config.maxBetLimit} TS`, "error");
    if (user.points < betAmount) return notify("Yetersiz bakiye", "error");
    let won = false, payout = 0, result = "", details: any = {};    if (type === 'dice') {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2;
      const isEven = sum % 2 === 0;
      result = `Zarlar: ${d1} + ${d2} = ${sum} (${isEven ? 'Çift' : 'Tek'})`;
      details = { d1, d2, sum, isEven };
      if ((guess === 'even' && isEven) || (guess === 'odd' && !isEven)) { won = true; payout = Math.floor(betAmount * 1.95); }
    } else if (type === 'coin') {
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
    setDB(prev => {
      const newHistory = { id: crypto.randomUUID(), userId: user.id, type, bet: betAmount, won, payout: won ? payout : 0, profit, result, details, date: Date.now() };
      const newStats = { ...prev.users.find(u => u.id === user.id)!.stats, gamesPlayed: (prev.users.find(u => u.id === user.id)!.stats.gamesPlayed || 0) + 1, biggestWin: Math.max(prev.users.find(u => u.id === user.id)!.stats.biggestWin || 0, profit) };
      return { ...prev, users: prev.users.map(u => u.id === user.id ? { ...u, points: u.points + profit, stats: newStats } : u), gameHistory: [newHistory, ...prev.gameHistory].slice(0, 500) };
    });
    notify(won ? `Kazandın! +${formatNumber(payout)} TS` : `Kaybettin. ${result}`, won ? 'success' : 'error');
    if (won && payout >= 500) triggerConfetti();
  };

  const sendTS = (recipientUsername: string, amount: number, message: string) => {
    if (!user) return;
    if (!recipientUsername || recipientUsername.length < 3) return notify("Geçersiz alıcı", "error");
    if (recipientUsername.toLowerCase() === user.username.toLowerCase()) return notify("Kendine TS gönderemezsin", "error");
    if (!amount || amount < config.minTransfer) return notify(`Min: ${config.minTransfer} TS`, "error");
    if (amount > user.points) return notify("Yetersiz bakiye", "error");
    const recipient = users.find(u => u.username.toLowerCase() === recipientUsername.toLowerCase());
    if (!recipient) return notify("Alıcı bulunamadı", "error");
    if (recipient.banned) return notify("Alıcı yasaklanmış", "error");
    const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel as keyof typeof VIP_BENEFITS] : null;
    const taxRate = vipBenefits ? vipBenefits.transferTaxRate : config.transferTax;
    const tax = amount > 1000 ? Math.floor(amount * taxRate) : 0;
    const totalCost = amount + tax;
    if (user.points < totalCost) return notify("Vergi dahil yetersiz bakiye", "error");
    setDB(prev => {
      const senderTx = { id: crypto.randomUUID(), userId: user.id, amount: totalCost, reason: `@${recipient.username} kullanıcısına gönderildi${message ? ': ' + sanitize(message) : ''}${tax > 0 ? ` (Vergi: ${tax} TS)` : ''}`, type: 'spend', date: Date.now() };
      const recipientTx = { id: crypto.randomUUID(), userId: recipient.id, amount: amount, reason: `@${user.username} kullanıcısından alındı${message ? ': ' + sanitize(message) : ''}`, type: 'earn', date: Date.now() };
      return { ...prev, users: prev.users.map(u => { if (u.id === user.id) return { ...u, points: u.points - totalCost }; if (u.id === recipient.id) return { ...u, points: u.points + amount }; return u; }), transactions: [senderTx, recipientTx, ...prev.transactions].slice(0, 1000) };
    });
    notify(`✓ ${formatNumber(amount)} TS gönderildi!${tax > 0 ? ` (${tax} TS vergi)` : ''}`, "success");
    setShowSendTS(false);  };

  const logout = () => {
    setShowConfirm({ title: "Çıkış Yap", message: "Çıkış yapmak istediğinize emin misiniz?", confirmText: "Evet", variant: "danger", onConfirm: () => { setCurrentUser(null); setCart([]); notify("Çıkış yapıldı", "info"); } });
  };

  // Nav Items
  const navItems = useMemo(() => {
    const items = [
      { id: 'dashboard', icon: 'home', label: 'Panel' },
      { id: 'market', icon: 'store', label: 'Market' },
      { id: 'wallet', icon: 'wallet', label: 'Cüzdan' },
      { id: 'tasks', icon: 'tasks', label: 'Görevler' },
      { id: 'games', icon: 'dice', label: 'Oyunlar' },
      { id: 'leaderboard', icon: 'trophy', label: 'Liderlik' },
      { id: 'favorites', icon: 'heart', label: 'Favoriler' },
      { id: 'referral', icon: 'users', label: 'Referans' },
      { id: 'orders', icon: 'box', label: 'Siparişlerim' },
      { id: 'profile', icon: 'user', label: 'Profil' },
      { id: 'help', icon: 'help', label: 'Yardım' },
    ];
    if (user && user.isSeller) items.push({ id: 'seller', icon: 'trending', label: 'Satıcı' });
    if (user && hasPermission(user.role, 3)) items.push({ id: 'admin', icon: 'shield', label: 'Yönetim' });
    return items;
  }, [user]);

  if (!user) return null;

  // =============================================================================
  // SUB-VIEWS
  // =============================================================================

  const DashboardHome = () => {
    const [wheelOpen, setWheelOpen] = useState(false);
    const [spinResult, setSpinResult] = useState<number | null>(null);
    const lastSpin = user.stats?.lastSpin || 0;
    const canSpin = Date.now() - lastSpin > 86400000;
    const topSellers = useMemo(() => [...products].sort((a, b) => b.sales - a.sales).slice(0, 4), [products]);

    const spinWheel = () => {
      if (!canSpin) return notify("Çarkı günde 1 kez çevirebilirsin!", "error");
      const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel as keyof typeof VIP_BENEFITS] : null;
      const rewards = vipBenefits ? vipBenefits.wheelRewards : [5, 10, 15, 20, 25, 30, 50, 100];
      const prize = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinResult(prize);
      updatePoints(user.id, prize, "Günlük Çark", "earn");
      updateUser(user.id, { stats: { ...user.stats, lastSpin: Date.now() } });
      triggerConfetti();
      setTimeout(() => { setWheelOpen(false); setSpinResult(null); }, 3000);
    };
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 border border-blue-500/30 rounded-2xl p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">🎁 Hoş geldin, {user.username}!</h2>
          <p className="text-slate-300 mb-4">Yeni görevler seni bekliyor. Görevleri tamamla, çarkı çevir ve TS kazan!</p>
          <div className="flex gap-3 flex-wrap">
            <RippleButton onClick={() => setView('tasks')}>Görevlere Git →</RippleButton>
            <RippleButton variant="secondary" onClick={() => setView('market')}>Markete Git →</RippleButton>
          </div>
        </div>

        {flashSale.active && Date.now() < flashSale.endsAt && (
          <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2"><Icon name="zap" className="w-5 h-5 text-orange-400" filled /><span className="text-orange-400 font-bold">Flash Satış Aktif!</span></div>
                <h3 className="text-xl font-bold text-white mb-2">{products.find(p => p.id === flashSale.productId)?.name} - %{flashSale.discount} indirim</h3>
                <CountdownTimer targetDate={flashSale.endsAt} compact />
              </div>
              <RippleButton variant="warning" onClick={() => { const p = products.find(p => p.id === flashSale.productId); if (p) setProductDetail(p); }}>Görüntüle</RippleButton>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => setView('market')} className="bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-2xl p-4 text-left hover:scale-105 transition-transform"><div className="text-2xl mb-2">🛒</div><div className="font-bold text-white">Market</div><div className="text-xs text-slate-400">{products.filter(p => p.status === 'ACTIVE').length} ürün</div></button>
          <button onClick={() => setShowTopUp(true)} className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-left hover:scale-105 transition-transform"><div className="text-2xl mb-2">💳</div><div className="font-bold text-white">Bakiye Yükle</div><div className="text-xs text-slate-400">TL ile TS al</div></button>
          <button onClick={() => { if (!canSpin) return notify("Yarın tekrar!", "warning"); spinWheel(); setWheelOpen(true); }} disabled={!canSpin} className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-2xl p-4 text-left hover:scale-105 transition-transform disabled:opacity-50"><div className="text-2xl mb-2">🎰</div><div className="font-bold text-white">Günlük Çark</div><div className="text-xs text-slate-400">{canSpin ? 'Çevir & kazan' : 'Yarın tekrar'}</div></button>
          <button onClick={() => setShowVIP(true)} className="bg-gradient-to-br from-yellow-900/40 to-slate-900 border border-yellow-500/30 rounded-2xl p-4 text-left hover:scale-105 transition-transform"><div className="text-2xl mb-2">👑</div><div className="font-bold text-white">VIP</div><div className="text-xs text-slate-400">{user.vipLevel !== VIP_LEVELS.NONE ? 'Aktif' : 'Avantajlar'}</div></button>
        </div>

        <Modal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} title="🎡 Şans Çarkı" size="sm">
          <div className="text-center">{spinResult ? (<div className="text-6xl font-bold text-emerald-400 mb-4">+{spinResult} TS</div>) : (<div className="text-6xl mb-4">🎯</div>)}<p className="text-slate-300">{spinResult ? '🎉 Tebrikler!' : 'Çevriliyor...'}</p></div>
        </Modal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3"><div><p className="text-sm text-slate-400">Toplam Bakiye</p><p className="text-2xl font-bold text-white">{formatNumber(user.points)} TS</p></div><Icon name="wallet" className="w-8 h-8 text-blue-400" /></div>
            <div className="flex gap-2"><Badge variant="info">Seviye {user.level}</Badge><Badge variant="purple">{formatNumber(user.xp % 1000)}/1000 XP</Badge></div>
            <div className="flex gap-2 mt-3"><RippleButton size="sm" onClick={() => setShowTopUp(true)}>Yükle</RippleButton><RippleButton size="sm" variant="secondary" onClick={() => setShowSendTS(true)}>Gönder</RippleButton></div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3"><div><p className="text-sm text-slate-400">Rozetlerin</p><p className="text-2xl font-bold text-white">{(user.badges || []).length}/{BADGES_DEF.length}</p></div><Icon name="trophy" className="w-8 h-8 text-yellow-400" /></div>
            <div className="flex flex-wrap gap-1 mt-2">{(user.badges || []).slice(0, 8).map(bId => { const b = BADGES_DEF.find(x => x.id === bId); return b ? <span key={bId} className="text-xl" title={b.name}>{b.icon}</span> : null; })}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3"><div><p className="text-sm text-slate-400">İşlem Özeti</p></div><Icon name="activity" className="w-8 h-8 text-emerald-400" /></div>
            <div className="space-y-1 text-sm"><div className="flex justify-between"><span className="text-slate-400">Kazanılan:</span><span className="text-emerald-400">+{formatNumber(user.stats.earned || 0)} TS</span></div><div className="flex justify-between"><span className="text-slate-400">Harcanan:</span><span className="text-red-400">-{formatNumber(user.stats.spent || 0)} TS</span></div></div>
          </div>        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white">🔥 En Çok Satanlar</h3><button onClick={() => setView('market')} className="text-sm text-blue-400 hover:underline">Tümünü Gör →</button></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {topSellers.map(p => { const ratingData = getProductRating(p.id); return (<div key={p.id} onClick={() => setProductDetail(p)} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 cursor-pointer hover:border-blue-500/50 transition-colors"><img src={p.image} alt={p.name} className="w-full h-24 object-cover rounded-lg mb-2" /><h4 className="font-medium text-sm text-white line-clamp-1">{p.name}</h4><div className="flex items-center gap-1 mt-1"><Icon name="star" className="w-3 h-3 text-yellow-400" filled /><span className="text-xs text-slate-400">{ratingData.avg || 'Yeni'}</span></div><p className="text-blue-400 font-bold mt-1">{formatNumber(p.price)} TS</p></div>); })}
          </div>
        </div>
      </div>
    );
  };

  const ProductCard = ({ product }: any) => {
    const ratingData = getProductRating(product.id);
    const stockCount = product.stock ? product.stock.length : 0;
    const isCompared = compareList.includes(product.id);
    const isFav = favorites.includes(product.id);
    const isBoosted = product.boostUntil > Date.now();
    return (
      <div onClick={() => setProductDetail(product)} className={cn("bg-slate-900 border rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all group", isBoosted ? 'border-yellow-500/70 shadow-lg shadow-yellow-500/20' : 'border-slate-800 hover:border-blue-500/50')}>
        <div className="relative">
          <img src={product.image} alt={product.name} className="w-full h-48 object-cover" onError={(e: any) => { e.target.src = 'https://placehold.co/400x300/333/FFF?text=No+Image'; }} />
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} className="absolute top-3 right-3 z-10 p-2 bg-slate-900/80 backdrop-blur rounded-full text-white hover:bg-slate-800"><Icon name="heart" className={cn("w-4 h-4", isFav ? 'text-red-500' : '')} filled={isFav} /></button>
          {isBoosted && (<div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-amber-500 px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1"><Icon name="boost" className="w-3 h-3" filled /> ÖNE ÇIKAN</div>)}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2"><Badge>{categories.find(c => c.id === product.category)?.name || product.category}</Badge>{product.verified && <Badge variant="success">✓</Badge>}<span className="text-xs text-slate-500">{product.sales} Satış</span></div>
          <h3 className="font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xl font-bold text-blue-400">{formatNumber(product.price)} TS</p>
            <div className="text-right text-xs text-slate-500">{stockCount === 0 && <span className="text-red-400">Tükendi</span>}{stockCount > 0 && stockCount <= 5 && <span className="text-orange-400">Son {stockCount}!</span>}</div>
          </div>
          <RippleButton onClick={(e) => { e.stopPropagation(); addToCart(product); }} disabled={stockCount === 0} className="w-full mt-3" size="sm">{stockCount === 0 ? 'Tükendi' : '+ Sepet'}</RippleButton>
        </div>
      </div>
    );
  };

  const MarketView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-3xl font-bold text-white">Market</h2><span className="text-sm text-slate-400">{filteredProducts.length} ürün</span></div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="relative"><Icon name="search" className="w-5 h-5 absolute left-3 top-3 text-slate-500" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Ürün, satıcı ara..." className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none" /></div>
        <div className="space-y-1"><p className="text-xs text-slate-500 font-bold mb-2">KATEGORİLER</p><button onClick={() => { setSelectedCategory("all"); setSelectedSubcat("all"); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left", selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}><span className="text-lg">🏪</span><span>Tüm Ürünler</span></button>{categories.map(cat => (<button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedSubcat("all"); }} className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left", selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}><span className="text-lg">{cat.icon}</span><span>{cat.name}</span></button>))}</div>
        {currentCategory && currentCategory.subcats && currentCategory.subcats.length > 0 && (<div><p className="text-xs text-slate-500 font-bold mb-2">ALT KATEGORİLER</p><div className="flex gap-2 overflow-x-auto no-scrollbar flex-wrap"><button onClick={() => setSelectedSubcat("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium", selectedSubcat === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600')}>Tümü</button>{currentCategory.subcats.map(subcat => (<button key={subcat} onClick={() => setSelectedSubcat(subcat)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium", selectedSubcat === subcat ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600')}>{subcat}</button>))}</div></div>)}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"><option value="popular">Çok Satanlar</option><option value="rating">En Yüksek Puan</option><option value="price_asc">Fiyat: Artan</option><option value="price_desc">Fiyat: Azalan</option><option value="newest">En Yeniler</option></select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      {filteredProducts.length === 0 && (<div className="text-center py-16 text-slate-500"><Icon name="search" className="w-16 h-16 mx-auto mb-4 opacity-50" /><h3 className="text-xl font-bold text-white mb-2">Ürün bulunamadı</h3></div>)}
    </div>  );

  const WalletView = () => {
    const myTx = transactions.filter(t => t.userId === user.id);
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">💳 Cüzdanım</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-5"><p className="text-sm text-slate-300">Mevcut Bakiye</p><p className="text-3xl font-bold text-white mt-2">{formatNumber(user.points)} TS</p></div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><p className="text-sm text-slate-400">Toplam Kazanılan</p><p className="text-2xl font-bold text-emerald-400 mt-2">{formatNumber(user.stats.earned || 0)} TS</p></div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><p className="text-sm text-slate-400">Toplam Harcanan</p><p className="text-2xl font-bold text-red-400 mt-2">{formatNumber(user.stats.spent || 0)} TS</p></div>
        </div>
        <div className="flex gap-3"><RippleButton onClick={() => setShowTopUp(true)} size="lg" className="flex-1">💰 Bakiye Yükle</RippleButton><RippleButton variant="secondary" onClick={() => setShowSendTS(true)} size="lg" className="flex-1">💸 TS Gönder</RippleButton></div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><h3 className="text-lg font-bold text-white mb-4">📜 İşlem Geçmişi</h3><div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">{myTx.length === 0 ? (<p className="text-center text-slate-500 py-8">İşlem geçmişi boş</p>) : myTx.slice(0, 30).map(tx => (<div key={tx.id} className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg"><div className={cn("w-8 h-8 rounded-full flex items-center justify-center", tx.type === 'earn' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}><Icon name={tx.type === 'earn' ? 'trending' : 'minus'} className="w-4 h-4" /></div><div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{tx.reason}</p><p className="text-xs text-slate-500">{formatDate(tx.date)} {formatTime(tx.date)}</p></div><span className={cn("font-bold", tx.type === 'earn' ? 'text-emerald-400' : 'text-red-400')}>{tx.type === 'earn' ? '+' : '-'}{formatNumber(tx.amount)} TS</span></div>))}</div></div>
      </div>
    );
  };

  const TasksView = () => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><h2 className="text-3xl font-bold text-white">Görev Merkezi</h2><Badge variant="info">Toplam: {user.stats.tasksCompleted || 0}</Badge></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{tasks.map((t) => { const isCompleted = !t.repeatable && completedTasks[t.id]; const lastDone = completedTasks[t.id] || 0; const cooldownRemaining = Math.max(0, (t.cooldown || 0) - (now - lastDone)); const isCooldown = t.repeatable && cooldownRemaining > 0; return (<div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="flex items-start gap-4"><div className="text-3xl">{t.icon}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><Badge variant="info">{t.category}</Badge></div><h3 className="font-bold text-white mb-1">{t.title}</h3><p className="text-sm text-slate-400">{t.description}</p>{isCooldown && (<div className="mt-2 inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded"><Icon name="clock" className="w-3 h-3" />{cooldownRemaining > 3600000 ? `${Math.floor(cooldownRemaining/3600000)}sa` : `${Math.floor(cooldownRemaining/60000)}dk`}</div>)}</div><div className="text-right"><p className="text-emerald-400 font-bold mb-2">+{t.reward} TS</p><RippleButton onClick={() => completeTask(t)} disabled={isCompleted || isCooldown} size="sm">{isCompleted ? '✓' : isCooldown ? 'Bekle' : 'Tamamla'}</RippleButton></div></div></div>); })}</div>
      </div>
    );
  };

  const GamesView = () => {
    const [bet, setBet] = useState(50);
    const [crashTarget, setCrashTarget] = useState(2.0);
    const myHistory = gameHistory.filter(g => g.userId === user.id).slice(0, 20);
    const stats = { totalGames: myHistory.length, won: myHistory.filter(g => g.won).length, lost: myHistory.filter(g => !g.won).length, profit: myHistory.reduce((sum, g) => sum + (g.profit || 0), 0) };
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">🎰 Oyun Salonu</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400">Toplam</p><p className="text-2xl font-bold text-white">{stats.totalGames}</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400">Kazanılan</p><p className="text-2xl font-bold text-emerald-400">{stats.won}</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400">Kaybedilen</p><p className="text-2xl font-bold text-red-400">{stats.lost}</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400">Net</p><p className={cn("text-2xl font-bold", stats.profit >= 0 ? 'text-emerald-400' : 'text-red-400')}>{stats.profit >= 0 ? '+' : ''}{formatNumber(stats.profit)}</p></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h3 className="text-xl font-bold text-white mb-2">🎲 Zar Oyunu</h3><p className="text-sm text-slate-400 mb-4">İki zar toplamı Tek/Çift? (1.95x)</p><div className="space-y-4"><div><label className="text-xs text-slate-400">Bahis</label><input type="number" value={bet} onChange={e => setBet(Math.max(10, Math.min(config.maxBetLimit, Number(e.target.value))))} className="w-full mt-1 p-3 bg-slate-800 rounded-lg text-white outline-none" /></div><div className="grid grid-cols-2 gap-3"><button onClick={() => playGame('dice', bet, 'odd')} className="bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white">TEK</button><button onClick={() => playGame('dice', bet, 'even')} className="bg-purple-600 hover:bg-purple-700 py-4 rounded-xl font-bold text-white">ÇİFT</button></div></div></div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h3 className="text-xl font-bold text-white mb-2">🪙 Madeni Para</h3><p className="text-sm text-slate-400 mb-4">Tura/Yazı? (1.95x)</p><div className="space-y-4"><div><label className="text-xs text-slate-400">Bahis</label><input type="number" value={bet} onChange={e => setBet(Math.max(10, Math.min(config.maxBetLimit, Number(e.target.value))))} className="w-full mt-1 p-3 bg-slate-800 rounded-lg text-white outline-none" /></div><div className="grid grid-cols-2 gap-3"><button onClick={() => playGame('coin', bet, 'heads')} className="bg-yellow-600 hover:bg-yellow-700 py-4 rounded-xl font-bold text-white">TURA</button><button onClick={() => playGame('coin', bet, 'tails')} className="bg-slate-600 hover:bg-slate-700 py-4 rounded-xl font-bold text-white">YAZI</button></div></div></div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2"><h3 className="text-xl font-bold text-white mb-2">📉 Crash Oyunu</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs text-slate-400">Bahis</label><input type="number" value={bet} onChange={e => setBet(Math.max(10, Math.min(config.maxBetLimit, Number(e.target.value))))} className="w-full mt-1 p-3 bg-slate-800 rounded-lg text-white outline-none" /></div><div><label className="text-xs text-slate-400">Hedef Çarpan (x)</label><input type="number" step="0.1" value={crashTarget} onChange={e => setCrashTarget(Math.max(1.1, Number(e.target.value)))} className="w-full mt-1 p-3 bg-slate-800 rounded-lg text-white outline-none" /></div></div><button onClick={() => playGame('crash', bet, crashTarget)} className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 py-4 rounded-xl font-bold text-xl text-white">OYNA 🚀</button></div>
        </div>
      </div>
    );
  };

  const LeaderboardView = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">🏆 Liderlik Tablosu</h2>      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"><div className="divide-y divide-slate-800">{leaderboardData.map((u, i) => (<div key={u.id} className={cn("flex items-center gap-4 p-4", u.isMe ? 'bg-blue-500/10' : 'hover:bg-slate-800/50')}><div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg", u.rank === 1 ? 'bg-yellow-500 text-white' : u.rank === 2 ? 'bg-slate-400 text-white' : u.rank === 3 ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300')}>{u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : `#${u.rank}`}</div><div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">{u.name[0]}</div><div className="flex-1 min-w-0"><p className="font-bold text-white">{u.name} {u.isMe && <Badge variant="info" className="ml-2">(Sen)</Badge>}</p><p className="text-xs text-slate-400">Seviye {u.lvl} • {u.badges} rozet</p></div><div className="text-right"><p className="font-bold text-blue-400">{formatNumber(u.pts)} TS</p></div></div>))}</div></div>
    </div>
  );

  const FavoritesView = () => {
    const favProducts = products.filter(p => favorites.includes(p.id));
    return (<div className="space-y-6"><h2 className="text-3xl font-bold text-white">💖 Favorilerim</h2>{favProducts.length === 0 ? (<div className="text-center py-16 text-slate-500"><Icon name="heart" className="w-16 h-16 mx-auto mb-4 opacity-50" /><h3 className="text-xl font-bold text-white mb-2">Listen Boş</h3><RippleButton onClick={() => setView('market')}>Alışverişe Başla</RippleButton></div>) : (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{favProducts.map(p => (<ProductCard key={p.id} product={p} />))}</div>)}</div>);
  };

  const ReferralView = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-8 text-center"><div className="text-6xl mb-4">🎁</div><h2 className="text-3xl font-bold text-white mb-2">Arkadaşlarını Davet Et</h2><p className="text-slate-300">Her kayıt için 50 TS kazan!</p></div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><p className="text-sm text-slate-400 mb-2">Davet Kodun</p><div className="flex gap-2"><code className="flex-1 bg-slate-950 px-4 py-3 rounded-lg text-blue-400 font-mono text-lg text-center">{user.referralCode}</code><RippleButton onClick={() => { navigator.clipboard.writeText(user.referralCode); notify("Kod kopyalandı!"); }} variant="outline"><Icon name="copy" className="w-4 h-4" /></RippleButton></div></div>
      <div className="grid grid-cols-3 gap-3"><div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center"><p className="text-3xl font-bold text-white">{user.referrals.l1 || 0}</p><p className="text-xs text-slate-400">Seviye 1</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center"><p className="text-3xl font-bold text-white">{user.referrals.l2 || 0}</p><p className="text-xs text-slate-400">Seviye 2</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center"><p className="text-3xl font-bold text-white">{user.referrals.count || 0}</p><p className="text-xs text-slate-400">Toplam</p></div></div>
    </div>
  );

  const OrdersView = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">📦 Siparişlerim</h2>
      {orders.filter(o => o.userId === user.id).length === 0 ? (<div className="text-center py-16 text-slate-500"><Icon name="box" className="w-16 h-16 mx-auto mb-4 opacity-50" /><h3 className="text-xl font-bold text-white mb-2">Henüz sipariş yok</h3><RippleButton onClick={() => setView('market')}>Markete Git</RippleButton></div>) : orders.filter(o => o.userId === user.id).map(order => (<div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="flex justify-between items-center mb-4"><div><p className="font-mono text-sm text-slate-400">{order.id}</p><p className="text-xs text-slate-500">{new Date(order.date).toLocaleString('tr-TR')}</p></div><div className="text-right"><Badge variant="success">✓ Tamamlandı</Badge><p className="text-xl font-bold text-white mt-1">{formatNumber(order.total)} TS</p></div></div><div className="space-y-3">{order.items.map((item: any, idx: number) => (<div key={idx} className="bg-slate-800/50 rounded-xl p-4"><p className="font-bold text-white mb-2">{item.qty}x {item.name}</p>{(item.deliveryCodes || item.deliveryAccount) && (<div><p className="text-xs text-slate-400 mb-2 font-bold">Teslimat Bilgisi:</p>{item.deliveryCodes && item.deliveryCodes.map((code: string, i: number) => (<div key={i} className="flex items-center gap-2 mb-1 bg-slate-950 px-3 py-2 rounded"><code className="text-emerald-400 font-mono text-sm flex-1">{code}</code><button onClick={() => { navigator.clipboard.writeText(code); notify("Kod kopyalandı!"); }} className="text-slate-400 hover:text-white"><Icon name="copy" className="w-4 h-4" /></button></div>))}{item.deliveryAccount && (<div className="bg-slate-950 px-3 py-2 rounded"><code className="text-emerald-400 font-mono text-sm">{item.deliveryAccount}</code></div>)}</div>)}</div>))}</div></div>))}
    </div>
  );

  const ProfileView = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [editUsername, setEditUsername] = useState(user.username);
    return (
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">{['profile', 'stats', 'badges', 'security'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2 rounded-lg font-medium whitespace-nowrap", activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400')}>{tab === 'profile' ? '👤 Profil' : tab === 'stats' ? '📊 İstatistik' : tab === 'badges' ? '🏆 Rozetler' : '🔐 Güvenlik'}</button>))}</div>
        {activeTab === 'profile' && (<div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"><div className="flex items-center gap-4 mb-6"><div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">{user.username[0].toUpperCase()}</div><div><h3 className="text-2xl font-bold text-white">{user.username}</h3><p className="text-slate-400 capitalize">{user.role} • Seviye {user.level}</p></div></div><div className="space-y-3"><div><label className="text-sm text-slate-400">Kullanıcı Adı</label><input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" /></div><RippleButton onClick={() => { if (editUsername.length < 3) return notify("Min 3 karakter", "error"); updateUser(user.id, { username: sanitize(editUsername) }); notify("Kaydedildi", "success"); }} className="w-full">Kaydet</RippleButton><RippleButton variant="danger" onClick={logout} className="w-full"><Icon name="logout" className="w-4 h-4" /> Çıkış Yap</RippleButton></div></div>)}
        {activeTab === 'badges' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-3">{BADGES_DEF.map(badge => { const unlocked = (user.badges || []).includes(badge.id); return (<div key={badge.id} className={cn("p-4 rounded-xl border", unlocked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/30 border-slate-700')}><div className="flex items-start gap-3"><div className="text-3xl">{badge.icon}</div><div className="flex-1"><h4 className="font-bold text-white">{badge.name}</h4><p className="text-sm text-slate-400 mb-2">{badge.desc}</p>{unlocked ? <Badge variant="success">✓ Açıldı</Badge> : <Badge>🔒 Kilitli</Badge>}</div></div></div>); })}</div>)}
        {activeTab === 'security' && (<div className="space-y-4"><div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="flex justify-between items-center mb-3"><div><h3 className="text-lg font-bold text-white">2FA (İki Faktörlü)</h3><p className="text-sm text-slate-400">Telegram üzerinden kod</p></div><RippleButton onClick={() => { updateUser(user.id, { twoFA: !user.twoFA }); notify(user.twoFA ? "2FA devre dışı" : "2FA aktif", "info"); }} variant={user.twoFA ? 'danger' : 'success'}>{user.twoFA ? 'Kapat' : 'Aç'}</RippleButton></div></div></div>)}
      </div>
    );
  };

  const SellerDashboard = () => {
    if (!user.isSeller) return (<div className="text-center py-16 text-slate-500"><Icon name="lock" className="w-16 h-16 mx-auto mb-4 opacity-50" /><h3 className="text-xl font-bold text-white mb-2">Satıcı Değilsiniz</h3></div>);
    const myProducts = products.filter(p => p.sellerId === user.id);
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">🏪 Satıcı Paneli</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-slate-900 border border-slate-800 rounded-xl p-5"><p className="text-sm text-slate-400">Çekilebilir Bakiye</p><p className="text-2xl font-bold text-emerald-400 mt-1">{formatNumber(user.sellerBalance)} TS</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-5"><p className="text-sm text-slate-400">Toplam Satış</p><p className="text-2xl font-bold text-blue-400 mt-1">{myProducts.reduce((a, p) => a + p.sales, 0)}</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-5"><p className="text-sm text-slate-400">Aktif Ürün</p><p className="text-2xl font-bold text-white mt-1">{myProducts.length}</p></div></div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><h3 className="text-lg font-bold text-white mb-4">Ürünlerim</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-800/50"><tr><th className="p-3 text-left text-slate-400">Ürün</th><th className="p-3 text-left text-slate-400">Fiyat</th><th className="p-3 text-left text-slate-400">Stok</th><th className="p-3 text-left text-slate-400">Satış</th></tr></thead><tbody className="divide-y divide-slate-800">{myProducts.map(p => (<tr key={p.id} className="hover:bg-slate-800/30"><td className="p-3 text-white">{p.name}</td><td className="p-3 text-blue-400">{formatNumber(p.price)} TS</td><td className="p-3"><Badge variant={p.stock.length === 0 ? 'danger' : p.stock.length < 5 ? 'warning' : 'success'}>{p.stock.length}</Badge></td><td className="p-3 text-white">{p.sales}</td></tr>))}</tbody></table></div></div>
      </div>
    );
  };

  const AdminPanel = () => {    if (!hasPermission(user.role, 3)) return (<div className="text-center py-16 text-slate-500"><Icon name="lock" className="w-16 h-16 mx-auto mb-4 opacity-50" /><h3 className="text-xl font-bold text-white mb-2">Erişim Yok</h3></div>);
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">⚙️ Yönetim Paneli</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400">Toplam Ürün</p><p className="text-2xl font-bold text-white">{products.length}</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400">Toplam Sipariş</p><p className="text-2xl font-bold text-white">{orders.length}</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400">Toplam Satış</p><p className="text-2xl font-bold text-emerald-400">{formatNumber(orders.reduce((sum, o) => sum + o.total, 0))} TS</p></div><div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400">Kullanıcı</p><p className="text-2xl font-bold text-white">{users.length}</p></div></div>
      </div>
    );
  };

  const HelpView = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Yardım & Destek</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><h3 className="text-xl font-bold text-white mb-4">İletişim</h3><div className="space-y-3"><a href={`mailto:${config.supportEmail}`} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg hover:bg-slate-800 transition-colors"><div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-xl">📧</div><div><p className="text-white font-medium">E-posta</p><p className="text-xs text-slate-400">{config.supportEmail}</p></div></a></div></div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><h3 className="text-xl font-bold text-white mb-4">SSS</h3><div className="space-y-4"><div><p className="font-bold text-white">TS nasıl alabilirim?</p><p className="text-sm text-slate-400">Cüzdan > Bakiye Yükle kısmından banka/Papara/USDT ile alabilirsiniz.</p></div><div><p className="font-bold text-white">VIP üyelik avantajları neler?</p><p className="text-sm text-slate-400">Daha düşük transfer vergisi, özel çark ödülleri, ürün öne çıkarma hakkı ve daha fazlası.</p></div></div></div>
      </div>
    </div>
  );

  // =============================================================================
  // MAIN LAYOUT RENDER
  // =============================================================================
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 hidden lg:flex flex-col gap-2 fixed h-screen overflow-y-auto scrollbar-thin">
        <div className="flex items-center gap-2 mb-6 px-2"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center"><Icon name="logo" className="w-5 h-5 text-white" filled /></div><h1 className="text-xl font-bold text-white">{config.siteName}</h1></div>
        <nav className="flex-1 space-y-1">{navItems.map((item) => (<button key={item.id} onClick={() => setView(item.id)} className={cn("relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full", view === item.id ? 'bg-blue-600/20 text-white font-bold border-l-4 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50')}><Icon name={item.icon} className="w-5 h-5" /><span className="flex-1 text-left">{item.label}</span></button>))}</nav>
        <div className="mt-auto p-4 bg-slate-800/50 rounded-xl"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">{user.username[0].toUpperCase()}</div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{user.username}</p><p className="text-xs text-slate-400">Lv.{user.level} • {user.role}</p></div></div><div className="flex justify-between text-sm"><span className="text-slate-400">Bakiye</span><span className="text-blue-400 font-bold">{formatNumber(user.points)} TS</span></div></div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 overflow-y-auto scrollbar-thin pb-20 lg:pb-4">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4">
          <div className="flex justify-between items-center"><div className="flex items-center gap-2"><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2"><Icon name={isMobileMenuOpen ? "x" : "menu"} className="w-6 h-6" /></button><h1 className="text-lg font-bold text-white">{config.siteName}</h1></div><div className="flex gap-2"><button onClick={() => setIsCartOpen(true)} className="relative p-2 text-white"><Icon name="bag" className="w-5 h-5" />{cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.reduce((a,c)=>a+c.qty,0)}</span>}</button></div></div>
          {isMobileMenuOpen && (<nav className="mt-4 bg-slate-800 rounded-xl p-2 space-y-1 max-h-96 overflow-y-auto scrollbar-thin">{navItems.map((item) => (<button key={item.id} onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full", view === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700')}><Icon name={item.icon} className="w-5 h-5" /><span>{item.label}</span></button>))}</nav>)}
        </header>

        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {view === 'dashboard' && <DashboardHome />}
          {view === 'market' && <MarketView />}
          {view === 'wallet' && <WalletView />}
          {view === 'tasks' && <TasksView />}
          {view === 'games' && <GamesView />}
          {view === 'leaderboard' && <LeaderboardView />}
          {view === 'favorites' && <FavoritesView />}
          {view === 'referral' && <ReferralView />}
          {view === 'orders' && <OrdersView />}
          {view === 'profile' && <ProfileView />}          {view === 'help' && <HelpView />}
          {view === 'seller' && <SellerDashboard />}
          {view === 'admin' && <AdminPanel />}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-20"><div className="flex justify-around items-center py-2">{[{ id: 'dashboard', icon: 'home', label: 'Panel' }, { id: 'market', icon: 'store', label: 'Market' }, { id: 'wallet', icon: 'wallet', label: 'Cüzdan' }, { id: 'tasks', icon: 'tasks', label: 'Görev' }, { id: 'profile', icon: 'user', label: 'Profil' }].map(item => (<button key={item.id} onClick={() => setView(item.id)} className={cn("flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg transition-colors", view === item.id ? 'text-blue-400' : 'text-slate-400')}><Icon name={item.icon} className="w-5 h-5" /><span className="text-xs">{item.label}</span></button>))}</div></nav>

      {/* Cart Drawer */}
      {isCartOpen && (<>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsCartOpen(false)} />
        <div className="fixed top-0 right-0 bottom-0 w-full md:w-96 bg-slate-900 border-l border-slate-800 z-50 overflow-y-auto scrollbar-thin flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900"><h3 className="text-xl font-bold text-white">Sepetim</h3><button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white p-1"><Icon name="x" className="w-6 h-6" /></button></div>
          <div className="flex-1 p-4 space-y-3">{cart.length === 0 ? (<div className="text-center py-12 text-slate-500"><Icon name="bag" className="w-16 h-16 mx-auto mb-4 opacity-50" /><p>Sepetiniz boş</p></div>) : cart.map(item => (<div key={item.id} className="bg-slate-800/50 rounded-xl p-3"><div className="flex gap-3"><img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" /><div className="flex-1 min-w-0"><h4 className="font-medium text-white text-sm line-clamp-1">{item.name}</h4><p className="text-blue-400 font-bold text-sm mt-1">{formatNumber(item.price)} TS</p></div><div className="flex flex-col items-end gap-1"><button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 p-1"><Icon name="trash" className="w-4 h-4" /></button><div className="flex items-center gap-1 bg-slate-900 rounded-lg"><button onClick={() => updateCartQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-white hover:bg-slate-700 rounded-l-lg"><Icon name="minus" className="w-3 h-3" /></button><span className="text-white text-sm font-bold w-6 text-center">{item.qty}</span><button onClick={() => updateCartQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-white hover:bg-slate-700 rounded-r-lg"><Icon name="plus" className="w-3 h-3" /></button></div></div></div></div>))}</div>
          {cart.length > 0 && (<div className="p-4 border-t border-slate-800"><div className="flex justify-between text-lg font-bold mb-4"><span>Toplam</span><span className="text-blue-400">{formatNumber(cart.reduce((s,i)=>s+i.price*i.qty,0))} TS</span></div><RippleButton onClick={() => handleCheckout(null)} className="w-full" size="lg">✓ Ödemeye Geç</RippleButton></div>)}
        </div>
      </>)}

      {/* Product Detail Modal */}
      <Modal isOpen={!!productDetail} onClose={() => setProductDetail(null)} title={productDetail?.name || "Ürün Detayı"} size="lg">
        {productDetail && (<div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><img src={productDetail.image} alt={productDetail.name} className="w-full rounded-xl object-cover" /></div><div><div className="flex items-center gap-2 mb-2"><Badge>{productDetail.category}</Badge>{productDetail.verified && <Badge variant="success">✓ Doğrulanmış</Badge>}</div><h2 className="text-2xl font-bold text-white mb-2">{productDetail.name}</h2><p className="text-slate-300 mb-4">{productDetail.desc}</p><div className="bg-slate-800/50 p-4 rounded-xl mb-4"><p className="text-3xl font-bold text-blue-400">{formatNumber(productDetail.price)} TS</p></div><div className="flex gap-2"><RippleButton onClick={(e) => { addToCart(productDetail); setProductDetail(null); }} disabled={productDetail.stock.length === 0} className="flex-1" size="lg">{productDetail.stock.length === 0 ? 'Stokta Yok' : '🛒 Sepete Ekle'}</RippleButton><RippleButton onClick={() => toggleFavorite(productDetail.id)} variant={favorites.includes(productDetail.id) ? 'danger' : 'secondary'} size="lg"><Icon name="heart" className="w-5 h-5" filled={favorites.includes(productDetail.id)} /></RippleButton></div></div></div><div className="border-t border-slate-800 pt-4"><h3 className="text-lg font-bold text-white mb-4">Yorumlar</h3><div className="space-y-3">{reviews.filter(r => r.productId === productDetail.id).length === 0 ? <p className="text-center text-slate-500 py-6">Henüz yorum yok.</p> : reviews.filter(r => r.productId === productDetail.id).map(r => (<div key={r.id} className="bg-slate-800/50 p-4 rounded-xl"><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{r.userName[0]}</div><div><p className="font-bold text-white text-sm">{r.userName}</p><p className="text-xs text-slate-500">{timeAgo(r.date)}</p></div></div><div className="flex items-center gap-1">{[...Array(5)].map((_, i) => (<Icon key={i} name="star" className={cn("w-3 h-3", i < r.rating ? 'text-yellow-400' : 'text-slate-700')} filled={i < r.rating} />))}</div></div><p className="text-sm text-slate-300">{r.text}</p></div>))}</div></div></div>)}
      </Modal>

      {/* Top Up Modal */}
      <Modal isOpen={showTopUp} onClose={() => setShowTopUp(false)} title="💰 Bakiye Yükle" size="md">
        <div className="space-y-4"><p className="text-sm text-slate-400">Paket seçin ve anında TS yükleyin</p><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{topUpPackages.map(pkg => (<button key={pkg.id} onClick={() => { updatePoints(user.id, pkg.amount + pkg.bonus, `Bakiye Yükleme (${pkg.price}₺)`, 'earn'); notify(`+${formatNumber(pkg.amount + pkg.bonus)} TS yüklendi!`, "success"); triggerConfetti(); setShowTopUp(false); }} className="relative p-4 rounded-xl border-2 border-slate-700 bg-slate-800/40 hover:border-blue-500 transition-colors text-left">{pkg.popular && <Badge variant="warning" className="absolute -top-2 right-2">POPÜLER</Badge>}<p className="text-2xl font-bold text-white">{formatNumber(pkg.amount)}</p><p className="text-xs text-slate-400">TS</p>{pkg.bonus > 0 && <p className="text-xs text-emerald-400 font-bold mt-1">+{pkg.bonus} BONUS</p>}<p className="text-blue-400 font-bold mt-2">₺{pkg.price}</p></button>))}</div></div>
      </Modal>

      {/* Send TS Modal */}
      <Modal isOpen={showSendTS} onClose={() => setShowSendTS(false)} title="💸 TS Gönder" size="sm">
        <SendTSForm onSend={sendTS} user={user} config={config} />
      </Modal>

      {/* VIP Modal */}
      <Modal isOpen={showVIP} onClose={() => setShowVIP(false)} title="👑 VIP Üyelik" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Object.values(VIP_LEVELS).filter(l => l !== VIP_LEVELS.NONE).map(level => { const benefits = VIP_BENEFITS[level as keyof typeof VIP_BENEFITS]; const prices = vipPrices[level as keyof typeof vipPrices]; return (<div key={level} className="bg-slate-800/50 rounded-2xl p-5 text-center"><div className="text-5xl mb-3">{benefits.icon}</div><h3 className="text-xl font-bold text-white mb-2">{benefits.name}</h3><div className="space-y-2 text-sm text-slate-300 mb-4"><p>🎁 Aylık Hediye: {benefits.monthlyGift} TS</p><p>💸 Transfer Vergisi: %{(benefits.transferTaxRate * 100).toFixed(1)}</p></div><div className="space-y-2"><RippleButton variant="gold" size="sm" className="w-full" onClick={() => { /* VIP purchase logic */ }}>Haftalık: {formatNumber(prices.weekly)} TS</RippleButton><RippleButton variant="gold" size="sm" className="w-full" onClick={() => { /* VIP purchase logic */ }}>Aylık: {formatNumber(prices.monthly)} TS</RippleButton></div></div>); })}</div>
      </Modal>

      {/* Announcements Modal */}
      <Modal isOpen={showAnnouncements} onClose={() => setShowAnnouncements(false)} title="📢 Duyurular" size="md">
        <div className="space-y-3">{announcements.length === 0 && <p className="text-center text-slate-500 py-8">Duyuru yok</p>}{announcements.map(ann => (<div key={ann.id} className="p-4 bg-slate-800/50 rounded-xl"><h4 className="font-bold text-white mb-1">{ann.title}</h4><p className="text-sm text-slate-300">{ann.content}</p><p className="text-xs text-slate-500 mt-2">{timeAgo(ann.date)}</p></div>))}</div>
      </Modal>

      {/* Overlays */}
      {notification && <Toast message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
      {confetti && <Confetti active={confetti} />}
      {showConfirm && <ConfirmDialog isOpen={true} onClose={() => setShowConfirm(null)} onConfirm={showConfirm.onConfirm} title={showConfirm.title} message={showConfirm.message} confirmText={showConfirm.confirmText} variant={showConfirm.variant} />}
      {showBadgeUnlock && (<div className="fixed top-4 right-4 z-[120] bg-slate-900 border border-yellow-500/50 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-right fade-in duration-300 flex items-center gap-3"><div className="text-4xl">{showBadgeUnlock.icon}</div><div><p className="text-xs text-yellow-400 font-bold">Yeni Rozet!</p><p className="text-white font-bold">{showBadgeUnlock.name}</p><p className="text-xs text-slate-400">+{showBadgeUnlock.xp} XP</p></div></div>)}
    </div>  );
}

// Helper component for Send TS form to avoid state issues in modal
function SendTSForm({ onSend, user, config }: any) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const tax = Number(amount) > 1000 ? Math.floor(Number(amount) * config.transferTax) : 0;
  const totalCost = Number(amount) + tax;
  return (
    <div className="space-y-4">
      <div><label className="text-sm text-slate-400">Alıcı Kullanıcı Adı</label><input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="username" maxLength={30} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" /></div>
      <div><label className="text-sm text-slate-400">Miktar (TS)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" min={config.minTransfer} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" /><p className="text-xs text-slate-500 mt-1">Mevcut: {formatNumber(user.points)} TS • Min: {config.minTransfer} TS</p></div>
      <div><label className="text-sm text-slate-400">Mesaj (Opsiyonel)</label><input type="text" value={message} onChange={e => setMessage(e.target.value)} maxLength={100} placeholder="İyi günlerde kullan!" className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" /></div>
      <RippleButton onClick={() => onSend(recipient, Number(amount), message)} variant="success" className="w-full" disabled={!recipient || !amount || Number(amount) < config.minTransfer || totalCost > user.points}>Gönder {amount && `(${formatNumber(totalCost)} TS)`}</RippleButton>
    </div>
  );
}
