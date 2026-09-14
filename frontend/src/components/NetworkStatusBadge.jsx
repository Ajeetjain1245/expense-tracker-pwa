import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { syncManager } from '../services/syncManager';
import { getPendingSyncItems } from '../db/indexedDb';
import { useAuth } from '../context/AuthContext';

export const NetworkStatusBadge = ({ onSyncComplete }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkPending = async () => {
    try {
      const items = await getPendingSyncItems(user?.id);
      setPendingCount(items.length);
    } catch {
      setPendingCount(0);
    }
  };

  const handleManualSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    try {
      setIsSyncing(true);
      const res = await syncManager.pushOfflineChanges(user?.id);
      await checkPending();
      if (onSyncComplete) onSyncComplete(res.syncedCount);
    } catch (err) {
      console.warn('Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    checkPending();

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      try {
        const res = await syncManager.pushOfflineChanges(user?.id);
        await checkPending();
        if (onSyncComplete) onSyncComplete(res.syncedCount);
      } catch (err) {
        console.warn('Auto sync on online failed:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      checkPending();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkPending, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [user, onSyncComplete]);

  return (
    <div className="flex items-center gap-2">
      {/* Online / Offline status badge */}
      {!isOnline ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          <span>Offline (IndexedDB)</span>
        </div>
      ) : (
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online</span>
        </div>
      )}

      {/* Pending Sync Button / Counter */}
      {pendingCount > 0 && isOnline && (
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
          title="Click to sync offline changes now"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{pendingCount} unsynced</span>
        </button>
      )}
    </div>
  );
};
