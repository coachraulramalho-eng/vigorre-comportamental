// ============================================
// VIGORRE ONE™ - SISTEMA DE AUTENTICAÇÃO
// Enterprise People Analytics Platform
// ============================================

class VigorreAuth {
  constructor() {
    this.SESSION_KEY = 'vigorre_session';
    this.USER_KEY = 'vigorre_current_user';
    this.TOKEN_KEY = 'vigorre_token';
    this.HISTORY_KEY = 'vigorre_test_history';
    this.currentUser = null;
    this.sessionTimer = null;
    this.init();
  }
  
  // ============================================
  // INICIALIZAR
  // ============================================
  init() {
    const session = localStorage.getItem(this.SESSION_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (session && user && token) {
      try {
        const sessionData = JSON.parse(session);
        const userData = JSON.parse(user);
        
        if (Date.now() < sessionData.expiresAt) {
          this.currentUser = userData;
          this.startSessionTimer();
          console.log('✅ Sessão restaurada:', userData.name);
          return true;
        } else {
          this.logout();
          return false;
        }
      } catch (e) {
        console.error('❌ Erro ao restaurar sessão:', e);
        this.logout();
        return false;
      }
    }
    return false;
  }
  
  // ============================================
  // LOGIN
  // ============================================
  async login(email, password) {
    try {
      // Tentar Supabase primeiro
      if (window.supabase) {
        try {
          const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
          });
          
          if (data && data.user) {
            const { data: userData } = await window.supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (userData) {
              return this.createSession(userData);
            }
          }
        } catch (e) {
          console.warn('⚠️ Supabase fallback:', e);
        }
      }
      
      // FALLBACK: Dados locais de exemplo
      // === CREDENCIAIS DE TESTE ===
      // 👑 Admin: master@vigorre.com / adminvigor10
      // 🎯 Recrutador: recrutador@teste.com / rec123
      // 👤 Participante: participante@teste.com / part123
      
      const users = [
        {
          id: 'admin1',
          name: 'Administrador Master',
          email: 'master@vigorre.com',
          password: 'adminvigor10',
          role: 'master',
          permissions: ['all']
        },
        {
          id: 'admin2',
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
          tests: ['DISC', 'IE', 'Valores', 'BigFive', 'SWOT'],
          completedTests: [],
          status: 'active'
        }
      ];
      
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      if (user.password !== password) {
        throw new Error('Senha incorreta');
      }
      
      // Remove a senha antes de salvar
      const { password: _, ...userData } = user;
      return this.createSession(userData);
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  }
  
  // ============================================
  // CRIAR SESSÃO
  // ============================================
  createSession(userData) {
    const session = {
      userId: userData.id,
      role: userData.role,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24h
      createdAt: Date.now()
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    localStorage.setItem(this.TOKEN_KEY, btoa(JSON.stringify({
      userId: userData.id,
      timestamp: Date.now()
    })));
    
    this.currentUser = userData;
    this.startSessionTimer();
    
    console.log('✅ Sessão criada:', userData.name);
    return userData;
  }
  
  // ============================================
  // VERIFICAR AUTENTICAÇÃO
  // ============================================
  isAuthenticated() {
    const session = localStorage.getItem(this.SESSION_KEY);
    if (!session) return false;
    
    try {
      const sessionData = JSON.parse(session);
      return Date.now() < sessionData.expiresAt;
    } catch (e) {
      return false;
    }
  }
  
  // ============================================
  // OBTER USUÁRIO ATUAL
  // ============================================
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
    } catch (e) {
      console.error('❌ Erro ao obter usuário:', e);
    }
    return null;
  }
  
  // ============================================
  // VERIFICAR PERMISSÃO
  // ============================================
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (requiredRole === 'admin' || requiredRole === 'master') {
      return user.role === 'admin' || user.role === 'master';
    }
    
    if (requiredRole === 'recruiter') {
      return user.role === 'recruiter' || user.role === 'admin' || user.role === 'master';
    }
    
    if (requiredRole === 'participant') {
      return user.role === 'participant';
    }
    
    return true;
  }
  
  // ============================================
  // INICIAR TIMER DA SESSÃO
  // ============================================
  startSessionTimer() {
    if (this.sessionTimer) clearInterval(this.sessionTimer);
    
    this.sessionTimer = setInterval(() => {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (!session) {
        this.logout();
        return;
      }
      
      try {
        const sessionData = JSON.parse(session);
        if (Date.now() > sessionData.expiresAt) {
          console.log('⏰ Sessão expirada');
          this.logout();
        }
      } catch (e) {
        this.logout();
      }
    }, 60000);
  }
  
  // ============================================
  // RENOVAR SESSÃO
  // ============================================
  refreshSession() {
    const session = localStorage.getItem(this.SESSION_KEY);
    if (!session) return false;
    
    try {
      const sessionData = JSON.parse(session);
      sessionData.expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // ============================================
  // LOGOUT
  // ============================================
  logout() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('vigorre_scope');
    localStorage.removeItem('vigorre_remember');
    
    this.currentUser = null;
    console.log('👋 Usuário desconectado');
    
    if (!window.location.pathname.includes('login')) {
      window.location.href = '/login.html';
    }
  }
  
  // ============================================
  // REDIRECIONAR POR ROLE
  // ============================================
  redirectByRole(user) {
    const role = user.role || 'participant';
    
    const routes = {
      'master': '/admin/dashboard.html',
      'admin': '/admin/dashboard.html',
      'recruiter': '/recrutador/dashboard.html',
      'participant': '/participante/dashboard.html'
    };
    
    window.location.href = routes[role] || '/login.html';
  }
  
  // ============================================
  // VALIDAR ACESSO À PÁGINA
  // ============================================
  guardPage(requiredRole) {
    if (!this.isAuthenticated()) {
      this.logout();
      return false;
    }
    
    if (requiredRole && !this.hasRole(requiredRole)) {
      alert('⚠️ Você não tem permissão para acessar esta página.');
      this.logout();
      return false;
    }
    
    this.refreshSession();
    return true;
  }
  
  // ============================================
  // SALVAR HISTÓRICO DE TESTES
  // ============================================
  saveTestHistory(testType, results) {
    try {
      const history = JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
      const user = this.getCurrentUser();
      
      history.push({
        id: Date.now().toString(),
        userId: user?.id || 'unknown',
        testType: testType,
        results: results,
        timestamp: new Date().toISOString(),
        consistency: window.VigorreDB?.calculateConsistency ? 
          window.VigorreDB.calculateConsistency(
            history.filter(h => h.testType === testType && h.userId === user?.id).slice(-1)[0]?.results,
            results
          ) : null
      });
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      console.log('✅ Histórico de teste salvo:', testType);
    } catch (e) {
      console.error('❌ Erro ao salvar histórico:', e);
    }
  }
  
  // ============================================
  // OBTER HISTÓRICO DE TESTES
  // ============================================
  getTestHistory(testType) {
    try {
      const history = JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
      const user = this.getCurrentUser();
      return history.filter(h => h.testType === testType && h.userId === user?.id);
    } catch (e) {
      console.error('❌ Erro ao obter histórico:', e);
      return [];
    }
  }
  
  // ============================================
  // VERIFICAR CONSISTÊNCIA DO TESTE
  // ============================================
  checkTestConsistency(testType, currentResults) {
    const history = this.getTestHistory(testType);
    if (history.length < 2) {
      return { status: 'no_data', message: 'Primeira realização do teste. Sem dados anteriores para comparação.' };
    }
    
    const previous = history[history.length - 1]?.results;
    if (!previous) {
      return { status: 'no_data', message: 'Sem dados anteriores para comparação.' };
    }
    
    return window.VigorreDB?.calculateConsistency(previous, currentResults) || { status: 'unknown', message: 'Não foi possível calcular a consistência.' };
  }
  
  // ============================================
  // REGISTRAR ATIVIDADE
  // ============================================
  logActivity(action, details) {
    try {
      const user = this.getCurrentUser();
      if (window.VigorreDB?.auditLogs) {
        window.VigorreDB.auditLogs.add(action, user?.id || 'unknown', details);
        console.log('📝 Atividade registrada:', action);
      }
    } catch (e) {
      console.error('❌ Erro ao registrar atividade:', e);
    }
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================
const auth = new VigorreAuth();
window.VigorreAuth = auth;

console.log('🔐 Vigorre Auth inicializado');
console.log('📊 Usuário atual:', auth.getCurrentUser()?.name || 'Nenhum');
console.log('🧠 Sistema de autenticação com histórico e consistência ativado!');
console.log('');
console.log('🔐 Credenciais de Demonstração:');
console.log('👑 Admin: master@vigorre.com / adminvigor10');
console.log('🎯 Recrutador: recrutador@teste.com / rec123');
console.log('👤 Participante: participante@teste.com / part123');
