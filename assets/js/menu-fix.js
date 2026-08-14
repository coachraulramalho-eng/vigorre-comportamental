/* ============================================================
   VIGORRE ONE™ — MENU FIXO CENTRAL (menu-fix.js)
   - Detecta perfil
   - Injeta sidebar
   - Marca item ativo
   - Toggle mobile
   - Processo Seletivo no menu master
   - Saudação por horário (Bom dia / Boa tarde / Boa noite)
============================================================ */
(function () {
    'use strict';

    /* ============================================
       MENUS POR PERFIL
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
                        { icon: '💼', label: 'Vagas', href: '/organizacao/vagas/index.html' }
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
    ============================================ */
    const MENU_CSS = `
        .vg-sidebar {
            position: fixed; top: 0; left: 0; width: 260px; height: 100vh;
            background: #0A2540; color: #fff; padding: 24px 20px;
            display: flex; flex-direction: column; z-index: 1000;
            transition: transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
            overflow-y: auto; font-family: 'Inter', -apple-system, sans-serif;
        }
        .vg-sidebar::-webkit-scrollbar { width: 4px; }
        .vg-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .vg-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .vg-logo .vg-logo-name { font-family: 'Poppins', sans-serif; font-size: 0.95rem; font-weight: 800; color: #fff; }
        .vg-logo .vg-logo-name .tm { font-size: 0.4rem; vertical-align: super; color: #06B6D4; }
        .vg-logo .vg-logo-sub { display: block; font-size: 0.5rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.12em; }
        .vg-user-info { padding: 14px 12px; background: rgba(255,255,255,0.04); border-radius: 10px; margin-bottom: 20px; }
        .vg-user-info .vg-user-name { font-weight: 600; font-size: 0.9rem; color: #fff; }
        .vg-user-info .vg-user-badge { display: inline-block; margin-top: 6px; padding: 3px 10px; border-radius: 9999px; font-size: 0.6rem; font-weight: 600; text-transform: uppercase; }
        .vg-nav { list-style: none; flex: 1; margin: 0; padding: 0; }
        .vg-nav-subtitle { font-size: 0.55rem; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.12em; padding: 16px 14px 6px; margin-top: 4px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .vg-nav-subtitle:first-child { padding-top: 4px; }
        .vg-nav a { display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin: 2px 0; border-radius: 10px; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: all 0.3s ease; border-left: 3px solid transparent; }
        .vg-nav a:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .vg-nav a.active { background: rgba(217,119,6,0.12); color: #fff; border-left-color: #D97706; }
        .vg-nav a .vg-icon { font-size: 1.1rem; width: 24px; text-align: center; flex-shrink: 0; }
        .vg-logout { margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
        .vg-logout a { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.85rem; }
        .vg-logout a:hover { background: rgba(239,68,68,0.12); color: #F87171; }
        .vg-mobile-toggle { display: none; position: fixed; top: 16px; left: 16px; z-index: 1100; width: 44px; height: 44px; background: #0A2540; color: #fff; border: none; border-radius: 10px; font-size: 1.3rem; cursor: pointer; align-items: center; justify-content: center; }
        .vg-mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(10,37,64,0.4); z-index: 999; }
        .vg-mobile-overlay.active { display: block; }
        body.vg-has-menu .vg-content, body.vg-has-menu main.vg-content { margin-left: 260px; transition: margin-left 0.3s ease; }
        @media (max-width: 992px) {
            .vg-sidebar { transform: translateX(-100%); width: 280px; }
            .vg-sidebar.open { transform: translateX(0); }
            .vg-mobile-toggle { display: flex; }
            body.vg-has-menu .vg-content, body.vg-has-menu main.vg-content { margin-left: 0; }
        }
    `;

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
       NOME DO USUÁRIO
    ============================================ */
    function getUserName() {
        try {
            if (window.VigorreAuth && typeof window.VigorreAuth.getCurrentUser === 'function') {
                const user = window.VigorreAuth.getCurrentUser();
                if (user && user.name) return user.name;
            }
        } catch (e) { }
        return 'Usuário';
    }

    /* ============================================
       SAUDAÇÃO POR HORÁRIO
    ============================================ */
    function getGreeting() {
        const h = new Date().getHours();
        if (h >= 5 && h < 12) return 'Bom dia';
        if (h >= 12 && h < 18) return 'Boa tarde';
        return 'Boa noite';
    }

    function getFirstName() {
        const name = getUserName();
        if (!name || name === 'Usuário') return '';
        return String(name).split(' ')[0];
    }

    function applyGreeting(profile) {
        const greeting = getGreeting();
        const firstName = getFirstName();
        const menu = MENUS[profile] || {};
        const profileName = menu.profileName || '';

        // Título
        const titleEls = document.querySelectorAll('[data-vg-greeting-title]');
        titleEls.forEach(function (el) {
            el.textContent = firstName ? (greeting + ', ' + firstName + '!') : (greeting + '!');
        });

        // Subtítulo
        const subEls = document.querySelectorAll('[data-vg-greeting-subtitle]');
        subEls.forEach(function (el) {
            const desc = el.getAttribute('data-page-description') || '';
            const base = 'Seja bem-vindo(a) ao seu painel ' + profileName + '.';
            el.textContent = desc ? (base + ' ' + desc) : base;
        });

        // Compatibilidade legado (dashboard participante)
        const saudacaoNome = document.getElementById('saudacaoNome');
        if (saudacaoNome && firstName) saudacaoNome.textContent = firstName;

        const saudacaoText = document.getElementById('saudacaoText');
        if (saudacaoText) {
            saudacaoText.innerHTML = '👋 ' + greeting +
                (firstName ? ', <span id="saudacaoNome">' + firstName + '</span>' : '') + '!';
        }

        const saudacaoMensagem = document.getElementById('saudacaoMensagem');
        if (saudacaoMensagem) {
            saudacaoMensagem.textContent = 'Seja bem-vindo(a) à sua jornada de autoconhecimento.';
        }
    }

    /* ============================================
       ITEM ATIVO
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
       UTILITÁRIO
    ============================================ */
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    /* ============================================
       CONSTRUIR SIDEBAR
    ============================================ */
    function buildSidebar(profile) {
        const menu = MENUS[profile];
        const userName = getUserName();
        let html = '';

        html += `
            <a href="${menu.logoUrl}" class="vg-logo">
                <span>
                    <span class="vg-logo-name">VIGORRE ONE<span class="tm">™</span></span>
                    <span class="vg-logo-sub">People Intelligence Enterprise</span>
                </span>
            </a>
        `;

        html += `
            <div class="vg-user-info">
                <div class="vg-user-name" id="vgUserName">${userName}</div>
                <span class="vg-user-badge" style="background:${hexToRgba(menu.badgeColor, 0.15)};color:${menu.badgeColor};">${menu.badge}</span>
            </div>
        `;

        html += '<ul class="vg-nav">';
        menu.sections.forEach(function (section) {
            html += '<li class="vg-nav-subtitle">' + section.subtitle + '</li>';
            section.items.forEach(function (item) {
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
       INJETAR SIDEBAR
    ============================================ */
    function injectSidebar(profile) {
        const existing = document.getElementById('vgSidebar');
        if (existing) existing.remove();
        const existingToggle = document.getElementById('vgMobileToggle');
        if (existingToggle) existingToggle.remove();
        const existingOverlay = document.getElementById('vgMobileOverlay');
        if (existingOverlay) existingOverlay.remove();

        const sidebar = document.createElement('aside');
        sidebar.className = 'vg-sidebar';
        sidebar.id = 'vgSidebar';
        sidebar.innerHTML = buildSidebar(profile);
        document.body.prepend(sidebar);

        const toggle = document.createElement('button');
        toggle.className = 'vg-mobile-toggle';
        toggle.id = 'vgMobileToggle';
        toggle.setAttribute('aria-label', 'Abrir menu');
        toggle.innerHTML = '☰';
        document.body.appendChild(toggle);

        const overlay = document.createElement('div');
        overlay.className = 'vg-mobile-overlay';
        overlay.id = 'vgMobileOverlay';
        document.body.appendChild(overlay);

        document.body.classList.add('vg-has-menu');

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
       LOGOUT
    ============================================ */
    window.vgLogout = function () {
        if (confirm('Deseja realmente sair?')) {
            try {
                if (window.VigorreAuth && typeof window.VigorreAuth.logout === 'function') {
                    window.VigorreAuth.logout();
                    return;
                }
            } catch (e) { }
            sessionStorage.clear();
            localStorage.removeItem('vigorre_session');
            window.location.href = '/login.html';
        }
    };

    /* ============================================
       ATUALIZAR NOME / SAUDAÇÃO
    ============================================ */
    window.vgUpdateUserName = function (name) {
        const el = document.getElementById('vgUserName');
        if (el && name) el.textContent = name;
        if (window.vgRefreshMenu) window.vgRefreshMenu();
    };

    window.vgRefreshMenu = function () {
        const profile = detectProfile();
        applyGreeting(profile);
    };

    /* ============================================
       INIT
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
