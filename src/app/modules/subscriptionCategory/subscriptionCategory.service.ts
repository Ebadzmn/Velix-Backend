import { ISubscriptionCategory } from './subscriptionCategory.interface';
import { SubscriptionCategory } from './subscriptionCategory.model';

const defaultCategories = [
  'Entertainment',
  'Music',
  'Software',
  'Health',
  'Other',
];

const seedDefaultCategories = async (): Promise<void> => {
  const count = await SubscriptionCategory.countDocuments();
  if (count === 0) {
    await SubscriptionCategory.insertMany(
      defaultCategories.map((name) => ({ name }))
    );
  }
};

const getAllCategories = async (): Promise<ISubscriptionCategory[]> => {
  await seedDefaultCategories();
  const categories = await SubscriptionCategory.find().sort({ createdAt: 1 });
  return categories;
};

export const SubscriptionCategoryService = {
  getAllCategories,
  seedDefaultCategories,
};
