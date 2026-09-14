import { Expense } from '../models/Expense.js';
import { getTimezone, parseDateRange } from '../utils/dateUtils.js';

// @desc    Create new expense for authenticated user
// @route   POST /api/expenses
export const createExpense = async (req, res, next) => {
  try {
    const { amount, category, paymentMode, onlineSubType, note, date } = req.body;

    const expenseData = {
      user: req.user._id,
      amount: Number(amount),
      category: category?.trim(),
      paymentMode,
      note: note ? note.trim() : '',
      date: date ? new Date(date) : new Date()
    };

    if (paymentMode === 'online') {
      expenseData.onlineSubType = onlineSubType;
    } else {
      expenseData.onlineSubType = undefined;
    }

    const expense = await Expense.create(expenseData);

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for authenticated user with filters and search
// @route   GET /api/expenses
export const getExpenses = async (req, res, next) => {
  try {
    const { startDate, endDate, category, paymentMode, onlineSubType, search, limit, page } = req.query;
    const tz = getTimezone(req);

    const query = {
      user: req.user._id
    };

    // Date range filter
    const dateRange = parseDateRange(startDate, endDate, tz);
    if (dateRange) {
      query.date = dateRange;
    }

    // Category filter
    if (category) {
      if (category.includes(',')) {
        query.category = { $in: category.split(',').map((c) => c.trim()) };
      } else {
        query.category = category.trim();
      }
    }

    // Payment mode filter
    if (paymentMode && ['cash', 'online'].includes(paymentMode)) {
      query.paymentMode = paymentMode;
    }

    // Online sub-type filter
    if (onlineSubType && ['UPI', 'card', 'wallet'].includes(onlineSubType)) {
      query.onlineSubType = onlineSubType;
    }

    // Search filter across note and category (case-insensitive)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ note: searchRegex }, { category: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 0; // 0 = no limit

    let queryBuilder = Expense.find(query).sort({ date: -1, createdAt: -1 });

    if (limitNum > 0) {
      queryBuilder = queryBuilder.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const [expenses, totalCount] = await Promise.all([
      queryBuilder.exec(),
      Expense.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      count: expenses.length,
      totalCount,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID for authenticated user
// @route   GET /api/expenses/:id
export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: `Expense not found with ID ${req.params.id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing expense for authenticated user
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res, next) => {
  try {
    const { amount, category, paymentMode, onlineSubType, note, date } = req.body;

    const existingExpense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: `Expense not found with ID ${req.params.id}`
      });
    }

    const updatePayload = {};
    if (amount !== undefined) updatePayload.amount = Number(amount);
    if (category !== undefined) updatePayload.category = category.trim();
    if (paymentMode !== undefined) updatePayload.paymentMode = paymentMode;
    if (note !== undefined) updatePayload.note = note ? note.trim() : '';
    if (date !== undefined) updatePayload.date = new Date(date);

    const activePaymentMode = paymentMode || existingExpense.paymentMode;
    if (activePaymentMode === 'online') {
      if (onlineSubType !== undefined) {
        updatePayload.onlineSubType = onlineSubType;
      }
    } else {
      updatePayload.onlineSubType = undefined;
      updatePayload.$unset = { onlineSubType: 1 };
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense for authenticated user
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: `Expense not found with ID ${req.params.id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};
