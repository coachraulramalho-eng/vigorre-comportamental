/**
 * ============================================
 * VIGORRE ONE™ - RECRUITER GUARD
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Proteção específica para recrutadores
 * - Verificação de empresa vinculada
 * - Verificação de permissões de recrutador
 * ============================================
 */

'use strict';

// ============================================
// RECRUITER GUARD
// ============================================
function requireRecruiterGuard() {
    var route = window.location.pathname;

    // Verificar autenticação
    if (!window.VigorreAuth) {
        console.error('❌ Auth não carregado');
        window.location.href = '/login.html';
        return false;
    }

    if (!window.VigorreAuth.isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }

    var user = window.VigorreAuth.getCurrentUser();
    if (!user) {
        window.location.href = '/login.html';
        return false;
    }

    // Verificar papel
    if (user.role !== 'recruiter' && user.role !== 'admin' && user.role !== 'master') {
        alert('⚠️ Acesso restrito a recrutadores.');
        window.VigorreAuth.logout();
        return false;
    }

    // Verificar se recrutador tem empresa vinculada
    if (user.role === 'recruiter' && !user.companyId) {
        alert('⚠️ Recrutador não vinculado a nenhuma empresa.');
        window.VigorreAuth.logout();
        return false;
    }

    // Verificar se tem permissão para acessar a rota
    var recruiterRoutes = [
        '/recrutador/dashboard.html',
        '/recrutador/participantes/',
        '/recrutador/creditos/',
        '/recrutador/relatorios/',
        '/recrutador/agenda/'
    ];

    var isRecruiterRoute = false;
    for (var i = 0; i < recruiterRoutes.length; i++) {
        if (route.indexOf(recruiterRoutes[i]) !== -1) {
            isRecruiterRoute = true;
            break;
        }
    }

    // Se for rota de recrutador, verificar permissão
    if (isRecruiterRoute) {
        // Verificar se tem créditos suficientes (opcional)
        var credits = user.credits || {};
        var hasCredits = (credits.DISC || 0) > 0 || (credits.IE || 0) > 0 || (credits.VALORES || 0) > 0;

        // Se não tiver créditos, mostrar aviso (mas não bloquear)
        if (!hasCredits) {
            console.warn('⚠️ Recrutador sem créditos disponíveis');
        }
    }

    // Registrar acesso
    try {
        var logs = JSON.parse(localStorage.getItem('vigorre_audit_logs') || '[]');
        logs.push({
            id: 'R' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase(),
            userId: user.id,
            user: user.name,
            action: 'Acesso Recrutador',
            description: 'Recrutador acessou: ' + route,
            severity: 'baixo',
            ip: '127.0.0.1',
            date: new Date().toLocaleString('pt-BR'),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('vigorre_audit_logs', JSON.stringify(logs));
    } catch (error) {
        console.warn('⚠️ Erro ao registrar acesso:', error);
    }

    return true;
}

// ============================================
// VERIFICAR ACESSO A PARTICIPANTE
// ============================================
function canAccessParticipant(participantId) {
    try {
        var user = window.VigorreAuth.getCurrentUser();
        if (!user) return false;

        // Admin e Master têm acesso total
        if (user.role === 'admin' || user.role === 'master') {
            return true;
        }

        // Recrutador só tem acesso a participantes da sua empresa
        if (user.role === 'recruiter') {
            var participants = JSON.parse(localStorage.getItem('vigorre_participants') || '[]');
            for (var i = 0; i < participants.length; i++) {
                if (participants[i].id === participantId) {
                    return participants[i].companyId === user.companyId;
                }
            }
        }

        return false;

    } catch (error) {
        console.error('❌ Erro ao verificar acesso ao participante:', error);
        return false;
    }
}

// ============================================
// VERIFICAR CRÉDITOS DO RECRUTADOR
// ============================================
function getRecruiterCredits() {
    try {
        var user = window.VigorreAuth.getCurrentUser();
        if (!user) return null;

        // Buscar créditos do recrutador
        var credits = user.credits || {};
        var total = 0;
        var types = ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE', 'COMPETENCIAS', 'LIDERANCA', 'POTENCIAL', 'FITCULTURAL'];

        for (var i = 0; i < types.length; i++) {
            total += credits[types[i]] || 0;
        }

        return {
            total: total,
            details: credits
        };

    } catch (error) {
        console.error('❌ Erro ao buscar créditos do recrutador:', error);
        return null;
    }
}

// ============================================
// EXPORTAR
// ============================================
window.requireRecruiterGuard = requireRecruiterGuard;
window.canAccessParticipant = canAccessParticipant;
window.getRecruiterCredits = getRecruiterCredits;

console.log('✅ VIGORRE ONE™ - Recruiter Guard carregado com sucesso!');
