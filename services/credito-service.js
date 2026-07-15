/**
 * ============================================
 * VIGORRE ONE™ - CREDITO SERVICE
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 15/07/2026
 * 
 * FUNCIONALIDADES:
 * - Listar todos os tipos de crédito (9 tipos)
 * - CRUD de créditos
 * - Transferência entre carteiras
 * - Histórico de transações
 * - Relatórios de créditos
 * - Validação de créditos
 * - Preços por tipo
 * ============================================
 */

'use strict';

const CREDITO_CONFIG = {
    tipos: [
        { id: 'DISC', nome: 'DISC', icone: '📊', cor: '#EF4444', descricao: 'Avaliação comportamental DISC' },
        { id: 'IE', nome: 'Inteligência Emocional', icone: '🧠', cor: '#8B5CF6', descricao: 'Avaliação de IE' },
        { id: 'VALORES', nome: 'Valores Pessoais', icone: '💎', cor: '#10B981', descricao: 'Avaliação de valores' },
        { id: 'SWOT', nome: 'SWOT', icone: '📋', cor: '#F59E0B', descricao: 'Análise SWOT pessoal' },
        { id: 'BIGFIVE', nome: 'Big Five', icone: '🧬', cor: '#3B82F6', descricao: 'Big Five personalidade' },
        { id: 'COMPETENCIAS', nome: 'Competências', icone: '🎯', cor: '#EC4899', descricao: 'Avaliação de competências' },
        { id: 'LIDERANCA', nome: 'Liderança', icone: '👑', cor: '#D97706', descricao: 'Avaliação de liderança' },
        { id: 'POTENCIAL', nome: 'Potencial', icone: '🚀', cor: '#14B8A6', descricao: 'Avaliação de potencial' },
        { id: 'FITCULTURAL', nome: 'Fit Cultural', icone: '🌈', cor: '#7C3AED', descricao: 'Avaliação de fit cultural' }
    ],
    precos: {
        DISC: 29.90,
        IE: 39.90,
        VALORES: 34.90,
        SWOT: 19.90,
        BIGFIVE: 49.90,
        COMPETENCIAS: 44.90,
        LIDERANCA: 59.90,
        POTENCIAL: 54.90,
        FITCULTURAL: 39.90
    },
    storageKey: 'vigorre_credit_transactions'
};

class CreditoService {
    
    constructor() {
        this.config = CREDITO_CONFIG;
        this._cache = new Map();
    }

    listarTipos() { return { success: true, data: this.config.tipos, total: this.config.tipos.length }; }

    obterTipo(id) {
        var tipo = this.config.tipos.find(function(t) { return t.id === id.toUpperCase(); });
        return tipo ? { success: true, data: tipo } : { success: false, error: 'Tipo não encontrado' };
    }

    obterPreco(id) {
        var preco = this.config.precos[id.toUpperCase()];
        return preco !== undefined ? { success: true, data: preco } : { success: false, error: 'Preço não encontrado' };
    }

    validar(id, quantidade) {
        try {
            if (!id) return { success: false, error: 'Tipo de crédito é obrigatório' };
            if (!quantidade || quantidade <= 0) { return { success: false, error: 'Quantidade deve ser maior que zero' }; }
            var tiposValidos = this.config.tipos.map(function(t) { return t.id; });
            var tipoUpper = id.toUpperCase();
            if (tiposValidos.indexOf(tipoUpper) === -1) { return { success: false, error: 'Tipo de crédito inválido' }; }
            if (!Number.isInteger(quantidade)) { return { success: false, error: 'Quantidade deve ser um número inteiro' }; }
            return { success: true };
        } catch (error) { console.error('❌ Erro ao validar crédito:', error); return { success: false, error: error
                .message }; }
    }

    adicionar(walletId, tipo, quantidade, descricao) {
        try {
            var validacao = this.validar(tipo, quantidade);
            if (!validacao.success) return validacao;
            if (window.carteiraService) { return window.carteiraService.adicionarCredito(walletId, tipo, quantidade,
                    descricao); }
            return { success: false, error: 'Carteira Service não disponível' };
        } catch (error) { console.error('❌ Erro ao adicionar créditos:', error); return { success: false, error: error
                .message }; }
    }

    remover(walletId, tipo, quantidade, descricao) {
        try {
            var validacao = this.validar(tipo, quantidade);
            if (!validacao.success) return validacao;
            if (window.carteiraService) { return window.carteiraService.removerCredito(walletId, tipo, quantidade,
                    descricao); }
            return { success: false, error: 'Carteira Service não disponível' };
        } catch (error) { console.error('❌ Erro ao remover créditos:', error); return { success: false, error: error
                .message }; }
    }

    transferir(origemId, destinoId, tipo, quantidade, descricao) {
        try {
            if (!origemId || !destinoId) { return { success: false, error: 'Carteiras de origem e destino são obrigatórias' }; }
            if (origemId === destinoId) { return { success: false, error: 'Origem e destino não podem ser iguais' }; }
            var validacao = this.validar(tipo, quantidade);
            if (!validacao.success) return validacao;
            var removerResult = this.remover(origemId, tipo, quantidade, descricao || 'Transferência para ' + destinoId);
            if (!removerResult.success) return removerResult;
            var adicionarResult = this.adicionar(destinoId, tipo, quantidade, descricao || 'Transferência de ' + origemId);
            if (!adicionarResult.success) { this.adicionar(origemId, tipo, quantidade, 'Reverter transferência'); return adicionarResult; }
            return { success: true, data: { origem: removerResult.data, destino: adicionarResult.data },
                message: quantidade + ' créditos ' + tipo.toUpperCase() + ' transferidos com sucesso' };
        } catch (error) { console.error('❌ Erro ao transferir créditos:', error); return { success: false, error: error
                .message }; }
    }

    historico(filtros) {
        try {
            var transactions = this._getTransactions();
            if (filtros) {
                if (filtros.walletId) { transactions = transactions.filter(function(t) { return t.walletId === filtros
                        .walletId; }); }
                if (filtros.companyId) { transactions = transactions.filter(function(t) { return t.companyId ===
                        filtros.companyId; }); }
                if (filtros.creditType) { transactions = transactions.filter(function(t) { return t.creditType ===
                        filtros.creditType.toUpperCase(); }); }
                if (filtros.type) { transactions = transactions.filter(function(t) { return t.type === filtros
                        .type; }); }
                if (filtros.startDate && filtros.endDate) { transactions = transactions.filter(function(t) { return t
                        .createdAt >= filtros.startDate && t.createdAt <= filtros.endDate; }); }
            }
            transactions.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
            return { success: true, data: transactions, total: transactions.length };
        } catch (error) { console.error('❌ Erro ao buscar histórico:', error); return { success: false, error: error
                .message }; }
    }

    relatorio(companyId) {
        try {
            var transactions = this._getTransactions();
            var tipos = this.config.tipos;
            var result = {};
            for (var i = 0; i < tipos.length; i++) {
                var t = tipos[i];
                result[t.id] = { totalAdicionado: 0, totalRemovido: 0, saldoAtual: 0, quantidadeTransacoes: 0 };
            }
            if (companyId) { transactions = transactions.filter(function(t) { return t.companyId === companyId; }); }
            for (var j = 0; j < transactions.length; j++) {
                var trans = transactions[j];
                var tipo = trans.creditType;
                if (result[tipo]) {
                    if (trans.type === 'credito' || trans.type === 'transferencia_entrada') { result[tipo]
                            .totalAdicionado += trans.quantity || 0; } else if (trans.type === 'debito' ||
                        trans.type === 'transferencia_saida') { result[tipo].totalRemovido += trans.quantity ||
                        0; }
                    result[tipo].quantidadeTransacoes++;
                }
            }
            for (var k = 0; k < tipos.length; k++) {
                var id = tipos[k].id;
                result[id].saldoAtual = result[id].totalAdicionado - result[id].totalRemovido;
            }
            return { success: true, data: result, totalTipos: tipos.length };
        } catch (error) { console.error('❌ Erro ao gerar relatório:', error); return { success: false, error: error
                .message }; }
    }

    resumoPorCarteira(walletId) {
        try {
            if (!walletId) return { success: false, error: 'ID da carteira é obrigatório' };
            if (window.carteiraService) { return window.carteiraService.verSaldoCreditos(walletId); }
            return { success: false, error: 'Carteira Service não disponível' };
        } catch (error) { console.error('❌ Erro ao gerar resumo:', error); return { success: false, error: error
                .message }; }
    }

    _getTransactions() { try { return JSON.parse(localStorage.getItem(this.config.storageKey) || '[]'); } catch { return []; } }
}

var creditoService = new CreditoService();
window.creditoService = creditoService;

console.log('✅ VIGORRE ONE™ - Credito Service carregado com sucesso!');
console.log('💳 Tipos de crédito:', CREDITO_CONFIG.tipos.map(function(t) { return t.id; }).join(', '));
