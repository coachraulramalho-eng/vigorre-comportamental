/**
 * ============================================
 * VIGORRE ONE™ - LEAD SCORING
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * SISTEMA DE PONTUAÇÃO DE LEADS:
 * - Pontuação baseada em comportamento
 * - Segmentação automática
 * - Qualificação de leads
 * - Priorização de contato
 * - Integração com CRM
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO
// ============================================
const LEAD_SCORING_CONFIG = {
    weights: {
        pageView: 1,
        scrollDepth: 2,
        timeOnPage: 3,
        ctaClick: 5,
        formSubmit: 10,
        calculatorUse: 8,
        testStart: 15,
        demoRequest: 20
    },
    
    thresholds: {
        cold: 0,
        warm: 20,
        hot: 50,
        qualified: 80
    },
    
    segments: {
        cold: 'Frio',
        warm: 'Morno',
        hot: 'Quente',
        qualified: 'Qualificado'
    }
};

// ============================================
// CLASSE LEAD SCORING
// ============================================
class LeadScoring {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.config = LEAD_SCORING_CONFIG;
        this.leadId = this._getOrCreateLeadId();
        this.score = this._getScore();
        this.history = this._getHistory();
        this.init();
    }

    // ============================================
    // INICIALIZAR
    // ============================================
    init() {
        console.log('🎯 Lead Scoring inicializado');
        console.log('🆔 Lead ID:', this.leadId);
        console.log('📊 Score atual:', this.score);
        
        this._setupTracking();
        this._updateScore();
    }

    // ============================================
    // OBTER LEAD ID
    // ============================================
    _getOrCreateLeadId() {
        var id = localStorage.getItem('vigorre_lead_id');
        if (!id) {
            id = 'LEAD-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
            localStorage.setItem('vigorre_lead_id', id);
        }
        return id;
    }

    // ============================================
    // OBTER SCORE
    // ============================================
    _getScore() {
        try {
            var data = JSON.parse(localStorage.getItem('vigorre_lead_score') || '{}');
            return data.score || 0;
        } catch {
            return 0;
        }
    }

    // ============================================
    // OBTER HISTÓRICO
    // ============================================
    _getHistory() {
        try {
            var data = JSON.parse(localStorage.getItem('vigorre_lead_history') || '[]');
            return data;
        } catch {
            return [];
        }
    }

    // ============================================
    // CONFIGURAR TRACKING
    // ============================================
    _setupTracking() {
        // Page view
        this._trackEvent('pageView');
        
        // Scroll depth
        this._trackScrollDepth();
        
        // Time on page
        this._trackTimeOnPage();
        
        // CTA clicks
        this._trackCtaClicks();
        
        // Form submits
        this._trackFormSubmits();
        
        // Calculator use
        this._trackCalculatorUse();
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
                        this._trackEvent('scrollDepth', { depth: thresholds[i] });
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
        var intervals = [30, 60, 120, 300];
        
        setInterval(function() {
            var elapsed = Math.round((Date.now() - startTime) / 1000);
            
            for (var i = 0; i < intervals.length; i++) {
                if (elapsed >= intervals[i]) {
                    this._trackEvent('timeOnPage', { seconds: intervals[i] });
                    intervals.splice(i, 1);
                    i--;
                }
            }
        }.bind(this), 5000);
    }

    // ============================================
    // TRACK CTA CLICKS
    // ============================================
    _trackCtaClicks() {
        document.querySelectorAll('.btn-primary, .btn-gold, .btn-lg, .cta-button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                this._trackEvent('ctaClick', {
                    text: btn.textContent || '',
                    href: btn.getAttribute('href') || ''
                });
            }.bind(this));
        }.bind(this));
    }

    // ============================================
    // TRACK FORM SUBMITS
    // ============================================
    _trackFormSubmits() {
        document.addEventListener('submit', function(e) {
            var form = e.target;
            if (form.id && form.id.includes('form')) {
                this._trackEvent('formSubmit', {
                    formId: form.id,
                    formAction: form.action || ''
                });
            }
        }.bind(this));
    }

    // ============================================
    // TRACK CALCULATOR USE
    // ============================================
    _trackCalculatorUse() {
        var calcBtn = document.querySelector('#roi-calculator .btn');
        if (calcBtn) {
            calcBtn.addEventListener('click', function() {
                this._trackEvent('calculatorUse');
            }.bind(this));
        }
    }

    // ============================================
    // TRACK EVENT
    // ============================================
    _trackEvent(eventName, data) {
        var weight = this.config.weights[eventName] || 1;
        var points = weight;
        
        // Bônus por interações subsequentes
        if (this.history.length > 3) {
            points *= 1.5;
        }
        if (this.history.length > 10) {
            points *= 2;
        }
        
        // Registrar no histórico
        this.history.push({
            event: eventName,
            data: data || {},
            points: points,
            timestamp: new Date().toISOString()
        });
        
        // Atualizar score
        this.score += points;
        
        // Salvar
        this._saveScore();
        this._saveHistory();
        
        // Atualizar segmento
        var segment = this.getSegment();
        
        console.log('📊 Evento:', eventName, '+', points, 'pts | Score:', this.score, '| Segmento:', segment);
        
        // Se qualificado, disparar evento
        if (segment === 'Qualificado') {
            this._onQualified();
        }
    }

    // ============================================
    // SALVAR SCORE
    // ============================================
    _saveScore() {
        localStorage.setItem('vigorre_lead_score', JSON.stringify({
            score: this.score,
            updatedAt: new Date().toISOString()
        }));
    }

    // ============================================
    // SALVAR HISTÓRICO
    // ============================================
    _saveHistory() {
        localStorage.setItem('vigorre_lead_history', JSON.stringify(this.history));
    }

    // ============================================
    // ATUALIZAR SCORE
    // ============================================
    _updateScore() {
        // Exibir no console se debug
        if (this.score > 0) {
            console.log('🎯 Lead Score:', this.score, '| Segmento:', this.getSegment());
        }
    }

    // ============================================
    // OBTER SEGMENTO
    // ============================================
    getSegment() {
        var thresholds = this.config.thresholds;
        var segments = this.config.segments;
        
        if (this.score >= thresholds.qualified) return segments.qualified;
        if (this.score >= thresholds.hot) return segments.hot;
        if (this.score >= thresholds.warm) return segments.warm;
        return segments.cold;
    }

    // ============================================
    // LEAD QUALIFICADO
    // ============================================
    _onQualified() {
        console.log('🎯 LEAD QUALIFICADO! Score:', this.score);
        
        // Disparar evento global
        if (window.eventBus) {
            window.eventBus.emit('lead:qualified', {
                leadId: this.leadId,
                score: this.score,
                history: this.history
            });
        }
        
        // Mostrar notificação (opcional)
        this._showNotification('🎯 Lead qualificado! Nossa equipe entrará em contato em breve.');
    }

    // ============================================
    // NOTIFICAÇÃO
    // ============================================
    _showNotification(message) {
        var notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            background: var(--navy);
            color: white;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: 'Inter', sans-serif;
            max-width: 400px;
            animation: slide-up 0.5s ease;
            border-left: 4px solid var(--gold);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(function() {
            notification.style.animation = 'slide-up 0.5s ease reverse';
            setTimeout(function() {
                notification.remove();
            }, 500);
        }, 5000);
    }
}

// ============================================
// EXPORTAR
// ============================================
var leadScoring = new LeadScoring();
window.leadScoring = leadScoring;

console.log('✅ VIGORRE ONE™ - Lead Scoring carregado com sucesso!');
