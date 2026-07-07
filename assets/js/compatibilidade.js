/**
 * ============================================
 * VIGORRE ONE™ - MOTOR DE COMPATIBILIDADE
 * ============================================
 * 
 * Este módulo calcula a compatibilidade entre:
 * - Participante x Vaga (Job Profile)
 * - Participante x Empresa (Cultural Fit)
 * - Participante x Recrutador (Working Style)
 * - Participante x Equipe (Team Fit)
 * ============================================
 */

class CompatibilidadeService {
    constructor() {
        this.cache = {};
        this.weights = {
            disc: 0.25,
            bigfive: 0.20,
            ie: 0.20,
            valores: 0.20,
            swot: 0.15
        };
    }

    /**
     * Calcula compatibilidade geral entre participante e vaga
     * @param {Object} participante - Perfil do participante
     * @param {Object} vaga - Perfil ideal da vaga (Job Profile)
     * @returns {Object} Resultado da compatibilidade
     */
    calcularCompatibilidade(participante, vaga) {
        if (!participante || !vaga) {
            return { error: 'Dados insuficientes para calcular compatibilidade' };
        }

        const result = {
            overall: 0,
            disc: 0,
            bigfive: 0,
            ie: 0,
            valores: 0,
            swot: 0,
            cultural: 0,
            details: [],
            strengths: [],
            risks: [],
            recommendation: '',
            level: '',
            levelIcon: ''
        };

        // ============================================
        // 1. COMPATIBILIDADE DISC
        // ============================================
        if (participante.disc && vaga.disc) {
            const pDisc = participante.disc.percentages || {};
            const vDisc = vaga.disc.percentages || {};

            let totalDiff = 0;
            let count = 0;
            for (const key of ['D', 'I', 'S', 'C']) {
                if (pDisc[key] !== undefined && vDisc[key] !== undefined) {
                    totalDiff += Math.abs(pDisc[key] - vDisc[key]);
                    count++;
                }
            }
            const avgDiff = count > 0 ? totalDiff / count : 0;
            result.disc = Math.max(0, Math.min(100, 100 - avgDiff));

            if (result.disc >= 80) {
                result.strengths.push('📊 DISC: Alta compatibilidade comportamental');
            } else if (result.disc >= 60) {
                result.details.push('📊 DISC: Compatibilidade moderada');
            } else {
                result.risks.push('📊 DISC: Baixa compatibilidade - perfil comportamental pode não se alinhar');
            }
        }

        // ============================================
        // 2. COMPATIBILIDADE BIG FIVE
        // ============================================
        if (participante.bigfive && vaga.bigfive) {
            const pBf = participante.bigfive.percentages || {};
            const vBf = vaga.bigfive.percentages || {};
            const factors = ['abertura', 'conscienciosidade', 'extroversao', 'amabilidade', 'neuroticismo'];

            let totalDiff = 0;
            let count = 0;
            for (const key of factors) {
                if (pBf[key] !== undefined && vBf[key] !== undefined) {
                    totalDiff += Math.abs(pBf[key] - vBf[key]);
                    count++;
                }
            }
            const avgDiff = count > 0 ? totalDiff / count : 0;
            result.bigfive = Math.max(0, Math.min(100, 100 - avgDiff));

            if (result.bigfive >= 80) {
                result.strengths.push('🧬 Big Five: Alta compatibilidade de personalidade');
            } else if (result.bigfive >= 60) {
                result.details.push('🧬 Big Five: Compatibilidade moderada');
            } else {
                result.risks.push('🧬 Big Five: Baixa compatibilidade - diferenças significativas de personalidade');
            }
        }

        // ============================================
        // 3. COMPATIBILIDADE IE
        // ============================================
        if (participante.ie && vaga.ie) {
            const pIe = participante.ie.percentages || {};
            const vIe = vaga.ie.percentages || {};
            const pillars = ['autoconsciencia', 'autorregulacao', 'motivacao', 'empatia', 'habilidades_sociais'];

            let totalDiff = 0;
            let count = 0;
            for (const key of pillars) {
                if (pIe[key] !== undefined && vIe[key] !== undefined) {
                    totalDiff += Math.abs(pIe[key] - vIe[key]);
                    count++;
                }
            }
            const avgDiff = count > 0 ? totalDiff / count : 0;
            result.ie = Math.max(0, Math.min(100, 100 - avgDiff));

            // Avaliar nível geral de IE
            const pOverall = participante.ie.overallPercentage || 0;
            const vOverall = vaga.ie.overallPercentage || 60;

            if (pOverall >= vOverall) {
                result.strengths.push(`🧠 IE: Nível de IE atende ou supera o requisito (${pOverall}% vs ${vOverall}%)`);
            } else {
                result.risks.push(`🧠 IE: Nível de IE abaixo do requisito (${pOverall}% vs ${vOverall}%)`);
            }

            if (result.ie >= 80) {
                result.strengths.push('🧠 IE: Alta compatibilidade emocional');
            } else if (result.ie >= 60) {
                result.details.push('🧠 IE: Compatibilidade emocional moderada');
            } else {
                result.risks.push('🧠 IE: Baixa compatibilidade emocional - pode impactar relacionamentos');
            }
        }

        // ============================================
        // 4. COMPATIBILIDADE VALORES
        // ============================================
        if (participante.valores && vaga.valores) {
            const pVal = participante.valores.percentages || {};
            const vVal = vaga.valores.percentages || {};
            const valoresKeys = ['poder', 'realizacao', 'hedonismo', 'estimulacao', 'autodirecao', 'universalismo',
                'benevolencia', 'tradicao', 'conformidade', 'seguranca'
            ];

            let totalDiff = 0;
            let count = 0;
            for (const key of valoresKeys) {
                if (pVal[key] !== undefined && vVal[key] !== undefined) {
                    totalDiff += Math.abs(pVal[key] - vVal[key]);
                    count++;
                }
            }
            const avgDiff = count > 0 ? totalDiff / count : 0;
            result.valores = Math.max(0, Math.min(100, 100 - avgDiff));

            // Identificar alinhamento de valores principais
            const pTop = participante.valores.topValor || 'autodirecao';
            const vTop = vaga.valores.topValor || 'realizacao';

            if (pTop === vTop) {
                result.strengths.push(`💎 Valores: Valor principal alinhado (${pTop})`);
                result.details.push(`💎 Valores: Ambos valorizam ${pTop}`);
            } else {
                result.details.push(`💎 Valores: Valores principais diferentes (${pTop} vs ${vTop})`);
                result.details.push(`💎 Valores: Pode ser complementar ou desafiador`);
            }

            if (result.valores >= 80) {
                result.strengths.push('💎 Valores: Alta compatibilidade de valores');
            } else if (result.valores >= 60) {
                result.details.push('💎 Valores: Compatibilidade de valores moderada');
            } else {
                result.risks.push('💎 Valores: Baixa compatibilidade - diferenças significativas de valores');
            }
        }

        // ============================================
        // 5. COMPATIBILIDADE SWOT
        // ============================================
        if (participante.swot && vaga.swot) {
            const pSwot = participante.swot.percentages || {};
            const vSwot = vaga.swot.percentages || {};
            const swotKeys = ['forcas', 'fraquezas', 'oportunidades', 'ameacas'];

            let totalDiff = 0;
            let count = 0;
            for (const key of swotKeys) {
                if (pSwot[key] !== undefined && vSwot[key] !== undefined) {
                    totalDiff += Math.abs(pSwot[key] - vSwot[key]);
                    count++;
                }
            }
            const avgDiff = count > 0 ? totalDiff / count : 0;
            result.swot = Math.max(0, Math.min(100, 100 - avgDiff));

            if (result.swot >= 80) {
                result.strengths.push('📋 SWOT: Alta compatibilidade estratégica');
            } else if (result.swot >= 60) {
                result.details.push('📋 SWOT: Compatibilidade estratégica moderada');
            } else {
                result.risks.push('📋 SWOT: Baixa compatibilidade - visões estratégicas diferentes');
            }
        }

        // ============================================
        // 6. COMPATIBILIDADE CULTURAL
        // ============================================
        if (participante.valores && vaga.cultura) {
            const pVal = participante.valores.percentages || {};
            const cVal = vaga.cultura.percentages || {};

            if (Object.keys(cVal).length > 0) {
                let totalDiff = 0;
                let count = 0;
                for (const key of ['poder', 'realizacao', 'hedonismo', 'estimulacao', 'autodirecao', 'universalismo',
                        'benevolencia', 'tradicao', 'conformidade', 'seguranca'
                    ]) {
                    if (pVal[key] !== undefined && cVal[key] !== undefined) {
                        totalDiff += Math.abs(pVal[key] - cVal[key]);
                        count++;
                    }
                }
                const avgDiff = count > 0 ? totalDiff / count : 0;
                result.cultural = Math.max(0, Math.min(100, 100 - avgDiff));

                if (result.cultural >= 80) {
                    result.strengths.push('🏢 Cultural: Alta compatibilidade com a cultura organizacional');
                } else if (result.cultural >= 60) {
                    result.details.push('🏢 Cultural: Compatibilidade cultural moderada');
                } else {
                    result.risks.push('🏢 Cultural: Baixa compatibilidade - pode ter dificuldade de adaptação');
                }
            }
        }

        // ============================================
        // 7. CÁLCULO GERAL (PONDERADO)
        // ============================================
        const scores = [];
        const weights = [];

        if (result.disc > 0) { scores.push(result.disc);
            weights.push(this.weights.disc); }
        if (result.bigfive > 0) { scores.push(result.bigfive);
            weights.push(this.weights.bigfive); }
        if (result.ie > 0) { scores.push(result.ie);
            weights.push(this.weights.ie); }
        if (result.valores > 0) { scores.push(result.valores);
            weights.push(this.weights.valores); }
        if (result.swot > 0) { scores.push(result.swot);
            weights.push(this.weights.swot); }
        if (result.cultural > 0) { scores.push(result.cultural);
            weights.push(0.10); }

        if (scores.length > 0) {
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            result.overall = Math.round(scores.reduce((sum, score, i) => sum + (score * weights[i]), 0) / totalWeight);
        }

        // ============================================
        // 8. NÍVEL DE COMPATIBILIDADE
        // ============================================
        if (result.overall >= 80) {
            result.level = 'Excelente';
            result.levelIcon = '🌟';
            result.recommendation = 'Altamente recomendado para a função. Perfil muito alinhado com as demandas e cultura.';
        } else if (result.overall >= 65) {
            result.level = 'Boa';
            result.levelIcon = '👍';
            result.recommendation = 'Recomendado para a função. Com desenvolvimento direcionado, pode alcançar excelente performance.';
        } else if (result.overall >= 50) {
            result.level = 'Moderada';
            result.levelIcon = '📊';
            result.recommendation = 'Compatibilidade moderada. Recomenda-se desenvolvimento específico para melhor adequação.';
        } else if (result.overall >= 35) {
            result.level = 'Baixa';
            result.levelIcon = '⚠️';
            result.recommendation = 'Compatibilidade baixa. Avaliar outras posições mais alinhadas ao perfil.';
        } else {
            result.level = 'Muito Baixa';
            result.levelIcon = '❌';
            result.recommendation = 'Compatibilidade muito baixa. Perfil não recomendado para esta função.';
        }

        // ============================================
        // 9. INSIGHTS ADICIONAIS
        // ============================================
        if (participante.disc && vaga.disc) {
            const pDom = participante.disc.dominant || 'D';
            const vDom = vaga.disc.dominant || 'D';

            if (pDom === vDom) {
                result.details.push(`🔄 DISC: Mesmo perfil predominante (${pDom}) - forte alinhamento comportamental`);
            } else {
                result.details.push(`🔄 DISC: Perfis complementares (${pDom} vs ${vDom}) - podem gerar sinergia`);
            }
        }

        if (participante.ie && vaga.ie) {
            const pIe = participante.ie.overallPercentage || 0;
            const vIe = vaga.ie.overallPercentage || 60;
            if (pIe >= vIe + 15) {
                result.strengths.push(`🧠 IE: Nível de IE muito acima do requisito (${pIe}% vs ${vIe}%)`);
            }
        }

        return result;
    }

    /**
     * Calcula compatibilidade entre participante e equipe
     * @param {Object} participante - Perfil do participante
     * @param {Array} equipe - Lista de perfis da equipe
     * @returns {Object} Compatibilidade com a equipe
     */
    calcularCompatibilidadeEquipe(participante, equipe) {
        if (!participante || !equipe || equipe.length === 0) {
            return { error: 'Dados insuficientes para calcular compatibilidade com equipe' };
        }

        const result = {
            overall: 0,
            disc: 0,
            bigfive: 0,
            ie: 0,
            valores: 0,
            teamSize: equipe.length,
            diversity: 0,
            details: [],
            recommendation: ''
        };

        // Médias da equipe
        const teamAvg = {
            disc: { D: 0, I: 0, S: 0, C: 0 },
            bigfive: { abertura: 0, conscienciosidade: 0, extroversao: 0, amabilidade: 0, neuroticismo: 0 },
            ie: { autoconsciencia: 0, autorregulacao: 0, motivacao: 0, empatia: 0, habilidades_sociais: 0 },
            valores: { poder: 0, realizacao: 0, hedonismo: 0, estimulacao: 0, autodirecao: 0, universalismo: 0,
                benevolencia: 0, tradicao: 0, conformidade: 0, seguranca: 0 }
        };

        const count = equipe.length;

        // Calcular médias
        equipe.forEach(membro => {
            if (membro.disc) {
                const d = membro.disc.percentages || {};
                for (const key of ['D', 'I', 'S', 'C']) {
                    teamAvg.disc[key] += (d[key] || 0) / count;
                }
            }
            if (membro.bigfive) {
                const b = membro.bigfive.percentages || {};
                for (const key of ['abertura', 'conscienciosidade', 'extroversao', 'amabilidade', 'neuroticismo']) {
                    teamAvg.bigfive[key] += (b[key] || 0) / count;
                }
            }
            if (membro.ie) {
                const i = membro.ie.percentages || {};
                for (const key of ['autoconsciencia', 'autorregulacao', 'motivacao', 'empatia', 'habilidades_sociais']) {
                    teamAvg.ie[key] += (i[key] || 0) / count;
                }
            }
            if (membro.valores) {
                const v = membro.valores.percentages || {};
                for (const key of ['poder', 'realizacao', 'hedonismo', 'estimulacao', 'autodirecao', 'universalismo',
                        'benevolencia', 'tradicao', 'conformidade', 'seguranca'
                    ]) {
                    teamAvg.valores[key] += (v[key] || 0) / count;
                }
            }
        });

        // Comparar participante com a média da equipe
        // DISC
        const pDisc = participante.disc?.percentages || {};
        let discDiff = 0;
        let discCount = 0;
        for (const key of ['D', 'I', 'S', 'C']) {
            if (pDisc[key] !== undefined && teamAvg.disc[key] !== undefined) {
                discDiff += Math.abs(pDisc[key] - teamAvg.disc[key]);
                discCount++;
            }
        }
        result.disc = discCount > 0 ? Math.max(0, 100 - (discDiff / discCount)) : 0;

        // Big Five
        const pBf = participante.bigfive?.percentages || {};
        let bfDiff = 0;
        let bfCount = 0;
        for (const key of ['abertura', 'conscienciosidade', 'extroversao', 'amabilidade', 'neuroticismo']) {
            if (pBf[key] !== undefined && teamAvg.bigfive[key] !== undefined) {
                bfDiff += Math.abs(pBf[key] - teamAvg.bigfive[key]);
                bfCount++;
            }
        }
        result.bigfive = bfCount > 0 ? Math.max(0, 100 - (bfDiff / bfCount)) : 0;

        // IE
        const pIe = participante.ie?.percentages || {};
        let ieDiff = 0;
        let ieCount = 0;
        for (const key of ['autoconsciencia', 'autorregulacao', 'motivacao', 'empatia', 'habilidades_sociais']) {
            if (pIe[key] !== undefined && teamAvg.ie[key] !== undefined) {
                ieDiff += Math.abs(pIe[key] - teamAvg.ie[key]);
                ieCount++;
            }
        }
        result.ie = ieCount > 0 ? Math.max(0, 100 - (ieDiff / ieCount)) : 0;

        // Valores
        const pVal = participante.valores?.percentages || {};
        let valDiff = 0;
        let valCount = 0;
        for (const key of ['poder', 'realizacao', 'hedonismo', 'estimulacao', 'autodirecao', 'universalismo', 'benevolencia',
                'tradicao', 'conformidade', 'seguranca'
            ]) {
            if (pVal[key] !== undefined && teamAvg.valores[key] !== undefined) {
                valDiff += Math.abs(pVal[key] - teamAvg.valores[key]);
                valCount++;
            }
        }
        result.valores = valCount > 0 ? Math.max(0, 100 - (valDiff / valCount)) : 0;

        // Média geral
        const scores = [result.disc, result.bigfive, result.ie, result.valores].filter(s => s > 0);
        result.overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        // Diversidade da equipe
        const discValues = equipe.map(m => m.disc?.dominant || 'D');
        const uniqueDisc = new Set(discValues);
        result.diversity = Math.round((uniqueDisc.size / 4) * 100);

        // Recomendação
        if (result.overall >= 70) {
            result.recommendation = '🌟 Excelente compatibilidade com a equipe. O perfil se alinha bem com o time.';
        } else if (result.overall >= 50) {
            result.recommendation = '👍 Boa compatibilidade. Pode trazer complementaridade à equipe.';
        } else {
            result.recommendation = '📊 Compatibilidade moderada. Pode ser necessário ajuste ou desenvolvimento.';
        }

        if (result.diversity >= 75) {
            result.details.push('🔄 Equipe com alta diversidade DISC - boa complementaridade');
        } else if (result.diversity <= 25) {
            result.details.push('📊 Equipe com baixa diversidade - perfis muito similares');
        }

        return result;
    }

    /**
     * Gera relatório de compatibilidade em formato texto
     * @param {Object} compatResult - Resultado da compatibilidade
     * @returns {string} Relatório formatado
     */
    gerarRelatorioCompatibilidade(compatResult) {
        if (compatResult.error) {
            return `❌ ${compatResult.error}`;
        }

        let report = [];
        report.push('='.repeat(60));
        report.push('📊 RELATÓRIO DE COMPATIBILIDADE');
        report.push('='.repeat(60));
        report.push('');

        report.push(`📌 Nível Geral: ${compatResult.levelIcon} ${compatResult.level} (${compatResult.overall}%)`);
        report.push(`📝 ${compatResult.recommendation}`);
        report.push('');

        report.push('📈 COMPATIBILIDADE POR DIMENSÃO:');
        if (compatResult.disc > 0) report.push(`  • DISC: ${Math.round(compatResult.disc)}%`);
        if (compatResult.bigfive > 0) report.push(`  • Big Five: ${Math.round(compatResult.bigfive)}%`);
        if (compatResult.ie > 0) report.push(`  • IE: ${Math.round(compatResult.ie)}%`);
        if (compatResult.valores > 0) report.push(`  • Valores: ${Math.round(compatResult.valores)}%`);
        if (compatResult.swot > 0) report.push(`  • SWOT: ${Math.round(compatResult.swot)}%`);
        if (compatResult.cultural > 0) report.push(`  • Cultural: ${Math.round(compatResult.cultural)}%`);
        report.push('');

        if (compatResult.strengths && compatResult.strengths.length > 0) {
            report.push('✅ PONTOS FORTES:');
            compatResult.strengths.forEach(s => report.push(`  • ${s}`));
            report.push('');
        }

        if (compatResult.risks && compatResult.risks.length > 0) {
            report.push('⚠️ PONTOS DE ATENÇÃO:');
            compatResult.risks.forEach(r => report.push(`  • ${r}`));
            report.push('');
        }

        if (compatResult.details && compatResult.details.length > 0) {
            report.push('📋 DETALHES ADICIONAIS:');
            compatResult.details.forEach(d => report.push(`  • ${d}`));
            report.push('');
        }

        report.push('='.repeat(60));
        report.push('📌 Recomendação Final:');
        report.push(compatResult.recommendation);
        report.push('='.repeat(60));

        return report.join('\n');
    }
}

// ============================================
// EXPORTAÇÃO
// ============================================
const compatibilidadeService = new CompatibilidadeService();
window.compatibilidadeService = compatibilidadeService;

console.log('🔗 Motor de Compatibilidade carregado com sucesso!');
