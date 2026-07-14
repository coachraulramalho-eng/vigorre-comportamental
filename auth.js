/**
 * ============================================
 * VIGORRE ONE™ - AUTH CENTRAL
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Login/Logout
 * - Papéis (roles) - MASTER, ADMIN, RECRUITER, PARTICIPANT, COMPANY, CONSULTANT
 * - Redirecionamentos
 * - Reset de senha
 * - Sessão com token
 * - Auditoria
 * - Créditos dos usuários (TODOS OS TIPOS)
 * - Gerenciamento de usuários
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO DE AUTENTICAÇÃO
// ============================================
const AUTH_CONFIG = {
    // Papéis e rotas
    roles: {
        'master': {
            name: 'Master Admin',
            redirect: '/admin/dashboard.html',
            label: '👑 Master',
            level: 5,
            permissions: ['*']
        },
        'admin': {
            name: 'Administrador',
            redirect: '/admin/dashboard.html',
            label: '👤 Admin',
            level: 4,
            permissions: ['users', 'companies', 'participants', 'recruiters', 'consultants', 'wallets', 'credits',
                'reports', 'laudos', 'audit'
            ]
        },
        'consultant': {
            name: 'Consultor',
            redirect: '/consultor/dashboard.html',
            label: '📊 Consultor',
            level: 3,
            permissions: ['participants', 'reports', 'laudos', 'clients']
        },
        'recruiter': {
            name: 'Recrutador',
            redirect: '/recrutador/dashboard.html',
            label: '🎯 Recrutador',
            level: 2,
            permissions: ['participants', 'tests', 'reports']
        },
        'company': {
            name: 'Empresa',
            redirect: '/empresa/dashboard.html',
            label: '🏢 Empresa',
            level: 2,
            permissions: ['participants', 'tests', 'reports', 'wallets']
        },
        'participant': {
            name: 'Participante',
            redirect: '/participante/dashboard.html',
            label: '👤 Participante',
            level: 1,
            permissions: ['tests', 'results', 'laudo']
        }
    },

    // Usuários mockados para teste
    mockUsers: [{
        id: '1',
        email: 'master@vigorre.com',
        password: 'adminvigor10',
        name: 'Master Admin',
        role: 'master',
        avatar: '👑',
        credits: { DISC: 1000, IE: 1000, VALORES: 1000, SWOT: 1000, BIGFIVE: 1000, COMPETENCIAS: 1000, LIDERANCA: 1000,
            POTENCIAL: 1000, FITCULTURAL: 1000 }
    }, {
        id: '2',
        email: 'admin@vigorre.com',
        password: 'adminvigor10',
        name: 'Administrador',
        role: 'admin',
        avatar: '👤',
        credits: { DISC: 500, IE: 500, VALORES: 500, SWOT: 500, BIGFIVE: 500, COMPETENCIAS: 500, LIDERANCA: 500,
            POTENCIAL: 500, FITCULTURAL: 500 }
    }, {
        id: '3',
        email: 'recrutador@teste.com',
        password: 'rec123',
        name: 'João Recrutador',
        role: 'recruiter',
        avatar: '🎯',
        credits: { DISC: 50, IE: 30, VALORES: 20, SWOT: 10, BIGFIVE: 10, COMPETENCIAS: 5, LIDERANCA: 5, POTENCIAL: 5,
            FITCULTURAL: 5 },
        companyId: 'comp_001'
    }, {
        id: '4',
        email: 'participante@teste.com',
        password: 'part123',
        name: 'Ana Participante',
        role: 'participant',
        avatar: '👤',
        credits: { DISC: 0, IE: 0, VALORES: 0, SWOT: 0, BIGFIVE: 0, COMPETENCIAS: 0, LIDERANCA: 0, POTENCIAL: 0,
            FITCULTURAL: 0 },
        companyId: 'comp_001',
        tests: ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE'],
        completedTests: ['DISC']
    }, {
        id: '5',
        email: 'empresa@teste.com',
        password: 'emp123',
        name: 'TechCorp Solutions',
        role: 'company',
        avatar: '🏢',
        credits: { DISC: 100, IE: 80, VALORES: 60, SWOT: 40, BIGFIVE: 30, COMPETENCIAS: 20, LIDERANCA: 20, POTENCIAL: 15,
            FITCULTURAL: 10 }
    }, {
        id: '6',
        email: 'consultor@teste.com',
        password: 'cons123',
        name: 'Maria Consultora',
        role: 'consultant',
        avatar: '📊',
        credits: { DISC: 200, IE: 150, VALORES: 100, SWOT: 80, BIGFIVE: 60, COMPETENCIAS: 50, LIDERANCA: 40,
            POTENCIAL: 30, FITCULTURAL: 20 },
        clients: ['comp_001', 'comp_002', 'comp_003']
    }],

    // Configuração de token
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000 // 7 dias
};

// ============================================
// CLASSE DE AUTENTICAÇÃO
// ============================================
class VigorreAuth {

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

            // Salvar sessão
            var token = 'mock_token_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
            var refreshToken = 'refresh_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);

            localStorage.setItem('vigorre_user', JSON.stringify(user));
            localStorage.setItem('vigorre_token', token);
            localStorage.setItem('vigorre_refresh_token', refreshToken);
            localStorage.setItem('vigorre_login_time', new Date().toISOString());
            localStorage.setItem('vigorre_token_expiry', new Date(Date.now() + AUTH_CONFIG.tokenExpiry).toISOString());

            this.logAudit(user.id, user.name, 'Login', 'Login no sistema', 'baixo');

            var redirect = this.getRedirectUrl(user.role);

            return {
                success: true,
                user: user,
                redirect: redirect,
                message: '✅ Login realizado com sucesso!'
            };

        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { success: false, message: '❌ Erro interno no login' };
        }
    }

    // ============================================
    // LOGOUT
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

        localStorage.removeItem('vigorre_user');
        localStorage.removeItem('vigorre_token');
        localStorage.removeItem('vigorre_refresh_token');
        localStorage.removeItem('vigorre_login_time');
        localStorage.removeItem('vigorre_token_expiry');

        window.location.href = '/login.html';
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

            if (expiry) {
                var now = new Date();
                var expiryDate = new Date(expiry);
                if (now > expiryDate) {
                    this.refreshToken();
                    return true;
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

            var newToken = 'mock_token_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
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
                user.permissions = this.getUserPermissions(user.role);
            }

            return user;

        } catch (error) {
            console.error('❌ Erro ao obter usuário atual:', error);
            return null;
        }
    }

    // ============================================
    // CRÉDITOS DO USUÁRIO (TODOS OS TIPOS)
    // ============================================
    static getUserCredits(userId) {
        try {
            var transactions = JSON.parse(localStorage.getItem('vigorre_credit_transactions') || '[]');
            var credits = {
                DISC: 0,
                IE: 0,
                VALORES: 0,
                SWOT: 0,
                BIGFIVE: 0,
                COMPETENCIAS: 0,
                LIDERANCA: 0,
                POTENCIAL: 0,
                FITCULTURAL: 0
            };

            var creditTypes = ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE', 'COMPETENCIAS', 'LIDERANCA', 'POTENCIAL',
                'FITCULTURAL'
            ];

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

            // Se não houver transações, buscar dos mockUsers
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
            return { DISC: 0, IE: 0, VALORES: 0, SWOT: 0, BIGFIVE: 0, COMPETENCIAS: 0, LIDERANCA: 0, POTENCIAL: 0,
                FITCULTURAL: 0 };
        }
    }

    // ============================================
    // PERMISSÕES DO USUÁRIO
    // ============================================
    static getUserPermissions(role) {
        var config = AUTH_CONFIG.roles[role];
        return config ? config.permissions || [] : [];
    }

    // ============================================
    // VERIFICAR PERMISSÃO
    // ============================================
    static hasPermission(permission) {
        var user = this.getCurrentUser();
        if (!user) return false;

        var permissions = this.getUserPermissions(user.role);
        if (permissions.indexOf('*') !== -1) return true;

        return permissions.indexOf(permission) !== -1;
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
    // VERIFICAR NÍVEL DE ACESSO
    // ============================================
    static hasAccessLevel(minLevel) {
        var user = this.getCurrentUser();
        if (!user) return false;

        var roleConfig = AUTH_CONFIG.roles[user.role];
        if (!roleConfig) return false;

        return roleConfig.level >= minLevel;
    }

    // ============================================
    // OBTER REDIRECT
    // ============================================
    static getRedirectUrl(role) {
        var config = AUTH_CONFIG.roles[role];
        return config ? config.redirect : '/login.html';
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
                        localStorage.setItem('vigorre_user', JSON.stringify(AUTH_CONFIG.mockUsers[i]));
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

    // ============================================
    // CRIAR USUÁRIO
    // ============================================
    static createUser(userData) {
        try {
            if (!userData.email || !userData.password || !userData.name) {
                return { success: false, message: '❌ E-mail, senha e nome são obrigatórios' };
            }

            // Verificar se email já existe
            for (var i = 0; i < AUTH_CONFIG.mockUsers.length; i++) {
                if (AUTH_CONFIG.mockUsers[i].email === userData.email) {
                    return { success: false, message: '❌ E-mail já cadastrado' };
                }
            }

            var newUser = {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                email: userData.email,
                password: userData.password,
                name: userData.name,
                role: userData.role || 'participant',
                avatar: userData.avatar || '👤',
                credits: userData.credits || {
                    DISC: 0,
                    IE: 0,
                    VALORES: 0,
                    SWOT: 0,
                    BIGFIVE: 0,
                    COMPETENCIAS: 0,
                    LIDERANCA: 0,
                    POTENCIAL: 0,
                    FITCULTURAL: 0
                },
                createdAt: new Date().toISOString()
            };

            AUTH_CONFIG.mockUsers.push(newUser);

            this.logAudit('system', 'Sistema', 'Create User', 'Novo usuário criado: ' + newUser.email, 'medio');

            return {
                success: true,
                data: newUser,
                message: '✅ Usuário criado com sucesso!'
            };

        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            return { success: false, message: '❌ Erro ao criar usuário' };
        }
    }
}

// ============================================
// EXPORTAR
// ============================================
window.VigorreAuth = VigorreAuth;

console.log('✅ VIGORRE ONE™ - Auth carregado com sucesso!');
console.log('📋 Usuários disponíveis:', AUTH_CONFIG.mockUsers.length);
console.log('💳 Tipos de crédito: DISC, IE, VALORES, SWOT, BIGFIVE, COMPETENCIAS, LIDERANCA, POTENCIAL, FITCULTURAL');
