const { IE_QUESTIONS } = require('./constants');

function calculateIEScores(responses) {
  const scores = {
    self_awareness: 0,
    self_regulation: 0,
    motivation: 0,
    empathy: 0,
    social_skills: 0
  };
  const counts = {
    self_awareness: 0,
    self_regulation: 0,
    motivation: 0,
    empathy: 0,
    social_skills: 0
  };
  
  responses.forEach((response, index) => {
    const question = IE_QUESTIONS[index];
    if (!question) return;
    
    const dim = question.dimension;
    scores[dim] += response;
    counts[dim] += 1;
  });
  
  const averages = {};
  Object.keys(scores).forEach(dim => {
    averages[dim] = scores[dim] / counts[dim];
  });
  
  const normalized = {};
  Object.keys(averages).forEach(dim => {
    normalized[dim] = Math.round(((averages[dim] - 1) / 4) * 100);
  });
  
  const generalIndex = Math.round(
    Object.values(normalized).reduce((a, b) => a + b, 0) / 5
  );
  
  function getIELevel(index) {
    if (index >= 80) return { label: 'Excelente', color: '#10B981' };
    if (index >= 60) return { label: 'Desenvolvido', color: '#3B82F6' };
    if (index >= 40) return { label: 'Em Desenvolvimento', color: '#F59E0B' };
    return { label: 'Em Progresso', color: '#EF4444' };
  }
  
  return {
    dimensions: normalized,
    generalIndex,
    level: getIELevel(generalIndex)
  };
}

module.exports = { calculateIEScores };
