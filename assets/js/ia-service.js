/**
 * ============================================
 * VIGORRE ONE™ - SERVIÇO DE INTELIGÊNCIA ARTIFICIAL
 * ============================================
 * 
 * Este módulo gerencia todas as funcionalidades de IA da plataforma:
 * - Recomendações personalizadas
 * - Análise de perfis
 * - Detecção de padrões
 * - Sugestões de desenvolvimento
 * - Alertas e insights
 * ============================================
 */

class IAService {
    constructor() {
        this.cache = {};
        this.initialized = false;
    }

    /**
     * Inicializa o serviço de IA
     */
    init() {
        if (this.initialized) return;
        console.log('🧠 Serviço de IA inicializado');
        this.initialized = true;
    }

    /**
     * Analisa um perfil completo e gera recomendações
     * @param {Object} profile - Perfil do participante (DISC, Big Five, IE, Valores, SWOT)
     * @returns {Object} Recomendações personalizadas
     */
    analyzeProfile(profile) {
        const recommendations = {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: [],
            overall: '',
            leadership: '',
            communication: '',
            development: []
        };

        // ============================================
        // 1. ANÁLISE DISC
        // ============================================
        if (profile.disc) {
            const disc = profile.disc;
            const dominant = disc.dominant || 'D';
            const pcts = disc.percentages || {};

            // Forças DISC
            if (pcts[dominant] >= 70) {
                recommendations.strengths.push(
                    `🦁 ${dominant === 'D' ? 'Dominância' : dominant === 'I' ? 'Influência' : dominant === 'S' ? 'Estabilidade' : 'Conformidade'} muito alta (${pcts[dominant]}%)`
                );
            }

            // Fraquezas DISC
            const weak = Object.entries(pcts).sort((a, b) => a[1] - b[1])[0];
            if (weak && weak[1] < 40) {
                recommendations.weaknesses.push(
                    `📉 ${weak[0] === 'D' ? 'Dominância' : weak[0] === 'I' ? 'Influência' : weak[0] === 'S' ? 'Estabilidade' : 'Conformidade'} baixa (${weak[1]}%) - desenvolver esta área`
                );
            }

            // Perfil de liderança DISC
            if (dominant === 'D' && pcts.D >= 70) {
                recommendations.leadership = '🦁 Líder diretivo e orientado a resultados. Excelente para gestão e tomada de decisão.';
            } else if (dominant === 'I' && pcts.I >= 70) {
                recommendations.leadership = '🦚 Líder inspirador e comunicativo. Excelente para motivar equipes e vendas.';
            } else if (dominant === 'S' && pcts.S >= 70) {
                recommendations.leadership = '🐘 Líder colaborativo e acolhedor. Excelente para RH, suporte e mediação.';
            } else if (dominant === 'C' && pcts.C >= 70) {
                recommendations.leadership = '🦉 Líder analítico e estratégico. Excelente para planejamento e qualidade.';
            } else {
                recommendations.leadership = '⚖️ Líder equilibrado e adaptável. Capacidade de se ajustar a diferentes contextos.';
            }
        }

        // ============================================
        // 2. ANÁLISE BIG FIVE
        // ============================================
        if (profile.bigfive) {
            const bf = profile.bigfive;
            const top = bf.topFactor || 'abertura';
            const pcts = bf.percentages || {};

            const factorNames = {
                abertura: 'Abertura',
                conscienciosidade: 'Conscienciosidade',
                extroversao: 'Extroversão',
                amabilidade: 'Amabilidade',
                neuroticismo: 'Neuroticismo'
            };

            if (pcts[top] >= 70) {
                recommendations.strengths.push(
                    `🧬 ${factorNames[top] || top} muito alta (${pcts[top]}%)`
                );
            }

            // Perfil de comunicação Big Five
            if (bf.extroversao >= 70) {
                recommendations.communication = '🌟 Comunicação extrovertida e energética. Excelente para falar em público e networking.';
            } else if (bf.extroversao <= 30) {
                recommendations.communication = '📝 Comunicação introvertida e reflexiva. Excelente para escrita, análise e planejamento.';
            } else {
                recommendations.communication = '⚖️ Comunicação equilibrada. Adapta-se bem a diferentes públicos e contextos.';
            }

            // Análise de estresse (neuroticismo)
            if (bf.neuroticismo >= 60) {
                recommendations.weaknesses.push(
                    `🌊 Neuroticismo elevado (${bf.neuroticismo}%) - recomenda-se desenvolvimento de regulação emocional`
                );
                recommendations.development.push('🧘 Praticar mindfulness e técnicas de respiração para reduzir ansiedade');
            }
        }

        // ============================================
        // 3. ANÁLISE IE (Inteligência Emocional)
        // ============================================
        if (profile.ie) {
            const ie = profile.ie;
            const overall = ie.overallPercentage || 0;
            const pcts = ie.percentages || {};

            if (overall >= 70) {
                recommendations.strengths.push(`🧠 Inteligência Emocional elevada (${overall}%) - excelente base para liderança`);
            } else if (overall < 50) {
                recommendations.weaknesses.push(`🧠 Inteligência Emocional em desenvolvimento (${overall}%) - área prioritária`);
                recommendations.development.push('📚 Investir em treinamentos de inteligência emocional');
            }

            // Análise por pilar
            if (pcts.autoconsciencia >= 70) {
                recommendations.strengths.push('🔍 Autoconsciência elevada - bom autoconhecimento');
            }
            if (pcts.autorregulacao >= 70) {
                recommendations.strengths.push('🧘 Autorregulação elevada - bom controle emocional');
            }
            if (pcts.empatia >= 70) {
                recommendations.strengths.push('❤️ Empatia elevada - boa capacidade de conexão com pessoas');
            }
            if (pcts.habilidades_sociais >= 70) {
                recommendations.strengths.push('🤝 Habilidades sociais elevadas - boa comunicação e relacionamento');
            }
        }

        // ============================================
        // 4. ANÁLISE VALORES
        // ============================================
        if (profile.valores) {
            const valores = profile.valores;
            const top = valores.topValor || 'autodirecao';
            const pcts = valores.percentages || {};

            const valorNames = {
                poder: 'Poder',
                realizacao: 'Realização',
                hedonismo: 'Hedonismo',
                estimulacao: 'Estimulação',
                autodirecao: 'Autodireção',
                universalismo: 'Universalismo',
                benevolencia: 'Benevolência',
                tradicao: 'Tradição',
                conformidade: 'Conformidade',
                seguranca: 'Segurança'
            };

            if (pcts[top] >= 70) {
                recommendations.strengths.push(
                    `💎 ${valorNames[top] || top} muito alto (${pcts[top]}%) - forte alinhamento de valores`
                );
            }

            // Alinhamento com carreira
            if (top === 'autodirecao' || top === 'realizacao') {
                recommendations.opportunities.push('🚀 Perfil com forte orientação para empreendedorismo e inovação');
            }
            if (top === 'benevolencia' || top === 'universalismo') {
                recommendations.opportunities.push('🌍 Perfil com forte orientação para trabalho social e propósito');
            }
            if (top === 'seguranca' || top === 'conformidade') {
                recommendations.opportunities.push('🏛️ Perfil com forte orientação para estabilidade e estrutura');
            }
        }

        // ============================================
        // 5. ANÁLISE SWOT
        // ============================================
        if (profile.swot) {
            const swot = profile.swot;
            const pcts = swot.percentages || {};

            if (pcts.forcas >= 70) {
                recommendations.strengths.push(`💪 Forças muito significativas (${pcts.forcas}%)`);
            }
            if (pcts.fraquezas >= 50) {
                recommendations.weaknesses.push(`🔻 Fraquezas significativas (${pcts.fraquezas}%) - desenvolver plano de ação`);
            }
            if (pcts.oportunidades >= 70) {
                recommendations.opportunities.push(`🚀 Oportunidades abundantes (${pcts.oportunidades}%) - momento favorável`);
            }
            if (pcts.ameacas >= 50) {
                recommendations.threats.push(`⚠️ Ameaças significativas (${pcts.ameacas}%) - criar estratégias defensivas`);
            }
        }

        // ============================================
        // 6. RECOMENDAÇÕES GERAIS
        // ============================================
        // Recomendações de desenvolvimento
        if (recommendations.development.length === 0) {
            recommendations.development.push('📈 Continuar desenvolvendo todos os aspectos do perfil comportamental');
            recommendations.development.push('🔄 Buscar feedback regular de mentores e colegas');
            recommendations.development.push('📚 Investir em leitura e capacitação contínua');
        }

        // Recomendações de carreira
        if (profile.disc) {
            const disc = profile.disc;
            const dominant = disc.dominant || 'D';
            const careers = {
                D: ['Gestão Executiva', 'Empreendedorismo', 'Liderança de Projetos', 'Consultoria Estratégica'],
                I: ['Vendas', 'Marketing', 'Relações Públicas', 'Treinamento e Desenvolvimento'],
                S: ['Recursos Humanos', 'Atendimento ao Cliente', 'Suporte Técnico', 'Coordenação de Equipes'],
                C: ['Análise de Dados', 'Planejamento Estratégico', 'Qualidade e Processos', 'Auditoria']
            };
            recommendations.careers = careers[dominant] || ['Desenvolvimento de Carreira'];
        }

        // ============================================
        // 7. AVALIAÇÃO GERAL
        // ============================================
        const totalScore = (
            (profile.disc?.percentages?.[profile.disc.dominant] || 0) +
            (profile.bigfive?.percentages?.[profile.bigfive.topFactor] || 0) +
            (profile.ie?.overallPercentage || 0) +
            (profile.valores?.percentages?.[profile.valores.topValor] || 0) +
            (profile.swot?.percentages?.forcas || 0)
        ) / 5;

        let level = '';
        let levelIcon = '';
        if (totalScore >= 75) {
            level = 'Excelente';
            levelIcon = '🌟';
        } else if (totalScore >= 60) {
            level = 'Alto';
            levelIcon = '⭐';
        } else if (totalScore >= 45) {
            level = 'Bom';
            levelIcon = '👍';
        } else if (totalScore >= 30) {
            level = 'Em Desenvolvimento';
            levelIcon = '📈';
        } else {
            level = 'Atenção Prioritária';
            levelIcon = '⚠️';
        }

        recommendations.overall = `${levelIcon} Nível Geral: ${level} (${Math.round(totalScore)}%)`;

        // ============================================
        // 8. INSIGHTS ESPECIAIS
        // ============================================
        const insights = [];

        // Combinações especiais
        if (profile.disc?.dominant === 'D' && profile.bigfive?.topFactor === 'abertura') {
            insights.push('🦁🎨 Combinação Dominância + Abertura: Perfil de liderança inovadora e estratégica.');
        }
        if (profile.disc?.dominant === 'I' && profile.bigfive?.topFactor === 'extroversao') {
            insights.push('🦚🌟 Combinação Influência + Extroversão: Perfil de comunicação persuasiva e influência social.');
        }
        if (profile.disc?.dominant === 'S' && profile.bigfive?.topFactor === 'amabilidade') {
            insights.push('🐘💛 Combinação Estabilidade + Amabilidade: Perfil de suporte e colaboração excepcional.');
        }
        if (profile.disc?.dominant === 'C' && profile.bigfive?.topFactor === 'conscienciosidade') {
            insights.push('🦉📋 Combinação Conformidade + Conscienciosidade: Perfil de precisão e excelência técnica.');
        }

        if (profile.ie?.overallPercentage >= 70 && profile.disc?.dominant === 'D') {
            insights.push('🧠🦁 Alta IE + Dominância: Líder emocionalmente inteligente e inspirador.');
        }

        if (profile.ie?.overallPercentage < 50 && profile.disc?.dominant === 'D') {
            insights.push('⚠️ Baixa IE + Dominância: Risco de liderança autoritária. Desenvolver empatia e escuta ativa.');
        }

        recommendations.insights = insights;

        return recommendations;
    }

    /**
     * Gera alertas automáticos baseados no perfil
     * @param {Object} profile - Perfil do participante
     * @returns {Array} Lista de alertas
     */
    generateAlerts(profile) {
        const alerts = [];

        // Alerta 1: Inconsistência DISC
        if (profile.disc?.percentages) {
            const pcts = profile.disc.percentages;
            const values = Object.values(pcts);
            const max = Math.max(...values);
            const min = Math.min(...values);
            if (max - min < 20) {
                alerts.push({
                    level: 'info',
                    icon: '📊',
                    title: 'Perfil DISC equilibrado',
                    message: 'Seus fatores DISC estão bem equilibrados, indicando versatilidade e adaptabilidade.'
                });
            }
        }

        // Alerta 2: IE baixa
        if (profile.ie?.overallPercentage && profile.ie.overallPercentage < 45) {
            alerts.push({
                level: 'warning',
                icon: '⚠️',
                title: 'Inteligência Emocional em desenvolvimento',
                message: 'Sua IE está abaixo da média. Recomenda-se desenvolvimento em autorregulação e empatia.'
            });
        }

        // Alerta 3: Estresse elevado
        if (profile.bigfive?.percentages?.neuroticismo && profile.bigfive.percentages.neuroticismo > 60) {
            alerts.push({
                level: 'warning',
                icon: '🌊',
                title: 'Vulnerabilidade ao estresse',
                message: 'Seu neuroticismo está elevado. Pratique técnicas de mindfulness e regulação emocional.'
            });
        }

        // Alerta 4: Potencial de liderança
        if (profile.disc?.dominant === 'D' && profile.ie?.overallPercentage >= 60) {
            alerts.push({
                level: 'success',
                icon: '🌟',
                title: 'Potencial de liderança identificado',
                message: 'Seu perfil combina Dominância com boa IE. Excelente base para posições de liderança.'
            });
        }

        // Alerta 5: Oportunidades SWOT
        if (profile.swot?.percentages?.oportunidades && profile.swot.percentages.oportunidades > 60) {
            alerts.push({
                level: 'success',
                icon: '🚀',
                title: 'Oportunidades abundantes',
                message: 'Sua análise SWOT indica muitas oportunidades. Momento favorável para crescimento.'
            });
        }

        // Alerta 6: Ameaças SWOT
        if (profile.swot?.percentages?.ameacas && profile.swot.percentages.ameacas > 50) {
            alerts.push({
                level: 'warning',
                icon: '⚠️',
                title: 'Ameaças identificadas',
                message: 'Sua análise SWOT indica ameaças significativas. Crie estratégias defensivas.'
            });
        }

        return alerts;
    }

    /**
     * Gera um plano de desenvolvimento personalizado
     * @param {Object} profile - Perfil do participante
     * @param {number} months - Período em meses (3, 6, 12)
     * @returns {Object} Plano de desenvolvimento
     */
    generateDevelopmentPlan(profile, months = 6) {
        const plan = {
            shortTerm: [],
            mediumTerm: [],
            longTerm: [],
            overall: ''
        };

        // Curto prazo (1-3 meses)
        if (profile.ie?.overallPercentage < 50) {
            plan.shortTerm.push('🧘 Praticar mindfulness 10 minutos por dia');
            plan.shortTerm.push('📝 Manter diário de emoções e reações');
        }
        if (profile.disc?.percentages) {
            const weak = Object.entries(profile.disc.percentages).sort((a, b) => a[1] - b[1])[0];
            if (weak && weak[1] < 40) {
                const name = weak[0] === 'D' ? 'Dominância' : weak[0] === 'I' ? 'Influência' : weak[0] === 'S' ?
                    'Estabilidade' : 'Conformidade';
                plan.shortTerm.push(`📊 Desenvolver ${name}: Buscar oportunidades para praticar esta habilidade`);
            }
        }
        if (profile.bigfive?.percentages?.neuroticismo > 55) {
            plan.shortTerm.push('🧘 Praticar técnicas de respiração e relaxamento diariamente');
        }
        plan.shortTerm.push('📚 Ler um livro sobre desenvolvimento pessoal');

        // Médio prazo (3-6 meses)
        if (profile.disc?.dominant === 'D') {
            plan.mediumTerm.push('🎯 Participar de um curso de liderança e gestão de equipes');
        }
        if (profile.bigfive?.topFactor === 'abertura') {
            plan.mediumTerm.push('💡 Participar de workshops de criatividade e inovação');
        }
        if (profile.ie?.overallPercentage < 60) {
            plan.mediumTerm.push('🧠 Fazer um treinamento de Inteligência Emocional');
        }
        plan.mediumTerm.push('🤝 Buscar mentoria com um profissional experiente na área');

        // Longo prazo (6-12 meses)
        if (profile.disc?.dominant === 'D' || profile.bigfive?.topFactor === 'conscienciosidade') {
            plan.longTerm.push('🚀 Desenvolver um projeto de liderança ou empreendedorismo');
        }
        if (profile.valores?.topValor === 'universalismo' || profile.valores?.topValor === 'benevolencia') {
            plan.longTerm.push('🌍 Engajar-se em projetos de impacto social ou voluntariado');
        }
        plan.longTerm.push('📈 Avaliar progresso e ajustar plano anualmente');

        // Avaliação geral
        const totalScore = (
            (profile.disc?.percentages?.[profile.disc.dominant] || 0) +
            (profile.bigfive?.percentages?.[profile.bigfive.topFactor] || 0) +
            (profile.ie?.overallPercentage || 0) +
            (profile.valores?.percentages?.[profile.valores.topValor] || 0) +
            (profile.swot?.percentages?.forcas || 0)
        ) / 5;

        if (totalScore >= 70) {
            plan.overall = '🌟 Perfil de alto potencial. Continue desenvolvendo e compartilhando seu conhecimento.';
        } else if (totalScore >= 50) {
            plan.overall = '📈 Bom potencial. Com foco no plano de desenvolvimento, pode alcançar excelentes resultados.';
        } else {
            plan.overall = '📊 Potencial a ser desenvolvido. Com dedicação e as estratégias certas, pode transformar seu perfil.';
        }

        return plan;
    }

    /**
     * Compara dois perfis e gera análise de compatibilidade
     * @param {Object} profile1 - Perfil 1
     * @param {Object} profile2 - Perfil 2
     * @returns {Object} Análise de compatibilidade
     */
    compareProfiles(profile1, profile2) {
        const compatibility = {
            overall: 0,
            disc: 0,
            bigfive: 0,
            ie: 0,
            valores: 0,
            swot: 0,
            details: [],
            recommendation: ''
        };

        // Comparação DISC
        if (profile1.disc && profile2.disc) {
            const disc1 = profile1.disc.percentages || {};
            const disc2 = profile2.disc.percentages || {};
            let totalDiff = 0;
            let count = 0;
            for (const key of ['D', 'I', 'S', 'C']) {
                if (disc1[key] !== undefined && disc2[key] !== undefined) {
                    totalDiff += Math.abs(disc1[key] - disc2[key]);
                    count++;
                }
            }
            const avgDiff = count > 0 ? totalDiff / count : 0;
            compatibility.disc = Math.max(0, 100 - avgDiff);
            compatibility.details.push(`📊 DISC: ${Math.round(compatibility.disc)}% de compatibilidade`);
        }

        // Comparação Big Five
        if (profile1.bigfive && profile2.bigfive) {
            const bf1 = profile1.bigfive.percentages || {};
            const bf2 = profile2.bigfive.percentages || {};
            const factors = ['abertura', 'conscienciosidade', 'extroversao', 'amabilidade', 'neuroticismo'];
            let totalDiff = 0;
            let count = 0;
            for (const key of factors) {
                if (bf1[key] !== undefined && bf2[key] !== undefined) {
                    totalDiff += Math.abs(bf1[key] - bf2[key]);
                    count++;
                }
            }
            const avgDiff = count > 0 ? totalDiff / count : 0;
            compatibility.bigfive = Math.max(0, 100 - avgDiff);
            compatibility.details.push(`🧬 Big Five: ${Math.round(compatibility.bigfive)}% de compatibilidade`);
        }

        // Comparação IE
        if (profile1.ie && profile2.ie) {
            const ie1 = profile1.ie.percentages || {};
            const ie2 = profile2.ie.percentages || {};
            const pillars = ['autoconsciencia', 'autorregulacao', 'motivacao', 'empatia', 'habilidades_sociais'];
            let totalDiff = 0;
            let count = 0;
            for (const key of pillars) {
                if (ie1[key] !== undefined && ie2[key] !== undefined) {
                    totalDiff += Math.abs(ie1[key] - ie2[key]);
                    count++;
                }
            }
            const avgDiff = count > 0 ? totalDiff / count : 0;
            compatibility.ie = Math.max(0, 100 - avgDiff);
            compatibility.details.push(`🧠 IE: ${Math.round(compatibility.ie)}% de compatibilidade`);
        }

        // Média geral
        const scores = [compatibility.disc, compatibility.bigfive, compatibility.ie].filter(s => s > 0);
        compatibility.overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        // Recomendação
        if (compatibility.overall >= 80) {
            compatibility.recommendation = '🌟 Alta compatibilidade. Perfis muito alinhados, excelente para colaboração.';
        } else if (compatibility.overall >= 60) {
            compatibility.recommendation = '👍 Boa compatibilidade. Perfis complementares, podem gerar sinergia.';
        } else if (compatibility.overall >= 40) {
            compatibility.recommendation = '📊 Compatibilidade moderada. Perfis com diferenças que podem ser complementares.';
        } else {
            compatibility.recommendation = '⚠️ Baixa compatibilidade. Perfis com diferenças significativas, requer ajustes.';
        }

        return compatibility;
    }

    /**
     * Gera um resumo executivo do perfil
     * @param {Object} profile - Perfil do participante
     * @returns {string} Resumo executivo
     */
    generateExecutiveSummary(profile) {
        const disc = profile.disc?.dominant || 'D';
        const discName = { D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade' } [disc] || '--';
        const discIcon = { D: '🦁', I: '🦚', S: '🐘', C: '🦉' } [disc] || '📊';

        const bf = profile.bigfive?.topFactor || 'abertura';
        const bfName = {
            abertura: 'Abertura',
            conscienciosidade: 'Conscienciosidade',
            extroversao: 'Extroversão',
            amabilidade: 'Amabilidade',
            neuroticismo: 'Neuroticismo'
        } [bf] || '--';
        const bfIcon = {
            abertura: '🎨',
            conscienciosidade: '📋',
            extroversao: '🌟',
            amabilidade: '💛',
            neuroticismo: '🌊'
        } [bf] || '🧬';

        const ie = profile.ie?.overallPercentage || 0;
        const valores = profile.valores?.topValor || 'autodirecao';
        const valorName = {
            poder: 'Poder',
            realizacao: 'Realização',
            hedonismo: 'Hedonismo',
            estimulacao: 'Estimulação',
            autodirecao: 'Autodireção',
            universalismo: 'Universalismo',
            benevolencia: 'Benevolência',
            tradicao: 'Tradição',
            conformidade: 'Conformidade',
            seguranca: 'Segurança'
        } [valores] || '--';
        const valorIcon = {
            poder: '👑',
            realizacao: '🏆',
            hedonismo: '🎉',
            estimulacao: '⚡',
            autodirecao: '🧭',
            universalismo: '🌍',
            benevolencia: '🤗',
            tradicao: '📜',
            conformidade: '📋',
            seguranca: '🔒'
        } [valores] || '💎';

        const swot = profile.swot?.topSwot || 'oportunidades';
        const swotName = {
            forcas: 'Forças',
            fraquezas: 'Fraquezas',
            oportunidades: 'Oportunidades',
            ameacas: 'Ameaças'
        } [swot] || '--';
        const swotIcon = {
            forcas: '💪',
            fraquezas: '🔻',
            oportunidades: '🚀',
            ameacas: '⚠️'
        } [swot] || '📋';

        return `
            <strong>📊 Resumo do Perfil:</strong><br />
            • ${discIcon} <strong>DISC:</strong> ${discName} (Predominante)<br />
            • ${bfIcon} <strong>Big Five:</strong> ${bfName} (Destaque)<br />
            • 🧠 <strong>Inteligência Emocional:</strong> ${ie}% (Nível Geral)<br />
            • ${valorIcon} <strong>Valores:</strong> ${valorName} (Principal)<br />
            • ${swotIcon} <strong>SWOT:</strong> ${swotName} (Quadrante Principal)<br /><br />
            <strong>📌 Perfil Geral:</strong><br />
            Perfil com forte orientação a ${discName.toLowerCase()},
            destacando-se em ${bfName.toLowerCase()}. A Inteligência Emocional está em nível ${ie >= 70 ? 'elevado' : ie >= 50 ? 'moderado' : 'em desenvolvimento'},
            com valores guiados por ${valorName.toLowerCase()}. A análise SWOT indica ${swotName.toLowerCase()} como principal quadrante estratégico.
        `;
    }
}

// ============================================
// EXPORTAÇÃO
// ============================================
const iaService = new IAService();
window.iaService = iaService;

console.log('🧠 Serviço de IA carregado com sucesso!');
