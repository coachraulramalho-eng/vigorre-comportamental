// ============================================
// VIGORRE ONE™ - GUARD DE AUTENTICAÇÃO
// ============================================

function initAuthGuard(redirectToLogin = true) {
  console.log('🛡️ Verificando autenticação...');
  
  const isAuth = window.VigorreAuth.isAuthenticated();
  
  if (!isAuth) {
    console.warn('⚠️ Usuário não autenticado');
    
    if (redirectToLogin) {
      const currentPath = window.location.pathname;
      localStorage.setItem('vigorre_redirect', currentPath);
      window.location.href = '/login.html';
    }
    
    return false;
  }
  
  window.VigorreAuth.refreshSession();
  console.log('✅ Autenticação validada');
  return true;
}

// Inicializa automaticamente
if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
  setTimeout(() => {
    initAuthGuard(true);
  }, 100);
}

window.initAuthGuard = initAuthGuard;
