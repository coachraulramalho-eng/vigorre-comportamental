const { MATCHING_WEIGHTS, DISC_JOB_MAPPING } = require('./constants');

function calculateCompatibility(participant, job) {
  const scores = {
    disc: calculateDiscCompatibility(participant.disc, job.discProfile || 'comercial'),
    bigfive: calculateBigFiveCompatibility(participant.bigfive, job.bigFiveRequirements || {}),
    ie: calculateIECompatibility(participant.ie, job.ieRequirements || {}),
    valores: calculateValoresCompatibility(participant.valores, job.valoresRequirements || []),
    swot: calculateSWOTCompatibility(participant.swot, job.swotRequirements || {}),
    experiencia: calculateExperienciaCompatibility(participant.experiencia, job.experienciaRequirements || {}),
    habilidades: calculateHabilidadesCompatibility(participant.habilidades, job.habilidadesRequirements || [])
  };
  
  const totalScore = Object.entries(scores).reduce((sum, [key, value]) => {
    return sum + (value * MATCHING_WEIGHTS[key]);
  }, 0);
  
  function getLevel(score) {
    if (score >= 80) return { label: 'Excelente', color: '#10B981' };
    if (score >= 65) return { label: 'Boa', color: '#3B82F6' };
    if (score >= 50) return { label: 'Moderada', color: '#F59E0B' };
    return { label: 'Baixa', color: '#EF4444' };
  }
  
  return {
    score: Math.round(totalScore),
    level: getLevel(totalScore),
    scores
  };
}

function calculateDiscCompatibility(participantDisc, jobProfile) {
  const jobDisc = DISC_JOB_MAPPING[jobProfile] || DISC_JOB_MAPPING.comercial;
  const dimensions = ['D', 'I', 'S', 'C'];
  let totalDiff = 0;
  
  dimensions.forEach(dim => {
    const pScore = participantDisc[dim] || 50;
    const jScore = jobDisc[dim] || 50;
    totalDiff += Math.abs(pScore - jScore);
  });
  
  const maxDiff = 400;
  return Math.max(0, 100 - (totalDiff / maxDiff * 100));
}

function calculateBigFiveCompatibility(participantBigFive, jobBigFive) {
  if (!participantBigFive || !jobBigFive || Object.keys(jobBigFive).length === 0) return 70;
  const dimensions = ['O', 'C', 'E', 'A', 'N'];
  let totalDiff = 0;
  let count = 0;
  
  dimensions.forEach(dim => {
    if (jobBigFive[dim] !== undefined) {
      const pScore = participantBigFive[dim] || 50;
      totalDiff += Math.abs(pScore - jobBigFive[dim]);
      count++;
    }
  });
  
  if (count === 0) return 70;
  const maxDiff = count * 100;
  return Math.max(0, 100 - (totalDiff / maxDiff * 100));
}

function calculateIECompatibility(participantIE, jobIERequirements) {
  if (!participantIE || !jobIERequirements || Object.keys(jobIERequirements).length === 0) return 70;
  const dimensions = ['self_awareness', 'self_regulation', 'motivation', 'empathy', 'social_skills'];
  let totalDiff = 0;
  let count = 0;
  
  dimensions.forEach(dim => {
    if (jobIERequirements[dim] !== undefined) {
      const pScore = participantIE[dim] || 50;
      totalDiff += Math.abs(pScore - jobIERequirements[dim]);
      count++;
    }
  });
  
  if (count === 0) return 70;
  const maxDiff = count * 100;
  return Math.max(0, 100 - (totalDiff / maxDiff * 100));
}

function calculateValoresCompatibility(participantValores, jobValores) {
  if (!participantValores || !jobValores || jobValores.length === 0) return 70;
  const top5 = participantValores.top5 || [];
  const top5Keys = top5.map(v => v.key);
  let matchCount = 0;
  
  jobValores.forEach(valor => {
    if (top5Keys.includes(valor)) matchCount++;
  });
  
  return Math.round((matchCount / jobValores.length) * 100);
}

function calculateSWOTCompatibility(participantSWOT, jobSWOT) {
  if (!participantSWOT || !jobSWOT || Object.keys(jobSWOT).length === 0) return 70;
  const forcas = participantSWOT.forcas || 50;
  const necessarias = jobSWOT.forcas_necessarias || 50;
  const diff = Math.abs(forcas - necessarias);
  return Math.max(0, 100 - diff);
}

function calculateExperienciaCompatibility(participantExp, jobExp) {
  if (!participantExp || !jobExp || Object.keys(jobExp).length === 0) return 70;
  const pAnos = participantExp.anos || 0;
  const jAnosMin = jobExp.anos_min || 0;
  const jAnosMax = jobExp.anos_max || 999;
  
  if (pAnos >= jAnosMin && pAnos <= jAnosMax) return 100;
  if (pAnos < jAnosMin) return Math.max(0, 100 - ((jAnosMin - pAnos) / jAnosMin * 100));
  return Math.max(50, 100 - ((pAnos - jAnosMax) / jAnosMax * 100));
}

function calculateHabilidadesCompatibility(participantHabilidades, jobHabilidades) {
  if (!participantHabilidades || !jobHabilidades || jobHabilidades.length === 0) return 70;
  let matchCount = 0;
  jobHabilidades.forEach(habilidade => {
    if (participantHabilidades.includes(habilidade)) matchCount++;
  });
  return Math.round((matchCount / jobHabilidades.length) * 100);
}

module.exports = { calculateCompatibility };
