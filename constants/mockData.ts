export const categories = [
  { id: '1', title: 'Beverages', icon: '☕', count: 1 },
  { id: '2', title: 'Dairy', icon: '🥛', count: 4 },
  { id: '3', title: 'Fruits', icon: '🍎', count: 3 },
  { id: '4', title: 'Groceries', icon: '🛒', count: 3 },
];

export const recipes = [
  {
    id: '1',
    title: 'Classic Scrambled Eggs',
    description: 'Fluffy and creamy scrambled eggs with a hint of butter',
    time: '10 min',
    servings: 2,
    difficulty: 'Easy' as const,
    image: null,
  },
  {
    id: '2',
    title: 'Avocado Toast',
    description: 'Creamy avocado on toasted bread with a squeeze of lemon',
    time: '5 min',
    servings: 1,
    difficulty: 'Easy' as const,
    image: null,
  },
  {
    id: '3',
    title: 'Greek Yogurt Parfait',
    description: 'Layered yogurt, granola, and fresh berries',
    time: '5 min',
    servings: 1,
    difficulty: 'Easy' as const,
    image: null,
  },
];

export const receiptSummary = {
  totalReceipts: 2,
  totalSpent: 133.1,
  averagePerTrip: 66.55,
};

export const receipts = [
  {
    id: '1',
    storeName: 'Whole Foods',
    purchaseDate: '2025-03-10',
    totalAmount: 67.45,
    itemCount: 12,
  },
  {
    id: '2',
    storeName: 'Trader Joe\'s',
    purchaseDate: '2025-03-08',
    totalAmount: 65.65,
    itemCount: 8,
  },
];

export const expiringSoonCount = 3;
