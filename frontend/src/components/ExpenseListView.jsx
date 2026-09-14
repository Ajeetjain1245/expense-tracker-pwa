import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Edit3, Trash2, Banknote, CreditCard, X, ChevronDown, Plus, Receipt } from 'lucide-react';
import { CATEGORIES, getCategoryMeta } from '../constants/categories';

export const ExpenseListView = ({
  expenses,
  loading,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDateHeader = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const formattedDate = d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (isToday) return `Today (${formattedDate})`;
    if (isYesterday) return `Yesterday (${formattedDate})`;
    return formattedDate;
  };

  // Group expenses by date (YYYY-MM-DD)
  const groupedExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return {};

    return expenses.reduce((groups, expense) => {
      const d = new Date(expense.date);
      const dateKey = d.toISOString().split('T')[0];

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: expense.date,
          items: [],
          total: 0,
        };
      }
      groups[dateKey].items.push(expense);
      groups[dateKey].total += expense.amount;
      return groups;
    }, {});
  }, [expenses]);

  const sortedDateKeys = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a));

  const totalFilteredAmount = useMemo(() => {
    return (expenses || []).reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const hasActiveFilters = Boolean(
    filters.startDate || filters.endDate || filters.category || filters.paymentMode || filters.search
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Expense History</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {expenses?.length || 0} transactions • Total:{' '}
              <span className="font-bold text-slate-900">{formatCurrency(totalFilteredAmount)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                hasActiveFilters || showFilters
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              )}
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by note, description or category..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">
                Payment Mode
              </label>
              <select
                value={filters.paymentMode || ''}
                onChange={(e) => onFilterChange({ ...filters, paymentMode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500"
              >
                <option value="">All Modes</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={onResetFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 py-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Grouped List View */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
              <div className="h-5 w-40 bg-slate-200 rounded-lg"></div>
              <div className="h-16 bg-slate-100 rounded-2xl"></div>
              <div className="h-16 bg-slate-100 rounded-2xl"></div>
            </div>
          ))}
        </div>
      ) : sortedDateKeys.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No expenses found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No transactions matched your selected filters. Try clearing some filters.'
              : 'Start logging your daily expenses to see them organized here.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={onResetFilters}
              className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
            >
              + Add Expense
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDateKeys.map((dateKey) => {
            const group = groupedExpenses[dateKey];
            return (
              <div
                key={dateKey}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Date Group Header with subtotal */}
                <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-800">
                      {formatDateHeader(group.date)}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200/60 shadow-xs">
                    {formatCurrency(group.total)}
                  </span>
                </div>

                {/* List Items */}
                <div className="divide-y divide-slate-100">
                  {group.items.map((expense) => {
                    const meta = getCategoryMeta(expense.category);
                    return (
                      <div
                        key={expense._id}
                        className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Left: Category icon & meta */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm"
                            style={{ backgroundColor: meta.color }}
                          >
                            {expense.category.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {expense.note || expense.category}
                              </p>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${meta.bg}`}>
                                {expense.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1 font-medium capitalize text-slate-600">
                                {expense.paymentMode === 'cash' ? (
                                  <>
                                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                                    Cash
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                    Online • <span className="font-semibold">{expense.onlineSubType || 'Online'}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-base font-extrabold text-slate-900">
                            -{formatCurrency(expense.amount)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditExpense(expense)}
                              title="Edit expense"
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteExpense(expense._id)}
                              title="Delete expense"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
