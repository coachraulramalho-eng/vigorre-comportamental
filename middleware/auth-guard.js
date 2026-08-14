/* ============================================================
   VIGORRE ONE™ — AUTH GUARD
   Proteção simples de rotas por perfil.
============================================================ */
(function () {
    'use strict';

    const path = window.location.pathname;

    const publicPaths = [
        '/',
        '/login.html',
        '/index.html',
        '/consentimento.html',
        '/politica-privacidade.html',
        '/termos-uso.html',
        '/contato.html',
        '/error.htm',
        '/assets/',
        '/robots.txt',
        '/sitemap.xml'
    ];

    const isPublic = publicPaths.some(p => path.includes(p) || path === p);

    if (isPublic) {
        return;
    }

    if (!window.VigorreAuth) {
        console.warn('Auth não carregado. Redirecionando para login.');
        window.location.replace('/login.html');
        return;
    }

    if (!window.VigorreAuth.isAuthenticated()) {
        window.location.replace('/login.html');
        return;
    }

    const user = window.VigorreAuth.getCurrentUser();

    if (!user || !user.role) {
        window.location.replace('/login.html');
        return;
    }

    const role = user.role;

    function allowed() {
        // Admin master pode acessar tudo
        if (role === 'admin') {
            return true;
        }

        if (path.includes('/admin/')) {
            return role === 'admin';
        }

        if (path.includes('/organizacao/')) {
            return role === 'organizacao';
        }

        if (path.includes('/participante/')) {
            return role === 'participante';
        }

        return true;
    }

    if (!allowed()) {
        const redirect = window.VigorreAuth.getRedirectPath();
        window.location.replace(redirect || '/login.html');
    }
})();
