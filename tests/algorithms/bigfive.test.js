const bigfive = require('../../algorithms/bigfive');

describe('Algoritmo Big Five', () => {
  
  test('Deve calcular scores por dimensão', () => {
    const responses = Array(60).fill(3);
    
    const averages = bigfive.calculateRawScores(responses);
    
    expect(averages).toHaveProperty('O');
    expect(averages).toHaveProperty('C');
    expect(averages).toHaveProperty('E');
    expect(averages).toHaveProperty('A');
    expect(averages).toHaveProperty('N');
    expect(averages.O).toBe(3);
  });
  
  test('Deve normalizar para 0-100', () => {
    const averages = { O: 3, C: 3, E: 3, A: 3, N: 3 };
    const normalized = bigfive.normalizeScores(averages);
    
    expect(normalized.O).toBe(50);
    expect(normalized.C).toBe(50);
  });
});
