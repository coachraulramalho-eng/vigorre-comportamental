/**
 * ============================================
 * VIGORRE ONE™ - GERADOR DE INSIGHTS
 * ============================================
 */

class GeradorInsights {
    constructor() {
        this.vigorAI = window.vigorAI || new VigorAI();
    }

    /**
     * Gera insights para o dashboard executivo
     */
    gerarInsightsDashboard(resultados) {
        const cruzamento = this.vigorAI.cruzarDados(resultados);
        const insights = this.vigorAI.gerarInsightsExecutivos(cruzamento);

        return {
            titulo: '📊 People Analytics - Insights Inteligentes',
            data_atualizacao: new Date().toISOString(),
            cards: [
                {
                    icone: '🧬',
                    titulo: 'Perfil Predominante',
                    valor: cruzamento.disc ? `${cruzamento.disc.perfil.icone} ${cruzamento.disc.perfil.nome}` : 'Não disponível',
                    cor: '#D97706'
                },
                {
                    icone: '❤️',
                    titulo: 'Inteligência Emocional',
                    valor: cruzamento.ie ? `${cruzamento.ie.nivel_geral} (${cruzamento.ie.indice_geral}%)` : 'Não disponível',
                    cor: cruzamento.ie && cruzamento.ie.indice_geral >= 60 ? '#10B981' : '#F59E0B'
                },
                {
                    icone: '🎯',
                    titulo: 'Score de Liderança',
                    valor: `${insights.score_lideranca}%`,
                    cor: insights.score_lideranca >= 70 ? '#10B981' : insights.score_lideranca >= 50 ? '#F59E0B' : '#EF4444'
                },
                {
                    icone: '🚀',
                    titulo: 'Score de Potencial',
                    valor: `${insights.score_potencial}%`,
                    cor: insights.score_potencial >= 70 ? '#10B981' : insights.score_potencial >= 50 ? '#F59E0B' : '#EF4444'
                }
            ],
            forcas: insights.forcas,
            desafios: insights.desafios,
            recomendacoes: insights.recomendacoes,
            insights_cruzados: cruzamento.insights.map(i => ({
                tipo: i.tipo,
                titulo: i.titulo,
                descricao: i.descricao
            })),
            tendencias: cruzamento.tendencias.map(t => ({
                area: t.area,
                tendencia: t.tendencia,
                descricao: t.descricao
            })),
            conflitos: cruzamento.conflitos.map(c => ({
                tipo: c.tipo,
                descricao: c.descricao
            })),
            sinergias: cruzamento.sinergias.map(s => ({
                tipo: s.tipo,
                descricao: s.descricao
            }))
        };
    }

    /**
     * Gera insights em linguagem natural
     */
    gerarInsightsNaturais(insights) {
        let texto = '';

        // Introdução
        texto += '🧠 **Análise Inteligente do Perfil**\n\n';

        // Perfil
        const perfil = insights.cards.find(c => c.icone === '🧬');
        if (perfil) {
            texto += `📌 **Perfil Comportamental:** ${perfil.valor}\n\n`;
        }

        // IE
        const ie = insights.cards.find(c => c.icone === '❤️');
        if (ie) {
            texto += `❤️ **Inteligência Emocional:** ${ie.valor}\n\n`;
        }

        // Scores
        const lideranca = insights.cards.find(c => c.icone === '🎯');
        const potencial = insights.cards.find(c => c.icone === '🚀');
        if (lideranca && potencial) {
            texto += `📊 **Scores:** Liderança ${lideranca.valor} | Potencial ${potencial.valor}\n\n`;
        }

        // Forças
        if (insights.forcas.length > 0) {
            texto += '💪 **Pontos Fortes:**\n';
            insights.forcas.forEach(f => { texto += `  ✅ ${f}\n`; });
            texto += '\n';
        }

        // Desafios
        if (insights.desafios.length > 0) {
            texto += '📈 **Áreas de Desenvolvimento:**\n';
            insights.desafios.forEach(d => { texto += `  📌 ${d}\n`; });
            texto += '\n';
        }

        // Recomendações
        if (insights.recomendacoes.length > 0) {
            texto += '🎯 **Recomendações:**\n';
            insights.recomendacoes.forEach(r => { texto += `  ✅ ${r}\n`; });
            texto += '\n';
        }

        // Insights cruzados
        if (insights.insights_cruzados.length > 0) {
            texto += '🧠 **Insights da IA:**\n';
            insights.insights_cruzados.forEach(i => {
                texto += `  💡 ${i.titulo}: ${i.descricao}\n`;
            });
            texto += '\n';
        }

        // Sinergias e conflitos
        if (insights.sinergias.length > 0) {
            texto += '✨ **Sinergias Identificadas:**\n';
            insights.sinergias.forEach(s => { texto += `  ✅ ${s.descricao}\n`; });
            texto += '\n';
        }

        if (insights.conflitos.length > 0) {
            texto += '⚠️ **Potenciais Conflitos:**\n';
            insights.conflitos.forEach(c => { texto += `  ⚠️ ${c.descricao}\n`; });
            texto += '\n';
        }

        // Tendencias
        if (insights.tendencias.length > 0) {
            texto += '📈 **Tendências Comportamentais:**\n';
            insights.tendencias.forEach(t => {
                texto += `  📊 ${t.area}: ${t.tendencia} - ${t.descricao}\n`;
            });
            texto += '\n';
        }

        // Conclusão
        texto += '---\n';
        texto += '🌟 *Este relatório foi gerado pela VIGOR AI™, a Inteligência Artificial exclusiva da Vigorre.*\n';
        texto += `📅 *Atualizado em ${new Date().toISOString().split('T')[0]}*`;

        return texto;
    }
}

if (typeof window !== 'undefined') {
    window.GeradorInsights = GeradorInsights;
    console.log('💡 Gerador de Insights carregado com sucesso!');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeradorInsights;
}
