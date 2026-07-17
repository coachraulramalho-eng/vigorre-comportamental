// ============================================
// RETENÇÃO SERVICE - VIGORRE ONE™
// Serviço para política de retenção de dados (LGPD)
// ============================================

import supabase from '../supabase-config.js';
import AuditService from './audit-service.js';
import AnonimizacaoService from './anonimizacao-service.js';

class RetencaoService {
    
    /**
     * Configuração de retenção (dias)
     */
    constructor() {
        this.prazoPadrao = 365; // dias
        this.prazoMinimo = 180; // dias
        this.prazoMaximo = 730; // dias (2 anos)
    }

    /**
     * Aplica política de retenção
     * Deve ser executado periodicamente (ex: diariamente)
     */
    async aplicarPoliticaRetencao() {
        console.log('🔄 Aplicando política de retenção de dados...');

        const resultados = await this._processarExpirados();
        const anonimizados = await this._processarAnonimizacaoPendente();

        return {
            expirados: resultados,
            anonimizados: anonimizados,
            data_execucao: new Date().toISOString()
        };
    }

    /**
     * Processa dados expirados
     */
    async _processarExpirados() {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - this.prazoPadrao);

        // Busca participantes com dados expirados
        const { data: participantes, error } = await supabase
            .from('participantes')
            .select('id, nome, email, empresa_id, ultimo_acesso, dados_anonimizados')
            .lt('ultimo_acesso', dataLimite.toISOString())
            .eq('dados_anonimizados', false);

        if (error) throw error;

        const resultados = [];

        for (const participante of participantes) {
            try {
                // Anonimiza dados
                await AnonimizacaoService.anonimizarDados(
                    participante.id,
                    participante.empresa_id
                );

                // Registra no log
                await AuditService.registrarAcao(
                    participante.id,
                    'retencao_automatica',
                    {
                        prazo: this.prazoPadrao,
                        data_limite: dataLimite.toISOString()
                    }
                );

                resultados.push({
                    id: participante.id,
                    nome: participante.nome,
                    status: 'anonimizado'
                });

            } catch (error) {
                console.error(`❌ Erro ao processar retenção para ${participante.id}:`, error);
                resultados.push({
                    id: participante.id,
                    nome: participante.nome,
                    status: 'erro',
                    erro: error.message
                });
            }
        }

        return resultados;
    }

    /**
     * Processa anonimização pendente por solicitação do participante
     */
    async _processarAnonimizacaoPendente() {
        // Busca solicitações de exclusão pendentes
        const { data: solicitacoes, error } = await supabase
            .from('solicitacoes_exclusao')
            .select('*')
            .eq('status', 'pendente')
            .lt('data_solicitacao', new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()); // 15 dias

        if (error) throw error;

        const resultados = [];

        for (const solicitacao of solicitacoes) {
            try {
                await AnonimizacaoService.anonimizarDados(
                    solicitacao.participante_id,
                    solicitacao.empresa_id
                );

                await supabase
                    .from('solicitacoes_exclusao')
                    .update({
                        status: 'concluido',
                        data_conclusao: new Date().toISOString()
                    })
                    .eq('id', solicitacao.id);

                resultados.push({
                    id: solicitacao.id,
                    participante_id: solicitacao.participante_id,
                    status: 'concluido'
                });

            } catch (error) {
                console.error(`❌ Erro ao processar exclusão ${solicitacao.id}:`, error);
                resultados.push({
                    id: solicitacao.id,
                    participante_id: solicitacao.participante_id,
                    status: 'erro',
                    erro: error.message
                });
            }
        }

        return resultados;
    }

    /**
     * Solicita exclusão de dados (LGPD - Direito de Exclusão)
     */
    async solicitarExclusao(participanteId, empresaId, motivo = '') {
        const { data, error } = await supabase
            .from('solicitacoes_exclusao')
            .insert({
                participante_id: participanteId,
                empresa_id: empresaId,
                motivo: motivo,
                status: 'pendente',
                data_solicitacao: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        await AuditService.registrarAcao(participanteId, 'solicitacao_exclusao', {
            solicitacao_id: data.id,
            motivo: motivo
        });

        return data;
    }

    /**
     * Define prazo de retenção personalizado (para empresas)
     */
    async definirPrazoRetencao(empresaId, dias) {
        if (dias < this.prazoMinimo || dias > this.prazoMaximo) {
            throw new Error(`Prazo deve estar entre ${this.prazoMinimo} e ${this.prazoMaximo} dias`);
        }

        const { data, error } = await supabase
            .from('empresas')
            .update({
                prazo_retencao: dias,
                updated_at: new Date().toISOString()
            })
            .eq('id', empresaId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Busca prazo de retenção de uma empresa
     */
    async buscarPrazoRetencao(empresaId) {
        const { data, error } = await supabase
            .from('empresas')
            .select('prazo_retencao')
            .eq('id', empresaId)
            .single();

        if (error) return this.prazoPadrao;
        return data?.prazo_retencao || this.prazoPadrao;
    }
}

export default new RetencaoService();
