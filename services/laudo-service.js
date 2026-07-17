// ============================================
// LAUDO SERVICE - VIGORRE ONE™
// Serviço para geração de laudos completos (80-100 páginas)
// ============================================

import supabase from '../supabase-config.js';
import algorithms from '../algorithms/index.js';
import CreditoService from './credito-service.js';

class LaudoService {
    
    /**
     * Gera um laudo completo VIGOR® para um participante
     * @param {string} participanteId - ID do participante
     * @param {string} empresaId - ID da empresa
     * @returns {Object} Laudo gerado
     */
    async gerarLaudo(participanteId, empresaId) {
        try {
            // 1. Reserva crédito premium
            const reserva = await CreditoService.reservarCredito(
                empresaId,
                'premium',
                participanteId,
                'laudo'
            );

            // 2. Busca dados do participante
            const { data: participante, error: participanteError } = await supabase
                .from('participantes')
                .select('*')
                .eq('id', participanteId)
                .single();

            if (participanteError) throw participanteError;

            // 3. Busca todos os resultados do participante
            const { data: resultados, error: resultadosError } = await supabase
                .from('resultados')
                .select('*')
                .eq('participante_id', participanteId);

            if (resultadosError) throw resultadosError;

            // 4. Organiza dados por tipo
            const dados = {};
            resultados.forEach(r => {
                const tipo = r.resultados.tipo || r.tipo;
                dados[tipo] = r.resultados;
            });

            // 5. Calcula índice VIGOR®
            const vigorIndex = algorithms.vigor.calculateVigorIndex(dados);

            // 6. Monta laudo completo
            const laudo = this.montarLaudo(participante, dados, vigorIndex);

            // 7. Salva no banco
            const { data: laudoSalvo, error: saveError } = await supabase
                .from('laudos')
                .insert({
                    participante_id: participanteId,
                    empresa_id: empresaId,
                    conteudo: laudo,
                    vigor_index: vigorIndex,
                    data_geracao: new Date().toISOString()
                })
                .select()
                .single();

            if (saveError) throw saveError;

            // 8. Confirma consumo do crédito premium
            await CreditoService.confirmarConsumo(reserva.id);

            // 9. Log de auditoria
            await this._logAuditoria(participanteId, 'laudo_gerado', { laudoId: laudoSalvo.id });

            return laudoSalvo;

        } catch (error) {
            console.error('Erro ao gerar laudo:', error);
            throw error;
        }
    }

    /**
     * Monta o laudo completo
     */
    montarLaudo(participante, dados, vigorIndex) {
        const { disc, bigfive, ie, valores, swot } = dados;

        return {
            identificacao: {
                nome: participante.nome,
                email: participante.email,
                cargo: participante.cargo || 'Não informado',
                departamento: participante.departamento || 'Não informado',
                empresa: participante.empresa_nome || 'Não informado',
                data_geracao: new Date().toISOString(),
                id: participante.id
            },
            metodologia: {
                nome: 'VIGOR®',
                versao: '3.0',
                descricao: 'Metodologia proprietária de Inteligência Humana',
                pilares: [
                    { nome: 'Visão Estratégica', descricao: 'Capacidade de compreender cenários e tomar decisões' },
                    { nome: 'Inteligência Humana', descricao: 'Autoconhecimento, empatia e consciência comportamental' },
                    { nome: 'Gestão de Performance', descricao: 'Execução, disciplina e foco em resultados' },
                    { nome: 'Organização Estrutural', descricao: 'Método, processos e priorização' },
                    { nome: 'Resultados Sustentáveis', descricao: 'Crescimento contínuo e alta performance' }
                ]
            },
            vigor_index: vigorIndex,
            perfil_geral: {
                disc: disc?.profile || null,
                disc_scores: disc?.normalized || null,
                bigfive: bigfive?.normalized || null,
                ie: ie?.generalIndex || null,
                ie_level: ie?.level || null,
                valores: valores?.top5 || null,
                swot: swot?.scores || null
            },
            personalidade: this._analisarPersonalidade(disc, bigfive, ie),
            comunicacao: this._analisarComunicacao(disc, bigfive),
            lideranca: this._analisarLideranca(disc, bigfive),
            carreira: this._analisarCarreira(disc, bigfive, valores),
            tomada_decisao: this._analisarDecisao(disc, bigfive),
            reacao_pressao: this._analisarPressao(disc, bigfive, ie),
            mapa_competencias: this._gerarMapaCompetencias(disc, bigfive, ie, valores),
            mapa_riscos: this._gerarMapaRiscos(disc, bigfive, ie),
            mapa_potenciais: this._gerarMapaPotenciais(disc, bigfive, ie, valores),
            pdi: this._gerarPDI(disc, bigfive, ie, valores, swot),
            recomendacoes: {
                livros: this._recomendarLivros(disc, bigfive, ie),
                cursos: this._recomendarCursos(disc, bigfive, ie),
                exercicios: this._recomendarExercicios(disc, bigfive, ie)
            },
            plano_acao: this._gerarPlanoAcao(disc, bigfive, ie, valores),
            anexos: {
                qr_code: `https://vigorre.com.br/verificar/${participante.id}`,
                hash: this._gerarHash(participante.id, new Date().toISOString()),
                selo: 'Metodologia Exclusiva VIGOR®'
            }
        };
    }

    /**
     * Analisa personalidade
     */
    _analisarPersonalidade(disc, bigfive, ie) {
        const perfil = disc?.profile || {};
        const scores = disc?.normalized || {};

        return {
            estilo: perfil.profile || 'Equilibrado',
            tipo: perfil.type || 'moderate',
            forca: perfil.primaryScore || 0,
            dimensoes: scores,
            estabilidade_emocional: ie?.generalIndex || 50,
            abertura: bigfive?.O || 50,
            conscienciosidade: bigfive?.C || 50
        };
    }

    /**
     * Analisa comunicação
     */
    _analisarComunicacao(disc, bigfive) {
        const perfil = disc?.profile || {};
        const nome = perfil.profile || '';

        const estilos = {
            'Dominância': 'Direta e objetiva',
            'Influência': 'Persuasiva e envolvente',
            'Estabilidade': 'Calma e empática',
            'Conformidade': 'Detalhada e precisa'
        };

        const recomendacoes = {
            'Dominância': 'Pratique escuta ativa e paciência',
            'Influência': 'Desenvolva objetividade e foco',
            'Estabilidade': 'Fortaleça assertividade',
            'Conformidade': 'Simplifique a comunicação'
        };

        const estilo = Object.keys(estilos).find(k => nome.includes(k)) || 'Equilibrada';

        return {
            estilo: estilos[estilo] || 'Equilibrada',
            forca: perfil.primaryScore > 70 ? 'Alta' : perfil.primaryScore > 50 ? 'Média' : 'Baixa',
            recomendacao: recomendacoes[estilo] || 'Continue desenvolvendo todas as habilidades',
            extroversao: bigfive?.E || 50,
            amabilidade: bigfive?.A || 50
        };
    }

    /**
     * Analisa liderança
     */
    _analisarLideranca(disc, bigfive) {
        const perfil = disc?.profile || {};

        const estilos = {
            'Dominância': 'Diretivo - foco em resultados e metas',
            'Influência': 'Inspirador - foco em pessoas e motivação',
            'Estabilidade': 'Apoiador - foco em estabilidade e confiança',
            'Conformidade': 'Analítico - foco em processos e qualidade'
        };

        const nome = perfil.profile || '';
        const estilo = Object.keys(estilos).find(k => nome.includes(k)) || 'Equilibrado';

        return {
            estilo: estilos[estilo] || 'Equilibrado',
            potencial: bigfive?.E > 70 ? 'Alto' : bigfive?.E > 50 ? 'Médio' : 'Baixo',
            forca: perfil.primaryScore > 70 ? 'Natural' : 'Em desenvolvimento',
            recomendacao: this._getRecomendacaoLideranca(estilo)
        };
    }

    _getRecomendacaoLideranca(estilo) {
        const recs = {
            'Dominância': 'Desenvolva empatia e escuta ativa para engajar sua equipe',
            'Influência': 'Foque em processos e acompanhamento de resultados',
            'Estabilidade': 'Fortaleça tomada de decisão e assertividade',
            'Conformidade': 'Desenvolva flexibilidade e adaptação a mudanças'
        };
        return recs[estilo] || 'Continue desenvolvendo seu estilo de liderança';
    }

    /**
     * Analisa carreira
     */
    _analisarCarreira(disc, bigfive, valores) {
        const top1 = valores?.top1 || null;
        const perfil = disc?.profile || {};

        const ambientes = {
            realizacao: 'Ambientes competitivos com metas desafiadoras',
            reconhecimento: 'Ambientes com visibilidade e feedback constante',
            seguranca: 'Ambientes estáveis e previsíveis',
            autonomia: 'Ambientes flexíveis com liberdade de ação',
            aprendizado: 'Ambientes com oportunidades de desenvolvimento',
            colaboracao: 'Ambientes colaborativos e em equipe',
            estabilidade: 'Ambientes com processos claros',
            inovacao: 'Ambientes criativos e inovadores',
            proposito: 'Ambientes com propósito e impacto social',
            etica: 'Ambientes com integridade e transparência',
            qualidade_vida: 'Ambientes com equilíbrio vida-trabalho',
            resultado: 'Ambientes orientados a resultados'
        };

        const carreiras = {
            realizacao: 'Posições de liderança, vendas, empreendedorismo',
            reconhecimento: 'Marketing, relações públicas, gestão de pessoas',
            seguranca: 'Administração, finanças, operações',
            autonomia: 'Consultoria, freelancer, pesquisa',
            aprendizado: 'Educação, treinamento, desenvolvimento',
            colaboracao: 'RH, projetos, equipes multidisciplinares',
            inovacao: 'Pesquisa, desenvolvimento, tecnologia',
            proposito: 'ONGs, sustentabilidade, responsabilidade social',
            resultado: 'Comercial, gestão, alta liderança'
        };

        return {
            perfil: top1?.name || 'Indefinido',
            ambiente_ideal: top1 ? ambientes[top1.key] : 'Ambiente equilibrado',
            recomendacao_carreira: top1 ? carreiras[top1.key] : 'Desenvolva sua carreira com base em seus valores',
            perfil_disc: perfil.profile || 'Equilibrado'
        };
    }

    /**
     * Analisa tomada de decisão
     */
    _analisarDecisao(disc, bigfive) {
        const perfil = disc?.profile || {};
        const nome = perfil.profile || '';

        const estilos = {
            'Dominância': 'Rápida e intuitiva - confia no instinto',
            'Influência': 'Participativa - busca opiniões antes de decidir',
            'Estabilidade': 'Cautelosa - analisa impacto antes de agir',
            'Conformidade': 'Analítica - baseada em dados e evidências'
        };

        const estilo = Object.keys(estilos).find(k => nome.includes(k)) || 'Equilibrada';

        return {
            estilo: estilos[estilo] || 'Equilibrada',
            velocidade: perfil.primaryScore > 70 ? 'Alta' : 'Moderada',
            recomendacao: this._getRecomendacaoDecisao(estilo)
        };
    }

    _getRecomendacaoDecisao(estilo) {
        const recs = {
            'Dominância': 'Pratique análise de dados antes de decidir',
            'Influência': 'Confie mais em sua intuição e experiência',
            'Estabilidade': 'Desenvolva agilidade na tomada de decisão',
            'Conformidade': 'Confie mais em sua intuição, nem tudo precisa de análise'
        };
        return recs[estilo] || 'Equilibre intuição e análise nas decisões';
    }

    /**
     * Analisa reação à pressão
     */
    _analisarPressao(disc, bigfive, ie) {
        const perfil = disc?.profile || {};
        const nome = perfil.profile || '';

        const reacoes = {
            'Dominância': 'Produtivo sob pressão - tende a acelerar',
            'Influência': 'Comunica sob pressão - busca soluções com pessoas',
            'Estabilidade': 'Mantém calma sob pressão - estabiliza o ambiente',
            'Conformidade': 'Analisa sob pressão - busca dados para decisão'
        };

        const reacao = Object.keys(reacoes).find(k => nome.includes(k)) || 'Equilibrada';

        return {
            reacao: reacoes[reacao] || 'Equilibrada',
            resiliência: ie?.self_regulation > 60 ? 'Alta' : ie?.self_regulation > 40 ? 'Média' : 'Baixa',
            neuroticismo: bigfive?.N || 50,
            recomendacao: this._getRecomendacaoPressao(reacao)
        };
    }

    _getRecomendacaoPressao(reacao) {
        const recs = {
            'Dominância': 'Pratique pausas e respiração antes de agir',
            'Influência': 'Mantenha foco e evite dispersão sob pressão',
            'Estabilidade': 'Desenvolva mais agilidade em momentos críticos',
            'Conformidade': 'Confie mais em sua intuição, nem tudo precisa de análise'
        };
        return recs[reacao] || 'Mantenha equilíbrio emocional sob pressão';
    }

    /**
     * Gera mapa de competências
     */
    _gerarMapaCompetencias(disc, bigfive, ie, valores) {
        const competencias = [];

        // DISC
        if (disc?.profile) {
            const perfil = disc.profile.profile || '';
            if (perfil.includes('Dominância')) competencias.push({ nome: 'Tomada de Decisão', nivel: disc.profile.primaryScore || 50 });
            if (perfil.includes('Influência')) competencias.push({ nome: 'Comunicação', nivel: disc.profile.primaryScore || 50 });
            if (perfil.includes('Estabilidade')) competencias.push({ nome: 'Trabalho em Equipe', nivel: disc.profile.primaryScore || 50 });
            if (perfil.includes('Conformidade')) competencias.push({ nome: 'Análise e Precisão', nivel: disc.profile.primaryScore || 50 });
        }

        // Big Five
        if (bigfive?.normalized) {
            const scores = bigfive.normalized;
            if (scores.O > 50) competencias.push({ nome: 'Criatividade', nivel: scores.O || 50 });
            if (scores.C > 50) competencias.push({ nome: 'Organização', nivel: scores.C || 50 });
            if (scores.E > 50) competencias.push({ nome: 'Sociabilidade', nivel: scores.E || 50 });
            if (scores.A > 50) competencias.push({ nome: 'Empatia', nivel: scores.A || 50 });
        }

        // IE
        if (ie?.dimensions) {
            const dims = ie.dimensions;
            if (dims.self_awareness > 50) competencias.push({ nome: 'Autoconhecimento', nivel: dims.self_awareness || 50 });
            if (dims.self_regulation > 50) competencias.push({ nome: 'Autocontrole', nivel: dims.self_regulation || 50 });
            if (dims.motivation > 50) competencias.push({ nome: 'Motivação', nivel: dims.motivation || 50 });
            if (dims.empathy > 50) competencias.push({ nome: 'Empatia', nivel: dims.empathy || 50 });
            if (dims.social_skills > 50) competencias.push({ nome: 'Habilidades Sociais', nivel: dims.social_skills || 50 });
        }

        // Ordena por nível
        competencias.sort((a, b) => b.nivel - a.nivel);

        return {
            competencias: competencias,
            soft_skills: competencias.filter(c => c.nivel > 60),
            em_desenvolvimento: competencias.filter(c => c.nivel < 50),
            total: competencias.length
        };
    }

    /**
     * Gera mapa de riscos comportamentais
     */
    _gerarMapaRiscos(disc, bigfive, ie) {
        const riscos = [];

        // Riscos baseados em DISC
        const perfil = disc?.profile?.profile || '';
        if (perfil.includes('Dominância') && (disc.profile.primaryScore || 0) > 70) {
            riscos.push({ nome: 'Impaciência', probabilidade: 'Alta', impacto: 'Médio', descricao: 'Tende a ser impaciente com processos lentos' });
            riscos.push({ nome: 'Conflitos', probabilidade: 'Média', impacto: 'Alto', descricao: 'Pode gerar conflitos por ser muito direto' });
        }
        if (perfil.includes('Influência') && (disc.profile.primaryScore || 0) > 70) {
            riscos.push({ nome: 'Falta de Foco', probabilidade: 'Alta', impacto: 'Médio', descricao: 'Tende a se dispersar em múltiplas atividades' });
        }
        if (perfil.includes('Estabilidade') && (disc.profile.primaryScore || 0) > 70) {
            riscos.push({ nome: 'Resistência a Mudanças', probabilidade: 'Alta', impacto: 'Médio', descricao: 'Prefere estabilidade e pode resistir a mudanças' });
        }
        if (perfil.includes('Conformidade') && (disc.profile.primaryScore || 0) > 70) {
            riscos.push({ nome: 'Paralisia por Análise', probabilidade: 'Alta', impacto: 'Médio', descricao: 'Pode analisar demais e atrasar decisões' });
        }

        // Riscos baseados em Big Five
        if (bigfive?.normalized) {
            const scores = bigfive.normalized;
            if (scores.N > 70) {
                riscos.push({ nome: 'Estresse', probabilidade: 'Alta', impacto: 'Alto', descricao: 'Alta sensibilidade a estresse e pressão' });
            }
            if (scores.C < 30) {
                riscos.push({ nome: 'Desorganização', probabilidade: 'Alta', impacto: 'Médio', descricao: 'Dificuldade com organização e planejamento' });
            }
        }

        // Riscos baseados em IE
        if (ie?.dimensions) {
            const dims = ie.dimensions;
            if (dims.self_regulation < 40) {
                riscos.push({ nome: 'Reações Impulsivas', probabilidade: 'Alta', impacto: 'Alto', descricao: 'Dificuldade em controlar reações emocionais' });
            }
            if (dims.empathy < 40) {
                riscos.push({ nome: 'Falta de Empatia', probabilidade: 'Média', impacto: 'Médio', descricao: 'Dificuldade em compreender sentimentos alheios' });
            }
        }

        // Classifica risco
        riscos.forEach(r => {
            const prioridade = r.probabilidade === 'Alta' && r.impacto === 'Alto' ? 'Crítico' :
                              r.probabilidade === 'Alta' || r.impacto === 'Alto' ? 'Atenção' : 'Baixo';
            r.prioridade = prioridade;
        });

        return {
            riscos: riscos,
            criticos: riscos.filter(r => r.prioridade === 'Crítico'),
            atencao: riscos.filter(r => r.prioridade === 'Atenção'),
            total: riscos.length
        };
    }

    /**
     * Gera mapa de potenciais
     */
    _gerarMapaPotenciais(disc, bigfive, ie, valores) {
        const potenciais = [];

        // Potenciais baseados em DISC
        const perfil = disc?.profile?.profile || '';
        if (perfil.includes('Dominância')) {
            potenciais.push({ nome: 'Liderança', nivel: 'Alto', descricao: 'Potencial natural para liderar equipes' });
        }
        if (perfil.includes('Influência')) {
            potenciais.push({ nome: 'Comunicação', nivel: 'Alto', descricao: 'Potencial para comunicação e persuasão' });
        }
        if (perfil.includes('Estabilidade')) {
            potenciais.push({ nome: 'Gestão de Conflitos', nivel: 'Médio', descricao: 'Capacidade de mediar conflitos' });
        }
        if (perfil.includes('Conformidade')) {
            potenciais.push({ nome: 'Análise Estratégica', nivel: 'Alto', descricao: 'Capacidade analítica para decisões' });
        }

        // Potenciais baseados em Big Five
        if (bigfive?.normalized) {
            const scores = bigfive.normalized;
            if (scores.O > 70) potenciais.push({ nome: 'Inovação', nivel: 'Alto', descricao: 'Criatividade e pensamento inovador' });
            if (scores.C > 70) potenciais.push({ nome: 'Planejamento', nivel: 'Alto', descricao: 'Capacidade de planejar e executar' });
            if (scores.E > 70) potenciais.push({ nome: 'Networking', nivel: 'Alto', descricao: 'Capacidade de construir redes' });
        }

        // Potenciais baseados em IE
        if (ie?.dimensions) {
            const dims = ie.dimensions;
            if (dims.self_regulation > 70) potenciais.push({ nome: 'Resiliência', nivel: 'Alto', descricao: 'Capacidade de lidar com pressão' });
            if (dims.social_skills > 70) potenciais.push({ nome: 'Relacionamento', nivel: 'Alto', descricao: 'Capacidade de construir relacionamentos' });
        }

        // Potencial baseado em Valores
        if (valores?.top1) {
            const top1 = valores.top1;
            if (top1.key === 'realizacao') potenciais.push({ nome: 'Alta Performance', nivel: 'Alto', descricao: 'Motivado por conquistas e metas' });
            if (top1.key === 'proposito') potenciais.push({ nome: 'Propósito', nivel: 'Alto', descricao: 'Motivado por impacto e significado' });
        }

        return {
            potenciais: potenciais,
            alto: potenciais.filter(p => p.nivel === 'Alto'),
            medio: potenciais.filter(p => p.nivel === 'Médio'),
            total: potenciais.length
        };
    }

    /**
     * Gera PDI (Plano de Desenvolvimento Individual)
     */
    _gerarPDI(disc, bigfive, ie, valores, swot) {
        const objetivos = [];

        // Baseado em DISC
        const perfil = disc?.profile?.profile || '';
        if (perfil.includes('Dominância') && (disc.profile.primaryScore || 0) > 70) {
            objetivos.push({
                area: 'Comportamental',
                objetivo: 'Desenvolver paciência e escuta ativa',
                prazo: '90 dias',
                acoes: ['Praticar respiração antes de responder', 'Feedback de colegas sobre comunicação']
            });
        }
        if (perfil.includes('Conformidade') && (disc.profile.primaryScore || 0) > 70) {
            objetivos.push({
                area: 'Tomada de Decisão',
                objetivo: 'Acelerar tomada de decisão',
                prazo: '60 dias',
                acoes: ['Definir prazos para decisões', 'Confiar mais na intuição']
            });
        }

        // Baseado em Big Five
        if (bigfive?.normalized) {
            const scores = bigfive.normalized;
            if (scores.C < 50) {
                objetivos.push({
                    area: 'Organização',
                    objetivo: 'Melhorar organização e disciplina',
                    prazo: '90 dias',
                    acoes: ['Implementar sistema de planejamento', 'Criar rotina diária']
                });
            }
            if (scores.E < 40) {
                objetivos.push({
                    area: 'Comunicação',
                    objetivo: 'Desenvolver habilidades de comunicação',
                    prazo: '120 dias',
                    acoes: ['Participar de grupos', 'Praticar apresentações']
                });
            }
        }

        // Baseado em IE
        if (ie?.dimensions) {
            const dims = ie.dimensions;
            if (dims.self_regulation < 50) {
                objetivos.push({
                    area: 'Emocional',
                    objetivo: 'Desenvolver controle emocional',
                    prazo: '120 dias',
                    acoes: ['Praticar mindfulness', 'Manter diário emocional']
                });
            }
            if (dims.empathy < 50) {
                objetivos.push({
                    area: 'Relacional',
                    objetivo: 'Desenvolver empatia',
                    prazo: '90 dias',
                    acoes: ['Pratique escuta ativa', 'Leia sobre inteligência emocional']
                });
            }
        }

        // Baseado em SWOT
        if (swot?.scores) {
            const scores = swot.scores;
            if (scores.fraquezas > 60) {
                objetivos.push({
                    area: 'Desenvolvimento',
                    objetivo: 'Trabalhar pontos de desenvolvimento identificados',
                    prazo: '180 dias',
                    acoes: ['Plano de ação focado nas fraquezas', 'Buscar mentoria']
                });
            }
        }

        if (objetivos.length === 0) {
            objetivos.push({
                area: 'Desenvolvimento',
                objetivo: 'Manter alto desempenho',
                prazo: '180 dias',
                acoes: ['Buscar novos desafios', 'Desenvolver novas competências']
            });
        }

        return {
            objetivos: objetivos,
            prazo_geral: '365 dias',
            revisao: 'Trimestral',
            total_objetivos: objetivos.length
        };
    }

    /**
     * Recomenda livros
     */
    _recomendarLivros(disc, bigfive, ie) {
        const livros = [];

        // Baseado em DISC
        const perfil = disc?.profile?.profile || '';
        if (perfil.includes('Dominância')) {
            livros.push('Os 7 Hábitos das Pessoas Altamente Eficazes - Stephen Covey');
            livros.push('A Arte da Guerra - Sun Tzu');
        }
        if (perfil.includes('Influência')) {
            livros.push('Como Fazer Amigos e Influenciar Pessoas - Dale Carnegie');
            livros.push('A Arte da Persuasão - Robert Cialdini');
        }
        if (perfil.includes('Estabilidade')) {
            livros.push('A Coragem de Ser Imperfeito - Brené Brown');
            livros.push('O Poder do Hábito - Charles Duhigg');
        }
        if (perfil.includes('Conformidade')) {
            livros.push('Pensando Rápido e Devagar - Daniel Kahneman');
            livros.push('Factfulness - Hans Rosling');
        }

        // Baseado em IE
        if (ie?.generalIndex < 60) {
            livros.push('Inteligência Emocional - Daniel Goleman');
            livros.push('Mindset - Carol Dweck');
        }

        // Baseado em Big Five
        if (bigfive?.normalized) {
            const scores = bigfive.normalized;
            if (scores.O > 70) livros.push('Sapiens - Yuval Noah Harari');
            if (scores.C < 50) livros.push('A Organização Pessoal - David Allen');
        }

        return livros.slice(0, 5);
    }

    /**
     * Recomenda cursos
     */
    _recomendarCursos(disc, bigfive, ie) {
        const cursos = [];

        const perfil = disc?.profile?.profile || '';
        if (perfil.includes('Dominância')) cursos.push('Liderança e Gestão de Equipes');
        if (perfil.includes('Influência')) cursos.push('Comunicação e Oratória');
        if (perfil.includes('Estabilidade')) cursos.push('Gestão de Conflitos');
        if (perfil.includes('Conformidade')) cursos.push('Análise de Dados e Decisão');

        if (ie?.generalIndex < 60) cursos.push('Inteligência Emocional Avançada');
        if (bigfive?.normalized?.C < 50) cursos.push('Produtividade e Gestão do Tempo');

        return cursos.slice(0, 4);
    }

    /**
     * Recomenda exercícios
     */
    _recomendarExercicios(disc, bigfive, ie) {
        const exercicios = [];

        const perfil = disc?.profile?.profile || '';
        if (perfil.includes('Dominância')) {
            exercicios.push('Pratique respiração profunda antes de tomar decisões');
            exercicios.push('Exercício de escuta ativa com colegas');
        }
        if (perfil.includes('Influência')) {
            exercicios.push('Exercício de foco - 5 minutos de atenção plena');
            exercicios.push('Pratique objetividade em comunicações');
        }
        if (perfil.includes('Estabilidade')) {
            exercicios.push('Exercício de tomada de decisão com prazo curto');
            exercicios.push('Pratique dizer "não" de forma assertiva');
        }
        if (perfil.includes('Conformidade')) {
            exercicios.push('Exercício de confiança na intuição');
            exercicios.push('Pratique decisões rápidas em situações simples');
        }

        if (ie?.dimensions?.self_regulation < 50) {
            exercicios.push('Diário emocional diário - escreva sobre sentimentos');
            exercicios.push('Meditação guiada - 5 minutos pela manhã');
        }

        return exercicios.slice(0, 5);
    }

    /**
     * Gera plano de ação 30/60/90/180/365 dias
     */
    _gerarPlanoAcao(disc, bigfive, ie, valores) {
        return {
            '30_dias': {
                titulo: 'Primeiros 30 Dias',
                acoes: [
                    'Iniciar diário de autoconhecimento',
                    'Praticar uma técnica de respiração diariamente',
                    'Buscar feedback de colegas'
                ]
            },
            '60_dias': {
                titulo: '60 Dias',
                acoes: [
                    'Implementar sistema de organização pessoal',
                    'Participar de um curso ou workshop',
                    'Aplicar feedback recebido'
                ]
            },
            '90_dias': {
                titulo: '90 Dias',
                acoes: [
                    'Avaliar progresso e ajustar plano',
                    'Buscar mentoria na área de desenvolvimento',
                    'Praticar novas habilidades em projetos reais'
                ]
            },
            '180_dias': {
                titulo: '180 Dias',
                acoes: [
                    'Reavaliar competências desenvolvidas',
                    'Buscar novos desafios profissionais',
                    'Expandir networking'
                ]
            },
            '365_dias': {
                titulo: '365 Dias - Revisão Anual',
                acoes: [
                    'Análise completa de evolução',
                    'Novo plano de desenvolvimento para próximo ano',
                    'Celebrar conquistas e aprendizados'
                ]
            }
        };
    }

    /**
     * Gera hash de autenticidade
     */
    _gerarHash(id, data) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(`${id}-${data}`).digest('hex').substring(0, 16);
    }

    /**
     * Busca todos os laudos de um participante
     */
    async listarLaudos(participanteId) {
        const { data, error } = await supabase
            .from('laudos')
            .select('*')
            .eq('participante_id', participanteId)
            .order('data_geracao', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Busca um laudo específico
     */
    async buscarLaudo(laudoId) {
        const { data, error } = await supabase
            .from('laudos')
            .select('*')
            .eq('id', laudoId)
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

export default new LaudoService();
