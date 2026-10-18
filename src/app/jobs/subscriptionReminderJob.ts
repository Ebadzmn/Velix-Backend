import { Subscription } from '../modules/subscription/subscription.model';
import { SavingsGoal } from '../modules/savingsGoal/savingsGoal.model';
import { User } from '../modules/user/user.model';
import { NotificationService } from '../modules/notification/notification.service';
import { logger } from '../../shared/logger';

const calculateNextBillingDate = (
  createdAt: Date | undefined,
  billingPeriod: 'monthly' | 'yearly',
  referenceDate: Date = new Date()
): { nextBillingDate: Date; formattedDate: string; daysUntil: number } => {
  const baseDate = createdAt ? new Date(createdAt) : new Date(referenceDate);
  const billingDay = baseDate.getDate();

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const todayStart = new Date(refYear, refMonth, referenceDate.getDate(), 0, 0, 0, 0);

  let nextDate: Date;

  if (billingPeriod === 'yearly') {
    const billingMonth = baseDate.getMonth();
    const maxDays = new Date(refYear, billingMonth + 1, 0).getDate();
    const targetDay = Math.min(billingDay, maxDays);
    const candidateThisYear = new Date(refYear, billingMonth, targetDay, 0, 0, 0, 0);

    if (candidateThisYear.getTime() >= todayStart.getTime()) {
      nextDate = candidateThisYear;
    } else {
      const maxDaysNextYear = new Date(refYear + 1, billingMonth + 1, 0).getDate();
      nextDate = new Date(refYear + 1, billingMonth, Math.min(billingDay, maxDaysNextYear), 0, 0, 0, 0);
    }
  } else {
    // Monthly
    const maxDaysThisMonth = new Date(refYear, refMonth + 1, 0).getDate();
    const targetDay = Math.min(billingDay, maxDaysThisMonth);
    const candidateThisMonth = new Date(refYear, refMonth, targetDay, 0, 0, 0, 0);

    if (candidateThisMonth.getTime() >= todayStart.getTime()) {
      nextDate = candidateThisMonth;
    } else {
      const maxDaysNextMonth = new Date(refYear, refMonth + 2, 0).getDate();
      nextDate = new Date(refYear, refMonth + 1, Math.min(billingDay, maxDaysNextMonth), 0, 0, 0, 0);
    }
  }

  const diffTime = nextDate.getTime() - todayStart.getTime();
  const daysUntil = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const formattedDate = nextDate.toISOString().split('T')[0];

  return { nextBillingDate: nextDate, formattedDate, daysUntil };
};

export const runSubscriptionReminderCheck = async () => {
  try {
    const now = new Date();
    logger.info('⏰ Running automated subscription and savings renewal reminder check...');

    // 1. Process all subscriptions
    const subscriptions = await Subscription.find({});
    for (const sub of subscriptions) {
      if (!sub.user) continue;

      const { formattedDate, daysUntil } = calculateNextBillingDate(
        sub.createdAt,
        sub.billing_period,
        now
      );

      // Trigger if due in 3 days or less
      if (daysUntil <= 3) {
        const userId = sub.user.toString();
        const user = await User.findById(userId);
        const currency = sub.currency || user?.currency || 'KR';

        await NotificationService.createNotificationIfEnabled(
          userId,
          'renewalReminders',
          {
            title: `${sub.name} renews soon 🔔`,
            message: `${sub.name} (${sub.price} ${currency}) is due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.`,
            type: 'renewal',
            data: {
              subscriptionId: sub._id?.toString(),
              daysUntil,
              billingDate: formattedDate,
            },
          },
          `renewal-${sub._id?.toString()}-${formattedDate}`
        );
      }
    }

    // 2. Process all savings goals
    const savingsGoals = await SavingsGoal.find({ is_active: true });
    for (const sg of savingsGoals) {
      if (!sg.user || !sg.target_date) continue;
      const target = sg.target_amount || 1;
      const saved = sg.saved_amount || 0;

      if (saved < target) {
        const daysUntilTarget = Math.ceil(
          (new Date(sg.target_date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
            (1000 * 60 * 60 * 24)
        );

        if (daysUntilTarget >= 0 && daysUntilTarget <= 7) {
          const userId = sg.user.toString();
          const user = await User.findById(userId);
          const currency = sg.currency || user?.currency || 'KR';

          await NotificationService.createNotificationIfEnabled(
            userId,
            'savingsReminders',
            {
              title: `${sg.name} goal deadline approaching 🎯`,
              message: `${sg.name} is due in ${daysUntilTarget} day${daysUntilTarget === 1 ? '' : 's'}. You saved ${saved} of ${target} ${currency}.`,
              type: 'savings_goal',
              data: {
                savingsGoalId: sg._id?.toString(),
                daysUntil: daysUntilTarget,
              },
            },
            `savings-goal-${sg._id?.toString()}-${new Date(sg.target_date).toISOString().slice(0, 10)}`
          );
        }
      }
    }

    logger.info('✅ Automated reminder check completed successfully.');
  } catch (error) {
    logger.error(`Error in automated reminder job: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Initializes background scheduler to check reminders periodically
 */
export const startReminderScheduler = () => {
  // Run first check 10 seconds after server boot
  setTimeout(() => {
    void runSubscriptionReminderCheck();
  }, 10000);

  // Then run every 1 hour (3,600,000 ms)
  setInterval(() => {
    void runSubscriptionReminderCheck();
  }, 60 * 60 * 1000);
};
