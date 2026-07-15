/**
 * ============================================
 * VIGORRE ONE™ - AUTH CENTRAL
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 3.0.0 (SECURE)
 * DATA: 15/07/2026
 * 
 * SEGURANÇA:
 * - Sessão com expiração (15 minutos)
 * - Bloqueio de navegação via histórico
 * - Proteção contra gravação de senha
 * - Logout automático em inatividade
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO DE AUTENTICAÇÃO
// ============================================
const AUTH_CONFIG = {
    // Tempo de expiração da sessão (em milissegundos)
    sessionTimeout: 15 * 60 * 1000, // 15 minutos
    
    // Papéis e rotas
    roles: {
        'master': {
            name: 'Master Admin',
            redirect: '/admin/dashboard.html',
            label: '👑 Master',
            level: 5
        },
        'admin': {
            name: 'Administrador',
            redirect: '/admin/dashboard.html',
            label: '👤 Admin',
            level: 4
        },
        'consultant': {
            name: 'Consultor',
            redirect: '/consultor/dashboard.html',
            label: '📊 Consultor',
            level: 3
        },
        'recruiter': {
            name: 'Recrutador',
            redirect: '/recrutador/dashboard.html',
            label: '🎯 Recrutador',
            level: 2
        },
        'company': {
            name: 'Empresa',
            redirect: '/empresa/dashboard.html',
            label: '🏢 Empresa',
            level: 2
        },
        'participant': {
            name: 'Participante',
            redirect: '/participante/dashboard.html',
            label: '👤 Participante',
            level: 1
        }
    },

    // Usuários mockados (em produção, usar banco de dados)
    mockUsers: [
        {
            id: '1',
            email: 'master@vigorre.com',
            password: 'adminvigor10',
            name: 'Master Admin',
            role: 'master',
            avatar: '👑',
            credits: { DISC: 1000, IE: 1000, VALORES: 1000, SWOT: 1000, BIGFIVE: 1000 }
        },
        {
            id: '2',
            email: 'admin@vigorre.com',
            password: 'adminvigor10',
            name: 'Administrador',
            role: 'admin',
            avatar: '👤',
            credits: { DISC: 500, IE: 500, VALORES: 500, SWOT: 500, BIGFIVE: 500 }
        },
        {
            id: '3',
            email: 'recrutador@teste.com',
            password: 'rec123',
            name: 'João Recrutador',
            role: 'recruiter',
            avatar: '🎯',
            credits: { DISC: 50, IE: 30, VALORES: 20, SWOT: 10, BIGFIVE: 10 }
        },
        {
            id: '4',
            email: 'participante@teste.com',
            password: 'part123',
            name: 'Ana Participante',
            role: 'participant',
            avatar: '👤',
            credits: { DISC: 0, IE: 0, VALORES: 0, SWOT: 0, BIGFIVE: 0 }
        },
        {
            id: '5',
            email: 'empresa@teste.com',
            password: 'emp123',
            name: 'TechCorp Solutions',
            role: 'company',
            avatar: '🏢',
            credits: { DISC: 100, IE: 80, VALORES: 60, SWOT: 40, BIGFIVE: 30 }
        },
        {
            id: '6',
            email: 'consultor@teste.com',
            password: 'cons123',
            name: 'Maria Consultora',
            role: 'consultant',
            avatar: '📊',
            credits: { DISC: 200, IE: 150, VALORES: 100, SWOT: 80, BIGFIVE: 60 }
        }
    ],

    // Tokens (em produção, usar JWT)
    tokenExpiry: 15 * 60 * 1000, // 15 minutos
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000 // 7 dias
};

// ============================================
// CLASSE DE AUTENTICAÇÃO
// ============================================
class VigorreAuth {

    // ============================================
    // INICIALIZAR - BLOQUEIO DE NAVEGAÇÃO
    // ============================================
    static init() {
        console.log('🔐 Inicializando sistema de segurança...');
        
        // Bloquear navegação via histórico (botão voltar)
        this.blockHistoryNavigation();
        
        // Verificar sessão em todas as páginas
        this.checkSessionOnLoad();
        
        // Detectar inatividade
        this.setupInactivityDetection();
        
        // Prevenir gravação de senha
        this.preventPasswordSaving();
        
        console.log('✅ Sistema de segurança inicializado');
    }

    // ============================================
    // BLOQUEAR NAVEGAÇÃO VIA HISTÓRICO
    // ============================================
    static blockHistoryNavigation() {
        // Prevenir que o usuário volte após logout
        window.addEventListener('popstate', function(event) {
            if (!VigorreAuth.isAuthenticated()) {
                console.warn('⛔ Bloqueando navegação via histórico (não autenticado)');
                window.location.href = '/login.html';
                return false;
            }
            // Se estiver autenticado, permite
        });

        // Substituir o histórico para que o botão voltar não funcione após logout
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, window.location.href);
            window.addEventListener('popstate', function() {
                if (!VigorreAuth.isAuthenticated()) {
                    window.location.href = '/login.html';
                } else {
                    window.history.pushState(null, null, window.location.href);
                }
            });
        }
    }

    // ============================================
    // VERIFICAR SESSÃO AO CARREGAR
    // ============================================
    static checkSessionOnLoad() {
        var protectedPages = [
            '/admin/',
            '/empresa/',
            '/consultor/',
            '/recrutador/',
            '/participante/'
        ];

        var currentPath = window.location.pathname;
        var isProtected = protectedPages.some(function(path) {
            return currentPath.includes(path);
        });

        // Se for página protegida e não estiver autenticado
        if (isProtected && !this.isAuthenticated()) {
            console.warn('⛔ Página protegida - Redirecionando para login');
            window.location.href = '/login.html';
            return;
        }

        // Se estiver autenticado, renovar token
        if (this.isAuthenticated()) {
            this.refreshToken();
        }
    }

    // ============================================
    // DETECTAR INATIVIDADE
    // ============================================
    static setupInactivityDetection() {
        var timeoutId = null;
        var timeout = 15 * 60 * 1000; // 15 minutos

        function resetTimer() {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(function() {
                if (VigorreAuth.isAuthenticated()) {
                    console.warn('⏰ Sessão expirada por inatividade');
                    VigorreAuth.logout();
                }
            }, timeout);
        }

        // Eventos que reiniciam o timer
        var events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        for (var i = 0; i < events.length; i++) {
            document.addEventListener(events[i], resetTimer);
        }

        // Iniciar timer
        resetTimer();
    }

    // ============================================
    // PREVENIR GRAVAÇÃO DE SENHA
    // ============================================
    static preventPasswordSaving() {
        // Adicionar atributos a todos os inputs de senha
        var passwordInputs = document.querySelectorAll('input[type="password"]');
        for (var i = 0; i < passwordInputs.length; i++) {
            passwordInputs[i].setAttribute('autocomplete', 'off');
            passwordInputs[i].setAttribute('autocomplete', 'new-password');
            passwordInputs[i].setAttribute('readonly', 'readonly');
            passwordInputs[i].addEventListener('focus', function() {
                this.removeAttribute('readonly');
            });
        }

        // Prevenir que o navegador salve senhas
        var forms = document.querySelectorAll('form');
        for (var j = 0; j < forms.length; j++) {
            forms[j].setAttribute('autocomplete', 'off');
        }
    }

    // ============================================
    // LOGIN
    // ============================================
    static login(email, password) {
        try {
            if (!email || !password) {
                return { success: false, message: '❌ Preencha todos os campos' };
            }

            var user = null;
            for (var i = 0; i < AUTH_CONFIG.mockUsers.length; i++) {
                if (AUTH_CONFIG.mockUsers[i].email === email &&
                    AUTH_CONFIG.mockUsers[i].password === password) {
                    user = AUTH_CONFIG.mockUsers[i];
                    break;
                }
            }

            if (!user) {
                var emailExists = false;
                for (var j = 0; j < AUTH_CONFIG.mockUsers.length; j++) {
                    if (AUTH_CONFIG.mockUsers[j].email === email) {
                        emailExists = true;
                        break;
                    }
                }

                if (emailExists) {
                    return { success: false, message: '❌ Senha incorreta' };
                }

                return { success: false, message: '❌ Usuário não encontrado' };
            }

            // Criar token de sessão
            var token = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
            var refreshToken = 'refresh_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);

            // Salvar sessão (sem a senha!)
            var sessionUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                credits: user.credits,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('vigorre_user', JSON.stringify(sessionUser));
            localStorage.setItem('vigorre_token', token);
            localStorage.setItem('vigorre_refresh_token', refreshToken);
            localStorage.setItem('vigorre_login_time', new Date().toISOString());
            localStorage.setItem('vigorre_token_expiry', new Date(Date.now() + AUTH_CONFIG.tokenExpiry).toISOString());

            this.logAudit(user.id, user.name, 'Login', 'Login no sistema', 'baixo');

            // OBTER REDIRECT CORRETO
            var redirect = this.getRedirectUrl(user.role);

            console.log('🔐 Login bem-sucedido! Redirecionando para:', redirect);

            return {
                success: true,
                user: sessionUser,
                redirect: redirect,
                message: '✅ Login realizado com sucesso!'
            };

        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { success: false, message: '❌ Erro interno no login' };
        }
    }

    // ============================================
    // LOGOUT COM BLOQUEIO DE HISTÓRICO
    // ============================================
    static logout() {
        try {
            var user = this.getCurrentUser();
            if (user) {
                this.logAudit(user.id, user.name, 'Logout', 'Logout do sistema', 'baixo');
            }
        } catch (error) {
            console.warn('⚠️ Erro ao registrar logout:', error);
        }

        // Limpar todos os dados da sessão
        localStorage.removeItem('vigorre_user');
        localStorage.removeItem('vigorre_token');
        localStorage.removeItem('vigorre_refresh_token');
        localStorage.removeItem('vigorre_login_time');
        localStorage.removeItem('vigorre_token_expiry');

        // Limpar o histórico para impedir volta
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, '/login.html');
        }

        // Redirecionar para login
        window.location.replace('/login.html');
    }

    // ============================================
    // VERIFICAR AUTENTICAÇÃO
    // ============================================
    static isAuthenticated() {
        try {
            var token = localStorage.getItem('vigorre_token');
            var user = this.getCurrentUser();
            var expiry = localStorage.getItem('vigorre_token_expiry');

            if (!token || !user) {
                return false;
            }

            // Verificar expiração
            if (expiry) {
                var now = new Date();
                var expiryDate = new Date(expiry);
                if (now > expiryDate) {
                    console.warn('⏰ Token expirado');
                    this.logout();
                    return false;
                }
            }

            return true;

        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            return false;
        }
    }

    // ============================================
    // RENOVAR TOKEN
    // ============================================
    static refreshToken() {
        try {
            var refreshToken = localStorage.getItem('vigorre_refresh_token');
            if (!refreshToken) {
                this.logout();
                return false;
            }

            var user = this.getCurrentUser();
            if (!user) {
                this.logout();
                return false;
            }

            var newToken = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
            localStorage.setItem('vigorre_token', newToken);
            localStorage.setItem('vigorre_token_expiry', new Date(Date.now() + AUTH_CONFIG.tokenExpiry).toISOString());

            this.logAudit(user.id, user.name, 'Refresh Token', 'Token renovado', 'baixo');

            return true;

        } catch (error) {
            console.error('❌ Erro ao renovar token:', error);
            return false;
        }
    }

    // ============================================
    // USUÁRIO ATUAL
    // ============================================
    static getCurrentUser() {
        try {
            var userData = localStorage.getItem('vigorre_user');
            if (!userData) {
                return null;
            }

            var user = JSON.parse(userData);

            if (user && user.id) {
                user.credits = this.getUserCredits(user.id);
                user.roleLabel = this.getRoleLabel(user.role);
                user.roleName = this.getRoleName(user.role);
            }

            return user;

        } catch (error) {
            console.error('❌ Erro ao obter usuário atual:', error);
            return null;
        }
    }

    // ============================================
    // CRÉDITOS DO USUÁRIO
    // ============================================
    static getUserCredits(userId) {
        try {
            var transactions = JSON.parse(localStorage.getItem('vigorre_credit_transactions') || '[]');
            var credits = {
                DISC: 0,
                IE: 0,
                VALORES: 0,
                SWOT: 0,
                BIGFIVE: 0
            };

            var creditTypes = ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE'];

            for (var i = 0; i < transactions.length; i++) {
                var t = transactions[i];
                if (t.userId === userId || t.recruiterId === userId || t.companyId === userId) {
                    for (var j = 0; j < creditTypes.length; j++) {
                        var type = creditTypes[j];
                        if (t.type === 'credito' || t.type === 'ajuste') {
                            credits[type] += t[type] || 0;
                        } else if (t.type === 'debito') {
                            credits[type] -= t[type] || 0;
                        }
                    }
                }
            }

            var hasCredits = false;
            for (var key in credits) {
                if (credits[key] > 0) {
                    hasCredits = true;
                    break;
                }
            }

            if (!hasCredits) {
                for (var k = 0; k < AUTH_CONFIG.mockUsers.length; k++) {
                    if (AUTH_CONFIG.mockUsers[k].id === userId) {
                        var mockCredits = AUTH_CONFIG.mockUsers[k].credits || {};
                        for (var key2 in credits) {
                            credits[key2] = mockCredits[key2] || 0;
                        }
                        break;
                    }
                }
            }

            return credits;

        } catch (error) {
            console.warn('⚠️ Erro ao buscar créditos:', error);
            return { DISC: 0, IE: 0, VALORES: 0, SWOT: 0, BIGFIVE: 0 };
        }
    }

    // ============================================
    // AUDITORIA
    // ============================================
    static logAudit(userId, userName, action, description, severity) {
        try {
            var logs = JSON.parse(localStorage.getItem('vigorre_audit_logs') || '[]');

            var id = 'A' + Date.now().toString().slice(-6) +
                Math.random().toString(36).slice(2, 5).toUpperCase();

            logs.push({
                id: id,
                userId: userId || 'system',
                user: userName || 'Sistema',
                action: action || 'Ação',
                description: description || '',
                severity: severity || 'baixo',
                ip: '127.0.0.1',
                userAgent: navigator.userAgent,
                date: new Date().toLocaleString('pt-BR'),
                timestamp: new Date().toISOString()
            });

            if (logs.length > 1000) {
                logs = logs.slice(-1000);
            }

            localStorage.setItem('vigorre_audit_logs', JSON.stringify(logs));

        } catch (error) {
            console.warn('⚠️ Erro ao registrar auditoria:', error);
        }
    }

    // ============================================
    // VERIFICAR PAPEL
    // ============================================
    static hasRole(role) {
        var user = this.getCurrentUser();
        if (!user) return false;

        if (Array.isArray(role)) {
            return role.indexOf(user.role) !== -1;
        }

        return user.role === role;
    }

    // ============================================
    // OBTER REDIRECT
    // ============================================
    static getRedirectUrl(role) {
        var config = AUTH_CONFIG.roles[role];
        if (!config) {
            console.warn('⚠️ Papel não encontrado:', role);
            return '/login.html';
        }
        return config.redirect;
    }

    // ============================================
    // OBTER LABEL DO PAPEL
    // ============================================
    static getRoleLabel(role) {
        var config = AUTH_CONFIG.roles[role];
        return config ? config.label : '👤 Usuário';
    }

    // ============================================
    // OBTER NOME DO PAPEL
    // ============================================
    static getRoleName(role) {
        var config = AUTH_CONFIG.roles[role];
        return config ? config.name : 'Usuário';
    }

    // ============================================
    // RESET DE SENHA
    // ============================================
    static resetPassword(email, newPassword) {
        try {
            if (!email) {
                return { success: false, message: '❌ Informe um e-mail' };
            }

            if (!newPassword || newPassword.length < 6) {
                return { success: false, message: '❌ A nova senha deve ter pelo menos 6 caracteres' };
            }

            var userFound = false;
            for (var i = 0; i < AUTH_CONFIG.mockUsers.length; i++) {
                if (AUTH_CONFIG.mockUsers[i].email === email) {
                    AUTH_CONFIG.mockUsers[i].password = newPassword;
                    userFound = true;
                    this.logAudit('system', 'Sistema', 'Reset Senha', 'Senha redefinida para: ' + email, 'medio');
                    break;
                }
            }

            if (!userFound) {
                return { success: false, message: '❌ E-mail não encontrado' };
            }

            return { success: true, message: '✅ Senha redefinida com sucesso!' };

        } catch (error) {
            console.error('❌ Erro ao redefinir senha:', error);
            return { success: false, message: '❌ Erro ao redefinir senha' };
        }
    }

    // ============================================
    // LISTAR USUÁRIOS
    // ============================================
    static listUsers() {
        return AUTH_CONFIG.mockUsers.map(function(user) {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                roleLabel: this.getRoleLabel(user.role),
                avatar: user.avatar || '👤'
            };
        }.bind(this));
    }

    // ============================================
    // ATUALIZAR USUÁRIO
    // ============================================
    static updateUser(userId, updates) {
        try {
            for (var i = 0; i < AUTH_CONFIG.mockUsers.length; i++) {
                if (AUTH_CONFIG.mockUsers[i].id === userId) {
                    if (updates.name) AUTH_CONFIG.mockUsers[i].name = updates.name;
                    if (updates.role) AUTH_CONFIG.mockUsers[i].role = updates.role;
                    if (updates.avatar) AUTH_CONFIG.mockUsers[i].avatar = updates.avatar;
                    if (updates.password) AUTH_CONFIG.mockUsers[i].password = updates.password;
                    if (updates.credits) AUTH_CONFIG.mockUsers[i].credits = updates.credits;

                    var currentUser = this.getCurrentUser();
                    if (currentUser && currentUser.id === userId) {
                        var sessionUser = {
                            id: AUTH_CONFIG.mockUsers[i].id,
                            email: AUTH_CONFIG.mockUsers[i].email,
                            name: AUTH_CONFIG.mockUsers[i].name,
                            role: AUTH_CONFIG.mockUsers[i].role,
                            avatar: AUTH_CONFIG.mockUsers[i].avatar,
                            credits: AUTH_CONFIG.mockUsers[i].credits,
                            loginTime: new Date().toISOString()
                        };
                        localStorage.setItem('vigorre_user', JSON.stringify(sessionUser));
                    }

                    this.logAudit('system', 'Sistema', 'Update User', 'Usuário atualizado: ' + userId, 'medio');

                    return { success: true, message: '✅ Usuário atualizado com sucesso!' };
                }
            }

            return { success: false, message: '❌ Usuário não encontrado' };

        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            return { success: false, message: '❌ Erro ao atualizar usuário' };
        }
    }
}

// ============================================
// EXPORTAR E INICIALIZAR
// ============================================
window.VigorreAuth = VigorreAuth;

// Inicializar sistema de segurança quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        VigorreAuth.init();
    });
} else {
    VigorreAuth.init();
}

console.log('✅ VIGORRE ONE™ - Auth SECURE carregado com sucesso!');
console.log('🔐 Sessão expira em:', AUTH_CONFIG.sessionTimeout / 60000, 'minutos');
console.log('📋 Usuários disponíveis:', AUTH_CONFIG.mockUsers.length);
