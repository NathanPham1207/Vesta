import { CATEGORY_IMAGES } from '@/constants/categoryImages';

export const CATEGORIES = [
  { id: '1', title: 'Bakery', icon: CATEGORY_IMAGES.Bakery },
  { id: '2', title: 'Beverages', icon: CATEGORY_IMAGES.Beverages },
  { id: '3', title: 'Condiments', icon: CATEGORY_IMAGES.Condiments },
  { id: '4', title: 'Dairy', icon: CATEGORY_IMAGES.Dairy },
  { id: '5', title: 'Frozen', icon: CATEGORY_IMAGES.Frozen },
  { id: '6', title: 'Fruits', icon: CATEGORY_IMAGES.Fruits },
  { id: '7', title: 'Meat', icon: CATEGORY_IMAGES.Meat },
  { id: '8', title: 'Pantry', icon: CATEGORY_IMAGES.Pantry },
  { id: '9', title: 'Seafood', icon: CATEGORY_IMAGES.Seafood },
  { id: '10', title: 'Snacks', icon: CATEGORY_IMAGES.Snacks },
  { id: '11', title: 'Misc', icon: CATEGORY_IMAGES.Misc },
  { id: '12', title: 'Vegetables', icon: CATEGORY_IMAGES.Vegetables },
] as const;
