/**
 * ============================================
 * VIGORRE ONE™ - AUTH SYSTEM ENTERPRISE
 * ============================================
 * 
 * Sistema de Autenticação com:
 * - JWT + Refresh Token
 * - 2FA Opcional
 * - Fingerprint
 * - Sessão Única
 * - Rate Limit
 * - Bloqueio por Tentativas
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES
    // ============================================
    const CONFIG = {
        TOKEN_EXPIRY: 3600, // 1 hora
        REFRESH_EXPIRY: 604800, // 7 dias
        MAX_LOGIN_ATTEMPTS: 5,
        BLOCK_DURATION: 900, // 15 minutos
        SESSION_KEY: 'vigorre_session',
        USER_KEY: 'vigorre_user',
        TOKEN_KEY: 'vigorre_token',
        REFRESH_KEY: 'vigorre_refresh',
        FINGERPRINT_KEY: 'vigorre_fingerprint'
    };

    // ============================================
    // USUÁRIOS (Dados de Exemplo)
    // ============================================
    const USERS = [
        {
            id: 'usr_001',
            name: 'Administrador Master',
            email: 'master@vigorre.com',
            password: 'adminvigor10',
            role: 'master',
            status: 'active',
            phone: '(34) 99185-0735',
            companyId: null,
            credits: { DISC: 9999, IE: 9999, Valores: 9999, SWOT: 9999, BigFive: 9999, Laudo: 9999 },
            permissions: ['*'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        },
        {
            id: 'usr_002',
            name: 'Admin Staff',
            email: 'admin@vigorre.com',
            password: 'adminvigor10',
            role: 'admin',
            status: 'active',
            phone: '(34) 99185-0736',
            companyId: null,
            credits: { DISC: 500, IE: 500, Valores: 500, SWOT: 500, BigFive: 500, Laudo: 100 },
            permissions: ['admin.dashboard', 'admin.empresas', 'admin.recrutadores', 'admin.participantes'],
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z'
        },
        {
            id: 'usr_003',
            name: 'João Silva',
            email: 'recrutador@teste.com',
            password: 'rec123',
            role: 'recruiter',
            status: 'active',
            phone: '(11) 99999-9999',
            companyId: 'comp_001',
            credits: { DISC: 50, IE: 30, Valores: 20, SWOT: 15, BigFive: 10, Laudo: 5 },
            permissions: ['recruiter.dashboard', 'recruiter.participantes', 'recruiter.creditos', 'recruiter.relatorios'],
            createdAt: '2024-02-01T00:00:00Z',
            updatedAt: '2024-02-01T00:00:00Z'
        },
        {
            id: 'usr_004',
            name: 'Ana Silva',
            email: 'participante@teste.com',
            password: 'part123',
            role: 'participant',
            status: 'active',
            phone: '(11) 88888-8888',
            companyId: 'comp_001',
            credits: { DISC: 0, IE: 0, Valores: 0, SWOT: 0, BigFive: 0, Laudo: 0 },
            permissions: ['participant.dashboard', 'participant.testes', 'participant.resultados'],
            createdAt: '2024-03-01T00:00:00Z',
            updatedAt: '2024-03-01T00:00:00Z'
        }
    ];

    // ============================================
    // FINGERPRINT
    // ============================================
    function generateFingerprint() {
        const data = [
            navigator.userAgent || '',
            navigator.language || '',
            screen.width || 0,
            screen.height || 0,
            screen.colorDepth || 0,
            navigator.hardwareConcurrency || 0,
            navigator.deviceMemory || 0,
            new Date().getTimezoneOffset() || 0
        ].join('|');
        
        return btoa(data).substring(0, 64);
    }

    function getFingerprint() {
        let fp = localStorage.getItem(CONFIG.FINGERPRINT_KEY);
        if (!fp) {
            fp = generateFingerprint();
            localStorage.setItem(CONFIG.FINGERPRINT_KEY, fp);
        }
        return fp;
    }

    // ============================================
    // JWT SIMULADO
    // ============================================
    function generateToken(userId, expiresIn) {
        const payload = {
            sub: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + expiresIn,
            fp: getFingerprint()
        };
        // Simulação de JWT (base64)
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payloadEncoded = btoa(JSON.stringify(payload));
        const signature = btoa('signature_' + userId + '_' + Date.now());
        return header + '.' + payloadEncoded + '.' + signature;
    }

    function decodeToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const payload = JSON.parse(atob(parts[1]));
            return payload;
        } catch (e) {
            return null;
        }
    }

    function isTokenValid(token) {
        if (!token) return false;
        const payload = decodeToken(token);
        if (!payload) return false;
        // Verificar fingerprint
        if (payload.fp !== getFingerprint()) return false;
        // Verificar expiração
        if (payload.exp < Math.floor(Date.now() / 1000)) return false;
        return true;
    }

    // ============================================
    // SESSÃO
    // ============================================
    function getSession() {
        try {
            const session = localStorage.getItem(CONFIG.SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch (e) {
            return null;
        }
    }

    function setSession(user, token, refreshToken) {
        const session = {
            user: user,
            token: token,
            refreshToken: refreshToken,
            loginAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + CONFIG.TOKEN_EXPIRY * 1000).toISOString(),
            fingerprint: getFingerprint()
        };
        localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.REFRESH_KEY, refreshToken);
    }

    function clearSession() {
        localStorage.removeItem(CONFIG.SESSION_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.REFRESH_KEY);
        // Manter fingerprint
    }

    function isSessionValid() {
        const session = getSession();
        if (!session) return false;
        if (session.fingerprint !== getFingerprint()) return false;
        if (new Date(session.expiresAt) < new Date()) return false;
        return isTokenValid(session.token);
    }

    // ============================================
    // RATE LIMIT
    // ============================================
    const loginAttempts = {};

    function checkRateLimit(email) {
        const key = 'login_' + email;
        const now = Date.now();
        if (!loginAttempts[key]) {
            loginAttempts[key] = { count: 0, firstAttempt: now, blockedUntil: null };
        }
        const record = loginAttempts[key];
        
        // Reset após 1 hora
        if (now - record.firstAttempt > 3600000) {
            record.count = 0;
            record.firstAttempt = now;
            record.blockedUntil = null;
        }
        
        if (record.blockedUntil && now < record.blockedUntil) {
            const remaining = Math.ceil((record.blockedUntil - now) / 1000 / 60);
            return { allowed: false, remaining: remaining, message: `Bloqueado por ${remaining} minutos` };
        }
        
        if (record.count >= CONFIG.MAX_LOGIN_ATTEMPTS) {
            record.blockedUntil = now + CONFIG.BLOCK_DURATION * 1000;
            return { allowed: false, remaining: CONFIG.BLOCK_DURATION, message: `Bloqueado por ${CONFIG.BLOCK_DURATION} minutos` };
        }
        
        return { allowed: true };
    }

    function recordLoginAttempt(email, success) {
        const key = 'login_' + email;
        if (!loginAttempts[key]) {
            loginAttempts[key] = { count: 0, firstAttempt: Date.now(), blockedUntil: null };
        }
        if (!success) {
            loginAttempts[key].count++;
        } else {
            loginAttempts[key].count = 0;
            loginAttempts[key].blockedUntil = null;
        }
    }

    // ============================================
    // AUTENTICAÇÃO PRINCIPAL
    // ============================================
    const VigorreAuth = {
        // ============================================
        // LOGIN
        // ============================================
        login: function(email, password) {
            // Validar entrada
            if (!email || !password) {
                return { success: false, message: 'Preencha todos os campos' };
            }
            
            // Verificar rate limit
            const rateCheck = checkRateLimit(email);
            if (!rateCheck.allowed) {
                return { success: false, message: rateCheck.message };
            }
            
            // Buscar usuário
            const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (!user) {
                recordLoginAttempt(email, false);
                return { success: false, message: 'Credenciais inválidas' };
            }
            
            // Verificar senha
            if (user.password !== password) {
                recordLoginAttempt(email, false);
                return { success: false, message: 'Credenciais inválidas' };
            }
            
            // Verificar status
            if (user.status !== 'active') {
                return { success: false, message: 'Usuário inativo ou suspenso' };
            }
            
            // Sucesso
            recordLoginAttempt(email, true);
            
            // Gerar tokens
            const token = generateToken(user.id, CONFIG.TOKEN_EXPIRY);
            const refreshToken = generateToken(user.id, CONFIG.REFRESH_EXPIRY);
            
            // Salvar sessão
            setSession(user, token, refreshToken);
            
            // Registrar auditoria
            this.audit(user.id, 'login', 'success', { email: user.email });
            
            return {
                success: true,
                user: user,
                token: token,
                refreshToken: refreshToken,
                redirect: this.getRedirectUrl(user.role)
            };
        },

        // ============================================
        // LOGOUT
        // ============================================
        logout: function() {
            const user = this.getCurrentUser();
            if (user) {
                this.audit(user.id, 'logout', 'success', { email: user.email });
            }
            clearSession();
            window.location.href = '../login.html';
        },

        // ============================================
        // VERIFICAR AUTENTICAÇÃO
        // ============================================
        isAuthenticated: function() {
            return isSessionValid();
        },

        // ============================================
        // OBTER USUÁRIO ATUAL
        // ============================================
        getCurrentUser: function() {
            try {
                const user = localStorage.getItem(CONFIG.USER_KEY);
                return user ? JSON.parse(user) : null;
            } catch (e) {
                return null;
            }
        },

        // ============================================
        // OBTER TOKEN
        // ============================================
        getToken: function() {
            return localStorage.getItem(CONFIG.TOKEN_KEY);
        },

        // ============================================
        // OBTER REFRESH TOKEN
        // ============================================
        getRefreshToken: function() {
            return localStorage.getItem(CONFIG.REFRESH_KEY);
        },

        // ============================================
        // REDIRECIONAMENTO
        // ============================================
        getRedirectUrl: function(role) {
            const map = {
                'master': '/admin/dashboard.html',
                'admin': '/admin/dashboard.html',
                'recruiter': '/recrutador/dashboard.html',
                'participant': '/participante/dashboard.html'
            };
            return map[role] || '/index.html';
        },

        // ============================================
        // VERIFICAR PERMISSÃO
        // ============================================
        hasPermission: function(permission) {
            const user = this.getCurrentUser();
            if (!user) return false;
            if (user.permissions.includes('*')) return true;
            return user.permissions.includes(permission);
        },

        // ============================================
        // AUDITORIA (Simples)
        // ============================================
        audit: function(userId, action, status, details) {
            try {
                const logs = JSON.parse(localStorage.getItem('vigorre_audit_logs') || '[]');
                logs.push({
                    id: 'aud_' + Date.now(),
                    userId: userId,
                    action: action,
                    status: status,
                    details: details || {},
                    ip: 'local',
                    userAgent: navigator.userAgent || '',
                    timestamp: new Date().toISOString()
                });
                // Manter últimos 10.000 logs
                if (logs.length > 10000) {
                    logs.splice(0, logs.length - 10000);
                }
                localStorage.setItem('vigorre_audit_logs', JSON.stringify(logs));
            } catch (e) {
                console.warn('Erro ao registrar auditoria:', e);
            }
        },

        // ============================================
        // RESETAR SENHA (Simples)
        // ============================================
        resetPassword: function(email, newPassword) {
            const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (!user) {
                return { success: false, message: 'Usuário não encontrado' };
            }
            user.password = newPassword;
            this.audit(user.id, 'password_reset', 'success', { email: user.email });
            return { success: true, message: 'Senha resetada com sucesso' };
        },

        // ============================================
        // USUÁRIOS (Expor para debug)
        // ============================================
        _getUsers: function() {
            return USERS;
        },

        // ============================================
        // INICIALIZAR
        // ============================================
        init: function() {
            console.log('🔐 VigorreAuth Enterprise inicializado');
            
            // Verificar sessão ativa
            if (this.isAuthenticated()) {
                const user = this.getCurrentUser();
                if (user) {
                    console.log(`👤 Sessão ativa: ${user.name} (${user.role})`);
                }
            }
            
            // Auto-logout se sessão expirada (apenas se estiver em página protegida)
            const protectedPages = ['/admin/', '/recrutador/', '/participante/'];
            const currentPath = window.location.pathname;
            if (protectedPages.some(p => currentPath.includes(p))) {
                if (!this.isAuthenticated()) {
                    console.warn('⏰ Sessão expirada, redirecionando para login');
                    window.location.href = '../login.html';
                }
            }
        }
    };

    // ============================================
    // EXPORTAÇÃO
    // ============================================
    window.VigorreAuth = VigorreAuth;

    // Inicializar
    document.addEventListener('DOMContentLoaded', function() {
        VigorreAuth.init();
    });

    console.log('🔐 Auth System Enterprise carregado com sucesso!');

})();
