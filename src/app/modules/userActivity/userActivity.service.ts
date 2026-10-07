import { UserActivity } from './userActivity.model';

const recordTodayActivity = async (
  userId: string,
  activityType = 'general_activity'
): Promise<void> => {
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    await UserActivity.updateOne(
      { user: userId, activity_date: todayStr },
      { $setOnInsert: { user: userId, activity_date: todayStr, activity_type: activityType } },
      { upsert: true }
    );
  } catch (error) {
    // Ignore duplicate key errors if concurrent calls happen
  }
};

const calculateStreakDetails = async (
  userId: string
): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}> => {
  await recordTodayActivity(userId);

  const activities = await UserActivity.find({ user: userId }).sort({
    activity_date: 1, // Ascending for longest streak calculation
  });

  if (activities.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date().toISOString(),
    };
  }

  const activityDates = Array.from(new Set(activities.map((a) => a.activity_date))).sort();
  const lastItem = activities.length > 0 ? activities[activities.length - 1] : null;
  const lastActivityDate =
    lastItem && (lastItem as any).updatedAt
      ? (lastItem as any).updatedAt.toISOString()
      : new Date().toISOString();

  // Longest streak calculation
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of activityDates) {
    const curDate = new Date(`${dateStr}T00:00:00.000Z`);
    if (prevDate) {
      const diffMs = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    } else {
      runningStreak = 1;
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = curDate;
  }

  // Current streak calculation
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const dateSet = new Set(activityDates);
  let currentCheckDate: Date;
  if (dateSet.has(todayStr)) {
    currentCheckDate = today;
  } else if (dateSet.has(yesterdayStr)) {
    currentCheckDate = yesterday;
  } else {
    return {
      currentStreak: 0,
      longestStreak,
      lastActivityDate,
    };
  }

  let currentStreak = 0;
  const loopDate = new Date(currentCheckDate);

  while (true) {
    const dStr = loopDate.toISOString().split('T')[0];
    if (dateSet.has(dStr)) {
      currentStreak++;
      loopDate.setDate(loopDate.getDate() - 1);
    } else {
      break;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    lastActivityDate,
  };
};

const calculateStreak = async (userId: string): Promise<number> => {
  const details = await calculateStreakDetails(userId);
  return details.currentStreak;
};

export const UserActivityService = {
  recordTodayActivity,
  calculateStreak,
  calculateStreakDetails,
};
