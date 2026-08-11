/* ============================================ */
/* MENU FIXO - VIGORRE ONE™                     */
/* ============================================ */

// ============================================
// SIDEBAR TOGGLE (MOBILE)
// ============================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

// ============================================
// DESTACAR ITEM ATIVO NO MENU
// ============================================
function highlightActiveMenuItem() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.sidebar .nav a');
    
    menuLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href)) {
            link.classList.add('active');
        }
    });
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    if (confirm('Deseja realmente sair?')) {
        // Limpar sessão
        localStorage.removeItem('vigorre_session');
        localStorage.removeItem('vigorre_role');
        localStorage.removeItem('vigorre_user');
        
        // Redirecionar para login
        window.location.href = '/login.html';
    }
}

// ============================================
// CARREGAR DADOS DO USUÁRIO
// ============================================
function loadUserInfo() {
    const userNameElement = document.getElementById('userName');
    
    try {
        // Tentar buscar do Supabase
        if (window.VigorreAuth && window.VigorreAuth.isAuthenticated()) {
            const user = window.VigorreAuth.getCurrentUser();
            if (user && user.name) {
                userNameElement.textContent = user.name;
                return;
            }
        }
        
        // Fallback: buscar do localStorage
        const session = localStorage.getItem('vigorre_session');
        if (session) {
            try {
                const user = JSON.parse(session);
                if (user && user.name) {
                    userNameElement.textContent = user.name;
                    return;
                }
            } catch (e) {}
        }
        
        // Fallback final
        userNameElement.textContent = 'Usuário';
        
    } catch (error) {
        console.warn('⚠️ Erro ao carregar informações do usuário:', error);
        userNameElement.textContent = 'Usuário';
    }
}

// ============================================
// INICIAR MENU
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Carregar informações do usuário
    loadUserInfo();
    
    // Destacar item ativo no menu
    highlightActiveMenuItem();
    
    // Fechar sidebar ao clicar em um link (mobile)
    const menuLinks = document.querySelectorAll('.sidebar .nav a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                toggleSidebar();
            }
        });
    });
    
    console.log('✅ Menu Fixo carregado com sucesso!');
});

// ============================================
// EXPORTAR FUNÇÕES (para uso global)
// ============================================
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.loadUserInfo = loadUserInfo;
