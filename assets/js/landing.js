/**
 * ============================================
 * VIGORRE ONE™ - LANDING PAGE JS
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * FUNCIONALIDADES:
 * - Menu mobile
 * - Header scroll
 * - Animações de números
 * - Smooth scroll
 * - Contact form
 * - Scroll reveal (fallback)
 * ============================================
 */

'use strict';

// ============================================
// MENU MOBILE
// ============================================
function toggleMenu() {
    var nav = document.getElementById('nav');
    if (nav) {
        nav.classList.toggle('active');
    }
}

// Fechar menu ao clicar em um link
document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
        var nav = document.getElementById('nav');
        if (nav) {
            nav.classList.remove('active');
        }
    });
});

// ============================================
// HEADER SCROLL
// ============================================
var header = document.getElementById('header');
var lastScroll = 0;

window.addEventListener('scroll', function() {
    var currentScroll = window.pageYOffset;
    
    if (header) {
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    lastScroll = currentScroll;
});

// ============================================
// ANIMAÇÃO DOS NÚMEROS (STATS)
// ============================================
function animateNumbers() {
    var statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(function(el) {
        var target = parseInt(el.getAttribute('data-count'));
        var current = 0;
        var increment = Math.ceil(target / 60);
        var duration = 2000;
        var stepTime = Math.floor(duration / 60);
        
        var interval = setInterval(function() {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            el.textContent = current;
        }, stepTime);
    });
}

// ============================================
// SCROLL REVEAL (Fallback)
// ============================================
function revealOnScroll() {
    var elements = document.querySelectorAll(
        '.benefit-card, .test-card, .report-card, .profile-card, .pricing-card, .step'
    );
    
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1
        });
        
        elements.forEach(function(el) {
            observer.observe(el);
        });
    } else {
        // Fallback: revelar tudo imediatamente
        elements.forEach(function(el) {
            el.classList.add('revealed');
        });
    }
}

// ============================================
// CONTACT FORM
// ============================================
function handleContact(event) {
    event.preventDefault();
    
    var name = document.getElementById('contactName');
    var email = document.getElementById('contactEmail');
    
    if (name && email) {
        alert('✅ Obrigado ' + name.value + '! Entraremos em contato em breve no e-mail ' + email.value + '.');
        
        name.value = '';
        email.value = '';
        
        var company = document.getElementById('contactCompany');
        var message = document.getElementById('contactMessage');
        if (company) company.value = '';
        if (message) message.value = '';
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        
        var target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================
// PARALLAX DISCRETO
// ============================================
window.addEventListener('scroll', function() {
    var scrolled = window.pageYOffset;
    var hero = document.querySelector('.hero');
    
    if (hero && scrolled < window.innerHeight) {
        var rate = scrolled * 0.3;
        hero.style.backgroundPositionY = rate + 'px';
    }
});

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 VIGORRE ONE™ - Landing Page carregada');
    
    // Animar números após 1 segundo
    setTimeout(animateNumbers, 1000);
    
    // Scroll Reveal
    revealOnScroll();
});

console.log('✅ VIGORRE ONE™ - Landing Page International carregada com sucesso!');
