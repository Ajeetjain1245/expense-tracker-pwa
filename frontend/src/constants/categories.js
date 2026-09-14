export const CATEGORIES = [
  { id: 'Food', label: 'Food & Dining', color: '#f97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'Groceries', label: 'Groceries', color: '#84cc16', bg: 'bg-lime-50 text-lime-700 border-lime-200' },
  { id: 'Travel', label: 'Travel & Commute', color: '#3b82f6', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Utilities', label: 'Utilities & Bills', color: '#06b6d4', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'Shopping', label: 'Shopping', color: '#ec4899', bg: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'Entertainment', label: 'Entertainment', color: '#8b5cf6', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'Health', label: 'Health & Fitness', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'Education', label: 'Education', color: '#eab308', bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { id: 'Personal', label: 'Personal Care', color: '#6366f1', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'Others', label: 'Others', color: '#64748b', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export const getCategoryMeta = (categoryId) => {
  return CATEGORIES.find(c => c.id === categoryId) || {
    id: categoryId,
    label: categoryId,
    color: '#64748b',
    bg: 'bg-slate-50 text-slate-700 border-slate-200'
  };
};

export const PAYMENT_MODES = [
  { id: 'cash', label: 'Cash' },
  { id: 'online', label: 'Online' }
];

export const ONLINE_SUB_TYPES = [
  { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
  { id: 'card', label: 'Debit / Credit Card' },
  { id: 'wallet', label: 'Digital Wallet / NetBanking' }
];
