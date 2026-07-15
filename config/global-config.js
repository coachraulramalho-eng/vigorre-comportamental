/**
 * ============================================
 * VIGORRE ONE™ - GLOBAL CONFIG
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 15/07/2026
 * 
 * CONFIGURAÇÕES GLOBAIS:
 * - Ambiente
 * - Versões
 * - URLs
 * - Timeouts
 * - Limites
 * - Features
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO GLOBAL
// ============================================
const GLOBAL_CONFIG = {
    // ============================================
    // AMBIENTE
    // ============================================
    env: {
        name: 'development', // development | staging | production
        debug: true,
        verbose: true
    },

    // ============================================
    // VERSÕES
    // ============================================
    versions: {
        app: '2.0.0',
        api: '1.5.0',
        build: '2026.07.15',
        compatibility: '>=1.0.0'
    },

    // ============================================
    // URLs
    // ============================================
    urls: {
        base: 'https://vigorre.com',
        api: 'https://api.vigorre.com',
        cdn: 'https://cdn.vigorre.com',
        assets: 'https://assets.vigorre.com',
        docs: 'https://docs.vigorre.com',
        status: 'https://status.vigorre.com'
    },

    // ============================================
    // TIMEOUTS
    // ============================================
    timeouts: {
        api: 30000, // 30 segundos
        cache: 300000, // 5 minutos
        session: 86400000, // 24 horas
        refresh: 60000, // 1 minuto
        retry: 1000 // 1 segundo
    },

    // ============================================
    // LIMITES
    // ============================================
    limits: {
        maxUploadSize: 10485760, // 10 MB
        maxRows: 1000,
        maxResults: 100,
        maxRetries: 3,
        maxConcurrent: 10,
        rateLimit: 100 // requisições por minuto
    },

    // ============================================
    // FEATURES
    // ============================================
    features: {
        // Autenticação
        auth: {
            enabled: true,
            providers: ['email', 'google', 'linkedin'],
            mfa: false,
            social: true
        },

        // Módulos
        modules: {
            admin: true,
            recruiter: true,
            participant: true,
            company: true,
            consultant: true,
            financeiro: true
        },

        // Funcionalidades
        features: {
            darkMode: true,
            i18n: true,
            accessibility: true,
            analytics: true,
            pwa: true,
            offline: true,
            notifications: true,
            export: true,
            reports: true,
            laudos: true
        },

        // Testes disponíveis
        tests: {
            DISC: true,
            IE: true,
            VALORES: true,
            SWOT: true,
            BIGFIVE: true,
            COMPETENCIAS: true,
            LIDERANCA: true,
            POTENCIAL: true,
            FITCULTURAL: true
        }
    },

    // ============================================
    // CRÉDITOS
    // ============================================
    credits: {
        types: ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE', 'COMPETENCIAS', 'LIDERANCA', 'POTENCIAL', 'FITCULTURAL'],
        standardPrice: 30,
        premiumPrice: 120,
        discount: {
            standard: 0.45, // 45% de desconto
            premium: 0.60 // 60% de desconto
        }
    },

    // ============================================
    // PAPÉIS E PERMISSÕES
    // ============================================
    roles: {
        master: {
            level: 5,
            label: '👑 Master',
            permissions: ['*']
        },
        admin: {
            level: 4,
            label: '👤 Admin',
            permissions: ['users', 'companies', 'participants', 'recruiters', 'consultants', 'wallets', 'credits', 'reports', 'laudos', 'audit']
        },
        consultant: {
            level: 3,
            label: '📊 Consultor',
            permissions: ['participants', 'reports', 'laudos', 'clients']
        },
        recruiter: {
            level: 2,
            label: '🎯 Recrutador',
            permissions: ['participants', 'tests', 'reports']
        },
        company: {
            level: 2,
            label: '🏢 Empresa',
            permissions: ['participants', 'tests', 'reports', 'wallets']
        },
        participant: {
            level: 1,
            label: '👤 Participante',
            permissions: ['tests', 'results', 'laudo']
        }
    },

    // ============================================
    // PLANOS
    // ============================================
    plans: {
        basic: {
            id: 'basic',
            name: 'Básico',
            price: 29.90,
            credits: 0,
            features: ['1 empresa', '10 participantes', 'DISC básico']
        },
        professional: {
            id: 'professional',
            name: 'Profissional',
            price: 79.90,
            credits: 3,
            features: ['5 empresas', '50 participantes', 'DISC completo', 'IE avançado', 'Valores']
        },
        enterprise: {
            id: 'enterprise',
            name: 'Empresarial',
            price: 199.90,
            credits: 10,
            features: ['20 empresas', '200 participantes', 'Todos os testes', 'Todos os módulos', 'Suporte 24/7']
        },
        premium: {
            id: 'premium',
            name: 'Premium',
            price: 399.90,
            credits: 25,
            features: ['Ilimitado', 'Ilimitado', 'Todos os testes', 'Todos os módulos', 'Suporte 24/7', 'Personalizado']
        }
    },

    // ============================================
    // MENSAGENS
    // ============================================
    messages: {
        welcome: 'Bem-vindo à Vigorre ONE™',
        login: 'Faça login para acessar a plataforma',
        logout: 'Saindo do sistema...',
        error: 'Ocorreu um erro. Tente novamente.',
        success: 'Operação realizada com sucesso!',
        loading: 'Carregando...',
        noData: 'Nenhum dado encontrado',
        confirm: 'Tem certeza que deseja realizar esta ação?'
    },

    // ============================================
    // CORES DO SISTEMA
    // ============================================
    colors: {
        primary: '#0A2540',
        secondary: '#1D4ED8',
        accent: '#D97706',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#06B6D4',
        light: '#F8FAFC',
        dark: '#0F172A'
    }
};

// ============================================
// EXPORTAR
// ============================================
window.VIGORRE_CONFIG = GLOBAL_CONFIG;

console.log('✅ VIGORRE ONE™ - Global Config carregado com sucesso!');
console.log('📦 Versão:', GLOBAL_CONFIG.versions.app);
console.log('🌍 Ambiente:', GLOBAL_CONFIG.env.name);
console.log('🔧 Features:', Object.keys(GLOBAL_CONFIG.features.features).length);
