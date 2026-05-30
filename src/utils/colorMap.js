export const METHOD_COLORS = {
  GET: [1.0, 1.0, 1.0],        // white
  POST: [0.4, 0.7, 1.0],       // light blue
  PUT: [1.0, 0.7, 0.4],        // orange
  PATCH: [1.0, 1.0, 0.4],      // amber
  DELETE: [1.0, 0.4, 0.4],     // red
  HEAD: [0.7, 0.7, 0.7],       // gray
  OPTIONS: [0.7, 0.7, 0.7],    // gray
};

export function getColorByMethod(method) {
  return METHOD_COLORS[method?.toUpperCase()] || METHOD_COLORS.GET;
}
