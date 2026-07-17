const { DISC_QUESTIONS } = require('./constants');

function calculateRawScores(responses) {
  const scores = { D: 0, I: 0, S: 0, C: 0 };
  
  responses.forEach((response, index) => {
    const question = DISC_QUESTIONS[index];
    if (!question) return;
    
    const { more, less } = response;
    
    if (more === 'a') {
      scores.D += question.D || 0;
      scores.I += question.I || 0;
      scores.S += question.S || 0;
      scores.C += question.C || 0;
    } else if (more === 'b') {
      scores.D += question.D === 1 ? 0 : 1;
      scores.I += question.I === 1 ? 0 : 1;
      scores.S += question.S === 1 ? 0 : 1;
      scores.C += question.C === 1 ? 0 : 1;
    }
    
    if (less === 'a') {
      scores.D -= question.D || 0;
      scores.I -= question.I || 0;
      scores.S -= question.S || 0;
      scores.C -= question.C || 0;
    } else if (less === 'b') {
      scores.D -= question.D === 1 ? 0 : 1;
      scores.I -= question.I === 1 ? 0 : 1;
      scores.S -= question.S === 1 ? 0 : 1;
      scores.C -= question.C === 1 ? 0 : 1;
    }
  });
  
  const minScore = Math.min(0, ...Object.values(scores));
  if (minScore < 0) {
    Object.keys(scores).forEach(key => {
      scores[key] += Math.abs(minScore);
    });
  }
  
  return scores;
}

module.exports = { calculateRawScores };
