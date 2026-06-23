// ============================================
// VIGORRE ONE™ - SISTEMA DE AUTENTICAÇÃO
// Enterprise People Analytics Platform
// ============================================

class VigorreAuth {
  constructor() {
    this.SESSION_KEY = 'vigorre_session';
    this.USER_KEY = 'vigorre_current_user';
    this.TOKEN_KEY = 'vigorre_token';
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
      // Tenta Supabase
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
      
      // FALLBACK: Dados locais
      const user = VigorreDB.users.findByEmail(email);
      
      if (!user) throw new Error('Usuário não encontrado');
      if (user.password !== password) throw new Error('Senha incorreta');
      
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
    
    if (requiredRole === 'admin') {
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
}

// ============================================
// INSTANCIA GLOBAL
// ============================================
const auth = new VigorreAuth();
window.VigorreAuth = auth;

console.log('🔐 Vigorre Auth inicializado');
console.log('📊 Usuário atual:', auth.getCurrentUser()?.name || 'Nenhum');
