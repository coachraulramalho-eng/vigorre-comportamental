/**
 * ============================================
 * VIGORRE ONE™ - API CONFIG
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 15/07/2026
 * 
 * CONFIGURAÇÃO DE API:
 * - Endpoints
 * - Headers
 * - Autenticação
 * - Cache
 * - Rate limiting
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO DE API
// ============================================
const API_CONFIG = {
    // ============================================
    // URLS
    // ============================================
    urls: {
        base: 'https://api.vigorre.com',
        version: '/v1',
        websocket: 'wss://ws.vigorre.com'
    },

    // ============================================
    // ENDPOINTS
    // ============================================
    endpoints: {
        // Autenticação
        auth: {
            login: '/auth/login',
            logout: '/auth/logout',
            refresh: '/auth/refresh',
            reset: '/auth/reset-password',
            verify: '/auth/verify',
            me: '/auth/me'
        },

        // Usuários
        users: {
            list: '/users',
            get: '/users/:id',
            create: '/users',
            update: '/users/:id',
            delete: '/users/:id',
            roles: '/users/:id/roles',
            permissions: '/users/:id/permissions'
        },

        // Empresas
        companies: {
            list: '/companies',
            get: '/companies/:id',
            create: '/companies',
            update: '/companies/:id',
            delete: '/companies/:id',
            participants: '/companies/:id/participants',
            recruiters: '/companies/:id/recruiters'
        },

        // Participantes
        participants: {
            list: '/participants',
            get: '/participants/:id',
            create: '/participants',
            update: '/participants/:id',
            delete: '/participants/:id',
            tests: '/participants/:id/tests',
            results: '/participants/:id/results',
            reports: '/participants/:id/reports'
        },

        // Recrutadores
        recruiters: {
            list: '/recruiters',
            get: '/recruiters/:id',
            create: '/recruiters',
            update: '/recruiters/:id',
            delete: '/recruiters/:id'
        },

        // Consultores
        consultants: {
            list: '/consultants',
            get: '/consultants/:id',
            create: '/consultants',
            update: '/consultants/:id',
            delete: '/consultants/:id',
            clients: '/consultants/:id/clients'
        },

        // Carteiras
        wallets: {
            list: '/wallets',
            get: '/wallets/:id',
            create: '/wallets',
            update: '/wallets/:id',
            delete: '/wallets/:id',
            balance: '/wallets/:id/balance',
            credits: '/wallets/:id/credits',
            transactions: '/wallets/:id/transactions'
        },

        // Créditos
        credits: {
            list: '/credits',
            get: '/credits/:id',
            create: '/credits',
            update: '/credits/:id',
            delete: '/credits/:id',
            transfer: '/credits/transfer',
            balance: '/credits/balance',
            types: '/credits/types',
            prices: '/credits/prices'
        },

        // Relatórios
        reports: {
            list: '/reports',
            get: '/reports/:id',
            create: '/reports',
            update: '/reports/:id',
            delete: '/reports/:id',
            export: '/reports/:id/export',
            share: '/reports/:id/share'
        },

        // Laudos
        laudos: {
            list: '/laudos',
            get: '/laudos/:id',
            create: '/laudos',
            update: '/laudos/:id',
            delete: '/laudos/:id',
            sign: '/laudos/:id/sign',
            validate: '/laudos/:id/validate',
            share: '/laudos/:id/share'
        },

        // Auditoria
        audit: {
            list: '/audit',
            get: '/audit/:id',
            create: '/audit',
            export: '/audit/export'
        },

        // Upload
        upload: {
            file: '/upload/file',
            image: '/upload/image',
            document: '/upload/document'
        },

        // Notificações
        notifications: {
            list: '/notifications',
            get: '/notifications/:id',
            read: '/notifications/:id/read',
            readAll: '/notifications/read-all',
            delete: '/notifications/:id'
        }
    },

    // ============================================
    // HEADERS
    // ============================================
    headers: {
        default: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-Version': 'v1'
        },
        auth: {
            'Authorization': 'Bearer {token}'
        },
        upload: {
            'Content-Type': 'multipart/form-data'
        }
    },

    // ============================================
    // AUTENTICAÇÃO
    // ============================================
    auth: {
        type: 'bearer',
        tokenKey: 'vigorre_token',
        refreshKey: 'vigorre_refresh_token',
        expiresIn: 3600, // 1 hora
        refreshExpiresIn: 86400 // 24 horas
    },

    // ============================================
    // CACHE
    // ============================================
    cache: {
        enabled: true,
        ttl: 300, // 5 minutos
        maxSize: 100,
        strategy: 'lru' // least recently used
    },

    // ============================================
    // RATE LIMITING
    // ============================================
    rateLimit: {
        enabled: true,
        maxRequests: 100,
        window: 60000 // 1 minuto
    },

    // ============================================
    // RETRY
    // ============================================
    retry: {
        enabled: true,
        maxAttempts: 3,
        delay: 1000,
        backoff: 2
    },

    // ============================================
    // TIMEOUT
    // ============================================
    timeout: 30000 // 30 segundos
};

// ============================================
// EXPORTAR
// ============================================
window.VIGORRE_API = API_CONFIG;

console.log('✅ VIGORRE ONE™ - API Config carregado com sucesso!');
console.log('🌐 Endpoints de API:', Object.keys(API_CONFIG.endpoints).length);
