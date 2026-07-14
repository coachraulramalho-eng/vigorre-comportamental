/**
 * ============================================
 * VIGORRE ONE™ - LANDING INTEGRATION
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Conectar Landing Page ao sistema
 * - Formulários de contato/demo
 * - Rastreamento de leads
 * - Integração com API Gateway
 * - Event tracking
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO
// ============================================
const LANDING_INTEGRATION = {
    apiEndpoint: '/api/leads',
    enableTracking: true,
    enableAnalytics: true,
    cookieLifetime: 30, // dias
    leadSource: 'landing_page'
};

// ============================================
// CLASSE LANDING INTEGRATION
// ============================================
class LandingIntegration {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.config = LANDING_INTEGRATION;
        this.leadData = null;
        this.trackingId = this._getOrCreateTrackingId();
        this._init();
    }

    // ============================================
    // INICIALIZAR
    // ============================================
    _init() {
        console.log('🔗 Inicializando Landing Integration...');
        
        // Verificar se há dados de lead salvos
        this.leadData = this._getLeadData();
        
        // Configurar formulários
        this._setupForms();
        
        // Configurar tracking
        if (this.config.enableTracking) {
            this._setupTracking();
        }
        
        // Configurar analytics
        if (this.config.enableAnalytics) {
            this._setupAnalytics();
        }
        
        console.log('✅ Landing Integration inicializada');
        console.log('🆔 Tracking ID:', this.trackingId);
    }

    // ============================================
    // OBTER TRACKING ID
    // ============================================
    _getOrCreateTrackingId() {
        var trackingId = localStorage.getItem('vigorre_tracking_id');
        
        if (!trackingId) {
            trackingId = 'VIG-' + Date.now().toString(36) + 
                         '-' + Math.random().toString(36).slice(2, 8) +
                         '-' + navigator.userAgent.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '');
            localStorage.setItem('vigorre_tracking_id', trackingId);
        }
        
        return trackingId;
    }

    // ============================================
    // OBTER DADOS DO LEAD
    // ============================================
    _getLeadData() {
        try {
            var data = localStorage.getItem('vigorre_lead_data');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    // ============================================
    // SALVAR DADOS DO LEAD
    // ============================================
    _saveLeadData(data) {
        try {
            localStorage.setItem('vigorre_lead_data', JSON.stringify(data));
            this.leadData = data;
        } catch (error) {
            console.warn('⚠️ Erro ao salvar lead data:', error);
        }
    }

    // ============================================
    // CONFIGURAR FORMULÁRIOS
    // ============================================
    _setupForms() {
        // Formulário de demonstração
        var demoForm = document.getElementById('demoForm');
        if (demoForm) {
            demoForm.addEventListener('submit', this._handleDemoForm.bind(this));
        }
        
        // Formulário de contato
        var contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', this._handleContactForm.bind(this));
        }
        
        // Formulário de newsletter
        var newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', this._handleNewsletterForm.bind(this));
        }
        
        // Formulário de teste rápido
        var quickTestForm = document.getElementById('quickTestForm');
        if (quickTestForm) {
            quickTestForm.addEventListener('submit', this._handleQuickTestForm.bind(this));
        }
    }

    // ============================================
    // HANDLE DEMO FORM
    // ============================================
    _handleDemoForm(event) {
        event.preventDefault();
        
        var form = event.target;
        var data = this._getFormData(form);
        
        data.type = 'demo';
        data.source = this.config.leadSource;
        data.trackingId = this.trackingId;
        data.timestamp = new Date().toISOString();
        
        this._submitLead(data, function(response) {
            alert('✅ Obrigado ' + data.name + '! Agendaremos sua demonstração em breve.');
            form.reset();
            this._trackEvent('demo_requested', data);
        }.bind(this));
    }

    // ============================================
    // HANDLE CONTACT FORM
    // ============================================
    _handleContactForm(event) {
        event.preventDefault();
        
        var form = event.target;
        var data = this._getFormData(form);
        
        data.type = 'contact';
        data.source = this.config.leadSource;
        data.trackingId = this.trackingId;
        data.timestamp = new Date().toISOString();
        
        this._submitLead(data, function(response) {
            alert('✅ Mensagem enviada! Entraremos em contato em breve.');
            form.reset();
            this._trackEvent('contact_submitted', data);
        }.bind(this));
    }

    // ============================================
    // HANDLE NEWSLETTER FORM
    // ============================================
    _handleNewsletterForm(event) {
        event.preventDefault();
        
        var form = event.target;
        var data = this._getFormData(form);
        
        data.type = 'newsletter';
        data.source = this.config.leadSource;
        data.trackingId = this.trackingId;
        data.timestamp = new Date().toISOString();
        
        this._submitLead(data, function(response) {
            alert('✅ Inscrição realizada com sucesso!');
            form.reset();
            this._trackEvent('newsletter_subscribed', data);
        }.bind(this));
    }

    // ============================================
    // HANDLE QUICK TEST FORM
    // ============================================
    _handleQuickTestForm(event) {
        event.preventDefault();
        
        var form = event.target;
        var data = this._getFormData(form);
        
        data.type = 'quick_test';
        data.source = this.config.leadSource;
        data.trackingId = this.trackingId;
        data.timestamp = new Date().toISOString();
        
        this._submitLead(data, function(response) {
            alert('✅ Teste iniciado! Você será redirecionado.');
            // Redirecionar para teste
            window.location.href = '/teste-rapido.html';
            this._trackEvent('quick_test_started', data);
        }.bind(this));
    }

    // ============================================
    // OBTER DADOS DO FORMULÁRIO
    // ============================================
    _getFormData(form) {
        var data = {};
        var inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(function(input) {
            var name = input.name || input.id;
            if (name) {
                data[name] = input.value;
            }
        });
        
        return data;
    }

    // ============================================
    // SUBMIT LEAD
    // ============================================
    _submitLead(data, callback) {
        // Salvar localmente
        this._saveLeadData(data);
        
        // Enviar para API
        if (window.apiGateway) {
            window.apiGateway.post(this.config.apiEndpoint, data)
                .then(function(response) {
                    console.log('📤 Lead enviado:', response);
                    if (callback) callback(response);
                })
                .catch(function(error) {
                    console.error('❌ Erro ao enviar lead:', error);
                    // Fallback: enviar via email ou localStorage
                    this._saveLeadFallback(data);
                    if (callback) callback({ success: false, error: error.message });
                }.bind(this));
        } else {
            // Fallback: salvar no localStorage
            this._saveLeadFallback(data);
            if (callback) callback({ success: true, fallback: true });
        }
    }

    // ============================================
    // FALLBACK LEAD
    // ============================================
    _saveLeadFallback(data) {
        try {
            var leads = JSON.parse(localStorage.getItem('vigorre_leads') || '[]');
            data.id = 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
            leads.push(data);
            localStorage.setItem('vigorre_leads', JSON.stringify(leads));
            console.log('📤 Lead salvo no localStorage (fallback)');
        } catch (error) {
            console.error('❌ Erro ao salvar lead (fallback):', error);
        }
    }

    // ============================================
    // CONFIGURAR TRACKING
    // ============================================
    _setupTracking() {
        // Track page view
        this._trackPageView();
        
        // Track scroll depth
        this._trackScrollDepth();
        
        // Track time on page
        this._trackTimeOnPage();
        
        // Track outbound clicks
        this._trackOutboundClicks();
    }

    // ============================================
    // TRACK PAGE VIEW
    // ============================================
    _trackPageView() {
        var data = {
            page: window.location.pathname,
            referrer: document.referrer,
            title: document.title,
            trackingId: this.trackingId,
            timestamp: new Date().toISOString()
        };
        
        this._trackEvent('page_view', data);
    }

    // ============================================
    // TRACK SCROLL DEPTH
    // ============================================
    _trackScrollDepth() {
        var maxDepth = 0;
        var thresholds = [25, 50, 75, 100];
        
        window.addEventListener('scroll', function() {
            var scrollTop = window.pageYOffset;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var depth = Math.round((scrollTop / docHeight) * 100);
            
            if (depth > maxDepth) {
                maxDepth = depth;
                for (var i = 0; i < thresholds.length; i++) {
                    if (depth >= thresholds[i]) {
                        this._trackEvent('scroll_depth', { 
                            depth: thresholds[i],
                            trackingId: this.trackingId
                        });
                        thresholds.splice(i, 1);
                        i--;
                    }
                }
            }
        }.bind(this));
    }

    // ============================================
    // TRACK TIME ON PAGE
    // ============================================
    _trackTimeOnPage() {
        var startTime = Date.now();
        var intervals = [30, 60, 120, 300, 600]; // segundos
        
        var intervalId = setInterval(function() {
            var elapsed = Math.round((Date.now() - startTime) / 1000);
            
            for (var i = 0; i < intervals.length; i++) {
                if (elapsed >= intervals[i]) {
                    this._trackEvent('time_on_page', {
                        seconds: intervals[i],
                        trackingId: this.trackingId
                    });
                    intervals.splice(i, 1);
                    i--;
                }
            }
            
            if (intervals.length === 0) {
                clearInterval(intervalId);
            }
        }.bind(this), 5000);
    }

    // ============================================
    // TRACK OUTBOUND CLICKS
    // ============================================
    _trackOutboundClicks() {
        document.querySelectorAll('a[href^="http"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                var href = link.getAttribute('href');
                if (!href.startsWith(window.location.origin)) {
                    this._trackEvent('outbound_click', {
                        url: href,
                        text: link.textContent || '',
                        trackingId: this.trackingId
                    });
                }
            }.bind(this));
        }.bind(this));
    }

    // ============================================
    // TRACK EVENT
    // ============================================
    _trackEvent(eventName, data) {
        if (!this.config.enableTracking) return;
        
        var eventData = {
            event: eventName,
            data: data || {},
            trackingId: this.trackingId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenSize: window.innerWidth + 'x' + window.innerHeight
        };
        
        // Salvar no localStorage
        try {
            var events = JSON.parse(localStorage.getItem('vigorre_tracking_events') || '[]');
            events.push(eventData);
            // Manter apenas os últimos 1000 eventos
            if (events.length > 1000) {
                events = events.slice(-1000);
            }
            localStorage.setItem('vigorre_tracking_events', JSON.stringify(events));
        } catch (error) {
            console.warn('⚠️ Erro ao salvar evento:', error);
        }
        
        console.log('📊 Evento:', eventName, eventData);
    }

    // ============================================
    // CONFIGURAR ANALYTICS
    // ============================================
    _setupAnalytics() {
        // Simular integração com Google Analytics
        // Em produção, adicionar GA4 ou outro serviço
        
        // Verificar se há um botão de CTA
        var ctaButtons = document.querySelectorAll('.btn-primary, .btn-gold, .btn-lg');
        ctaButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                this._trackEvent('cta_click', {
                    text: btn.textContent || '',
                    href: btn.getAttribute('href') || '',
                    trackingId: this.trackingId
                });
            }.bind(this));
        }.bind(this));
    }

    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================
    
    // Obter dados do lead
    getLeadData() {
        return this.leadData;
    }
    
    // Obter tracking ID
    getTrackingId() {
        return this.trackingId;
    }
    
    // Limpar dados
    clearData() {
        localStorage.removeItem('vigorre_lead_data');
        localStorage.removeItem('vigorre_tracking_id');
        this.leadData = null;
        this.trackingId = this._getOrCreateTrackingId();
        console.log('🧹 Dados de tracking limpos');
    }
    
    // Exportar dados
    exportData() {
        return {
            trackingId: this.trackingId,
            leadData: this.leadData,
            events: JSON.parse(localStorage.getItem('vigorre_tracking_events') || '[]'),
            leads: JSON.parse(localStorage.getItem('vigorre_leads') || '[]')
        };
    }
}

// ============================================
// EXPORTAR
// ============================================
var landingIntegration = new LandingIntegration();
window.landingIntegration = landingIntegration;

console.log('✅ VIGORRE ONE™ - Landing Integration carregada com sucesso!');
console.log('🆔 Tracking ID:', landingIntegration.getTrackingId());
