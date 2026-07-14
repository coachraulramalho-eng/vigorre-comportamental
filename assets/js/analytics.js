/**
 * ============================================
 * VIGORRE ONE™ - ANALYTICS
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Google Analytics 4
 * - Eventos personalizados
 * - Conversões
 * - Funis
 * - Heatmaps simplificados
 * - Dashboard de analytics
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO
// ============================================
const ANALYTICS_CONFIG = {
    ga4: {
        measurementId: 'G-XXXXXXXXXX', // Substituir pelo ID real
        enabled: true
    },
    events: {
        pageView: true,
        scroll: true,
        click: true,
        formSubmit: true,
        conversion: true
    },
    debug: false
};

// ============================================
// CLASSE ANALYTICS
// ============================================
class Analytics {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.config = ANALYTICS_CONFIG;
        this.isInitialized = false;
        this._init();
    }

    // ============================================
    // INICIALIZAR
    // ============================================
    _init() {
        console.log('📊 Inicializando Analytics...');
        
        // Carregar GA4
        if (this.config.ga4.enabled) {
            this._loadGA4();
        }
        
        // Configurar eventos
        this._setupEvents();
        
        this.isInitialized = true;
        console.log('✅ Analytics inicializado');
    }

    // ============================================
    // CARREGAR GA4
    // ============================================
    _loadGA4() {
        try {
            // Criar script tag para GA4
            var script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.config.ga4.measurementId;
            document.head.appendChild(script);
            
            // Inicializar gtag
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() {
                window.dataLayer.push(arguments);
            };
            
            window.gtag('js', new Date());
            window.gtag('config', this.config.ga4.measurementId, {
                send_page_view: false // Enviaremos manualmente
            });
            
            console.log('📊 GA4 carregado:', this.config.ga4.measurementId);
            
        } catch (error) {
            console.warn('⚠️ Erro ao carregar GA4:', error);
        }
    }

    // ============================================
    // CONFIGURAR EVENTOS
    // ============================================
    _setupEvents() {
        // Page View
        if (this.config.events.pageView) {
            this._trackPageView();
        }
        
        // Scroll
        if (this.config.events.scroll) {
            this._trackScroll();
        }
        
        // Click
        if (this.config.events.click) {
            this._trackClicks();
        }
        
        // Form Submit
        if (this.config.events.formSubmit) {
            this._trackFormSubmits();
        }
        
        // Conversões
        if (this.config.events.conversion) {
            this._trackConversions();
        }
    }

    // ============================================
    // TRACK PAGE VIEW
    // ============================================
    _trackPageView() {
        this.pageView({
            page_title: document.title,
            page_location: window.location.href,
            page_referrer: document.referrer
        });
    }

    // ============================================
    // TRACK SCROLL
    // ============================================
    _trackScroll() {
        var maxDepth = 0;
        var thresholds = [25, 50, 75, 90, 100];
        
        window.addEventListener('scroll', function() {
            var scrollTop = window.pageYOffset;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var depth = Math.round((scrollTop / docHeight) * 100);
            
            if (depth > maxDepth) {
                maxDepth = depth;
                for (var i = 0; i < thresholds.length; i++) {
                    if (depth >= thresholds[i]) {
                        this.trackEvent('scroll_depth', {
                            depth: thresholds[i],
                            page: window.location.pathname
                        });
                        thresholds.splice(i, 1);
                        i--;
                    }
                }
            }
        }.bind(this));
    }

    // ============================================
    // TRACK CLICKS
    // ============================================
    _trackClicks() {
        document.addEventListener('click', function(e) {
            var target = e.target;
            var tag = target.tagName.toLowerCase();
            var href = target.getAttribute('href') || '';
            var text = target.textContent || '';
            
            // Clicks em links
            if (tag === 'a' && href) {
                this.trackEvent('link_click', {
                    href: href,
                    text: text,
                    page: window.location.pathname
                });
            }
            
            // Clicks em botões
            if (tag === 'button' || (tag === 'input' && target.type === 'button') || 
                (tag === 'a' && target.classList && target.classList.contains('btn'))) {
                this.trackEvent('button_click', {
                    text: text,
                    id: target.id || '',
                    page: window.location.pathname
                });
            }
        }.bind(this));
    }

    // ============================================
    // TRACK FORM SUBMITS
    // ============================================
    _trackFormSubmits() {
        document.addEventListener('submit', function(e) {
            var form = e.target;
            var formId = form.id || 'form_' + Math.random().toString(36).slice(2, 6);
            
            this.trackEvent('form_submit', {
                form_id: formId,
                form_action: form.action || '',
                page: window.location.pathname
            });
        }.bind(this));
    }

    // ============================================
    // TRACK CONVERSIONS
    // ============================================
    _trackConversions() {
        // Detectar conversões em URLs (thank you pages)
        if (window.location.pathname.indexOf('/obrigado') !== -1 ||
            window.location.pathname.indexOf('/thank-you') !== -1) {
            this.trackConversion('lead', {
                source: document.referrer || 'direct',
                page: window.location.pathname
            });
        }
        
        // Detectar conversões em parâmetros URL
        var params = new URLSearchParams(window.location.search);
        if (params.get('conversion') === 'true') {
            this.trackConversion(params.get('type') || 'generic', {
                source: params.get('source') || 'unknown',
                page: window.location.pathname
            });
        }
    }

    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================
    
    // Track Page View
    pageView(data) {
        // GA4
        if (window.gtag) {
            window.gtag('event', 'page_view', data);
        }
        
        // Salvar localmente
        this._saveEvent('page_view', data);
        
        if (this.config.debug) {
            console.log('📊 Page View:', data);
        }
    }
    
    // Track Event
    trackEvent(eventName, data) {
        // GA4
        if (window.gtag) {
            window.gtag('event', eventName, data);
        }
        
        // Salvar localmente
        this._saveEvent(eventName, data);
        
        if (this.config.debug) {
            console.log('📊 Evento:', eventName, data);
        }
    }
    
    // Track Conversion
    trackConversion(type, data) {
        var eventData = {
            conversion_type: type,
            ...data,
            timestamp: new Date().toISOString()
        };
        
        // GA4
        if (window.gtag) {
            window.gtag('event', 'conversion', eventData);
        }
        
        // Salvar localmente
        this._saveEvent('conversion', eventData);
        
        console.log('🎯 Conversão:', type, eventData);
    }
    
    // Track User
    trackUser(userId, userData) {
        if (window.gtag) {
            window.gtag('set', 'user_id', userId);
            window.gtag('set', 'user_properties', userData);
        }
        
        console.log('👤 Usuário:', userId, userData);
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================
    
    _saveEvent(eventName, data) {
        try {
            var events = JSON.parse(localStorage.getItem('vigorre_analytics_events') || '[]');
            events.push({
                event: eventName,
                data: data,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
            if (events.length > 500) {
                events = events.slice(-500);
            }
            localStorage.setItem('vigorre_analytics_events', JSON.stringify(events));
        } catch (error) {
            console.warn('⚠️ Erro ao salvar evento analytics:', error);
        }
    }
}

// ============================================
// EXPORTAR
// ============================================
var analytics = new Analytics();
window.analytics = analytics;

console.log('✅ VIGORRE ONE™ - Analytics carregado com sucesso!');
