import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ExpenseListView } from './components/ExpenseListView';
import { AnalyticsView } from './components/AnalyticsView';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { Toast } from './components/Toast';
import { api } from './services/api';

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [toast, setToast] = useState(null);

  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    paymentMode: '',
    search: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch Dashboard Summary
  const loadSummary = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getSummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  }, [isAuthenticated]);

  // Fetch Expenses with active filters
  const loadExpenses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getExpenses(filters);
      setExpenses(res.data || []);
    } catch (err) {
      console.error('Failed to load expenses:', err);
      showToast(err.message || 'Failed to fetch expenses', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSummary();
    }
  }, [loadSummary, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadExpenses();
    }
  }, [loadExpenses, isAuthenticated]);

  // Open Modal for Create
  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (payload, id) => {
    try {
      if (id) {
        await api.updateExpense(id, payload);
        showToast('Expense updated successfully!');
      } else {
        await api.createExpense(payload);
        showToast('Expense recorded successfully!');
      }

      await Promise.all([loadSummary(), loadExpenses()]);
    } catch (err) {
      throw err;
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) {
      return;
    }

    try {
      await api.deleteExpense(id);
      showToast('Expense deleted successfully', 'info');
      await Promise.all([loadSummary(), loadExpenses()]);
    } catch (err) {
      showToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      paymentMode: '',
      search: '',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-20 md:pb-12">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            recentExpenses={expenses.slice(0, 5)}
            loading={loading}
            onOpenAddModal={handleOpenAddModal}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseListView
            expenses={expenses}
            loading={loading}
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
            onOpenAddModal={handleOpenAddModal}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Modal for Add / Edit */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingExpense}
      />

      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
