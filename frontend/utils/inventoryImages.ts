export function buildInventoryImageFallback(name: string | null | undefined): string | null {
  if (typeof name !== 'string') {
    return null;
  }

  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_');

  if (!normalized) {
    return null;
  }

  return `https://www.themealdb.com/images/ingredients/${normalized}-medium.png`;
}

export function resolveInventoryImageSource(
  name: string | null | undefined,
  imageUrl: string | null | undefined,
): string | null {
  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    return imageUrl.trim();
  }

  return buildInventoryImageFallback(name);
}
