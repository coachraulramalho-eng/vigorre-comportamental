/**
 * ============================================
 * VIGORRE ONE™ - SCROLL REVEAL
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * EFEITOS:
 * - Fade In
 * - Slide Up
 * - Slide Left
 * - Slide Right
 * - Zoom In
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO
// ============================================
const SCROLL_REVEAL_CONFIG = {
    defaultDelay: 100,
    defaultDuration: 600,
    defaultDistance: '30px',
    defaultOrigin: 'bottom',
    defaultInterval: 100,
    mobile: false
};

// ============================================
// CLASSE SCROLL REVEAL
// ============================================
class ScrollReveal {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.config = SCROLL_REVEAL_CONFIG;
        this.elements = [];
        this.isInitialized = false;
        this._init();
    }

    // ============================================
    // INICIALIZAR
    // ============================================
    _init() {
        if (this.isInitialized) return;
        
        console.log('👁️ Inicializando Scroll Reveal...');
        
        // Verificar suporte
        if (!('IntersectionObserver' in window)) {
            console.warn('⚠️ IntersectionObserver não suportado, revelando tudo');
            this._revealAll();
            return;
        }
        
        this._setupObserver();
        this.isInitialized = true;
        
        console.log('✅ Scroll Reveal inicializado');
    }

    // ============================================
    // CONFIGURAR OBSERVER
    // ============================================
    _setupObserver() {
        var elements = document.querySelectorAll('[data-reveal]');
        
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    this._revealElement(entry.target);
                    observer.unobserve(entry.target);
                }
            }.bind(this));
        }.bind(this), {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(function(el) {
            observer.observe(el);
            this.elements.push(el);
        }.bind(this));
    }

    // ============================================
    // REVELAR ELEMENTO
    // ============================================
    _revealElement(el) {
        var delay = parseInt(el.getAttribute('data-delay')) || this.config.defaultDelay;
        var duration = parseInt(el.getAttribute('data-duration')) || this.config.defaultDuration;
        var origin = el.getAttribute('data-origin') || this.config.defaultOrigin;
        var distance = el.getAttribute('data-distance') || this.config.defaultDistance;
        
        var transform = this._getTransform(origin, distance);
        
        el.style.opacity = '1';
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'opacity ' + duration + 'ms ease, transform ' + duration + 'ms ease';
        el.style.transitionDelay = delay + 'ms';
        
        // Adicionar classe revelada
        el.classList.add('revealed');
    }

    // ============================================
    // OBTER TRANSFORM
    // ============================================
    _getTransform(origin, distance) {
        var transforms = {
            'bottom': 'translateY(' + distance + ')',
            'top': 'translateY(-' + distance + ')',
            'left': 'translateX(-' + distance + ')',
            'right': 'translateX(' + distance + ')'
        };
        
        return transforms[origin] || transforms.bottom;
    }

    // ============================================
    // REVELAR TUDO (FALLBACK)
    // ============================================
    _revealAll() {
        var elements = document.querySelectorAll('[data-reveal]');
        elements.forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'translate(0, 0)';
            el.classList.add('revealed');
        });
    }

    // ============================================
    // REINICIAR
    // ============================================
    reset() {
        this.elements.forEach(function(el) {
            el.style.opacity = '0';
            el.style.transform = '';
            el.style.transition = '';
            el.style.transitionDelay = '';
            el.classList.remove('revealed');
        });
        
        this._setupObserver();
        
        console.log('🔄 Scroll Reveal reiniciado');
    }

    // ============================================
    // ATUALIZAR
    // ============================================
    update() {
        this.elements = [];
        this._setupObserver();
        console.log('🔄 Scroll Reveal atualizado');
    }
}

// ============================================
// INICIALIZAR
// ============================================
var scrollReveal = new ScrollReveal();
window.scrollReveal = scrollReveal;

console.log('✅ VIGORRE ONE™ - Scroll Reveal carregado com sucesso!');
