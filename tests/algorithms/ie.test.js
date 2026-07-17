const ie = require('../../algorithms/ie');

describe('Algoritmo Inteligência Emocional', () => {
  
  test('Deve calcular scores por competência', () => {
    const responses = Array(40).fill(3);
    
    const result = ie.calculateIEScores(responses);
    
    expect(result).toHaveProperty('dimensions');
    expect(result).toHaveProperty('generalIndex');
    expect(result).toHaveProperty('level');
    expect(result.generalIndex).toBe(50);
  });
});
