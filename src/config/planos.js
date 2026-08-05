// ============================================
// PLANOS E PREÇOS DA VIGORRE ONE™
// ============================================

export const PLANOS = {
  // ===== CRÉDITOS =====
  credito_1: {
    id: 'credito_1',
    tipo: 'credito',
    nome: '1 Crédito',
    descricao: '1 relatório comportamental completo',
    preco: 35.00,
    quantidade: 1,
    cupom: 'RELATO01'
  },
  
  credito_10: {
    id: 'credito_10',
    tipo: 'credito',
    nome: '10 Créditos',
    descricao: '10 relatórios comportamentais',
    preco: 199.90,
    quantidade: 10,
    cupom: 'RELATO10'
  },
  
  credito_100: {
    id: 'credito_100',
    tipo: 'credito',
    nome: '100 Créditos',
    descricao: '100 relatórios comportamentais',
    preco: 1700.00,
    quantidade: 100,
    cupom: 'RELATO100'
  },

  // ===== LAUDOS =====
  laudo_1: {
    id: 'laudo_1',
    tipo: 'laudo',
    nome: '1 Laudo VIGOR®',
    descricao: 'Laudo completo 80-100 páginas',
    preco: 99.90,
    quantidade: 1,
    cupom: 'LAUDO1'
  },
  
  laudo_3: {
    id: 'laudo_3',
    tipo: 'laudo',
    nome: '3 Laudos VIGOR®',
    descricao: '3 laudos completos 80-100 páginas',
    preco: 240.00,
    quantidade: 3,
    cupom: 'LAUDO3'
  },
  
  laudo_10: {
    id: 'laudo_10',
    tipo: 'laudo',
    nome: '10 Laudos VIGOR®',
    descricao: '10 laudos completos 80-100 páginas',
    preco: 700.00,
    quantidade: 10,
    cupom: 'LAUDO10'
  }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

export function getPlano(id) {
  return PLANOS[id] || null
}

export function listarPlanos() {
  return Object.values(PLANOS)
}

export function listarPlanosPorTipo(tipo) {
  return Object.values(PLANOS).filter(p => p.tipo === tipo)
}
