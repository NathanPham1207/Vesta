/** Counts are derived on Home from shared inventory state. */
export const categories = [
  { id: '1', title: 'Beverages', icon: '☕', count: 0 },
  { id: '2', title: 'Dairy', icon: '🥛', count: 0 },
  { id: '3', title: 'Fruits', icon: '🍎', count: 0 },
  { id: '4', title: 'Groceries', icon: '🛒', count: 0 },
  { id: '5', title: 'Meat', icon: '🥩', count: 0 },
  { id: '6', title: 'Vegetables', icon: '🥦', count: 0 },
];

export const recipes = [
  {
    id: '1',
    title: 'Classic Scrambled Eggs',
    description: 'Fluffy and creamy scrambled eggs with a hint of butter',
    time: '10 min',
    servings: 2,
    difficulty: 'Easy' as const,
    image:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
    ingredients: [
      {
        id: 'i1',
        name: 'Eggs',
        quantity: '4',
        image:
          'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80',
        inStock: true,
      },
      {
        id: 'i2',
        name: 'Milk',
        quantity: '2 tablespoons',
        image:
          'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
        inStock: true,
      },
      {
        id: 'i3',
        name: 'Butter',
        quantity: '1 tablespoon',
        image:
          'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
        inStock: false,
      },
      {
        id: 'i4',
        name: 'Salt',
        quantity: 'Pinch',
        image:
          'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80',
        inStock: true,
      },
    ],
    instructions: [
      'Crack 4 eggs into a medium bowl.',
      'Add 2 tablespoons milk and a pinch of salt; whisk until combined.',
      'Melt 1 tablespoon butter in a nonstick pan over medium-low heat.',
      'Pour in the egg mixture and let it sit briefly until edges set.',
      'Gently push cooked edges toward the center with a spatula.',
      'Continue cooking, folding until eggs are mostly set but still creamy.',
      'Remove from heat; residual heat will finish cooking.',
      'Season to taste and serve immediately.',
    ],
  },
  {
    id: '2',
    title: 'Avocado Toast',
    description: 'Creamy avocado on toasted bread with a squeeze of lemon',
    time: '5 min',
    servings: 1,
    difficulty: 'Easy' as const,
    image: null,
    ingredients: [
      {
        id: 'a1',
        name: 'Bread',
        quantity: '2 slices',
        image:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
        inStock: true,
      },
      {
        id: 'a2',
        name: 'Avocado',
        quantity: '1 ripe',
        image:
          'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80',
        inStock: true,
      },
      {
        id: 'a3',
        name: 'Lemon',
        quantity: '½',
        image:
          'https://images.unsplash.com/photo-1590502593741-42a996134b66?w=400&q=80',
        inStock: false,
      },
    ],
    instructions: [
      'Toast the bread until golden and crisp.',
      'Mash the avocado with a fork; season with salt and pepper.',
      'Spread avocado generously on toast.',
      'Squeeze lemon on top and serve.',
    ],
  },
  {
    id: '3',
    title: 'Greek Yogurt Parfait',
    description: 'Layered yogurt, granola, and fresh berries',
    time: '5 min',
    servings: 1,
    difficulty: 'Easy' as const,
    image: null,
    ingredients: [
      {
        id: 'g1',
        name: 'Greek yogurt',
        quantity: '1 cup',
        image:
          'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
        inStock: true,
      },
      {
        id: 'g2',
        name: 'Granola',
        quantity: '½ cup',
        image:
          'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&q=80',
        inStock: true,
      },
      {
        id: 'g3',
        name: 'Berries',
        quantity: '½ cup',
        image:
          'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80',
        inStock: true,
      },
    ],
    instructions: [
      'Spoon half the yogurt into a glass or bowl.',
      'Add a layer of granola, then berries.',
      'Repeat layers and serve right away.',
    ],
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
    storeName: "Trader Joe's",
    purchaseDate: '2025-03-08',
    totalAmount: 65.65,
    itemCount: 8,
  },
];
