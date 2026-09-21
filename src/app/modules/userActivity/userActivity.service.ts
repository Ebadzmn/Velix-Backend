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

const calculateStreak = async (userId: string): Promise<number> => {
  await recordTodayActivity(userId);

  const activities = await UserActivity.find({ user: userId }).sort({
    activity_date: -1,
  });

  if (activities.length === 0) return 0;

  const activityDates = new Set(activities.map((a) => a.activity_date));
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentCheckDate: Date;
  if (activityDates.has(todayStr)) {
    currentCheckDate = today;
  } else if (activityDates.has(yesterdayStr)) {
    currentCheckDate = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  const loopDate = new Date(currentCheckDate);

  while (true) {
    const dStr = loopDate.toISOString().split('T')[0];
    if (activityDates.has(dStr)) {
      streak++;
      loopDate.setDate(loopDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const UserActivityService = {
  recordTodayActivity,
  calculateStreak,
};
