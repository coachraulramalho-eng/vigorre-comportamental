/**
 * ============================================
 * VIGORRE ONE™ - CENTRO FINANCEIRO
 * SERVIÇOS DE NEGÓCIO
 * ============================================
 */

class FinanceiroService {
    constructor() {
        this.db = null;
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutos

        if (typeof window !== 'undefined' && window.FinanceiroDB) {
            this.db = window.FinanceiroDB;
            console.log('💰 FinanceiroService conectado ao FinanceiroDB');
        } else {
            console.warn('⚠️ FinanceiroDB não encontrado, usando fallback');
            this.db = null;
        }
    }

    getCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (item.expiry && item.expiry < Date.now()) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    setCache(key, value, ttl = this.cacheTimeout) {
        this.cache.set(key, {
            value: value,
            expiry: Date.now() + ttl
        });
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
        console.log(`🗑️ Cache limpo${pattern ? ` (padrão: ${pattern})` : ''}`);
    }

    // ============================================
    // SERVIÇOS DE CARTEIRA
    // ============================================

    async getCarteiras(filtros = {}) {
        try {
            const cacheKey = `carteiras_${JSON.stringify(filtros)}`;
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            let dados;
            if (this.db) {
                dados = await this.db.getCarteiras(filtros);
            } else {
                dados = this.getCarteirasMock();
            }

            this.setCache(cacheKey, dados);
            return dados;
        } catch (error) {
            console.error('❌ Erro em getCarteiras:', error);
            return this.getCarteirasMock();
        }
    }

    async getCarteiraById(id) {
        if (!id) return null;

        try {
            const cacheKey = `carteira_${id}`;
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            let dados;
            if (this.db) {
                dados = await this.db.getCarteiraById(id);
            } else {
                dados = this.getCarteirasMock().find(c => c.id === id) || null;
            }

            if (dados) {
                this.setCache(cacheKey, dados);
            }
            return dados;
        } catch (error) {
            console.error('❌ Erro em getCarteiraById:', error);
            return null;
        }
    }

    async getSaldoCarteira(carteiraId) {
        try {
            const cacheKey = `saldo_${carteiraId}`;
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            let carteira;
            if (this.db) {
                carteira = await this.db.getCarteiraById(carteiraId);
            } else {
                carteira = this.getCarteirasMock().find(c => c.id === carteiraId);
            }

            if (!carteira) return null;

            const saldo = {
                saldo: carteira.saldo || 0,
                reservado: carteira.saldo_reservado || 0,
                disponivel: (carteira.saldo || 0) - (carteira.saldo_reservado || 0),
                bonus: carteira.creditos_bonus || 0,
                promocional: carteira.creditos_promocionais || 0,
                validade: carteira.validade || null
            };

            this.setCache(cacheKey, saldo, 60000);
            return saldo;
        } catch (error) {
            console.error('❌ Erro em getSaldoCarteira:', error);
            return null;
        }
    }

    async adicionarCreditos(carteiraId, quantidade, tipo = 'normal', motivo = 'compra', observacao = '', responsavel = 'Sistema') {
        try {
            if (!this.db) {
                throw new Error('Banco de dados não disponível');
            }

            const carteira = await this.db.getCarteiraById(carteiraId);
            if (!carteira) {
                throw new Error('Carteira não encontrada');
            }

            const saldoAntes = carteira.saldo || 0;
            const novoSaldo = saldoAntes + quantidade;

            const atualizada = await this.db.updateCarteira(carteiraId, {
                saldo: novoSaldo,
                responsavel: responsavel
            });

            const transacao = await this.db.createTransacao({
                carteira_id: carteiraId,
                usuario_id: carteira.usuario_id,
                empresa_id: carteira.empresa_id,
                consultor_id: carteira.consultor_id,
                tipo: 'entrada',
                descricao: `${motivo}: ${quantidade} créditos`,
                valor: quantidade,
                saldo_antes: saldoAntes,
                saldo_depois: novoSaldo,
                documento: `ADD-${Date.now()}`,
                responsavel: responsavel
            });

            this.clearCache(`carteira_${carteiraId}`);
            this.clearCache(`saldo_${carteiraId}`);
            this.clearCache('carteiras');

            return {
                carteira: atualizada,
                transacao: transacao,
                saldo_anterior: saldoAntes,
                saldo_atual: novoSaldo,
                quantidade_adicionada: quantidade
            };
        } catch (error) {
            console.error('❌ Erro em adicionarCreditos:', error);
            throw error;
        }
    }

    async consumirCreditos(carteiraId, quantidade, motivo = 'consumo', observacao = '', responsavel = 'Sistema') {
        try {
            if (!this.db) {
                throw new Error('Banco de dados não disponível');
            }

            const carteira = await this.db.getCarteiraById(carteiraId);
            if (!carteira) {
                throw new Error('Carteira não encontrada');
            }

            const saldoAntes = carteira.saldo || 0;
            if (saldoAntes < quantidade) {
                throw new Error('Saldo insuficiente para esta operação');
            }

            const novoSaldo = saldoAntes - quantidade;

            const atualizada = await this.db.updateCarteira(carteiraId, {
                saldo: novoSaldo,
                responsavel: responsavel
            });

            const transacao = await this.db.createTransacao({
                carteira_id: carteiraId,
                usuario_id: carteira.usuario_id,
                empresa_id: carteira.empresa_id,
                consultor_id: carteira.consultor_id,
                tipo: 'saida',
                descricao: `${motivo}: ${quantidade} créditos`,
                valor: quantidade,
                saldo_antes: saldoAntes,
                saldo_depois: novoSaldo,
                documento: `CON-${Date.now()}`,
                responsavel: responsavel
            });

            this.clearCache(`carteira_${carteiraId}`);
            this.clearCache(`saldo_${carteiraId}`);
            this.clearCache('carteiras');

            return {
                carteira: atualizada,
                transacao: transacao,
                saldo_anterior: saldoAntes,
                saldo_atual: novoSaldo,
                quantidade_consumida: quantidade
            };
        } catch (error) {
            console.error('❌ Erro em consumirCreditos:', error);
            throw error;
        }
    }

    // ============================================
    // SERVIÇOS DE CUPONS
    // ============================================

    async validarCupom(codigo) {
        if (!codigo) return null;

        try {
            const cacheKey = `cupom_${codigo}`;
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            let cupom;
            if (this.db) {
                cupom = await this.db.validarCupom(codigo);
            } else {
                cupom = this.getCuponsMock().find(c => c.codigo === codigo && c.status === 'active') || null;
            }

            if (cupom) {
                this.setCache(cacheKey, cupom, 60000);
            }
            return cupom;
        } catch (error) {
            console.error('❌ Erro em validarCupom:', error);
            return null;
        }
    }

    async aplicarCupom(codigo, valorTotal) {
        try {
            const cupom = await this.validarCupom(codigo);
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
                valorFinal = Math.max(0, valorTotal - desconto);
            } else if (cupom.tipo === 'fixo') {
                desconto = Math.min(cupom.valor, valorTotal);
                valorFinal = Math.max(0, valorTotal - desconto);
            }

            if (this.db) {
                await this.db.utilizarCupom(cupom.id);
            }

            this.clearCache(`cupom_${codigo}`);

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

    // ============================================
    // SERVIÇOS DE ASSINATURA
    // ============================================

    calcularAssinatura(plano, periodo = 'monthly') {
        const planos = {
            basico: { monthly: 99.90, quarterly: 269.70, semiannual: 509.40, annual: 958.80 },
            plus: { monthly: 199.90, quarterly: 539.70, semiannual: 1019.40, annual: 1919.04 },
            pro: { monthly: 349.90, quarterly: 944.73, semiannual: 1784.49, annual: 3359.04 },
            enterprise: { monthly: 599.90, quarterly: 1619.73, semiannual: 3059.49, annual: 5759.04 }
        };

        const plan = planos[plano.toLowerCase()];
        if (!plan) return null;

        const valor = plan[periodo] || plan.monthly;
        const economia = plan.annual ? Math.round((plan.monthly * 12 - plan.annual) * 100) / 100 : 0;

        return {
            plano: plano,
            periodo: periodo,
            valor_mensal: plan.monthly,
            valor_periodo: Math.round(valor * 100) / 100,
            economia: economia,
            percentual_economia: plan.annual ? Math.round((economia / (plan.monthly * 12)) * 100) : 0
        };
    }

    // ============================================
    // SERVIÇOS DE REEMBOLSO
    // ============================================

    async solicitarReembolso(clienteId, clienteTipo, tipo, valor, motivo, descricao, responsavel = 'Cliente') {
        try {
            if (!this.db) {
                throw new Error('Banco de dados não disponível');
            }

            const reembolso = await this.db.createReembolso({
                cliente_id: clienteId,
                cliente_tipo: clienteTipo || 'empresa',
                tipo: tipo || 'credito',
                valor: valor,
                motivo: motivo || 'outro',
                descricao: descricao || '',
                responsavel: responsavel
            });

            this.clearCache('reembolsos');
            return reembolso;
        } catch (error) {
            console.error('❌ Erro em solicitarReembolso:', error);
            throw error;
        }
    }

    // ============================================
    // SERVIÇOS DE DASHBOARD
    // ============================================

    async getDashboardData() {
        try {
            const cacheKey = 'dashboard_data';
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            let dados;
            if (this.db) {
                dados = await this.db.getDashboardData();
            } else {
                dados = this.getDashboardMock();
            }

            if (dados) {
                dados.meta_mes = 50000;
                dados.percentual_meta = Math.round((dados.faturamento_mes / dados.meta_mes) * 100);
                dados.variacao_dia = dados.faturamento_hoje > 0 ? '+18%' : '+0%';
            }

            this.setCache(cacheKey, dados, 300000);
            return dados;
        } catch (error) {
            console.error('❌ Erro em getDashboardData:', error);
            return this.getDashboardMock();
        }
    }

    // ============================================
    // VALIDAÇÕES
    // ============================================

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

    // ============================================
    // DADOS MOCK
    // ============================================

    getCarteirasMock() {
        return [
            { id: '1', nome: 'TechCorp Solutions', tipo: 'empresa', saldo: 1250, saldo_reservado: 200, creditos_bonus: 50, creditos_promocionais: 0, validade: '2024-12-31' },
            { id: '2', nome: 'InovaLab Brasil', tipo: 'empresa', saldo: 820, saldo_reservado: 100, creditos_bonus: 30, creditos_promocionais: 0, validade: '2024-11-30' },
            { id: '3', nome: 'João Silva', tipo: 'consultor', saldo: 450, saldo_reservado: 50, creditos_bonus: 20, creditos_promocionais: 0, validade: '2024-10-15' },
            { id: '4', nome: 'Maria Santos', tipo: 'consultor', saldo: 280, saldo_reservado: 30, creditos_bonus: 10, creditos_promocionais: 0, validade: '2024-09-30' }
        ];
    }

    getCuponsMock() {
        return [
            { id: '1', codigo: 'PROMO10', descricao: '10% de desconto', tipo: 'percentual', valor: 10, validade: '2024-12-31', usos_limite: 100, usos_atual: 45, status: 'active' },
            { id: '2', codigo: 'BLACK25', descricao: '25% de desconto', tipo: 'percentual', valor: 25, validade: '2024-11-30', usos_limite: 500, usos_atual: 120, status: 'active' }
        ];
    }

    getDashboardMock() {
        return {
            faturamento_hoje: 2580.00,
            faturamento_mes: 42850.00,
            total_carteiras: 45,
            total_transacoes: 1280,
            total_creditos_vendidos: 125000,
            total_laudos: 342,
            meta_mes: 50000,
            percentual_meta: 85,
            variacao_dia: '+18%',
            data_atualizacao: new Date().toISOString()
        };
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
