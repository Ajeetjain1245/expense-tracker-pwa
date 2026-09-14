import Dexie from 'dexie';

export const db = new Dexie('ExpenseTrackerOfflineDB');

db.version(1).stores({
  expenses: '++localId, _id, user, date, category, paymentMode, syncStatus, isDeleted',
});

/**
 * Cache or insert remote server expenses into IndexedDB
 */
export const bulkCacheServerExpenses = async (serverExpenses = [], userId) => {
  if (!serverExpenses || serverExpenses.length === 0) return;

  await db.transaction('rw', db.expenses, async () => {
    for (const exp of serverExpenses) {
      // Find if we have it locally by server _id
      const existing = await db.expenses.where('_id').equals(exp._id).first();

      if (existing) {
        // If it's already locally synced, update with server version
        if (existing.syncStatus === 'synced') {
          await db.expenses.update(existing.localId, {
            ...exp,
            user: userId || exp.user,
            syncStatus: 'synced',
            isDeleted: false,
          });
        }
      } else {
        await db.expenses.add({
          ...exp,
          user: userId || exp.user,
          syncStatus: 'synced',
          isDeleted: false,
        });
      }
    }
  });
};

/**
 * Add an expense locally (Works 100% offline)
 */
export const addLocalExpense = async (expenseData, userId, isOnline = false) => {
  const record = {
    ...expenseData,
    user: userId,
    createdAt: new Date().toISOString(),
    syncStatus: isOnline ? 'synced' : 'created_offline',
    isDeleted: false,
  };

  const localId = await db.expenses.add(record);
  return { ...record, localId };
};

/**
 * Update an expense locally (Works 100% offline)
 */
export const updateLocalExpense = async (idOrLocalId, updateData, isOnline = false) => {
  let target = await db.expenses.where('_id').equals(idOrLocalId).first();
  if (!target && !isNaN(Number(idOrLocalId))) {
    target = await db.expenses.get(Number(idOrLocalId));
  }

  if (!target) return null;

  const newStatus = isOnline
    ? 'synced'
    : target.syncStatus === 'created_offline'
    ? 'created_offline'
    : 'updated_offline';

  await db.expenses.update(target.localId, {
    ...updateData,
    syncStatus: newStatus,
  });

  return await db.expenses.get(target.localId);
};

/**
 * Delete an expense locally (Works 100% offline)
 */
export const deleteLocalExpense = async (idOrLocalId, isOnline = false) => {
  let target = await db.expenses.where('_id').equals(idOrLocalId).first();
  if (!target && !isNaN(Number(idOrLocalId))) {
    target = await db.expenses.get(Number(idOrLocalId));
  }

  if (!target) return null;

  if (target.syncStatus === 'created_offline') {
    // If it was created offline and never synced to server, we can permanently remove it
    await db.expenses.delete(target.localId);
  } else {
    // Mark as deleted offline so sync pushes the DELETE to MongoDB
    if (isOnline) {
      await db.expenses.delete(target.localId);
    } else {
      await db.expenses.update(target.localId, {
        isDeleted: true,
        syncStatus: 'deleted_offline',
      });
    }
  }

  return target;
};

/**
 * Get all active local expenses for current user
 */
export const getLocalExpenses = async (userId, filters = {}) => {
  let collection = db.expenses
    .filter((e) => !e.isDeleted && (!userId || e.user === userId || e.user?.id === userId));

  let results = await collection.toArray();

  // Apply filters locally if offline
  if (filters.category) {
    results = results.filter((e) => e.category === filters.category);
  }
  if (filters.paymentMode) {
    results = results.filter((e) => e.paymentMode === filters.paymentMode);
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    results = results.filter(
      (e) =>
        e.note?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
    );
  }
  if (filters.startDate) {
    const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
    results = results.filter((e) => new Date(e.date).getTime() >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
    results = results.filter((e) => new Date(e.date).getTime() <= end);
  }

  // Sort by date descending
  return results.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Get pending sync expenses
 */
export const getPendingSyncItems = async (userId) => {
  return await db.expenses
    .filter(
      (e) =>
        e.syncStatus !== 'synced' &&
        (!userId || e.user === userId || e.user?.id === userId)
    )
    .toArray();
};

/**
 * Calculate local summary metrics when offline
 */
export const calculateLocalSummary = async (userId) => {
  const expenses = await getLocalExpenses(userId);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  // ISO week start (Monday)
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff)).setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  let todayTotal = 0, todayCount = 0;
  let weekTotal = 0, weekCount = 0;
  let monthTotal = 0, monthCount = 0;
  let yearTotal = 0, yearCount = 0;
  let allTimeTotal = 0, allTimeCount = expenses.length;

  for (const exp of expenses) {
    const t = new Date(exp.date).getTime();
    allTimeTotal += exp.amount;

    if (t >= startOfDay && t <= endOfDay) {
      todayTotal += exp.amount;
      todayCount++;
    }
    if (t >= startOfWeek) {
      weekTotal += exp.amount;
      weekCount++;
    }
    if (t >= startOfMonth) {
      monthTotal += exp.amount;
      monthCount++;
    }
    if (t >= startOfYear) {
      yearTotal += exp.amount;
      yearCount++;
    }
  }

  return {
    today: { total: todayTotal, count: todayCount },
    thisWeek: { total: weekTotal, count: weekCount },
    thisMonth: { total: monthTotal, count: monthCount },
    thisYear: { total: yearTotal, count: yearCount },
    allTime: { total: allTimeTotal, count: allTimeCount },
  };
};
