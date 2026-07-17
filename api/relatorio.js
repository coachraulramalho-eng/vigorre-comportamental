// ============================================
// API RELATORIO - VIGORRE ONE™
// Endpoint para geração de relatórios
// ============================================

import RelatorioService from '../services/relatorio-service.js';
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
        // ===== POST - Gerar Relatório =====
        if (req.method === 'POST') {
            const { participanteId, empresaId, testeId } = req.body;

            // Validações
            if (!participanteId) {
                return res.status(400).json({ error: 'participanteId é obrigatório' });
            }
            if (!empresaId) {
                return res.status(400).json({ error: 'empresaId é obrigatório' });
            }
            if (!testeId) {
                return res.status(400).json({ error: 'testeId é obrigatório' });
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

            // Gera relatório
            const relatorio = await RelatorioService.gerarRelatorio(participanteId, empresaId, testeId);

            return res.status(200).json({
                success: true,
                data: relatorio,
                message: 'Relatório gerado com sucesso'
            });
        }

        // ===== GET - Listar Relatórios =====
        if (req.method === 'GET') {
            const { participanteId, relatorioId } = req.query;

            if (relatorioId) {
                // Busca um relatório específico
                const relatorio = await RelatorioService.buscarRelatorio(relatorioId);
                if (!relatorio) {
                    return res.status(404).json({ error: 'Relatório não encontrado' });
                }
                return res.status(200).json({
                    success: true,
                    data: relatorio
                });
            }

            if (participanteId) {
                // Lista todos os relatórios do participante
                const relatorios = await RelatorioService.listarRelatorios(participanteId);
                return res.status(200).json({
                    success: true,
                    data: relatorios,
                    total: relatorios.length
                });
            }

            return res.status(400).json({ error: 'Informe participanteId ou relatorioId' });
        }

        // ===== DELETE - Remover Relatório =====
        if (req.method === 'DELETE') {
            const { relatorioId } = req.query;

            if (!relatorioId) {
                return res.status(400).json({ error: 'relatorioId é obrigatório' });
            }

            const { error } = await supabase
                .from('relatorios')
                .delete()
                .eq('id', relatorioId);

            if (error) throw error;

            return res.status(200).json({
                success: true,
                message: 'Relatório removido com sucesso'
            });
        }

        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        console.error('Erro na API de relatórios:', error);
        return res.status(500).json({
            error: 'Erro ao processar requisição',
            details: error.message
        });
    }
}
