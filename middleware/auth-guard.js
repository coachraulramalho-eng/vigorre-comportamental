/**
 * ============================================
 * VIGORRE ONE™ - AUTH GUARD SECURE
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 3.0.0 (SECURE)
 * DATA: 15/07/2026
 * ============================================
 */

'use strict';

(function() {
    'use strict';

    console.log('🛡️ VIGORRE ONE™ - Auth Guard SECURE carregado');

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
        // Limpar histórico para impedir volta
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, '/login.html');
        }
        window.location.replace('/login.html');
        return false;
    }

    function checkAuth(allowedRoles) {
        console.log('🔐 Verificando acesso para:', allowedRoles.join(', '));
        
        // Verificar via VigorreAuth
        if (typeof window.VigorreAuth !== 'undefined' && window.VigorreAuth.isAuthenticated()) {
            var user = window.VigorreAuth.getCurrentUser();
            if (user && allowedRoles.indexOf(user.role) !== -1) {
                console.log('✅ Acesso permitido para:', user.name);
                return true;
            }
        }

        // Fallback: verificar localStorage
        var user = getCurrentUser();
        if (user && allowedRoles.indexOf(user.role) !== -1) {
            console.log('✅ Acesso permitido (fallback):', user.name);
            return true;
        }

        // Verificar se está tentando acessar página protegida
        var currentPath = window.location.pathname;
        var protectedPaths = ['/admin/', '/empresa/', '/consultor/', '/recrutador/', '/participante/'];
        var isProtected = protectedPaths.some(function(path) {
            return currentPath.includes(path);
        });

        if (isProtected && !currentPath.includes('login.html')) {
            console.warn('⛔ Acesso negado para:', allowedRoles.join(', '));
            
            // Se estiver logado mas sem permissão
            if (user) {
                alert('⚠️ Acesso restrito. Você será redirecionado.');
                if (window.VigorreAuth) {
                    window.VigorreAuth.logout();
                } else {
                    redirectToLogin();
                }
                return false;
            }
            
            alert('⚠️ Você precisa estar logado para acessar esta página.');
            return redirectToLogin();
        }

        return false;
    }

    // ============================================
    // GUARDS POR PAPEL
    // ============================================
    window.requireCompany = function() {
        return checkAuth(['company', 'admin', 'master']);
    };

    window.requireConsultant = function() {
        return checkAuth(['consultant', 'admin', 'master']);
    };

    window.requireAdmin = function() {
        return checkAuth(['admin', 'master']);
    };

    window.requireMaster = function() {
        return checkAuth(['master']);
    };

    window.requireRecruiter = function() {
        return checkAuth(['recruiter', 'admin', 'master']);
    };

    window.requireParticipant = function() {
        return checkAuth(['participant', 'admin', 'master']);
    };

    // ============================================
    // GUARD GENÉRICO
    // ============================================
    window.requireAuth = function(roles) {
        if (!Array.isArray(roles)) {
            roles = [roles];
        }
        return checkAuth(roles);
    };

    console.log('✅ VIGORRE ONE™ - Auth Guard SECURE inicializado');

})();
