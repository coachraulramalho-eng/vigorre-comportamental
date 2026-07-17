// ============================================
// API PARTICIPANTE DADOS - VIGORRE ONE™
// Endpoint para direitos LGPD (Acesso, Correção, Exclusão, Portabilidade)
// ============================================

import supabase from '../supabase-config.js';
import AuditService from '../services/audit-service.js';
import AnonimizacaoService from '../services/anonimizacao-service.js';
import RetencaoService from '../services/retencao-service.js';

export default async function handler(req, res) {
    // Configuração CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // ============================================
        // GET - Buscar todos os dados do participante (LGPD - Acesso)
        // ============================================
        if (req.method === 'GET') {
            const { participanteId } = req.query;

            if (!participanteId) {
                return res.status(400).json({ error: 'participanteId é obrigatório' });
            }

            // Verifica se o participante existe
            const { data: participante, error: findError } = await supabase
                .from('participantes')
                .select('id, nome, email, empresa_id, cargo, created_at, updated_at, consentimento, dados_anonimizados')
                .eq('id', participanteId)
                .single();

            if (findError || !participante) {
                return res.status(404).json({ error: 'Participante não encontrado' });
            }

            // Busca todos os dados
            const [resultados, respostas, relatorios, laudos, logsAuditoria, logsConsentimento] = await Promise.all([
                supabase.from('resultados').select('*').eq('participante_id', participanteId),
                supabase.from('respostas').select('*').eq('participante_id', participanteId),
                supabase.from('relatorios').select('*').eq('participante_id', participanteId),
                supabase.from('laudos').select('*').eq('participante_id', participanteId),
                supabase.from('logs_auditoria').select('*').eq('usuario_id', participanteId),
                supabase.from('logs_consentimento').select('*').eq('participante_id', participanteId)
            ]);

            // Registra log de acesso
            await AuditService.registrarAcao(participanteId, 'acesso_dados_lgpd', {
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0'
            });

            return res.status(200).json({
                success: true,
                data: {
                    participante: participante,
                    resultados: resultados.data || [],
                    respostas: respostas.data || [],
                    relatorios: relatorios.data || [],
                    laudos: laudos.data || [],
                    logs_auditoria: logsAuditoria.data || [],
                    logs_consentimento: logsConsentimento.data || [],
                    data_exportacao: new Date().toISOString()
                }
            });
        }

        // ============================================
        // PUT - Corrigir dados do participante (LGPD - Correção)
        // ============================================
        if (req.method === 'PUT') {
            const { participanteId, campos } = req.body;

            if (!participanteId) {
                return res.status(400).json({ error: 'participanteId é obrigatório' });
            }

            if (!campos || Object.keys(campos).length === 0) {
                return res.status(400).json({ error: 'campos para corrigir são obrigatórios' });
            }

            // Campos permitidos para correção
            const camposPermitidos = ['nome', 'email', 'cargo', 'telefone', 'data_nascimento', 'endereco'];
            const camposParaAtualizar = {};

            Object.keys(campos).forEach(key => {
                if (camposPermitidos.includes(key)) {
                    camposParaAtualizar[key] = campos[key];
                }
            });

            if (Object.keys(camposParaAtualizar).length === 0) {
                return res.status(400).json({ error: 'Nenhum campo válido para correção' });
            }

            camposParaAtualizar.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('participantes')
                .update(camposParaAtualizar)
                .eq('id', participanteId)
                .select()
                .single();

            if (error) throw error;

            // Registra log de correção
            await AuditService.registrarAcao(participanteId, 'correcao_dados_lgpd', {
                campos: Object.keys(camposParaAtualizar)
            });

            return res.status(200).json({
                success: true,
                data: data,
                message: 'Dados corrigidos com sucesso'
            });
        }

        // ============================================
        // DELETE - Solicitar exclusão de dados (LGPD - Exclusão)
        // ============================================
        if (req.method === 'DELETE') {
            const { participanteId, empresaId, motivo } = req.query;

            if (!participanteId) {
                return res.status(400).json({ error: 'participanteId é obrigatório' });
            }

            // Verifica se o participante existe
            const { data: participante, error: findError } = await supabase
                .from('participantes')
                .select('id')
                .eq('id', participanteId)
                .single();

            if (findError || !participante) {
                return res.status(404).json({ error: 'Participante não encontrado' });
            }

            // Registra solicitação de exclusão
            const solicitacao = await RetencaoService.solicitarExclusao(
                participanteId,
                empresaId || null,
                motivo || 'Solicitação via API'
            );

            return res.status(200).json({
                success: true,
                data: solicitacao,
                message: 'Solicitação de exclusão recebida. Processada em até 15 dias úteis.'
            });
        }

        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        console.error('❌ Erro na API de dados do participante:', error);
        return res.status(500).json({
            error: 'Erro ao processar requisição',
            details: error.message
        });
    }
}
