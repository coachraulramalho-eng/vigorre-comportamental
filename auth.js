// ============================================
// VIGORRE ONE™ - AUTH.JS (COM LGPD, SESSÃO ÚNICA E CONSENTIMENTO)
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

// ============================================
// GERENCIADOR DE AUTENTICAÇÃO COM LGPD
// ============================================
const VigorreAuth = {
    _currentUser: null,
    _sessionTimeout: 30 * 60 * 1000, // 30 minutos
    _lastActivity: Date.now(),
    _consentimentoVersao: '3.0',
    _testeAtivo: false, // Controle de sessão única

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    init() {
        const sessionData = localStorage.getItem('vigorre_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
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

    // ============================================
    // GETTERS
    // ============================================
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

    getParticipanteId() {
        const user = this.getCurrentUser();
        return user?.participantId || user?.id || null;
    },

    // ============================================
    // LGPD - CONSENTIMENTO
    // ============================================
    verificarConsentimento(participanteId) {
        const consentimento = localStorage.getItem(`consentimento_${participanteId}`);
        if (consentimento) {
            try {
                const data = JSON.parse(consentimento);
                return data.consentido && data.versao === this._consentimentoVersao;
            } catch {
                return false;
            }
        }
        return false;
    },

    registrarConsentimento(participanteId) {
        const data = {
            consentido: true,
            versao: this._consentimentoVersao,
            data: new Date().toISOString(),
            ip: '0.0.0.0',
            userAgent: navigator.userAgent
        };
        localStorage.setItem(`consentimento_${participanteId}`, JSON.stringify(data));
        
        // Log de consentimento (LGPD)
        this._logConsentimento(participanteId, data);
        
        return data;
    },

    revogarConsentimento(participanteId) {
        localStorage.removeItem(`consentimento_${participanteId}`);
        this._logConsentimento(participanteId, { acao: 'revogacao' });
    },

    // ============================================
    // LGPD - LOGS DE CONSENTIMENTO
    // ============================================
    _logConsentimento(participanteId, data) {
        try {
            const logs = JSON.parse(localStorage.getItem('vigorre_consentimento_logs') || '[]');
            logs.push({
                participanteId,
                ...data,
                timestamp: new Date().toISOString()
            });
            if (logs.length > 1000) {
                logs.splice(0, logs.length - 1000);
            }
            localStorage.setItem('vigorre_consentimento_logs', JSON.stringify(logs));
        } catch (e) {
            console.warn('⚠️ Não foi possível registrar log de consentimento');
        }
    },

    // ============================================
    // LGPD - DIREITOS DO PARTICIPANTE
    // ============================================
    solicitarAcessoDados() {
        if (!this.isAuthenticated()) {
            throw new Error('Você precisa estar logado.');
        }
        const user = this._currentUser;
        // Em produção: buscar dados do Supabase
        const dados = {
            usuario: user,
            consentimentos: localStorage.getItem(`consentimento_${user.id}`) || null,
            logs: JSON.parse(localStorage.getItem('vigorre_access_logs') || '[]')
                .filter(log => log.userId === user.id)
        };
        return dados;
    },

    solicitarCorrecaoDados(campos) {
        if (!this.isAuthenticated()) {
            throw new Error('Você precisa estar logado.');
        }
        // Em produção: enviar para API
        alert('📩 Solicitação de correção enviada. Você receberá um e-mail em até 48 horas.');
        return true;
    },

    solicitarExclusaoDados() {
        if (!this.isAuthenticated()) {
            throw new Error('Você precisa estar logado.');
        }
        const user = this._currentUser;
        if (confirm('🔒 LGPD: Esta ação irá solicitar a EXCLUSÃO PERMANENTE de todos os seus dados. Tem certeza?')) {
            // Revoga consentimento
            this.revogarConsentimento(user.id);
            // Em produção: enviar para API
            alert('📩 Solicitação de exclusão enviada. Você receberá um e-mail em até 48 horas.');
            this.logout('Solicitação de exclusão de dados recebida.');
        }
    },

    solicitarPortabilidadeDados() {
        if (!this.isAuthenticated()) {
            throw new Error('Você precisa estar logado.');
        }
        const dados = this.solicitarAcessoDados();
        // Em produção: gerar arquivo JSON/CSV
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dados_${this._currentUser.id}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('📥 Download dos seus dados iniciado!');
    },

    // ============================================
    // LOGIN COM LGPD E CONSENTIMENTO
    // ============================================
    login(email, password, role = ROLES.ORGANIZACAO, consent = false) {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios.');
        }

        // ============================================
        // MOCK DE USUÁRIOS (SUBSTITUIR POR SUPABASE)
        // ============================================
        const mockUsers = {
            'admin@vigorre.com': { 
                name: 'Administrador', 
                role: ROLES.ADMIN, 
                id: 'admin_001',
                password: 'Admin@2026'
            },
            'empresa@vigorre.com': { 
                name: 'Empresa Teste', 
                role: ROLES.ORGANIZACAO, 
                id: 'org_001',
                password: 'Empresa@2026'
            },
            'participante@vigorre.com': { 
                name: 'João Silva', 
                role: ROLES.PARTICIPANTE, 
                id: 'part_001',
                password: 'Part@2026'
            }
        };

        const userData = mockUsers[email];
        if (!userData) {
            throw new Error('Usuário não encontrado.');
        }

        // Verificar senha
        if (userData.password !== password) {
            throw new Error('Senha inválida.');
        }

        // LGPD: Verificar consentimento
        if (!consent) {
            const consentimento = this.verificarConsentimento(userData.id);
            if (!consentimento) {
                // Redirecionar para página de consentimento
                localStorage.setItem('pending_user', JSON.stringify({ email, role, userData }));
                window.location.href = '/consentimento.html';
                return;
            }
        }

        const finalRole = role || userData.role;

        const user = {
            id: userData.id,
            email: email,
            name: userData.name,
            role: finalRole,
            loginAt: new Date().toISOString(),
            ip: '0.0.0.0',
            userAgent: navigator.userAgent,
            consentimento: this.verificarConsentimento(userData.id),
            ...(finalRole === ROLES.ADMIN && { adminId: userData.id }),
            ...(finalRole === ROLES.ORGANIZACAO && { 
                companyId: userData.id, 
                companyName: userData.name 
            }),
            ...(finalRole === ROLES.PARTICIPANTE && { 
                participantId: userData.id 
            })
        };

        // Salvar sessão
        const session = {
            user: user,
            timestamp: Date.now(),
            consentGiven: user.consentimento
        };

        this._currentUser = user;
        this._lastActivity = Date.now();
        localStorage.setItem('vigorre_session', JSON.stringify(session));

        // Log de acesso (LGPD)
        this._logAccess(user);

        // Redirecionar
        const redirectUrl = REDIRECTS[finalRole] || '/';
        window.location.href = redirectUrl;

        return user;
    },

    // ============================================
    // LOGOUT
    // ============================================
    logout(message = 'Sessão encerrada.') {
        const user = this._currentUser;
        if (user) {
            this._logLogout(user);
        }
        this._currentUser = null;
        localStorage.removeItem('vigorre_session');
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
    // SESSÃO ÚNICA - CONTROLE DE TESTE
    // ============================================
    iniciarTeste(participanteId, testeId) {
        // Verifica se já tem teste ativo
        if (this._testeAtivo) {
            throw new Error('⚠️ Você já possui um teste em andamento. Termine antes de iniciar outro.');
        }

        // Verifica consentimento
        if (!this.verificarConsentimento(participanteId)) {
            throw new Error('⚠️ Consentimento LGPD não confirmado. Aceite os termos antes de iniciar o teste.');
        }

        // Cria sessão do teste
        const testeSession = {
            participanteId,
            testeId,
            inicio: Date.now(),
            status: 'em_andamento'
        };

        localStorage.setItem(`teste_session_${participanteId}`, JSON.stringify(testeSession));
        this._testeAtivo = true;
        
        return testeSession;
    },

    finalizarTeste(participanteId) {
        localStorage.removeItem(`teste_session_${participanteId}`);
        this._testeAtivo = false;
    },

    verificarSessaoTeste(participanteId) {
        const session = localStorage.getItem(`teste_session_${participanteId}`);
        if (!session) return null;
        
        try {
            const data = JSON.parse(session);
            // Verifica se passou 30 minutos (tempo máximo)
            if (Date.now() - data.inicio > 30 * 60 * 1000) {
                localStorage.removeItem(`teste_session_${participanteId}`);
                this._testeAtivo = false;
                return null;
            }
            return data;
        } catch {
            return null;
        }
    },

    // ============================================
    // VERIFICAR SESSÃO
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
        session.timestamp = Date.now();
        localStorage.setItem('vigorre_session', JSON.stringify(session));
        return true;
    },

    // ============================================
    // REQUER AUTENTICAÇÃO
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
    },

    // ============================================
    // POLÍTICA DE SENHA
    // ============================================
    validarSenha(senha) {
        const requisitos = {
            min: 8,
            maiuscula: /[A-Z]/.test(senha),
            minuscula: /[a-z]/.test(senha),
            numero: /[0-9]/.test(senha),
            especial: /[!@#$%^&*(),.?":{}|<>]/.test(senha)
        };

        const valida = 
            senha.length >= requisitos.min &&
            requisitos.maiuscula &&
            requisitos.minuscula &&
            requisitos.numero &&
            requisitos.especial;

        return {
            valida,
            requisitos,
            mensagem: valida ? 'Senha válida' : 
                'Senha deve ter: 8 caracteres, maiúscula, minúscula, número e caractere especial'
        };
    },

    // ============================================
    // AUDITORIA - LOG DE AÇÕES
    // ============================================
    logAcao(usuarioId, acao, dados) {
        try {
            const logs = JSON.parse(localStorage.getItem('vigorre_auditoria_logs') || '[]');
            logs.push({
                usuarioId,
                acao,
                dados: dados || {},
                timestamp: new Date().toISOString(),
                ip: '0.0.0.0',
                userAgent: navigator.userAgent
            });
            if (logs.length > 5000) {
                logs.splice(0, logs.length - 5000);
            }
            localStorage.setItem('vigorre_auditoria_logs', JSON.stringify(logs));
        } catch (e) {
            console.warn('⚠️ Não foi possível registrar log de auditoria');
        }
    },

    // ============================================
    // ANONIMIZAÇÃO DE DADOS (LGPD)
    // ============================================
    anonimizarDados(participanteId) {
        // Em produção: chamar API para anonimizar
        const dados = {
            participanteId,
            anonimizado: true,
            data: new Date().toISOString()
        };
        localStorage.setItem(`anonimizado_${participanteId}`, JSON.stringify(dados));
        this.logAcao(participanteId, 'anonimizacao', dados);
        return dados;
    },

    isAnonimizado(participanteId) {
        const data = localStorage.getItem(`anonimizado_${participanteId}`);
        if (!data) return false;
        try {
            return JSON.parse(data).anonimizado;
        } catch {
            return false;
        }
    }
};

// ============================================
// BLOQUEAR NAVEGAÇÃO
// ============================================
(function() {
    window.addEventListener('popstate', function(event) {
        if (window.VigorreAuth && window.VigorreAuth.isAuthenticated()) {
            const user = window.VigorreAuth.getCurrentUser();
            if (user) {
                const redirect = REDIRECTS[user.role] || '/';
                window.location.href = redirect;
            } else {
                window.location.href = '/login.html';
            }
        }
    });

    // Detectar inatividade
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (window.VigorreAuth && window.VigorreAuth.isAuthenticated()) {
                window.VigorreAuth.logout('Inatividade detectada. Sessão encerrada por segurança.');
            }
        }, 30 * 60 * 1000);
    }

    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });
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
    console.log('📋 Versão:', VigorreAuth._consentimentoVersao);
});

console.log('✅ VigorreAuth com LGPD + Sessão Única carregado com sucesso!');
