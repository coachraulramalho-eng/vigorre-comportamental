/**
 * ============================================
 * VIGORRE ONE™ - AUTH GUARD
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.1.0
 * DATA: 15/07/2026
 * ============================================
 */

'use strict';

(function() {
    'use strict';

    console.log('🛡️ VIGORRE ONE™ - Auth Guard carregado');

    function getCurrentUser() {
        try {
            var userData = localStorage.getItem('vigorre_user');
            if (!userData) return null;
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }

    function redirectToLogin() {
        console.warn('⚠️ Acesso não autorizado - Redirecionando para login');
        window.location.href = '/login.html';
        return false;
    }

    // ============================================
    // GUARD - EMPRESA
    // ============================================
    window.requireCompany = function() {
        console.log('🔐 Verificando acesso: Empresa');
        
        if (typeof window.VigorreAuth !== 'undefined' && window.VigorreAuth.isAuthenticated()) {
            var user = window.VigorreAuth.getCurrentUser();
            if (user && (user.role === 'company' || user.role === 'admin' || user.role === 'master')) {
                console.log('✅ Acesso permitido para empresa:', user.name);
                return true;
            }
        }

        var user = getCurrentUser();
        if (user && (user.role === 'company' || user.role === 'admin' || user.role === 'master')) {
            console.log('✅ Acesso permitido para empresa (fallback):', user.name);
            return true;
        }

        alert('⚠️ Acesso restrito a empresas. Você será redirecionado para o login.');
        return redirectToLogin();
    };

    // ============================================
    // GUARD - CONSULTOR
    // ============================================
    window.requireConsultant = function() {
        console.log('🔐 Verificando acesso: Consultor');
        
        if (typeof window.VigorreAuth !== 'undefined' && window.VigorreAuth.isAuthenticated()) {
            var user = window.VigorreAuth.getCurrentUser();
            if (user && (user.role === 'consultant' || user.role === 'admin' || user.role === 'master')) {
                console.log('✅ Acesso permitido para consultor:', user.name);
                return true;
            }
        }

        var user = getCurrentUser();
        if (user && (user.role === 'consultant' || user.role === 'admin' || user.role === 'master')) {
            console.log('✅ Acesso permitido para consultor (fallback):', user.name);
            return true;
        }

        alert('⚠️ Acesso restrito a consultores. Você será redirecionado para o login.');
        return redirectToLogin();
    };

    // ============================================
    // GUARD - ADMIN
    // ============================================
    window.requireAdmin = function() {
        console.log('🔐 Verificando acesso: Admin');
        
        if (typeof window.VigorreAuth !== 'undefined' && window.VigorreAuth.isAuthenticated()) {
            var user = window.VigorreAuth.getCurrentUser();
            if (user && (user.role === 'admin' || user.role === 'master')) {
                console.log('✅ Acesso permitido para admin:', user.name);
                return true;
            }
        }

        var user = getCurrentUser();
        if (user && (user.role === 'admin' || user.role === 'master')) {
            console.log('✅ Acesso permitido para admin (fallback):', user.name);
            return true;
        }

        alert('⚠️ Acesso restrito a administradores. Você será redirecionado para o login.');
        return redirectToLogin();
    };

    // ============================================
    // GUARD - MASTER
    // ============================================
    window.requireMaster = function() {
        console.log('🔐 Verificando acesso: Master');
        
        if (typeof window.VigorreAuth !== 'undefined' && window.VigorreAuth.isAuthenticated()) {
            var user = window.VigorreAuth.getCurrentUser();
            if (user && user.role === 'master') {
                console.log('✅ Acesso permitido para master:', user.name);
                return true;
            }
        }

        var user = getCurrentUser();
        if (user && user.role === 'master') {
            console.log('✅ Acesso permitido para master (fallback):', user.name);
            return true;
        }

        alert('⚠️ Acesso restrito a master. Você será redirecionado para o login.');
        return redirectToLogin();
    };

    // ============================================
    // GUARD - RECRUTADOR
    // ============================================
    window.requireRecruiter = function() {
        console.log('🔐 Verificando acesso: Recrutador');
        
        if (typeof window.VigorreAuth !== 'undefined' && window.VigorreAuth.isAuthenticated()) {
            var user = window.VigorreAuth.getCurrentUser();
            if (user && (user.role === 'recruiter' || user.role === 'admin' || user.role === 'master')) {
                console.log('✅ Acesso permitido para recrutador:', user.name);
                return true;
            }
        }

        var user = getCurrentUser();
        if (user && (user.role === 'recruiter' || user.role === 'admin' || user.role === 'master')) {
            console.log('✅ Acesso permitido para recrutador (fallback):', user.name);
            return true;
        }

        alert('⚠️ Acesso restrito a recrutadores. Você será redirecionado para o login.');
        return redirectToLogin();
    };

    // ============================================
    // GUARD - PARTICIPANTE
    // ============================================
    window.requireParticipant = function() {
        console.log('🔐 Verificando acesso: Participante');
        
        if (typeof window.VigorreAuth !== 'undefined' && window.VigorreAuth.isAuthenticated()) {
            var user = window.VigorreAuth.getCurrentUser();
            if (user && (user.role === 'participant' || user.role === 'admin' || user.role === 'master')) {
                console.log('✅ Acesso permitido para participante:', user.name);
                return true;
            }
        }

        var user = getCurrentUser();
        if (user && (user.role === 'participant' || user.role === 'admin' || user.role === 'master')) {
            console.log('✅ Acesso permitido para participante (fallback):', user.name);
            return true;
        }

        alert('⚠️ Acesso restrito a participantes. Você será redirecionado para o login.');
        return redirectToLogin();
    };

    // ============================================
    // INICIALIZAÇÃO - REDIRECIONA SE NÃO AUTENTICADO
    // ============================================
    function initGuard() {
        if (typeof window.VigorreAuth !== 'undefined') {
            if (!window.VigorreAuth.isAuthenticated()) {
                var currentPath = window.location.pathname;
                var protectedPaths = ['/admin/', '/empresa/', '/consultor/', '/recrutador/', '/participante/'];
                
                var isProtected = protectedPaths.some(function(path) {
                    return currentPath.includes(path);
                });

                if (isProtected && !currentPath.includes('login.html')) {
                    console.warn('⚠️ Protegido - Redirecionando para login');
                    window.location.href = '/login.html';
                }
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGuard);
    } else {
        initGuard();
    }

    console.log('✅ VIGORRE ONE™ - Auth Guard inicializado com sucesso!');

})();
