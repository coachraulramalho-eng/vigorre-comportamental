const { VALORES_MAPPING } = require('./constants');

function calculateValoresScores(responses) {
  const scores = {};
  const counts = {};
  
  Object.keys(VALORES_MAPPING).forEach(key => {
    scores[key] = 0;
    counts[key] = 0;
  });
  
  responses.forEach((response, index) => {
    const questionIndex = index + 1;
    
    Object.entries(VALORES_MAPPING).forEach(([key, config]) => {
      if (config.questions.includes(questionIndex)) {
        scores[key] += response;
        counts[key] += 1;
      }
    });
  });
  
  const averages = {};
  Object.keys(scores).forEach(key => {
    averages[key] = scores[key] / counts[key];
  });
  
  const normalized = {};
  Object.keys(averages).forEach(key => {
    normalized[key] = Math.round(((averages[key] - 1) / 4) * 100);
  });
  
  const ranking = Object.entries(normalized)
    .map(([key, score]) => ({
      key,
      name: VALORES_MAPPING[key].name,
      score,
      color: VALORES_MAPPING[key].color
    }))
    .sort((a, b) => b.score - a.score);
  
  const top5 = ranking.slice(0, 5);
  
  return {
    scores: normalized,
    ranking,
    top5,
    top1: ranking[0] || null
  };
}

module.exports = { calculateValoresScores };
