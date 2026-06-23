// ============================================
// VIGORRE ONE™ - GUARD DE RECRUTADOR
// ============================================

function initRecruiterGuard(redirectToLogin = true) {
  console.log('🛡️ Verificando acesso de recrutador...');
  
  const isAuth = window.VigorreAuth.isAuthenticated();
  if (!isAuth) {
    if (redirectToLogin) window.location.href = '/login.html';
    return false;
  }
  
  const user = window.VigorreAuth.getCurrentUser();
  const isRecruiter = user && (user.role === 'recruiter' || user.role === 'admin' || user.role === 'master');
  
  if (!isRecruiter) {
    alert('⚠️ Acesso restrito a recrutadores.');
    window.VigorreAuth.logout();
    return false;
  }
  
  // Configura escopo do recrutador
  window.recruiterScope = {
    userId: user.id,
    companyIds: user.companyIds || [],
    credits: user.credits || { DISC: 0, IE: 0, Valores: 0 }
  };
  
  localStorage.setItem('vigorre_scope', JSON.stringify(window.recruiterScope));
  
  console.log('✅ Recrutador autenticado:', user.name);
  return true;
}

// ============================================
// FILTRO POR ESCOPO
// ============================================
function filterByRecruiterScope(items, companyIdField = 'companyId') {
  const scope = JSON.parse(localStorage.getItem('vigorre_scope') || '{}');
  const companyIds = scope.companyIds || [];
  
  if (companyIds.length === 0) return items;
  
  return items.filter(item => {
    const id = item[companyIdField] || item.company_id;
    return companyIds.includes(id);
  });
}

// ============================================
// CONSUMIR CRÉDITO
// ============================================
function consumeRecruiterCredit(testType) {
  const scope = JSON.parse(localStorage.getItem('vigorre_scope') || '{}');
  const credits = scope.credits || {};
  
  if (!credits[testType] || credits[testType] <= 0) {
    console.warn('⚠️ Créditos insuficientes para:', testType);
    return false;
  }
  
  credits[testType]--;
  scope.credits = credits;
  localStorage.setItem('vigorre_scope', JSON.stringify(scope));
  
  const user = window.VigorreAuth.getCurrentUser();
  if (user) {
    user.credits = credits;
    localStorage.setItem('vigorre_current_user', JSON.stringify(user));
  }
  
  console.log(`✅ Crédito consumido: ${testType}, restam: ${credits[testType]}`);
  return true;
}

window.initRecruiterGuard = initRecruiterGuard;
window.filterByRecruiterScope = filterByRecruiterScope;
window.consumeRecruiterCredit = consumeRecruiterCredit;

console.log('🛡️ Guard de recrutador inicializado');
