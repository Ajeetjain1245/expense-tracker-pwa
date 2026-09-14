import { api } from './api';
import {
  db,
  bulkCacheServerExpenses,
  getLocalExpenses,
  getPendingSyncItems,
  addLocalExpense,
  updateLocalExpense,
  deleteLocalExpense,
  calculateLocalSummary,
} from '../db/indexedDb';

export const syncManager = {
  /**
   * Check if browser is currently online
   */
  isOnline: () => typeof navigator !== 'undefined' && navigator.onLine,

  /**
   * Push all pending offline mutations to MongoDB backend
   */
  pushOfflineChanges: async (userId) => {
    if (!navigator.onLine) return { syncedCount: 0 };

    const pending = await getPendingSyncItems(userId);
    if (pending.length === 0) return { syncedCount: 0 };

    let syncedCount = 0;

    for (const item of pending) {
      try {
        if (item.syncStatus === 'created_offline') {
          // Push new expense to server
          const payload = {
            amount: item.amount,
            category: item.category,
            paymentMode: item.paymentMode,
            onlineSubType: item.onlineSubType,
            note: item.note,
            date: item.date,
          };
          const res = await api.createExpense(payload);
          if (res.data) {
            // Update local record with real server MongoDB _id
            await db.expenses.update(item.localId, {
              _id: res.data._id,
              syncStatus: 'synced',
            });
            syncedCount++;
          }
        } else if (item.syncStatus === 'updated_offline' && item._id) {
          // Push update to server
          const payload = {
            amount: item.amount,
            category: item.category,
            paymentMode: item.paymentMode,
            onlineSubType: item.onlineSubType,
            note: item.note,
            date: item.date,
          };
          await api.updateExpense(item._id, payload);
          await db.expenses.update(item.localId, { syncStatus: 'synced' });
          syncedCount++;
        } else if (item.syncStatus === 'deleted_offline' && item._id) {
          // Push delete to server
          await api.deleteExpense(item._id);
          await db.expenses.delete(item.localId);
          syncedCount++;
        }
      } catch (err) {
        console.warn(`[SyncManager] Error syncing item ${item.localId}:`, err.message);
        // Will retry on next sync cycle
      }
    }

    return { syncedCount };
  },

  /**
   * Unified Get Expenses: Pulls from Server if online + caches to IndexedDB, fallback to IndexedDB if offline
   */
  getExpenses: async (userId, filters = {}) => {
    if (navigator.onLine) {
      try {
        // First sync pending offline changes
        await syncManager.pushOfflineChanges(userId);

        // Fetch fresh from server
        const res = await api.getExpenses(filters);
        const serverExpenses = res.data || [];

        // Cache into Dexie IndexedDB
        await bulkCacheServerExpenses(serverExpenses, userId);

        return {
          data: await getLocalExpenses(userId, filters),
          source: 'online_synced',
          count: serverExpenses.length,
        };
      } catch (err) {
        console.warn('[SyncManager] Failed to fetch from server, falling back to local DB:', err.message);
      }
    }

    // Offline fallback: load directly from IndexedDB
    const localData = await getLocalExpenses(userId, filters);
    return {
      data: localData,
      source: 'offline_local',
      count: localData.length,
    };
  },

  /**
   * Unified Add Expense: Writes to IndexedDB immediately, syncs to server if online
   */
  createExpense: async (expenseData, userId) => {
    const isOnline = navigator.onLine;

    // 1. Write to local IndexedDB first
    const localRecord = await addLocalExpense(expenseData, userId, false);

    if (isOnline) {
      try {
        const res = await api.createExpense(expenseData);
        if (res.data) {
          await db.expenses.update(localRecord.localId, {
            _id: res.data._id,
            syncStatus: 'synced',
          });
          return res.data;
        }
      } catch (err) {
        console.warn('[SyncManager] Server create failed, kept in local queue:', err.message);
      }
    }

    return localRecord;
  },

  /**
   * Unified Update Expense: Writes to IndexedDB, updates server if online
   */
  updateExpense: async (idOrLocalId, expenseData, userId) => {
    const isOnline = navigator.onLine;

    const updatedLocal = await updateLocalExpense(idOrLocalId, expenseData, false);

    if (isOnline && updatedLocal?._id) {
      try {
        const res = await api.updateExpense(updatedLocal._id, expenseData);
        await db.expenses.update(updatedLocal.localId, { syncStatus: 'synced' });
        return res.data;
      } catch (err) {
        console.warn('[SyncManager] Server update failed, kept in local queue:', err.message);
      }
    }

    return updatedLocal;
  },

  /**
   * Unified Delete Expense: Marks/deletes locally, deletes from server if online
   */
  deleteExpense: async (idOrLocalId, userId) => {
    const isOnline = navigator.onLine;
    const target = await deleteLocalExpense(idOrLocalId, false);

    if (isOnline && target?._id) {
      try {
        await api.deleteExpense(target._id);
        await db.expenses.delete(target.localId);
      } catch (err) {
        console.warn('[SyncManager] Server delete failed, marked for sync:', err.message);
      }
    }

    return { id: idOrLocalId };
  },

  /**
   * Unified Dashboard Summary: Pulls from Server if online, calculates locally if offline
   */
  getSummary: async (userId) => {
    if (navigator.onLine) {
      try {
        const res = await api.getSummary();
        return res.data;
      } catch (err) {
        console.warn('[SyncManager] Server summary failed, calculating locally:', err.message);
      }
    }

    return await calculateLocalSummary(userId);
  },
};
