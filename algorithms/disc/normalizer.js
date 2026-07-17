function normalizeScores(rawScores, maxPossible = 28) {
  const normalized = {};
  Object.keys(rawScores).forEach(dim => {
    normalized[dim] = Math.round((rawScores[dim] / maxPossible) * 100);
  });
  return normalized;
}

function calculatePercentiles(scores, historicalData) {
  const percentiles = {};
  Object.keys(scores).forEach(dim => {
    const score = scores[dim];
    const data = historicalData[dim] || [];
    if (data.length === 0) {
      percentiles[dim] = 50;
      return;
    }
    const below = data.filter(v => v < score).length;
    const equal = data.filter(v => v === score).length;
    percentiles[dim] = Math.round(((below + equal / 2) / data.length) * 100);
  });
  return percentiles;
}

module.exports = { normalizeScores, calculatePercentiles };
