const { VIGOR_WEIGHTS } = require('./constants');

function calculateVigorIndex(data) {
  const { disc = {}, bigfive = {}, ie = {}, valores = {}, swot = {} } = data;
  
  // Subíndices
  const visaoEstrategica = ((bigfive.O || 50) + (valores.inovacao || 50) + (valores.proposito || 50)) / 3;
  const inteligenciaHumana = ((ie.generalIndex || 50) + (ie.empatia || 50) + (ie.social_skills || 50)) / 3;
  const gestaoPerformance = ((bigfive.C || 50) + (valores.resultado || 50)) / 2;
  const organizacaoEstrutural = ((bigfive.C || 50) + (valores.estabilidade || 50)) / 2;
  const resultadosSustentaveis = ((ie.self_regulation || 50) + (100 - (bigfive.N || 50)) + (valores.qualidade_vida || 50)) / 3;
  
  // Índice geral (média ponderada)
  const vigorIndex = (
    visaoEstrategica * 0.20 +
    inteligenciaHumana * 0.25 +
    gestaoPerformance * 0.20 +
    organizacaoEstrutural * 0.15 +
    resultadosSustentaveis * 0.20
  );
  
  function getMaturityLevel(index) {
    if (index >= 80) return { label: 'Líder Estratégico', color: '#10B981', description: 'Alta capacidade de liderança e visão' };
    if (index >= 65) return { label: 'Gestor de Alto Potencial', color: '#3B82F6', description: 'Excelente base para liderança' };
    if (index >= 50) return { label: 'Profissional em Desenvolvimento', color: '#F59E0B', description: 'Boa base com potencial de crescimento' };
    return { label: 'Jornada Inicial', color: '#EF4444', description: 'Foco em desenvolvimento fundamental' };
  }
  
  // Recomendações
  const recommendations = [];
  const subIndices = { visaoEstrategica, inteligenciaHumana, gestaoPerformance, organizacaoEstrutural, resultadosSustentaveis };
  
  Object.entries(subIndices).forEach(([key, value]) => {
    if (value < 50) {
      const recs = {
        visaoEstrategica: 'Desenvolva pensamento estratégico e visão de futuro',
        inteligenciaHumana: 'Invista em inteligência emocional e autoconhecimento',
        gestaoPerformance: 'Foque em resultados e disciplina',
        organizacaoEstrutural: 'Desenvolva métodos e organização pessoal',
        resultadosSustentaveis: 'Trabalhe equilíbrio e resiliência'
      };
      recommendations.push(recs[key]);
    }
  });
  
  return {
    vigorIndex: Math.round(vigorIndex),
    subIndices: {
      visaoEstrategica: Math.round(visaoEstrategica),
      inteligenciaHumana: Math.round(inteligenciaHumana),
      gestaoPerformance: Math.round(gestaoPerformance),
      organizacaoEstrutural: Math.round(organizacaoEstrutural),
      resultadosSustentaveis: Math.round(resultadosSustentaveis)
    },
    maturityLevel: getMaturityLevel(vigorIndex),
    recommendations
  };
}

module.exports = { calculateVigorIndex };
