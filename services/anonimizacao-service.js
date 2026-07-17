// ============================================
// ANONIMIZAÇÃO SERVICE - VIGORRE ONE™
// Serviço para anonimização de dados (LGPD)
// ============================================

import supabase from '../supabase-config.js';
import AuditService from './audit-service.js';

class AnonimizacaoService {
    
    /**
     * Anonimiza dados de um participante
     * @param {string} participanteId - ID do participante
     * @param {string} empresaId - ID da empresa (opcional)
     */
    async anonimizarDados(participanteId, empresaId = null) {
        try {
            // 1. Busca dados do participante
            const { data: participante, error: findError } = await supabase
                .from('participantes')
                .select('*')
                .eq('id', participanteId)
                .single();

            if (findError) throw findError;
            if (participante.dados_anonimizados) {
                throw new Error('Dados já anonimizados');
            }

            // 2. Gera identificador anônimo
            const idAnonimo = this._gerarIdAnonimo(participanteId);

            // 3. Atualiza com dados anonimizados
            const dadosAnonimizados = {
                nome: `Participante ${idAnonimo}`,
                email: `${idAnonimo}@anonimo.vigorre.com`,
                dados_anonimizados: true,
                data_anonimizacao: new Date().toISOString(),
                id_anonimo: idAnonimo
            };

            // Se tiver empresa, mantém vínculo para People Analytics
            if (empresaId) {
                dadosAnonimizados.empresa_id = empresaId;
                dadosAnonimizados.empresa_nome = null;
            } else {
                dadosAnonimizados.empresa_id = null;
                dadosAnonimizados.empresa_nome = 'Anonimizado';
            }

            // Remove dados sensíveis adicionais
            dadosAnonimizados.telefone = null;
            dadosAnonimizados.cpf = null;
            dadosAnonimizados.data_nascimento = null;
            dadosAnonimizados.endereco = null;

            // 4. Salva anonimização
            const { data: updated, error: updateError } = await supabase
                .from('participantes')
                .update(dadosAnonimizados)
                .eq('id', participanteId)
                .select()
                .single();

            if (updateError) throw updateError;

            // 5. Anonimiza respostas (remove identificadores)
            await this._anonimizarRespostas(participanteId, idAnonimo);

            // 6. Registra log de anonimização
            await AuditService.registrarAcao(participanteId, 'anonimizacao_dados', {
                id_anonimo: idAnonimo,
                data: new Date().toISOString()
            });

            // 7. Revoga consentimento (LGPD)
            await supabase
                .from('participantes')
                .update({ consentimento: false })
                .eq('id', participanteId);

            await AuditService.registrarRevogacao(participanteId);

            return {
                success: true,
                id_anonimo: idAnonimo,
                message: 'Dados anonimizados com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao anonimizar dados:', error);
            throw error;
        }
    }

    /**
     * Anonimiza respostas de um participante
     */
    async _anonimizarRespostas(participanteId, idAnonimo) {
        // Mantém as respostas mas remove referência ao participante original
        const { data: respostas, error: findError } = await supabase
            .from('respostas')
            .select('*')
            .eq('participante_id', participanteId);

        if (findError) throw findError;

        if (respostas && respostas.length > 0) {
            // Cria uma nova entrada anonimizada
            const respostasAnonimas = respostas.map(r => ({
                ...r,
                participante_id: null,
                participante_anonimo: idAnonimo,
                anonimizado: true
            }));

            // Insere respostas anonimizadas
            await supabase
                .from('respostas_anonimas')
                .insert(respostasAnonimas);
        }
    }

    /**
     * Gera ID anônimo
     */
    _gerarIdAnonimo(participanteId) {
        const hash = this._hashString(participanteId + Date.now().toString());
        return 'ANON-' + hash.substring(0, 8).toUpperCase();
    }

    /**
     * Hash simples para ID anônimo
     */
    _hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    /**
     * Verifica se um participante está anonimizado
     */
    async isAnonimizado(participanteId) {
        const { data, error } = await supabase
            .from('participantes')
            .select('dados_anonimizados')
            .eq('id', participanteId)
            .single();

        if (error) return false;
        return data?.dados_anonimizados || false;
    }

    /**
     * Busca dados anonimizados para People Analytics
     */
    async buscarDadosAnonimos(empresaId) {
        const { data, error } = await supabase
            .from('participantes')
            .select('id_anonimo, dados_anonimizados, resultados, respostas_anonimas')
            .eq('empresa_id', empresaId)
            .eq('dados_anonimizados', true);

        if (error) throw error;
        return data;
    }
}

export default new AnonimizacaoService();
