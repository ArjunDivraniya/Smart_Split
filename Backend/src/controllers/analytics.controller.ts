import { Response } from 'express';
import mongoose from 'mongoose';
import Budget from '../models/Budget.model';
import Expense from '../models/Expense.model';
import PersonalExpense from '../models/PersonalExpense.model';
import Trip from '../models/Trip.model';
import Settlement from '../models/Settlement.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Category to Emoji mapping
const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  accommodation: '🏨',
  entertainment: '🎬',
  shopping: '🛍️',
  groceries: '🛒',
  health: '💊',
  utilities: '💡',
  other: '📦',
};

const IST_OFFSET = 330; // 5 hours 30 minutes

const getIstMonthStart = (year: number, month: number) => {
  const date = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  date.setMinutes(date.getMinutes() - IST_OFFSET);
  return date;
};

const getIstNowStart = () => {
  const now = new Date();
  // Adjust now to its IST equivalent to get the correct current month Start
  const nowIst = new Date(now.getTime() + (IST_OFFSET * 60000));
  return getIstMonthStart(nowIst.getUTCFullYear(), nowIst.getUTCMonth() + 1);
};

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  food: 'Food & Drinks',
  transport: 'Transport',
  accommodation: 'Accommodation',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  groceries: 'Groceries',
  health: 'Health',
  utilities: 'Utilities',
  other: 'Other',
};

const normalizeCategory = (value: string | null | undefined): string => {
  const key = (value || 'other').trim().toLowerCase();

  if (!key) {
    return 'other';
  }

  if (key === 'food & drinks' || key === 'food and drinks') {
    return 'food';
  }

  return key;
};

const toDisplayCategory = (categoryKey: string): string => {
  const known = CATEGORY_DISPLAY_NAMES[categoryKey];
  if (known) {
    return known;
  }

  return categoryKey
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
};

const formatInr = (amount: number): string => `₹${Math.round(amount).toLocaleString('en-IN')}`;

const formatMonthLabel = (date: Date): string => {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  return `${month}'${year}`;
};

// Get monthly analytics for last 6 months (personal, group, combined)
export const getMonthlyAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const nowIst = new Date(new Date().getTime() + (IST_OFFSET * 60000));
    const currentIstMonth = nowIst.getUTCMonth() + 1;
    const currentIstYear = nowIst.getUTCFullYear();

    const months = Array.from({ length: 6 }, (_, index) => {
      // index 0-5. We want current month (index 5) and 5 months before.
      // Offset = -(5 - index)
      const monthStart = getIstMonthStart(currentIstYear, currentIstMonth - (5 - index));
      const nextMonthStart = new Date(monthStart.getTime());
      nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);

      return {
        monthStart,
        nextMonthStart,
        month: monthStart.getMonth() + 1, // This is UTC month, but for labeling we need IST month
        // Actually let's just use the month we passed in
        displayMonth: ((currentIstMonth - (5 - index) - 1 + 1200) % 12) + 1,
        displayYear: currentIstYear + Math.floor((currentIstMonth - (5 - index) - 1) / 12),
        label: formatMonthLabel(monthStart),
      };
    });

    const data = await Promise.all(
      months.map(async ({ monthStart, nextMonthStart, displayMonth, displayYear, label }) => {
        const [personalAgg, groupAgg] = await Promise.all([
          PersonalExpense.aggregate<{ total: number }>([
            {
              $match: {
                user: userObjectId,
                expenseDate: { $gte: monthStart, $lt: nextMonthStart },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ]),
          Expense.aggregate<{ total: number }>([
            {
              $match: {
                paidBy: userObjectId,
                date: { $gte: monthStart, $lt: nextMonthStart },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ]),
        ]);

        const personal = personalAgg[0]?.total ?? 0;
        const group = groupAgg[0]?.total ?? 0;

        return {
          label,
          month: displayMonth,
          year: displayYear,
          personal,
          group,
          total: personal + group,
        };
      })
    );

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('Get monthly analytics error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get group vs personal comparison for last 6 months
export const getGroupVsPersonalAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const currentMonthStart = getIstNowStart();

    const months = Array.from({ length: 6 }, (_, index) => {
      const monthStart = getIstMonthStart(currentMonthStart.getUTCFullYear(), currentMonthStart.getUTCMonth() + 1 - index);
      const nextMonthStart = new Date(monthStart.getTime());
      nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);

      return {
        monthStart,
        nextMonthStart,
        monthLabel: formatMonthLabel(monthStart),
      };
    });

    const data = await Promise.all(
      months.map(async ({ monthStart, nextMonthStart, monthLabel }) => {
        const [groupAgg, personalAgg] = await Promise.all([
          Expense.aggregate<{ total: number }>([
            {
              $match: {
                paidBy: userObjectId,
                date: { $gte: monthStart, $lt: nextMonthStart },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ]),
          PersonalExpense.aggregate<{ total: number }>([
            {
              $match: {
                user: userObjectId,
                expenseDate: { $gte: monthStart, $lt: nextMonthStart },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ]),
        ]);

        const group = Math.round(groupAgg[0]?.total ?? 0);
        const personal = Math.round(personalAgg[0]?.total ?? 0);

        return {
          month: monthLabel,
          group,
          personal,
        };
      })
    );

    const summaryTotals = data.reduce(
      (acc, item) => ({
        totalGroup: acc.totalGroup + item.group,
        totalPersonal: acc.totalPersonal + item.personal,
      }),
      { totalGroup: 0, totalPersonal: 0 }
    );

    const grandTotal = summaryTotals.totalGroup + summaryTotals.totalPersonal;

    const summary = {
      totalGroup: summaryTotals.totalGroup,
      totalPersonal: summaryTotals.totalPersonal,
      groupPercent: grandTotal > 0 ? Math.round((summaryTotals.totalGroup / grandTotal) * 100) : 0,
      personalPercent: grandTotal > 0 ? Math.round((summaryTotals.totalPersonal / grandTotal) * 100) : 0,
    };

    return res.status(200).json({
      data,
      summary,
    });
  } catch (error: any) {
    console.error('Get group vs personal analytics error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get top 5 friends user spends most with from group expenses
export const getFriendSpendingAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const expenses = await Expense.find({
      group: { $exists: true, $ne: null },
      splitBetween: userObjectId,
    })
      .select('amount splitBetween group')
      .populate('splitBetween', 'name profileImage')
      .populate('group', 'name');

    type FriendAggregate = {
      friendId: string;
      friendName: string;
      friendAvatar: string;
      totalShared: number;
      expenseCount: number;
      groups: Set<string>;
    };

    const friendsMap = new Map<string, FriendAggregate>();

    expenses.forEach((expense: any) => {
      const participants = Array.isArray(expense.splitBetween) ? expense.splitBetween : [];
      const participantCount = participants.length;

      if (participantCount <= 1) {
        return;
      }

      const sharedPerFriend = expense.amount / participantCount;
      const groupName = expense.group?.name || 'Unknown Group';

      participants.forEach((participant: any) => {
        const participantId = participant?._id?.toString?.();
        if (!participantId || participantId === userId) {
          return;
        }

        const existing = friendsMap.get(participantId) || {
          friendId: participantId,
          friendName: participant.name || 'Unknown Friend',
          friendAvatar: participant.profileImage || '',
          totalShared: 0,
          expenseCount: 0,
          groups: new Set<string>(),
        };

        existing.totalShared += sharedPerFriend;
        existing.expenseCount += 1;
        existing.groups.add(groupName);

        friendsMap.set(participantId, existing);
      });
    });

    const friends = Array.from(friendsMap.values())
      .map((friend) => ({
        friendId: friend.friendId,
        friendName: friend.friendName,
        friendAvatar: friend.friendAvatar,
        totalShared: Math.round(friend.totalShared),
        expenseCount: friend.expenseCount,
        groups: Array.from(friend.groups),
      }))
      .sort((a, b) => b.totalShared - a.totalShared)
      .slice(0, 5);

    return res.status(200).json({ friends });
  } catch (error: any) {
    console.error('Get friend spending analytics error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get category-wise spending breakdown for a specific month
export const getCategoryAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 1970 || year > 9999) {
      return res.status(400).json({
        message: 'Invalid query params. Please provide month (1-12) and year (YYYY).',
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const monthStart = getIstMonthStart(year, month);
    const nextMonthStart = new Date(monthStart.getTime());
    nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);

    const [personalAgg, groupAgg] = await Promise.all([
      PersonalExpense.aggregate<{ _id: string | null; total: number; count: number }>([
        {
          $match: {
            user: userObjectId,
            expenseDate: { $gte: monthStart, $lt: nextMonthStart },
          },
        },
        {
          $group: {
            _id: { $toLower: { $trim: { input: { $ifNull: ['$category', 'other'] } } } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Expense.aggregate<{ _id: string | null; total: number; count: number }>([
        {
          $match: {
            paidBy: userObjectId,
            date: { $gte: monthStart, $lt: nextMonthStart },
          },
        },
        {
          $group: {
            _id: { $toLower: { $trim: { input: { $ifNull: ['$category', 'other'] } } } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const categoryMap = new Map<string, { total: number; count: number }>();

    const mergeCategoryRows = (rows: Array<{ _id: string | null; total: number; count: number }>) => {
      rows.forEach((row) => {
        const categoryKey = normalizeCategory(row._id);
        const current = categoryMap.get(categoryKey) || { total: 0, count: 0 };

        categoryMap.set(categoryKey, {
          total: current.total + (row.total || 0),
          count: current.count + (row.count || 0),
        });
      });
    };

    mergeCategoryRows(personalAgg);
    mergeCategoryRows(groupAgg);

    const personalTotal = personalAgg.reduce((sum, row) => sum + (row.total || 0), 0);
    const groupTotal = groupAgg.reduce((sum, row) => sum + (row.total || 0), 0);
    const personalCount = personalAgg.reduce((sum, row) => sum + (row.count || 0), 0);
    const groupCount = groupAgg.reduce((sum, row) => sum + (row.count || 0), 0);

    const grandTotal = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.total, 0);

    const categories = Array.from(categoryMap.entries())
      .map(([categoryKey, values]) => ({
        category: toDisplayCategory(categoryKey),
        total: values.total,
        count: values.count,
        percentage: grandTotal > 0 ? Math.round((values.total / grandTotal) * 100) : 0,
        emoji: CATEGORY_EMOJIS[categoryKey] || CATEGORY_EMOJIS.other,
      }))
      .sort((a, b) => b.total - a.total);

    return res.status(200).json({
      success: true,
      grandTotal,
      totalPersonal: personalTotal,
      totalGroup: groupTotal,
      personalCount,
      groupCount,
      categories,
    });
  } catch (error: any) {
    console.error('Get category analytics error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get Analytics Data for a specific trip
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expenses = await Expense.find({ trip: id }).populate('paidBy', 'name');

    // Category Breakdown
    const categoryData: Record<string, number> = {};
    // Spending by Member
    const memberSpending: Record<string, number> = {};

    let totalSpent = 0;

    expenses.forEach((expense: any) => {
      // Category Sum
      const cat = expense.category || 'other';
      categoryData[cat] = (categoryData[cat] || 0) + expense.amount;

      // Member Sum
      const payerName = expense.paidBy.name;
      memberSpending[payerName] = (memberSpending[payerName] || 0) + expense.amount;

      totalSpent += expense.amount;
    });

    // Format for Recharts
    const pieData = Object.keys(categoryData).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: categoryData[key],
    }));

    const barData = Object.keys(memberSpending).map((key) => ({
      name: key.split(' ')[0], // First name only
      amount: memberSpending[key],
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalSpent,
        pieData,
        barData,
      },
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get Recent Activity - Last 10 expenses across all user's trips
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 1. Find all trips/groups where user is a member
    const userTrips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    }).select('_id');

    const tripIds = userTrips.map(trip => trip._id);

    // 2. Fetch last 10 items of each type
    const [groupExpenses, personalExpenses, settlements] = await Promise.all([
      Expense.find({ trip: { $in: tripIds } })
        .sort({ date: -1 })
        .limit(10)
        .populate('paidBy', 'name email')
        .populate('trip', 'name'),
      PersonalExpense.find({ user: userId })
        .sort({ expenseDate: -1 })
        .limit(10),
      Settlement.find({ $or: [{ fromUser: userId }, { toUser: userId }] })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('fromUser', 'name email')
        .populate('toUser', 'name email')
        .populate('group', 'name'),
    ]);

    // 3. Format into a unified activity feed
    const activities: any[] = [];

    // Format Group Expenses
    groupExpenses.forEach((exp: any) => {
      const isPaidByMe = exp.paidBy._id.toString() === userId;
      activities.push({
        id: exp._id.toString(),
        type: 'group',
        title: exp.title || 'Group Expense',
        description: `Paid by ${isPaidByMe ? 'You' : exp.paidBy.name} • ${exp.trip?.name || 'Group'}`,
        amount: exp.amount,
        date: exp.date,
        itemType: isPaidByMe ? 'paid' : 'owe',
        category: exp.category,
      });
    });

    // Format Personal Expenses
    personalExpenses.forEach((exp: any) => {
      activities.push({
        id: exp._id.toString(),
        type: 'personal',
        title: exp.description || 'Personal Expense',
        description: `Personal • ${exp.category}`,
        amount: exp.amount,
        date: exp.expenseDate,
        itemType: 'personal',
        category: exp.category,
      });
    });

    // Format Settlements
    settlements.forEach((set: any) => {
      const isFromMe = set.fromUser._id.toString() === userId;
      const otherUser = isFromMe ? set.toUser : set.fromUser;
      
      activities.push({
        id: set._id.toString(),
        type: 'settlement',
        title: `${set.fromUser.name} → ${set.toUser.name}`,
        description: `Settlement via ${set.method} ${set.group ? `• ${set.group.name}` : ''}`,
        amount: set.amount,
        date: set.createdAt,
        itemType: isFromMe ? 'paid' : 'received',
      });
    });

    // 4. Sort all by date descending and take top 10
    const finalActivities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: finalActivities,
    });
  } catch (error: any) {
    console.error('Get recent activity error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get Dashboard Insights - Top spending category
export const getDashboardInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const thisMonthStart = getIstNowStart();
    const nextMonthStart = new Date(thisMonthStart.getTime());
    nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);
    const lastMonthStart = new Date(thisMonthStart.getTime());
    lastMonthStart.setUTCMonth(lastMonthStart.getUTCMonth() - 1);

    const aggregateByCategory = async (startDate: Date, endDate: Date) => {
      const [personalAgg, groupAgg] = await Promise.all([
        PersonalExpense.aggregate<{ _id: string | null; total: number; count: number }>([
          {
            $match: {
              user: userObjectId,
              expenseDate: { $gte: startDate, $lt: endDate },
            },
          },
          {
            $group: {
              _id: { $toLower: { $trim: { input: { $ifNull: ['$category', 'other'] } } } },
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ]),
        Expense.aggregate<{ _id: string | null; total: number; count: number }>([
          {
            $match: {
              paidBy: userObjectId,
              date: { $gte: startDate, $lt: endDate },
            },
          },
          {
            $group: {
              _id: { $toLower: { $trim: { input: { $ifNull: ['$category', 'other'] } } } },
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const map = new Map<string, { total: number; count: number }>();

      const mergeRows = (rows: Array<{ _id: string | null; total: number; count: number }>) => {
        rows.forEach((row) => {
          const key = normalizeCategory(row._id);
          const current = map.get(key) || { total: 0, count: 0 };

          map.set(key, {
            total: current.total + (row.total || 0),
            count: current.count + (row.count || 0),
          });
        });
      };

      mergeRows(personalAgg);
      mergeRows(groupAgg);

      const total = Array.from(map.values()).reduce((sum, item) => sum + item.total, 0);

      return { map, total };
    };

    const [{ map: thisMonthMap, total: thisMonthTotalRaw }, { map: lastMonthMap, total: lastMonthTotalRaw }, budgets] = await Promise.all([
      aggregateByCategory(thisMonthStart, nextMonthStart),
      aggregateByCategory(lastMonthStart, thisMonthStart),
      Budget.find({
        user: userObjectId,
        month: thisMonthStart.getMonth() + 1,
        year: thisMonthStart.getFullYear(),
      }).select('category limit'),
    ]);

    const thisMonthTotal = Math.round(thisMonthTotalRaw);
    const lastMonthTotal = Math.round(lastMonthTotalRaw);

    const changePercent = lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : thisMonthTotal > 0
        ? 100
        : 0;

    const insights: Array<{ type: 'warning' | 'positive' | 'info'; icon: string; message: string; detail: string }> = [];

    if (lastMonthTotal > 0) {
      if (changePercent > 0) {
        insights.push({
          type: 'warning',
          icon: '📈',
          message: `Spending up ${changePercent}% vs last month`,
          detail: `${formatInr(thisMonthTotal)} this month vs ${formatInr(lastMonthTotal)} last month`,
        });
      } else if (changePercent < 0) {
        insights.push({
          type: 'positive',
          icon: '📉',
          message: `Spending down ${Math.abs(changePercent)}% vs last month`,
          detail: `${formatInr(thisMonthTotal)} this month vs ${formatInr(lastMonthTotal)} last month`,
        });
      }
    }

    const budgetOverages = budgets
      .map((budget) => {
        const categoryKey = normalizeCategory(budget.category);
        const spent = Math.round(thisMonthMap.get(categoryKey)?.total || 0);
        const limit = Math.round(budget.limit);
        const overBy = spent - limit;

        return {
          categoryKey,
          spent,
          limit,
          overBy,
        };
      })
      .filter((item) => item.overBy > 0)
      .sort((a, b) => b.overBy - a.overBy);

    budgetOverages.slice(0, 2).forEach((item) => {
      insights.push({
        type: 'warning',
        icon: '🚨',
        message: `${toDisplayCategory(item.categoryKey)} over budget by ${formatInr(item.overBy)}`,
        detail: `Spent ${formatInr(item.spent)} vs budget ${formatInr(item.limit)}`,
      });
    });

    const categoryKeys = new Set<string>([...thisMonthMap.keys(), ...lastMonthMap.keys()]);
    let biggestIncrease: { key: string; diff: number } | null = null;
    let biggestDecrease: { key: string; diff: number } | null = null;

    for (const key of categoryKeys) {
      const thisAmount = thisMonthMap.get(key)?.total || 0;
      const lastAmount = lastMonthMap.get(key)?.total || 0;
      const diff = Math.round(thisAmount - lastAmount);

      if (diff > 0 && (!biggestIncrease || diff > biggestIncrease.diff)) {
        biggestIncrease = { key, diff };
      }

      if (diff < 0 && (!biggestDecrease || diff < biggestDecrease.diff)) {
        biggestDecrease = { key, diff };
      }
    }

    if (biggestDecrease) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        message: `${toDisplayCategory(biggestDecrease.key)} spending down ${formatInr(Math.abs(biggestDecrease.diff))}`,
        detail: 'Great job keeping costs low',
      });
    } else if (biggestIncrease) {
      const thisAmount = Math.round(thisMonthMap.get(biggestIncrease.key)?.total || 0);
      const lastAmount = Math.round(lastMonthMap.get(biggestIncrease.key)?.total || 0);

      insights.push({
        type: 'warning',
        icon: '⚠️',
        message: `${toDisplayCategory(biggestIncrease.key)} spending up ${formatInr(biggestIncrease.diff)}`,
        detail: `${formatInr(thisAmount)} this month vs ${formatInr(lastAmount)} last month`,
      });
    }

    let topCategoryKey = 'other';
    let topCategoryAmount = 0;

    thisMonthMap.forEach((value, key) => {
      if (value.total > topCategoryAmount) {
        topCategoryAmount = value.total;
        topCategoryKey = key;
      }
    });

    const topCategoryName = toDisplayCategory(topCategoryKey);
    const topCategoryPercent = thisMonthTotal > 0 ? Math.round((topCategoryAmount / thisMonthTotal) * 100) : 0;

    if (thisMonthTotal > 0) {
      insights.push({
        type: 'info',
        icon: CATEGORY_EMOJIS[topCategoryKey] || CATEGORY_EMOJIS.other,
        message: `${topCategoryName} is your top category`,
        detail: `${formatInr(topCategoryAmount)} spent · ${topCategoryPercent}% of total`,
      });
    }

    return res.status(200).json({
      insights,
      thisMonthTotal,
      lastMonthTotal,
      changePercent,
      topCategory: topCategoryName,
    });
  } catch (error: any) {
    console.error('Get dashboard insights error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get Dashboard Summary - Financial overview and smart alerts
export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find all trips where user is a member or creator
    const userTrips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    }).select('_id name status');

    const tripIds = userTrips.map(trip => trip._id);

    // Get all expenses from user's trips
    const expenses = await Expense.find({ trip: { $in: tripIds } })
      .populate('paidBy', '_id name');

    // Calculate financial summary
    let totalOwe = 0;
    let totalGet = 0;
    let monthlySpend = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    expenses.forEach((expense: any) => {
      const isPaidByUser = expense.paidBy._id.toString() === userId;
      const expenseDate = new Date(expense.date);
      
      // Calculate monthly spend
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        if (isPaidByUser) {
          monthlySpend += expense.amount;
        }
      }

      // Calculate owe/get (simplified - assuming equal splits)
      if (expense.splitBetween && expense.splitBetween.length > 0) {
        const splitAmount = expense.amount / expense.splitBetween.length;
        
        if (isPaidByUser) {
          // User paid, so others owe them
          totalGet += expense.amount - splitAmount;
        } else {
          // Someone else paid, user owes them
          const userInSplit = expense.splitBetween.some(
            (memberId: any) => memberId.toString() === userId
          );
          if (userInSplit) {
            totalOwe += splitAmount;
          }
        }
      }
    });

    // Generate smart alert
    let smartAlert = null;

    if (totalOwe > 0) {
      smartAlert = {
        type: 'warning',
        icon: '⚠️',
        message: `You have ₹${totalOwe.toLocaleString('en-IN')} pending settlements.`,
        borderColor: '#FF5F7E',
      };
    } else if (monthlySpend > 10000) {
      smartAlert = {
        type: 'info',
        icon: '💰',
        message: `You've spent ₹${monthlySpend.toLocaleString('en-IN')} this month!`,
        borderColor: '#FFB547',
      };
    } else if (userTrips.length === 0) {
      smartAlert = {
        type: 'info',
        icon: '🎯',
        message: 'Create your first trip to start tracking expenses!',
        borderColor: '#7C5CFC',
      };
    } else if (totalGet > 0) {
      smartAlert = {
        type: 'success',
        icon: '🎉',
        message: `Great! People owe you ₹${totalGet.toLocaleString('en-IN')}!`,
        borderColor: '#00E5B0',
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        financial: {
          totalOwe: Math.round(totalOwe),
          totalGet: Math.round(totalGet),
          monthlySpend: Math.round(monthlySpend),
        },
        smartAlert,
        tripCount: userTrips.length,
        activeTrips: userTrips.filter(trip => trip.status === 'active').length,
      },
    });
  } catch (error: any) {
    console.error('Get dashboard summary error:', error);
    return res.status(500).json({ message: error.message });
  }
};
