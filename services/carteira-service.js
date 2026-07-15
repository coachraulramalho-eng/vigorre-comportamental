/**
 * ============================================
 * VIGORRE ONE™ - CARTEIRA SERVICE
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 15/07/2026
 * 
 * FUNCIONALIDADES:
 * - CRUD completo de carteiras
 * - Gerenciamento de saldo
 * - Gerenciamento de créditos (9 tipos)
 * - Transferências entre carteiras
 * - Histórico de movimentações
 * - Relatórios financeiros
 * - Integração com auditoria
 * ============================================
 */

'use strict';

const CARTEIRA_CONFIG = {
    tiposCredito: ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE', 'COMPETENCIAS', 'LIDERANCA', 'POTENCIAL', 'FITCULTURAL'],
    statusValidos: ['ativa', 'suspensa', 'inativa'],
    storageKey: 'vigorre_wallets',
    transactionKey: 'vigorre_credit_transactions'
};

class CarteiraService {
    
    constructor() {
        this.config = CARTEIRA_CONFIG;
        this._cache = new Map();
        this._cacheTTL = 300000;
    }

    criar(dados) {
        try {
            if (!dados.companyId) { return { success: false, error: 'Empresa é obrigatória' }; }
            var existente = this.buscarPorEmpresa(dados.companyId);
            if (existente.success && existente.data) { return { success: false, error: 'Empresa já possui uma carteira' }; }
            var carteira = {
                id: this._gerarId(),
                companyId: dados.companyId,
                companyName: dados.companyName || '',
                balance: dados.balance || 0,
                creditLimit: dados.creditLimit || null,
                credits: {},
                status: dados.status || 'ativa',
                description: dados.description || 'Carteira criada',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastMovement: null
            };
            for (var i = 0; i < this.config.tiposCredito.length; i++) {
                var tipo = this.config.tiposCredito[i];
                carteira.credits[tipo] = (dados.credits && dados.credits[tipo]) || 0;
            }
            var wallets = this._getAll();
            wallets.push(carteira);
            this._saveAll(wallets);
            this._clearCache();
            this._logAudit('Carteira criada', carteira.id, carteira.companyId);
            return { success: true, data: carteira, message: 'Carteira criada com sucesso' };
        } catch (error) { console.error('❌ Erro ao criar carteira:', error); return { success: false, error: error
                .message }; }
    }

    buscarPorId(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            var cacheKey = 'wallet_' + id;
            var cached = this._getCache(cacheKey);
            if (cached) return cached;
            var wallets = this._getAll();
            for (var i = 0; i < wallets.length; i++) {
                if (wallets[i].id === id) {
                    var result = { success: true, data: wallets[i] };
                    this._setCache(cacheKey, result);
                    return result;
                }
            }
            return { success: false, error: 'Carteira não encontrada' };
        } catch (error) { console.error('❌ Erro ao buscar carteira:', error); return { success: false, error: error
                .message }; }
    }

    buscarPorEmpresa(companyId) {
        try {
            if (!companyId) return { success: false, error: 'Empresa é obrigatória' };
            var wallets = this._getAll();
            for (var i = 0; i < wallets.length; i++) {
                if (wallets[i].companyId === companyId) { return { success: true, data: wallets[i] }; }
            }
            return { success: false, error: 'Carteira não encontrada para esta empresa' };
        } catch (error) { console.error('❌ Erro ao buscar carteira por empresa:', error); return { success: false,
                error: error.message }; }
    }

    listar(filtros) {
        try {
            var wallets = this._getAll();
            if (filtros) {
                if (filtros.status) { wallets = wallets.filter(function(w) { return w.status === filtros.status; }); }
                if (filtros.companyId) { wallets = wallets.filter(function(w) { return w.companyId === filtros
                        .companyId; }); }
                if (filtros.search) {
                    var search = filtros.search.toLowerCase();
                    wallets = wallets.filter(function(w) { return (w.companyName || '').toLowerCase().includes(search) ||
                            (w.id || '').toLowerCase().includes(search); });
                }
            }
            wallets.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
            return { success: true, data: wallets, total: wallets.length };
        } catch (error) { console.error('❌ Erro ao listar carteiras:', error); return { success: false, error: error
                .message }; }
    }

    atualizar(id, updates) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            var wallets = this._getAll();
            var found = false;
            for (var i = 0; i < wallets.length; i++) {
                if (wallets[i].id === id) {
                    if (updates.balance !== undefined) wallets[i].balance = updates.balance;
                    if (updates.creditLimit !== undefined) wallets[i].creditLimit = updates.creditLimit;
                    if (updates.status) wallets[i].status = updates.status;
                    if (updates.description) wallets[i].description = updates.description;
                    if (updates.companyName) wallets[i].companyName = updates.companyName;
                    if (updates.credits) {
                        for (var j = 0; j < this.config.tiposCredito.length; j++) {
                            var tipo = this.config.tiposCredito[j];
                            if (updates.credits[tipo] !== undefined) {
                                wallets[i].credits[tipo] = updates.credits[tipo];
                            }
                        }
                    }
                    wallets[i].updatedAt = new Date().toISOString();
                    found = true;
                    break;
                }
            }
            if (!found) { return { success: false, error: 'Carteira não encontrada' }; }
            this._saveAll(wallets);
            this._clearCache();
            this._logAudit('Carteira atualizada', id);
            return { success: true, data: wallets.find(function(w) { return w.id === id; }),
                message: 'Carteira atualizada com sucesso' };
        } catch (error) { console.error('❌ Erro ao atualizar carteira:', error); return { success: false, error: error
                .message }; }
    }

    excluir(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            var wallets = this._getAll();
            var filtered = wallets.filter(function(w) { return w.id !== id; });
            if (filtered.length === wallets.length) { return { success: false, error: 'Carteira não encontrada' }; }
            this._saveAll(filtered);
            this._clearCache();
            this._logAudit('Carteira excluída', id);
            return { success: true, message: 'Carteira excluída com sucesso' };
        } catch (error) { console.error('❌ Erro ao excluir carteira:', error); return { success: false, error: error
                .message }; }
    }

    adicionarSaldo(id, valor, descricao) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (!valor || valor <= 0) return { success: false, error: 'Valor deve ser maior que zero' };
            var result = this.buscarPorId(id);
            if (!result.success) return result;
            var wallet = result.data;
            wallet.balance = (wallet.balance || 0) + valor;
            wallet.lastMovement = new Date().toISOString();
            var updateResult = this.atualizar(id, { balance: wallet.balance, lastMovement: wallet.lastMovement });
            if (!updateResult.success) return updateResult;
            this._registrarTransacao({
                walletId: id,
                companyId: wallet.companyId,
                type: 'credito',
                amount: valor,
                description: descricao || 'Adição de saldo',
                createdAt: new Date().toISOString()
            });
            return { success: true, data: updateResult.data, message: 'Saldo adicionado com sucesso' };
        } catch (error) { console.error('❌ Erro ao adicionar saldo:', error); return { success: false, error: error
                .message }; }
    }

    removerSaldo(id, valor, descricao) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (!valor || valor <= 0) return { success: false, error: 'Valor deve ser maior que zero' };
            var result = this.buscarPorId(id);
            if (!result.success) return result;
            var wallet = result.data;
            if ((wallet.balance || 0) < valor) { return { success: false, error: 'Saldo insuficiente' }; }
            wallet.balance = (wallet.balance || 0) - valor;
            wallet.lastMovement = new Date().toISOString();
            var updateResult = this.atualizar(id, { balance: wallet.balance, lastMovement: wallet.lastMovement });
            if (!updateResult.success) return updateResult;
            this._registrarTransacao({
                walletId: id,
                companyId: wallet.companyId,
                type: 'debito',
                amount: valor,
                description: descricao || 'Remoção de saldo',
                createdAt: new Date().toISOString()
            });
            return { success: true, data: updateResult.data, message: 'Saldo removido com sucesso' };
        } catch (error) { console.error('❌ Erro ao remover saldo:', error); return { success: false, error: error
                .message }; }
    }

    transferir(origemId, destinoId, valor, descricao) {
        try {
            if (!origemId || !destinoId) { return { success: false, error: 'IDs de origem e destino são obrigatórios' }; }
            if (origemId === destinoId) { return { success: false, error: 'Origem e destino não podem ser iguais' }; }
            if (!valor || valor <= 0) { return { success: false, error: 'Valor deve ser maior que zero' }; }
            var origemResult = this.buscarPorId(origemId);
            if (!origemResult.success) return origemResult;
            var destinoResult = this.buscarPorId(destinoId);
            if (!destinoResult.success) return destinoResult;
            var origem = origemResult.data;
            var destino = destinoResult.data;
            if ((origem.balance || 0) < valor) { return { success: false, error: 'Saldo insuficiente na carteira de origem' }; }
            origem.balance = (origem.balance || 0) - valor;
            destino.balance = (destino.balance || 0) + valor;
            var now = new Date().toISOString();
            origem.lastMovement = now;
            destino.lastMovement = now;
            var updateOrigem = this.atualizar(origemId, { balance: origem.balance, lastMovement: origem
                .lastMovement });
            if (!updateOrigem.success) return updateOrigem;
            var updateDestino = this.atualizar(destinoId, { balance: destino.balance, lastMovement: destino
                .lastMovement });
            if (!updateDestino.success) return updateDestino;
            this._registrarTransacao({
                walletId: origemId,
                companyId: origem.companyId,
                type: 'transferencia_saida',
                amount: valor,
                description: descricao || 'Transferência para ' + destino.companyId,
                destinationWalletId: destinoId,
                createdAt: now
            });
            this._registrarTransacao({
                walletId: destinoId,
                companyId: destino.companyId,
                type: 'transferencia_entrada',
                amount: valor,
                description: descricao || 'Transferência de ' + origem.companyId,
                sourceWalletId: origemId,
                createdAt: now
            });
            return { success: true, data: { origem: updateOrigem.data, destino: updateDestino.data },
                message: 'Transferência realizada com sucesso' };
        } catch (error) { console.error('❌ Erro ao transferir:', error); return { success: false, error: error
                .message }; }
    }

    adicionarCredito(id, tipo, quantidade, descricao) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (!tipo) return { success: false, error: 'Tipo de crédito é obrigatório' };
            if (!quantidade || quantidade <= 0) { return { success: false, error: 'Quantidade deve ser maior que zero' }; }
            var tipoUpper = tipo.toUpperCase();
            if (this.config.tiposCredito.indexOf(tipoUpper) === -1) { return { success: false,
                    error: 'Tipo de crédito inválido' }; }
            var result = this.buscarPorId(id);
            if (!result.success) return result;
            var wallet = result.data;
            wallet.credits[tipoUpper] = (wallet.credits[tipoUpper] || 0) + quantidade;
            wallet.lastMovement = new Date().toISOString();
            var updateResult = this.atualizar(id, { credits: wallet.credits, lastMovement: wallet.lastMovement });
            if (!updateResult.success) return updateResult;
            this._registrarTransacao({
                walletId: id,
                companyId: wallet.companyId,
                type: 'credito',
                creditType: tipoUpper,
                quantity: quantidade,
                description: descricao || 'Adição de créditos ' + tipoUpper,
                createdAt: new Date().toISOString()
            });
            return { success: true, data: updateResult.data,
                message: quantidade + ' créditos ' + tipoUpper + ' adicionados com sucesso' };
        } catch (error) { console.error('❌ Erro ao adicionar créditos:', error); return { success: false, error: error
                .message }; }
    }

    removerCredito(id, tipo, quantidade, descricao) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (!tipo) return { success: false, error: 'Tipo de crédito é obrigatório' };
            if (!quantidade || quantidade <= 0) { return { success: false, error: 'Quantidade deve ser maior que zero' }; }
            var tipoUpper = tipo.toUpperCase();
            if (this.config.tiposCredito.indexOf(tipoUpper) === -1) { return { success: false,
                    error: 'Tipo de crédito inválido' }; }
            var result = this.buscarPorId(id);
            if (!result.success) return result;
            var wallet = result.data;
            var disponivel = wallet.credits[tipoUpper] || 0;
            if (disponivel < quantidade) { return { success: false,
                    error: 'Saldo insuficiente. Disponível: ' + disponivel + ', Solicitado: ' + quantidade }; }
            wallet.credits[tipoUpper] = disponivel - quantidade;
            wallet.lastMovement = new Date().toISOString();
            var updateResult = this.atualizar(id, { credits: wallet.credits, lastMovement: wallet.lastMovement });
            if (!updateResult.success) return updateResult;
            this._registrarTransacao({
                walletId: id,
                companyId: wallet.companyId,
                type: 'debito',
                creditType: tipoUpper,
                quantity: quantidade,
                description: descricao || 'Uso de créditos ' + tipoUpper,
                createdAt: new Date().toISOString()
            });
            return { success: true, data: updateResult.data,
                message: quantidade + ' créditos ' + tipoUpper + ' removidos com sucesso' };
        } catch (error) { console.error('❌ Erro ao remover créditos:', error); return { success: false, error: error
                .message }; }
    }

    verSaldoCreditos(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            var result = this.buscarPorId(id);
            if (!result.success) return result;
            var wallet = result.data;
            var credits = wallet.credits || {};
            var total = 0;
            var detalhes = {};
            for (var i = 0; i < this.config.tiposCredito.length; i++) {
                var tipo = this.config.tiposCredito[i];
                var valor = credits[tipo] || 0;
                detalhes[tipo] = valor;
                total += valor;
            }
            return { success: true, data: { total: total, detalhes: detalhes } };
        } catch (error) { console.error('❌ Erro ao ver saldo de créditos:', error); return { success: false,
                error: error.message }; }
    }

    relatorioResumido() {
        try {
            var wallets = this._getAll();
            var totalWallets = wallets.length;
            var totalBalance = 0;
            var activeWallets = 0;
            var totalCredits = {};
            for (var i = 0; i < this.config.tiposCredito.length; i++) { totalCredits[this.config.tiposCredito[i]] = 0; }
            for (var j = 0; j < wallets.length; j++) {
                var w = wallets[j];
                totalBalance += w.balance || 0;
                if (w.status === 'ativa') activeWallets++;
                var credits = w.credits || {};
                for (var k = 0; k < this.config.tiposCredito.length; k++) {
                    var tipo = this.config.tiposCredito[k];
                    totalCredits[tipo] += credits[tipo] || 0;
                }
            }
            return {
                success: true,
                data: {
                    totalWallets: totalWallets,
                    activeWallets: activeWallets,
                    inactiveWallets: totalWallets - activeWallets,
                    totalBalance: totalBalance,
                    totalCredits: totalCredits,
                    averageBalance: totalWallets > 0 ? totalBalance / totalWallets : 0
                }
            };
        } catch (error) { console.error('❌ Erro ao gerar relatório resumido:', error); return { success: false,
                error: error.message }; }
    }

    relatorioDetalhado(companyId) {
        try {
            var wallets = this._getAll();
            var result = [];
            for (var i = 0; i < wallets.length; i++) {
                if (companyId && wallets[i].companyId !== companyId) continue;
                var w = wallets[i];
                var credits = w.credits || {};
                var totalCredits = 0;
                for (var key in credits) { totalCredits += credits[key] || 0; }
                result.push({
                    id: w.id,
                    companyId: w.companyId,
                    companyName: w.companyName || 'Empresa ' + w.companyId,
                    balance: w.balance || 0,
                    creditLimit: w.creditLimit || null,
                    totalCredits: totalCredits,
                    credits: credits,
                    status: w.status || 'ativa',
                    createdAt: w.createdAt,
                    lastMovement: w.lastMovement || 'Nunca'
                });
            }
            result.sort(function(a, b) { return b.balance - a.balance; });
            return { success: true, data: result, total: result.length };
        } catch (error) { console.error('❌ Erro ao gerar relatório detalhado:', error); return { success: false,
                error: error.message }; }
    }

    _getAll() { try { return JSON.parse(localStorage.getItem(this.config.storageKey) || '[]'); } catch { return []; } }
    _saveAll(data) { localStorage.setItem(this.config.storageKey, JSON.stringify(data)); }
    _gerarId() { return 'C' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase(); }
    _registrarTransacao(transacao) {
        try {
            var transactions = JSON.parse(localStorage.getItem(this.config.transactionKey) || '[]');
            transacao.id = 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase();
            transactions.push(transacao);
            localStorage.setItem(this.config.transactionKey, JSON.stringify(transactions));
        } catch (error) { console.warn('⚠️ Erro ao registrar transação:', error); }
    }
    _logAudit(acao, walletId, companyId) {
        try {
            var user = window.VigorreAuth?.getCurrentUser() || { name: 'Sistema' };
            var logs = JSON.parse(localStorage.getItem('vigorre_audit_logs') || '[]');
            logs.push({
                id: 'A' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase(),
                user: user.name || 'Sistema',
                action: acao,
                description: 'Carteira: ' + walletId + ' | Empresa: ' + (companyId || 'N/A'),
                severity: 'medio',
                date: new Date().toLocaleString('pt-BR'),
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('vigorre_audit_logs', JSON.stringify(logs));
        } catch (error) { console.warn('⚠️ Erro ao registrar auditoria:', error); }
    }
    _getCache(key) { var cached = this._cache.get(key); if (!cached) return null; if (Date.now() - cached.timestamp > this
            ._cacheTTL) { this._cache.delete(key); return null; } return cached.data; }
    _setCache(key, data) { this._cache.set(key, { data: data, timestamp: Date.now() }); }
    _clearCache() { this._cache.clear(); }
}

var carteiraService = new CarteiraService();
window.carteiraService = carteiraService;

console.log('✅ VIGORRE ONE™ - Carteira Service carregado com sucesso!');
console.log('💳 Tipos de crédito:', CARTEIRA_CONFIG.tiposCredito.join(', '));
