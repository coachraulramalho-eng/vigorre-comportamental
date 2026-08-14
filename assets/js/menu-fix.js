/* ============================================================
   VIGORRE ONE™ — MENU FIXO CENTRAL (menu-fix.js)
   Versão corrigida:
   - Menu único
   - Processo Seletivo no Admin
   - Saudação por horário
   - Atualiza nome do usuário
   - Compatível com Admin, Organização e Participante
============================================================ */
(function () {
    'use strict';

    /* ============================================
       CONFIGURAÇÃO DOS MENUS POR PERFIL
    ============================================ */
    const MENUS = {

        /* ---------- MASTER ADMIN ---------- */
        master: {
            profileName: 'Master Admin',
            badge: '👑 Master Admin',
            badgeColor: '#D97706',
            dashboardUrl: '/admin/dashboard.html',
            logoUrl: '/admin/dashboard.html',
            sections: [
                {
                    subtitle: '📊 DASHBOARD',
                    items: [
                        { icon: '📊', label: 'Dashboard', href: '/admin/dashboard.html' }
                    ]
                },
                {
                    subtitle: '🏢 GESTÃO',
                    items: [
                        { icon: '🏢', label: 'Empresas & Recrutadores', href: '/admin/empresas/index.html' },
                        { icon: '👥', label: 'Participantes', href: '/admin/participantes/index.html' }
                    ]
                },
                {
                    subtitle: '📋 PROCESSO SELETIVO',
                    items: [
                        { icon: '📋', label: 'Avaliações Rápidas', href: '/admin/processoseletivo/index.html' },
                        { icon: '➕', label: 'Nova Avaliação', href: '/admin/processoseletivo/nova-avaliacao.html' },
                        { icon: '👤', label: 'Candidatos', href: '/admin/processoseletivo/candidatos/index.html' },
                        { icon: '📄', label: 'Relatórios', href: '/admin/processoseletivo/relatorios/index.html' },
                        { icon: '📋', label: 'Laudos', href: '/admin/processoseletivo/laudos/index.html' }
                    ]
                },
                {
                    subtitle: '💰 CENTRAL FINANCEIRA',
                    items: [
                        { icon: '💰', label: 'Financeiro Global', href: '/admin/financeiro/index.html' },
                        { icon: '👛', label: 'Carteiras', href: '/admin/financeiro/carteiras.html' },
                        { icon: '💳', label: 'Créditos', href: '/admin/financeiro/creditos.html' },
                        { icon: '🧾', label: 'Extratos', href: '/admin/financeiro/extratos.html' },
                        { icon: '🔁', label: 'Assinaturas', href: '/admin/financeiro/assinaturas.html' },
                        { icon: '↩️', label: 'Reembolsos', href: '/admin/financeiro/reembolsos.html' },
                        { icon: '🏷️', label: 'Preços', href: '/admin/financeiro/precos.html' },
                        { icon: '🎟️', label: 'Cupons', href: '/admin/financeiro/cupons.html' },
                        { icon: '⚙️', label: 'Config. Financeiras', href: '/admin/financeiro/configuracoes.html' },
                        { icon: '🔍', label: 'Auditoria', href: '/admin/financeiro/auditoria.html' }
                    ]
                },
                {
                    subtitle: '📅 AGENDA',
                    items: [
                        { icon: '📅', label: 'Calendário', href: '/admin/agenda/calendario.html' }
                    ]
                },
                {
                    subtitle: '💾 SISTEMA',
                    items: [
                        { icon: '💾', label: 'Backup Completo', href: '/admin/backup/backup-completo.html' }
                    ]
                }
            ]
        },

        /* ---------- ORGANIZAÇÃO ---------- */
        organizacao: {
            profileName: 'Organização',
            badge: '🏢 Organização',
            badgeColor: '#1D4ED8',
            dashboardUrl: '/organizacao/dashboard.html',
            logoUrl: '/organizacao/dashboard.html',
            sections: [
                {
                    subtitle: '📊 DASHBOARD',
                    items: [
                        { icon: '📊', label: 'Dashboard', href: '/organizacao/dashboard.html' }
                    ]
                },
                {
                    subtitle: '🏢 GESTÃO',
                    items: [
                        { icon: '👥', label: 'Participantes', href: '/organizacao/participantes/index.html' },
                        { icon: '💼', label: 'Vagas Internas', href: '/organizacao/vagas/index.html' }
                    ]
                },
                {
                    subtitle: '📝 AVALIAÇÕES',
                    items: [
                        { icon: '📝', label: 'Testes', href: '/organizacao/testes/index.html' },
                        { icon: '📊', label: 'Relatórios', href: '/organizacao/relatorios/index.html' },
                        { icon: '📄', label: 'Laudos', href: '/organizacao/laudos/index.html' }
                    ]
                },
                {
                    subtitle: '💰 CENTRAL FINANCEIRA',
                    items: [
                        { icon: '💳', label: 'Créditos', href: '/organizacao/creditos/index.html' },
                        { icon: '💰', label: 'Financeiro', href: '/organizacao/financeiro/index.html' },
                        { icon: '🧾', label: 'Extratos', href: '/organizacao/financeiro/extratos.html' }
                    ]
                },
                {
                    subtitle: '⚙️ SISTEMA',
                    items: [
                        { icon: '⚙️', label: 'Configurações', href: '/organizacao/configuracoes/index.html' }
                    ]
                }
            ]
        },

        /* ---------- PARTICIPANTE ---------- */
        participante: {
            profileName: 'Participante',
            badge: '👤 Participante',
            badgeColor: '#7C3AED',
            dashboardUrl: '/participante/dashboard.html',
            logoUrl: '/participante/dashboard.html',
            sections: [
                {
                    subtitle: '📊 MEU PAINEL',
                    items: [
                        { icon: '📊', label: 'Dashboard', href: '/participante/dashboard.html' }
                    ]
                },
                {
                    subtitle: '📝 MINHAS AVALIAÇÕES',
                    items: [
                        { icon: '📝', label: 'Meus Testes', href: '/participante/meus-testes.html' },
                        { icon: '📊', label: 'Meus Relatórios', href: '/participante/meus-relatorios.html' },
                        { icon: '📄', label: 'Meu Laudo', href: '/participante/meu-laudo.html' },
                        { icon: '📈', label: 'Minha Evolução', href: '/participante/minha-evolucao.html' }
                    ]
                },
                {
                    subtitle: '💰 MEU FINANCEIRO',
                    items: [
                        { icon: '💳', label: 'Meus Créditos', href: '/participante/meus-creditos.html' },
                        { icon: '🛒', label: 'Minhas Compras', href: '/participante/minhas-compras.html' }
                    ]
                }
            ]
        }
    };

    /* ============================================
       ESTILOS MÍNIMOS INJETADOS
       Obs.: o ideal é usar também /assets/css/menu-fix.css
    ============================================ */
    const MENU_CSS = `
        .vg-sidebar{position:fixed;top:0;left:0;width:260px;height:100vh;background:linear-gradient(180deg,#0A2540,#071A2E);color:#fff;padding:24px 20px;display:flex;flex-direction:column;z-index:1000;transition:transform .3s cubic-bezier(.25,.46,.45,.94);overflow-y:auto;overflow-x:hidden;box-shadow:2px 0 20px rgba(10,37,64,.15);font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
        .vg-sidebar::-webkit-scrollbar{width:4px;}
        .vg-sidebar::-webkit-scrollbar-track{background:transparent;}
        .vg-sidebar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px;}
        .vg-logo{display:flex;align-items:center;gap:12px;text-decoration:none;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.06);transition:opacity .3s ease;}
        .vg-logo:hover{opacity:.85;}
        .vg-logo .vg-logo-name{font-family:'Poppins',sans-serif;font-size:.95rem;font-weight:800;color:#fff;letter-spacing:-.5px;display:block;}
        .vg-logo .vg-logo-name .tm{font-size:.4rem;vertical-align:super;color:#06B6D4;}
        .vg-logo .vg-logo-sub{display:block;font-size:.5rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.12em;margin-top:2px;}
        .vg-user-info{padding:14px 12px;background:rgba(255,255,255,.04);border-radius:10px;margin-bottom:20px;border:1px solid rgba(255,255,255,.04);}
        .vg-user-info .vg-user-name{font-weight:600;font-size:.9rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .vg-user-info .vg-user-badge{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:9999px;font-size:.6rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;}
        .vg-nav{list-style:none;flex:1;margin:0;padding:0;}
        .vg-nav-subtitle{font-size:.55rem;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.12em;padding:16px 14px 6px;margin-top:4px;border-bottom:1px solid rgba(255,255,255,.04);user-select:none;}
        .vg-nav-subtitle:first-child{padding-top:4px;}
        .vg-nav a{display:flex;align-items:center;gap:12px;padding:10px 14px;margin:2px 0;border-radius:10px;color:rgba(255,255,255,.6);text-decoration:none;font-size:.85rem;font-weight:500;transition:all .3s ease;border-left:3px solid transparent;position:relative;}
        .vg-nav a:hover{background:rgba(255,255,255,.06);color:#fff;}
        .vg-nav a:focus-visible{outline:2px solid #06B6D4;outline-offset:2px;}
        .vg-nav a.active{background:rgba(217,119,6,.12);color:#fff;border-left-color:#D97706;}
        .vg-nav a .vg-icon{font-size:1.1rem;width:24px;text-align:center;flex-shrink:0;}
        .vg-logout{margin-top:auto;padding-top:16px;border-top:1px solid rgba(255,255,255,.06);}
        .vg-logout a{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;color:rgba(255,255,255,.4);text-decoration:none;font-size:.85rem;font-weight:500;transition:all .3s ease;}
        .vg-logout a:hover{background:rgba(239,68,68,.12);color:#F87171;}
        .vg-logout a .vg-icon{font-size:1.1rem;width:24px;text-align:center;}
        .vg-mobile-toggle{display:none;position:fixed;top:16px;left:16px;z-index:1100;width:44px;height:44px;background:#0A2540;color:#fff;border:none;border-radius:10px;font-size:1.3rem;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);align-items:center;justify-content:center;transition:all .3s ease;}
        .vg-mobile-toggle:hover{background:#071A2E;transform:scale(1.05);}
        .vg-mobile-toggle:active{transform:scale(.95);}
        .vg-mobile-overlay{display:none;position:fixed;inset:0;background:rgba(10,37,64,.4);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:999;}
        .vg-mobile-overlay.active{display:block;animation:vgFadeIn .3s ease;}
        @keyframes vgFadeIn{from{opacity:0;}to{opacity:1;}}
        body.vg-has-menu .vg-content,
        body.vg-has-menu main.vg-content{margin-left:260px;transition:margin-left .3s ease;}
        @media(max-width:992px){
            .vg-sidebar{transform:translateX(-100%);width:280px;}
            .vg-sidebar.open{transform:translateX(0);box-shadow:4px 0 40px rgba(0,0,0,.3);}
            .vg-mobile-toggle{display:flex;}
            body.vg-has-menu .vg-content,
            body.vg-has-menu main.vg-content{margin-left:0;}
        }
        @media(max-width:480px){
            .vg-sidebar{width:85vw;max-width:280px;padding:20px 16px;}
            .vg-logo .vg-logo-name{font-size:.9rem;}
            .vg-nav a{padding:9px 12px;font-size:.82rem;}
        }
        @media print{
            .vg-sidebar,
            .vg-mobile-toggle,
            .vg-mobile-overlay{display:none !important;}
            body.vg-has-menu .vg-content,
            body.vg-has-menu main.vg-content{margin-left:0 !important;}
        }
        @media(prefers-reduced-motion:reduce){
            .vg-sidebar,
            .vg-nav a,
            .vg-logo,
            .vg-logout a,
            .vg-mobile-toggle,
            body.vg-has-menu .vg-content,
            body.vg-has-menu main.vg-content{transition:none !important;animation:none !important;}
        }
    `;

    /* ============================================
       INJETAR ESTILOS NO <head>
    ============================================ */
    function injectStyles() {
        if (document.getElementById('vg-menu-styles')) return;

        const style = document.createElement('style');
        style.id = 'vg-menu-styles';
        style.textContent = MENU_CSS;
        document.head.appendChild(style);
    }

    /* ============================================
       DETECTAR PERFIL
    ============================================ */
    function detectProfile() {
        const bodyProfile = (document.body.getAttribute('data-profile') || '').toLowerCase();

        if (MENUS[bodyProfile]) return bodyProfile;

        const path = window.location.pathname.toLowerCase();

        if (path.includes('/admin/')) return 'master';
        if (path.includes('/organizacao/')) return 'organizacao';
        if (path.includes('/participante/')) return 'participante';

        return 'master';
    }

    /* ============================================
       OBTER NOME DO USUÁRIO
    ============================================ */
    function getUserName() {
        try {
            if (window.VigorreAuth && typeof window.VigorreAuth.getCurrentUser === 'function') {
                const user = window.VigorreAuth.getCurrentUser();

                if (user && user.name) {
                    return user.name;
                }
            }
        } catch (e) {
            // ignora
        }

        return 'Usuário';
    }

    /* ============================================
       SAUDAÇÃO POR HORÁRIO
    ============================================ */
    function getGreeting() {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) return 'Bom dia';
        if (hour >= 12 && hour < 18) return 'Boa tarde';

        return 'Boa noite';
    }

    function getFirstName(name) {
        if (!name) return 'Usuário';

        return String(name).split(' ')[0];
    }

    function applyGreeting(profile) {
        const fullName = getUserName();
        const firstName = getFirstName(fullName);
        const greeting = getGreeting();
        const menu = MENUS[profile] || {};
        const profileName = menu.profileName || '';

        // Atualiza elementos com atributos oficiais
        document.querySelectorAll('[data-vg-greeting-title]').forEach(el => {
            el.textContent = `${greeting}, ${firstName}!`;
        });

        document.querySelectorAll('[data-vg-greeting-subtitle]').forEach(el => {
            const description = el.dataset.pageDescription || '';
            const welcome = profile === 'participante'
                ? 'Seja bem-vindo(a) à sua jornada de autoconhecimento.'
                : `Seja bem-vindo(a) ao seu painel ${profileName}.`;

            el.textContent = `${welcome} ${description}`.trim();
        });

        // Compatibilidade com o dashboard participante atual
        const saudacaoNome = document.getElementById('saudacaoNome');
        if (saudacaoNome) {
            saudacaoNome.textContent = firstName;
        }

        const saudacaoText = document.getElementById('saudacaoText');
        if (saudacaoText) {
            saudacaoText.innerHTML = `👋 ${greeting}, <span id="saudacaoNome">${firstName}</span>!`;
        }

        const saudacaoMensagem = document.getElementById('saudacaoMensagem');
        if (saudacaoMensagem) {
            saudacaoMensagem.textContent = 'Seja bem-vindo(a) à sua jornada de autoconhecimento.';
        }

        // Fallback automático para páginas que ainda não têm atributos de saudação
        const hasLegacyParticipant = document.getElementById('saudacaoText');

        if (!hasLegacyParticipant) {
            const fallbackTitle = document.querySelector('.main-header h1:not([data-vg-greeting-title])');
            const fallbackSubtitle = document.querySelector('.main-header .subtitle:not([data-vg-greeting-subtitle])');

            if (fallbackTitle) {
                if (!fallbackTitle.dataset.vgOriginal) {
                    fallbackTitle.dataset.vgOriginal = fallbackTitle.textContent.trim();
                }

                fallbackTitle.textContent = `${greeting}, ${firstName}!`;
            }

            if (fallbackSubtitle) {
                if (!fallbackSubtitle.dataset.vgOriginal) {
                    fallbackSubtitle.dataset.vgOriginal = fallbackSubtitle.textContent.trim();
                }

                const originalTitle = fallbackTitle && fallbackTitle.dataset.vgOriginal
                    ? fallbackTitle.dataset.vgOriginal
                    : '';

                const welcome = profile === 'participante'
                    ? 'Seja bem-vindo(a) à sua jornada de autoconhecimento.'
                    : `Seja bem-vindo(a) ao seu painel ${profileName}.`;

                fallbackSubtitle.textContent = `${originalTitle ? originalTitle + ' — ' : ''}${welcome} ${fallbackSubtitle.dataset.vgOriginal}`.trim();
            }
        }
    }

    /* ============================================
       VERIFICAR SE UM LINK ESTÁ ATIVO
    ============================================ */
    function isActive(href) {
        const current = window.location.pathname.toLowerCase();
        const target = href.toLowerCase();

        if (current === target) return true;

        const currentNorm = current.replace(/\/index\.html$/, '/');
        const targetNorm = target.replace(/\/index\.html$/, '/');

        return currentNorm === targetNorm;
    }

    /* ============================================
       UTILITÁRIO: hex para rgba
    ============================================ */
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return `rgba(${r},${g},${b},${alpha})`;
    }

    /* ============================================
       CONSTRUIR A SIDEBAR
    ============================================ */
    function buildSidebar(profile) {
        const menu = MENUS[profile];
        const userName = getUserName();

        let html = '';

        // Logo
        html += `
            <a href="${menu.logoUrl}" class="vg-logo">
                <span>
                    <span class="vg-logo-name">VIGORRE ONE<span class="tm">™</span></span>
                    <span class="vg-logo-sub">People Intelligence Enterprise</span>
                </span>
            </a>
        `;

        // Info do usuário
        html += `
            <div class="vg-user-info">
                <div class="vg-user-name" id="vgUserName">${userName}</div>
                <span class="vg-user-badge" style="background:${hexToRgba(menu.badgeColor, 0.15)};color:${menu.badgeColor};">${menu.badge}</span>
            </div>
        `;

        // Navegação
        html += '<ul class="vg-nav">';

        menu.sections.forEach(section => {
            html += `<li class="vg-nav-subtitle">${section.subtitle}</li>`;

            section.items.forEach(item => {
                const activeClass = isActive(item.href) ? ' active' : '';

                html += `
                    <li>
                        <a href="${item.href}" class="${activeClass}">
                            <span class="vg-icon">${item.icon}</span> ${item.label}
                        </a>
                    </li>
                `;
            });
        });

        html += '</ul>';

        // Logout
        html += `
            <div class="vg-logout">
                <a href="#" onclick="vgLogout(); return false;">
                    <span class="vg-icon">🚪</span> Sair
                </a>
            </div>
        `;

        return html;
    }

    /* ============================================
       INJETAR A SIDEBAR NO DOM
    ============================================ */
    function injectSidebar(profile) {
        // Remove sidebar existente
        const existing = document.getElementById('vgSidebar');
        if (existing) existing.remove();

        const existingToggle = document.getElementById('vgMobileToggle');
        if (existingToggle) existingToggle.remove();

        const existingOverlay = document.getElementById('vgMobileOverlay');
        if (existingOverlay) existingOverlay.remove();

        // Cria sidebar
        const sidebar = document.createElement('aside');
        sidebar.className = 'vg-sidebar';
        sidebar.id = 'vgSidebar';
        sidebar.innerHTML = buildSidebar(profile);
        document.body.prepend(sidebar);

        // Botão mobile
        const toggle = document.createElement('button');
        toggle.className = 'vg-mobile-toggle';
        toggle.id = 'vgMobileToggle';
        toggle.setAttribute('aria-label', 'Abrir menu');
        toggle.innerHTML = '☰';
        document.body.appendChild(toggle);

        // Overlay mobile
        const overlay = document.createElement('div');
        overlay.className = 'vg-mobile-overlay';
        overlay.id = 'vgMobileOverlay';
        document.body.appendChild(overlay);

        // Marca body
        document.body.classList.add('vg-has-menu');

        // Eventos
        toggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', function () {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    /* ============================================
       LOGOUT GLOBAL
    ============================================ */
    window.vgLogout = function () {
        if (confirm('Deseja realmente sair?')) {
            try {
                if (window.VigorreAuth && typeof window.VigorreAuth.logout === 'function') {
                    window.VigorreAuth.logout();
                    return;
                }
            } catch (e) {
                // ignora
            }

            sessionStorage.clear();
            localStorage.removeItem('vigorre_session');
            window.location.href = '/login.html';
        }
    };

    /* ============================================
       ATUALIZAR NOME DO USUÁRIO
    ============================================ */
    window.vgUpdateUserName = function (name) {
        const el = document.getElementById('vgUserName');

        if (el && name) {
            el.textContent = name;
        }
    };

    /* ============================================
       ATUALIZAR MENU / SAUDAÇÃO
    ============================================ */
    window.vgRefreshMenu = function () {
        const profile = detectProfile();
        applyGreeting(profile);
    };

    /* ============================================
       INICIALIZAÇÃO
    ============================================ */
    function init() {
        injectStyles();

        const profile = detectProfile();

        injectSidebar(profile);
        applyGreeting(profile);

        console.log('🧭 VIGORRE Menu carregado | Perfil:', profile);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
