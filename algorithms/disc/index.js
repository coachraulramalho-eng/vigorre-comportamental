const { calculateRawScores } = require('./scoring');
const { normalizeScores, calculatePercentiles } = require('./normalizer');
const { determineProfile } = require('./profile');

module.exports = {
  calculateRawScores,
  normalizeScores,
  calculatePercentiles,
  determineProfile
};
