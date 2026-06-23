// ============================================
// VIGORRE ONE™ - SUPABASE CONFIGURAÇÃO
// Enterprise People Analytics Platform
// ============================================

// ============================================
// 1. SUAS CHAVES DO SUPABASE
// ============================================
const SUPABASE_URL = 'https://dfthdcnaqmqswidwgezj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bcLZGSu_wLmhcNOQmY3TLQ_yp3CHiZo';

// ============================================
// 2. INICIALIZAR CLIENTE SUPABASE
// ============================================
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// ============================================
// 3. FUNÇÕES UTILITÁRIAS
// ============================================
function generateId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return timestamp + randomPart;
}

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR');
}

function formatDateISO(date) {
  return new Date(date).toISOString();
}

// ============================================
// 4. FUNÇÕES DE BANCO DE DADOS
// ============================================

// SALVAR (com fallback offline)
async function saveToSupabase(table, data, localStorageKey) {
  try {
    // Adiciona timestamps se não tiver
    if (!data.created_at) data.created_at = formatDateISO(new Date());
    if (!data.updated_at) data.updated_at = formatDateISO(new Date());
    
    const { error } = await supabaseClient.from(table).upsert(data);
    
    if (error) throw error;
    
    console.log('✅ Salvou no Supabase:', table, data.id);
    return { success: true, online: true };
    
  } catch (e) {
    console.warn('⚠️ Offline - salvando no localStorage:', e.message);
    
    // Fallback localStorage
    const existing = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    const idx = existing.findIndex(item => item.id === data.id);
    
    if (idx > -1) {
      existing[idx] = data;
    } else {
      existing.push(data);
    }
    
    localStorage.setItem(localStorageKey, JSON.stringify(existing));
    return { success: true, online: false };
  }
}

// BUSCAR (com fallback offline)
async function loadFromSupabase(table, localStorageKey, filterKey, filterValue) {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .eq(filterKey, filterValue)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      console.log('✅ Carregou do Supabase:', table, data.id);
      return data;
    }
    
  } catch (e) {
    console.warn('⚠️ Offline - usando localStorage:', e.message);
  }
  
  // Fallback localStorage
  const items = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  return items.find(item => item[filterKey] === filterValue) || null;
}

// BUSCAR TODOS (com fallback offline)
async function loadAllFromSupabase(table, localStorageKey, filterKey, filterValue) {
  try {
    let query = supabaseClient.from(table).select('*');
    
    if (filterKey && filterValue) {
      query = query.eq(filterKey, filterValue);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log('✅ Carregou todos do Supabase:', table, data.length);
      return data;
    }
    
  } catch (e) {
    console.warn('⚠️ Offline - usando localStorage:', e.message);
  }
  
  // Fallback localStorage
  const items = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  if (filterKey && filterValue) {
    return items.filter(item => item[filterKey] === filterValue);
  }
  return items;
}

// DELETAR (com fallback offline)
async function deleteFromSupabase(table, id, localStorageKey) {
  try {
    const { error } = await supabaseClient.from(table).delete().eq('id', id);
    
    if (error) throw error;
    
    console.log('✅ Deletou do Supabase:', table, id);
    return { success: true, online: true };
    
  } catch (e) {
    console.warn('⚠️ Offline - deletando do localStorage:', e.message);
    
    // Fallback localStorage
    const items = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(localStorageKey, JSON.stringify(filtered));
    
    return { success: true, online: false };
  }
}

// ============================================
// 5. VERIFICAR CONEXÃO
// ============================================
async function checkConnection() {
  try {
    const { data, error } = await supabaseClient.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Conexão com Supabase OK');
    return true;
  } catch (e) {
    console.warn('⚠️ Sem conexão com Supabase:', e.message);
    return false;
  }
}

// ============================================
// 6. EXPORTAR PARA USO GLOBAL
// ============================================
window.VigorreDB = {
  supabase: supabaseClient,
  generateId: generateId,
  formatDate: formatDate,
  formatDateISO: formatDateISO,
  saveToSupabase: saveToSupabase,
  loadFromSupabase: loadFromSupabase,
  loadAllFromSupabase: loadAllFromSupabase,
  deleteFromSupabase: deleteFromSupabase,
  checkConnection: checkConnection,
  isOnline: navigator.onLine
};

// ============================================
// 7. MENSAGEM DE CONFIRMAÇÃO
// ============================================
console.log('🔗 VigorreDB conectado ao Supabase');
console.log('📊 URL:', SUPABASE_URL);
console.log('✅ Sistema pronto para uso online e offline');
console.log('📡 Status:', navigator.onLine ? '🟢 Online' : '🔴 Offline');

// Monitorar mudanças de conexão
window.addEventListener('online', () => {
  console.log('🟢 Conexão restaurada - sincronizando...');
  window.VigorreDB.isOnline = true;
});

window.addEventListener('offline', () => {
  console.log('🔴 Conexão perdida - modo offline ativado');
  window.VigorreDB.isOnline = false;
});
