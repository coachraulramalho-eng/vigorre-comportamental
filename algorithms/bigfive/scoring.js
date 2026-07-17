const { BIGFIVE_QUESTIONS } = require('./constants');

function calculateRawScores(responses) {
  const scores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const counts = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  
  responses.forEach((response, index) => {
    const question = BIGFIVE_QUESTIONS[index];
    if (!question) return;
    
    const dim = question.dimension;
    let value = response;
    
    if (question.reverse) {
      value = 6 - value;
    }
    
    scores[dim] += value;
    counts[dim] += 1;
  });
  
  const averages = {};
  Object.keys(scores).forEach(dim => {
    averages[dim] = scores[dim] / counts[dim];
  });
  
  return averages;
}

function normalizeScores(averages) {
  const normalized = {};
  Object.keys(averages).forEach(dim => {
    normalized[dim] = Math.round(((averages[dim] - 1) / 4) * 100);
  });
  return normalized;
}

module.exports = { calculateRawScores, normalizeScores };
