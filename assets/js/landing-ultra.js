/**
 * ============================================
 * VIGORRE ONE™ - LANDING ULTRA JS
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * INTERAÇÕES AVANÇADAS:
 * - Efeito de parallax
 * - Mouse tracking
 * - Cards 3D
 * - Scroll progress
 * - Smooth anchor
 * - Countup animation
 * - Ripple effect em botões
 * - Intersection Observer avançado
 * ============================================
 */

'use strict';

// ============================================
// PARALLAX
// ============================================
class Parallax {
    constructor() {
        this.elements = document.querySelectorAll('[data-parallax]');
        this.init();
    }

    init() {
        window.addEventListener('scroll', function() {
            var scrolled = window.pageYOffset;
            
            this.elements.forEach(function(el) {
                var speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.3;
                var direction = el.getAttribute('data-parallax-direction') || 'down';
                var offset = scrolled * speed;
                
                if (direction === 'up') {
                    offset = -offset;
                }
                
                el.style.transform = 'translateY(' + offset + 'px)';
            }.bind(this));
        }.bind(this));
    }
}

// ============================================
// MOUSE TRACKING 3D
// ============================================
class Mouse3D {
    constructor() {
        this.cards = document.querySelectorAll('[data-3d]');
        this.bounds = { x: 0, y: 0 };
        this.init();
    }

    init() {
        document.addEventListener('mousemove', function(e) {
            var x = (e.clientX / window.innerWidth - 0.5) * 20;
            var y = (e.clientY / window.innerHeight - 0.5) * 20;
            
            this.bounds.x = x;
            this.bounds.y = y;
            
            this.cards.forEach(function(card) {
                var rotateX = -this.bounds.y * 0.5;
                var rotateY = this.bounds.x * 0.5;
                var translateZ = 10;
                
                card.style.transform = 
                    'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(' + translateZ + 'px)';
            }.bind(this));
        }.bind(this));
    }
}

// ============================================
// SCROLL PROGRESS
// ============================================
class ScrollProgress {
    constructor() {
        this.bar = document.querySelector('.scroll-progress');
        this.init();
    }

    init() {
        if (!this.bar) return;
        
        window.addEventListener('scroll', function() {
            var scrollTop = window.pageYOffset;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var progress = (scrollTop / docHeight) * 100;
            
            this.bar.style.width = progress + '%';
        }.bind(this));
    }
}

// ============================================
// SMOOTH ANCHOR (com offset)
// ============================================
class SmoothAnchor {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        this.init();
    }

    init() {
        this.links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                var targetId = this.getAttribute('href');
                var target = document.querySelector(targetId);
                
                if (target) {
                    e.preventDefault();
                    var offset = 80;
                    var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Atualizar URL
                    history.pushState(null, null, targetId);
                }
            }.bind(link));
        });
    }
}

// ============================================
// COUNTUP ANIMATION
// ============================================
class CountUp {
    constructor() {
        this.elements = document.querySelectorAll('[data-count]');
        this.animated = false;
        this.init();
    }

    init() {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !this.animated) {
                    this.animated = true;
                    this.animate(entry.target);
                }
            }.bind(this));
        }.bind(this), { threshold: 0.5 });
        
        this.elements.forEach(function(el) {
            observer.observe(el);
        });
    }

    animate(el) {
        var target = parseInt(el.getAttribute('data-count'));
        var duration = parseInt(el.getAttribute('data-duration')) || 2000;
        var start = 0;
        var startTime = null;
        var suffix = el.getAttribute('data-suffix') || '';
        
        function update(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var value = Math.round(start + (target - start) * eased);
            
            el.textContent = value + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + suffix;
            }
        }
        
        requestAnimationFrame(update);
    }
}

// ============================================
// RIPPLE EFFECT
// ============================================
class RippleEffect {
    constructor() {
        this.buttons = document.querySelectorAll('.btn-ripple');
        this.init();
    }

    init() {
        this.buttons.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                
                var ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.width = '20px';
                ripple.style.height = '20px';
                
                btn.appendChild(ripple);
                
                setTimeout(function() {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// ============================================
// ADVANCED INTERSECTION OBSERVER
// ============================================
class AdvancedReveal {
    constructor() {
        this.elements = document.querySelectorAll('[data-reveal]');
        this.init();
    }

    init() {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var delay = parseInt(el.getAttribute('data-delay')) || 0;
                    var duration = parseInt(el.getAttribute('data-duration')) || 600;
                    var distance = el.getAttribute('data-distance') || '30px';
                    var origin = el.getAttribute('data-origin') || 'bottom';
                    
                    var transforms = {
                        'bottom': 'translateY(' + distance + ')',
                        'top': 'translateY(-' + distance + ')',
                        'left': 'translateX(-' + distance + ')',
                        'right': 'translateX(' + distance + ')'
                    };
                    
                    el.style.opacity = '0';
                    el.style.transform = transforms[origin] || transforms.bottom;
                    el.style.transition = 'opacity ' + duration + 'ms ease, transform ' + duration + 'ms ease';
                    el.style.transitionDelay = delay + 'ms';
                    
                    setTimeout(function() {
                        el.style.opacity = '1';
                        el.style.transform = 'translate(0, 0)';
                        el.classList.add('revealed');
                    }, 100);
                    
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        this.elements.forEach(function(el) {
            observer.observe(el);
        });
    }
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 VIGORRE ONE™ - Landing Ultra JS carregado');
    
    // Inicializar componentes
    new Parallax();
    new Mouse3D();
    new ScrollProgress();
    new SmoothAnchor();
    new CountUp();
    new RippleEffect();
    new AdvancedReveal();
    
    console.log('✅ Todos os componentes inicializados');
});

console.log('✅ VIGORRE ONE™ - Landing Ultra JS carregado com sucesso!');
