import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, CreditCard, Banknote, Calendar, Tag, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { getCategoryMeta } from '../constants/categories';

export const AnalyticsView = () => {
  const [period, setPeriod] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trendsRes, catRes, paymentRes] = await Promise.all([
        api.getTrends(period),
        api.getCategoryBreakdown(),
        api.getPaymentSplit(),
      ]);

      setTrends(trendsRes.data || []);
      setCategoryData(catRes.data || []);
      setPaymentData(paymentRes || null);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const formatCurrency = (val = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const PAYMENT_COLORS = {
    cash: '#10b981', // emerald
    online: '#3b82f6', // blue
  };

  const SUBTYPE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-slate-700/50 text-xs space-y-1.5 min-w-[140px]">
          <p className="font-bold text-slate-300 border-b border-slate-700/60 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-bold">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Spending Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize financial trends, category allocations, and payment mode breakdowns
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
          {[
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                period === tab.id
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-80 bg-white rounded-3xl border border-slate-100 p-6 animate-pulse flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72 bg-white rounded-3xl border border-slate-100 p-6 animate-pulse"></div>
            <div className="h-72 bg-white rounded-3xl border border-slate-100 p-6 animate-pulse"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-700 p-6 rounded-3xl border border-rose-200 text-center">
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-3 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Chart 1: Totals Over Time (Bar Chart) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Spending Trends Over Time</h3>
                  <p className="text-xs text-slate-400 capitalize">{period} expenditure timeline</p>
                </div>
              </div>
            </div>

            {trends.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Calendar className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                <p className="text-xs font-medium">No trend data available for this range</p>
              </div>
            ) : (
              <div className="h-72 sm:h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                    />
                    <Bar
                      dataKey="cashAmount"
                      name="Cash"
                      fill="#10b981"
                      stackId="a"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="onlineAmount"
                      name="Online"
                      fill="#3b82f6"
                      stackId="a"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Grid of Pie Charts (Category Breakdown & Payment Mode Split) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Chart 2: Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Category Breakdown</h3>
                  <p className="text-xs text-slate-400">Spending distribution across categories</p>
                </div>
              </div>

              {categoryData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <PieIcon className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                  <p className="text-xs font-medium">No category data recorded</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="totalAmount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {categoryData.map((entry) => {
                            const meta = getCategoryMeta(entry.category);
                            return <Cell key={entry.category} fill={meta.color} />;
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [formatCurrency(value), 'Total']}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '16px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Progress List */}
                  <div className="space-y-3">
                    {categoryData.map((item) => {
                      const meta = getCategoryMeta(item.category);
                      return (
                        <div key={item.category} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="flex items-center gap-2 text-slate-700">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: meta.color }}
                              ></span>
                              {item.category}
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatCurrency(item.totalAmount)} ({item.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: meta.color,
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chart 3: Cash vs Online Payment Split */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cash vs Online Split</h3>
                  <p className="text-xs text-slate-400">Payment method share & online subtypes</p>
                </div>
              </div>

              {!paymentData || paymentData.split?.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <CreditCard className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                  <p className="text-xs font-medium">No payment mode data available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentData.split}
                          dataKey="totalAmount"
                          nameKey="mode"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                        >
                          {paymentData.split.map((entry) => (
                            <Cell
                              key={entry.mode}
                              fill={PAYMENT_COLORS[entry.mode] || '#64748b'}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [formatCurrency(value), 'Total']}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '16px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Split Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {paymentData.split.map((item) => {
                      const isCash = item.mode === 'cash';
                      return (
                        <div
                          key={item.mode}
                          className={`p-4 rounded-2xl border ${
                            isCash
                              ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                              : 'bg-blue-50/50 border-blue-100 text-blue-950'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {isCash ? (
                              <Banknote className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <CreditCard className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="text-xs font-bold capitalize">{item.mode}</span>
                          </div>
                          <p className="text-lg font-extrabold">{formatCurrency(item.totalAmount)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.percentage}% ({item.count} txns)
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Online Subtypes Breakdown (UPI, Card, Wallet) */}
                  {paymentData.onlineSubTypes?.length > 0 && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Online Method Breakdown
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {paymentData.onlineSubTypes.map((sub, idx) => (
                          <div key={sub.subType} className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase">{sub.subType}</p>
                            <p className="text-xs font-bold text-slate-900 mt-0.5">{formatCurrency(sub.totalAmount)}</p>
                            <p className="text-[10px] text-slate-400">{sub.percentage}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
