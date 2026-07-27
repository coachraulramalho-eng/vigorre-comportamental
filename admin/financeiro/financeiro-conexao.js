/**
 * ============================================
 * VIGORRE ONE™ - CENTRO FINANCEIRO
 * CONEXÃO COMPLETA COM SUPABASE
 * ============================================
 * 
 * TABELAS CRIADAS NO SUPABASE:
 * ✅ carteiras
 * ✅ transacoes
 * ✅ precos
 * ✅ cupons
 * ✅ assinaturas
 * ✅ reembolsos
 * ✅ auditoria
 * ✅ configuracoes
 * ✅ notificacoes
 * 
 * VIEWS CRIADAS:
 * ✅ vw_resumo_carteiras
 * ✅ vw_faturamento_diario
 * ✅ vw_top_clientes
 * ============================================
 */

// ============================================
// CONFIGURAÇÕES - SUAS CREDENCIAIS
// ============================================

const SUPABASE_URL = 'https://dfthdcnaqmqswidwgezj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdGhkY25hcW1xc3dpZHdnZXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDU3MDksImV4cCI6MjA5NTAyMTcwOX0.ysTxq3RLw6E-7HrKsvAN2DGoTRYNNCVHXYKG0y6aFIQ';

// ============================================
// INICIALIZAÇÃO
// ============================================

let supabaseClient = null;

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase Financeiro conectado!');
        console.log('📌 URL:', SUPABASE_URL);
        testarConexao();
        return supabaseClient;
    } else {
        console.warn('⚠️ Supabase não carregado');
        return null;
    }
}

function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = initSupabase();
    }
    return supabaseClient;
}

async function testarConexao() {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        const { data, error } = await client.from('carteiras').select('count', { count: 'exact', head: true });
        if (error) {
            console.warn('⚠️ Erro no teste de conexão:', error.message);
        } else {
            console.log('✅ Conexão com Supabase testada com sucesso!');
        }
    } catch (e) {
        console.warn('⚠️ Erro no teste:', e.message);
    }
}

// ============================================
// SERVIÇO DE CARTEIRAS
// ============================================

const CarteirasService = {
    /**
     * Busca todas as carteiras
     */
    async getAll(filtros = {}) {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            let query = client.from('carteiras').select('*');

            if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
            if (filtros.status) query = query.eq('status', filtros.status);
            if (filtros.usuario_id) query = query.eq('usuario_id', filtros.usuario_id);
            if (filtros.empresa_id) query = query.eq('empresa_id', filtros.empresa_id);

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em CarteirasService.getAll:', error);
            return [];
        }
    },

    /**
     * Busca uma carteira por ID
     */
    async getById(id) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('carteiras')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em CarteirasService.getById:', error);
            return null;
        }
    },

    /**
     * Cria uma nova carteira
     */
    async create(carteira) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const dados = {
                nome: carteira.nome,
                tipo: carteira.tipo || 'pessoa',
                usuario_id: carteira.usuario_id || null,
                empresa_id: carteira.empresa_id || null,
                consultor_id: carteira.consultor_id || null,
                saldo: carteira.saldo || 0,
                saldo_reservado: carteira.saldo_reservado || 0,
                creditos_bonus: carteira.creditos_bonus || 0,
                creditos_promocionais: carteira.creditos_promocionais || 0,
                validade: carteira.validade || null,
                status: carteira.status || 'active'
            };

            const { data, error } = await client
                .from('carteiras')
                .insert([dados])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em CarteirasService.create:', error);
            return null;
        }
    },

    /**
     * Atualiza uma carteira
     */
    async update(id, dados) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('carteiras')
                .update(dados)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em CarteirasService.update:', error);
            return null;
        }
    },

    /**
     * Adiciona créditos a uma carteira
     */
    async addCredits(id, quantidade, motivo = 'Adição manual', responsavel = 'Sistema') {
        const carteira = await this.getById(id);
        if (!carteira) throw new Error('Carteira não encontrada');

        const saldoAntes = carteira.saldo || 0;
        const saldoDepois = saldoAntes + quantidade;

        await this.update(id, { saldo: saldoDepois });

        // Registrar transação
        await TransacoesService.create({
            carteira_id: id,
            tipo: 'entrada',
            descricao: motivo,
            valor: quantidade,
            saldo_antes: saldoAntes,
            saldo_depois: saldoDepois,
            documento: `ADD-${Date.now()}`,
            responsavel: responsavel
        });

        return {
            carteira_id: id,
            saldo_anterior: saldoAntes,
            saldo_atual: saldoDepois,
            quantidade: quantidade
        };
    },

    /**
     * Remove créditos de uma carteira (consumo)
     */
    async removeCredits(id, quantidade, motivo = 'Consumo', responsavel = 'Sistema') {
        const carteira = await this.getById(id);
        if (!carteira) throw new Error('Carteira não encontrada');

        const saldoAntes = carteira.saldo || 0;
        if (saldoAntes < quantidade) throw new Error('Saldo insuficiente');

        const saldoDepois = saldoAntes - quantidade;

        await this.update(id, { saldo: saldoDepois });

        await TransacoesService.create({
            carteira_id: id,
            tipo: 'saida',
            descricao: motivo,
            valor: quantidade,
            saldo_antes: saldoAntes,
            saldo_depois: saldoDepois,
            documento: `CON-${Date.now()}`,
            responsavel: responsavel
        });

        return {
            carteira_id: id,
            saldo_anterior: saldoAntes,
            saldo_atual: saldoDepois,
            quantidade: quantidade
        };
    },

    /**
     * Busca saldo de uma carteira
     */
    async getSaldo(id) {
        const carteira = await this.getById(id);
        if (!carteira) return null;

        return {
            saldo: carteira.saldo || 0,
            reservado: carteira.saldo_reservado || 0,
            disponivel: (carteira.saldo || 0) - (carteira.saldo_reservado || 0),
            bonus: carteira.creditos_bonus || 0,
            promocional: carteira.creditos_promocionais || 0,
            validade: carteira.validade || null
        };
    },

    /**
     * Busca resumo das carteiras (via view)
     */
    async getResumo() {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            const { data, error } = await client
                .from('vw_resumo_carteiras')
                .select('*');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em CarteirasService.getResumo:', error);
            return [];
        }
    },

    /**
     * Busca top clientes (via view)
     */
    async getTopClientes(limite = 10) {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            const { data, error } = await client
                .from('vw_top_clientes')
                .select('*')
                .limit(limite);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em CarteirasService.getTopClientes:', error);
            return [];
        }
    }
};

// ============================================
// SERVIÇO DE TRANSAÇÕES
// ============================================

const TransacoesService = {
    /**
     * Busca todas as transações
     */
    async getAll(filtros = {}) {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            let query = client.from('transacoes').select('*');

            if (filtros.carteira_id) query = query.eq('carteira_id', filtros.carteira_id);
            if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
            if (filtros.usuario_id) query = query.eq('usuario_id', filtros.usuario_id);
            if (filtros.data_inicio) query = query.gte('created_at', filtros.data_inicio);
            if (filtros.data_fim) query = query.lte('created_at', filtros.data_fim + 'T23:59:59');

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(filtros.limite || 1000);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em TransacoesService.getAll:', error);
            return [];
        }
    },

    /**
     * Cria uma nova transação
     */
    async create(transacao) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const dados = {
                carteira_id: transacao.carteira_id,
                usuario_id: transacao.usuario_id || null,
                empresa_id: transacao.empresa_id || null,
                consultor_id: transacao.consultor_id || null,
                tipo: transacao.tipo || 'entrada',
                descricao: transacao.descricao || 'Transação',
                valor: transacao.valor || 0,
                disc: transacao.disc || 0,
                ie: transacao.ie || 0,
                valores: transacao.valores || 0,
                saldo_antes: transacao.saldo_antes || 0,
                saldo_depois: transacao.saldo_depois || 0,
                documento: transacao.documento || null,
                responsavel: transacao.responsavel || 'Sistema'
            };

            const { data, error } = await client
                .from('transacoes')
                .insert([dados])
                .select()
                .single();

            if (error) throw error;

            // Registrar auditoria
            await AuditoriaService.create({
                operacao: 'criacao',
                tabela: 'transacoes',
                depois: JSON.stringify(data),
                responsavel: transacao.responsavel || 'Sistema'
            });

            return data;
        } catch (error) {
            console.error('❌ Erro em TransacoesService.create:', error);
            return null;
        }
    },

    /**
     * Busca faturamento diário (via view)
     */
    async getFaturamentoDiario(limite = 30) {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            const { data, error } = await client
                .from('vw_faturamento_diario')
                .select('*')
                .limit(limite);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em TransacoesService.getFaturamentoDiario:', error);
            return [];
        }
    },

    /**
     * Calcula totais de faturamento
     */
    async getTotais() {
        const client = getSupabaseClient();
        if (!client) return { entradas: 0, saidas: 0, saldo: 0 };

        try {
            const hoje = new Date().toISOString().split('T')[0];
            const mesInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

            // Faturamento do dia
            const { data: hojeData } = await client
                .from('transacoes')
                .select('valor')
                .eq('tipo', 'entrada')
                .gte('created_at', hoje);

            // Faturamento do mês
            const { data: mesData } = await client
                .from('transacoes')
                .select('valor')
                .eq('tipo', 'entrada')
                .gte('created_at', mesInicio);

            // Total de transações
            const { count: totalTransacoes } = await client
                .from('transacoes')
                .select('*', { count: 'exact', head: true });

            const totalHoje = hojeData ? hojeData.reduce((s, t) => s + (t.valor || 0), 0) : 0;
            const totalMes = mesData ? mesData.reduce((s, t) => s + (t.valor || 0), 0) : 0;

            return {
                faturamento_hoje: totalHoje,
                faturamento_mes: totalMes,
                total_transacoes: totalTransacoes || 0
            };
        } catch (error) {
            console.error('❌ Erro em TransacoesService.getTotais:', error);
            return { entradas: 0, saidas: 0, saldo: 0 };
        }
    }
};

// ============================================
// SERVIÇO DE PREÇOS
// ============================================

const PrecosService = {
    async getAll() {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            const { data, error } = await client
                .from('precos')
                .select('*')
                .order('produto');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em PrecosService.getAll:', error);
            return [];
        }
    },

    async getByTipo(tipo) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('precos')
                .select('*')
                .eq('tipo', tipo)
                .eq('status', 'active')
                .single();

            if (error) return null;
            return data;
        } catch (error) {
            console.error('❌ Erro em PrecosService.getByTipo:', error);
            return null;
        }
    },

    async update(id, dados) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('precos')
                .update(dados)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em PrecosService.update:', error);
            return null;
        }
    }
};

// ============================================
// SERVIÇO DE CUPONS
// ============================================

const CuponsService = {
    async getAll(filtros = {}) {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            let query = client.from('cupons').select('*');

            if (filtros.status) query = query.eq('status', filtros.status);
            if (filtros.tipo) query = query.eq('tipo', filtros.tipo);

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em CuponsService.getAll:', error);
            return [];
        }
    },

    async getByCodigo(codigo) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('cupons')
                .select('*')
                .eq('codigo', codigo)
                .single();

            if (error) return null;
            return data;
        } catch (error) {
            console.error('❌ Erro em CuponsService.getByCodigo:', error);
            return null;
        }
    },

    async validar(codigo) {
        const cupom = await this.getByCodigo(codigo);
        if (!cupom) return null;

        if (cupom.status !== 'active') return null;
        if (cupom.validade && new Date(cupom.validade) < new Date()) return null;
        if (cupom.usos_limite && cupom.usos_atual >= cupom.usos_limite) return null;

        return cupom;
    },

    async usar(id) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const cupom = await this.getById(id);
            if (!cupom) return null;

            const novoUso = (cupom.usos_atual || 0) + 1;

            const { data, error } = await client
                .from('cupons')
                .update({ usos_atual: novoUso })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em CuponsService.usar:', error);
            return null;
        }
    },

    async getById(id) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('cupons')
                .select('*')
                .eq('id', id)
                .single();

            if (error) return null;
            return data;
        } catch (error) {
            console.error('❌ Erro em CuponsService.getById:', error);
            return null;
        }
    },

    async create(cupom) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const dados = {
                codigo: cupom.codigo.toUpperCase(),
                descricao: cupom.descricao || '',
                tipo: cupom.tipo || 'percentual',
                valor: cupom.valor || 0,
                validade: cupom.validade || null,
                usos_limite: cupom.usos_limite || null,
                usos_atual: 0,
                status: cupom.status || 'active'
            };

            const { data, error } = await client
                .from('cupons')
                .insert([dados])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em CuponsService.create:', error);
            return null;
        }
    }
};

// ============================================
// SERVIÇO DE ASSINATURAS
// ============================================

const AssinaturasService = {
    async getAll(filtros = {}) {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            let query = client.from('assinaturas').select('*');

            if (filtros.cliente_id) query = query.eq('cliente_id', filtros.cliente_id);
            if (filtros.status) query = query.eq('status', filtros.status);
            if (filtros.plano) query = query.eq('plano', filtros.plano);

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em AssinaturasService.getAll:', error);
            return [];
        }
    },

    async create(assinatura) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const dados = {
                cliente_id: assinatura.cliente_id,
                cliente_tipo: assinatura.cliente_tipo || 'empresa',
                plano: assinatura.plano,
                valor: assinatura.valor || 0,
                data_inicio: assinatura.data_inicio,
                data_vencimento: assinatura.data_vencimento,
                periodo: assinatura.periodo || 'monthly',
                status: assinatura.status || 'active',
                desconto: assinatura.desconto || 0,
                cupom_id: assinatura.cupom_id || null
            };

            const { data, error } = await client
                .from('assinaturas')
                .insert([dados])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em AssinaturasService.create:', error);
            return null;
        }
    },

    async update(id, dados) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('assinaturas')
                .update(dados)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em AssinaturasService.update:', error);
            return null;
        }
    }
};

// ============================================
// SERVIÇO DE REEMBOLSOS
// ============================================

const ReembolsosService = {
    async getAll(filtros = {}) {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            let query = client.from('reembolsos').select('*');

            if (filtros.cliente_id) query = query.eq('cliente_id', filtros.cliente_id);
            if (filtros.status) query = query.eq('status', filtros.status);
            if (filtros.tipo) query = query.eq('tipo', filtros.tipo);

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em ReembolsosService.getAll:', error);
            return [];
        }
    },

    async create(reembolso) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const dados = {
                cliente_id: reembolso.cliente_id,
                cliente_tipo: reembolso.cliente_tipo || 'empresa',
                tipo: reembolso.tipo || 'credito',
                valor: reembolso.valor || 0,
                motivo: reembolso.motivo || 'outro',
                descricao: reembolso.descricao || '',
                observacao: reembolso.observacao || '',
                status: 'pending'
            };

            const { data, error } = await client
                .from('reembolsos')
                .insert([dados])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em ReembolsosService.create:', error);
            return null;
        }
    },

    async updateStatus(id, status, observacao = '', responsavel = 'Sistema') {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('reembolsos')
                .update({ status, observacao })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Registrar auditoria
            await AuditoriaService.create({
                operacao: 'edicao',
                tabela: 'reembolsos',
                depois: JSON.stringify(data),
                responsavel: responsavel
            });

            return data;
        } catch (error) {
            console.error('❌ Erro em ReembolsosService.updateStatus:', error);
            return null;
        }
    }
};

// ============================================
// SERVIÇO DE AUDITORIA
// ============================================

const AuditoriaService = {
    async create(dados) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const registro = {
                ip: dados.ip || '0.0.0.0',
                usuario_id: dados.usuario_id || null,
                usuario_nome: dados.usuario_nome || dados.responsavel || 'Sistema',
                empresa_id: dados.empresa_id || null,
                operacao: dados.operacao || 'acesso',
                tabela: dados.tabela || 'unknown',
                antes: dados.antes || null,
                depois: dados.depois || null,
                responsavel: dados.responsavel || 'Sistema'
            };

            const { data, error } = await client
                .from('auditoria')
                .insert([registro])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em AuditoriaService.create:', error);
            return null;
        }
    },

    async getAll(filtros = {}) {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            let query = client.from('auditoria').select('*');

            if (filtros.operacao) query = query.eq('operacao', filtros.operacao);
            if (filtros.tabela) query = query.eq('tabela', filtros.tabela);
            if (filtros.usuario_id) query = query.eq('usuario_id', filtros.usuario_id);
            if (filtros.data_inicio) query = query.gte('created_at', filtros.data_inicio);
            if (filtros.data_fim) query = query.lte('created_at', filtros.data_fim + 'T23:59:59');

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(filtros.limite || 1000);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em AuditoriaService.getAll:', error);
            return [];
        }
    }
};

// ============================================
// SERVIÇO DE CONFIGURAÇÕES
// ============================================

const ConfiguracoesService = {
    async get(chave) {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('configuracoes')
                .select('valor')
                .eq('chave', chave)
                .single();

            if (error) return null;
            return data?.valor || null;
        } catch (error) {
            console.error('❌ Erro em ConfiguracoesService.get:', error);
            return null;
        }
    },

    async set(chave, valor, descricao = '') {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
            const { data, error } = await client
                .from('configuracoes')
                .upsert({ chave, valor, descricao })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Erro em ConfiguracoesService.set:', error);
            return null;
        }
    },

    async getAll() {
        const client = getSupabaseClient();
        if (!client) return [];

        try {
            const { data, error } = await client
                .from('configuracoes')
                .select('*');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Erro em ConfiguracoesService.getAll:', error);
            return [];
        }
    }
};

// ============================================
// EXPORTAÇÃO GLOBAL
// ============================================

if (typeof window !== 'undefined') {
    window.VigorreFinanceiro = {
        // Inicialização
        initSupabase,
        getSupabaseClient,
        testarConexao,

        // Serviços
        Carteiras: CarteirasService,
        Transacoes: TransacoesService,
        Precos: PrecosService,
        Cupons: CuponsService,
        Assinaturas: AssinaturasService,
        Reembolsos: ReembolsosService,
        Auditoria: AuditoriaService,
        Configuracoes: ConfiguracoesService,

        // Constantes
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    };

    // Inicializar automaticamente
    initSupabase();

    console.log('✅ VIGORRE Financeiro - Conectado com sucesso!');
    console.log('📌 Use window.VigorreFinanceiro para acessar os serviços');
}

// ============================================
// FIM
// ============================================
