export const PLANOS = {
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
  laudo_1: {
    id: 'laudo_1',
    tipo: 'laudo',
    nome: '1 Laudo VIGOR®',
    descricao: 'Laudo completo 80-100 páginas',
    preco: 99.90,
    quantidade: 1,
    cupom: 'LAUDO1'
  }
}

export function getPlano(id) {
  return PLANOS[id] || null
}
