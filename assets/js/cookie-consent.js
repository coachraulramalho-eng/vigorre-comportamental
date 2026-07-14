/**
 * ============================================
 * VIGORRE ONE™ - COOKIE CONSENT
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Banner de consentimento de cookies
 * - Gerenciamento de preferências
 * - LGPD/GDPR compliance
 * - Tipos de cookies
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO
// ============================================
const COOKIE_CONSENT_CONFIG = {
    cookieName: 'vigorre_cookie_consent',
    cookieExpiry: 365, // dias
    bannerId: 'cookie-banner',
    settingsId: 'cookie-settings',
    types: {
        necessary: {
            name: 'Necessários',
            description: 'Cookies essenciais para o funcionamento do site.',
            default: true,
            required: true
        },
        analytics: {
            name: 'Analytics',
            description: 'Cookies para análise de comportamento e melhorias.',
            default: false,
            required: false
        },
        marketing: {
            name: 'Marketing',
            description: 'Cookies para campanhas e personalização de anúncios.',
            default: false,
            required: false
        },
        preferences: {
            name: 'Preferências',
            description: 'Cookies para lembrar suas preferências.',
            default: false,
            required: false
        }
    }
};

// ============================================
// CLASSE COOKIE CONSENT
// ============================================
class CookieConsent {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.config = COOKIE_CONSENT_CONFIG;
        this.consent = null;
        this._init();
    }

    // ============================================
    // INICIALIZAR
    // ============================================
    _init() {
        console.log('🍪 Inicializando Cookie Consent...');
        
        // Verificar consentimento existente
        this.consent = this._getConsent();
        
        // Se não houver consentimento, mostrar banner
        if (!this.consent) {
            this._showBanner();
        } else {
            this._applyConsent(this.consent);
        }
        
        console.log('✅ Cookie Consent inicializado');
    }

    // ============================================
    // OBTER CONSENTIMENTO
    // ============================================
    _getConsent() {
        try {
            var cookie = document.cookie.split('; ').find(function(row) {
                return row.startsWith(this.config.cookieName + '=');
            }.bind(this));
            
            if (cookie) {
                var value = cookie.split('=')[1];
                return JSON.parse(decodeURIComponent(value));
            }
            
            return null;
            
        } catch (error) {
            console.warn('⚠️ Erro ao ler cookie:', error);
            return null;
        }
    }

    // ============================================
    // SALVAR CONSENTIMENTO
    // ============================================
    _saveConsent(consent) {
        try {
            var expires = new Date();
            expires.setDate(expires.getDate() + this.config.cookieExpiry);
            
            document.cookie = this.config.cookieName + '=' + 
                              encodeURIComponent(JSON.stringify(consent)) + 
                              '; expires=' + expires.toUTCString() + 
                              '; path=/; SameSite=Lax';
            
            this.consent = consent;
            
            console.log('🍪 Consentimento salvo:', consent);
            
        } catch (error) {
            console.error('❌ Erro ao salvar cookie:', error);
        }
    }

    // ============================================
    // APLICAR CONSENTIMENTO
    // ============================================
    _applyConsent(consent) {
        if (!consent) return;
        
        // Aplicar cookies de analytics
        if (consent.analytics) {
            this._enableAnalytics();
        }
        
        // Aplicar cookies de marketing
        if (consent.marketing) {
            this._enableMarketing();
        }
        
        // Aplicar cookies de preferências
        if (consent.preferences) {
            this._enablePreferences();
        }
        
        console.log('🍪 Consentimento aplicado:', consent);
    }

    // ============================================
    // MOSTRAR BANNER
    // ============================================
    _showBanner() {
        var banner = document.getElementById(this.config.bannerId);
        
        if (!banner) {
            // Criar banner se não existir
            banner = this._createBanner();
            document.body.appendChild(banner);
        }
        
        banner.classList.add('active');
        
        console.log('🍪 Banner de cookies exibido');
    }

    // ============================================
    // CRIAR BANNER
    // ============================================
    _createBanner() {
        var banner = document.createElement('div');
        banner.id = this.config.bannerId;
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <strong>🍪 Nós usamos cookies</strong>
                    <p>Utilizamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo. 
                       Ao continuar navegando, você concorda com nossa <a href="/privacidade.html">Política de Privacidade</a>.</p>
                </div>
                <div class="cookie-banner-actions">
                    <button class="btn btn-secondary" onclick="cookieConsent.rejectAll()">Rejeitar todos</button>
                    <button class="btn btn-outline" onclick="cookieConsent.showSettings()">Configurar</button>
                    <button class="btn btn-primary" onclick="cookieConsent.acceptAll()">Aceitar todos</button>
                </div>
            </div>
        `;
        
        return banner;
    }

    // ============================================
    // MOSTRAR CONFIGURAÇÕES
    // ============================================
    showSettings() {
        var settings = document.getElementById(this.config.settingsId);
        
        if (!settings) {
            settings = this._createSettings();
            document.body.appendChild(settings);
        }
        
        settings.classList.add('active');
        
        // Preencher com valores atuais
        var consent = this.consent || this._getDefaultConsent();
        var checkboxes = settings.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(cb) {
            if (consent[cb.value] !== undefined) {
                cb.checked = consent[cb.value];
            }
        });
        
        console.log('🍪 Configurações de cookies abertas');
    }

    // ============================================
    // CRIAR CONFIGURAÇÕES
    // ============================================
    _createSettings() {
        var modal = document.createElement('div');
        modal.id = this.config.settingsId;
        modal.className = 'cookie-settings';
        modal.innerHTML = `
            <div class="cookie-settings-overlay" onclick="cookieConsent.closeSettings()"></div>
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h2>🍪 Configurações de Cookies</h2>
                    <button class="cookie-settings-close" onclick="cookieConsent.closeSettings()">✕</button>
                </div>
                <div class="cookie-settings-body">
                    <p>Selecione quais tipos de cookies você deseja permitir.</p>
                    ${Object.entries(this.config.types).map(function([key, type]) {
                        return `
                            <div class="cookie-setting-item">
                                <div class="cookie-setting-header">
                                    <label>
                                        <input type="checkbox" value="${key}" ${type.required ? 'disabled checked' : ''} />
                                        <strong>${type.name}</strong>
                                    </label>
                                    ${type.required ? '<span class="cookie-required-badge">Obrigatório</span>' : ''}
                                </div>
                                <p class="cookie-setting-description">${type.description}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="cookie-settings-footer">
                    <button class="btn btn-secondary" onclick="cookieConsent.rejectAll()">Rejeitar todos</button>
                    <button class="btn btn-primary" onclick="cookieConsent.saveSettings()">Salvar preferências</button>
                </div>
            </div>
        `;
        
        return modal;
    }

    // ============================================
    // OBTER CONSENTIMENTO PADRÃO
    // ============================================
    _getDefaultConsent() {
        var consent = {};
        for (var key in this.config.types) {
            consent[key] = this.config.types[key].default;
        }
        return consent;
    }

    // ============================================
    // ACEITAR TODOS
    // ============================================
    acceptAll() {
        var consent = {};
        for (var key in this.config.types) {
            consent[key] = true;
        }
        this._saveConsent(consent);
        this._applyConsent(consent);
        this._closeBanner();
        console.log('🍪 Todos os cookies aceitos');
    }

    // ============================================
    // REJEITAR TODOS
    // ============================================
    rejectAll() {
        var consent = {};
        for (var key in this.config.types) {
            consent[key] = this.config.types[key].required;
        }
        this._saveConsent(consent);
        this._applyConsent(consent);
        this._closeBanner();
        this.closeSettings();
        console.log('🍪 Todos os cookies rejeitados');
    }

    // ============================================
    // SALVAR CONFIGURAÇÕES
    // ============================================
    saveSettings() {
        var settings = document.getElementById(this.config.settingsId);
        if (!settings) return;
        
        var checkboxes = settings.querySelectorAll('input[type="checkbox"]');
        var consent = {};
        
        checkboxes.forEach(function(cb) {
            consent[cb.value] = cb.checked;
        });
        
        this._saveConsent(consent);
        this._applyConsent(consent);
        this.closeSettings();
        console.log('🍪 Preferências de cookies salvas');
    }

    // ============================================
    // FECHAR CONFIGURAÇÕES
    // ============================================
    closeSettings() {
        var settings = document.getElementById(this.config.settingsId);
        if (settings) {
            settings.classList.remove('active');
        }
    }

    // ============================================
    // FECHAR BANNER
    // ============================================
    _closeBanner() {
        var banner = document.getElementById(this.config.bannerId);
        if (banner) {
            banner.classList.remove('active');
        }
    }

    // ============================================
    // HABILITAR ANALYTICS
    // ============================================
    _enableAnalytics() {
        // Inicializar analytics
        if (window.analytics) {
            window.analytics.pageView({
                page_title: document.title,
                page_location: window.location.href
            });
        }
        console.log('📊 Analytics habilitado');
    }

    // ============================================
    // HABILITAR MARKETING
    // ============================================
    _enableMarketing() {
        console.log('📢 Marketing habilitado');
        // Aqui seria a inicialização de ferramentas de marketing
    }

    // ============================================
    // HABILITAR PREFERÊNCIAS
    // ============================================
    _enablePreferences() {
        console.log('🎯 Preferências habilitadas');
        // Aqui seria a inicialização de cookies de preferências
    }
}

// ============================================
// EXPORTAR
// ============================================
var cookieConsent = new CookieConsent();
window.cookieConsent = cookieConsent;

console.log('✅ VIGORRE ONE™ - Cookie Consent carregado com sucesso!');
