import React from 'react';
import {
  IndianRupee,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Receipt,
  Sparkles,
  CreditCard,
  Banknote,
  PieChart,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getCategoryMeta } from '../constants/categories';
import { useAuth } from '../context/AuthContext';

export const DashboardView = ({
  summary,
  recentExpenses,
  loading,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
  onNavigateTab,
}) => {
  const { user, isFirstTime } = useAuth();

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
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

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentMonthName = new Date().toLocaleString('en-IN', { month: 'long' });

  const statCards = [
    {
      title: "Today's Spend",
      amount: summary?.today?.total || 0,
      count: summary?.today?.count || 0,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50/60 border-emerald-100',
      textAccent: 'text-emerald-700',
      icon: Clock,
      badge: 'Today',
    },
    {
      title: 'This Week',
      amount: summary?.thisWeek?.total || 0,
      count: summary?.thisWeek?.count || 0,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50/60 border-blue-100',
      textAccent: 'text-blue-700',
      icon: TrendingUp,
      badge: 'Mon - Sun',
    },
    {
      title: `This Month (${currentMonthName})`,
      amount: summary?.thisMonth?.total || 0,
      count: summary?.thisMonth?.count || 0,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50/60 border-violet-100',
      textAccent: 'text-violet-700',
      icon: Sparkles,
      badge: currentMonthName,
    },
    {
      title: 'This Year',
      amount: summary?.thisYear?.total || 0,
      count: summary?.thisYear?.count || 0,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50/60 border-amber-100',
      textAccent: 'text-amber-700',
      icon: IndianRupee,
      badge: `${new Date().getFullYear()} YTD`,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. TOP HERO SPENDING CARD WITH DYNAMIC GREETING */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-9 text-white shadow-2xl overflow-hidden border border-slate-700/40">
        {/* Soft decorative background glows */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-16 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-md mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Personal Finance Tracker</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {isFirstTime
                  ? `Hello, ${user?.name || 'User'}! 👋`
                  : `${getTimeGreeting()}, ${user?.name?.split(' ')[0] || 'User'}! 👋`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isFirstTime
                  ? 'Welcome to your new expense dashboard! Start by recording your daily spending.'
                  : 'Welcome back! Here is an instant snapshot of your spending activity.'}
              </p>
            </div>

            {/* Quick Primary Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-auto">
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Add Expense</span>
              </button>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-2xl backdrop-blur-md transition-all cursor-pointer"
              >
                <PieChart className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            </div>
          </div>

          {/* Prominent Monthly Spend Highlight */}
          <div className="pt-4 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                You have spent this month ({currentMonthName})
              </p>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  {loading ? '...' : formatCurrency(summary?.thisMonth?.total || 0)}
                </span>
                <span className="text-xs sm:text-sm text-slate-300 font-medium">
                  across {summary?.thisMonth?.count || 0} {summary?.thisMonth?.count === 1 ? 'transaction' : 'transactions'}
                </span>
              </div>
            </div>

            {/* Today's Mini Metric */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Today's Spend
                </p>
                <p className="text-xl font-bold text-emerald-300 mt-0.5">
                  {loading ? '...' : formatCurrency(summary?.today?.total || 0)}
                </p>
                <p className="text-[10px] text-slate-400">
                  {summary?.today?.count || 0} {summary?.today?.count === 1 ? 'item' : 'items'} logged today
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
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

      {/* 3. RECENT TRANSACTIONS SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Your latest recorded expenses</p>
          </div>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View All</span>
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
            <p className="text-sm font-semibold text-slate-700">No expenses recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">Tap the button below to add your first transaction!</p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all"
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentExpenses.map((expense) => {
              const meta = getCategoryMeta(expense.category);
              return (
                <div
                  key={expense._id || expense.localId}
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
                    <p className="text-base font-extrabold text-slate-900">
                      -{formatCurrency(expense.amount)}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 cursor-pointer"
                      >
                        Edit
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={() => onDeleteExpense(expense._id || expense.localId)}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
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
