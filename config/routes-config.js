/**
 * ============================================
 * VIGORRE ONE™ - ROUTES CONFIG
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 14/07/2026
 * 
 * CONFIGURAÇÃO DE ROTAS:
 * - Rotas públicas
 * - Rotas privadas
 * - Rotas por papel
 * - Rotas de API
 * - Redirecionamentos
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO DE ROTAS
// ============================================
const ROUTES_CONFIG = {
    // ============================================
    // ROTAS PÚBLICAS (sem autenticação)
    // ============================================
    public: {
        home: '/',
        login: '/login.html',
        register: '/register.html',
        reset: '/reset-password.html',
        privacy: '/privacidade.html',
        terms: '/termos.html',
        lgpd: '/lgpd.html',
        error: '/error.html'
    },

    // ============================================
    // ROTAS PRIVADAS (requer autenticação)
    // ============================================
    private: {
        dashboard: '/dashboard.html',
        profile: '/perfil.html',
        settings: '/configuracoes.html'
    },

    // ============================================
    // ROTAS POR PAPEL
    // ============================================
    roles: {
        master: {
            dashboard: '/admin/dashboard.html',
            users: '/admin/usuarios/',
            companies: '/admin/empresas/',
            recruiters: '/admin/recrutadores/',
            participants: '/admin/participantes/',
            credits: '/admin/creditos/',
            reports: '/admin/relatorios/',
            financeiro: '/admin/financeiro/',
            jobProfile: '/admin/job-profile/',
            agenda: '/admin/agenda/',
            backup: '/admin/backup/',
            bi: '/admin/bi/'
        },
        admin: {
            dashboard: '/admin/dashboard.html',
            companies: '/admin/empresas/',
            recruiters: '/admin/recrutadores/',
            participants: '/admin/participantes/',
            credits: '/admin/creditos/',
            reports: '/admin/relatorios/',
            financeiro: '/admin/financeiro/'
        },
        consultant: {
            dashboard: '/consultor/dashboard.html',
            clients: '/consultor/clientes/',
            assessments: '/consultor/avaliacoes/',
            reports: '/consultor/relatorios/',
            laudos: '/consultor/laudos/',
            credits: '/consultor/creditos/',
            agenda: '/consultor/agenda/'
        },
        recruiter: {
            dashboard: '/recrutador/dashboard.html',
            companies: '/recrutador/empresas/',
            participants: '/recrutador/participantes/',
            credits: '/recrutador/creditos/',
            reports: '/recrutador/relatorios/',
            laudos: '/recrutador/laudos/',
            agenda: '/recrutador/agenda/'
        },
        company: {
            dashboard: '/empresa/dashboard.html',
            collaborators: '/empresa/colaboradores/',
            assessments: '/empresa/avaliacoes/',
            reports: '/empresa/relatorios/',
            jobProfile: '/empresa/job-profile/'
        },
        participant: {
            dashboard: '/participante/dashboard.html',
            tests: '/participante/testes/',
            results: '/participante/resultados/',
            laudo: '/participante/laudo/'
        }
    },

    // ============================================
    // ROTAS DE API
    // ============================================
    api: {
        auth: {
            login: '/api/auth/login',
            logout: '/api/auth/logout',
            refresh: '/api/auth/refresh',
            reset: '/api/auth/reset-password'
        },
        users: {
            list: '/api/users',
            get: '/api/users/:id',
            create: '/api/users',
            update: '/api/users/:id',
            delete: '/api/users/:id'
        },
        companies: {
            list: '/api/companies',
            get: '/api/companies/:id',
            create: '/api/companies',
            update: '/api/companies/:id',
            delete: '/api/companies/:id'
        },
        participants: {
            list: '/api/participants',
            get: '/api/participants/:id',
            create: '/api/participants',
            update: '/api/participants/:id',
            delete: '/api/participants/:id'
        },
        wallets: {
            list: '/api/wallets',
            get: '/api/wallets/:id',
            create: '/api/wallets',
            update: '/api/wallets/:id',
            delete: '/api/wallets/:id'
        },
        credits: {
            list: '/api/credits',
            get: '/api/credits/:id',
            create: '/api/credits',
            update: '/api/credits/:id',
            delete: '/api/credits/:id',
            transfer: '/api/credits/transfer'
        },
        reports: {
            list: '/api/reports',
            get: '/api/reports/:id',
            create: '/api/reports',
            update: '/api/reports/:id',
            delete: '/api/reports/:id'
        },
        laudos: {
            list: '/api/laudos',
            get: '/api/laudos/:id',
            create: '/api/laudos',
            update: '/api/laudos/:id',
            delete: '/api/laudos/:id'
        }
    },

    // ============================================
    // REDIRECIONAMENTOS
    // ============================================
    redirects: {
        '/antiga-home': '/',
        '/old-about': '/sobre.html',
        '/old-contact': '/contato.html',
        '/old-pricing': '/precos.html'
    },

    // ============================================
    // FALLBACK
    // ============================================
    fallback: '/error.html'
};

// ============================================
// EXPORTAR
// ============================================
window.VIGORRE_ROUTES = ROUTES_CONFIG;

console.log('✅ VIGORRE ONE™ - Routes Config carregado com sucesso!');
console.log('📋 Rotas públicas:', Object.keys(ROUTES_CONFIG.public).length);
console.log('📋 Rotas privadas:', Object.keys(ROUTES_CONFIG.private).length);
console.log('📋 Rotas por papel:', Object.keys(ROUTES_CONFIG.roles).length);
