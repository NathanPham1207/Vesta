function calculateExpiryStatus(expiryDate) {
  const target = new Date(`${expiryDate}T00:00:00`);

  if (Number.isNaN(target.getTime())) {
    return { error: "Invalid expiryDate format" };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiry = Math.ceil((target.getTime() - now.getTime()) / msPerDay);

  const EXPIRING_SOON_DAYS = 3;

  let status = "fresh";

  if (daysUntilExpiry < 0) {
    status = "expired";
  } else if (daysUntilExpiry <= EXPIRING_SOON_DAYS) {
    status = "expiring_soon";
  }

  return {
    daysUntilExpiry,
    status,
    isExpired: daysUntilExpiry < 0,
    isExpiringSoon:
      daysUntilExpiry <= EXPIRING_SOON_DAYS && daysUntilExpiry >= 0,
  };
}

module.exports = {
  calculateExpiryStatus,
};