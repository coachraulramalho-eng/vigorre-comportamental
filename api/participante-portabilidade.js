// ============================================
// API PARTICIPANTE PORTABILIDADE - VIGORRE ONE™
// Endpoint para portabilidade de dados (LGPD)
// ============================================

import supabase from '../supabase-config.js';
import AuditService from '../services/audit-service.js';

export default async function handler(req, res) {
    // Configuração CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // ============================================
        // GET - Exportar dados do participante (LGPD - Portabilidade)
        // ============================================
        if (req.method === 'GET') {
            const { participanteId, formato } = req.query;

            if (!participanteId) {
                return res.status(400).json({ error: 'participanteId é obrigatório' });
            }

            // Verifica se o participante existe
            const { data: participante, error: findError } = await supabase
                .from('participantes')
                .select('id, nome, email, empresa_id, cargo, created_at, updated_at')
                .eq('id', participanteId)
                .single();

            if (findError || !participante) {
                return res.status(404).json({ error: 'Participante não encontrado' });
            }

            // Busca todos os dados
            const [resultados, respostas, relatorios, laudos] = await Promise.all([
                supabase.from('resultados').select('*').eq('participante_id', participanteId),
                supabase.from('respostas').select('*').eq('participante_id', participanteId),
                supabase.from('relatorios').select('*').eq('participante_id', participanteId),
                supabase.from('laudos').select('*').eq('participante_id', participanteId)
            ]);

            const dadosCompletos = {
                participante: participante,
                resultados: resultados.data || [],
                respostas: respostas.data || [],
                relatorios: relatorios.data || [],
                laudos: laudos.data || [],
                data_exportacao: new Date().toISOString(),
                versao: '3.0',
                plataforma: 'VIGORRE ONE™'
            };

            // Registra log de portabilidade
            await AuditService.registrarAcao(participanteId, 'portabilidade_dados_lgpd', {
                formato: formato || 'json',
                data: new Date().toISOString()
            });

            // Formato de saída
            if (formato === 'csv') {
                const csv = this._gerarCSV(dadosCompletos);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=dados_${participanteId}_${new Date().toISOString().split('T')[0]}.csv`);
                return res.status(200).send(csv);
            }

            // Padrão: JSON
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=dados_${participanteId}_${new Date().toISOString().split('T')[0]}.json`);

            return res.status(200).json({
                success: true,
                data: dadosCompletos
            });
        }

        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        console.error('❌ Erro na API de portabilidade:', error);
        return res.status(500).json({
            error: 'Erro ao processar requisição',
            details: error.message
        });
    }
}

/**
 * Gera CSV a partir dos dados
 */
function _gerarCSV(dados) {
    const linhas = [];

    // Cabeçalho
    linhas.push('Tipo,ID,Data,Campos');

    // Participante
    const p = dados.participante;
    linhas.push(`Participante,${p.id},${p.created_at},"nome:${p.nome},email:${p.email},cargo:${p.cargo}"`);

    // Resultados
    dados.resultados.forEach(r => {
        linhas.push(`Resultado,${r.id},${r.data},"tipo:${r.tipo},resultados:${JSON.stringify(r.resultados).substring(0, 100)}..."`);
    });

    // Respostas
    dados.respostas.forEach(r => {
        linhas.push(`Resposta,${r.id},${r.data},"pergunta:${r.pergunta_index},resposta:${JSON.stringify(r.resposta)}"`);
    });

    // Relatórios
    dados.relatorios.forEach(r => {
        linhas.push(`Relatorio,${r.id},${r.data_geracao},"tipo:${r.tipo}"`);
    });

    // Laudos
    dados.laudos.forEach(l => {
        linhas.push(`Laudo,${l.id},${l.data_geracao},"conteudo:${Object.keys(l.conteudo || {}).join(',')}"`);
    });

    return linhas.join('\n');
}
