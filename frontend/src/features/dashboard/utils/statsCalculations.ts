import { 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  startOfQuarter, 
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  parseISO,
  isWithinInterval,
  differenceInDays
} from 'date-fns';
import type { 
  UserStats, 
  StatsCalculation, 
  StatsTrend, 
  StatsHistory, 
  TimePeriod 
} from '../types/stats';
import type { Activity } from '../types/activity';

/**
 * Core statistics calculation functions
 */
export const statsCalculations = {
  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  },

  /**
   * Calculate trend direction based on change percentage
   */
  calculateTrend: (changePercentage: number, threshold: number = 5): 'up' | 'down' | 'stable' => {
    if (Math.abs(changePercentage) < threshold) {
      return 'stable';
    }
    return changePercentage > 0 ? 'up' : 'down';
  },

  /**
   * Calculate stats comparison between current and previous periods
   */
  calculateStatsComparison: (current: number, previous: number): StatsCalculation => {
    const change = current - previous;
    const changePercentage = statsCalculations.calculatePercentageChange(current, previous);
    const trend = statsCalculations.calculateTrend(changePercentage);

    return {
      current,
      previous,
      change,
      changePercentage,
      trend
    };
  },

  /**
   * Calculate moving average for trend analysis
   */
  calculateMovingAverage: (values: number[], windowSize: number = 7): number[] => {
    if (values.length < windowSize) {
      return values;
    }

    const result: number[] = [];
    for (let i = windowSize - 1; i < values.length; i++) {
      const window = values.slice(i - windowSize + 1, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
      result.push(Math.round(average * 100) / 100); // Round to 2 decimal places
    }
    return result;
  },

  /**
   * Calculate growth rate over a period
   */
  calculateGrowthRate: (startValue: number, endValue: number, periods: number): number => {
    if (startValue === 0 || periods === 0) {
      return 0;
    }
    return Math.pow(endValue / startValue, 1 / periods) - 1;
  }
};

/**
 * Time period utilities for stats calculations
 */
export const timePeriodHelpers = {
  /**
   * Get date range for a specific time period
   */
  getDateRange: (period: TimePeriod, date: Date = new Date()): { start: Date; end: Date } => {
    switch (period) {
      case 'day':
        return {
          start: startOfDay(date),
          end: endOfDay(date)
        };
      case 'week':
        return {
          start: startOfWeek(date, { weekStartsOn: 1 }), // Monday start
          end: endOfWeek(date, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
      case 'quarter':
        return {
          start: startOfQuarter(date),
          end: endOfQuarter(date)
        };
      case 'year':
        return {
          start: startOfYear(date),
          end: endOfYear(date)
        };
      default:
        return {
          start: startOfDay(date),
          end: endOfDay(date)
        };
    }
  },

  /**
   * Get previous period date range
   */
  getPreviousDateRange: (period: TimePeriod, date: Date = new Date()): { start: Date; end: Date } => {
    let previousDate: Date;
    
    switch (period) {
      case 'day':
        previousDate = subDays(date, 1);
        break;
      case 'week':
        previousDate = subWeeks(date, 1);
        break;
      case 'month':
        previousDate = subMonths(date, 1);
        break;
      case 'quarter':
        previousDate = subQuarters(date, 1);
        break;
      case 'year':
        previousDate = subYears(date, 1);
        break;
      default:
        previousDate = subDays(date, 1);
    }

    return timePeriodHelpers.getDateRange(period, previousDate);
  },

  /**
   * Generate date intervals for historical data
   */
  generateDateIntervals: (period: TimePeriod, count: number, endDate: Date = new Date()): Date[] => {
    const intervals: Date[] = [];
    let currentDate = endDate;

    for (let i = 0; i < count; i++) {
      intervals.unshift(new Date(currentDate));
      
      switch (period) {
        case 'day':
          currentDate = subDays(currentDate, 1);
          break;
        case 'week':
          currentDate = subWeeks(currentDate, 1);
          break;
        case 'month':
          currentDate = subMonths(currentDate, 1);
          break;
        case 'quarter':
          currentDate = subQuarters(currentDate, 1);
          break;
        case 'year':
          currentDate = subYears(currentDate, 1);
          break;
      }
    }

    return intervals;
  }
};

/**
 * Activity-based statistics calculations
 */
export const activityStats = {
  /**
   * Count activities within a date range
   */
  countActivitiesInRange: (
    activities: Activity[], 
    startDate: Date, 
    endDate: Date
  ): number => {
    return activities.filter(activity => {
      const activityDate = parseISO(activity.timestamp);
      return isWithinInterval(activityDate, { start: startDate, end: endDate });
    }).length;
  },

  /**
   * Count activities by type within a date range
   */
  countActivitiesByType: (
    activities: Activity[], 
    type: string, 
    startDate: Date, 
    endDate: Date
  ): number => {
    return activities.filter(activity => {
      const activityDate = parseISO(activity.timestamp);
      return activity.type === type && 
             isWithinInterval(activityDate, { start: startDate, end: endDate });
    }).length;
  },

  /**
   * Calculate activity frequency (activities per day)
   */
  calculateActivityFrequency: (activities: Activity[], days: number = 30): number => {
    if (activities.length === 0 || days === 0) return 0;
    
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    const activitiesInPeriod = activityStats.countActivitiesInRange(activities, startDate, endDate);
    
    return Math.round((activitiesInPeriod / days) * 100) / 100;
  },

  /**
   * Get most active day of the week
   */
  getMostActiveDay: (activities: Activity[]): { day: string; count: number } => {
    const dayCount: Record<string, number> = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
      'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };

    activities.forEach(activity => {
      const date = parseISO(activity.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayCount[dayName]++;
    });

    const mostActiveDay = Object.entries(dayCount).reduce((max, [day, count]) => 
      count > max.count ? { day, count } : max, 
      { day: 'Sunday', count: 0 }
    );

    return mostActiveDay;
  }
};

/**
 * Trend analysis utilities
 */
export const trendAnalysis = {
  /**
   * Calculate trend for a specific metric over time
   */
  calculateMetricTrend: (
    activities: Activity[], 
    _metric: string, 
    period: TimePeriod = 'week',
    periods: number = 4
  ): StatsTrend[] => {
    const intervals = timePeriodHelpers.generateDateIntervals(period, periods);
    const trends: StatsTrend[] = [];

    for (let i = 0; i < intervals.length; i++) {
      const { start, end } = timePeriodHelpers.getDateRange(period, intervals[i]);
      const value = activityStats.countActivitiesInRange(activities, start, end);
      
      let change = 0;
      let changeType: 'increase' | 'decrease' | 'stable' = 'stable';
      
      if (i > 0) {
        const previousValue = trends[i - 1].value;
        change = value - previousValue;
        changeType = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable';
      }

      trends.push({
        period: start.toISOString(),
        value,
        change,
        changeType
      });
    }

    return trends;
  },

  /**
   * Detect seasonal patterns in activity data
   */
  detectSeasonalPatterns: (activities: Activity[]): Record<string, number> => {
    const monthlyActivity: Record<string, number> = {};
    
    activities.forEach(activity => {
      const date = parseISO(activity.timestamp);
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
    });

    return monthlyActivity;
  },

  /**
   * Calculate correlation between two metrics
   */
  calculateCorrelation: (values1: number[], values2: number[]): number => {
    if (values1.length !== values2.length || values1.length === 0) {
      return 0;
    }

    const n = values1.length;
    const sum1 = values1.reduce((a, b) => a + b, 0);
    const sum2 = values2.reduce((a, b) => a + b, 0);
    const sum1Sq = values1.reduce((a, b) => a + b * b, 0);
    const sum2Sq = values2.reduce((a, b) => a + b * b, 0);
    const pSum = values1.reduce((acc, val, i) => acc + val * values2[i], 0);

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    return den === 0 ? 0 : num / den;
  }
};

/**
 * Data aggregation utilities
 */
export const dataAggregation = {
  /**
   * Aggregate data by time period
   */
  aggregateByPeriod: (
    data: Array<{ date: string; value: number }>, 
    period: TimePeriod
  ): Array<{ date: string; value: number }> => {
    const aggregated: Record<string, number> = {};

    data.forEach(item => {
      const date = parseISO(item.date);
      const { start } = timePeriodHelpers.getDateRange(period, date);
      const key = start.toISOString();
      
      aggregated[key] = (aggregated[key] || 0) + item.value;
    });

    return Object.entries(aggregated)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  /**
   * Calculate percentiles for a dataset
   */
  calculatePercentiles: (values: number[]): Record<string, number> => {
    if (values.length === 0) {
      return { p25: 0, p50: 0, p75: 0, p90: 0, p95: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[Math.max(0, index)];
    };

    return {
      p25: getPercentile(25),
      p50: getPercentile(50), // median
      p75: getPercentile(75),
      p90: getPercentile(90),
      p95: getPercentile(95)
    };
  },

  /**
   * Calculate summary statistics
   */
  calculateSummaryStats: (values: number[]): {
    count: number;
    sum: number;
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
  } => {
    if (values.length === 0) {
      return { count: 0, sum: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
    }

    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const sorted = [...values].sort((a, b) => a - b);
    const median = count % 2 === 0 
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return {
      count,
      sum: Math.round(sum * 100) / 100,
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      min,
      max,
      stdDev: Math.round(stdDev * 100) / 100
    };
  }
};

/**
 * Formatting utilities for calculated statistics
 */
export const statsFormatting = {
  /**
   * Format trend change for display
   */
  formatTrendChange: (change: number, changePercentage: number): string => {
    const sign = change >= 0 ? '+' : '';
    const percentage = Math.abs(changePercentage);
    
    if (percentage < 0.1) {
      return 'No change';
    }
    
    return `${sign}${change} (${sign}${percentage.toFixed(1)}%)`;
  },

  /**
   * Format large numbers with appropriate units
   */
  formatStatValue: (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  },

  /**
   * Format duration in human-readable format
   */
  formatDuration: (days: number): string => {
    if (days < 1) {
      return 'Less than a day';
    }
    if (days < 7) {
      return `${Math.floor(days)} day${days !== 1 ? 's' : ''}`;
    }
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
};

/**
 * Main stats calculation orchestrator
 */
export const calculateDashboardStats = {
  /**
   * Calculate comprehensive stats for a user
   */
  calculateUserStats: (
    activities: Activity[], 
    period: TimePeriod = 'month'
  ): Partial<UserStats> => {
    const trends = trendAnalysis.calculateMetricTrend(activities, 'total', period, 6);
    const accountAge = activities.length > 0 
      ? differenceInDays(new Date(), parseISO(activities[0].timestamp))
      : 0;

    return {
      overall: {
        totalActions: activities.length,
        accountAge,
        lastLogin: activities.length > 0 ? activities[0].timestamp : new Date().toISOString(),
        profileCompletion: 85 // This would be calculated based on actual profile data
      },
      trends,
      lastUpdated: new Date().toISOString()
    };
  },

  /**
   * Generate historical stats data
   */
  generateStatsHistory: (
    activities: Activity[], 
    period: TimePeriod, 
    count: number = 12
  ): StatsHistory => {
    const intervals = timePeriodHelpers.generateDateIntervals(period, count);
    const data = intervals.map(date => {
      const { start, end } = timePeriodHelpers.getDateRange(period, date);
      const value = activityStats.countActivitiesInRange(activities, start, end);
      
      return {
        date: start.toISOString(),
        value
      };
    });

    return {
      period,
      data
    };
  }
};