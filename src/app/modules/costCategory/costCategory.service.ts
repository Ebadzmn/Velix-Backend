import { ICostCategory } from './costCategory.interface';
import { CostCategory } from './costCategory.model';

const defaultCostCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Other',
];

const seedDefaultCostCategories = async (): Promise<void> => {
  const count = await CostCategory.countDocuments();
  if (count === 0) {
    await CostCategory.insertMany(
      defaultCostCategories.map((name) => ({ name }))
    );
  }
};

const getAllCategories = async (): Promise<ICostCategory[]> => {
  await seedDefaultCostCategories();
  const categories = await CostCategory.find().sort({ createdAt: 1 });
  return categories;
};

export const CostCategoryService = {
  getAllCategories,
  seedDefaultCostCategories,
};
