// ============================================
// API AVALIACAO - VIGORRE ONE™
// Endpoint para processamento de avaliações
// ============================================

import AvaliacaoService from '../services/avaliacao-service.js';
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
        // ===== POST - Processar Avaliação =====
        if (req.method === 'POST') {
            const { participanteId, tipo, respostas, perguntas } = req.body;

            // Validações
            if (!participanteId) {
                return res.status(400).json({ error: 'participanteId é obrigatório' });
            }
            if (!tipo) {
                return res.status(400).json({ error: 'tipo é obrigatório (disc, bigfive, ie, valores, swot)' });
            }
            if (!respostas || !Array.isArray(respostas) || respostas.length === 0) {
                return res.status(400).json({ error: 'respostas é obrigatório e deve ser um array' });
            }

            // Verifica se participante existe
            const { data: participante, error: participanteError } = await supabase
                .from('participantes')
                .select('id, nome, empresa_id, consentimento')
                .eq('id', participanteId)
                .single();

            if (participanteError || !participante) {
                return res.status(404).json({ error: 'Participante não encontrado' });
            }

            // Verifica consentimento LGPD
            if (!participante.consentimento) {
                return res.status(403).json({ 
                    error: 'Consentimento LGPD não confirmado',
                    redirect: '/consentimento.html'
                });
            }

            // Verifica se já existe um teste ativo (sessão única)
            const { data: testeAtivo, error: testeAtivoError } = await supabase
                .from('respostas')
                .select('id')
                .eq('participante_id', participanteId)
                .eq('teste_id', tipo)
                .limit(1);

            if (testeAtivo && testeAtivo.length > 0) {
                // Remove respostas anteriores (sessão única)
                await supabase
                    .from('respostas')
                    .delete()
                    .eq('participante_id', participanteId)
                    .eq('teste_id', tipo);
            }

            // Busca o teste
            const { data: teste, error: testeError } = await supabase
                .from('testes')
                .select('id, nome, tipo, perguntas')
                .eq('tipo', tipo)
                .single();

            if (testeError || !teste) {
                return res.status(404).json({ error: `Teste do tipo ${tipo} não encontrado` });
            }

            // Salva respostas
            const respostasData = respostas.map((r, index) => ({
                participante_id: participanteId,
                teste_id: teste.id,
                pergunta_index: index,
                resposta: r,
                data: new Date().toISOString()
            }));

            const { error: saveError } = await supabase
                .from('respostas')
                .insert(respostasData);

            if (saveError) throw saveError;

            // Processa avaliação
            let resultado;
            switch (tipo) {
                case 'disc':
                    resultado = await AvaliacaoService.processarDISC(respostas, perguntas);
                    break;
                case 'bigfive':
                    resultado = await AvaliacaoService.processarBigFive(respostas);
                    break;
                case 'ie':
                    resultado = await AvaliacaoService.processarIE(respostas);
                    break;
                case 'valores':
                    resultado = await AvaliacaoService.processarValores(respostas);
                    break;
                case 'swot':
                    resultado = await AvaliacaoService.processarSWOT(respostas);
                    break;
                default:
                    return res.status(400).json({ error: `Tipo ${tipo} não suportado` });
            }

            // Salva resultado
            const { data: resultadoSalvo, error: resultadoError } = await supabase
                .from('resultados')
                .insert({
                    participante_id: participanteId,
                    teste_id: teste.id,
                    tipo: tipo,
                    resultados: resultado,
                    data: new Date().toISOString()
                })
                .select()
                .single();

            if (resultadoError) throw resultadoError;

            // Atualiza índice VIGOR® (se tiver todos os testes)
            await AvaliacaoService.atualizarIndicesVigor(participanteId);

            // Log de auditoria
            await supabase
                .from('logs_auditoria')
                .insert({
                    participante_id: participanteId,
                    acao: 'teste_concluido',
                    dados: { tipo, resultadoId: resultadoSalvo.id },
                    data: new Date().toISOString()
                });

            // Prepara resposta
            const responseData = {
                id: resultadoSalvo.id,
                tipo: tipo,
                resultados: resultado,
                data: resultadoSalvo.data
            };

            // Salva no localStorage para exibição
            // O frontend pode usar isso para mostrar o resultado
            const resultadoKey = `resultado_${tipo}`;
            // O frontend vai ler do localStorage

            return res.status(200).json({
                success: true,
                data: responseData,
                message: 'Avaliação processada com sucesso'
            });
        }

        // ===== GET - Buscar Resultados =====
        if (req.method === 'GET') {
            const { participanteId, resultadoId, tipo } = req.query;

            if (resultadoId) {
                // Busca um resultado específico
                const { data: resultado, error } = await supabase
                    .from('resultados')
                    .select('*')
                    .eq('id', resultadoId)
                    .single();

                if (error || !resultado) {
                    return res.status(404).json({ error: 'Resultado não encontrado' });
                }

                return res.status(200).json({
                    success: true,
                    data: resultado
                });
            }

            if (participanteId) {
                let query = supabase
                    .from('resultados')
                    .select('*')
                    .eq('participante_id', participanteId);

                if (tipo) {
                    query = query.eq('tipo', tipo);
                }

                const { data: resultados, error } = await query
                    .order('data', { ascending: false });

                if (error) throw error;

                return res.status(200).json({
                    success: true,
                    data: resultados,
                    total: resultados.length
                });
            }

            return res.status(400).json({ error: 'Informe participanteId ou resultadoId' });
        }

        // ===== DELETE - Remover Resultado =====
        if (req.method === 'DELETE') {
            const { resultadoId } = req.query;

            if (!resultadoId) {
                return res.status(400).json({ error: 'resultadoId é obrigatório' });
            }

            const { error } = await supabase
                .from('resultados')
                .delete()
                .eq('id', resultadoId);

            if (error) throw error;

            return res.status(200).json({
                success: true,
                message: 'Resultado removido com sucesso'
            });
        }

        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        console.error('Erro na API de avaliação:', error);
        return res.status(500).json({
            error: 'Erro ao processar requisição',
            details: error.message
        });
    }
}
