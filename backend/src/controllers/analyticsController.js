import mongoose from 'mongoose';
import { Expense } from '../models/Expense.js';
import { getTimezone, getPeriodBoundaries, parseDateRange } from '../utils/dateUtils.js';

// @desc    Get dashboard summary metrics for authenticated user
// @route   GET /api/analytics/summary
export const getSummary = async (req, res, next) => {
  try {
    const tz = getTimezone(req);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();

    const todayBoundaries = getPeriodBoundaries('today', tz, now);
    const weekBoundaries = getPeriodBoundaries('week', tz, now);
    const monthBoundaries = getPeriodBoundaries('month', tz, now);
    const yearBoundaries = getPeriodBoundaries('year', tz, now);

    const [todayAgg, weekAgg, monthAgg, yearAgg, totalAgg] = await Promise.all([
      // Today
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: todayBoundaries.start, $lte: todayBoundaries.end } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      // This Week (ISO Monday-Sunday)
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: weekBoundaries.start, $lte: weekBoundaries.end } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      // This Month
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: monthBoundaries.start, $lte: monthBoundaries.end } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      // This Year
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: yearBoundaries.start, $lte: yearBoundaries.end } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      // All Time
      Expense.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    return res.status(200).json({
      success: true,
      data: {
        timezone: tz,
        today: {
          total: todayAgg[0]?.total || 0,
          count: todayAgg[0]?.count || 0,
          range: { start: todayBoundaries.formattedStart, end: todayBoundaries.formattedEnd }
        },
        thisWeek: {
          total: weekAgg[0]?.total || 0,
          count: weekAgg[0]?.count || 0,
          range: { start: weekBoundaries.formattedStart, end: weekBoundaries.formattedEnd }
        },
        thisMonth: {
          total: monthAgg[0]?.total || 0,
          count: monthAgg[0]?.count || 0,
          range: { start: monthBoundaries.formattedStart, end: monthBoundaries.formattedEnd }
        },
        thisYear: {
          total: yearAgg[0]?.total || 0,
          count: yearAgg[0]?.count || 0,
          range: { start: yearBoundaries.formattedStart, end: yearBoundaries.formattedEnd }
        },
        allTime: {
          total: totalAgg[0]?.total || 0,
          count: totalAgg[0]?.count || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get time-series trends (weekly, monthly, yearly) for authenticated user
// @route   GET /api/analytics/trends
export const getTrends = async (req, res, next) => {
  try {
    const tz = getTimezone(req);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { period = 'monthly', startDate, endDate } = req.query;

    const matchStage = {
      user: userId
    };

    const dateRange = parseDateRange(startDate, endDate, tz);
    if (dateRange) {
      matchStage.date = dateRange;
    }

    let groupIdExpr;
    let sortStage = { '_id': 1 };

    if (period === 'weekly') {
      groupIdExpr = {
        $dateToString: {
          format: '%G-W%V',
          date: '$date',
          timezone: tz
        }
      };
    } else if (period === 'yearly') {
      groupIdExpr = {
        $dateToString: {
          format: '%Y',
          date: '$date',
          timezone: tz
        }
      };
    } else {
      groupIdExpr = {
        $dateToString: {
          format: '%Y-%m',
          date: '$date',
          timezone: tz
        }
      };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: groupIdExpr,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          cashAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentMode', 'cash'] }, '$amount', 0]
            }
          },
          onlineAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentMode', 'online'] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: sortStage },
      {
        $project: {
          _id: 0,
          period: '$_id',
          totalAmount: { $round: ['$totalAmount', 2] },
          count: 1,
          cashAmount: { $round: ['$cashAmount', 2] },
          onlineAmount: { $round: ['$onlineAmount', 2] }
        }
      }
    ];

    const trends = await Expense.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      period,
      timezone: tz,
      count: trends.length,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise expense breakdown for authenticated user
// @route   GET /api/analytics/categories
export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const tz = getTimezone(req);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { startDate, endDate, paymentMode } = req.query;

    const matchStage = {
      user: userId
    };

    const dateRange = parseDateRange(startDate, endDate, tz);
    if (dateRange) {
      matchStage.date = dateRange;
    }
    if (paymentMode && ['cash', 'online'].includes(paymentMode)) {
      matchStage.paymentMode = paymentMode;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ];

    const categoryStats = await Expense.aggregate(pipeline);
    const grandTotal = categoryStats.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const formattedData = categoryStats.map((item) => ({
      category: item._id,
      totalAmount: Math.round(item.totalAmount * 100) / 100,
      count: item.count,
      percentage: grandTotal > 0 ? Math.round((item.totalAmount / grandTotal) * 10000) / 100 : 0
    }));

    return res.status(200).json({
      success: true,
      grandTotal: Math.round(grandTotal * 100) / 100,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cash vs online split for authenticated user
// @route   GET /api/analytics/payment-modes
export const getPaymentModeSplit = async (req, res, next) => {
  try {
    const tz = getTimezone(req);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { startDate, endDate, category } = req.query;

    const matchStage = {
      user: userId
    };

    const dateRange = parseDateRange(startDate, endDate, tz);
    if (dateRange) {
      matchStage.date = dateRange;
    }
    if (category) {
      matchStage.category = category.trim();
    }

    const [modeStats, subTypeStats] = await Promise.all([
      Expense.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$paymentMode',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Expense.aggregate([
        {
          $match: {
            ...matchStage,
            paymentMode: 'online'
          }
        },
        {
          $group: {
            _id: '$onlineSubType',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } }
      ])
    ]);

    const grandTotal = modeStats.reduce((acc, curr) => acc + curr.totalAmount, 0);

    let cashTotal = 0;
    let cashCount = 0;
    let onlineTotal = 0;
    let onlineCount = 0;

    modeStats.forEach((item) => {
      if (item._id === 'cash') {
        cashTotal = item.totalAmount;
        cashCount = item.count;
      } else if (item._id === 'online') {
        onlineTotal = item.totalAmount;
        onlineCount = item.count;
      }
    });

    const onlineSubTypesFormatted = subTypeStats.map((item) => ({
      subType: item._id || 'unspecified',
      totalAmount: Math.round(item.totalAmount * 100) / 100,
      count: item.count,
      percentage: onlineTotal > 0 ? Math.round((item.totalAmount / onlineTotal) * 10000) / 100 : 0
    }));

    return res.status(200).json({
      success: true,
      grandTotal: Math.round(grandTotal * 100) / 100,
      split: [
        {
          mode: 'cash',
          totalAmount: Math.round(cashTotal * 100) / 100,
          count: cashCount,
          percentage: grandTotal > 0 ? Math.round((cashTotal / grandTotal) * 10000) / 100 : 0
        },
        {
          mode: 'online',
          totalAmount: Math.round(onlineTotal * 100) / 100,
          count: onlineCount,
          percentage: grandTotal > 0 ? Math.round((onlineTotal / grandTotal) * 10000) / 100 : 0
        }
      ],
      onlineSubTypes: onlineSubTypesFormatted
    });
  } catch (error) {
    next(error);
  }
};
