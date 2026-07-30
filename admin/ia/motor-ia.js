/**
 * ============================================
 * VIGORRE ONE™ - MOTOR DE IA VIGOR AI™
 * Inteligência Artificial para Análise Humana
 * ============================================
 * 
 * Capítulo 6 do PRD:
 * - Interpretar resultados
 * - Cruzar informações entre testes
 * - Gerar insights e recomendações
 * - Montar PDI
 * - Indicar treinamentos
 * - Criar planos de desenvolvimento
 * - Gerar parecer executivo
 * - Comparar evolução entre avaliações
 * - Apontar tendências comportamentais
 * ============================================
 */

class VigorAI {
    constructor() {
        this.nome = 'VIGOR AI™';
        this.versao = '3.0';
        this.camadas = [
            'Interpretação Individual',
            'Cruzamento de Dados',
            'Contextualização',
            'Recomendações Inteligentes',
            'People Analytics',
            'Desenvolvimento Contínuo'
        ];
        this.perfis = {};
        this.historico = [];
    }

    // ============================================
    // 1. INTERPRETAÇÃO INDIVIDUAL
    // ============================================

    /**
     * Interpreta o resultado de um teste individual
     */
    interpretarTeste(teste, resultado) {
        const interpretacoes = {
            'DISC': this._interpretarDISC,
            'BigFive': this._interpretarBigFive,
            'IE': this._interpretarIE,
            'Valores': this._interpretarValores,
            'SWOT': this._interpretarSWOT
        };

        const fn = interpretacoes[teste] || interpretacoes['DISC'];
        return fn.call(this, resultado);
    }

    _interpretarDISC(resultado) {
        const pcts = resultado.percentuais || resultado;
        const dominante = this._getDominante(pcts);

        const perfis = {
            'D': {
                nome: 'Dominância',
                icone: '🦁',
                descricao: 'Orientado a resultados, determinado, competitivo e direto.',
                forcas: ['Liderança', 'Tomada de decisão', 'Iniciativa', 'Foco em resultados'],
                desenvolvimento: ['Paciência processual', 'Escuta ativa', 'Empatia', 'Delegação'],
                ambiente: 'Ambientes dinâmicos com desafios constantes'
            },
            'I': {
                nome: 'Influência',
                icone: '🦚',
                descricao: 'Comunicativo, persuasivo, otimista e sociável.',
                forcas: ['Comunicação', 'Persuasão', 'Criatividade', 'Networking'],
                desenvolvimento: ['Foco em execução', 'Cumprimento de prazos', 'Estruturação', 'Detalhamento'],
                ambiente: 'Ambientes colaborativos com networking'
            },
            'S': {
                nome: 'Estabilidade',
                icone: '🐘',
                descricao: 'Calmo, paciente, confiável e colaborativo.',
                forcas: ['Paciência', 'Empatia', 'Estabilidade', 'Colaboração'],
                desenvolvimento: ['Assertividade', 'Comunicação influente', 'Tomada de decisão ágil', 'Iniciativa'],
                ambiente: 'Ambientes estruturados com processos previsíveis'
            },
            'C': {
                nome: 'Conformidade',
                icone: '🦉',
                descricao: 'Analítico, preciso, detalhista e disciplinado.',
                forcas: ['Precisão', 'Análise de dados', 'Organização', 'Disciplina'],
                desenvolvimento: ['Flexibilidade', 'Agilidade decisória', 'Adaptação a mudanças', 'Comunicação direta'],
                ambiente: 'Ambientes analíticos com dados e precisão'
            }
        };

        const perfil = perfis[dominante] || perfis['D'];

        return {
            teste: 'DISC',
            dominante: dominante,
            perfil: perfil,
            percentuais: pcts,
            descricao_completa: `Perfil ${perfil.icone} ${perfil.nome}: ${perfil.descricao}`,
            recomendacoes: this._gerarRecomendacoesDISC(dominante, pcts)
        };
    }

    _getDominante(pcts) {
        const keys = ['D', 'I', 'S', 'C'];
        let max = 0;
        let dominant = 'D';
        for (let i = 0; i < keys.length; i++) {
            if (pcts[keys[i]] > max) {
                max = pcts[keys[i]];
                dominant = keys[i];
            }
        }
        return dominant;
    }

    _gerarRecomendacoesDISC(dominante, pcts) {
        const recs = {
            'D': [
                'Desenvolver paciência em processos',
                'Praticar escuta ativa em reuniões',
                'Buscar feedback sobre sua comunicação',
                'Delegar mais tarefas para a equipe'
            ],
            'I': [
                'Desenvolver foco em execução de tarefas',
                'Melhorar cumprimento de prazos',
                'Estruturar melhor os processos',
                'Prestar atenção aos detalhes'
            ],
            'S': [
                'Desenvolver assertividade',
                'Praticar comunicação influente',
                'Tomar decisões com mais agilidade',
                'Assumir mais iniciativas'
            ],
            'C': [
                'Desenvolver flexibilidade',
                'Praticar agilidade decisória',
                'Adaptar-se melhor a mudanças',
                'Melhorar comunicação direta'
            ]
        };
        return recs[dominante] || recs['D'];
    }

    _interpretarBigFive(resultado) {
        const pcts = resultado.percentuais || resultado;
        const dimensoes = {
            'O': { nome: 'Abertura', icone: '🎨', desc: 'Criatividade, curiosidade, mente aberta.' },
            'C': { nome: 'Conscienciosidade', icone: '📋', desc: 'Organização, disciplina, persistência.' },
            'E': { nome: 'Extroversão', icone: '🌟', desc: 'Sociabilidade, energia, assertividade.' },
            'A': { nome: 'Amabilidade', icone: '💛', desc: 'Confiança, altruísmo, cooperação.' },
            'N': { nome: 'Neuroticismo', icone: '🌊', desc: 'Estabilidade emocional, ansiedade.' }
        };

        const chaves = ['O', 'C', 'E', 'A', 'N'];
        let max = 0;
        let top = 'O';
        for (let i = 0; i < chaves.length; i++) {
            if (pcts[chaves[i]] > max) {
                max = pcts[chaves[i]];
                top = chaves[i];
            }
        }

        const resultados = {};
        for (let i = 0; i < chaves.length; i++) {
            const k = chaves[i];
            const config = dimensoes[k];
            const valor = pcts[k] || 0;
            const nivel = valor >= 70 ? 'Muito Alto' :
                valor >= 55 ? 'Alto' :
                valor >= 40 ? 'Moderado' :
                valor >= 25 ? 'Baixo' : 'Muito Baixo';
            resultados[k] = {
                valor: valor,
                nivel: nivel,
                descricao: config.desc
            };
        }

        const topConfig = dimensoes[top];

        return {
            teste: 'BigFive',
            topFactor: top,
            topConfig: topConfig,
            resultados: resultados,
            descricao_completa: `Fator predominante: ${topConfig.icone} ${topConfig.nome} (${max}%). ${topConfig.desc}`
        };
    }

    _interpretarIE(resultado) {
        const pcts = resultado.resultados || resultado;
        const competencias = {
            'Autoconsciência': { icone: '🧠', desc: 'Capacidade de reconhecer e compreender as próprias emoções.' },
            'Autorregulação': { icone: '⚖️', desc: 'Capacidade de controlar e gerenciar as próprias emoções.' },
            'Motivação': { icone: '🔥', desc: 'Capacidade de se manter motivado e focado em objetivos.' },
            'Empatia': { icone: '💝', desc: 'Capacidade de compreender e compartilhar os sentimentos dos outros.' },
            'Habilidades Sociais': { icone: '🤝', desc: 'Capacidade de se relacionar e influenciar positivamente.' }
        };

        const chaves = ['Autoconsciência', 'Autorregulação', 'Motivação', 'Empatia', 'Habilidades Sociais'];
        let total = 0;
        const resultados = {};

        for (let i = 0; i < chaves.length; i++) {
            const k = chaves[i];
            const valor = pcts[k] || 0;
            total += valor;
            const config = competencias[k];
            const nivel = valor >= 70 ? 'Alto' :
                valor >= 50 ? 'Moderado' : 'Baixo';
            resultados[k] = {
                valor: valor,
                nivel: nivel,
                descricao: config.desc,
                icone: config.icone
            };
        }

        const indiceGeral = Math.round(total / chaves.length);
        const nivelGeral = indiceGeral >= 60 ? 'Alta' :
            indiceGeral >= 40 ? 'Moderada' : 'Baixa';

        return {
            teste: 'IE',
            indice_geral: indiceGeral,
            nivel_geral: nivelGeral,
            resultados: resultados,
            descricao_completa: `Inteligência Emocional ${nivelGeral} (${indiceGeral}%)`
        };
    }

    _interpretarValores(resultado) {
        const pcts = resultado.resultados || resultado;
        const ranking = Object.entries(pcts).sort((a, b) => b[1] - a[1]);

        const icons = {
            'Realização': '🎯', 'Reconhecimento': '🏆', 'Segurança': '🛡️', 'Autonomia': '🚀',
            'Aprendizado': '📚', 'Colaboração': '🤝', 'Estabilidade': '🏛️', 'Inovação': '💡',
            'Propósito': '🌟', 'Ética': '⚖️', 'Qualidade de Vida': '🌿', 'Resultado': '📊'
        };

        const top3 = ranking.slice(0, 3);

        return {
            teste: 'Valores',
            ranking: ranking,
            top3: top3,
            top1: top3[0] ? { nome: top3[0][0], valor: top3[0][1], icone: icons[top3[0][0]] || '💎' } : null,
            descricao_completa: `Valores predominantes: ${top3.map(v => (icons[v[0]] || '💎') + ' ' + v[0] + ' (' + v[1] + '%)').join(' | ')}`
        };
    }

    _interpretarSWOT(resultado) {
        const pcts = resultado.resultados || resultado;
        const quadrantes = {
            'Forças': { icone: '💪', desc: 'Pontos fortes e diferenciais competitivos.' },
            'Fraquezas': { icone: '📌', desc: 'Áreas de desenvolvimento e limitações.' },
            'Oportunidades': { icone: '🚀', desc: 'Oportunidades de crescimento e mercado.' },
            'Ameaças': { icone: '⚠️', desc: 'Ameaças e desafios a serem monitorados.' }
        };

        const chaves = ['Forças', 'Fraquezas', 'Oportunidades', 'Ameaças'];
        const resultados = {};

        for (let i = 0; i < chaves.length; i++) {
            const k = chaves[i];
            const valor = pcts[k] || 0;
            const config = quadrantes[k];
            const nivel = valor >= 60 ? 'Alto' :
                valor >= 40 ? 'Moderado' : 'Baixo';
            resultados[k] = {
                valor: valor,
                nivel: nivel,
                descricao: config.desc,
                icone: config.icone
            };
        }

        const indiceGeral = Math.round(Object.values(pcts).reduce((a, b) => a + b, 0) / chaves.length);

        return {
            teste: 'SWOT',
            resultados: resultados,
            indice_geral: indiceGeral,
            descricao_completa: `SWOT: Forças ${resultados.Forças.valor}% | Fraquezas ${resultados.Fraquezas.valor}% | Oportunidades ${resultados.Oportunidades.valor}% | Ameaças ${resultados.Ameaças.valor}%`
        };
    }

    // ============================================
    // 2. CRUZAMENTO DE DADOS
    // ============================================

    /**
     * Cruza informações entre todos os testes realizados
     */
    cruzarDados(resultados) {
        const cruzamento = {
            disc: null,
            bigfive: null,
            ie: null,
            valores: null,
            swot: null,
            insights: [],
            tendencias: [],
            conflitos: [],
            sinergias: []
        };

        // Identificar cada teste
        if (resultados.disc) {
            cruzamento.disc = this._interpretarDISC(resultados.disc);
        }
        if (resultados.bigfive) {
            cruzamento.bigfive = this._interpretarBigFive(resultados.bigfive);
        }
        if (resultados.ie) {
            cruzamento.ie = this._interpretarIE(resultados.ie);
        }
        if (resultados.valores) {
            cruzamento.valores = this._interpretarValores(resultados.valores);
        }
        if (resultados.swot) {
            cruzamento.swot = this._interpretarSWOT(resultados.swot);
        }

        // Gerar insights cruzados
        cruzamento.insights = this._gerarInsightsCruzados(cruzamento);
        cruzamento.tendencias = this._gerarTendencias(cruzamento);
        cruzamento.conflitos = this._gerarConflitos(cruzamento);
        cruzamento.sinergias = this._gerarSinergias(cruzamento);

        return cruzamento;
    }

    _gerarInsightsCruzados(cruzamento) {
        const insights = [];

        // DISC + Big Five
        if (cruzamento.disc && cruzamento.bigfive) {
            const disc = cruzamento.disc;
            const bigfive = cruzamento.bigfive;

            if (disc.dominante === 'D' && bigfive.topFactor === 'E') {
                insights.push({
                    tipo: 'Sinergia',
                    titulo: 'Liderança Carismática',
                    descricao: 'Combinação de Dominância com Extroversão cria um líder carismático e orientado a resultados.'
                });
            }

            if (disc.dominante === 'S' && bigfive.topFactor === 'A') {
                insights.push({
                    tipo: 'Sinergia',
                    titulo: 'Liderança Servidora',
                    descricao: 'Combinação de Estabilidade com Amabilidade cria um líder paciente, empático e colaborativo.'
                });
            }

            if (disc.dominante === 'C' && bigfive.topFactor === 'C') {
                insights.push({
                    tipo: 'Sinergia',
                    titulo: 'Excelência Analítica',
                    descricao: 'Combinação de Conformidade com Conscienciosidade cria um profissional disciplinado e de alta precisão.'
                });
            }
        }

        // DISC + IE
        if (cruzamento.disc && cruzamento.ie) {
            const disc = cruzamento.disc;
            const ie = cruzamento.ie;

            if (disc.dominante === 'I' && ie.resultados['Autoconsciência'].valor < 50) {
                insights.push({
                    tipo: 'Desenvolvimento',
                    titulo: 'Autoconsciência para Influência',
                    descricao: 'Alta influência combinada com baixa autoconsciência pode levar a comportamentos que afetam negativamente os relacionamentos.'
                });
            }

            if (ie.nivel_geral === 'Alta') {
                insights.push({
                    tipo: 'Força',
                    titulo: 'Inteligência Emocional Elevada',
                    descricao: 'Alta IE potencializa todas as outras competências e melhora a qualidade dos relacionamentos.'
                });
            }
        }

        // Valores + DISC
        if (cruzamento.disc && cruzamento.valores) {
            const disc = cruzamento.disc;
            const valores = cruzamento.valores;

            if (disc.dominante === 'D' && valores.top1 && valores.top1.nome === 'Ética') {
                insights.push({
                    tipo: 'Sinergia',
                    titulo: 'Liderança Ética',
                    descricao: 'Dominância com Ética como valor principal cria um líder íntegro e confiável.'
                });
            }

            if (valores.top1 && valores.top1.nome === 'Aprendizado') {
                insights.push({
                    tipo: 'Força',
                    titulo: 'Mentalidade de Crescimento',
                    descricao: 'Valorização do aprendizado contínuo impulsiona o desenvolvimento em todas as áreas.'
                });
            }
        }

        // SWOT + DISC
        if (cruzamento.disc && cruzamento.swot) {
            const disc = cruzamento.disc;
            const swot = cruzamento.swot;

            if (swot.resultados['Forças'].valor > 60 && disc.dominante === 'D') {
                insights.push({
                    tipo: 'Força',
                    titulo: 'Autopercepção Positiva',
                    descricao: 'Alta percepção de forças alinhada com perfil de dominância potencializa a autoconfiança.'
                });
            }

            if (swot.resultados['Fraquezas'].valor > 60) {
                insights.push({
                    tipo: 'Desenvolvimento',
                    titulo: 'Áreas de Melhoria Identificadas',
                    descricao: 'Alta percepção de fraquezas indica autocrítica, que pode ser transformada em desenvolvimento.'
                });
            }
        }

        // Se não houver insights, adicionar um padrão
        if (insights.length === 0) {
            insights.push({
                tipo: 'Informação',
                titulo: 'Perfil Equilibrado',
                descricao: 'Os testes indicam um perfil equilibrado, com potencial para desenvolvimento em várias áreas.'
            });
        }

        return insights;
    }

    _gerarTendencias(cruzamento) {
        const tendencias = [];

        // IE tendências
        if (cruzamento.ie) {
            const ie = cruzamento.ie;
            if (ie.indice_geral > 60) {
                tendencias.push({
                    area: 'Inteligência Emocional',
                    tendencia: 'Alta',
                    descricao: 'Tendência a manter equilíbrio emocional e relacionamentos saudáveis.'
                });
            } else if (ie.indice_geral < 40) {
                tendencias.push({
                    area: 'Inteligência Emocional',
                    tendencia: 'Desenvolvimento',
                    descricao: 'Tendência a reações emocionais mais intensas. Desenvolver regulação emocional.'
                });
            }
        }

        // DISC tendências
        if (cruzamento.disc) {
            const disc = cruzamento.disc;
            const pcts = disc.percentuais;
            if (pcts.D > 60) {
                tendencias.push({
                    area: 'Comportamento',
                    tendencia: 'Orientado a Resultados',
                    descricao: 'Tendência a buscar metas e superar desafios de forma intensa.'
                });
            }
            if (pcts.I > 60) {
                tendencias.push({
                    area: 'Comportamento',
                    tendencia: 'Orientado a Relacionamentos',
                    descricao: 'Tendência a valorizar conexões e influenciar positivamente as pessoas.'
                });
            }
        }

        // Valores tendências
        if (cruzamento.valores && cruzamento.valores.top1) {
            tendencias.push({
                area: 'Valores',
                tendencia: cruzamento.valores.top1.nome,
                descricao: `Valor principal: ${cruzamento.valores.top1.nome} (${cruzamento.valores.top1.valor}%)`
            });
        }

        return tendencias;
    }

    _gerarConflitos(cruzamento) {
        const conflitos = [];

        // DISC + Valores conflitos potenciais
        if (cruzamento.disc && cruzamento.valores) {
            const disc = cruzamento.disc;
            const valores = cruzamento.valores;

            if (disc.dominante === 'D' && valores.top1 && valores.top1.nome === 'Colaboração') {
                conflitos.push({
                    tipo: 'Potencial Conflito',
                    descricao: 'Dominância (competitividade) pode conflitar com o valor Colaboração (trabalho em equipe).'
                });
            }

            if (disc.dominante === 'I' && valores.top1 && valores.top1.nome === 'Estabilidade') {
                conflitos.push({
                    tipo: 'Potencial Conflito',
                    descricao: 'Influência (mudança constante) pode conflitar com o valor Estabilidade (previsibilidade).'
                });
            }

            if (disc.dominante === 'S' && valores.top1 && valores.top1.nome === 'Inovação') {
                conflitos.push({
                    tipo: 'Potencial Conflito',
                    descricao: 'Estabilidade (previsibilidade) pode conflitar com o valor Inovação (mudança).'
                });
            }

            if (disc.dominante === 'C' && valores.top1 && valores.top1.nome === 'Autonomia') {
                conflitos.push({
                    tipo: 'Potencial Conflito',
                    descricao: 'Conformidade (estrutura) pode conflitar com o valor Autonomia (liberdade).'
                });
            }
        }

        // DISC + Big Five conflitos
        if (cruzamento.disc && cruzamento.bigfive) {
            const disc = cruzamento.disc;
            const bigfive = cruzamento.bigfive;

            if (disc.dominante === 'D' && bigfive.resultados && bigfive.resultados.A && bigfive.resultados.A.valor > 60) {
                conflitos.push({
                    tipo: 'Potencial Conflito',
                    descricao: 'Dominância (assertividade) pode conflitar com Amabilidade (cooperação).'
                });
            }

            if (disc.dominante === 'I' && bigfive.resultados && bigfive.resultados.C && bigfive.resultados.C.valor > 60) {
                conflitos.push({
                    tipo: 'Potencial Conflito',
                    descricao: 'Influência (flexibilidade) pode conflitar com Conscienciosidade (estrutura).'
                });
            }
        }

        return conflitos;
    }

    _gerarSinergias(cruzamento) {
        const sinergias = [];

        // DISC + Valores sinergias
        if (cruzamento.disc && cruzamento.valores) {
            const disc = cruzamento.disc;
            const valores = cruzamento.valores;

            if (disc.dominante === 'D' && valores.top1 && valores.top1.nome === 'Realização') {
                sinergias.push({
                    tipo: 'Sinergia Positiva',
                    descricao: 'Dominância + Realização = Foco intenso em resultados e metas ambiciosas.'
                });
            }

            if (disc.dominante === 'I' && valores.top1 && valores.top1.nome === 'Reconhecimento') {
                sinergias.push({
                    tipo: 'Sinergia Positiva',
                    descricao: 'Influência + Reconhecimento = Habilidade de se destacar e ser notado positivamente.'
                });
            }

            if (disc.dominante === 'S' && valores.top1 && valores.top1.nome === 'Qualidade de Vida') {
                sinergias.push({
                    tipo: 'Sinergia Positiva',
                    descricao: 'Estabilidade + Qualidade de Vida = Equilíbrio e bem-estar consistentes.'
                });
            }

            if (disc.dominante === 'C' && valores.top1 && valores.top1.nome === 'Ética') {
                sinergias.push({
                    tipo: 'Sinergia Positiva',
                    descricao: 'Conformidade + Ética = Integridade e precisão em todas as ações.'
                });
            }
        }

        // IE + DISC sinergias
        if (cruzamento.ie && cruzamento.disc) {
            const ie = cruzamento.ie;
            const disc = cruzamento.disc;

            if (ie.indice_geral > 60 && disc.dominante === 'D') {
                sinergias.push({
                    tipo: 'Sinergia Positiva',
                    descricao: 'Alta IE + Dominância = Líder com empatia e capacidade de decisão.'
                });
            }

            if (ie.indice_geral > 60 && disc.dominante === 'I') {
                sinergias.push({
                    tipo: 'Sinergia Positiva',
                    descricao: 'Alta IE + Influência = Comunicação envolvente com autenticidade.'
                });
            }
        }

        return sinergias;
    }

    // ============================================
    // 3. GERAR INSIGHTS EXECUTIVOS
    // ============================================

    /**
     * Gera insights executivos para CEOs e líderes
     */
    gerarInsightsExecutivos(cruzamento) {
        const insights = {
            resumo: '',
            forcas: [],
            desafios: [],
            recomendacoes: [],
            score_lideranca: 0,
            score_potencial: 0
        };

        // Resumo executivo
        let resumo = 'Análise integrada do perfil do colaborador:\n\n';

        if (cruzamento.disc) {
            resumo += `• Perfil comportamental: ${cruzamento.disc.perfil.icone} ${cruzamento.disc.perfil.nome}\n`;
        }

        if (cruzamento.ie) {
            resumo += `• Inteligência Emocional: ${cruzamento.ie.nivel_geral} (${cruzamento.ie.indice_geral}%)\n`;
        }

        if (cruzamento.valores && cruzamento.valores.top1) {
            resumo += `• Valor principal: ${cruzamento.valores.top1.nome} (${cruzamento.valores.top1.valor}%)\n`;
        }

        if (cruzamento.swot) {
            const forcas = cruzamento.swot.resultados['Forças'].valor;
            const oportunidades = cruzamento.swot.resultados['Oportunidades'].valor;
            resumo += `• SWOT: Forças ${forcas}% | Oportunidades ${oportunidades}%\n`;
        }

        insights.resumo = resumo;

        // Forças identificadas
        if (cruzamento.disc) {
            insights.forcas.push(...cruzamento.disc.perfil.forcas);
        }

        if (cruzamento.ie && cruzamento.ie.indice_geral > 60) {
            insights.forcas.push('Inteligência Emocional elevada');
        }

        if (cruzamento.valores && cruzamento.valores.top1) {
            insights.forcas.push(`Valorização de ${cruzamento.valores.top1.nome}`);
        }

        // Desafios
        if (cruzamento.disc) {
            insights.desafios.push(...cruzamento.disc.perfil.desenvolvimento);
        }

        if (cruzamento.ie && cruzamento.ie.indice_geral < 50) {
            insights.desafios.push('Desenvolver inteligência emocional');
        }

        // Recomendações executivas
        if (cruzamento.disc) {
            const disc = cruzamento.disc;
            if (disc.dominante === 'D') {
                insights.recomendacoes.push('Posicionar em cargos de liderança e gestão de resultados');
                insights.recomendacoes.push('Oferecer feedback direto e objetivo');
                insights.recomendacoes.push('Desafiar com metas ambiciosas');
            } else if (disc.dominante === 'I') {
                insights.recomendacoes.push('Posicionar em áreas de comunicação e relacionamento');
                insights.recomendacoes.push('Reconhecer publicamente as conquistas');
                insights.recomendacoes.push('Incentivar networking e inovação');
            } else if (disc.dominante === 'S') {
                insights.recomendacoes.push('Posicionar em áreas de suporte e estabilidade');
                insights.recomendacoes.push('Oferecer segurança e previsibilidade');
                insights.recomendacoes.push('Incentivar liderança colaborativa');
            } else if (disc.dominante === 'C') {
                insights.recomendacoes.push('Posicionar em áreas de análise e qualidade');
                insights.recomendacoes.push('Valorizar precisão e disciplina');
                insights.recomendacoes.push('Oferecer dados e informações detalhadas');
            }
        }

        // Scores
        let liderancaScore = 0;
        let potencialScore = 0;

        if (cruzamento.disc) {
            const disc = cruzamento.disc;
            if (disc.dominante === 'D' || disc.dominante === 'I') {
                liderancaScore += 30;
                potencialScore += 20;
            } else {
                liderancaScore += 15;
                potencialScore += 15;
            }
            liderancaScore += disc.percentuais[disc.dominante] * 0.2;
        }

        if (cruzamento.ie && cruzamento.ie.indice_geral > 50) {
            liderancaScore += 20;
            potencialScore += 15;
        }

        if (cruzamento.valores && cruzamento.valores.top1) {
            const valor = cruzamento.valores.top1;
            if (['Realização', 'Resultado', 'Propósito'].includes(valor.nome)) {
                potencialScore += 15;
            }
        }

        insights.score_lideranca = Math.min(Math.round(liderancaScore), 100);
        insights.score_potencial = Math.min(Math.round(potencialScore), 100);

        return insights;
    }

    // ============================================
    // 4. GERAR PDI (PLANO DE DESENVOLVIMENTO)
    // ============================================

    /**
     * Gera PDI personalizado baseado em todos os testes
     */
    gerarPDI(cruzamento) {
        const pdi = {
            diagnostico: '',
            objetivos: {
                curto_prazo: [],
                medio_prazo: [],
                longo_prazo: []
            },
            competencias_priorizadas: [],
            plano_diario: '',
            plano_semanal: '',
            plano_mensal: '',
            recomendacoes: {
                livros: [],
                cursos: [],
                podcasts: [],
                exercicios: []
            },
            plano_30_60_90_180_365: []
        };

        // Diagnóstico
        let diagnostico = 'Com base na análise integrada dos testes realizados, ';
        if (cruzamento.disc) {
            diagnostico += `o perfil predominante é ${cruzamento.disc.perfil.icone} ${cruzamento.disc.perfil.nome}. `;
        }
        if (cruzamento.ie) {
            diagnostico += `A Inteligência Emocional é ${cruzamento.ie.nivel_geral} (${cruzamento.ie.indice_geral}%). `;
        }
        if (cruzamento.valores && cruzamento.valores.top1) {
            diagnostico += `O valor principal é ${cruzamento.valores.top1.nome}. `;
        }
        diagnostico += 'Recomenda-se o desenvolvimento das competências identificadas como prioridade.';

        pdi.diagnostico = diagnostico;

        // Objetivos
        if (cruzamento.disc) {
            const disc = cruzamento.disc;
            if (disc.dominante === 'D') {
                pdi.objetivos.curto_prazo.push('Desenvolver paciência e escuta ativa');
                pdi.objetivos.medio_prazo.push('Fortalecer empatia e inteligência emocional');
                pdi.objetivos.longo_prazo.push('Tornar-se um líder mais completo e inspirador');
            } else if (disc.dominante === 'I') {
                pdi.objetivos.curto_prazo.push('Melhorar foco e disciplina em tarefas');
                pdi.objetivos.medio_prazo.push('Desenvolver habilidades de gestão de tempo');
                pdi.objetivos.longo_prazo.push('Liderar projetos de comunicação estratégica');
            } else if (disc.dominante === 'S') {
                pdi.objetivos.curto_prazo.push('Desenvolver assertividade');
                pdi.objetivos.medio_prazo.push('Fortalecer capacidade de influência');
                pdi.objetivos.longo_prazo.push('Assumir posições de liderança colaborativa');
            } else if (disc.dominante === 'C') {
                pdi.objetivos.curto_prazo.push('Desenvolver flexibilidade');
                pdi.objetivos.medio_prazo.push('Melhorar agilidade decisória');
                pdi.objetivos.longo_prazo.push('Liderar áreas de qualidade e análise');
            }
        }

        // Competências priorizadas
        const competenciasBase = [
            'Inteligência Emocional',
            'Comunicação Assertiva',
            'Liderança Adaptativa',
            'Resiliência',
            'Pensamento Estratégico'
        ];

        pdi.competencias_priorizadas = competenciasBase;

        // Planos
        pdi.plano_diario = 'Praticar 10 minutos de mindfulness pela manhã. Manter diário de emoções. Ler 15 minutos sobre desenvolvimento pessoal.';
        pdi.plano_semanal = 'Participar de uma atividade de desenvolvimento. Buscar feedback de um colega. Praticar escuta ativa em reuniões.';
        pdi.plano_mensal = 'Participar de um curso ou workshop. Revisar metas e ajustar plano. Buscar mentoria.';

        // Recomendações
        pdi.recomendacoes.livros = [
            'Inteligência Emocional - Daniel Goleman',
            'A Coragem de Ser Imperfeito - Brené Brown',
            'Mindset - Carol Dweck',
            'Poder e Liderança - John C. Maxwell'
        ];

        pdi.recomendacoes.cursos = [
            'Instituto Vigorre™ - Formação em Desenvolvimento Humano',
            'Udemy - Liderança e Gestão de Equipes',
            'Coursera - Inteligência Emocional no Trabalho',
            'FGV - Gestão de Pessoas e Carreira'
        ];

        pdi.recomendacoes.podcasts = [
            'TED Talks - Liderança',
            'Café Brasil - Desenvolvimento Pessoal',
            'Flow Podcast - Carreira e Propósito',
            'Braincast - Comportamento Humano'
        ];

        pdi.recomendacoes.exercicios = [
            'Diário de emoções diário',
            'Técnica de respiração 4-7-8',
            'Escuta ativa em conversas',
            'Prática de empatia diária'
        ];

        // Plano 30/60/90/180/365
        pdi.plano_30_60_90_180_365 = [
            {
                periodo: '30 Dias',
                titulo: 'Fundação',
                acoes: 'Iniciar diário de autoconhecimento. Praticar mindfulness diário. Estabelecer metas iniciais.'
            },
            {
                periodo: '60 Dias',
                titulo: 'Estruturação',
                acoes: 'Implementar rotina de leitura. Participar de um curso. Buscar feedback.'
            },
            {
                periodo: '90 Dias',
                titulo: 'Consolidação',
                acoes: 'Avaliar progresso e ajustar plano. Buscar mentoria. Aplicar aprendizados.'
            },
            {
                periodo: '180 Dias',
                titulo: 'Evolução',
                acoes: 'Reavaliar competências. Assumir novos desafios. Compartilhar conhecimento.'
            },
            {
                periodo: '365 Dias',
                titulo: 'Revisão',
                acoes: 'Análise completa de evolução. Novos testes. Plano para próximo ano.'
            }
        ];

        return pdi;
    }

    // ============================================
    // 5. GERAR LAUDO COMPLETO
    // ============================================

    /**
     * Gera o laudo completo integrando todos os dados
     */
    gerarLaudo(resultados) {
        const cruzamento = this.cruzarDados(resultados);
        const insightsExecutivos = this.gerarInsightsExecutivos(cruzamento);
        const pdi = this.gerarPDI(cruzamento);

        return {
            cabecalho: {
                participante: resultados.participante || 'Não identificado',
                data: new Date().toISOString(),
                testes_realizados: Object.keys(resultados).filter(k => k !== 'participante' && k !== 'id')
            },
            cruzamento: cruzamento,
            insights_executivos: insightsExecutivos,
            pdi: pdi,
            parecer_final: this._gerarParecerFinal(cruzamento, insightsExecutivos),
            mensagem_motivacional: this._gerarMensagemMotivacional(cruzamento)
        };
    }

    _gerarParecerFinal(cruzamento, insights) {
        let parecer = 'Com base na análise integrada de todos os testes realizados, ';

        if (cruzamento.disc) {
            parecer += `o perfil predominante é ${cruzamento.disc.perfil.icone} ${cruzamento.disc.perfil.nome}. `;
        }

        if (cruzamento.ie) {
            parecer += `A Inteligência Emocional é ${cruzamento.ie.nivel_geral} (${cruzamento.ie.indice_geral}%). `;
        }

        parecer += `O score de liderança é ${insights.score_lideranca}% e o score de potencial é ${insights.score_potencial}%. `;

        if (insights.score_lideranca > 70) {
            parecer += 'Apresenta alto potencial para posições de liderança. ';
        } else if (insights.score_lideranca > 50) {
            parecer += 'Apresenta bom potencial de liderança, com espaço para desenvolvimento. ';
        } else {
            parecer += 'Apresenta potencial de liderança em desenvolvimento. ';
        }

        parecer += 'Recomenda-se seguir o plano de desenvolvimento proposto para maximizar o potencial e alcançar os objetivos de carreira.';

        return parecer;
    }

    _gerarMensagemMotivacional(cruzamento) {
        let mensagem = '⭐ Sua jornada de autoconhecimento está apenas começando! ';

        if (cruzamento.disc) {
            mensagem += `Seu perfil ${cruzamento.disc.perfil.icone} ${cruzamento.disc.perfil.nome} é uma força poderosa. `;
        }

        if (cruzamento.valores && cruzamento.valores.top1) {
            mensagem += `Seu valor principal, ${cruzamento.valores.top1.nome}, é uma bússola que guia suas decisões. `;
        }

        mensagem += 'Cada descoberta sobre si mesmo é um passo rumo ao seu melhor eu. Confie em seu potencial, abrace seus desafios e celebre cada conquista. Lembre-se: o crescimento acontece quando você sai da zona de conforto e se permite evoluir. Você tem tudo o que precisa para alcançar seus objetivos! 🚀';

        return mensagem;
    }

    // ============================================
    // 6. COMPARAR EVOLUÇÃO
    // ============================================

    /**
     * Compara duas avaliações para mostrar evolução
     */
    compararEvolucao(avaliacaoAnterior, avaliacaoAtual) {
        const comparacao = {
            mudancas: [],
            evolucao: [],
            estagnacao: [],
            recomendacoes: []
        };

        // Comparar DISC
        if (avaliacaoAnterior.disc && avaliacaoAtual.disc) {
            const anterior = this._interpretarDISC(avaliacaoAnterior.disc);
            const atual = this._interpretarDISC(avaliacaoAtual.disc);

            if (anterior.dominante !== atual.dominante) {
                comparacao.mudancas.push({
                    area: 'DISC',
                    descricao: `Mudança de perfil: ${anterior.perfil.nome} → ${atual.perfil.nome}`
                });
            }

            const keys = ['D', 'I', 'S', 'C'];
            for (let i = 0; i < keys.length; i++) {
                const diff = (atual.percentuais[keys[i]] || 0) - (anterior.percentuais[keys[i]] || 0);
                if (Math.abs(diff) > 10) {
                    comparacao.evolucao.push({
                        area: `DISC - ${keys[i]}`,
                        descricao: `Variação de ${diff > 0 ? '+' : ''}${diff}%`
                    });
                }
            }
        }

        // Comparar IE
        if (avaliacaoAnterior.ie && avaliacaoAtual.ie) {
            const anterior = this._interpretarIE(avaliacaoAnterior.ie);
            const atual = this._interpretarIE(avaliacaoAtual.ie);

            const diff = atual.indice_geral - anterior.indice_geral;
            if (Math.abs(diff) > 5) {
                comparacao.evolucao.push({
                    area: 'Inteligência Emocional',
                    descricao: `Variação de ${diff > 0 ? '+' : ''}${diff}% (${anterior.indice_geral}% → ${atual.indice_geral}%)`
                });
            }
        }

        // Recomendações baseadas na evolução
        if (comparacao.evolucao.length === 0) {
            comparacao.recomendacoes.push('Mantenha o foco no desenvolvimento contínuo');
        } else {
            comparacao.recomendacoes.push('Continue trabalhando nas áreas que apresentaram evolução');
            comparacao.recomendacoes.push('Avalie as áreas que permaneceram estáveis');
        }

        return comparacao;
    }
}

// ============================================
// EXPORTAÇÃO
// ============================================

if (typeof window !== 'undefined') {
    window.VigorAI = VigorAI;
    window.vigorAI = new VigorAI();
    console.log('🧠 VIGOR AI™ carregado com sucesso!');
    console.log('📌 Versão:', window.vigorAI.versao);
    console.log('📌 Camadas:', window.vigorAI.camadas.join(' → '));
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VigorAI;
}
