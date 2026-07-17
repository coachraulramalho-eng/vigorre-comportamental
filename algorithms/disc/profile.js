const { DISC_DIMENSIONS } = require('./constants');

function determineProfile(scores) {
  const sorted = Object.entries(scores)
    .map(([dim, score]) => ({ dim, score, name: DISC_DIMENSIONS[dim].name }))
    .sort((a, b) => b.score - a.score);
  
  const highest = sorted[0];
  const second = sorted[1];
  const diff = highest.score - second.score;
  
  let profile, type;
  
  if (diff < 5 && second.score > 60) {
    profile = `${highest.name} ${second.name}`;
    type = 'combination';
  } else if (highest.score > 70) {
    profile = highest.name;
    type = 'strong';
  } else if (highest.score > 50) {
    profile = highest.name;
    type = 'moderate';
  } else {
    profile = 'Perfil Equilibrado';
    type = 'balanced';
  }
  
  return {
    primary: highest.dim,
    primaryName: highest.name,
    primaryScore: highest.score,
    secondary: second.dim,
    secondaryName: second.name,
    secondaryScore: second.score,
    profile,
    type,
    scores: sorted.reduce((acc, { dim, score }) => {
      acc[dim] = score;
      return acc;
    }, {})
  };
}

module.exports = { determineProfile };
