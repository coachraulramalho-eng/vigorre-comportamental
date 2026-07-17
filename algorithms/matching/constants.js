const MATCHING_WEIGHTS = {
  disc: 0.25,
  bigfive: 0.15,
  ie: 0.15,
  valores: 0.15,
  swot: 0.10,
  experiencia: 0.10,
  habilidades: 0.10
};

const DISC_JOB_MAPPING = {
  comercial: { D: 70, I: 60, S: 30, C: 40 },
  vendas: { D: 80, I: 70, S: 20, C: 30 },
  lideranca: { D: 75, I: 55, S: 45, C: 50 },
  analitico: { D: 40, I: 30, S: 50, C: 80 },
  operacional: { D: 35, I: 35, S: 70, C: 60 },
  suporte: { D: 30, I: 50, S: 70, C: 50 },
  criativo: { D: 40, I: 70, S: 30, C: 50 },
  gestao_projetos: { D: 60, I: 45, S: 55, C: 65 }
};

module.exports = { MATCHING_WEIGHTS, DISC_JOB_MAPPING };
