export function getExpiryDays(name: string, category: string): number {
  const normalizedName = name.toLowerCase();
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory === 'dairy') {
    if (normalizedName.includes('milk')) return 7;
    if (normalizedName.includes('egg')) return 14;
    return 7;
  }

  if (normalizedCategory === 'bakery') {
    if (normalizedName.includes('bread')) return 5;
    return 3;
  }

  if (normalizedCategory === 'fruits') return 7;
  if (normalizedCategory === 'vegetables') return 7;
  if (normalizedCategory === 'meat') return 7;
  if (normalizedCategory === 'beverages') return 30;

  return 7;
}

export function calculateExpiryDate(purchaseDate: string, daysToExpire: number): string {
  const date = new Date(purchaseDate);
  date.setDate(date.getDate() + daysToExpire);
  return date.toISOString();
}

export function getDaysLeft(expiryDate: string): number {
  const expiryTime = new Date(expiryDate).getTime();
  const now = Date.now();
  return Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(daysLeft: number): boolean {
  return daysLeft <= 3;
}
