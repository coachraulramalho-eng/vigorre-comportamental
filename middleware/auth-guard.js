/**
 * ============================================
 * VIGORRE ONE™ - AUTH GUARD
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 15/07/2026
 * 
 * FUNCIONALIDADES:
 * - Proteção de rotas por papel
 * - Proteção de rotas por nível
 * - Proteção de rotas por permissão
 * - Redirecionamento automático
 * - Auditoria de acessos
 * ============================================
 */

'use strict';

// ============================================
// LOG DE ACESSO
// ============================================
function logAccessAttempt(user, route, allowed) {
    try {
        var logs = JSON.parse(localStorage.getItem('vigorre_audit_logs') || '[]');
        logs.push({
            id: 'G' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase(),
            userId: user ? user.id : 'anonymous',
            user: user ? user.name : 'Anônimo',
            action: 'Acesso à rota',
            description: 'Tentativa de acesso a: ' + route + ' - ' + (allowed ? '✅ Permitido' : '⛔ Negado'),
            severity: allowed ? 'baixo' : 'alto',
            ip: '127.0.0.1',
            date: new Date().toLocaleString('pt-BR'),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('vigorre_audit_logs', JSON.stringify(logs));
    } catch (error) {
        console.warn('⚠️ Erro ao registrar acesso:', error);
    }
}

// ============================================
// GUARD - ADMIN
// ============================================
function requireAdmin() {
    var route = window.location.pathname;

    if (!window.VigorreAuth) {
        console.error('❌ Auth não carregado');
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (!window.VigorreAuth.isAuthenticated()) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    var user = window.VigorreAuth.getCurrentUser();
    if (!user) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (user.role !== 'admin' && user.role !== 'master') {
        logAccessAttempt(user, route, false);
        alert('⚠️ Acesso restrito a administradores.');
        window.VigorreAuth.logout();
        return false;
    }

    logAccessAttempt(user, route, true);
    return true;
}

// ============================================
// GUARD - RECRUTADOR
// ============================================
function requireRecruiter() {
    var route = window.location.pathname;

    if (!window.VigorreAuth) {
        console.error('❌ Auth não carregado');
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (!window.VigorreAuth.isAuthenticated()) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    var user = window.VigorreAuth.getCurrentUser();
    if (!user) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (user.role !== 'recruiter' && user.role !== 'admin' && user.role !== 'master') {
        logAccessAttempt(user, route, false);
        alert('⚠️ Acesso restrito a recrutadores.');
        window.VigorreAuth.logout();
        return false;
    }

    logAccessAttempt(user, route, true);
    return true;
}

// ============================================
// GUARD - PARTICIPANTE
// ============================================
function requireParticipant() {
    var route = window.location.pathname;

    if (!window.VigorreAuth) {
        console.error('❌ Auth não carregado');
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (!window.VigorreAuth.isAuthenticated()) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    var user = window.VigorreAuth.getCurrentUser();
    if (!user) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (user.role !== 'participant') {
        logAccessAttempt(user, route, false);
        alert('⚠️ Acesso restrito a participantes.');
        window.VigorreAuth.logout();
        return false;
    }

    logAccessAttempt(user, route, true);
    return true;
}

// ============================================
// GUARD - EMPRESA
// ============================================
function requireCompany() {
    var route = window.location.pathname;

    if (!window.VigorreAuth) {
        console.error('❌ Auth não carregado');
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (!window.VigorreAuth.isAuthenticated()) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    var user = window.VigorreAuth.getCurrentUser();
    if (!user) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (user.role !== 'company' && user.role !== 'admin' && user.role !== 'master') {
        logAccessAttempt(user, route, false);
        alert('⚠️ Acesso restrito a empresas.');
        window.VigorreAuth.logout();
        return false;
    }

    logAccessAttempt(user, route, true);
    return true;
}

// ============================================
// GUARD - CONSULTOR
// ============================================
function requireConsultant() {
    var route = window.location.pathname;

    if (!window.VigorreAuth) {
        console.error('❌ Auth não carregado');
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (!window.VigorreAuth.isAuthenticated()) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    var user = window.VigorreAuth.getCurrentUser();
    if (!user) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (user.role !== 'consultant' && user.role !== 'admin' && user.role !== 'master') {
        logAccessAttempt(user, route, false);
        alert('⚠️ Acesso restrito a consultores.');
        window.VigorreAuth.logout();
        return false;
    }

    logAccessAttempt(user, route, true);
    return true;
}

// ============================================
// GUARD - MESTRE
// ============================================
function requireMaster() {
    var route = window.location.pathname;

    if (!window.VigorreAuth) {
        console.error('❌ Auth não carregado');
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (!window.VigorreAuth.isAuthenticated()) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    var user = window.VigorreAuth.getCurrentUser();
    if (!user) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (user.role !== 'master') {
        logAccessAttempt(user, route, false);
        alert('⚠️ Acesso restrito a Master Admin.');
        window.VigorreAuth.logout();
        return false;
    }

    logAccessAttempt(user, route, true);
    return true;
}

// ============================================
// GUARD - QUALQUER USUÁRIO AUTENTICADO
// ============================================
function requireAuth() {
    var route = window.location.pathname;

    if (!window.VigorreAuth) {
        console.error('❌ Auth não carregado');
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    if (!window.VigorreAuth.isAuthenticated()) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    var user = window.VigorreAuth.getCurrentUser();
    if (!user) {
        logAccessAttempt(null, route, false);
        window.location.href = '/login.html';
        return false;
    }

    logAccessAttempt(user, route, true);
    return true;
}

// ============================================
// REDIRECIONAR POR PAPEL
// ============================================
function redirectByRole() {
    var user = window.VigorreAuth.getCurrentUser();
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    var redirect = window.VigorreAuth.getRedirectUrl(user.role);
    if (redirect && window.location.pathname !== redirect) {
        window.location.href = redirect;
    }
}

// ============================================
// EXPORTAR
// ============================================
window.requireAdmin = requireAdmin;
window.requireRecruiter = requireRecruiter;
window.requireParticipant = requireParticipant;
window.requireCompany = requireCompany;
window.requireConsultant = requireConsultant;
window.requireMaster = requireMaster;
window.requireAuth = requireAuth;
window.redirectByRole = redirectByRole;

console.log('✅ VIGORRE ONE™ - Auth Guards carregados com sucesso!');
console.log('🛡️ Guards disponíveis: Admin, Recruiter, Participant, Company, Consultant, Master, Auth');
