import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Calendar, Tag, CreditCard, Banknote, FileText, Check } from 'lucide-react';
import { CATEGORIES, ONLINE_SUB_TYPES } from '../constants/categories';

export const ExpenseFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEditing = Boolean(initialData);

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    paymentMode: 'online',
    onlineSubType: 'UPI',
    note: '',
    date: getTodayDateString(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Format initial date to YYYY-MM-DD
      let formattedDate = getTodayDateString();
      if (initialData.date) {
        const d = new Date(initialData.date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        formattedDate = `${y}-${m}-${day}`;
      }

      setFormData({
        amount: initialData.amount || '',
        category: initialData.category || 'Food',
        paymentMode: initialData.paymentMode || 'online',
        onlineSubType: initialData.onlineSubType || 'UPI',
        note: initialData.note || '',
        date: formattedDate,
      });
    } else {
      setFormData({
        amount: '',
        category: 'Food',
        paymentMode: 'online',
        onlineSubType: 'UPI',
        note: '',
        date: getTodayDateString(),
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.amount || Number(formData.amount) <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }
    if (!formData.category) {
      errs.category = 'Please select a category';
    }
    if (!formData.date) {
      errs.date = 'Please select a date';
    }
    if (formData.paymentMode === 'online' && !formData.onlineSubType) {
      errs.onlineSubType = 'Please choose an online payment method (UPI, Card, Wallet)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        amount: Number(formData.amount),
        category: formData.category,
        paymentMode: formData.paymentMode,
        note: formData.note.trim(),
        date: new Date(formData.date).toISOString(),
      };

      if (formData.paymentMode === 'online') {
        payload.onlineSubType = formData.onlineSubType;
      }

      await onSubmit(payload, initialData?._id);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to save expense' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transition-all animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Update the details of your transaction' : 'Record an expense with instant categorization'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.form && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {errors.form}
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-2xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <IndianRupee className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-11 pr-4 py-3.5 text-2xl font-bold rounded-2xl border ${
                  errors.amount ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                } transition-all outline-none text-slate-900 placeholder:text-slate-300`}
                autoFocus
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.amount}</p>}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </div>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* Payment Mode Selector (Cash vs Online) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Payment Mode <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMode: 'cash' })}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                  formData.paymentMode === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4" />
                Cash
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMode: 'online' })}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                  formData.paymentMode === 'online'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Online
              </button>
            </div>
          </div>

          {/* Conditional Online Sub-Type */}
          {formData.paymentMode === 'online' && (
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5 animate-fade-in">
              <label className="block text-xs font-semibold text-slate-600">
                Online Sub-Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ONLINE_SUB_TYPES.map((sub) => {
                  const isSelected = formData.onlineSubType === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, onlineSubType: sub.id })}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {sub.id}
                    </button>
                  );
                })}
              </div>
              {errors.onlineSubType && (
                <p className="text-xs text-rose-500 font-medium">{errors.onlineSubType}</p>
              )}
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Expense Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
              />
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Note / Description (Optional)
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-4 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Swiggy lunch, metro card recharge, rent"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Check className="w-4 h-4" />
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Expense'
                : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
