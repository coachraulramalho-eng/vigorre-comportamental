const disc = require('../../algorithms/disc');

describe('Algoritmo DISC', () => {
  
  test('Deve calcular scores brutos corretamente', () => {
    const responses = [
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' },
      { more: 'a', less: 'b' }
    ];
    
    const scores = disc.calculateRawScores(responses);
    
    expect(scores).toHaveProperty('D');
    expect(scores).toHaveProperty('I');
    expect(scores).toHaveProperty('S');
    expect(scores).toHaveProperty('C');
    expect(typeof scores.D).toBe('number');
  });
  
  test('Deve normalizar scores para 0-100', () => {
    const rawScores = { D: 20, I: 10, S: 5, C: 15 };
    const normalized = disc.normalizeScores(rawScores, 28);
    
    expect(normalized.D).toBeGreaterThanOrEqual(0);
    expect(normalized.D).toBeLessThanOrEqual(100);
  });
  
  test('Deve determinar perfil com desempate', () => {
    const scores = { D: 75, I: 35, S: 40, C: 50 };
    const profile = disc.determineProfile(scores);
    
    expect(profile).toHaveProperty('primary');
    expect(profile).toHaveProperty('profile');
    expect(profile.primary).toBe('D');
  });
});
