/**
 * ============================================
 * VIGORRE ONE™ - CREDITO SERVICE
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Listar todos os tipos de crédito
 * - Adicionar créditos
 * - Remover créditos
 * - Transferir créditos
 * - Histórico de transações
 * - Relatório de créditos
 * - Validação de créditos
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO DE CRÉDITOS
// ============================================
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
    }
};

// ============================================
// CLASSE CREDITO SERVICE
// ============================================
class CreditoService {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.config = CREDITO_CONFIG;
        this.transactionKey = 'vigorre_credit_transactions';
        this.walletKey = 'vigorre_wallets';
    }

    // ============================================
    // 1. LISTAR TIPOS DE CRÉDITO
    // ============================================
    listarTipos() {
        return {
            success: true,
            data: this.config.tipos,
            total: this.config.tipos.length
        };
    }

    // ============================================
    // 2. OBTER TIPO DE CRÉDITO POR ID
    // ============================================
    obterTipo(id) {
        var tipo = this.config.tipos.find(function(t) {
            return t.id === id.toUpperCase();
        });
        
        if (tipo) {
            return { success: true, data: tipo };
        }
        
        return { success: false, error: 'Tipo de crédito não encontrado' };
    }

    // ============================================
    // 3. OBTER PREÇO DE CRÉDITO
    // ============================================
    obterPreco(id) {
        var preco = this.config.precos[id.toUpperCase()];
        if (preco !== undefined) {
            return { success: true, data: preco };
        }
        return { success: false, error: 'Preço não encontrado para este tipo' };
    }

    // ============================================
    // 4. VALIDAR CRÉDITO
    // ============================================
    validarCredito(id, quantidade) {
        try {
            if (!id) return { success: false, error: 'Tipo de crédito é obrigatório' };
            if (!quantidade || quantidade <= 0) {
                return { success: false, error: 'Quantidade deve ser maior que zero' };
            }

            var tiposValidos = this.config.tipos.map(function(t) { return t.id; });
            var tipoUpper = id.toUpperCase();
            
            if (tiposValidos.indexOf(tipoUpper) === -1) {
                return { success: false, error: 'Tipo de crédito inválido' };
            }

            if (!Number.isInteger(quantidade)) {
                return { success: false, error: 'Quantidade deve ser um número inteiro' };
            }

            return { success: true };
            
        } catch (error) {
            console.error('❌ Erro ao validar crédito:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 5. ADICIONAR CRÉDITOS À CARTEIRA
    // ============================================
    adicionar(walletId, tipo, quantidade, descricao) {
        try {
            // Validar
            var validacao = this.validarCredito(tipo, quantidade);
            if (!validacao.success) return validacao;

            // Buscar carteira
            var walletResult = this._buscarCarteira(walletId);
            if (!walletResult.success) return walletResult;

            var wallet = walletResult.data;
            var tipoUpper = tipo.toUpperCase();

            // Atualizar créditos
            wallet.credits = wallet.credits || {};
            wallet.credits[tipoUpper] = (wallet.credits[tipoUpper] || 0) + quantidade;
            wallet.lastMovement = new Date().toISOString();

            // Salvar
            this._atualizarCarteira(wallet);

            // Registrar transação
            this._registrarTransacao({
                walletId: walletId,
                companyId: wallet.companyId,
                type: 'credito',
                creditType: tipoUpper,
                quantity: quantidade,
                amount: quantidade * (this.config.precos[tipoUpper] || 0),
                description: descricao || 'Adição de créditos ' + tipoUpper,
                createdAt: new Date().toISOString()
            });

            return {
                success: true,
                data: wallet,
                message: quantidade + ' créditos ' + tipoUpper + ' adicionados com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao adicionar créditos:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 6. REMOVER CRÉDITOS DA CARTEIRA
    // ============================================
    remover(walletId, tipo, quantidade, descricao) {
        try {
            // Validar
            var validacao = this.validarCredito(tipo, quantidade);
            if (!validacao.success) return validacao;

            // Buscar carteira
            var walletResult = this._buscarCarteira(walletId);
            if (!walletResult.success) return walletResult;

            var wallet = walletResult.data;
            var tipoUpper = tipo.toUpperCase();

            // Verificar saldo
            var disponivel = (wallet.credits && wallet.credits[tipoUpper]) || 0;
            if (disponivel < quantidade) {
                return {
                    success: false,
                    error: 'Saldo insuficiente. Disponível: ' + disponivel + ', Solicitado: ' + quantidade
                };
            }

            // Atualizar créditos
            wallet.credits[tipoUpper] = disponivel - quantidade;
            wallet.lastMovement = new Date().toISOString();

            // Salvar
            this._atualizarCarteira(wallet);

            // Registrar transação
            this._registrarTransacao({
                walletId: walletId,
                companyId: wallet.companyId,
                type: 'debito',
                creditType: tipoUpper,
                quantity: quantidade,
                amount: quantidade * (this.config.precos[tipoUpper] || 0),
                description: descricao || 'Uso de créditos ' + tipoUpper,
                createdAt: new Date().toISOString()
            });

            return {
                success: true,
                data: wallet,
                message: quantidade + ' créditos ' + tipoUpper + ' removidos com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao remover créditos:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 7. TRANSFERIR CRÉDITOS
    // ============================================
    transferir(origemId, destinoId, tipo, quantidade, descricao) {
        try {
            if (!origemId || !destinoId) {
                return { success: false, error: 'Carteiras de origem e destino são obrigatórias' };
            }
            if (origemId === destinoId) {
                return { success: false, error: 'Origem e destino não podem ser iguais' };
            }

            // Validar crédito
            var validacao = this.validarCredito(tipo, quantidade);
            if (!validacao.success) return validacao;

            // Remover da origem
            var removerResult = this.remover(origemId, tipo, quantidade, descricao || 'Transferência para ' + destinoId);
            if (!removerResult.success) return removerResult;

            // Adicionar ao destino
            var adicionarResult = this.adicionar(destinoId, tipo, quantidade, descricao || 'Transferência de ' + origemId);
            if (!adicionarResult.success) {
                // Reverter: devolver créditos à origem
                this.adicionar(origemId, tipo, quantidade, 'Reverter transferência');
                return adicionarResult;
            }

            return {
                success: true,
                data: {
                    origem: removerResult.data,
                    destino: adicionarResult.data
                },
                message: quantidade + ' créditos ' + tipo.toUpperCase() + ' transferidos com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao transferir créditos:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 8. HISTÓRICO DE TRANSAÇÕES
    // ============================================
    historico(filtros) {
        try {
            var transactions = this._getTransactions();

            // Aplicar filtros
            if (filtros) {
                if (filtros.walletId) {
                    transactions = transactions.filter(function(t) {
                        return t.walletId === filtros.walletId;
                    });
                }
                if (filtros.companyId) {
                    transactions = transactions.filter(function(t) {
                        return t.companyId === filtros.companyId;
                    });
                }
                if (filtros.creditType) {
                    transactions = transactions.filter(function(t) {
                        return t.creditType === filtros.creditType.toUpperCase();
                    });
                }
                if (filtros.type) {
                    transactions = transactions.filter(function(t) {
                        return t.type === filtros.type;
                    });
                }
                if (filtros.startDate && filtros.endDate) {
                    transactions = transactions.filter(function(t) {
                        return t.createdAt >= filtros.startDate && t.createdAt <= filtros.endDate;
                    });
                }
            }

            // Ordenar por data (mais recente primeiro)
            transactions.sort(function(a, b) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            return {
                success: true,
                data: transactions,
                total: transactions.length
            };

        } catch (error) {
            console.error('❌ Erro ao buscar histórico:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 9. RELATÓRIO DE CRÉDITOS
    // ============================================
    relatorio(companyId) {
        try {
            var transactions = this._getTransactions();
            var tipos = this.config.tipos;
            var result = {};

            // Inicializar
            for (var i = 0; i < tipos.length; i++) {
                var t = tipos[i];
                result[t.id] = {
                    totalAdicionado: 0,
                    totalRemovido: 0,
                    saldoAtual: 0,
                    quantidadeTransacoes: 0
                };
            }

            // Filtrar por empresa
            if (companyId) {
                transactions = transactions.filter(function(t) {
                    return t.companyId === companyId;
                });
            }

            // Processar transações
            for (var j = 0; j < transactions.length; j++) {
                var trans = transactions[j];
                var tipo = trans.creditType;
                if (result[tipo]) {
                    if (trans.type === 'credito' || trans.type === 'transferencia_entrada') {
                        result[tipo].totalAdicionado += trans.quantity || 0;
                    } else if (trans.type === 'debito' || trans.type === 'transferencia_saida') {
                        result[tipo].totalRemovido += trans.quantity || 0;
                    }
                    result[tipo].quantidadeTransacoes++;
                }
            }

            // Calcular saldo atual
            for (var k = 0; k < tipos.length; k++) {
                var id = tipos[k].id;
                result[id].saldoAtual = result[id].totalAdicionado - result[id].totalRemovido;
            }

            return {
                success: true,
                data: result,
                totalTipos: tipos.length
            };

        } catch (error) {
            console.error('❌ Erro ao gerar relatório:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 10. RESUMO DE CRÉDITOS POR CARTEIRA
    // ============================================
    resumoPorCarteira(walletId) {
        try {
            if (!walletId) return { success: false, error: 'ID da carteira é obrigatório' };

            var walletResult = this._buscarCarteira(walletId);
            if (!walletResult.success) return walletResult;

            var wallet = walletResult.data;
            var credits = wallet.credits || {};
            var tipos = this.config.tipos;

            var result = {
                walletId: walletId,
                companyId: wallet.companyId,
                total: 0,
                detalhes: []
            };

            for (var i = 0; i < tipos.length; i++) {
                var t = tipos[i];
                var quantidade = credits[t.id] || 0;
                result.detalhes.push({
                    tipo: t.id,
                    nome: t.nome,
                    icone: t.icone,
                    quantidade: quantidade,
                    valor: quantidade * (this.config.precos[t.id] || 0)
                });
                result.total += quantidade;
            }

            // Ordenar por quantidade (maior primeiro)
            result.detalhes.sort(function(a, b) {
                return b.quantidade - a.quantidade;
            });

            return {
                success: true,
                data: result
            };

        } catch (error) {
            console.error('❌ Erro ao gerar resumo:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 11. MÉTODOS PRIVADOS
    // ============================================

    _getTransactions() {
        try {
            return JSON.parse(localStorage.getItem(this.transactionKey) || '[]');
        } catch {
            return [];
        }
    }

    _getWallets() {
        try {
            return JSON.parse(localStorage.getItem(this.walletKey) || '[]');
        } catch {
            return [];
        }
    }

    _buscarCarteira(id) {
        var wallets = this._getWallets();
        for (var i = 0; i < wallets.length; i++) {
            if (wallets[i].id === id) {
                return { success: true, data: wallets[i] };
            }
        }
        return { success: false, error: 'Carteira não encontrada' };
    }

    _atualizarCarteira(wallet) {
        var wallets = this._getWallets();
        for (var i = 0; i < wallets.length; i++) {
            if (wallets[i].id === wallet.id) {
                wallets[i] = wallet;
                break;
            }
        }
        localStorage.setItem(this.walletKey, JSON.stringify(wallets));
    }

    _registrarTransacao(transacao) {
        try {
            var transactions = this._getTransactions();
            transacao.id = 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase();
            transactions.push(transacao);
            localStorage.setItem(this.transactionKey, JSON.stringify(transactions));
        } catch (error) {
            console.warn('⚠️ Erro ao registrar transação:', error);
        }
    }
}

// ============================================
// EXPORTAR
// ============================================
var creditoService = new CreditoService();
window.creditoService = creditoService;

console.log('✅ VIGORRE ONE™ - Credito Service carregado com sucesso!');
console.log('💳 Tipos de crédito:', CREDITO_CONFIG.tipos.map(function(t) { return t.id; }).join(', '));
