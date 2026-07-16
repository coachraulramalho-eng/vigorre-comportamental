// ============================================
// VIGORRE ONE™ - AUTH.JS (COM LGPD E SEGURANÇA)
// ============================================

'use strict';

// --- Configuração dos Perfis ---
const ROLES = {
    ADMIN: 'admin',
    ORGANIZACAO: 'organizacao',
    PARTICIPANTE: 'participante'
};

const REDIRECTS = {
    [ROLES.ADMIN]: '/admin/dashboard.html',
    [ROLES.ORGANIZACAO]: '/organizacao/dashboard.html',
    [ROLES.PARTICIPANTE]: '/participante/dashboard.html'
};

// --- Gerenciador de Autenticação com LGPD ---
const VigorreAuth = {
    _currentUser: null,
    _sessionTimeout: 30 * 60 * 1000, // 30 minutos
    _lastActivity: Date.now(),

    init() {
        // Verificar se há sessão
        const sessionData = localStorage.getItem('vigorre_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                // Verificar expiração
                if (Date.now() - session.timestamp > this._sessionTimeout) {
                    this.logout('Sessão expirada. Faça login novamente.');
                    return null;
                }
                this._currentUser = session.user;
                this._lastActivity = session.timestamp;
                return this._currentUser;
            } catch (e) {
                this.logout('Sessão inválida.');
                return null;
            }
        }
        return null;
    },

    getCurrentUser() {
        if (!this._currentUser) {
            this.init();
        }
        return this._currentUser;
    },

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    isOrganizacao() {
        return this.hasRole(ROLES.ORGANIZACAO);
    },

    isAdmin() {
        return this.hasRole(ROLES.ADMIN);
    },

    isParticipante() {
        return this.hasRole(ROLES.PARTICIPANTE);
    },

    // ============================================
    // LOGIN COM LGPD (consentimento)
    // ============================================
    login(email, password, role = ROLES.ORGANIZACAO, consent = false) {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios.');
        }

        // LGPD: Verificar consentimento
        if (!consent) {
            if (!confirm('🔒 LGPD: Ao continuar, você concorda com o tratamento dos seus dados conforme nossa Política de Privacidade. Deseja prosseguir?')) {
                throw new Error('Consentimento LGPD necessário para acessar a plataforma.');
            }
        }

        // Mock de usuários
        const mockUsers = {
            'admin@vigorre.com': { name: 'Administrador', role: ROLES.ADMIN, id: 'admin_001' },
            'empresa@vigorre.com': { name: 'Empresa Teste', role: ROLES.ORGANIZACAO, id: 'org_001' },
            'participante@vigorre.com': { name: 'João Silva', role: ROLES.PARTICIPANTE, id: 'part_001' }
        };

        const userData = mockUsers[email];
        if (!userData) {
            throw new Error('Usuário não encontrado. Use: admin@vigorre.com, empresa@vigorre.com ou participante@vigorre.com');
        }

        const finalRole = role || userData.role;

        const user = {
            id: userData.id || 'user_' + Date.now(),
            email: email,
            name: userData.name || email.split('@')[0],
            role: finalRole,
            loginAt: new Date().toISOString(),
            ip: '0.0.0.0', // Em produção, pegar IP real
            userAgent: navigator.userAgent,
            ...(finalRole === ROLES.ADMIN && { adminId: userData.id || 'admin_001' }),
            ...(finalRole === ROLES.ORGANIZACAO && { companyId: userData.id || 'org_' + Date.now(), companyName: userData.name || 'Empresa' }),
            ...(finalRole === ROLES.PARTICIPANTE && { participantId: userData.id || 'part_' + Date.now() })
        };

        // Salvar sessão com timestamp
        const session = {
            user: user,
            timestamp: Date.now(),
            consentGiven: true
        };

        this._currentUser = user;
        this._lastActivity = Date.now();
        localStorage.setItem('vigorre_session', JSON.stringify(session));

        // Log de acesso (LGPD)
        this._logAccess(user);

        const redirectUrl = REDIRECTS[finalRole] || '/';
        window.location.href = redirectUrl;

        return user;
    },

    // ============================================
    // LOGOUT (LGPD - esquecimento)
    // ============================================
    logout(message = 'Sessão encerrada.') {
        const user = this._currentUser;
        if (user) {
            // Log de logout (LGPD)
            this._logLogout(user);
        }
        this._currentUser = null;
        localStorage.removeItem('vigorre_session');
        
        // Redirecionar para login com mensagem
        window.location.href = '/login.html?message=' + encodeURIComponent(message);
    },

    // ============================================
    // LGPD - LOGS DE ACESSO
    // ============================================
    _logAccess(user) {
        try {
            const logs = JSON.parse(localStorage.getItem('vigorre_access_logs') || '[]');
            logs.push({
                userId: user.id,
                email: user.email,
                action: 'login',
                timestamp: new Date().toISOString(),
                ip: '0.0.0.0',
                userAgent: navigator.userAgent
            });
            // Manter apenas últimos 1000 logs (LGPD - retenção)
            if (logs.length > 1000) {
                logs.splice(0, logs.length - 1000);
            }
            localStorage.setItem('vigorre_access_logs', JSON.stringify(logs));
        } catch (e) {
            console.warn('⚠️ Não foi possível registrar log de acesso');
        }
    },

    _logLogout(user) {
        try {
            const logs = JSON.parse(localStorage.getItem('vigorre_access_logs') || '[]');
            logs.push({
                userId: user.id,
                email: user.email,
                action: 'logout',
                timestamp: new Date().toISOString()
            });
            if (logs.length > 1000) {
                logs.splice(0, logs.length - 1000);
            }
            localStorage.setItem('vigorre_access_logs', JSON.stringify(logs));
        } catch (e) {
            console.warn('⚠️ Não foi possível registrar log de logout');
        }
    },

    // ============================================
    // LGPD - SOLICITAR EXCLUSÃO DE DADOS
    // ============================================
    requestDataDeletion() {
        if (!this.isAuthenticated()) {
            throw new Error('Você precisa estar logado para solicitar exclusão.');
        }
        const user = this._currentUser;
        if (confirm('🔒 LGPD: Esta ação irá solicitar a exclusão de todos os seus dados da plataforma. Tem certeza?')) {
            // Em produção, enviar requisição para API
            alert('📩 Solicitação de exclusão enviada. Você receberá um e-mail em até 48 horas.');
            this.logout('Solicitação de exclusão de dados recebida.');
        }
    },

    // ============================================
    // VERIFICAR SESSÃO ATIVA (contra navegação)
    // ============================================
    checkSession() {
        if (!this.isAuthenticated()) {
            return false;
        }
        const session = JSON.parse(localStorage.getItem('vigorre_session') || '{}');
        if (Date.now() - session.timestamp > this._sessionTimeout) {
            this.logout('Sessão expirada. Faça login novamente.');
            return false;
        }
        // Atualizar timestamp
        session.timestamp = Date.now();
        localStorage.setItem('vigorre_session', JSON.stringify(session));
        return true;
    },

    // ============================================
    // REQUER AUTENTICAÇÃO (com bloqueio)
    // ============================================
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.logout('Acesso não autorizado.');
            return false;
        }
        if (!this.checkSession()) {
            return false;
        }
        return true;
    },

    requireAdmin() {
        if (!this.requireAuth()) return false;
        if (!this.isAdmin()) {
            this.logout('Acesso restrito a administradores.');
            return false;
        }
        return true;
    },

    requireOrganizacao() {
        if (!this.requireAuth()) return false;
        if (!this.isOrganizacao()) {
            this.logout('Acesso restrito a organizações.');
            return false;
        }
        return true;
    },

    requireParticipante() {
        if (!this.requireAuth()) return false;
        if (!this.isParticipante()) {
            this.logout('Acesso restrito a participantes.');
            return false;
        }
        return true;
    }
};

// ============================================
// BLOQUEAR NAVEGAÇÃO (seta do navegador)
// ============================================
(function() {
    // Bloquear navegação para trás
    window.addEventListener('popstate', function(event) {
        if (window.VigorreAuth && window.VigorreAuth.isAuthenticated()) {
            // Se tentar voltar, redirecionar para o dashboard
            const user = window.VigorreAuth.getCurrentUser();
            if (user) {
                const redirect = REDIRECTS[user.role] || '/';
                window.location.href = redirect;
            } else {
                window.location.href = '/login.html';
            }
        }
    });

    // Impedir fechamento acidental
    window.addEventListener('beforeunload', function(e) {
        if (window.VigorreAuth && window.VigorreAuth.isAuthenticated()) {
            // Não mostrar mensagem, apenas garantir que a sessão continua
            return;
        }
    });

    // Detectar inatividade (30 minutos)
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (window.VigorreAuth && window.VigorreAuth.isAuthenticated()) {
                window.VigorreAuth.logout('Inatividade detectada. Sessão encerrada por segurança.');
            }
        }, 30 * 60 * 1000);
    }

    // Resetar timer em eventos de interação
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });

    // Iniciar timer
    resetInactivityTimer();
})();

// ============================================
// EXPORTAÇÃO GLOBAL
// ============================================
window.VigorreAuth = VigorreAuth;

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    VigorreAuth.init();
    console.log('✅ VIGORRE ONE™ - Sistema de Autenticação LGPD carregado');
});

console.log('✅ VigorreAuth com LGPD carregado com sucesso!');
