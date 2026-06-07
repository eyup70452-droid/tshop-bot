import { VIP_LEVELS, VIP_BENEFITS, hasPermission, ROLES, generateId } from './store';

export const createActions = (set: any, get: any) => ({

  purchaseVIP: (level: string, duration: 'weekly' | 'monthly') => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    const prices = state.vipPrices[level as keyof typeof state.vipPrices];
    if (!prices) return;
    const price = duration === 'weekly' ? prices.weekly : prices.monthly;
    const days = duration === 'weekly' ? 7 : 30;
    if (user.points < price) { state.addNotification("Yetersiz bakiye!", "error"); return; }
    state.updatePoints(user.id, price, VIP_BENEFITS[level]?.name + ' - ' + (duration === 'weekly' ? 'Haftalik' : 'Aylik'), 'spend');
    const currentExpiry = user.vipExpiresAt && user.vipExpiresAt > Date.now() ? user.vipExpiresAt : Date.now();
    state.updateUser(user.id, { vipLevel: level, vipExpiresAt: currentExpiry + (days * 86400000) });
    state.addAuditLog('VIP_PURCHASE', user.username + ' ' + VIP_BENEFITS[level]?.name + ' satin aldi');
    state.addNotification(VIP_BENEFITS[level]?.name + ' aktif edildi!', "success");
  },

  requestTopUp: (pkg: any, receiptData: string | null, paymentMethod: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    const topUpRequest = { id: 'tu_' + generateId(), userId: user.id, username: user.username, packageId: pkg.id, amount: pkg.amount + pkg.bonus, price: pkg.price, paymentMethod, receiptData, status: 'PENDING', date: Date.now(), reviewedBy: null, reviewedAt: null };
    set((s: any) => ({ ...s, pendingTopUps: [topUpRequest, ...s.pendingTopUps] }));
    state.addAuditLog('TOP_UP_REQUEST', user.username + ' ' + (pkg.amount + pkg.bonus) + ' TS yukleme talebi');
    state.addNotification("Yukleme talebi olusturuldu. Admin onayi bekleniyor.", "info");
  },

  approveTopUp: (topUpId: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 4)) return;
    const topUp = state.pendingTopUps.find((t: any) => t.id === topUpId);
    if (!topUp) return;
    state.updatePoints(topUp.userId, topUp.amount, 'Bakiye Yukleme (' + topUp.price + ')', 'earn');
    set((s: any) => ({ ...s, pendingTopUps: s.pendingTopUps.filter((t: any) => t.id !== topUpId) }));
    state.addAuditLog('TOP_UP_APPROVE', topUp.username + ' icin ' + topUp.amount + ' TS onaylandi');
    state.addNotification("Bakiye yuklendi", "success");
  },

  rejectTopUp: (topUpId: string, reason: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 4)) return;
    set((s: any) => ({ ...s, pendingTopUps: s.pendingTopUps.filter((t: any) => t.id !== topUpId) }));
    state.addAuditLog('TOP_UP_REJECT', topUpId + ' reddedildi: ' + reason);
    state.addNotification("Reddedildi", "info");
  },
  requestWithdraw: (amount: number, method: string, details: any) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !user.isSeller) return;
    if (amount < state.config.minWithdraw || amount > user.sellerBalance) return;
    const todayWithdraws = state.pendingWithdrawals.filter((w: any) => w.userId === user.id && new Date(w.date).toDateString() === new Date().toDateString());
    if (todayWithdraws.length >= state.config.dailyWithdrawCount) { state.addNotification('Gunde max ' + state.config.dailyWithdrawCount + ' cekim yapabilirsin', "warning"); return; }
    const commission = Math.floor(amount * state.config.withdrawCommission);
    const netAmount = amount - commission;
    const withdrawRequest = { id: 'wd_' + generateId(), userId: user.id, username: user.username, amount, commission, netAmount, method, details, status: 'PENDING', date: Date.now() };
    state.updateUser(user.id, { sellerBalance: user.sellerBalance - amount });
    set((s: any) => ({ ...s, pendingWithdrawals: [withdrawRequest, ...s.pendingWithdrawals] }));
    state.addAuditLog('WITHDRAW_REQUEST', user.username + ' ' + amount + ' TS cekim talebi');
    state.addNotification('Cekim talebi olusturuldu. Net: ' + netAmount + ' TS', "info");
  },

  approveWithdraw: (withdrawId: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 5)) return;
    const withdraw = state.pendingWithdrawals.find((w: any) => w.id === withdrawId);
    if (!withdraw) return;
    set((s: any) => ({ ...s, pendingWithdrawals: s.pendingWithdrawals.filter((w: any) => w.id !== withdrawId) }));
    state.addAuditLog('WITHDRAW_APPROVE', withdraw.username + ' icin ' + withdraw.netAmount + ' TS onaylandi');
    state.addNotification("Cekim onaylandi", "success");
  },

  rejectWithdraw: (withdrawId: string, reason: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 5)) return;
    const withdraw = state.pendingWithdrawals.find((w: any) => w.id === withdrawId);
    if (!withdraw) return;
    state.updateUser(withdraw.userId, (u: any) => ({ ...u, sellerBalance: u.sellerBalance + withdraw.amount }));
    set((s: any) => ({ ...s, pendingWithdrawals: s.pendingWithdrawals.filter((w: any) => w.id !== withdrawId) }));
    state.addAuditLog('WITHDRAW_REJECT', withdrawId + ' reddedildi: ' + reason);
    state.addNotification("Reddedildi, bakiye iade edildi", "info");
  },

  submitSellerApplication: (data: any) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || user.isSeller) return;
    const existingApp = state.pendingSellerApplications.find((a: any) => a.userId === user.id && a.status === 'PENDING');
    if (existingApp) { state.addNotification("Zaten bekleyen basvurun var", "warning"); return; }
    const application = { id: 'sa_' + generateId(), userId: user.id, username: user.username, ...data, status: 'PENDING', date: Date.now() };
    set((s: any) => ({ ...s, pendingSellerApplications: [application, ...s.pendingSellerApplications] }));
    state.addAuditLog('SELLER_APPLICATION', user.username + ' satici basvurusu yapti');
    state.addNotification("Basvurun alindi.", "success");  },

  approveSellerApplication: (appId: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 4)) return;
    const app = state.pendingSellerApplications.find((a: any) => a.id === appId);
    if (!app) return;
    state.updateUser(app.userId, { isSeller: true, sellerInfo: { verifiedAt: Date.now(), totalSales: 0 } });
    set((s: any) => ({ ...s, pendingSellerApplications: s.pendingSellerApplications.map((a: any) => a.id === appId ? { ...a, status: 'APPROVED', reviewedBy: user.username, reviewedAt: Date.now() } : a) }));
    state.addAuditLog('SELLER_APPROVED', app.username + ' satici olarak onaylandi');
    state.addNotification("Satici onaylandi", "success");
  },

  rejectSellerApplication: (appId: string, reason: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 4)) return;
    set((s: any) => ({ ...s, pendingSellerApplications: s.pendingSellerApplications.map((a: any) => a.id === appId ? { ...a, status: 'REJECTED', reviewedBy: user.username, reviewedAt: Date.now(), rejectReason: reason } : a) }));
    state.addAuditLog('SELLER_REJECTED', appId + ' reddedildi: ' + reason);
    state.addNotification("Reddedildi", "info");
  },

  submitReview: (productId: string, rating: number, text: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    const cleanText = (text || '').toString().slice(0, state.config.maxReviewLength);
    if (!cleanText.trim() || cleanText.length < 5) { state.addNotification("Yorum en az 5 karakter", "error"); return; }
    const hasBought = state.orders.some((o: any) => o.userId === user.id && o.items.some((i: any) => i.id === productId));
    if (!hasBought) { state.addNotification("Bu urunu satin almadan yorum yapamazsin", "error"); return; }
    const product = state.products.find((p: any) => p.id === productId);
    if (product && product.sellerId === user.id) { state.addNotification("Kendi urunun icin yorum yapamazsin", "error"); return; }
    if (state.reviews.some((r: any) => r.productId === productId && r.userId === user.id)) { state.addNotification("Zaten yorum yaptin", "error"); return; }
    const newReview = { id: generateId(), productId, userId: user.id, userName: user.username, rating, text: cleanText, date: Date.now() };
    set((s: any) => ({ ...s, reviews: [newReview, ...s.reviews] }));
    state.updateStat(user.id, 'reviewsWritten');
    state.updatePoints(user.id, 10, "Yorum Odulu", "earn");
    state.addNotification("Yorum yayinlandi! +10 TS", "success");
  },

  completeTask: (task: any) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    const now = Date.now();
    const lastCompleted = state.completedTasks[task.id] || 0;
    if (!task.repeatable && lastCompleted > 0) { state.addNotification("Bu gorev zaten tamamlandi!", "error"); return; }
    if (task.repeatable && task.cooldown && (now - lastCompleted) < task.cooldown) { state.addNotification("Bekleme suresinde...", "error"); return; }
    set((s: any) => ({ ...s, completedTasks: { ...s.completedTasks, [task.id]: now } }));    state.updatePoints(user.id, task.reward, 'Gorev: ' + task.title, 'earn');
    state.updateStat(user.id, 'tasksCompleted');
    state.addNotification('+' + task.reward + ' TS Kazandiniz!', "success");
  },

  playGame: (type: string, betAmount: number, guess: any) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    if (betAmount < 10 || betAmount > state.config.maxBetLimit || user.points < betAmount) { state.addNotification("Gecersiz bahis veya yetersiz bakiye", "error"); return; }
    let won = false, payout = 0, result = "", details: any = {};
    if (type === 'dice') {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2; const isEven = sum % 2 === 0;
      result = 'Zarlar: ' + d1 + ' + ' + d2 + ' = ' + sum + ' (' + (isEven ? 'Cift' : 'Tek') + ')';
      details = { d1, d2, sum, isEven };
      if ((guess === 'even' && isEven) || (guess === 'odd' && !isEven)) { won = true; payout = Math.floor(betAmount * 1.95); }
    } else if (type === 'coin') {
      const flip = Math.random() < 0.5 ? 'heads' : 'tails';
      result = 'Madeni para: ' + (flip === 'heads' ? 'Tura' : 'Yazi');
      details = { flip };
      if (guess === flip) { won = true; payout = Math.floor(betAmount * 1.95); }
    } else if (type === 'crash') {
      const crashPoint = Math.max(1.0, (100 / (Math.random() * 100 + 1)));
      result = 'Cokus: ' + crashPoint.toFixed(2) + 'x';
      details = { crashPoint };
      if (guess <= crashPoint) { won = true; payout = Math.floor(betAmount * guess); }
    }
    const profit = won ? payout - betAmount : -betAmount;
    set((s: any) => {
      const newHistory = { id: generateId(), userId: user.id, type, bet: betAmount, won, payout: won ? payout : 0, profit, result, details, date: Date.now() };
      const newStats = { ...s.users.find((u: any) => u.id === user.id)!.stats, gamesPlayed: (s.users.find((u: any) => u.id === user.id)!.stats.gamesPlayed || 0) + 1, biggestWin: Math.max(s.users.find((u: any) => u.id === user.id)!.stats.biggestWin || 0, profit) };
      return { ...s, users: s.users.map((u: any) => u.id === user.id ? { ...u, points: u.points + profit, stats: newStats } : u), gameHistory: [newHistory, ...s.gameHistory].slice(0, 500) };
    });
    state.addNotification(won ? 'Kazandin! +' + payout + ' TS' : 'Kaybettin. ' + result, won ? 'success' : 'error');
  },

  spinWheel: () => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return 0;
    const lastSpin = user.stats?.lastSpin || 0;
    if (Date.now() - lastSpin < 86400000) { state.addNotification("Carki gunde 1 kez cevirebilirsin!", "error"); return 0; }
    const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel] : null;
    const rewards = vipBenefits ? vipBenefits.wheelRewards : [5, 10, 15, 20, 25, 30, 50, 100];
    const belowChance = vipBenefits ? vipBenefits.wheelBelowChance : 0.7;
    let prize;
    if (Math.random() < belowChance) {
      const threshold = user.vipLevel === VIP_LEVELS.STANDARD ? 100 : user.vipLevel === VIP_LEVELS.PRO ? 150 : 190;      const lowRewards = rewards.filter((r: number) => r < threshold);
      prize = lowRewards[Math.floor(Math.random() * lowRewards.length)] || rewards[0];
    } else {
      const threshold = user.vipLevel === VIP_LEVELS.STANDARD ? 100 : user.vipLevel === VIP_LEVELS.PRO ? 150 : 190;
      const highRewards = rewards.filter((r: number) => r >= threshold);
      prize = highRewards[Math.floor(Math.random() * highRewards.length)] || rewards[rewards.length - 1];
    }
    state.updatePoints(user.id, prize, "Gunluk Cark", "earn");
    state.updateUser(user.id, { stats: { ...user.stats, lastSpin: Date.now() } });
    state.addNotification('+' + prize + ' TS kazandin!', "success");
    return prize;
  },

  sendTS: (recipientUsername: string, amount: number, message: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    if (!recipientUsername || recipientUsername.length < 3) return state.addNotification("Gecersiz alici", "error");
    if (recipientUsername.toLowerCase() === user.username.toLowerCase()) return state.addNotification("Kendine TS gonderemezsin", "error");
    if (!amount || amount < state.config.minTransfer) return state.addNotification('Min: ' + state.config.minTransfer + ' TS', "error");
    if (amount > user.points) return state.addNotification("Yetersiz bakiye", "error");
    const recipient = state.users.find((u: any) => u.username.toLowerCase() === recipientUsername.toLowerCase());
    if (!recipient) return state.addNotification("Alici bulunamadi", "error");
    if (recipient.banned) return state.addNotification("Alici yasaklanmis", "error");
    const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel] : null;
    const taxRate = vipBenefits ? vipBenefits.transferTaxRate : state.config.transferTax;
    const tax = amount > 1000 ? Math.floor(amount * taxRate) : 0;
    const totalCost = amount + tax;
    if (user.points < totalCost) return state.addNotification("Vergi dahil yetersiz bakiye", "error");
    const cleanMsg = (message || '').toString().slice(0, 200);
    set((s: any) => {
      const senderTx = { id: generateId(), userId: user.id, amount: totalCost, reason: '@' + recipient.username + ' kullanicisina gonderildi' + (cleanMsg ? ': ' + cleanMsg : '') + (tax > 0 ? ' (Vergi: ' + tax + ' TS)' : ''), type: 'spend', date: Date.now() };
      const recipientTx = { id: generateId(), userId: recipient.id, amount: amount, reason: '@' + user.username + ' kullanicisindan alindi' + (cleanMsg ? ': ' + cleanMsg : ''), type: 'earn', date: Date.now() };
      return { ...s, users: s.users.map((u: any) => { if (u.id === user.id) return { ...u, points: u.points - totalCost }; if (u.id === recipient.id) return { ...u, points: u.points + amount }; return u; }), transactions: [senderTx, recipientTx, ...s.transactions].slice(0, 1000) };
    });
    state.addNotification(amount + ' TS gonderildi!' + (tax > 0 ? ' (' + tax + ' TS vergi)' : ''), "success");
  },

  requestReturn: (orderId: string, itemId: string, reason: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    const today = new Date().toDateString();
    const todayTickets = state.tickets.filter((t: any) => new Date(t.date).toDateString() === today);
    if (todayTickets.length >= state.config.maxTicketsPerDay) { state.addNotification('Gunde en fazla ' + state.config.maxTicketsPerDay + ' talep', "warning"); return; }
    const order = state.orders.find((o: any) => o.id === orderId);
    const item = order?.items.find((i: any) => i.id === itemId);
    if (!order || !item) return;
    const hoursPassed = (Date.now() - order.date) / (1000 * 60 * 60);
    if (hoursPassed > state.config.returnWindowHours) { state.addNotification('Iade suresi doldu (' + state.config.returnWindowHours + ' saat)', "error"); return; }    if (state.tickets.some((t: any) => t.orderId === orderId && t.itemId === itemId && t.status === 'OPEN')) { state.addNotification("Zaten acik talep var", "error"); return; }
    const cleanReason = (reason || '').toString().slice(0, 500);
    const ticket = { id: generateId(), type: 'RETURN', orderId, itemId, itemName: item.name, userId: user.id, reason: cleanReason, status: 'OPEN', date: Date.now() };
    set((s: any) => ({ ...s, tickets: [ticket, ...s.tickets] }));
    state.addNotification("Iade talebi olusturuldu.", "info");
  },

  approveReturn: (ticketId: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 4)) return;
    const ticket = state.tickets.find((t: any) => t.id === ticketId);
    if (!ticket) return;
    const order = state.orders.find((o: any) => o.id === ticket.orderId);
    const item = order?.items.find((i: any) => i.id === ticket.itemId);
    if (!order || !item) return;
    set((s: any) => {
      const refundAmount = item.price * item.qty;
      const prod = s.products.find((p: any) => p.id === item.id);
      let updatedUsers = s.users.map((u: any) => {
        if (u.id === ticket.userId) return { ...u, points: u.points + refundAmount };
        if (prod && u.id === prod.sellerId) return { ...u, sellerBalance: Math.max(0, u.sellerBalance - refundAmount) };
        return u;
      });
      let updatedProducts = s.products;
      if (prod) {
        const codes = item.deliveryCodes || (item.deliveryAccount ? item.deliveryAccount.split(', ') : []);
        updatedProducts = s.products.map((p: any) => p.id === prod.id ? { ...p, stock: [...p.stock, ...codes] } : p);
      }
      return { ...s, users: updatedUsers, products: updatedProducts, tickets: s.tickets.map((t: any) => t.id === ticketId ? { ...t, status: 'RESOLVED' } : t), transactions: [{ id: generateId(), userId: ticket.userId, amount: refundAmount, reason: 'Iade: ' + item.name, type: 'earn', date: Date.now() }, ...s.transactions].slice(0, 1000) };
    });
    state.addNotification("Iade onaylandi, stok geri eklendi.", "success");
  },

  rejectReturn: (ticketId: string) => {
    set((s: any) => ({ ...s, tickets: s.tickets.map((t: any) => t.id === ticketId ? { ...t, status: 'REJECTED' } : t) }));
    get().addNotification("Talep reddedildi", "info");
  },

  addProduct: (newProd: any) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !user.isSeller) { state.addNotification("Yetkiniz yok", "error"); return; }
    if (!newProd.name || !newProd.price) { state.addNotification("Eksik bilgi", "error"); return; }
    const invList = newProd.inventory.split('\n').filter((x: string) => x.trim());
    if (invList.length === 0) { state.addNotification("En az 1 stok kodu gerekli", "error"); return; }
    const prod = { id: 'p_' + generateId(), name: (newProd.name || '').toString().slice(0, 100), price: Math.max(1, Number(newProd.price)), category: newProd.category, subcat: newProd.subcat || '', sellerId: user.id, sellerName: user.username, image: newProd.image || "https://placehold.co/400x300/333/FFF?text=New", sales: 0, type: 'code', tags: newProd.tags.split(',').map((t: string) => (t || '').trim()).filter(Boolean).slice(0, 3), desc: (newProd.desc || '').toString().slice(0, 500), stock: invList, verified: hasPermission(user.role, 5), status: 'ACTIVE', deliveryTime: 'Aninda', createdAt: Date.now(), boostUntil: 0 };
    set((s: any) => ({ ...s, products: [...s.products, prod] }));
    state.addNotification("Urun eklendi!", "success");
  },
  deleteProduct: (productId: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    const prod = state.products.find((p: any) => p.id === productId);
    if (!prod) return;
    if (prod.sellerId !== user?.id && !hasPermission(user?.role || '', 5)) { state.addNotification("Yetkiniz yok", "error"); return; }
    set((s: any) => ({ ...s, products: s.products.filter((p: any) => p.id !== productId) }));
    state.addNotification("Urun silindi", "info");
  },

  boostProduct: (productId: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    const vipBenefits = user.vipLevel && user.vipLevel !== VIP_LEVELS.NONE ? VIP_BENEFITS[user.vipLevel] : null;
    if (!vipBenefits) { state.addNotification("Sadece VIP uyeler urun one cikarabilir", "error"); return; }
    const boostedProducts = state.products.filter((p: any) => p.sellerId === user.id && p.boostUntil > Date.now());
    if (boostedProducts.length >= vipBenefits.boostProducts) { state.addNotification("Boost limitin doldu", "warning"); return; }
    const boostUntil = Date.now() + (vipBenefits.boostDays * 86400000);
    set((s: any) => ({ ...s, products: s.products.map((p: any) => p.id === productId ? { ...p, boostUntil } : p) }));
    state.addNotification('Urun ' + vipBenefits.boostDays + ' gun one cikarildi!', "success");
  },

  banUser: (userId: string, reason: string = '') => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 4)) return;
    const targetUser = state.users.find((u: any) => u.id === userId);
    if (!targetUser) return;
    if (ROLE_HIERARCHY[targetUser.role] >= ROLE_HIERARCHY[user.role]) { state.addNotification("Kendinizden yuksek yetkiliyi banlayamazsin", "error"); return; }
    state.updateUser(userId, { banned: !targetUser.banned });
    state.addAuditLog('USER_BAN_TOGGLE', targetUser.username + ' ' + (targetUser.banned ? 'yasagi kaldirildi' : 'banlandi') + '. Sebep: ' + reason);
    state.addNotification(targetUser.banned ? "Yasak kaldirildi" : "Kullanici banlandi", "info");
  },

  setUserRole: (userId: string, newRole: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    const targetUser = state.users.find((u: any) => u.id === userId);
    if (!targetUser) return;
    if (newRole === ROLES.FOUNDER && user.role !== ROLES.FOUNDER) { state.addNotification("Kurucu yetkisi sadece kurucu tarafindan verilebilir", "error"); return; }
    if (newRole === ROLES.SUPER_ADMIN && user.role !== ROLES.FOUNDER && user.role !== ROLES.SUPER_ADMIN) { state.addNotification("Sadece kurucu/super admin atayabilir", "error"); return; }
    if (newRole === ROLES.ADMIN && !hasPermission(user.role, 6)) { state.addNotification("Super admin+ yetkisi gerekli", "error"); return; }
    if (newRole === ROLES.AUTHORITY && !hasPermission(user.role, 5)) { state.addNotification("Admin+ yetkisi gerekli", "error"); return; }
    if (newRole === ROLES.MODERATOR && !hasPermission(user.role, 4)) { state.addNotification("Yetkili+ yetkisi gerekli", "error"); return; }
    state.updateUser(userId, { role: newRole });
    state.addAuditLog('ROLE_CHANGE', targetUser.username + ' rolu ' + newRole + ' yapildi');
    state.addNotification('Rol guncellendi: ' + newRole, "success");  },

  exportData: () => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    const data = { user: { ...user, passwordHash: undefined, passwordSalt: undefined }, orders: state.orders.filter((o: any) => o.userId === user.id), transactions: state.transactions.filter((t: any) => t.userId === user.id), reviews: state.reviews.filter((r: any) => r.userId === user.id), gameHistory: state.gameHistory.filter((g: any) => g.userId === user.id), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tshop_verilerim_' + user.username + '.json'; a.click();
    URL.revokeObjectURL(url);
    state.addNotification("Verilerin indirildi.", "success");
  },

  deleteAccount: () => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user) return;
    set((s: any) => ({ ...s, users: s.users.filter((u: any) => u.id !== user.id), reviews: s.reviews.filter((r: any) => r.userId !== user.id), orders: s.orders.filter((o: any) => o.userId !== user.id), transactions: s.transactions.filter((t: any) => t.userId !== user.id), gameHistory: s.gameHistory.filter((g: any) => g.userId !== user.id), currentUserId: null }));
    state.addNotification("Hesabin ve verilerin KVKK geregi silindi.", "info");
  },

  addAnnouncement: (title: string, content: string, priority: string) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 4)) return;
    set((s: any) => ({ ...s, announcements: [{ id: 'a_' + generateId(), title: (title || '').toString().slice(0, 200), content: (content || '').toString().slice(0, 2000), priority, date: Date.now() }, ...s.announcements] }));
    state.addAuditLog('ANNOUNCEMENT_ADD', 'Duyuru: ' + title);
    state.addNotification("Duyuru eklendi", "success");
  },

  updateConfig: (newConfig: any) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || user.role !== ROLES.FOUNDER) { state.addNotification("Sadece kurucu yapabilir", "error"); return; }
    set((s: any) => ({ ...s, config: { ...s.config, ...newConfig } }));
    state.addAuditLog('CONFIG_UPDATE', 'Site ayarlari guncellendi');
    state.addNotification("Ayarlar kaydedildi", "success");
  },

  updateCategories: (newCategories: any[]) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 5)) return;
    set((s: any) => ({ ...s, categories: newCategories }));
    state.addAuditLog('CATEGORIES_UPDATE', 'Kategoriler guncellendi');
    state.addNotification("Kategoriler guncellendi", "success");
  },
  updateVipPrices: (newPrices: any) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || user.role !== ROLES.FOUNDER) return;
    set((s: any) => ({ ...s, vipPrices: newPrices }));
    state.addAuditLog('VIP_PRICES_UPDATE', 'VIP fiyatlari guncellendi');
    state.addNotification("VIP fiyatlari guncellendi", "success");
  },

  updateTopUpPackages: (newPackages: any[]) => {
    const state = get();
    const user = state.users.find((u: any) => u.id === state.currentUserId);
    if (!user || !hasPermission(user.role, 5)) return;
    set((s: any) => ({ ...s, topUpPackages: newPackages }));
    state.addAuditLog('PACKAGES_UPDATE', 'TS paketleri guncellendi');
    state.addNotification("Paketler guncellendi", "success");
  },
});
