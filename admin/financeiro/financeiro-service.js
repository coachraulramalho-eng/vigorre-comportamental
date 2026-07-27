/**
 * ============================================
 * VIGORRE ONE™ - CENTRO FINANCEIRO
 * Serviços de Negócio
 * ============================================
 */

class FinanceiroService {
    constructor() {
        this.db = window.FinanceiroDB || null;
        this.cache = new Map();
        console.log('💰 FinanceiroService inicializado');
    }

    /**
     * ============================================
     * SERVIÇOS DE CARTEIRA
     * ============================================
     */

    /**
     * Busca todas as carteiras com filtros
     */
    async getCarteiras(filtros = {}) {
        try {
            const cacheKey = `carteiras_${JSON.stringify(filtros)}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const dados = await this.db.getCarteiras(filtros);
            this.cache.set(cacheKey, dados);
            return dados;
        } catch (error) {
            console.error('❌ Erro em getCarteiras:', error);
            return this.db.getCarteirasMock();
        }
    }

    /**
     * Busca saldo de uma carteira
     */
    async getSaldoCarteira(carteiraId) {
        try {
            const carteira = await this.db.getCarteiraById(carteiraId);
            if (!carteira) return null;

            return {
                saldo: carteira.saldo || 0,
                reservado: carteira.saldo_reservado || 0,
                disponivel: (carteira.saldo || 0) - (carteira.saldo_reservado || 0),
                bonus: carteira.creditos_bonus || 0,
                promocional: carteira.creditos_promocionais || 0
            };
        } catch (error) {
            console.error('❌ Erro em getSaldoCarteira:', error);
            return null;
        }
    }

    /**
     * Adiciona créditos a uma carteira
     */
    async adicionarCreditos(carteiraId, quantidade, tipo = 'normal', motivo = 'compra', observacao = '') {
        try {
            // Buscar carteira atual
            const carteira = await this.db.getCarteiraById(carteiraId);
            if (!carteira) {
                throw new Error('Carteira não encontrada');
            }

            // Calcular novo saldo
            const saldoAntes = carteira.saldo || 0;
            const novoSaldo = saldoAntes + quantidade;

            // Atualizar carteira
            const atualizada = await this.db.updateCarteira(carteiraId, {
                saldo: novoSaldo,
                updated_at: new Date().toISOString()
            });

            // Registrar transação
            const transacao = await this.db.createTransacao({
                carteira_id: carteiraId,
                tipo: 'entrada',
                descricao: `Adição de ${quantidade} créditos - ${motivo}`,
                valor: quantidade,
                saldo_antes: saldoAntes,
                saldo_depois: novoSaldo,
                documento: `ADM-${Date.now()}`,
                responsavel: 'Sistema'
            });

            // Invalidar cache
            this.cache.delete(`carteiras_*`);

            return {
                carteira: atualizada,
                transacao: transacao,
                saldo_anterior: saldoAntes,
                saldo_atual: novoSaldo
            };
        } catch (error) {
            console.error('❌ Erro em adicionarCreditos:', error);
            throw error;
        }
    }

    /**
     * Remove créditos de uma carteira (consumo)
     */
    async consumirCreditos(carteiraId, quantidade, motivo = 'consumo', observacao = '') {
        try {
            const carteira = await this.db.getCarteiraById(carteiraId);
            if (!carteira) {
                throw new Error('Carteira não encontrada');
            }

            const saldoAntes = carteira.saldo || 0;
            if (saldoAntes < quantidade) {
                throw new Error('Saldo insuficiente');
            }

            const novoSaldo = saldoAntes - quantidade;

            const atualizada = await this.db.updateCarteira(carteiraId, {
                saldo: novoSaldo,
                updated_at: new Date().toISOString()
            });

            const transacao = await this.db.createTransacao({
                carteira_id: carteiraId,
                tipo: 'saida',
                descricao: `Consumo de ${quantidade} créditos - ${motivo}`,
                valor: quantidade,
                saldo_antes: saldoAntes,
                saldo_depois: novoSaldo,
                documento: `CON-${Date.now()}`,
                responsavel: 'Sistema'
            });

            this.cache.delete(`carteiras_*`);

            return {
                carteira: atualizada,
                transacao: transacao,
                saldo_anterior: saldoAntes,
                saldo_atual: novoSaldo
            };
        } catch (error) {
            console.error('❌ Erro em consumirCreditos:', error);
            throw error;
        }
    }

    /**
     * ============================================
     * SERVIÇOS DE PREÇOS
     * ============================================
     */

    /**
     * Busca preço de um produto
     */
    async getPrecoProduto(tipoProduto) {
        try {
            const precos = await this.db.getPrecos();
            return precos.find(p => p.tipo === tipoProduto) || null;
        } catch (error) {
            console.error('❌ Erro em getPrecoProduto:', error);
            return null;
        }
    }

    /**
     * Calcula o preço de um produto com desconto
     */
    async calcularPreco(tipoProduto, cupomCodigo = null) {
        try {
            const preco = await this.getPrecoProduto(tipoProduto);
            if (!preco) return null;

            let valor = preco.preco_promocional || preco.preco_unitario;

            // Aplicar cupom se fornecido
            if (cupomCodigo) {
                const cupom = await this.db.validarCupom(cupomCodigo);
                if (cupom) {
                    if (cupom.tipo === 'percentual') {
                        valor = valor * (1 - (cupom.valor / 100));
                    } else if (cupom.tipo === 'fixo') {
                        valor = Math.max(0, valor - cupom.valor);
                    }
                }
            }

            return {
                preco_original: preco.preco_unitario,
                preco_promocional: preco.preco_promocional,
                preco_final: Math.round(valor * 100) / 100,
                cupom_aplicado: cupomCodigo || null
            };
        } catch (error) {
            console.error('❌ Erro em calcularPreco:', error);
            return null;
        }
    }

    /**
     * ============================================
     * SERVIÇOS DE CUPONS
     * ============================================
     */

    /**
     * Aplica um cupom a uma compra
     */
    async aplicarCupom(codigo, valorTotal) {
        try {
            const cupom = await this.db.validarCupom(codigo);
            if (!cupom) {
                return {
                    valido: false,
                    mensagem: 'Cupom inválido ou expirado'
                };
            }

            let desconto = 0;
            let valorFinal = valorTotal;

            if (cupom.tipo === 'percentual') {
                desconto = valorTotal * (cupom.valor / 100);
                valorFinal = valorTotal - desconto;
            } else if (cupom.tipo === 'fixo') {
                desconto = Math.min(cupom.valor, valorTotal);
                valorFinal = valorTotal - desconto;
            }

            // Utilizar o cupom
            await this.db.utilizarCupom(cupom.id);

            return {
                valido: true,
                cupom: cupom,
                desconto: Math.round(desconto * 100) / 100,
                valor_original: valorTotal,
                valor_final: Math.round(valorFinal * 100) / 100,
                mensagem: `Cupom ${codigo} aplicado com sucesso!`
            };
        } catch (error) {
            console.error('❌ Erro em aplicarCupom:', error);
            return {
                valido: false,
                mensagem: 'Erro ao aplicar cupom'
            };
        }
    }

    /**
     * ============================================
     * SERVIÇOS DE ASSINATURA
     * ============================================
     */

    /**
     * Calcula o valor de uma assinatura
     */
    async calcularAssinatura(plano, periodo = 'monthly') {
        const planos = {
            basico: { monthly: 99.90, quarterly: 269.70, semiannual: 509.40, annual: 958.80 },
            plus: { monthly: 199.90, quarterly: 539.70, semiannual: 1019.40, annual: 1919.04 },
            pro: { monthly: 349.90, quarterly: 944.73, semiannual: 1784.49, annual: 3359.04 },
            enterprise: { monthly: 599.90, quarterly: 1619.73, semiannual: 3059.49, annual: 5759.04 }
        };

        const plan = planos[plano.toLowerCase()];
        if (!plan) return null;

        const valor = plan[periodo] || plan.monthly;
        return {
            plano: plano,
            periodo: periodo,
            valor_mensal: plan.monthly,
            valor_periodo: Math.round(valor * 100) / 100,
            economia: Math.round((plan.monthly * 12 - plan.annual) * 100) / 100
        };
    }

    /**
     * ============================================
     * SERVIÇOS DE REEMBOLSO
     * ============================================
     */

    /**
     * Solicita um reembolso
     */
    async solicitarReembolso(clienteId, tipo, valor, motivo, descricao) {
        try {
            const reembolso = {
                cliente_id: clienteId,
                tipo: tipo,
                valor: valor,
                motivo: motivo,
                descricao: descricao,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            // Registrar no banco
            const resultado = await this.db.createReembolso(reembolso);

            // Registrar auditoria
            await this.db.registrarAuditoria({
                operacao: 'criacao',
                tabela: 'reembolsos',
                depois: JSON.stringify(resultado),
                responsavel: 'Cliente'
            });

            return resultado;
        } catch (error) {
            console.error('❌ Erro em solicitarReembolso:', error);
            throw error;
        }
    }

    /**
     * ============================================
     * SERVIÇOS DE DASHBOARD
     * ============================================
     */

    /**
     * Busca dados para o dashboard
     */
    async getDashboardData() {
        try {
            const cacheKey = 'dashboard_data';
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const dados = await this.db.getDashboardData();
            this.cache.set(cacheKey, dados);

            // Atualizar cache a cada 5 minutos
            setTimeout(() => {
                this.cache.delete(cacheKey);
            }, 300000);

            return dados;
        } catch (error) {
            console.error('❌ Erro em getDashboardData:', error);
            return this.db.getDashboardMock();
        }
    }

    /**
     * ============================================
     * RELATÓRIOS
     * ============================================
     */

    /**
     * Gera relatório de consumo por cliente
     */
    async relatorioConsumoCliente(empresaId = null) {
        try {
            const transacoes = await this.db.getTransacoes({
                empresa_id: empresaId,
                tipo: 'saida'
            });

            const consumo = {};
            transacoes.forEach(t => {
                const key = t.carteira_id;
                if (!consumo[key]) {
                    consumo[key] = { total: 0, transacoes: [] };
                }
                consumo[key].total += t.valor;
                consumo[key].transacoes.push(t);
            });

            return Object.entries(consumo).map(([key, value]) => ({
                carteira_id: key,
                total_consumido: value.total,
                quantidade_transacoes: value.transacoes.length,
                transacoes: value.transacoes
            }));
        } catch (error) {
            console.error('❌ Erro em relatorioConsumoCliente:', error);
            return [];
        }
    }

    /**
     * Gera relatório de faturamento por período
     */
    async relatorioFaturamento(dataInicio, dataFim) {
        try {
            const transacoes = await this.db.getTransacoes({
                tipo: 'entrada',
                data_inicio: dataInicio,
                data_fim: dataFim
            });

            const total = transacoes.reduce((s, t) => s + parseFloat(t.valor || 0), 0);

            return {
                total: Math.round(total * 100) / 100,
                quantidade: transacoes.length,
                transacoes: transacoes,
                periodo: {
                    inicio: dataInicio,
                    fim: dataFim
                }
            };
        } catch (error) {
            console.error('❌ Erro em relatorioFaturamento:', error);
            return null;
        }
    }

    /**
     * ============================================
     * VALIDAÇÕES
     * ============================================
     */

    /**
     * Valida se um cliente tem saldo suficiente
     */
    async validarSaldo(carteiraId, quantidade) {
        try {
            const saldo = await this.getSaldoCarteira(carteiraId);
            if (!saldo) return false;

            return (saldo.disponivel || 0) >= quantidade;
        } catch (error) {
            console.error('❌ Erro em validarSaldo:', error);
            return false;
        }
    }

    /**
     * Valida se uma transação pode ser realizada
     */
    async validarTransacao(carteiraId, quantidade, tipo = 'saida') {
        if (tipo === 'entrada') {
            return { valido: true, mensagem: 'Transação válida' };
        }

        const temSaldo = await this.validarSaldo(carteiraId, quantidade);
        if (!temSaldo) {
            return {
                valido: false,
                mensagem: 'Saldo insuficiente para esta transação'
            };
        }

        return { valido: true, mensagem: 'Transação válida' };
    }

    /**
     * ============================================
     * LIMPEZA DE CACHE
     * ============================================
     */

    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache do FinanceiroService limpo');
    }

    invalidateCache(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}

// ============================================
// EXPORTAÇÃO
// ============================================

if (typeof window !== 'undefined') {
    window.FinanceiroService = FinanceiroService;
    window.financeiroService = new FinanceiroService();
    console.log('✅ FinanceiroService carregado com sucesso!');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinanceiroService;
}
