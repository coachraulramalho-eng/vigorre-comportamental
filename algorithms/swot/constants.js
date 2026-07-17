const SWOT_QUESTIONS = {
  forcas: {
    questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    name: 'Forças',
    color: '#10B981',
    icon: '💪'
  },
  fraquezas: {
    questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    name: 'Fraquezas',
    color: '#EF4444',
    icon: '⚠️',
    reverse: true
  },
  oportunidades: {
    questions: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    name: 'Oportunidades',
    color: '#3B82F6',
    icon: '🌟'
  },
  ameacas: {
    questions: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    name: 'Ameaças',
    color: '#F59E0B',
    icon: '⚡',
    reverse: true
  }
};

module.exports = { SWOT_QUESTIONS };
