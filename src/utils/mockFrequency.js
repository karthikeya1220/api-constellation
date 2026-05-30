/**
 * Randomly assigns a frequency (0.1 to 1.0) to each star.
 * In production, this would come from analytics or usage data.
 */
export function mockFrequency(stars) {
  return stars.map(star => ({
    ...star,
    frequency: Math.random() * 0.9 + 0.1,
  }));
}
