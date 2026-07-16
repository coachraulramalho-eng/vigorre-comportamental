// ============================================
// VIGORRE ONE™ - AUTH GUARD (COM LGPD E SEGURANÇA)
// ============================================

'use strict';

(function() {
    // Verificar se auth.js foi carregado
    if (typeof window.VigorreAuth === 'undefined') {
        console.error('❌ auth.js não foi carregado.');
        window.location.href = '/login.html?error=system';
        return;
    }

    // ============================================
    // PÁGINAS PÚBLICAS (não precisam de autenticação)
    // ============================================
    const PUBLIC_PAGES = [
        '/', '/index.html', '/login.html',
        '/assets/', '/favicon.ico', '/robots.txt',
        '/sitemap.xml', '/manifest.json'
    ];

    function isPublicPage(path) {
        for (const page of PUBLIC_PAGES) {
            if (path === page || path.startsWith(page)) {
                return true;
            }
        }
        return false;
    }

    // ============================================
    // VERIFICAR PERMISSÕES POR ROTA
    // ============================================
    function checkRoutePermissions() {
        const path = window.location.pathname;
        const user = window.VigorreAuth.getCurrentUser();

        // ============================================
        // PÁGINAS PÚBLICAS
        // ============================================
        if (isPublicPage(path)) {
            // Se estiver logado e tentar acessar login, redirecionar para dashboard
            if (user && (path === '/login.html' || path === '/')) {
                const redirect = {
                    'admin': '/admin/dashboard.html',
                    'organizacao': '/organizacao/dashboard.html',
                    'participante': '/participante/dashboard.html'
                }[user.role] || '/';
                window.location.href = redirect;
                return false;
            }
            return true;
        }

        // ============================================
        // VERIFICAR AUTENTICAÇÃO
        // ============================================
        if (!user) {
            // Salvar URL que estava tentando acessar
            localStorage.setItem('vigorre_redirect_after_login', path);
            window.location.href = '/login.html?redirect=' + encodeURIComponent(path);
            return false;
        }

        // ============================================
        // VERIFICAR SESSÃO (LGPD)
        // ============================================
        if (!window.VigorreAuth.checkSession()) {
            return false;
        }

        const role = user.role;

        // ============================================
        // ADMIN: acesso total
        // ============================================
        if (role === 'admin') {
            // Admin pode acessar tudo
            return true;
        }

        // ============================================
        // ORGANIZAÇÃO: só acessa /organizacao/*
        // ============================================
        if (role === 'organizacao') {
            if (path.startsWith('/organizacao/')) {
                return true;
            }
            // Não tem permissão, redirecionar para dashboard
            window.location.href = '/organizacao/dashboard.html';
            return false;
        }

        // ============================================
        // PARTICIPANTE: só acessa /participante/*
        // ============================================
        if (role === 'participante') {
            if (path.startsWith('/participante/')) {
                return true;
            }
            window.location.href = '/participante/dashboard.html';
            return false;
        }

        // ============================================
        // PERFIL DESCONHECIDO
        // ============================================
        window.VigorreAuth.logout('Perfil de acesso inválido.');
        return false;
    }

    // ============================================
    // EXECUTAR VERIFICAÇÃO
    // ============================================
    const hasAccess = checkRoutePermissions();

    // ============================================
    // BLOQUEAR SETA DO NAVEGADOR
    // ============================================
    if (hasAccess) {
        // Adicionar estado ao histórico para bloquear voltar
        history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function() {
            if (window.VigorreAuth && window.VigorreAuth.isAuthenticated()) {
                // Recarregar a página atual em vez de voltar
                window.location.reload();
            } else {
                window.location.href = '/login.html';
            }
        });
    }

    // ============================================
    // LGPD - COOKIE DE CONSENTIMENTO
    // ============================================
    function checkLgpdConsent() {
        const consent = localStorage.getItem('vigorre_lgpd_consent');
        if (!consent) {
            // Mostrar banner LGPD
            const banner = document.createElement('div');
            banner.id = 'lgpd-banner';
            banner.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #0A2540;
                color: white;
                padding: 16px 24px;
                z-index: 9999;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 16px;
                font-family: 'Inter', sans-serif;
                font-size: 0.85rem;
                box-shadow: 0 -4px 24px rgba(0,0,0,0.2);
            `;
            banner.innerHTML = `
                <div style="flex:1;min-width:200px;">
                    🔒 <strong>LGPD</strong> - Utilizamos cookies para melhorar sua experiência. 
                    Ao continuar, você concorda com nossa 
                    <a href="#" style="color:#D97706;text-decoration:underline;">Política de Privacidade</a>.
                </div>
                <div style="display:flex;gap:12px;">
                    <button onclick="document.getElementById('lgpd-banner').style.display='none';localStorage.setItem('vigorre_lgpd_consent','true');" 
                            style="padding:8px 24px;background:#D97706;border:none;border-radius:8px;color:white;font-weight:600;cursor:pointer;">
                        Aceitar
                    </button>
                    <button onclick="window.VigorreAuth.logout('Consentimento LGPD recusado.')" 
                            style="padding:8px 24px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:rgba(255,255,255,0.6);cursor:pointer;">
                        Recusar
                    </button>
                </div>
            `;
            document.body.appendChild(banner);
        }
    }

    // Verificar consentimento LGPD (apenas se estiver logado)
    if (window.VigorreAuth.isAuthenticated()) {
        checkLgpdConsent();
    }

    console.log('✅ Auth Guard com LGPD executado com sucesso.');
})();
