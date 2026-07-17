// ============================================
// RELATORIO SERVICE - VIGORRE ONE™
// Serviço para geração de relatórios executivos
// ============================================

import supabase from '../supabase-config.js';
import algorithms from '../algorithms/index.js';
import CreditoService from './credito-service.js';

class RelatorioService {
    
    /**
     * Gera um relatório executivo para um teste específico
     * @param {string} participanteId - ID do participante
     * @param {string} empresaId - ID da empresa
     * @param {string} testeId - ID do teste
     * @returns {Object} Relatório gerado
     */
    async gerarRelatorio(participanteId, empresaId, testeId) {
        try {
            // 1. Reserva crédito
            const reserva = await CreditoService.reservarCredito(
                empresaId,
                'relatorio',
                participanteId,
                testeId
            );

            // 2. Busca dados do participante
            const { data: participante, error: participanteError } = await supabase
                .from('participantes')
                .select('*')
                .eq('id', participanteId)
                .single();

            if (participanteError) throw participanteError;

            // 3. Busca resultado do teste
            const { data: resultado, error: resultadoError } = await supabase
                .from('resultados')
                .select('*')
                .eq('participante_id', participanteId)
                .eq('teste_id', testeId)
                .single();

            if (resultadoError) throw resultadoError;

            // 4. Monta relatório
            const relatorio = this.montarRelatorio(participante, resultado);

            // 5. Salva no banco
            const { data: relatorioSalvo, error: saveError } = await supabase
                .from('relatorios')
                .insert({
                    participante_id: participanteId,
                    empresa_id: empresaId,
                    teste_id: testeId,
                    conteudo: relatorio,
                    data_geracao: new Date().toISOString()
                })
                .select()
                .single();

            if (saveError) throw saveError;

            // 6. Confirma consumo do crédito
            await CreditoService.confirmarConsumo(reserva.id);

            // 7. Log de auditoria
            await this._logAuditoria(participanteId, 'relatorio_gerado', { relatorioId: relatorioSalvo.id });

            return relatorioSalvo;

        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            throw error;
        }
    }

    /**
     * Monta o relatório baseado no tipo de teste
     */
    montarRelatorio(participante, resultado) {
        const dados = resultado.resultados;
        const tipo = dados.tipo || resultado.tipo;

        const base = {
            identificacao: {
                nome: participante.nome,
                email: participante.email,
                cargo: participante.cargo || 'Não informado',
                empresa: participante.empresa_nome || 'Não informado',
                data_geracao: new Date().toISOString(),
                tipo_teste: tipo,
                id: participante.id
            },
            metodologia: {
                nome: 'VIGOR®',
                versao: '3.0',
                descricao: 'Metodologia proprietária de Inteligência Humana'
            }
        };

        switch (tipo) {
            case 'disc':
                return { ...base, ...this._montarRelatorioDISC(dados) };
            case 'bigfive':
                return { ...base, ...this._montarRelatorioBigFive(dados) };
            case 'ie':
                return { ...base, ...this._montarRelatorioIE(dados) };
            case 'valores':
                return { ...base, ...this._montarRelatorioValores(dados) };
            case 'swot':
                return { ...base, ...this._montarRelatorioSWOT(dados) };
            default:
                return { ...base, dados, mensagem: 'Tipo de teste não reconhecido' };
        }
    }

    /**
     * Monta relatório DISC
     */
    _montarRelatorioDISC(dados) {
        const profile = dados.profile || {};
        const scores = dados.normalized || {};

        const cores = {
            D: '#EF4444',
            I: '#F59E0B',
            S: '#10B981',
            C: '#3B82F6'
        };

        const nomes = {
            D: 'Dominância',
            I: 'Influência',
            S: 'Estabilidade',
            C: 'Conformidade'
        };

        const descricoes = {
            D: 'Orientado a resultados, direto, competitivo e decidido',
            I: 'Comunicativo, persuasivo, otimista e entusiasta',
            S: 'Paciente, confiável, colaborativo e previsível',
            C: 'Detalhista, preciso, analítico e sistemático'
        };

        const fortes = {
            D: ['Tomada de decisão rápida', 'Foco em resultados', 'Liderança natural', 'Iniciativa'],
            I: ['Comunicação eficaz', 'Networking', 'Capacidade de persuasão', 'Entusiasmo'],
            S: ['Confiabilidade', 'Trabalho em equipe', 'Paciência', 'Estabilidade'],
            C: ['Atenção aos detalhes', 'Análise criteriosa', 'Precisão', 'Sistemática']
        };

        const desenv = {
            D: ['Impaciência', 'Dificuldade com processos', 'Pode ser visto como agressivo'],
            I: ['Falta de organização', 'Dificuldade com detalhes', 'Pode ser visto como superficial'],
            S: ['Resistência a mudanças', 'Dificuldade com decisões rápidas'],
            C: ['Excesso de análise', 'Dificuldade com mudanças', 'Pode ser visto como rígido']
        };

        const recom = {
            D: 'Pratique paciência e escuta ativa, desenvolva empatia',
            I: 'Melhore organização e follow-up, pratique objetividade',
            S: 'Fortaleça tomada de decisão, seja mais assertivo',
            C: 'Desenvolva flexibilidade, confie mais na intuição'
        };

        const ambientes = {
            D: 'Vendas, gestão, empreendedorismo, liderança',
            I: 'Marketing, relações públicas, treinamento, consultoria',
            S: 'Suporte, atendimento, operações, administração',
            C: 'Controle de qualidade, auditoria, pesquisa, engenharia'
        };

        const primary = profile.primary || 'D';
        const primaryName = profile.primaryName || 'Dominância';

        return {
            perfil: {
                principal: primaryName,
                tipo: profile.type || 'moderate',
                primary: primary,
                primaryName: primaryName,
                primaryScore: profile.primaryScore || 0,
                secondary: profile.secondary || null,
                secondaryName: profile.secondaryName || null,
                secondaryScore: profile.secondaryScore || 0
            },
            scores: scores,
            grafico: {
                D: scores.D || 0,
                I: scores.I || 0,
                S: scores.S || 0,
                C: scores.C || 0
            },
            descricao: descricoes[primary] || 'Perfil comportamental equilibrado',
            pontos_fortes: fortes[primary] || ['Adaptabilidade', 'Versatilidade'],
            pontos_desenvolvimento: desenv[primary] || ['Em desenvolvimento', 'Áreas a melhorar'],
            recomendacoes: recom[primary] || 'Continue desenvolvendo todos os aspectos do seu perfil',
            ambientes_ideais: ambientes[primary] || 'Ambientes colaborativos e desafiadores',
            cores: cores
        };
    }

    /**
     * Monta relatório Big Five
     */
    _montarRelatorioBigFive(dados) {
        const scores = dados.normalized || {};
        const nomes = {
            O: 'Abertura à Experiência',
            C: 'Conscienciosidade',
            E: 'Extroversão',
            A: 'Amabilidade',
            N: 'Neuroticismo'
        };

        const cores = {
            O: '#8B5CF6',
            C: '#10B981',
            E: '#F59E0B',
            A: '#EC4899',
            N: '#EF4444'
        };

        const icones = {
            O: '🎨',
            C: '📋',
            E: '🗣️',
            A: '💝',
            N: '🌊'
        };

        const descricoes = {
            O: 'Criativo, curioso, mente aberta e apreciador de novas experiências',
            C: 'Organizado, disciplinado, confiável e orientado a metas',
            E: 'Sociável, energético, assertivo e comunicativo',
            A: 'Cooperativo, empático, confiável e gentil',
            N: 'Sensível, reativo, ansioso e emocionalmente instável'
        };

        const maior = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

        return {
            scores: scores,
            perfil_predominante: {
                dimensao: maior?.[0] || 'N/A',
                nome: maior ? nomes[maior[0]] : 'N/A',
                score: maior?.[1] || 0,
                icone: maior ? icones[maior[0]] : '🧠',
                cor: maior ? cores[maior[0]] : '#94A3B8',
                descricao: maior ? descricoes[maior[0]] : 'Perfil equilibrado'
            },
            grafico: scores,
            cores: cores,
            icones: icones,
            descricoes: descricoes,
            recomendacoes: this._getRecomendacoesBigFive(scores)
        };
    }

    _getRecomendacoesBigFive(scores) {
        const recs = [];
        const dicas = {
            O: 'Explore novas experiências e saia da zona de conforto',
            C: 'Desenvolva organização e disciplina com ferramentas de produtividade',
            E: 'Fortaleça sua rede de contatos e habilidades de comunicação',
            A: 'Desenvolva empatia e pratique colaboração',
            N: 'Pratique mindfulness e técnicas de controle emocional'
        };

        Object.entries(scores).forEach(([dim, score]) => {
            if (score < 40) {
                recs.push({ dimensao: dim, recomendacao: dicas[dim] || `Desenvolva ${dim}` });
            }
        });

        if (recs.length === 0) {
            recs.push({ dimensao: 'Geral', recomendacao: 'Continue desenvolvendo todas as dimensões' });
        }

        return recs;
    }

    /**
     * Monta relatório Inteligência Emocional
     */
    _montarRelatorioIE(dados) {
        const dimensions = dados.dimensions || {};
        const generalIndex = dados.generalIndex || 0;
        const level = dados.level || { label: 'Em Progresso', color: '#EF4444' };

        const nomes = {
            self_awareness: 'Autoconsciência',
            self_regulation: 'Autorregulação',
            motivation: 'Motivação',
            empathy: 'Empatia',
            social_skills: 'Habilidades Sociais'
        };

        const cores = {
            self_awareness: '#8B5CF6',
            self_regulation: '#3B82F6',
            motivation: '#10B981',
            empathy: '#EC4899',
            social_skills: '#F59E0B'
        };

        const icones = {
            self_awareness: '🧠',
            self_regulation: '⚖️',
            motivation: '🔥',
            empathy: '❤️',
            social_skills: '🤝'
        };

        return {
            indice_geral: generalIndex,
            nivel: level,
            dimensoes: dimensions,
            grafico: dimensions,
            cores: cores,
            icones: icones,
            nomes: nomes,
            recomendacoes: this._getRecomendacoesIE(dimensions),
            pontos_fortes: Object.entries(dimensions)
                .filter(([k, v]) => v >= 60)
                .map(([k]) => nomes[k] || k),
            pontos_desenvolvimento: Object.entries(dimensions)
                .filter(([k, v]) => v < 50)
                .map(([k]) => nomes[k] || k)
        };
    }

    _getRecomendacoesIE(dimensions) {
        const recs = [];
        const dicas = {
            self_awareness: 'Pratique autoconhecimento com diário emocional e meditação',
            self_regulation: 'Desenvolva técnicas de respiração e pausa antes de reagir',
            motivation: 'Encontre seu propósito e estabeleça metas claras',
            empathy: 'Pratique escuta ativa e tente ver situações pelo olhar do outro',
            social_skills: 'Participe de atividades em grupo e pratique comunicação'
        };

        Object.entries(dimensions).forEach(([dim, score]) => {
            if (score < 50) {
                recs.push({ dimensao: dim, recomendacao: dicas[dim] || `Desenvolva ${dim}` });
            }
        });

        if (recs.length === 0) {
            recs.push({ dimensao: 'Geral', recomendacao: 'Continue mantendo seu bom desenvolvimento emocional' });
        }

        return recs;
    }

    /**
     * Monta relatório Valores
     */
    _montarRelatorioValores(dados) {
        const ranking = dados.ranking || [];
        const top5 = dados.top5 || [];
        const top1 = dados.top1 || null;

        const cores = {
            realizacao: '#EF4444',
            reconhecimento: '#F59E0B',
            seguranca: '#10B981',
            autonomia: '#3B82F6',
            aprendizado: '#8B5CF6',
            colaboracao: '#EC4899',
            estabilidade: '#6366F1',
            inovacao: '#14B8A6',
            proposito: '#F472B6',
            etica: '#22D3EE',
            qualidade_vida: '#A3E635',
            resultado: '#FB923C'
        };

        const icones = {
            realizacao: '🏆',
            reconhecimento: '👏',
            seguranca: '🛡️',
            autonomia: '🚀',
            aprendizado: '📚',
            colaboracao: '🤝',
            estabilidade: '📋',
            inovacao: '💡',
            proposito: '🎯',
            etica: '⚖️',
            qualidade_vida: '🌿',
            resultado: '📈'
        };

        const descricoes = {
            realizacao: 'Busca por conquistas e metas desafiadoras',
            reconhecimento: 'Desejo de ser valorizado e reconhecido',
            seguranca: 'Necessidade de estabilidade e previsibilidade',
            autonomia: 'Desejo de independência e liberdade',
            aprendizado: 'Busca por conhecimento e desenvolvimento',
            colaboracao: 'Valorização do trabalho em equipe',
            estabilidade: 'Preferência por ambientes estruturados',
            inovacao: 'Criatividade e busca por novidades',
            proposito: 'Sentido de contribuição e impacto',
            etica: 'Compromisso com integridade e transparência',
            qualidade_vida: 'Equilíbrio entre vida pessoal e profissional',
            resultado: 'Foco em entregas e desempenho'
        };

        return {
            ranking: ranking,
            top5: top5,
            top1: top1,
            cores: cores,
            icones: icones,
            descricoes: descricoes,
            recomendacoes: this._getRecomendacoesValores(top1)
        };
    }

    _getRecomendacoesValores(top1) {
        if (!top1) return ['Explore seus valores pessoais'];

        const dicas = {
            realizacao: 'Busque posições com metas desafiadoras e oportunidades de crescimento',
            reconhecimento: 'Procure ambientes que valorizam feedback e reconhecimento público',
            seguranca: 'Busque empresas estáveis e consolidadas no mercado',
            autonomia: 'Procure posições com liberdade de ação e tomada de decisão',
            aprendizado: 'Invista em cursos, certificações e desenvolvimento contínuo',
            colaboracao: 'Procure ambientes colaborativos com trabalho em equipe',
            estabilidade: 'Busque processos claros, definidos e previsíveis',
            inovacao: 'Procure ambientes que incentivam criatividade e inovação',
            proposito: 'Busque empresas com propósito social e impacto positivo',
            etica: 'Procure ambientes com integridade e transparência',
            qualidade_vida: 'Busque equilíbrio entre vida pessoal e profissional',
            resultado: 'Procure ambientes orientados a resultados e performance'
        };

        return [dicas[top1.key] || 'Alinhe sua carreira com seus valores'];
    }

    /**
     * Monta relatório SWOT
     */
    _montarRelatorioSWOT(dados) {
        const scores = dados.scores || {};
        const analysis = dados.analysis || {};
        const recomendacao = dados.recomendacao || {};

        const cores = {
            forcas: '#10B981',
            fraquezas: '#EF4444',
            oportunidades: '#3B82F6',
            ameacas: '#F59E0B'
        };

        const icones = {
            forcas: '💪',
            fraquezas: '⚠️',
            oportunidades: '🌟',
            ameacas: '⚡'
        };

        const nomes = {
            forcas: 'Forças',
            fraquezas: 'Fraquezas',
            oportunidades: 'Oportunidades',
            ameacas: 'Ameaças'
        };

        return {
            scores: scores,
            analysis: analysis,
            recomendacao: recomendacao,
            cores: cores,
            icones: icones,
            nomes: nomes,
            grafico: scores,
            estrategia: recomendacao.estrategia || 'Equilíbrio',
            descricao_estrategica: recomendacao.descricao || 'Mantenha o equilíbrio e continue se desenvolvendo',
            acoes: recomendacao.acoes || ['Continue com seu plano atual', 'Busque feedback regular', 'Mantenha-se atualizado']
        };
    }

    /**
     * Busca todos os relatórios de um participante
     */
    async listarRelatorios(participanteId) {
        const { data, error } = await supabase
            .from('relatorios')
            .select('*')
            .eq('participante_id', participanteId)
            .order('data_geracao', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Busca um relatório específico
     */
    async buscarRelatorio(relatorioId) {
        const { data, error } = await supabase
            .from('relatorios')
            .select('*')
            .eq('id', relatorioId)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Log de auditoria
     */
    async _logAuditoria(participanteId, acao, dados) {
        try {
            await supabase
                .from('logs_auditoria')
                .insert({
                    participante_id: participanteId,
                    acao: acao,
                    dados: dados || {},
                    data: new Date().toISOString()
                });
        } catch (error) {
            console.warn('⚠️ Erro ao registrar log de auditoria:', error);
        }
    }
}

export default new RelatorioService();
