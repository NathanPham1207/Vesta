export type InventoryStatus = 'fresh' | 'good' | 'expiringSoon' | 'expired';

export type InventoryItem = {
  id: string;
  name: string;
  status: InventoryStatus;
  quantity: number;
  // daysRemaining is used for fresh/good/expiringSoon, daysAgo for expired.
  daysAgo?: number;
  daysRemaining?: number;
  categoryId: string;
  categoryTitle: string;
};

// Mock inventory for UI/testing only.
export const inventoryItems: InventoryItem[] = [
  {
    id: 'milk',
    name: 'Milk',
    status: 'expired',
    daysAgo: 3,
    quantity: 1,
    categoryId: '2',
    categoryTitle: 'Dairy',
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt',
    status: 'expired',
    daysAgo: 2,
    quantity: 1,
    categoryId: '2',
    categoryTitle: 'Dairy',
  },
  {
    id: 'strawberries',
    name: 'Strawberries',
    status: 'expiringSoon',
    daysRemaining: 0,
    quantity: 1,
    categoryId: '3',
    categoryTitle: 'Fruits',
  },
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    status: 'expiringSoon',
    daysRemaining: 1,
    quantity: 1,
    categoryId: '5',
    categoryTitle: 'Meat',
  },
  {
    id: 'spinach',
    name: 'Spinach',
    status: 'expiringSoon',
    daysRemaining: 2,
    quantity: 1,
    categoryId: '6',
    categoryTitle: 'Vegetables',
  },
  // Additional items so each category can drill down.
  {
    id: 'coffee',
    name: 'Coffee Beans',
    status: 'fresh',
    daysRemaining: 6,
    quantity: 1,
    categoryId: '1',
    categoryTitle: 'Beverages',
  },
  {
    id: 'cheddar',
    name: 'Cheddar Cheese',
    status: 'good',
    daysRemaining: 2,
    quantity: 1,
    categoryId: '2',
    categoryTitle: 'Dairy',
  },
  {
    id: 'butter',
    name: 'Butter',
    status: 'fresh',
    daysRemaining: 5,
    quantity: 1,
    categoryId: '2',
    categoryTitle: 'Dairy',
  },
  {
    id: 'apples',
    name: 'Apples',
    status: 'good',
    daysRemaining: 2,
    quantity: 1,
    categoryId: '3',
    categoryTitle: 'Fruits',
  },
  {
    id: 'bananas',
    name: 'Bananas',
    status: 'fresh',
    daysRemaining: 4,
    quantity: 1,
    categoryId: '3',
    categoryTitle: 'Fruits',
  },
  {
    id: 'rice',
    name: 'Rice',
    status: 'fresh',
    daysRemaining: 7,
    quantity: 1,
    categoryId: '4',
    categoryTitle: 'Groceries',
  },
  {
    id: 'pasta',
    name: 'Pasta',
    status: 'good',
    daysRemaining: 2,
    quantity: 1,
    categoryId: '4',
    categoryTitle: 'Groceries',
  },
  {
    id: 'beans',
    name: 'Black Beans',
    status: 'fresh',
    daysRemaining: 6,
    quantity: 1,
    categoryId: '4',
    categoryTitle: 'Groceries',
  },
  {
    id: 'steak',
    name: 'Steak',
    status: 'good',
    daysRemaining: 1,
    quantity: 1,
    categoryId: '5',
    categoryTitle: 'Meat',
  },
  {
    id: 'lettuce',
    name: 'Lettuce',
    status: 'good',
    daysRemaining: 2,
    quantity: 1,
    categoryId: '6',
    categoryTitle: 'Vegetables',
  },
  {
    id: 'carrots',
    name: 'Carrots',
    status: 'fresh',
    daysRemaining: 3,
    quantity: 1,
    categoryId: '6',
    categoryTitle: 'Vegetables',
  },
];

