// ============================================
// API LAUDO - VIGORRE ONE™
// Endpoint para geração de laudos completos
// ============================================

import LaudoService from '../services/laudo-service.js';
import supabase from '../supabase-config.js';

export default async function handler(req, res) {
    // Configuração CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // ===== POST - Gerar Laudo =====
        if (req.method === 'POST') {
            const { participanteId, empresaId } = req.body;

            // Validações
            if (!participanteId) {
                return res.status(400).json({ error: 'participanteId é obrigatório' });
            }
            if (!empresaId) {
                return res.status(400).json({ error: 'empresaId é obrigatório' });
            }

            // Verifica se participante existe
            const { data: participante, error: participanteError } = await supabase
                .from('participantes')
                .select('id, nome, empresa_id')
                .eq('id', participanteId)
                .single();

            if (participanteError || !participante) {
                return res.status(404).json({ error: 'Participante não encontrado' });
            }

            // Verifica se o participante pertence à empresa
            if (participante.empresa_id !== empresaId) {
                return res.status(403).json({ error: 'Acesso não autorizado a este participante' });
            }

            // Verifica se participante tem resultados
            const { data: resultados, error: resultadosError } = await supabase
                .from('resultados')
                .select('id')
                .eq('participante_id', participanteId);

            if (resultadosError || !resultados || resultados.length === 0) {
                return res.status(400).json({ error: 'Participante não possui resultados para gerar laudo' });
            }

            // Gera laudo
            const laudo = await LaudoService.gerarLaudo(participanteId, empresaId);

            return res.status(200).json({
                success: true,
                data: laudo,
                message: 'Laudo gerado com sucesso'
            });
        }

        // ===== GET - Listar Laudos =====
        if (req.method === 'GET') {
            const { participanteId, laudoId } = req.query;

            if (laudoId) {
                // Busca um laudo específico
                const laudo = await LaudoService.buscarLaudo(laudoId);
                if (!laudo) {
                    return res.status(404).json({ error: 'Laudo não encontrado' });
                }
                return res.status(200).json({
                    success: true,
                    data: laudo
                });
            }

            if (participanteId) {
                // Lista todos os laudos do participante
                const laudos = await LaudoService.listarLaudos(participanteId);
                return res.status(200).json({
                    success: true,
                    data: laudos,
                    total: laudos.length
                });
            }

            return res.status(400).json({ error: 'Informe participanteId ou laudoId' });
        }

        // ===== DELETE - Remover Laudo =====
        if (req.method === 'DELETE') {
            const { laudoId } = req.query;

            if (!laudoId) {
                return res.status(400).json({ error: 'laudoId é obrigatório' });
            }

            const { error } = await supabase
                .from('laudos')
                .delete()
                .eq('id', laudoId);

            if (error) throw error;

            return res.status(200).json({
                success: true,
                message: 'Laudo removido com sucesso'
            });
        }

        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        console.error('Erro na API de laudos:', error);
        return res.status(500).json({
            error: 'Erro ao processar requisição',
            details: error.message
        });
    }
}
