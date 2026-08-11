/* ============================================================
   VIGORRE — MENU FIXO CENTRAL (menu-fix.js)
   Fonte única dos menus. Detecta o perfil, injeta a sidebar
   fixa com subtítulos e marca a página ativa automaticamente.
   Uso: incluir menu-fix.css + menu-fix.js em toda página.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. CONFIGURAÇÃO DOS MENUS (links reais) ---------- */
  const MENUS = {

    /* ============ MASTER ADMIN ============ */
    master: {
      badge: '🔑 Master Admin',
      groups: [
        { subtitle: '📊 Dashboard', items: [
          { icon: '📊', label: 'Dashboard', href: '/admin/dashboard.html' }
        ]},
        { subtitle: '🏢 Gestão', items: [
          { icon: '🏢', label: 'Empresas', href: '/admin/empresas/index.html' },
          { icon: '🧑‍💼', label: 'Recrutadores', href: '/admin/recrutadores/index.html' },
          { icon: '👥', label: 'Participantes', href: '/admin/participantes/index.html' }
        ]},
        { subtitle: '💰 Central Financeira', items: [
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
        ]},
        { subtitle: '📅 Agenda', items: [
          { icon: '📅', label: 'Calendário', href: '/admin/agenda/calendario.html' }
        ]},
        { subtitle: '💾 Sistema', items: [
          { icon: '💾', label: 'Backup Completo', href: '/admin/backup/backup-completo.html' }
        ]}
      ]
    },

    /* ============ ORGANIZAÇÃO / RECRUTADOR ============ */
    organizacao: {
      badge: '🏢 Organização',
      groups: [
        { subtitle: '📊 Dashboard', items: [
          { icon: '📊', label: 'Dashboard', href: '/organizacao/dashboard.html' }
        ]},
        { subtitle: '🏢 Gestão', items: [
          { icon: '👥', label: 'Participantes', href: '/organizacao/participantes/index.html' },
          { icon: '💼', label: 'Vagas', href: '/organizacao/vagas/index.html' }
        ]},
        { subtitle: '📝 Avaliações', items: [
          { icon: '📝', label: 'Testes', href: '/organizacao/testes/index.html' },
          { icon: '📊', label: 'Relatórios', href: '/organizacao/relatorios/index.html' },
          { icon: '📄', label: 'Laudos', href: '/organizacao/laudos/index.html' }
        ]},
        { subtitle: '💰 Central Financeira', items: [
          { icon: '💳', label: 'Créditos', href: '/organizacao/creditos/index.html' },
          { icon: '💰', label: 'Financeiro', href: '/organizacao/financeiro/index.html' },
          { icon: '🧾', label: 'Extratos', href: '/organizacao/financeiro/extratos.html' }
        ]},
        { subtitle: '⚙️ Sistema', items: [
          { icon: '⚙️', label: 'Configurações', href: '/organizacao/configuracoes/index.html' }
        ]}
      ]
    },

    /* ============ PARTICIPANTE ============ */
    participante: {
      badge: '👤 Participante',
      groups: [
        { subtitle: '📊 Meu Painel', items: [
          { icon: '📊', label: 'Dashboard', href: '/participante/dashboard.html' }
        ]},
        { subtitle: '📝 Minhas Avaliações', items: [
          { icon: '📝', label: 'Meus Testes', href: '/participante/meus-testes.html' },
          { icon: '📊', label: 'Meus Relatórios', href: '/participante/meus-relatorios.html' },
          { icon: '📄', label: 'Meu Laudo', href: '/participante/meu-laudo.html' },
          { icon: '📈', label: 'Minha Evolução', href: '/participante/minha-evolucao.html' }
        ]},
        { subtitle: '💰 Meu Financeiro', items: [
          { icon: '💳', label: 'Meus Créditos', href: '/participante/meus-creditos.html' },
          { icon: '🛒', label: 'Minhas Compras', href: '/participante/minhas-compras.html' }
        ]}
      ]
    }
  };

  /* ---------- 2. DETECTAR PERFIL ---------- */
  function detectProfile() {
    const attr = (document.body.dataset.profile || document.documentElement.dataset.profile || '').toLowerCase();
    if (MENUS[attr]) return attr;
    const p = window.location.pathname;
    if (p.includes('/admin/')) return 'master';
    if (p.includes('/organizacao/')) return 'organizacao';
    if (p.includes('/participante/')) return 'participante';
    return 'organizacao';
  }

  /* ---------- 3. VERIFICAR LINK ATIVO ---------- */
  function isActive(href) {
    const norm = s => s.replace(/\/index\.html$/, '/').replace(/\/+$/, '/');
    const cur = norm(window.location.pathname);
    const target = norm(new URL(href, window.location.origin).pathname);
    return cur === target;
  }

  /* ---------- 4. CONSTRUIR E INJETAR A SIDEBAR ---------- */
  function build() {
    const profile = detectProfile();
    const cfg = MENUS[profile];

    // remove menus antigos para evitar duplicidade
    document.querySelectorAll('.vg-sidebar, .vg-overlay, .sidebar, ul.nav').forEach(el => el.remove());

    const aside = document.createElement('aside');
    aside.className = 'vg-sidebar';
    aside.id = 'vgSidebar';

    let html = '';
    html += `<div class="vg-brand">
               <img src="/assets/images/logo-vigorre.png" alt="Vigorre" onerror="this.style.display='none'">
               <div class="vg-brand-name">Vigorre<span>.</span></div>
             </div>`;
    html += `<div class="vg-profile-badge">${cfg.badge}</div>`;
    html += `<nav class="vg-nav">`;
    cfg.groups.forEach(g => {
      html += `<div class="vg-subtitle">${g.subtitle}</div>`;
      g.items.forEach(it => {
        const act = isActive(it.href) ? ' active' : '';
        html += `<a class="vg-link${act}" href="${it.href}">
                   <span class="vg-icon">${it.icon}</span><span>${it.label}</span>
                 </a>`;
      });
    });
    html += `</nav>`;
    html += `<div class="vg-sidebar-footer">
               <span>Vigorre™ v1.0</span>
               <a href="/login.html">Sair ↩</a>
             </div>`;

    aside.innerHTML = html;

    const overlay = document.createElement('div');
    overlay.className = 'vg-overlay';
    overlay.id = 'vgOverlay';

    document.body.classList.add('vg-has-sidebar');
    document.body.prepend(overlay);
    document.body.prepend(aside);

    // envolver conteúdo existente (se ainda não estiver)
    const main = document.querySelector('main, .vg-content, .content, .main');
    if (main && !main.classList.contains('vg-content')) main.classList.add('vg-content');

    bindMobile();
  }

  /* ---------- 5. MOBILE (hambúrguer) ---------- */
  function bindMobile() {
    let topbar = document.querySelector('.vg-topbar');
    if (!topbar) {
      topbar = document.createElement('div');
      topbar.className = 'vg-topbar';
      topbar.innerHTML = `<button class="vg-burger" id="vgBurger" aria-label="Abrir menu">☰</button>
                          <span class="vg-title">Vigorre</span>`;
      const content = document.querySelector('.vg-content');
      if (content) content.prepend(topbar);
      else document.body.appendChild(topbar);
    }
    const aside = document.getElementById('vgSidebar');
    const overlay = document.getElementById('vgOverlay');
    const open = () => { aside.classList.add('open'); overlay.classList.add('show'); };
    const close = () => { aside.classList.remove('open'); overlay.classList.remove('show'); };
    const burger = document.getElementById('vgBurger');
    if (burger) burger.addEventListener('click', open);
    overlay.addEventListener('click', close);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
