const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getClientTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem('expense_tracker_token');
  } catch {
    return null;
  }
};

const request = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;
  const tz = getClientTimezone();
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    'x-timezone': tz,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If token is invalid or expired, trigger logout event
    if (response.status === 401 && token && !path.includes('/auth/login') && !path.includes('/auth/signup')) {
      localStorage.removeItem('expense_tracker_token');
      localStorage.removeItem('expense_tracker_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const errorMsg = data.errors?.join(', ') || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  // Auth API
  signup: (userData) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request('/api/auth/me'),

  // Expenses CRUD
  getExpenses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.category) query.append('category', params.category);
    if (params.paymentMode) query.append('paymentMode', params.paymentMode);
    if (params.onlineSubType) query.append('onlineSubType', params.onlineSubType);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    
    query.append('timezone', getClientTimezone());

    const queryString = query.toString();
    return request(`/api/expenses${queryString ? `?${queryString}` : ''}`);
  },

  getExpenseById: (id) => request(`/api/expenses/${id}`),

  createExpense: (expenseData) =>
    request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    }),

  updateExpense: (id, expenseData) =>
    request(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    }),

  deleteExpense: (id) =>
    request(`/api/expenses/${id}`, {
      method: 'DELETE',
    }),

  // Analytics
  getSummary: () => {
    const tz = getClientTimezone();
    return request(`/api/analytics/summary?timezone=${encodeURIComponent(tz)}`);
  },

  getTrends: (period = 'monthly', startDate, endDate) => {
    const query = new URLSearchParams({
      period,
      timezone: getClientTimezone(),
    });
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    return request(`/api/analytics/trends?${query.toString()}`);
  },

  getCategoryBreakdown: (startDate, endDate, paymentMode) => {
    const query = new URLSearchParams({
      timezone: getClientTimezone(),
    });
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    if (paymentMode) query.append('paymentMode', paymentMode);
    return request(`/api/analytics/categories?${query.toString()}`);
  },

  getPaymentSplit: (startDate, endDate, category) => {
    const query = new URLSearchParams({
      timezone: getClientTimezone(),
    });
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    if (category) query.append('category', category);
    return request(`/api/analytics/payment-modes?${query.toString()}`);
  },
};
