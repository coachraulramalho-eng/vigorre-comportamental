/**
 * ============================================
 * VIGORRE ONE™ - CENTRO FINANCEIRO
 * Conexão com Supabase
 * ============================================
 */

const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-key';

// Inicialização do cliente Supabase
let supabaseClient = null;

/**
 * Inicializa a conexão com o Supabase
 */
function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase Financeiro inicializado');
        return supabaseClient;
    } else {
        console.warn('⚠️ Supabase não carregado, usando mock local');
        return null;
    }
}

/**
 * ============================================
 * TABELAS DO SUPABASE
 * ============================================
 * 
 * 1. carteiras
 *    - id (uuid, primary key)
 *    - usuario_id (uuid, foreign key)
 *    - empresa_id (uuid, foreign key)
 *    - consultor_id (uuid, foreign key)
 *    - saldo (integer, default 0)
 *    - saldo_reservado (integer, default 0)
 *    - creditos_bonus (integer, default 0)
 *    - creditos_promocionais (integer, default 0)
 *    - validade (date)
 *    - created_at (timestamp)
 *    - updated_at (timestamp)
 * 
 * 2. transacoes
 *    - id (uuid, primary key)
 *    - carteira_id (uuid, foreign key)
 *    - usuario_id (uuid)
 *    - empresa_id (uuid)
 *    - tipo (text: 'entrada', 'saida', 'ajuste')
 *    - descricao (text)
 *    - valor (integer)
 *    - disc (integer, default 0)
 *    - ie (integer, default 0)
 *    - valores (integer, default 0)
 *    - saldo_antes (integer)
 *    - saldo_depois (integer)
 *    - documento (text)
 *    - responsavel (text)
 *    - created_at (timestamp)
 * 
 * 3. precos
 *    - id (uuid, primary key)
 *    - produto (text)
 *    - tipo (text)
 *    - preco_unitario (decimal)
 *    - preco_promocional (decimal)
 *    - validade (date)
 *    - status (text: 'active', 'inactive')
 *    - created_at (timestamp)
 *    - updated_at (timestamp)
 * 
 * 4. cupons
 *    - id (uuid, primary key)
 *    - codigo (text, unique)
 *    - descricao (text)
 *    - tipo (text: 'percentual', 'fixo', 'creditos')
 *    - valor (decimal)
 *    - validade (date)
 *    - usos_limite (integer)
 *    - usos_atual (integer, default 0)
 *    - status (text: 'active', 'inactive', 'expired', 'used')
 *    - created_at (timestamp)
 * 
 * 5. assinaturas
 *    - id (uuid, primary key)
 *    - cliente_id (uuid)
 *    - plano (text)
 *    - valor (decimal)
 *    - data_inicio (date)
 *    - data_vencimento (date)
 *    - periodo (text: 'monthly', 'quarterly', 'semiannual', 'annual')
 *    - status (text: 'active', 'trial', 'pending', 'canceled', 'inactive')
 *    - desconto (decimal, default 0)
 *    - created_at (timestamp)
 *    - updated_at (timestamp)
 * 
 * 6. reembolsos
 *    - id (uuid, primary key)
 *    - cliente_id (uuid)
 *    - tipo (text: 'credito', 'assinatura', 'compra')
 *    - valor (decimal)
 *    - motivo (text)
 *    - descricao (text)
 *    - observacao (text)
 *    - status (text: 'pending', 'approved', 'rejected', 'processed')
 *    - created_at (timestamp)
 *    - updated_at (timestamp)
 * 
 * 7. auditoria
 *    - id (uuid, primary key)
 *    - ip (text)
 *    - usuario_id (uuid)
 *    - usuario_nome (text)
 *    - empresa_id (uuid)
 *    - operacao (text: 'criacao', 'edicao', 'exclusao', 'acesso')
 *    - antes (text)
 *    - depois (text)
 *    - responsavel (text)
 *    - tabela (text)
 *    - created_at (timestamp)
 * 
 * 8. configuracoes
 *    - id (uuid, primary key)
 *    - chave (text, unique)
 *    - valor (jsonb)
 *    - descricao (text)
 *    - updated_at (timestamp)
 */

// ============================================
// FUNÇÕES DE CONEXÃO
// ============================================

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

/**
 * ============================================
 * FUNÇÕES CRUD - CARTEIRAS
 * ============================================
 */

/**
 * Busca todas as carteiras
 */
async function getCarteiras(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        // Fallback para dados locais
        return getCarteirasMock();
    }

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

    return data;
}

/**
 * Busca uma carteira por ID
 */
async function getCarteiraById(id) {
    const client = getSupabaseClient();
    if (!client) {
        const mock = getCarteirasMock();
        return mock.find(c => c.id === id) || null;
    }

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

    const { data, error } = await client
        .from('carteiras')
        .insert([carteira])
        .select()
        .single();

    if (error) {
        console.error('❌ Erro ao criar carteira:', error);
        throw error;
    }

    // Registrar auditoria
    await registrarAuditoria({
        operacao: 'criacao',
        tabela: 'carteiras',
        depois: JSON.stringify(data),
        responsavel: carteira.responsavel || 'Sistema'
    });

    return data;
}

/**
 * Atualiza uma carteira
 */
async function updateCarteira(id, dados) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, atualizando localmente');
        return { id, ...dados };
    }

    // Buscar dados antigos para auditoria
    const antigo = await getCarteiraById(id);

    const { data, error } = await client
        .from('carteiras')
        .update(dados)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('❌ Erro ao atualizar carteira:', error);
        throw error;
    }

    // Registrar auditoria
    await registrarAuditoria({
        operacao: 'edicao',
        tabela: 'carteiras',
        antes: JSON.stringify(antigo),
        depois: JSON.stringify(data),
        responsavel: dados.responsavel || 'Sistema'
    });

    return data;
}

/**
 * ============================================
 * FUNÇÕES CRUD - TRANSAÇÕES
 * ============================================
 */

/**
 * Busca transações com filtros
 */
async function getTransacoes(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        return getTransacoesMock();
    }

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
    if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
    }
    if (filtros.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
    }
    if (filtros.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filtros.limite || 100);

    if (error) {
        console.error('❌ Erro ao buscar transações:', error);
        return getTransacoesMock();
    }

    return data;
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

    const { data, error } = await client
        .from('transacoes')
        .insert([transacao])
        .select()
        .single();

    if (error) {
        console.error('❌ Erro ao criar transação:', error);
        throw error;
    }

    // Registrar auditoria
    await registrarAuditoria({
        operacao: 'criacao',
        tabela: 'transacoes',
        depois: JSON.stringify(data),
        responsavel: transacao.responsavel || 'Sistema'
    });

    return data;
}

/**
 * ============================================
 * FUNÇÕES CRUD - PREÇOS
 * ============================================
 */

/**
 * Busca todos os preços
 */
async function getPrecos() {
    const client = getSupabaseClient();
    if (!client) {
        return getPrecosMock();
    }

    const { data, error } = await client
        .from('precos')
        .select('*')
        .order('produto');

    if (error) {
        console.error('❌ Erro ao buscar preços:', error);
        return getPrecosMock();
    }

    return data;
}

/**
 * Atualiza um preço
 */
async function updatePreco(id, dados) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível, atualizando localmente');
        return { id, ...dados };
    }

    const antigo = await getPrecoById(id);

    const { data, error } = await client
        .from('precos')
        .update(dados)
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
}

/**
 * ============================================
 * FUNÇÕES CRUD - CUPONS
 * ============================================
 */

/**
 * Busca todos os cupons
 */
async function getCupons(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        return getCuponsMock();
    }

    let query = client.from('cupons').select('*');

    if (filtros.status) {
        query = query.eq('status', filtros.status);
    }
    if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Erro ao buscar cupons:', error);
        return getCuponsMock();
    }

    return data;
}

/**
 * Valida um cupom pelo código
 */
async function validarCupom(codigo) {
    const client = getSupabaseClient();
    if (!client) {
        const mock = getCuponsMock();
        return mock.find(c => c.codigo === codigo && c.status === 'active') || null;
    }

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
    if (new Date(data.validade) < new Date()) {
        await updateCupom(data.id, { status: 'expired' });
        return null;
    }

    // Verificar limite de usos
    if (data.usos_limite && data.usos_atual >= data.usos_limite) {
        return null;
    }

    return data;
}

/**
 * Utiliza um cupom (incrementa usos)
 */
async function utilizarCupom(id) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('⚠️ Supabase não disponível');
        return null;
    }

    const cupom = await getCupomById(id);
    if (!cupom) return null;

    const novoUso = (cupom.usos_atual || 0) + 1;

    const { data, error } = await client
        .from('cupons')
        .update({ usos_atual: novoUso })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('❌ Erro ao utilizar cupom:', error);
        return null;
    }

    return data;
}

/**
 * ============================================
 * FUNÇÕES CRUD - ASSINATURAS
 * ============================================
 */

/**
 * Busca todas as assinaturas
 */
async function getAssinaturas(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        return getAssinaturasMock();
    }

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

    return data;
}

/**
 * ============================================
 * FUNÇÕES CRUD - REEMBOLSOS
 * ============================================
 */

/**
 * Busca todas as solicitações de reembolso
 */
async function getReembolsos(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        return getReembolsosMock();
    }

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

    return data;
}

/**
 * ============================================
 * AUDITORIA
 * ============================================
 */

/**
 * Registra uma ação na auditoria
 */
async function registrarAuditoria(dados) {
    const client = getSupabaseClient();
    if (!client) {
        console.log('📝 Auditoria (mock):', dados);
        return null;
    }

    const registro = {
        ip: dados.ip || '0.0.0.0',
        usuario_id: dados.usuario_id || 'sistema',
        usuario_nome: dados.usuario_nome || 'Sistema',
        operacao: dados.operacao,
        tabela: dados.tabela,
        antes: dados.antes || null,
        depois: dados.depois || null,
        responsavel: dados.responsavel || 'Sistema',
        created_at: new Date().toISOString()
    };

    const { error } = await client
        .from('auditoria')
        .insert([registro]);

    if (error) {
        console.error('❌ Erro ao registrar auditoria:', error);
    }

    return registro;
}

/**
 * Busca logs de auditoria
 */
async function getAuditoria(filtros = {}) {
    const client = getSupabaseClient();
    if (!client) {
        return getAuditoriaMock();
    }

    let query = client.from('auditoria').select('*');

    if (filtros.operacao) {
        query = query.eq('operacao', filtros.operacao);
    }
    if (filtros.usuario_id) {
        query = query.eq('usuario_id', filtros.usuario_id);
    }
    if (filtros.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
    }
    if (filtros.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filtros.limite || 100);

    if (error) {
        console.error('❌ Erro ao buscar auditoria:', error);
        return getAuditoriaMock();
    }

    return data;
}

/**
 * ============================================
 * DASHBOARD - KPIs
 * ============================================
 */

/**
 * Busca dados para o dashboard executivo
 */
async function getDashboardData() {
    const client = getSupabaseClient();
    if (!client) {
        return getDashboardMock();
    }

    try {
        // Faturamento do dia
        const hoje = new Date().toISOString().split('T')[0];
        const { data: faturamentoHoje } = await client
            .from('transacoes')
            .select('valor')
            .eq('tipo', 'entrada')
            .gte('created_at', hoje)
            .lte('created_at', hoje + 'T23:59:59');

        // Faturamento do mês
        const mes = new Date().getMonth() + 1;
        const ano = new Date().getFullYear();
        const mesInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
        const mesFim = `${ano}-${String(mes).padStart(2, '0')}-31`;

        const { data: faturamentoMes } = await client
            .from('transacoes')
            .select('valor')
            .eq('tipo', 'entrada')
            .gte('created_at', mesInicio)
            .lte('created_at', mesFim);

        // Total de carteiras
        const { count: totalCarteiras } = await client
            .from('carteiras')
            .select('*', { count: 'exact', head: true });

        // Total de transações
        const { count: totalTransacoes } = await client
            .from('transacoes')
            .select('*', { count: 'exact', head: true });

        // Calcular totais
        const totalHoje = faturamentoHoje ? faturamentoHoje.reduce((s, t) => s + parseFloat(t.valor || 0), 0) : 0;
        const totalMes = faturamentoMes ? faturamentoMes.reduce((s, t) => s + parseFloat(t.valor || 0), 0) : 0;

        return {
            faturamento_hoje: totalHoje,
            faturamento_mes: totalMes,
            total_carteiras: totalCarteiras || 0,
            total_transacoes: totalTransacoes || 0
        };

    } catch (error) {
        console.error('❌ Erro ao buscar dados do dashboard:', error);
        return getDashboardMock();
    }
}

/**
 * ============================================
 * DADOS MOCK (Fallback)
 * ============================================
 */

function getCarteirasMock() {
    return [
        { id: '1', nome: 'TechCorp Solutions', tipo: 'empresa', saldo: 1250, reservado: 200, bonus: 50, validade: '2024-12-31' },
        { id: '2', nome: 'InovaLab Brasil', tipo: 'empresa', saldo: 820, reservado: 100, bonus: 30, validade: '2024-11-30' },
        { id: '3', nome: 'João Silva', tipo: 'consultor', saldo: 450, reservado: 50, bonus: 20, validade: '2024-10-15' },
        { id: '4', nome: 'Maria Santos', tipo: 'consultor', saldo: 280, reservado: 30, bonus: 10, validade: '2024-09-30' }
    ];
}

function getTransacoesMock() {
    return [
        { id: '1', descricao: 'Compra de créditos DISC', tipo: 'entrada', valor: 150, disc: 50, ie: 0, valores: 0, documento: 'NF-001', data: '2024-06-01' },
        { id: '2', descricao: 'Compra de créditos IE', tipo: 'entrada', valor: 200, disc: 0, ie: 30, valores: 0, documento: 'NF-002', data: '2024-06-02' },
        { id: '3', descricao: 'Consumo de créditos DISC', tipo: 'saida', valor: 50, disc: 10, ie: 0, valores: 0, documento: 'CON-001', data: '2024-06-03' }
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
        { id: '1', cliente: 'TechCorp Solutions', plano: 'Enterprise', valor: 599.90, data_inicio: '2024-01-15', data_vencimento: '2024-07-15', status: 'active' },
        { id: '2', cliente: 'InovaLab Brasil', plano: 'Pro', valor: 349.90, data_inicio: '2024-03-01', data_vencimento: '2024-09-01', status: 'active' }
    ];
}

function getReembolsosMock() {
    return [
        { id: '1', cliente: 'TechCorp Solutions', tipo: 'assinatura', valor: 599.90, motivo: 'Insatisfação', status: 'pending', data: '2024-06-15' },
        { id: '2', cliente: 'João Silva', tipo: 'credito', valor: 49.90, motivo: 'Arrependimento', status: 'approved', data: '2024-06-20' }
    ];
}

function getAuditoriaMock() {
    return [
        { id: '1', ip: '192.168.1.100', usuario_nome: 'João Silva', operacao: 'criacao', tabela: 'carteiras', data: '2024-06-01 10:30' },
        { id: '2', ip: '192.168.1.101', usuario_nome: 'Maria Santos', operacao: 'edicao', tabela: 'precos', data: '2024-06-02 14:15' }
    ];
}

function getDashboardMock() {
    return {
        faturamento_hoje: 2580,
        faturamento_mes: 42850,
        total_carteiras: 45,
        total_transacoes: 1280
    };
}

// ============================================
// EXPORTAÇÃO
// ============================================

// Para uso no browser
if (typeof window !== 'undefined') {
    window.FinanceiroDB = {
        // Conexão
        initSupabase,
        getSupabaseClient,
        isSupabaseConnected,

        // Carteiras
        getCarteiras,
        getCarteiraById,
        createCarteira,
        updateCarteira,

        // Transações
        getTransacoes,
        createTransacao,

        // Preços
        getPrecos,
        updatePreco,

        // Cupons
        getCupons,
        validarCupom,
        utilizarCupom,

        // Assinaturas
        getAssinaturas,

        // Reembolsos
        getReembolsos,

        // Auditoria
        registrarAuditoria,
        getAuditoria,

        // Dashboard
        getDashboardData,

        // Mocks (para fallback)
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
}

// Para uso no Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSupabase,
        getSupabaseClient,
        isSupabaseConnected,
        getCarteiras,
        getCarteiraById,
        createCarteira,
        updateCarteira,
        getTransacoes,
        createTransacao,
        getPrecos,
        updatePreco,
        getCupons,
        validarCupom,
        utilizarCupom,
        getAssinaturas,
        getReembolsos,
        registrarAuditoria,
        getAuditoria,
        getDashboardData
    };
}
