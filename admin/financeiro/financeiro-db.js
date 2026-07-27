/**
 * ============================================
 * VIGORRE ONE™ - CENTRO FINANCEIRO
 * CONEXÃO COM SUPABASE
 * ============================================
 */

// ============================================
// CONFIGURAÇÕES - JÁ PREENCHIDAS
// ============================================

const SUPABASE_URL = 'https://dfthdcnaqmqswidwgezj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdGhkY25hcW1xc3dpZHdnZXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDU3MDksImV4cCI6MjA5NTAyMTcwOX0.ysTxq3RLw6E-7HrKsvAN2DGoTRYNNCVHXYKG0y6aFIQ';

// ============================================
// INICIALIZAÇÃO
// ============================================

let supabaseClient = null;

/**
 * Inicializa o cliente Supabase
 */
function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase Financeiro inicializado com sucesso!');
        console.log('📌 URL:', SUPABASE_URL);
        return supabaseClient;
    } else {
        console.warn('⚠️ Supabase não carregado, usando mock local');
        return null;
    }
}

/**
 * Obtém o cliente Supabase
 */
function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = initSupabase();
    }
    return supabaseClient;
}

/**
 * Verifica se a conexão está ativa
 */
function isSupabaseConnected() {
    return supabaseClient !== null;
}

// ============================================
// FUNÇÕES CRUD - CARTEIRAS
// ============================================

/**
 * Busca todas as carteiras
 */
async function getCarteiras(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, usando mock');
        return getCarteirasMock();
    }

    try {
        let query = client.from('carteiras').select('*');

        if (filtros.usuario_id) {
            query = query.eq('usuario_id', filtros.usuario_id);
        }
        if (filtros.empresa_id) {
            query = query.eq('empresa_id', filtros.empresa_id);
        }
        if (filtros.consultor_id) {
            query = query.eq('consultor_id', filtros.consultor_id);
        }
        if (filtros.tipo) {
            query = query.eq('tipo', filtros.tipo);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar carteiras:', error);
            return getCarteirasMock();
        }

        return data || [];
    } catch (error) {
        console.error('❌ Erro em getCarteiras:', error);
        return getCarteirasMock();
    }
}

/**
 * Busca uma carteira por ID
 */
async function getCarteiraById(id) {
    if (!id) return null;

    const client = getSupabaseClient();
    if (!client) {
        const mock = getCarteirasMock();
        return mock.find(c => c.id === id) || null;
    }

    try {
        const { data, error } = await client
            .from('carteiras')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('❌ Erro ao buscar carteira:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('❌ Erro em getCarteiraById:', error);
        return null;
    }
}

/**
 * Cria uma nova carteira
 */
async function createCarteira(carteira) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, salvando localmente');
        return { id: 'mock_' + Date.now(), ...carteira };
    }

    try {
        const dados = {
            usuario_id: carteira.usuario_id || null,
            empresa_id: carteira.empresa_id || null,
            consultor_id: carteira.consultor_id || null,
            tipo: carteira.tipo || 'pessoa',
            saldo: carteira.saldo || 0,
            saldo_reservado: carteira.saldo_reservado || 0,
            creditos_bonus: carteira.creditos_bonus || 0,
            creditos_promocionais: carteira.creditos_promocionais || 0,
            validade: carteira.validade || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await client
            .from('carteiras')
            .insert([dados])
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao criar carteira:', error);
            throw error;
        }

        await registrarAuditoria({
            operacao: 'criacao',
            tabela: 'carteiras',
            depois: JSON.stringify(data),
            responsavel: carteira.responsavel || 'Sistema'
        });

        return data;
    } catch (error) {
        console.error('❌ Erro em createCarteira:', error);
        throw error;
    }
}

/**
 * Atualiza uma carteira
 */
async function updateCarteira(id, dados) {
    if (!id) throw new Error('ID da carteira é obrigatório');

    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, atualizando localmente');
        return { id, ...dados };
    }

    try {
        const antigo = await getCarteiraById(id);

        const dadosAtualizados = {
            ...dados,
            updated_at: new Date().toISOString()
        };

        delete dadosAtualizados.id;
        delete dadosAtualizados.created_at;
        delete dadosAtualizados.responsavel;

        const { data, error } = await client
            .from('carteiras')
            .update(dadosAtualizados)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao atualizar carteira:', error);
            throw error;
        }

        await registrarAuditoria({
            operacao: 'edicao',
            tabela: 'carteiras',
            antes: JSON.stringify(antigo),
            depois: JSON.stringify(data),
            responsavel: dados.responsavel || 'Sistema'
        });

        return data;
    } catch (error) {
        console.error('❌ Erro em updateCarteira:', error);
        throw error;
    }
}

/**
 * Adiciona saldo a uma carteira
 */
async function addSaldoCarteira(id, quantidade, motivo = 'Adição manual', responsavel = 'Sistema') {
    if (!id) throw new Error('ID da carteira é obrigatório');
    if (!quantidade || quantidade <= 0) throw new Error('Quantidade deve ser maior que zero');

    const carteira = await getCarteiraById(id);
    if (!carteira) throw new Error('Carteira não encontrada');

    const saldoAntes = carteira.saldo || 0;
    const saldoDepois = saldoAntes + quantidade;

    const atualizada = await updateCarteira(id, {
        saldo: saldoDepois,
        responsavel: responsavel
    });

    await createTransacao({
        carteira_id: id,
        usuario_id: carteira.usuario_id,
        empresa_id: carteira.empresa_id,
        consultor_id: carteira.consultor_id,
        tipo: 'entrada',
        descricao: motivo,
        valor: quantidade,
        saldo_antes: saldoAntes,
        saldo_depois: saldoDepois,
        documento: `ADD-${Date.now()}`,
        responsavel: responsavel
    });

    return {
        carteira: atualizada,
        saldo_anterior: saldoAntes,
        saldo_atual: saldoDepois,
        quantidade_adicionada: quantidade
    };
}

/**
 * Remove saldo de uma carteira (consumo)
 */
async function removeSaldoCarteira(id, quantidade, motivo = 'Consumo', responsavel = 'Sistema') {
    if (!id) throw new Error('ID da carteira é obrigatório');
    if (!quantidade || quantidade <= 0) throw new Error('Quantidade deve ser maior que zero');

    const carteira = await getCarteiraById(id);
    if (!carteira) throw new Error('Carteira não encontrada');

    const saldoAntes = carteira.saldo || 0;
    if (saldoAntes < quantidade) {
        throw new Error('Saldo insuficiente para esta operação');
    }

    const saldoDepois = saldoAntes - quantidade;

    const atualizada = await updateCarteira(id, {
        saldo: saldoDepois,
        responsavel: responsavel
    });

    await createTransacao({
        carteira_id: id,
        usuario_id: carteira.usuario_id,
        empresa_id: carteira.empresa_id,
        consultor_id: carteira.consultor_id,
        tipo: 'saida',
        descricao: motivo,
        valor: quantidade,
        saldo_antes: saldoAntes,
        saldo_depois: saldoDepois,
        documento: `CON-${Date.now()}`,
        responsavel: responsavel
    });

    return {
        carteira: atualizada,
        saldo_anterior: saldoAntes,
        saldo_atual: saldoDepois,
        quantidade_removida: quantidade
    };
}

// ============================================
// FUNÇÕES CRUD - TRANSAÇÕES
// ============================================

/**
 * Busca transações com filtros
 */
async function getTransacoes(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, usando mock');
        return getTransacoesMock();
    }

    try {
        let query = client.from('transacoes').select('*');

        if (filtros.carteira_id) {
            query = query.eq('carteira_id', filtros.carteira_id);
        }
        if (filtros.usuario_id) {
            query = query.eq('usuario_id', filtros.usuario_id);
        }
        if (filtros.empresa_id) {
            query = query.eq('empresa_id', filtros.empresa_id);
        }
        if (filtros.consultor_id) {
            query = query.eq('consultor_id', filtros.consultor_id);
        }
        if (filtros.tipo) {
            query = query.eq('tipo', filtros.tipo);
        }
        if (filtros.data_inicio) {
            query = query.gte('created_at', filtros.data_inicio);
        }
        if (filtros.data_fim) {
            query = query.lte('created_at', filtros.data_fim + 'T23:59:59');
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(filtros.limite || 1000);

        if (error) {
            console.error('❌ Erro ao buscar transações:', error);
            return getTransacoesMock();
        }

        return data || [];
    } catch (error) {
        console.error('❌ Erro em getTransacoes:', error);
        return getTransacoesMock();
    }
}

/**
 * Cria uma nova transação
 */
async function createTransacao(transacao) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, salvando localmente');
        return { id: 'mock_' + Date.now(), ...transacao };
    }

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
            responsavel: transacao.responsavel || 'Sistema',
            created_at: new Date().toISOString()
        };

        const { data, error } = await client
            .from('transacoes')
            .insert([dados])
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao criar transação:', error);
            throw error;
        }

        await registrarAuditoria({
            operacao: 'criacao',
            tabela: 'transacoes',
            depois: JSON.stringify(data),
            responsavel: transacao.responsavel || 'Sistema'
        });

        return data;
    } catch (error) {
        console.error('❌ Erro em createTransacao:', error);
        throw error;
    }
}

// ============================================
// FUNÇÕES CRUD - PREÇOS
// ============================================

/**
 * Busca todos os preços
 */
async function getPrecos(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, usando mock');
        return getPrecosMock();
    }

    try {
        let query = client.from('precos').select('*');

        if (filtros.status) {
            query = query.eq('status', filtros.status);
        }
        if (filtros.tipo) {
            query = query.eq('tipo', filtros.tipo);
        }

        const { data, error } = await query.order('produto');

        if (error) {
            console.error('❌ Erro ao buscar preços:', error);
            return getPrecosMock();
        }

        return data || [];
    } catch (error) {
        console.error('❌ Erro em getPrecos:', error);
        return getPrecosMock();
    }
}

/**
 * Busca um preço por tipo
 */
async function getPrecoByTipo(tipo) {
    if (!tipo) return null;

    const client = getSupabaseClient();
    if (!client) {
        const mock = getPrecosMock();
        return mock.find(p => p.tipo === tipo) || null;
    }

    try {
        const { data, error } = await client
            .from('precos')
            .select('*')
            .eq('tipo', tipo)
            .eq('status', 'active')
            .single();

        if (error) {
            console.error('❌ Erro ao buscar preço por tipo:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('❌ Erro em getPrecoByTipo:', error);
        return null;
    }
}

/**
 * Atualiza um preço
 */
async function updatePreco(id, dados) {
    if (!id) throw new Error('ID do preço é obrigatório');

    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, atualizando localmente');
        return { id, ...dados };
    }

    try {
        const antigo = await getPrecoById(id);

        const dadosAtualizados = {
            ...dados,
            updated_at: new Date().toISOString()
        };

        delete dadosAtualizados.id;
        delete dadosAtualizados.created_at;
        delete dadosAtualizados.responsavel;

        const { data, error } = await client
            .from('precos')
            .update(dadosAtualizados)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao atualizar preço:', error);
            throw error;
        }

        await registrarAuditoria({
            operacao: 'edicao',
            tabela: 'precos',
            antes: JSON.stringify(antigo),
            depois: JSON.stringify(data),
            responsavel: dados.responsavel || 'Sistema'
        });

        return data;
    } catch (error) {
        console.error('❌ Erro em updatePreco:', error);
        throw error;
    }
}

// ============================================
// FUNÇÕES CRUD - CUPONS
// ============================================

/**
 * Busca todos os cupons
 */
async function getCupons(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, usando mock');
        return getCuponsMock();
    }

    try {
        let query = client.from('cupons').select('*');

        if (filtros.status) {
            query = query.eq('status', filtros.status);
        }
        if (filtros.tipo) {
            query = query.eq('tipo', filtros.tipo);
        }
        if (filtros.codigo) {
            query = query.eq('codigo', filtros.codigo);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar cupons:', error);
            return getCuponsMock();
        }

        return data || [];
    } catch (error) {
        console.error('❌ Erro em getCupons:', error);
        return getCuponsMock();
    }
}

/**
 * Valida um cupom pelo código
 */
async function validarCupom(codigo) {
    if (!codigo) return null;

    const client = getSupabaseClient();
    if (!client) {
        const mock = getCuponsMock();
        return mock.find(c => c.codigo === codigo && c.status === 'active') || null;
    }

    try {
        const { data, error } = await client
            .from('cupons')
            .select('*')
            .eq('codigo', codigo)
            .eq('status', 'active')
            .single();

        if (error) {
            return null;
        }

        // Verificar validade
        if (data.validade && new Date(data.validade) < new Date()) {
            await updateCupom(data.id, { status: 'expired' });
            return null;
        }

        // Verificar limite de usos
        if (data.usos_limite && data.usos_atual >= data.usos_limite) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('❌ Erro em validarCupom:', error);
        return null;
    }
}

/**
 * Utiliza um cupom
 */
async function utilizarCupom(id) {
    if (!id) throw new Error('ID do cupom é obrigatório');

    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível');
        return null;
    }

    try {
        const cupom = await getCupomById(id);
        if (!cupom) return null;

        const novoUso = (cupom.usos_atual || 0) + 1;

        const { data, error } = await client
            .from('cupons')
            .update({ usos_atual: novoUso, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao utilizar cupom:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('❌ Erro em utilizarCupom:', error);
        return null;
    }
}

// ============================================
// FUNÇÕES CRUD - ASSINATURAS
// ============================================

/**
 * Busca todas as assinaturas
 */
async function getAssinaturas(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, usando mock');
        return getAssinaturasMock();
    }

    try {
        let query = client.from('assinaturas').select('*');

        if (filtros.cliente_id) {
            query = query.eq('cliente_id', filtros.cliente_id);
        }
        if (filtros.status) {
            query = query.eq('status', filtros.status);
        }
        if (filtros.plano) {
            query = query.eq('plano', filtros.plano);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar assinaturas:', error);
            return getAssinaturasMock();
        }

        return data || [];
    } catch (error) {
        console.error('❌ Erro em getAssinaturas:', error);
        return getAssinaturasMock();
    }
}

// ============================================
// FUNÇÕES CRUD - REEMBOLSOS
// ============================================

/**
 * Busca todas as solicitações de reembolso
 */
async function getReembolsos(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, usando mock');
        return getReembolsosMock();
    }

    try {
        let query = client.from('reembolsos').select('*');

        if (filtros.cliente_id) {
            query = query.eq('cliente_id', filtros.cliente_id);
        }
        if (filtros.status) {
            query = query.eq('status', filtros.status);
        }
        if (filtros.tipo) {
            query = query.eq('tipo', filtros.tipo);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar reembolsos:', error);
            return getReembolsosMock();
        }

        return data || [];
    } catch (error) {
        console.error('❌ Erro em getReembolsos:', error);
        return getReembolsosMock();
    }
}

// ============================================
// AUDITORIA
// ============================================

/**
 * Registra uma ação na auditoria
 */
async function registrarAuditoria(dados) {
    const client = getSupabaseClient();
    if (!client) {
        console.log('📝 Auditoria (mock):', dados);
        return { id: 'mock_' + Date.now(), ...dados };
    }

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
            responsavel: dados.responsavel || 'Sistema',
            created_at: new Date().toISOString()
        };

        const { data, error } = await client
            .from('auditoria')
            .insert([registro])
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao registrar auditoria:', error);
            return registro;
        }

        return data;
    } catch (error) {
        console.error('❌ Erro em registrarAuditoria:', error);
        return dados;
    }
}

/**
 * Busca logs de auditoria
 */
async function getAuditoria(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, usando mock');
        return getAuditoriaMock();
    }

    try {
        let query = client.from('auditoria').select('*');

        if (filtros.operacao) {
            query = query.eq('operacao', filtros.operacao);
        }
        if (filtros.tabela) {
            query = query.eq('tabela', filtros.tabela);
        }
        if (filtros.usuario_id) {
            query = query.eq('usuario_id', filtros.usuario_id);
        }
        if (filtros.data_inicio) {
            query = query.gte('created_at', filtros.data_inicio);
        }
        if (filtros.data_fim) {
            query = query.lte('created_at', filtros.data_fim + 'T23:59:59');
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(filtros.limite || 1000);

        if (error) {
            console.error('❌ Erro ao buscar auditoria:', error);
            return getAuditoriaMock();
        }

        return data || [];
    } catch (error) {
        console.error('❌ Erro em getAuditoria:', error);
        return getAuditoriaMock();
    }
}

// ============================================
// DASHBOARD - KPIs
// ============================================

/**
 * Busca dados para o dashboard executivo
 */
async function getDashboardData(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, usando mock');
        return getDashboardMock();
    }

    try {
        const hoje = new Date();
        const dataHoje = hoje.toISOString().split('T')[0];
        const mesInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        const mesFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

        // Buscar faturamento do dia
        const { data: faturamentoHoje } = await client
            .from('transacoes')
            .select('valor')
            .eq('tipo', 'entrada')
            .gte('created_at', dataHoje)
            .lte('created_at', dataHoje + 'T23:59:59');

        // Buscar faturamento do mês
        const { data: faturamentoMes } = await client
            .from('transacoes')
            .select('valor')
            .eq('tipo', 'entrada')
            .gte('created_at', mesInicio)
            .lte('created_at', mesFim + 'T23:59:59');

        // Buscar total de carteiras
        const { count: totalCarteiras } = await client
            .from('carteiras')
            .select('*', { count: 'exact', head: true });

        // Buscar total de transações
        const { count: totalTransacoes } = await client
            .from('transacoes')
            .select('*', { count: 'exact', head: true });

        // Buscar total de créditos vendidos
        const { data: creditosVendidos } = await client
            .from('transacoes')
            .select('valor')
            .eq('tipo', 'entrada');

        // Buscar total de laudos emitidos
        const { count: totalLaudos } = await client
            .from('transacoes')
            .select('*', { count: 'exact', head: true })
            .eq('tipo', 'saida')
            .ilike('descricao', '%laudo%');

        const totalHoje = faturamentoHoje ? faturamentoHoje.reduce((s, t) => s + parseFloat(t.valor || 0), 0) : 0;
        const totalMes = faturamentoMes ? faturamentoMes.reduce((s, t) => s + parseFloat(t.valor || 0), 0) : 0;
        const totalCreditos = creditosVendidos ? creditosVendidos.reduce((s, t) => s + parseFloat(t.valor || 0), 0) : 0;

        return {
            faturamento_hoje: Math.round(totalHoje * 100) / 100,
            faturamento_mes: Math.round(totalMes * 100) / 100,
            total_carteiras: totalCarteiras || 0,
            total_transacoes: totalTransacoes || 0,
            total_creditos_vendidos: Math.round(totalCreditos * 100) / 100,
            total_laudos: totalLaudos || 0,
            data_atualizacao: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Erro ao buscar dados do dashboard:', error);
        return getDashboardMock();
    }
}

// ============================================
// DADOS MOCK (Fallback)
// ============================================

function getCarteirasMock() {
    return [
        { id: '1', nome: 'TechCorp Solutions', tipo: 'empresa', saldo: 1250, saldo_reservado: 200, creditos_bonus: 50, creditos_promocionais: 0, validade: '2024-12-31' },
        { id: '2', nome: 'InovaLab Brasil', tipo: 'empresa', saldo: 820, saldo_reservado: 100, creditos_bonus: 30, creditos_promocionais: 0, validade: '2024-11-30' },
        { id: '3', nome: 'João Silva', tipo: 'consultor', saldo: 450, saldo_reservado: 50, creditos_bonus: 20, creditos_promocionais: 0, validade: '2024-10-15' },
        { id: '4', nome: 'Maria Santos', tipo: 'consultor', saldo: 280, saldo_reservado: 30, creditos_bonus: 10, creditos_promocionais: 0, validade: '2024-09-30' }
    ];
}

function getTransacoesMock() {
    return [
        { id: '1', carteira_id: '1', tipo: 'entrada', descricao: 'Compra de créditos', valor: 150, documento: 'NF-001', responsavel: 'João Silva', created_at: '2024-06-01T10:30:00Z' },
        { id: '2', carteira_id: '2', tipo: 'entrada', descricao: 'Compra de créditos', valor: 200, documento: 'NF-002', responsavel: 'Maria Santos', created_at: '2024-06-02T14:20:00Z' },
        { id: '3', carteira_id: '1', tipo: 'saida', descricao: 'Consumo de créditos', valor: 50, documento: 'CON-001', responsavel: 'Sistema', created_at: '2024-06-03T09:15:00Z' }
    ];
}

function getPrecosMock() {
    return [
        { id: '1', produto: 'Relatório DISC', tipo: 'relatorio_disc', preco_unitario: 49.90, preco_promocional: 39.90, validade: '2024-12-31', status: 'active' },
        { id: '2', produto: 'Relatório IE', tipo: 'relatorio_ie', preco_unitario: 49.90, preco_promocional: 39.90, validade: '2024-12-31', status: 'active' },
        { id: '3', produto: 'Laudo Vigorre', tipo: 'laudo', preco_unitario: 149.90, preco_promocional: 119.90, validade: '2024-12-31', status: 'active' }
    ];
}

function getCuponsMock() {
    return [
        { id: '1', codigo: 'PROMO10', descricao: '10% de desconto', tipo: 'percentual', valor: 10, validade: '2024-12-31', usos_limite: 100, usos_atual: 45, status: 'active' },
        { id: '2', codigo: 'BLACK25', descricao: '25% de desconto', tipo: 'percentual', valor: 25, validade: '2024-11-30', usos_limite: 500, usos_atual: 120, status: 'active' }
    ];
}

function getAssinaturasMock() {
    return [
        { id: '1', cliente_id: 'emp1', plano: 'Enterprise', valor: 599.90, data_inicio: '2024-01-15', data_vencimento: '2024-07-15', periodo: 'monthly', status: 'active' },
        { id: '2', cliente_id: 'emp2', plano: 'Pro', valor: 349.90, data_inicio: '2024-03-01', data_vencimento: '2024-09-01', periodo: 'monthly', status: 'active' }
    ];
}

function getReembolsosMock() {
    return [
        { id: '1', cliente_id: 'emp1', tipo: 'assinatura', valor: 599.90, motivo: 'insatisfacao', descricao: 'Cliente insatisfeito', status: 'pending', created_at: '2024-06-15T00:00:00Z' },
        { id: '2', cliente_id: 'user3', tipo: 'credito', valor: 49.90, motivo: 'arrependimento', descricao: 'Comprou por engano', status: 'approved', created_at: '2024-06-20T00:00:00Z' }
    ];
}

function getAuditoriaMock() {
    return [
        { id: '1', ip: '192.168.1.100', usuario_nome: 'João Silva', operacao: 'criacao', tabela: 'carteiras', responsavel: 'João Silva', created_at: '2024-06-01T10:30:00Z' },
        { id: '2', ip: '192.168.1.101', usuario_nome: 'Maria Santos', operacao: 'edicao', tabela: 'precos', responsavel: 'Maria Santos', created_at: '2024-06-02T14:15:00Z' }
    ];
}

function getDashboardMock() {
    return {
        faturamento_hoje: 2580.00,
        faturamento_mes: 42850.00,
        total_carteiras: 45,
        total_transacoes: 1280,
        total_creditos_vendidos: 125000,
        total_laudos: 342,
        data_atualizacao: new Date().toISOString()
    };
}

// ============================================
// EXPORTAÇÃO
// ============================================

if (typeof window !== 'undefined') {
    window.FinanceiroDB = {
        initSupabase,
        getSupabaseClient,
        isSupabaseConnected,
        getCarteiras,
        getCarteiraById,
        createCarteira,
        updateCarteira,
        addSaldoCarteira,
        removeSaldoCarteira,
        getTransacoes,
        createTransacao,
        getPrecos,
        getPrecoByTipo,
        updatePreco,
        getCupons,
        validarCupom,
        utilizarCupom,
        getAssinaturas,
        getReembolsos,
        registrarAuditoria,
        getAuditoria,
        getDashboardData,
        getCarteirasMock,
        getTransacoesMock,
        getPrecosMock,
        getCuponsMock,
        getAssinaturasMock,
        getReembolsosMock,
        getAuditoriaMock,
        getDashboardMock
    };

    console.log('✅ FinanceiroDB carregado com sucesso!');
    console.log('📌 Conectado ao:', SUPABASE_URL);
}
