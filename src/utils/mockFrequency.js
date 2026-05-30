/**
 * Assigns frequency (0.1–1.0) to each endpoint weighted by HTTP method.
 * In production, this would come from analytics or usage data.
 * 
 * Weights:
 * - GET: 0.5–1.0 (most common)
 * - POST: 0.3–0.8 (common)
 * - PUT/PATCH: 0.2–0.6 (less common)
 * - DELETE: 0.1–0.5 (least common)
 */
export function assignMockFrequency(stars) {
  return stars.map(star => {
    let minFreq, maxFreq;

    switch (star.method) {
      case 'GET':
        minFreq = 0.5;
        maxFreq = 1.0;
        break;
      case 'POST':
        minFreq = 0.3;
        maxFreq = 0.8;
        break;
      case 'PUT':
      case 'PATCH':
        minFreq = 0.2;
        maxFreq = 0.6;
        break;
      case 'DELETE':
        minFreq = 0.1;
        maxFreq = 0.5;
        break;
      default:
        minFreq = 0.1;
        maxFreq = 0.4;
    }

    const frequency = minFreq + Math.random() * (maxFreq - minFreq);

    return {
      ...star,
      frequency,
    };
  });
}

