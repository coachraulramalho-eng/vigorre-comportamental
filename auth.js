/* ============================================================
   VIGORRE ONE™ - AUTH.JS
   - Lê sessão local
   - Compatível com menu-fix e auth-guard
   - Utilitários de saudação
============================================================ */
'use strict';

const ROLES = {
    ADMIN: 'admin',
    ORGANIZACAO: 'organizacao',
    PARTICIPANTE: 'participante'
};

const REDIRECTS = {
    admin: '/admin/dashboard.html',
    organizacao: '/organizacao/dashboard.html',
    participante: '/participante/dashboard.html'
};

const VigorreAuth = {
    _currentUser: null,
    _sessionTimeout: 30 * 60 * 1000,
    _consentimentoVersao: '3.0',
    _supabase: null,

    init() {
        try {
            if (typeof window.getSupabaseClient === 'function') {
                this._supabase = window.getSupabaseClient();
            }
        } catch (e) {
            this._supabase = null;
        }

        var sessionData = localStorage.getItem('vigorre_session');
        if (!sessionData) return null;

        try {
            var session = JSON.parse(sessionData);
            if (!session || !session.user) {
                this._clearSession();
                return null;
            }
            if (Date.now() - session.timestamp > this._sessionTimeout) {
                this._clearSession();
                return null;
            }
            this._currentUser = session.user;
            return this._currentUser;
        } catch (e) {
            this._clearSession();
            return null;
        }
    },

    _clearSession() {
        this._currentUser = null;
        localStorage.removeItem('vigorre_session');
    },

    getCurrentUser() {
        if (!this._currentUser) this.init();
        return this._currentUser;
    },

    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    hasRole(role) {
        var u = this.getCurrentUser();
        return !!(u && u.role === role);
    },

    isAdmin() { return this.hasRole(ROLES.ADMIN); },
    isOrganizacao() { return this.hasRole(ROLES.ORGANIZACAO); },
    isParticipante() { return this.hasRole(ROLES.PARTICIPANTE); },

    getParticipanteId() {
        var u = this.getCurrentUser();
        return (u && (u.participantId || u.id)) || null;
    },

    getFirstName() {
        var u = this.getCurrentUser();
        if (!u || !u.name) return '';
        return String(u.name).split(' ')[0];
    },

    getGreeting() {
        var h = new Date().getHours();
        if (h >= 5 && h < 12) return 'Bom dia';
        if (h >= 12 && h < 18) return 'Boa tarde';
        return 'Boa noite';
    },

    getRedirectPath() {
        var u = this.getCurrentUser();
        if (!u) return '/login.html';
        return REDIRECTS[u.role] || '/login.html';
    },

    logout(message) {
        this._clearSession();
        var url = '/login.html';
        if (message) url += '?message=' + encodeURIComponent(message);
        window.location.href = url;
    },

    verificarConsentimento(participanteId) {
        var consentimento = localStorage.getItem('consentimento_' + participanteId);
        if (!consentimento) return false;
        try {
            var data = JSON.parse(consentimento);
            return !!(data.consentido && data.versao === this._consentimentoVersao);
        } catch (e) {
            return false;
        }
    },

    registrarConsentimento(participanteId) {
        var data = {
            consentido: true,
            versao: this._consentimentoVersao,
            data: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        localStorage.setItem('consentimento_' + participanteId, JSON.stringify(data));
        return data;
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    requireAdmin() {
        if (!this.requireAuth()) return false;
        if (!this.isAdmin()) {
            window.location.href = this.getRedirectPath();
            return false;
        }
        return true;
    },

    requireOrganizacao() {
        if (!this.requireAuth()) return false;
        if (!this.isOrganizacao() && !this.isAdmin()) {
            window.location.href = this.getRedirectPath();
            return false;
        }
        return true;
    },

    requireParticipante() {
        if (!this.requireAuth()) return false;
        if (!this.isParticipante() && !this.isAdmin()) {
            window.location.href = this.getRedirectPath();
            return false;
        }
        return true;
    }
};

window.VigorreAuth = VigorreAuth;

document.addEventListener('DOMContentLoaded', function () {
    VigorreAuth.init();

    // Atualiza nome no menu fixo, se disponível
    if (VigorreAuth.isAuthenticated()) {
        var u = VigorreAuth.getCurrentUser();
        if (u && u.name && window.vgUpdateUserName) {
            window.vgUpdateUserName(u.name);
        }
    }
});
