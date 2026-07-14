/**
 * ============================================
 * VIGORRE ONE™ - CARTEIRA SERVICE
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Criar carteira
 * - Buscar carteira por empresa
 * - Buscar carteira por ID
 * - Listar todas as carteiras
 * - Atualizar carteira
 * - Excluir carteira
 * - Adicionar saldo
 * - Remover saldo
 * - Transferir saldo entre carteiras
 * - Histórico de movimentações
 * - Relatório de carteiras
 * ============================================
 */

'use strict';

// ============================================
// CLASSE CARTEIRA SERVICE
// ============================================
class CarteiraService {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.storageKey = 'vigorre_wallets';
        this.transactionKey = 'vigorre_credit_transactions';
        this._cache = new Map();
        this._cacheTTL = 300000; // 5 minutos
    }

    // ============================================
    // 1. CRUD BÁSICO
    // ============================================
    
    // 1.1 CRIAR CARTEIRA
    criarCarteira(dados) {
        try {
            // Validação
            if (!dados.companyId) {
                return { success: false, error: 'Empresa é obrigatória' };
            }

            // Verificar se já existe carteira para esta empresa
            var existente = this.buscarPorEmpresa(dados.companyId);
            if (existente.success && existente.data) {
                return { success: false, error: 'Empresa já possui uma carteira' };
            }

            // Criar carteira
            var carteira = {
                id: this._gerarId(),
                companyId: dados.companyId,
                companyName: dados.companyName || '',
                balance: dados.balance || 0,
                creditLimit: dados.creditLimit || null,
                credits: {
                    DISC: dados.credits?.DISC || 0,
                    IE: dados.credits?.IE || 0,
                    VALORES: dados.credits?.VALORES || 0,
                    SWOT: dados.credits?.SWOT || 0,
                    BIGFIVE: dados.credits?.BIGFIVE || 0,
                    COMPETENCIAS: dados.credits?.COMPETENCIAS || 0,
                    LIDERANCA: dados.credits?.LIDERANCA || 0,
                    POTENCIAL: dados.credits?.POTENCIAL || 0,
                    FITCULTURAL: dados.credits?.FITCULTURAL || 0
                },
                status: dados.status || 'ativa',
                description: dados.description || 'Carteira criada',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastMovement: null
            };

            // Salvar
            var wallets = this._getAll();
            wallets.push(carteira);
            this._saveAll(wallets);

            // Limpar cache
            this._clearCache();

            // Registrar auditoria
            this._logAudit('Carteira criada', carteira.id, carteira.companyId);

            return {
                success: true,
                data: carteira,
                message: 'Carteira criada com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao criar carteira:', error);
            return { success: false, error: error.message };
        }
    }

    // 1.2 BUSCAR POR ID
    buscarPorId(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };

            // Verificar cache
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

        } catch (error) {
            console.error('❌ Erro ao buscar carteira:', error);
            return { success: false, error: error.message };
        }
    }

    // 1.3 BUSCAR POR EMPRESA
    buscarPorEmpresa(companyId) {
        try {
            if (!companyId) return { success: false, error: 'Empresa é obrigatória' };

            var wallets = this._getAll();
            for (var i = 0; i < wallets.length; i++) {
                if (wallets[i].companyId === companyId) {
                    return { success: true, data: wallets[i] };
                }
            }

            return { success: false, error: 'Carteira não encontrada para esta empresa' };

        } catch (error) {
            console.error('❌ Erro ao buscar carteira por empresa:', error);
            return { success: false, error: error.message };
        }
    }

    // 1.4 LISTAR TODAS
    listarTodas(filtros) {
        try {
            var wallets = this._getAll();

            // Aplicar filtros
            if (filtros) {
                if (filtros.status) {
                    wallets = wallets.filter(function(w) {
                        return w.status === filtros.status;
                    });
                }
                if (filtros.companyId) {
                    wallets = wallets.filter(function(w) {
                        return w.companyId === filtros.companyId;
                    });
                }
                if (filtros.search) {
                    var search = filtros.search.toLowerCase();
                    wallets = wallets.filter(function(w) {
                        return (w.companyName || '').toLowerCase().includes(search) ||
                               (w.id || '').toLowerCase().includes(search);
                    });
                }
            }

            // Ordenar por data de criação (mais recente primeiro)
            wallets.sort(function(a, b) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            return {
                success: true,
                data: wallets,
                total: wallets.length
            };

        } catch (error) {
            console.error('❌ Erro ao listar carteiras:', error);
            return { success: false, error: error.message };
        }
    }

    // 1.5 ATUALIZAR CARTEIRA
    atualizar(id, updates) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };

            var wallets = this._getAll();
            var found = false;

            for (var i = 0; i < wallets.length; i++) {
                if (wallets[i].id === id) {
                    // Atualizar campos permitidos
                    if (updates.balance !== undefined) wallets[i].balance = updates.balance;
                    if (updates.creditLimit !== undefined) wallets[i].creditLimit = updates.creditLimit;
                    if (updates.status) wallets[i].status = updates.status;
                    if (updates.description) wallets[i].description = updates.description;
                    if (updates.companyName) wallets[i].companyName = updates.companyName;
                    
                    // Atualizar créditos
                    if (updates.credits) {
                        var creditTypes = ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE', 'COMPETENCIAS', 'LIDERANCA', 'POTENCIAL', 'FITCULTURAL'];
                        for (var j = 0; j < creditTypes.length; j++) {
                            var type = creditTypes[j];
                            if (updates.credits[type] !== undefined) {
                                wallets[i].credits[type] = updates.credits[type];
                            }
                        }
                    }

                    wallets[i].updatedAt = new Date().toISOString();
                    found = true;
                    break;
                }
            }

            if (!found) {
                return { success: false, error: 'Carteira não encontrada' };
            }

            this._saveAll(wallets);
            this._clearCache();

            // Registrar auditoria
            this._logAudit('Carteira atualizada', id);

            return {
                success: true,
                data: wallets.find(function(w) { return w.id === id; }),
                message: 'Carteira atualizada com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao atualizar carteira:', error);
            return { success: false, error: error.message };
        }
    }

    // 1.6 EXCLUIR CARTEIRA
    excluir(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };

            var wallets = this._getAll();
            var filtered = wallets.filter(function(w) {
                return w.id !== id;
            });

            if (filtered.length === wallets.length) {
                return { success: false, error: 'Carteira não encontrada' };
            }

            this._saveAll(filtered);
            this._clearCache();

            // Registrar auditoria
            this._logAudit('Carteira excluída', id);

            return {
                success: true,
                message: 'Carteira excluída com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao excluir carteira:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 2. MOVIMENTAÇÕES
    // ============================================

    // 2.1 ADICIONAR SALDO
    adicionarSaldo(id, valor, descricao) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (!valor || valor <= 0) return { success: false, error: 'Valor deve ser maior que zero' };

            var result = this.buscarPorId(id);
            if (!result.success) return result;

            var wallet = result.data;
            wallet.balance = (wallet.balance || 0) + valor;
            wallet.lastMovement = new Date().toISOString();

            var updateResult = this.atualizar(id, {
                balance: wallet.balance,
                lastMovement: wallet.lastMovement
            });

            if (!updateResult.success) return updateResult;

            // Registrar transação
            this._registrarTransacao({
                walletId: id,
                companyId: wallet.companyId,
                type: 'credito',
                amount: valor,
                description: descricao || 'Adição de saldo',
                createdAt: new Date().toISOString()
            });

            return {
                success: true,
                data: updateResult.data,
                message: 'Saldo adicionado com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao adicionar saldo:', error);
            return { success: false, error: error.message };
        }
    }

    // 2.2 REMOVER SALDO
    removerSaldo(id, valor, descricao) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (!valor || valor <= 0) return { success: false, error: 'Valor deve ser maior que zero' };

            var result = this.buscarPorId(id);
            if (!result.success) return result;

            var wallet = result.data;
            if ((wallet.balance || 0) < valor) {
                return { success: false, error: 'Saldo insuficiente' };
            }

            wallet.balance = (wallet.balance || 0) - valor;
            wallet.lastMovement = new Date().toISOString();

            var updateResult = this.atualizar(id, {
                balance: wallet.balance,
                lastMovement: wallet.lastMovement
            });

            if (!updateResult.success) return updateResult;

            // Registrar transação
            this._registrarTransacao({
                walletId: id,
                companyId: wallet.companyId,
                type: 'debito',
                amount: valor,
                description: descricao || 'Remoção de saldo',
                createdAt: new Date().toISOString()
            });

            return {
                success: true,
                data: updateResult.data,
                message: 'Saldo removido com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao remover saldo:', error);
            return { success: false, error: error.message };
        }
    }

    // 2.3 TRANSFERIR ENTRE CARTEIRAS
    transferir(origemId, destinoId, valor, descricao) {
        try {
            if (!origemId || !destinoId) {
                return { success: false, error: 'IDs de origem e destino são obrigatórios' };
            }
            if (origemId === destinoId) {
                return { success: false, error: 'Origem e destino não podem ser iguais' };
            }
            if (!valor || valor <= 0) {
                return { success: false, error: 'Valor deve ser maior que zero' };
            }

            // Buscar carteiras
            var origemResult = this.buscarPorId(origemId);
            if (!origemResult.success) return origemResult;

            var destinoResult = this.buscarPorId(destinoId);
            if (!destinoResult.success) return destinoResult;

            var origem = origemResult.data;
            var destino = destinoResult.data;

            // Verificar saldo
            if ((origem.balance || 0) < valor) {
                return { success: false, error: 'Saldo insuficiente na carteira de origem' };
            }

            // Realizar transferência
            origem.balance = (origem.balance || 0) - valor;
            destino.balance = (destino.balance || 0) + valor;

            var now = new Date().toISOString();
            origem.lastMovement = now;
            destino.lastMovement = now;

            // Atualizar ambas
            var updateOrigem = this.atualizar(origemId, {
                balance: origem.balance,
                lastMovement: origem.lastMovement
            });

            if (!updateOrigem.success) return updateOrigem;

            var updateDestino = this.atualizar(destinoId, {
                balance: destino.balance,
                lastMovement: destino.lastMovement
            });

            if (!updateDestino.success) return updateDestino;

            // Registrar transações
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

            return {
                success: true,
                data: {
                    origem: updateOrigem.data,
                    destino: updateDestino.data
                },
                message: 'Transferência realizada com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao transferir:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 3. CRÉDITOS
    // ============================================

    // 3.1 ADICIONAR CRÉDITOS
    adicionarCredito(id, tipo, quantidade, descricao) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (!tipo) return { success: false, error: 'Tipo de crédito é obrigatório' };
            if (!quantidade || quantidade <= 0) {
                return { success: false, error: 'Quantidade deve ser maior que zero' };
            }

            var tiposValidos = ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE', 'COMPETENCIAS', 'LIDERANCA', 'POTENCIAL', 'FITCULTURAL'];
            var tipoUpper = tipo.toUpperCase();
            if (tiposValidos.indexOf(tipoUpper) === -1) {
                return { success: false, error: 'Tipo de crédito inválido' };
            }

            var result = this.buscarPorId(id);
            if (!result.success) return result;

            var wallet = result.data;
            wallet.credits[tipoUpper] = (wallet.credits[tipoUpper] || 0) + quantidade;
            wallet.lastMovement = new Date().toISOString();

            var updateResult = this.atualizar(id, {
                credits: wallet.credits,
                lastMovement: wallet.lastMovement
            });

            if (!updateResult.success) return updateResult;

            // Registrar transação
            this._registrarTransacao({
                walletId: id,
                companyId: wallet.companyId,
                type: 'credito',
                creditType: tipoUpper,
                quantity: quantidade,
                description: descricao || 'Adição de créditos ' + tipoUpper,
                createdAt: new Date().toISOString()
            });

            return {
                success: true,
                data: updateResult.data,
                message: quantidade + ' créditos ' + tipoUpper + ' adicionados com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao adicionar créditos:', error);
            return { success: false, error: error.message };
        }
    }

    // 3.2 REMOVER CRÉDITOS
    removerCredito(id, tipo, quantidade, descricao) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (!tipo) return { success: false, error: 'Tipo de crédito é obrigatório' };
            if (!quantidade || quantidade <= 0) {
                return { success: false, error: 'Quantidade deve ser maior que zero' };
            }

            var tiposValidos = ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE', 'COMPETENCIAS', 'LIDERANCA', 'POTENCIAL', 'FITCULTURAL'];
            var tipoUpper = tipo.toUpperCase();
            if (tiposValidos.indexOf(tipoUpper) === -1) {
                return { success: false, error: 'Tipo de crédito inválido' };
            }

            var result = this.buscarPorId(id);
            if (!result.success) return result;

            var wallet = result.data;
            var disponivel = wallet.credits[tipoUpper] || 0;

            if (disponivel < quantidade) {
                return {
                    success: false,
                    error: 'Saldo insuficiente. Disponível: ' + disponivel + ', Solicitado: ' + quantidade
                };
            }

            wallet.credits[tipoUpper] = disponivel - quantidade;
            wallet.lastMovement = new Date().toISOString();

            var updateResult = this.atualizar(id, {
                credits: wallet.credits,
                lastMovement: wallet.lastMovement
            });

            if (!updateResult.success) return updateResult;

            // Registrar transação
            this._registrarTransacao({
                walletId: id,
                companyId: wallet.companyId,
                type: 'debito',
                creditType: tipoUpper,
                quantity: quantidade,
                description: descricao || 'Uso de créditos ' + tipoUpper,
                createdAt: new Date().toISOString()
            });

            return {
                success: true,
                data: updateResult.data,
                message: quantidade + ' créditos ' + tipoUpper + ' removidos com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao remover créditos:', error);
            return { success: false, error: error.message };
        }
    }

    // 3.3 VER SALDO DE CRÉDITOS
    verSaldoCreditos(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };

            var result = this.buscarPorId(id);
            if (!result.success) return result;

            var wallet = result.data;
            var credits = wallet.credits || {};
            var total = 0;

            var tipos = ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE', 'COMPETENCIAS', 'LIDERANCA', 'POTENCIAL', 'FITCULTURAL'];
            var detalhes = {};

            for (var i = 0; i < tipos.length; i++) {
                var tipo = tipos[i];
                var valor = credits[tipo] || 0;
                detalhes[tipo] = valor;
                total += valor;
            }

            return {
                success: true,
                data: {
                    total: total,
                    detalhes: detalhes
                }
            };

        } catch (error) {
            console.error('❌ Erro ao ver saldo de créditos:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 4. RELATÓRIOS
    // ============================================

    // 4.1 RELATÓRIO RESUMIDO
    relatorioResumido() {
        try {
            var wallets = this._getAll();
            var totalWallets = wallets.length;
            var totalBalance = 0;
            var activeWallets = 0;
            var totalCredits = {};

            var tipos = ['DISC', 'IE', 'VALORES', 'SWOT', 'BIGFIVE', 'COMPETENCIAS', 'LIDERANCA', 'POTENCIAL', 'FITCULTURAL'];
            for (var i = 0; i < tipos.length; i++) {
                totalCredits[tipos[i]] = 0;
            }

            for (var j = 0; j < wallets.length; j++) {
                var w = wallets[j];
                totalBalance += w.balance || 0;
                if (w.status === 'ativa') activeWallets++;

                var credits = w.credits || {};
                for (var k = 0; k < tipos.length; k++) {
                    totalCredits[tipos[k]] += credits[tipos[k]] || 0;
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

        } catch (error) {
            console.error('❌ Erro ao gerar relatório resumido:', error);
            return { success: false, error: error.message };
        }
    }

    // 4.2 RELATÓRIO DETALHADO
    relatorioDetalhado(companyId) {
        try {
            var wallets = this._getAll();
            var result = [];

            for (var i = 0; i < wallets.length; i++) {
                if (companyId && wallets[i].companyId !== companyId) continue;

                var w = wallets[i];
                var credits = w.credits || {};
                var totalCredits = 0;

                for (var key in credits) {
                    totalCredits += credits[key] || 0;
                }

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

            // Ordenar por saldo (maior primeiro)
            result.sort(function(a, b) {
                return b.balance - a.balance;
            });

            return {
                success: true,
                data: result,
                total: result.length
            };

        } catch (error) {
            console.error('❌ Erro ao gerar relatório detalhado:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 5. MÉTODOS PRIVADOS
    // ============================================

    _getAll() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch {
            return [];
        }
    }

    _saveAll(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    _gerarId() {
        return 'C' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase();
    }

    _registrarTransacao(transacao) {
        try {
            var transactions = JSON.parse(localStorage.getItem(this.transactionKey) || '[]');
            transacao.id = 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase();
            transactions.push(transacao);
            localStorage.setItem(this.transactionKey, JSON.stringify(transactions));
        } catch (error) {
            console.warn('⚠️ Erro ao registrar transação:', error);
        }
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
        } catch (error) {
            console.warn('⚠️ Erro ao registrar auditoria:', error);
        }
    }

    _getCache(key) {
        var cached = this._cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > this._cacheTTL) {
            this._cache.delete(key);
            return null;
        }
        return cached.data;
    }

    _setCache(key, data) {
        this._cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    _clearCache() {
        this._cache.clear();
    }
}

// ============================================
// EXPORTAR
// ============================================
var carteiraService = new CarteiraService();
window.carteiraService = carteiraService;

console.log('✅ VIGORRE ONE™ - Carteira Service carregado com sucesso!');
console.log('💳 Tipos de crédito: DISC, IE, VALORES, SWOT, BIGFIVE, COMPETENCIAS, LIDERANCA, POTENCIAL, FITCULTURAL');
