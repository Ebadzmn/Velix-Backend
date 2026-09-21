export const DEFAULT_POPULAR_SERVICES: Record<
  string,
  { price: number; billing_period: 'monthly' | 'yearly'; category: string }
> = {
  netflix: { price: 129, billing_period: 'monthly', category: 'Entertainment' },
  spotify: { price: 119, billing_period: 'monthly', category: 'Entertainment' },
  'youtube premium': { price: 149, billing_period: 'monthly', category: 'Entertainment' },
  youtube: { price: 149, billing_period: 'monthly', category: 'Entertainment' },
  'disney+': { price: 89, billing_period: 'monthly', category: 'Entertainment' },
  'disney plus': { price: 89, billing_period: 'monthly', category: 'Entertainment' },
  disney: { price: 89, billing_period: 'monthly', category: 'Entertainment' },
  'hbo max': { price: 99, billing_period: 'monthly', category: 'Entertainment' },
  max: { price: 99, billing_period: 'monthly', category: 'Entertainment' },
  'apple music': { price: 119, billing_period: 'monthly', category: 'Entertainment' },
  'apple tv+': { price: 89, billing_period: 'monthly', category: 'Entertainment' },
  'apple tv': { price: 89, billing_period: 'monthly', category: 'Entertainment' },
  'amazon prime': { price: 59, billing_period: 'monthly', category: 'Entertainment' },
  'prime video': { price: 59, billing_period: 'monthly', category: 'Entertainment' },
  viaplay: { price: 169, billing_period: 'monthly', category: 'Entertainment' },
  storytel: { price: 169, billing_period: 'monthly', category: 'Entertainment' },
  bookbeat: { price: 149, billing_period: 'monthly', category: 'Entertainment' },
  chatgpt: { price: 220, billing_period: 'monthly', category: 'Software' },
  openai: { price: 220, billing_period: 'monthly', category: 'Software' },
  icloud: { price: 29, billing_period: 'monthly', category: 'Utilities' },
  'icloud+': { price: 29, billing_period: 'monthly', category: 'Utilities' },
  'google one': { price: 29, billing_period: 'monthly', category: 'Utilities' },
  dropbox: { price: 120, billing_period: 'monthly', category: 'Utilities' },
  'microsoft 365': { price: 85, billing_period: 'monthly', category: 'Software' },
  'office 365': { price: 85, billing_period: 'monthly', category: 'Software' },
  'playstation plus': { price: 95, billing_period: 'monthly', category: 'Gaming' },
  'ps plus': { price: 95, billing_period: 'monthly', category: 'Gaming' },
  'xbox game pass': { price: 135, billing_period: 'monthly', category: 'Gaming' },
  gym: { price: 499, billing_period: 'monthly', category: 'Health & Fitness' },
  fitness: { price: 499, billing_period: 'monthly', category: 'Health & Fitness' },
  sats: { price: 549, billing_period: 'monthly', category: 'Health & Fitness' },
  nordic: { price: 449, billing_period: 'monthly', category: 'Health & Fitness' },
  'nordic wellness': { price: 449, billing_period: 'monthly', category: 'Health & Fitness' },
  hulu: { price: 99, billing_period: 'monthly', category: 'Entertainment' },
  crunchyroll: { price: 79, billing_period: 'monthly', category: 'Entertainment' },
  paramount: { price: 69, billing_period: 'monthly', category: 'Entertainment' },
  'paramount+': { price: 69, billing_period: 'monthly', category: 'Entertainment' },
  duolingo: { price: 79, billing_period: 'monthly', category: 'Education' },
  canva: { price: 139, billing_period: 'monthly', category: 'Software' },
  adobe: { price: 349, billing_period: 'monthly', category: 'Software' },
  github: { price: 45, billing_period: 'monthly', category: 'Software' },
  audible: { price: 149, billing_period: 'monthly', category: 'Entertainment' },
  tinder: { price: 149, billing_period: 'monthly', category: 'Lifestyle' },
  bumble: { price: 149, billing_period: 'monthly', category: 'Lifestyle' },
  strava: { price: 89, billing_period: 'monthly', category: 'Health & Fitness' },
};

export const getFallbackSubscriptionInfo = (serviceName: string) => {
  if (!serviceName) {
    return {
      price: 99,
      billing_period: 'monthly' as const,
      category: 'Entertainment',
    };
  }
  const cleanName = serviceName.trim().toLowerCase();

  if (DEFAULT_POPULAR_SERVICES[cleanName]) {
    return DEFAULT_POPULAR_SERVICES[cleanName];
  }

  for (const [key, data] of Object.entries(DEFAULT_POPULAR_SERVICES)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return data;
    }
  }

  return {
    price: 99,
    billing_period: 'monthly' as const,
    category: 'Entertainment',
  };
};
