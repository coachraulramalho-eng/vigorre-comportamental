// ============================================
// VIGORRE ONE™ - SUPABASE CONFIGURAÇÃO
// Enterprise People Analytics Platform
// ============================================

// ============================================
// 1. SUAS CHAVES DO SUPABASE
// ============================================
const SUPABASE_URL = 'https://dfthdcnaqmqswidwgezj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bcLZGSu_wLmhcNOQmY3TLQ_yp3CHiZo';

// ============================================
// 2. INICIALIZAR CLIENTE SUPABASE
// ============================================
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// ============================================
// 3. FUNÇÕES UTILITÁRIAS
// ============================================
function generateId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return timestamp + randomPart;
}

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR');
}

function formatDateISO(date) {
  return new Date(date).toISOString();
}

// ============================================
// 4. FUNÇÕES DE BANCO DE DADOS
// ============================================

// SALVAR (com fallback offline)
async function saveToSupabase(table, data, localStorageKey) {
  try {
    if (!data.created_at) data.created_at = formatDateISO(new Date());
    if (!data.updated_at) data.updated_at = formatDateISO(new Date());
    
    const { error } = await supabaseClient.from(table).upsert(data);
    
    if (error) throw error;
    
    console.log('✅ Salvou no Supabase:', table, data.id);
    return { success: true, online: true };
    
  } catch (e) {
    console.warn('⚠️ Offline - salvando no localStorage:', e.message);
    
    const existing = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    const idx = existing.findIndex(item => item.id === data.id);
    
    if (idx > -1) {
      existing[idx] = data;
    } else {
      existing.push(data);
    }
    
    localStorage.setItem(localStorageKey, JSON.stringify(existing));
    return { success: true, online: false };
  }
}

// BUSCAR (com fallback offline)
async function loadFromSupabase(table, localStorageKey, filterKey, filterValue) {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .eq(filterKey, filterValue)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      console.log('✅ Carregou do Supabase:', table, data.id);
      return data;
    }
    
  } catch (e) {
    console.warn('⚠️ Offline - usando localStorage:', e.message);
  }
  
  const items = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  return items.find(item => item[filterKey] === filterValue) || null;
}

// BUSCAR TODOS (com fallback offline)
async function loadAllFromSupabase(table, localStorageKey, filterKey, filterValue) {
  try {
    let query = supabaseClient.from(table).select('*');
    
    if (filterKey && filterValue) {
      query = query.eq(filterKey, filterValue);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log('✅ Carregou todos do Supabase:', table, data.length);
      return data;
    }
    
  } catch (e) {
    console.warn('⚠️ Offline - usando localStorage:', e.message);
  }
  
  const items = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  if (filterKey && filterValue) {
    return items.filter(item => item[filterKey] === filterValue);
  }
  return items;
}

// DELETAR (com fallback offline)
async function deleteFromSupabase(table, id, localStorageKey) {
  try {
    const { error } = await supabaseClient.from(table).delete().eq('id', id);
    
    if (error) throw error;
    
    console.log('✅ Deletou do Supabase:', table, id);
    return { success: true, online: true };
    
  } catch (e) {
    console.warn('⚠️ Offline - deletando do localStorage:', e.message);
    
    const items = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(localStorageKey, JSON.stringify(filtered));
    
    return { success: true, online: false };
  }
}

// ============================================
// 5. NOVA FUNÇÃO: DETECÇÃO DE INCONSISTÊNCIA
// ============================================
function detectInconsistency(answers, timeSpent, testType) {
  let score = 100;
  const avgTime = timeSpent / answers.length;
  
  // 5.1 Respostas muito rápidas (menos de 3 segundos por pergunta)
  if (avgTime < 3) {
    score -= 20;
    console.warn('⚠️ Respostas muito rápidas detectadas');
  }
  
  // 5.2 Respostas muito lentas (mais de 30 segundos por pergunta)
  if (avgTime > 30) {
    score -= 10;
    console.warn('⚠️ Respostas muito lentas detectadas');
  }
  
  // 5.3 Detectar contradições lógicas (DISC)
  if (testType === 'DISC' && answers.length >= 24) {
    // Se Dominância alta e Estabilidade alta ao mesmo tempo (contradição)
    const dCount = answers.filter(a => a.type === 'D' && a.value >= 3).length;
    const sCount = answers.filter(a => a.type === 'S' && a.value >= 3).length;
    if (dCount > 5 && sCount > 5) {
      score -= 15;
      console.warn('⚠️ Contradição: Dominância e Estabilidade altas simultaneamente');
    }
  }
  
  // 5.4 Detectar padrão de respostas (ex: todas na mesma coluna)
  const uniqueAnswers = new Set(answers.map(a => a.value));
  if (uniqueAnswers.size < 3) {
    score -= 10;
    console.warn('⚠️ Baixa variabilidade nas respostas');
  }
  
  return Math.max(0, Math.min(100, score));
}

// ============================================
// 6. NOVA FUNÇÃO: CALCULAR CONSISTÊNCIA
// ============================================
function calculateConsistency(previousResults, currentResults) {
  if (!previousResults || !currentResults) {
    return { status: 'unknown', message: 'Sem dados anteriores para comparação' };
  }
  
  // Calcular diferença percentual
  let totalDiff = 0;
  let count = 0;
  
  if (previousResults.percentages && currentResults.percentages) {
    const keys = Object.keys(previousResults.percentages);
    for (const key of keys) {
      if (currentResults.percentages[key] !== undefined) {
        totalDiff += Math.abs(previousResults.percentages[key] - currentResults.percentages[key]);
        count++;
      }
    }
  }
  
  const avgDiff = count > 0 ? totalDiff / count : 0;
  
  if (avgDiff <= 5) {
    return { status: 'stable', message: 'Resultados consistentes e confiáveis', diff: avgDiff };
  } else if (avgDiff <= 15) {
    return { status: 'moderate', message: 'Variação moderada detectada. Recomenda-se revisão.', diff: avgDiff };
  } else {
    return { status: 'unstable', message: 'Variação significativa detectada. Novo teste recomendado.', diff: avgDiff };
  }
}

// ============================================
// 7. NOVA FUNÇÃO: ANALISAR POR CARGO
// ============================================
function analyzeByJob(results, job) {
  const cargoWeights = {
    'Vendedor': { 
      persuasao: 0.8, comunicacao: 0.9, energia: 0.7, resiliencia: 0.6, negociacao: 0.8,
      disc_weights: { D: 0.9, I: 0.8, S: 0.3, C: 0.4 }
    },
    'RH': { 
      empatia: 0.9, escuta: 0.8, organizacao: 0.7, inteligencia_emocional: 0.9,
      disc_weights: { D: 0.4, I: 0.7, S: 0.8, C: 0.6 }
    },
    'Diretor': { 
      lideranca: 0.9, estrategia: 0.9, decisao: 0.8, conflitos: 0.7,
      disc_weights: { D: 0.9, I: 0.7, S: 0.4, C: 0.6 }
    },
    'Financeiro': { 
      precisao: 0.9, concentracao: 0.8, organizacao: 0.8, detalhes: 0.9,
      disc_weights: { D: 0.5, I: 0.3, S: 0.6, C: 0.9 }
    },
    'Operacional': {
      disciplina: 0.9, consistencia: 0.8, execucao: 0.9, processos: 0.8,
      disc_weights: { D: 0.5, I: 0.3, S: 0.8, C: 0.7 }
    },
    'Atendimento': {
      empatia: 0.9, paciencia: 0.8, comunicacao: 0.8, resolucao: 0.7,
      disc_weights: { D: 0.3, I: 0.6, S: 0.9, C: 0.4 }
    },
    'Gestor': {
      lideranca: 0.9, delegacao: 0.8, planejamento: 0.8, motivacao: 0.7,
      disc_weights: { D: 0.8, I: 0.7, S: 0.5, C: 0.6 }
    },
    'Coordenador': {
      lideranca: 0.7, organizacao: 0.8, comunicacao: 0.7, resolucao: 0.8,
      disc_weights: { D: 0.7, I: 0.6, S: 0.6, C: 0.7 }
    },
    'Analista': {
      analise: 0.9, precisao: 0.8, organizacao: 0.8, comunicacao: 0.6,
      disc_weights: { D: 0.4, I: 0.4, S: 0.6, C: 0.9 }
    },
    'Tecnico': {
      precisao: 0.9, conhecimento: 0.9, resolucao: 0.8, atencao: 0.8,
      disc_weights: { D: 0.4, I: 0.3, S: 0.6, C: 0.9 }
    },
    'Professor': {
      comunicacao: 0.9, empatia: 0.8, organizacao: 0.7, paciencia: 0.8,
      disc_weights: { D: 0.4, I: 0.7, S: 0.7, C: 0.6 }
    },
    'Consultor': {
      analise: 0.9, comunicacao: 0.8, estrategia: 0.8, resolucao: 0.8,
      disc_weights: { D: 0.7, I: 0.6, S: 0.4, C: 0.7 }
    }
  };

  const weights = cargoWeights[job] || cargoWeights['Gestor'];
  const discPct = results.disc?.percentages || { D: 0, I: 0, S: 0, C: 0 };
  const iePct = results.ie?.percentages || {};
  const bigFivePct = results.bigfive?.percentages || {};
  const valoresPct = results.valores?.percentages || {};
  
  // Calcular aderência ao cargo
  let aderencia = 0;
  if (weights.disc_weights) {
    aderencia = 
      (discPct.D || 0) * weights.disc_weights.D +
      (discPct.I || 0) * weights.disc_weights.I +
      (discPct.S || 0) * weights.disc_weights.S +
      (discPct.C || 0) * weights.disc_weights.C;
    aderencia = Math.round(aderencia / 4);
  }
  
  // Análise complementar com IE
  let ieScore = 0;
  if (weights.inteligencia_emocional) {
    const avgIE = Object.values(iePct).reduce((a,b) => a + b, 0) / Object.keys(iePct).length;
    ieScore = Math.round(avgIE * weights.inteligencia_emocional);
  }
  
  // Análise complementar com Big Five
  let bfScore = 0;
  if (weights.lideranca) {
    bfScore = Math.round((bigFivePct.E || 0) * 0.5 + (bigFivePct.C || 0) * 0.3 + (bigFivePct.A || 0) * 0.2);
  }
  
  return {
    job: job,
    aderencia: Math.min(98, Math.round(aderencia)),
    ieScore: Math.min(98, Math.round(ieScore)),
    bfScore: Math.min(98, Math.round(bfScore)),
    weightDetails: weights,
    overall: Math.round((aderencia + ieScore + bfScore) / 3)
  };
}

// ============================================
// 8. NOVA FUNÇÃO: PERFIL SEM CARGO (AUTÔNOMO)
// ============================================
function generateGeneralProfile(results) {
  const discPct = results.disc?.percentages || { D: 0, I: 0, S: 0, C: 0 };
  const dominant = Object.entries(discPct).sort((a,b) => b[1]-a[1])[0]?.[0] || 'D';
  const iePct = results.ie?.percentages || {};
  const bigFivePct = results.bigfive?.percentages || {};
  
  const profiles = {
    D: {
      title: 'Perfil Empreendedor',
      desc: 'Orientado a resultados, assume riscos e lidera iniciativas. Ideal para empreendedorismo, gestão e posições de liderança.',
      areas: ['Liderança', 'Estratégia', 'Tomada de decisão', 'Negociação'],
      strengths: ['Visão estratégica', 'Coragem para inovar', 'Capacidade de decisão'],
      development: ['Paciência processual', 'Escuta ativa', 'Delegação']
    },
    I: {
      title: 'Perfil Influente',
      desc: 'Comunicativo, persuasivo e conectado. Ideal para vendas, marketing, relações públicas e desenvolvimento de pessoas.',
      areas: ['Comunicação', 'Networking', 'Influência', 'Criatividade'],
      strengths: ['Comunicação persuasiva', 'Networking estratégico', 'Criatividade'],
      development: ['Foco em execução', 'Cumprimento de prazos', 'Estruturação de processos']
    },
    S: {
      title: 'Perfil de Suporte',
      desc: 'Estável, paciente e colaborativo. Ideal para atendimento, RH, suporte e gestão de pessoas.',
      areas: ['Empatia', 'Suporte', 'Colaboração', 'Estabilidade'],
      strengths: ['Paciência', 'Escuta ativa', 'Suporte à equipe'],
      development: ['Assertividade', 'Comunicação influente', 'Tomada de decisão ágil']
    },
    C: {
      title: 'Perfil Técnico',
      desc: 'Analítico, preciso e estruturado. Ideal para áreas técnicas, análise de dados, planejamento e controle.',
      areas: ['Análise', 'Precisão', 'Planejamento', 'Qualidade'],
      strengths: ['Análise precisa', 'Planejamento estruturado', 'Atenção a detalhes'],
      development: ['Flexibilidade', 'Agilidade decisória', 'Adaptação a mudanças']
    }
  };
  
  // Adicionar insights de IE
  const avgIE = Object.values(iePct).reduce((a,b) => a + b, 0) / Object.keys(iePct).length;
  let ieInsight = '';
  if (avgIE >= 70) {
    ieInsight = 'Com alta inteligência emocional, potencializa a capacidade de liderar e influenciar positivamente.';
  } else if (avgIE >= 50) {
    ieInsight = 'Com boa inteligência emocional em desenvolvimento, pode ampliar ainda mais seu impacto.';
  } else {
    ieInsight = 'O desenvolvimento da inteligência emocional pode potencializar significativamente seu perfil.';
  }
  
  // Adicionar insights de Big Five
  const bfInsight = bigFivePct.E >= 60 ? 'Alta energia e sociabilidade.' : bigFivePct.C >= 60 ? 'Alta disciplina e organização.' : 'Perfil equilibrado e adaptável.';
  
  const base = profiles[dominant] || profiles.D;
  
  return {
    ...base,
    ieInsight: ieInsight,
    bfInsight: bfInsight,
    fullDescription: `${base.desc} ${ieInsight} ${bfInsight}`
  };
}

// ============================================
// 9. NOVA FUNÇÃO: AVALIAÇÃO DE TURNOVER
// ============================================
function calculateTurnoverRisk(results, job) {
  const discPct = results.disc?.percentages || { D: 0, I: 0, S: 0, C: 0 };
  const iePct = results.ie?.percentages || {};
  const bigFivePct = results.bigfive?.percentages || {};
  
  let risk = 50;
  
  // Estabilidade (S) reduz risco
  risk -= (discPct.S || 0) * 0.2;
  
  // Resiliência (IE) reduz risco
  risk -= (iePct.resiliencia || 0) * 0.15;
  
  // Estabilidade emocional (Big Five N) reduz risco
  risk -= (bigFivePct.N || 0) * 0.1;
  
  // Extroversão (Big Five E) pode aumentar risco em cargos operacionais
  if (job === 'Operacional' || job === 'Financeiro') {
    risk += (bigFivePct.E || 0) * 0.1;
  }
  
  // Se não tiver vaga, reduzir risco
  if (!job) {
    risk -= 10;
  }
  
  // Garantir que fique entre 0 e 100
  risk = Math.max(0, Math.min(100, Math.round(risk)));
  
  let level = '';
  if (risk <= 25) { level = 'Muito Baixo'; }
  else if (risk <= 45) { level = 'Baixo'; }
  else if (risk <= 65) { level = 'Moderado'; }
  else if (risk <= 85) { level = 'Alto'; }
  else { level = 'Muito Alto'; }
  
  return {
    score: risk,
    level: level,
    recommendation: risk <= 45 ? 'Baixo risco de turnover. Perfil estável e engajado.' :
                      risk <= 65 ? 'Risco moderado. Monitorar engajamento e satisfação.' :
                      'Risco elevado. Avaliar fatores de retenção e plano de carreira.'
  };
}

// ============================================
// 10. NOVA FUNÇÃO: POTENCIAL DE CRESCIMENTO
// ============================================
function calculateGrowthPotential(results) {
  const discPct = results.disc?.percentages || { D: 0, I: 0, S: 0, C: 0 };
  const iePct = results.ie?.percentages || {};
  const bigFivePct = results.bigfive?.percentages || {};
  const valoresPct = results.valores?.percentages || {};
  
  let score = 50;
  
  // Dominância (D) indica potencial de liderança
  score += (discPct.D || 0) * 0.15;
  
  // Conscienciosidade (Big Five C) indica potencial de crescimento
  score += (bigFivePct.C || 0) * 0.15;
  
  // Abertura (Big Five O) indica potencial de aprendizado
  score += (bigFivePct.O || 0) * 0.1;
  
  // Autocontrole (IE) indica potencial de regulação
  score += (iePct.autocontrole || 0) * 0.1;
  
  // Realização (Valores) indica ambição
  score += (valoresPct.realizacao || 0) * 0.1;
  
  // Garantir que fique entre 0 e 100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  let level = '';
  if (score >= 80) { level = 'Excelente'; }
  else if (score >= 65) { level = 'Alto'; }
  else if (score >= 50) { level = 'Moderado'; }
  else if (score >= 35) { level = 'Baixo'; }
  else { level = 'Muito Baixo'; }
  
  return {
    score: score,
    level: level,
    recommendation: score >= 65 ? 'Alto potencial de crescimento. Preparado para posições de maior complexidade.' :
                      score >= 50 ? 'Potencial moderado. Com desenvolvimento direcionado, pode acelerar crescimento.' :
                      'Potencial a ser desenvolvido. Investir em capacitação e mentoria.'
  };
}

// ============================================
// 11. NOVA FUNÇÃO: ADERÊNCIA AO CARGO (DETALHADA)
// ============================================
function getJobFitDetails(results, job) {
  const analysis = analyzeByJob(results, job);
  const turnover = calculateTurnoverRisk(results, job);
  const growth = calculateGrowthPotential(results);
  
  return {
    job: job,
    aderencia: analysis.aderencia,
    turnoverRisk: turnover,
    growthPotential: growth,
    overallFit: Math.round((analysis.aderencia + (100 - turnover.score) + growth.score) / 3),
    recommendation: analysis.aderencia >= 80 ? 'Altamente recomendado para este cargo.' :
                    analysis.aderencia >= 60 ? 'Recomendado com desenvolvimento direcionado.' :
                    'Recomendado com restrições. Avaliar outros cargos.'
  };
}

// ============================================
// 12. VERIFICAR CONEXÃO
// ============================================
async function checkConnection() {
  try {
    const { data, error } = await supabaseClient.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Conexão com Supabase OK');
    return true;
  } catch (e) {
    console.warn('⚠️ Sem conexão com Supabase:', e.message);
    return false;
  }
}

// ============================================
// 13. DADOS DE DEMONSTRAÇÃO (FALLBACK)
// ============================================
const VigorreDB = {
  supabase: supabaseClient,
  generateId: generateId,
  formatDate: formatDate,
  formatDateISO: formatDateISO,
  saveToSupabase: saveToSupabase,
  loadFromSupabase: loadFromSupabase,
  loadAllFromSupabase: loadAllFromSupabase,
  deleteFromSupabase: deleteFromSupabase,
  checkConnection: checkConnection,
  detectInconsistency: detectInconsistency,
  calculateConsistency: calculateConsistency,
  analyzeByJob: analyzeByJob,
  generateGeneralProfile: generateGeneralProfile,
  calculateTurnoverRisk: calculateTurnoverRisk,
  calculateGrowthPotential: calculateGrowthPotential,
  getJobFitDetails: getJobFitDetails,
  isOnline: navigator.onLine,
  
  // ============================================
  // USUÁRIOS
  // ============================================
  users: {
    _data: [
      {
        id: 'master1',
        name: 'Administrador Master',
        email: 'master@vigorre.com',
        password: 'adminvigor10',
        role: 'master'
      },
      {
        id: 'admin1',
        name: 'Administrador Staff',
        email: 'admin@vigorre.com',
        password: 'adminvigor10',
        role: 'admin',
        permissions: ['view', 'create', 'edit', 'delete', 'export', 'generate_reports']
      },
      {
        id: 'rec1',
        name: 'Recrutador Teste',
        email: 'recrutador@teste.com',
        password: 'rec123',
        role: 'recruiter',
        companyIds: ['emp1', 'emp2'],
        credits: {
          DISC: 10,
          IE: 8,
          Valores: 5,
          Lideranca: 3,
          Clima: 3
        },
        phone: '(11) 99999-9999',
        document: '123.456.789-00'
      },
      {
        id: 'part1',
        name: 'Participante Teste',
        email: 'participante@teste.com',
        password: 'part123',
        role: 'participant',
        companyId: 'emp1',
        tests: ['DISC', 'IE', 'Valores'],
        completedTests: [],
        status: 'active'
      }
    ],
    
    findByEmail: function(email) {
      return this._data.find(u => u.email === email);
    },
    
    findById: function(id) {
      return this._data.find(u => u.id === id);
    },
    
    findAll: function() {
      return this._data;
    },
    
    add: function(user) {
      this._data.push(user);
      return user;
    },
    
    update: function(id, data) {
      const idx = this._data.findIndex(u => u.id === id);
      if (idx > -1) {
        this._data[idx] = { ...this._data[idx], ...data };
        return this._data[idx];
      }
      return null;
    },
    
    delete: function(id) {
      this._data = this._data.filter(u => u.id !== id);
    }
  },
  
  // ============================================
  // EMPRESAS
  // ============================================
  companies: {
    _data: [
      {
        id: 'emp1',
        name: 'TechCorp Solutions',
        fantasy: 'TechCorp',
        cnpj: '12.345.678/0001-90',
        resp: 'João Silva',
        email: 'contato@techcorp.com',
        phone: '(11) 99999-9999',
        collaborators: 150,
        plan: 'Enterprise',
        credits: {
          DISC: 50,
          IE: 30,
          Valores: 20,
          Lideranca: 10,
          Clima: 10
        },
        status: 'active',
        notes: 'Empresa de tecnologia',
        created_at: '2024-01-01'
      },
      {
        id: 'emp2',
        name: 'InovaLab Brasil',
        fantasy: 'InovaLab',
        cnpj: '98.765.432/0001-10',
        resp: 'Maria Santos',
        email: 'contato@inovalab.com',
        phone: '(11) 88888-8888',
        collaborators: 80,
        plan: 'Business',
        credits: {
          DISC: 20,
          IE: 15,
          Valores: 10,
          Lideranca: 5,
          Clima: 5
        },
        status: 'active',
        notes: 'Laboratório de inovação',
        created_at: '2024-01-15'
      }
    ],
    
    findAll: function() {
      return this._data;
    },
    
    findById: function(id) {
      return this._data.find(c => c.id === id);
    },
    
    findByRecruiter: function(recruiterId) {
      const recruiter = VigorreDB.users.findById(recruiterId);
      if (!recruiter || !recruiter.companyIds) return [];
      return this._data.filter(c => recruiter.companyIds.includes(c.id));
    },
    
    add: function(company) {
      this._data.push(company);
      return company;
    },
    
    update: function(id, data) {
      const idx = this._data.findIndex(c => c.id === id);
      if (idx > -1) {
        this._data[idx] = { ...this._data[idx], ...data };
        return this._data[idx];
      }
      return null;
    },
    
    delete: function(id) {
      this._data = this._data.filter(c => c.id !== id);
    }
  },
  
  // ============================================
  // PARTICIPANTES
  // ============================================
  participants: {
    _data: [
      {
        id: 'part1',
        name: 'Ana Silva',
        email: 'ana@email.com',
        phone: '(11) 77777-7777',
        companyId: 'emp1',
        tests: ['DISC', 'IE', 'Valores'],
        completedTests: [],
        results: {},
        status: 'pending',
        created_at: '2024-01-20'
      },
      {
        id: 'part2',
        name: 'Carlos Souza',
        email: 'carlos@email.com',
        phone: '(11) 66666-6666',
        companyId: 'emp2',
        tests: ['DISC'],
        completedTests: ['DISC'],
        results: {
          DISC: {
            D: 85,
            I: 45,
            S: 60,
            C: 40,
            profile: 'D'
          }
        },
        status: 'completed',
        created_at: '2024-01-22'
      }
    ],
    
    findAll: function() {
      return this._data;
    },
    
    findById: function(id) {
      return this._data.find(p => p.id === id);
    },
    
    findByCompany: function(companyId) {
      return this._data.filter(p => p.companyId === companyId);
    },
    
    add: function(participant) {
      this._data.push(participant);
      return participant;
    },
    
    update: function(id, data) {
      const idx = this._data.findIndex(p => p.id === id);
      if (idx > -1) {
        this._data[idx] = { ...this._data[idx], ...data };
        return this._data[idx];
      }
      return null;
    },
    
    delete: function(id) {
      this._data = this._data.filter(p => p.id !== id);
    }
  },
  
  // ============================================
  // RELATÓRIOS
  // ============================================
  reports: {
    _data: [
      {
        id: 'rep1',
        participantId: 'part1',
        participantName: 'Ana Silva',
        companyName: 'TechCorp Solutions',
        testType: 'DISC',
        date: '2024-05-20',
        status: 'completed',
        summary: 'Perfil D predominante. Excelente para cargos de liderança.',
        results: {
          D: 85,
          I: 45,
          S: 60,
          C: 40,
          profile: 'D'
        }
      },
      {
        id: 'rep2',
        participantId: 'part2',
        participantName: 'Carlos Souza',
        companyName: 'InovaLab Brasil',
        testType: 'IE',
        date: '2024-05-18',
        status: 'completed',
        summary: 'Inteligência Emocional alta. Ótimo para trabalho em equipe.',
        results: {
          self_awareness: 85,
          self_regulation: 75,
          motivation: 90,
          empathy: 80,
          social_skills: 70,
          total: 80
        }
      }
    ],
    
    findAll: function() {
      return this._data;
    },
    
    findById: function(id) {
      return this._data.find(r => r.id === id);
    },
    
    findByParticipant: function(participantId) {
      return this._data.filter(r => r.participantId === participantId);
    },
    
    add: function(report) {
      this._data.push(report);
      return report;
    },
    
    update: function(id, data) {
      const idx = this._data.findIndex(r => r.id === id);
      if (idx > -1) {
        this._data[idx] = { ...this._data[idx], ...data };
        return this._data[idx];
      }
      return null;
    }
  },
  
  // ============================================
  // LOGS DE AUDITORIA
  // ============================================
  auditLogs: {
    _data: [],
    
    add: function(action, userId, details) {
      const log = {
        id: Date.now().toString(),
        action: action,
        userId: userId,
        details: details,
        ip: '127.0.0.1',
        browser: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      this._data.push(log);
      return log;
    },
    
    findAll: function() {
      return this._data;
    },
    
    findByUser: function(userId) {
      return this._data.filter(l => l.userId === userId);
    }
  }
};

// ============================================
// 14. EXPORTAR PARA USO GLOBAL
// ============================================
window.VigorreDB = VigorreDB;
window.supabase = supabaseClient;

// ============================================
// 15. MENSAGEM DE CONFIRMAÇÃO
// ============================================
console.log('🔗 VigorreDB conectado ao Supabase');
console.log('📊 URL:', SUPABASE_URL);
console.log('✅ Sistema pronto para uso online e offline');
console.log('📡 Status:', navigator.onLine ? '🟢 Online' : '🔴 Offline');
console.log('🧠 Motor de Avaliação Avançado ativado!');

// ============================================
// 16. CREDENCIAIS DE ACESSO
// ============================================
console.log('🔐 Credenciais de Acesso:');
console.log('👑 Admin: master@vigorre.com / adminvigor10');
console.log('👤 Admin Staff: admin@vigorre.com / adminvigor10
