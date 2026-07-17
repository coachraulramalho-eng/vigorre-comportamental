const { SWOT_QUESTIONS } = require('./constants');

function calculateSWOTScores(responses) {
  const scores = {};
  const counts = {};
  
  Object.keys(SWOT_QUESTIONS).forEach(key => {
    scores[key] = 0;
    counts[key] = 0;
  });
  
  responses.forEach((response, index) => {
    const questionIndex = index + 1;
    
    Object.entries(SWOT_QUESTIONS).forEach(([key, config]) => {
      if (config.questions.includes(questionIndex)) {
        let value = response;
        if (config.reverse) {
          value = 6 - value;
        }
        scores[key] += value;
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
  
  return {
    scores: normalized
  };
}

module.exports = { calculateSWOTScores };
