/* ============================================================
   VIGORRE ONE™ — AUTH GUARD
   Protege páginas por perfil.
============================================================ */
(function () {
    'use strict';

    if (!window.VigorreAuth) {
        window.location.href = '/login.html';
        return;
    }

    var user = window.VigorreAuth.getCurrentUser();

    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    var path = window.location.pathname.toLowerCase();
    var allowed = false;

    if (path.includes('/admin/')) {
        allowed = window.VigorreAuth.isAdmin();
    } else if (path.includes('/organizacao/')) {
        allowed = window.VigorreAuth.isOrganizacao() || window.VigorreAuth.isAdmin();
    } else if (path.includes('/participante/')) {
        allowed = window.VigorreAuth.isParticipante() || window.VigorreAuth.isAdmin();
    } else {
        allowed = true;
    }

    if (!allowed) {
        window.location.href = window.VigorreAuth.getRedirectPath();
    }
})();
