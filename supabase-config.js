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
// 5. VERIFICAR CONEXÃO
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
// 6. DADOS DE DEMONSTRAÇÃO (FALLBACK)
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
  isOnline: navigator.onLine,
  
  // ============================================
  // USUÁRIOS (com senha admin atualizada)
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
// 7. EXPORTAR PARA USO GLOBAL
// ============================================
window.VigorreDB = VigorreDB;
window.supabase = supabaseClient;

// ============================================
// 8. MENSAGEM DE CONFIRMAÇÃO
// ============================================
console.log('🔗 VigorreDB conectado ao Supabase');
console.log('📊 URL:', SUPABASE_URL);
console.log('✅ Sistema pronto para uso online e offline');
console.log('📡 Status:', navigator.onLine ? '🟢 Online' : '🔴 Offline');

// ============================================
// 9. CREDENCIAIS DE ACESSO
// ============================================
console.log('🔐 Credenciais de Acesso:');
console.log('👑 Admin: master@vigorre.com / adminvigor10');
console.log('👤 Admin Staff: admin@vigorre.com / adminvigor10');
console.log('🎯 Recrutador: recrutador@teste.com / rec123');
console.log('👤 Participante: participante@teste.com / part123');

// Monitorar mudanças de conexão
window.addEventListener('online', () => {
  console.log('🟢 Conexão restaurada - sincronizando...');
  window.VigorreDB.isOnline = true;
});

window.addEventListener('offline', () => {
  console.log('🔴 Conexão perdida - modo offline ativado');
  window.VigorreDB.isOnline = false;
});
