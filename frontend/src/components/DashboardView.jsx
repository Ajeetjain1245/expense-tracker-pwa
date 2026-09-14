import React from 'react';
import { IndianRupee, Calendar, TrendingUp, ArrowUpRight, Plus, Receipt, Sparkles, CreditCard, Banknote } from 'lucide-react';
import { getCategoryMeta } from '../constants/categories';

export const DashboardView = ({
  summary,
  recentExpenses,
  loading,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
  onNavigateTab
}) => {
  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statCards = [
    {
      title: "Today's Spend",
      amount: summary?.today?.total || 0,
      count: summary?.today?.count || 0,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10',
      icon: Calendar,
      badge: 'Today',
    },
    {
      title: "This Week",
      amount: summary?.thisWeek?.total || 0,
      count: summary?.thisWeek?.count || 0,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/10',
      icon: TrendingUp,
      badge: 'Mon - Sun',
    },
    {
      title: "This Month",
      amount: summary?.thisMonth?.total || 0,
      count: summary?.thisMonth?.count || 0,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/10',
      icon: Sparkles,
      badge: 'Current Month',
    },
    {
      title: "This Year",
      amount: summary?.thisYear?.total || 0,
      count: summary?.thisYear?.count || 0,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/10',
      icon: IndianRupee,
      badge: 'YTD',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-emerald-300 mb-3 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Dashboard
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Personal Expense Overview
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-md">
              Keep your financial life in sync. Track cash, UPI, cards, and analyze spending patterns effortlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-2xl backdrop-blur-sm transition-all"
            >
              Analytics
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                  {card.badge}
                </span>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${card.gradient} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs font-medium text-slate-500">{card.title}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
                {loading ? '...' : formatCurrency(card.amount)}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" />
                {card.count} {card.count === 1 ? 'transaction' : 'transactions'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest recorded spending entries</p>
          </div>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : recentExpenses?.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 stroke-1 text-slate-300" />
            <p className="text-sm font-medium">No expenses recorded yet.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              + Add your first expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentExpenses.map((expense) => {
              const meta = getCategoryMeta(expense.category);
              return (
                <div
                  key={expense._id}
                  className="py-4 flex items-center justify-between gap-4 group hover:bg-slate-50/80 px-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: meta.color }}
                    >
                      {expense.category.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {expense.note || expense.category}
                        </p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${meta.bg}`}>
                          {expense.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{formatDate(expense.date)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 font-medium capitalize text-slate-600">
                          {expense.paymentMode === 'cash' ? (
                            <>
                              <Banknote className="w-3 h-3 text-emerald-600" />
                              Cash
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3 h-3 text-blue-600" />
                              Online ({expense.onlineSubType || 'Online'})
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-slate-900">
                      -{formatCurrency(expense.amount)}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600"
                      >
                        Edit
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={() => onDeleteExpense(expense._id)}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
