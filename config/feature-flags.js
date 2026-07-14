/**
 * ============================================
 * VIGORRE ONE™ - FEATURE FLAGS
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 14/07/2026
 * 
 * FEATURE FLAGS:
 * - Ativação/desativação de funcionalidades
 * - A/B testing
 * - Lançamentos graduais
 * - Rollback seguro
 * - Configuração por ambiente
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO DE FEATURE FLAGS
// ============================================
const FEATURE_FLAGS = {
    // ============================================
    // AMBIENTE
    // ============================================
    env: {
        development: true,
        staging: false,
        production: false
    },

    // ============================================
    // FLAGS POR CATEGORIA
    // ============================================

    // AUTENTICAÇÃO
    auth: {
        socialLogin: {
            enabled: true,
            description: 'Login com redes sociais (Google, LinkedIn)',
            rollout: 100 // porcentagem
        },
        mfa: {
            enabled: false,
            description: 'Autenticação de dois fatores',
            rollout: 0
        },
        passwordless: {
            enabled: false,
            description: 'Login sem senha (magic link)',
            rollout: 0
        }
    },

    // MÓDULOS
    modules: {
        admin: {
            enabled: true,
            description: 'Módulo Administrador',
            rollout: 100
        },
        recruiter: {
            enabled: true,
            description: 'Módulo Recrutador',
            rollout: 100
        },
        participant: {
            enabled: true,
            description: 'Módulo Participante',
            rollout: 100
        },
        company: {
            enabled: true,
            description: 'Módulo Empresa',
            rollout: 100
        },
        consultant: {
            enabled: true,
            description: 'Módulo Consultor',
            rollout: 100
        },
        financeiro: {
            enabled: true,
            description: 'Módulo Financeiro',
            rollout: 100
        },
        jobProfile: {
            enabled: true,
            description: 'Módulo Job Profile',
            rollout: 80
        },
        agenda: {
            enabled: true,
            description: 'Módulo Agenda',
            rollout: 100
        },
        backup: {
            enabled: true,
            description: 'Módulo Backup',
            rollout: 70
        },
        bi: {
            enabled: true,
            description: 'Módulo BI Analytics',
            rollout: 60
        }
    },

    // TESTES
    tests: {
        DISC: {
            enabled: true,
            description: 'Teste DISC',
            rollout: 100
        },
        IE: {
            enabled: true,
            description: 'Teste Inteligência Emocional',
            rollout: 100
        },
        VALORES: {
            enabled: true,
            description: 'Teste Valores Pessoais',
            rollout: 100
        },
        SWOT: {
            enabled: true,
            description: 'Teste SWOT Pessoal',
            rollout: 90
        },
        BIGFIVE: {
            enabled: true,
            description: 'Teste Big Five',
            rollout: 80
        },
        COMPETENCIAS: {
            enabled: false,
            description: 'Teste Competências',
            rollout: 30
        },
        LIDERANCA: {
            enabled: false,
            description: 'Teste Liderança',
            rollout: 20
        },
        POTENCIAL: {
            enabled: false,
            description: 'Teste Potencial',
            rollout: 20
        },
        FITCULTURAL: {
            enabled: false,
            description: 'Teste Fit Cultural',
            rollout: 15
        }
    },

    // RELATÓRIOS
    reports: {
        simplified: {
            enabled: true,
            description: 'Relatório Simplificado',
            rollout: 100
        },
        complete: {
            enabled: true,
            description: 'Relatório Completo',
            rollout: 100
        },
        executive: {
            enabled: true,
            description: 'Relatório Executivo',
            rollout: 80
        },
        laudo: {
            enabled: true,
            description: 'Laudo Vigorre™',
            rollout: 70
        }
    },

    // FUNCIONALIDADES
    features: {
        darkMode: {
            enabled: true,
            description: 'Tema escuro automático',
            rollout: 100
        },
        i18n: {
            enabled: false,
            description: 'Internacionalização',
            rollout: 0
        },
        accessibility: {
            enabled: true,
            description: 'Acessibilidade WCAG',
            rollout: 100
        },
        analytics: {
            enabled: true,
            description: 'Analytics e tracking',
            rollout: 100
        },
        pwa: {
            enabled: true,
            description: 'Progressive Web App',
            rollout: 60
        },
        offline: {
            enabled: false,
            description: 'Modo offline',
            rollout: 20
        },
        notifications: {
            enabled: true,
            description: 'Notificações em tempo real',
            rollout: 80
        },
        export: {
            enabled: true,
            description: 'Exportação de dados',
            rollout: 100
        },
        share: {
            enabled: false,
            description: 'Compartilhamento de relatórios',
            rollout: 30
        },
        api: {
            enabled: true,
            description: 'API Gateway',
            rollout: 100
        }
    },

    // PAGAMENTOS
    payments: {
        creditCard: {
            enabled: true,
            description: 'Pagamento com cartão de crédito',
            rollout: 100
        },
        pix: {
            enabled: true,
            description: 'Pagamento com PIX',
            rollout: 80
        },
        boleto: {
            enabled: false,
            description: 'Pagamento com boleto',
            rollout: 40
        },
        subscription: {
            enabled: true,
            description: 'Assinatura recorrente',
            rollout: 70
        }
    },

    // CRÉDITOS
    credits: {
        standard: {
            enabled: true,
            description: 'Créditos Standard',
            rollout: 100
        },
        premium: {
            enabled: true,
            description: 'Créditos Premium',
            rollout: 70
        },
        bulk: {
            enabled: false,
            description: 'Compras em lote',
            rollout: 30
        },
        transfer: {
            enabled: true,
            description: 'Transferência de créditos',
            rollout: 60
        }
    }
};

// ============================================
// CLASSE FEATURE FLAGS
// ============================================
class FeatureFlags {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.flags = FEATURE_FLAGS;
        this.env = this._getEnv();
    }

    // ============================================
    // OBTER AMBIENTE
    // ============================================
    _getEnv() {
        // Detectar ambiente
        var hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }
        if (hostname.includes('staging')) {
            return 'staging';
        }
        return 'production';
    }

    // ============================================
    // VERIFICAR SE FEATURE ESTÁ ATIVA
    // ============================================
    isEnabled(featurePath) {
        var parts = featurePath.split('.');
        var current = this.flags;
        
        for (var i = 0; i < parts.length; i++) {
            if (current[parts[i]] === undefined) {
                return false;
            }
            current = current[parts[i]];
        }
        
        // Verificar se é um objeto com 'enabled'
        if (current && typeof current === 'object' && 'enabled' in current) {
            // Verificar rollout
            if (current.rollout !== undefined) {
                var random = Math.random() * 100;
                if (random > current.rollout) {
                    return false;
                }
            }
            return current.enabled;
        }
        
        return !!current;
    }

    // ============================================
    // OBTER FEATURE
    // ============================================
    get(featurePath) {
        var parts = featurePath.split('.');
        var current = this.flags;
        
        for (var i = 0; i < parts.length; i++) {
            if (current[parts[i]] === undefined) {
                return null;
            }
            current = current[parts[i]];
        }
        
        return current;
    }

    // ============================================
    // LISTAR FEATURES
    // ============================================
    list(category) {
        if (category) {
            return this.flags[category] || null;
        }
        return this.flags;
    }

    // ============================================
    // OBTER FEATURES ATIVAS
    // ============================================
    getActiveFeatures() {
        var active = [];
        
        function traverse(obj, path) {
            for (var key in obj) {
                if (obj[key] && typeof obj[key] === 'object') {
                    if ('enabled' in obj[key] && obj[key].enabled) {
                        active.push(path + key);
                    }
                    traverse(obj[key], path + key + '.');
                }
            }
        }
        
        traverse(this.flags, '');
        
        return active;
    }

    // ============================================
    // OBTER AMBIENTE ATUAL
    // ============================================
    getEnv() {
        return this.env;
    }

    // ============================================
    // VERIFICAR SE ESTÁ EM AMBIENTE DE DESENVOLVIMENTO
    // ============================================
    isDev() {
        return this.env === 'development';
    }

    // ============================================
    // VERIFICAR SE ESTÁ EM AMBIENTE DE STAGING
    // ============================================
    isStaging() {
        return this.env === 'staging';
    }

    // ============================================
    // VERIFICAR SE ESTÁ EM PRODUÇÃO
    // ============================================
    isProd() {
        return this.env === 'production';
    }
}

// ============================================
// EXPORTAR
// ============================================
var featureFlags = new FeatureFlags();
window.featureFlags = featureFlags;

console.log('✅ VIGORRE ONE™ - Feature Flags carregado com sucesso!');
console.log('🏷️ Ambiente:', featureFlags.getEnv());
console.log('🚩 Features ativas:', featureFlags.getActiveFeatures().length);
