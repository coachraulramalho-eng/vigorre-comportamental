// ============================================
// AUDIT SERVICE - VIGORRE ONE™
// Serviço de auditoria e logs para LGPD
// ============================================

import supabase from '../supabase-config.js';

class AuditService {
    
    /**
     * Registra uma ação no log de auditoria
     * @param {string} usuarioId - ID do usuário
     * @param {string} acao - Tipo de ação (login, logout, teste_iniciado, etc.)
     * @param {Object} dados - Dados adicionais da ação
     * @param {string} ip - IP do usuário
     * @param {string} userAgent - User Agent do navegador
     */
    async registrarAcao(usuarioId, acao, dados = {}, ip = '0.0.0.0', userAgent = '') {
        try {
            const log = {
                usuario_id: usuarioId,
                acao: acao,
                dados: dados,
                ip: ip,
                user_agent: userAgent || navigator?.userAgent || '',
                data: new Date().toISOString()
            };

            // Salva no Supabase
            const { data, error } = await supabase
                .from('logs_auditoria')
                .insert(log)
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.warn('⚠️ Erro ao registrar log de auditoria:', error);
            // Fallback para localStorage
            try {
                const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
                logs.push({
                    usuarioId,
                    acao,
                    dados,
                    ip,
                    userAgent,
                    data: new Date().toISOString(),
                    fallback: true
                });
                if (logs.length > 1000) logs.splice(0, logs.length - 1000);
                localStorage.setItem('audit_logs', JSON.stringify(logs));
            } catch (e) {
                console.warn('⚠️ Não foi possível registrar log localmente');
            }
        }
    }

    /**
     * Registra consentimento LGPD
     */
    async registrarConsentimento(participanteId, versao = '3.0', ip = '0.0.0.0') {
        const log = {
            participante_id: participanteId,
            acao: 'consentimento_lgpd',
            versao: versao,
            ip: ip,
            user_agent: navigator?.userAgent || '',
            data: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('logs_consentimento')
            .insert(log)
            .select()
            .single();

        if (error) {
            console.warn('⚠️ Erro ao registrar consentimento:', error);
            // Fallback localStorage
            const logs = JSON.parse(localStorage.getItem('consentimento_logs') || '[]');
            logs.push(log);
            localStorage.setItem('consentimento_logs', JSON.stringify(logs));
        }

        return data;
    }

    /**
     * Registra revogação de consentimento
     */
    async registrarRevogacao(participanteId, ip = '0.0.0.0') {
        const log = {
            participante_id: participanteId,
            acao: 'revogacao_consentimento',
            ip: ip,
            user_agent: navigator?.userAgent || '',
            data: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('logs_consentimento')
            .insert(log)
            .select()
            .single();

        if (error) {
            console.warn('⚠️ Erro ao registrar revogação:', error);
        }

        return data;
    }

    /**
     * Registra início de teste
     */
    async registrarInicioTeste(participanteId, testeId, testeTipo) {
        return this.registrarAcao(participanteId, 'teste_iniciado', {
            teste_id: testeId,
            tipo: testeTipo
        });
    }

    /**
     * Registra conclusão de teste
     */
    async registrarConclusaoTeste(participanteId, testeId, testeTipo, resultadoId) {
        return this.registrarAcao(participanteId, 'teste_concluido', {
            teste_id: testeId,
            tipo: testeTipo,
            resultado_id: resultadoId
        });
    }

    /**
     * Registra geração de relatório
     */
    async registrarRelatorioGerado(participanteId, relatorioId, tipo) {
        return this.registrarAcao(participanteId, 'relatorio_gerado', {
            relatorio_id: relatorioId,
            tipo: tipo
        });
    }

    /**
     * Registra geração de laudo
     */
    async registrarLaudoGerado(participanteId, laudoId) {
        return this.registrarAcao(participanteId, 'laudo_gerado', {
            laudo_id: laudoId
        });
    }

    /**
     * Busca logs de um participante (Direito de Acesso - LGPD)
     */
    async buscarLogsParticipante(participanteId) {
        const { data, error } = await supabase
            .from('logs_auditoria')
            .select('*')
            .eq('usuario_id', participanteId)
            .order('data', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Busca logs de consentimento de um participante
     */
    async buscarLogsConsentimento(participanteId) {
        const { data, error } = await supabase
            .from('logs_consentimento')
            .select('*')
            .eq('participante_id', participanteId)
            .order('data', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Busca todos os dados de um participante (LGPD - Portabilidade)
     */
    async buscarTodosDadosParticipante(participanteId) {
        const [participante, resultados, respostas, relatorios, laudos, logsAuditoria, logsConsentimento] = await Promise.all([
            supabase.from('participantes').select('*').eq('id', participanteId).single(),
            supabase.from('resultados').select('*').eq('participante_id', participanteId),
            supabase.from('respostas').select('*').eq('participante_id', participanteId),
            supabase.from('relatorios').select('*').eq('participante_id', participanteId),
            supabase.from('laudos').select('*').eq('participante_id', participanteId),
            supabase.from('logs_auditoria').select('*').eq('usuario_id', participanteId),
            supabase.from('logs_consentimento').select('*').eq('participante_id', participanteId)
        ]);

        return {
            participante: participante.data,
            resultados: resultados.data || [],
            respostas: respostas.data || [],
            relatorios: relatorios.data || [],
            laudos: laudos.data || [],
            logs_auditoria: logsAuditoria.data || [],
            logs_consentimento: logsConsentimento.data || [],
            data_exportacao: new Date().toISOString()
        };
    }
}

export default new AuditService();
