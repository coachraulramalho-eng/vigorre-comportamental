/**
 * ============================================
 * VIGORRE ONE™ - CALCULADORA DE TESTES
 * Algoritmos para todos os assessments
 * ============================================
 */

// ============================================
// 1. ALGORITMO DISC (28 perguntas)
// ============================================

function calcularDISC(respostas) {
    // respostas: array de objetos { pergunta: 1, mais: 'a', menos: 'b' }
    // ou array com as respostas diretas
    
    var scores = { D: 0, I: 0, S: 0, C: 0 };
    
    // Mapeamento das perguntas DISC
    var discMap = {
        1: { D: 1, I: 0, S: 0, C: 0 },
        2: { D: 1, I: 0, S: 0, C: 0 },
        3: { D: 1, I: 0, S: 0, C: 0 },
        4: { D: 1, I: 0, S: 0, C: 0 },
        5: { D: 0, I: 1, S: 0, C: 0 },
        6: { D: 0, I: 0, S: 0, C: 1 },
        7: { D: 1, I: 0, S: 0, C: 0 },
        8: { D: 0, I: 1, S: 0, C: 0 },
        9: { D: 1, I: 0, S: 0, C: 0 },
        10: { D: 1, I: 0, S: 1, C: 0 },
        11: { D: 1, I: 0, S: 0, C: 0 },
        12: { D: 0, I: 0, S: 0, C: 1 },
        13: { D: 1, I: 1, S: 0, C: 0 },
        14: { D: 1, I: 0, S: 1, C: 0 },
        15: { D: 1, I: 0, S: 0, C: 1 },
        16: { D: 1, I: 0, S: 0, C: 0 },
        17: { D: 1, I: 0, S: 0, C: 1 },
        18: { D: 1, I: 0, S: 1, C: 0 },
        19: { D: 1, I: 0, S: 1, C: 0 },
        20: { D: 1, I: 1, S: 0, C: 0 },
        21: { D: 0, I: 0, S: 0, C: 1 },
        22: { D: 1, I: 0, S: 1, C: 0 },
        23: { D: 1, I: 0, S: 0, C: 0 },
        24: { D: 0, I: 0, S: 0, C: 1 },
        25: { D: 0, I: 1, S: 0, C: 0 },
        26: { D: 1, I: 0, S: 1, C: 0 },
        27: { D: 0, I: 0, S: 0, C: 1 },
        28: { D: 1, I: 0, S: 0, C: 1 }
    };
    
    // Processar respostas
    for (var i = 0; i < respostas.length; i++) {
        var r = respostas[i];
        var pergunta = r.pergunta || (i + 1);
        var mais = r.mais || r.resposta || r.opcao || '';
        var menos = r.menos || '';
        
        if (discMap[pergunta]) {
            // Adicionar ao MAIS
            var maisKey = mais.charAt(0).toUpperCase();
            if (discMap[pergunta][maisKey] !== undefined) {
                scores[maisKey] += discMap[pergunta][maisKey];
            }
            
            // Subtrair do MENOS
            var menosKey = menos.charAt(0).toUpperCase();
            if (menosKey && discMap[pergunta][menosKey] !== undefined) {
                scores[menosKey] -= discMap[pergunta][menosKey];
            }
        }
    }
    
    // Normalizar para valores positivos (0-100)
    var keys = ['D', 'I', 'S', 'C'];
    var min = 0;
    var max = 0;
    
    for (var k = 0; k < keys.length; k++) {
        if (scores[keys[k]] < min) min = scores[keys[k]];
        if (scores[keys[k]] > max) max = scores[keys[k]];
    }
    
    var range = max - min;
    if (range === 0) range = 1;
    
    var percentuais = {};
    for (var p = 0; p < keys.length; p++) {
        percentuais[keys[p]] = Math.round(((scores[keys[p]] - min) / range) * 100);
    }
    
    // Encontrar perfil predominante
    var dominant = 'D';
    var highest = 0;
    for (var d = 0; d < keys.length; d++) {
        if (percentuais[keys[d]] > highest) {
            highest = percentuais[keys[d]];
            dominant = keys[d];
        }
    }
    
    return {
        scores: scores,
        percentuais: percentuais,
        dominante: dominant,
        descricao: getDescricaoDISC(dominant)
    };
}

function getDescricaoDISC(perfil) {
    var descricoes = {
        'D': 'Orientado a resultados, determinado, competitivo e direto.',
        'I': 'Comunicativo, persuasivo, otimista e sociável.',
        'S': 'Calmo, paciente, confiável e colaborativo.',
        'C': 'Analítico, preciso, detalhista e disciplinado.'
    };
    return descricoes[perfil] || '';
}

// ============================================
// 2. ALGORITMO BIG FIVE (60 perguntas)
// ============================================

function calcularBigFive(respostas) {
    // respostas: array de objetos { pergunta: 1, valor: 1-5 }
    // ou array de valores diretamente
    
    var dimensoes = {
        'Abertura': { min: 1, max: 5, questions: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56] },
        'Conscienciosidade': { min: 1, max: 5, questions: [2, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57] },
        'Extroversão': { min: 1, max: 5, questions: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58] },
        'Amabilidade': { min: 1, max: 5, questions: [4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59] },
        'Neuroticismo': { min: 1, max: 5, questions: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60] }
    };
    
    var resultados = {};
    var detalhes = {};
    
    for (var dim in dimensoes) {
        var qs = dimensoes[dim].questions;
        var soma = 0;
        var count = 0;
        
        for (var i = 0; i < qs.length; i++) {
            var pergunta = qs[i];
            var valor = 0;
            
            // Buscar resposta
            for (var j = 0; j < respostas.length; j++) {
                var r = respostas[j];
                var numPergunta = r.pergunta || r.numero || (j + 1);
                if (numPergunta == pergunta) {
                    valor = r.valor || r.resposta || 3;
                    break;
                }
            }
            
            if (valor > 0) {
                soma += valor;
                count++;
            }
        }
        
        var media = count > 0 ? soma / count : 3;
        var percentual = Math.round(((media - 1) / 4) * 100);
        
        var nivel = '';
        if (percentual >= 75) nivel = 'Muito Alto';
        else if (percentual >= 60) nivel = 'Alto';
        else if (percentual >= 40) nivel = 'Moderado';
        else if (percentual >= 25) nivel = 'Baixo';
        else nivel = 'Muito Baixo';
        
        resultados[dim] = {
            media: media,
            percentual: percentual,
            nivel: nivel,
            descricao: getDescricaoBigFive(dim, percentual)
        };
        
        detalhes[dim] = {
            soma: soma,
            count: count,
            questoes: qs
        };
    }
    
    return {
        resultados: resultados,
        detalhes: detalhes,
        descricao_geral: getDescricaoGeralBigFive(resultados)
    };
}

function getDescricaoBigFive(dimensao, percentual) {
    var descricoes = {
        'Abertura': percentual >= 60 ? 'Você é criativo, curioso e mente aberta.' : 'Você prefere o familiar e o prático.',
        'Conscienciosidade': percentual >= 60 ? 'Você é organizado, disciplinado e confiável.' : 'Você é mais espontâneo e flexível.',
        'Extroversão': percentual >= 60 ? 'Você é sociável, energético e assertivo.' : 'Você é mais reservado e introvertido.',
        'Amabilidade': percentual >= 60 ? 'Você é cooperativo, empático e confiável.' : 'Você é mais direto e competitivo.',
        'Neuroticismo': percentual >= 60 ? 'Você tende a ser ansioso e reativo.' : 'Você é emocionalmente estável.'
    };
    return descricoes[dimensao] || '';
}

function getDescricaoGeralBigFive(resultados) {
    var desc = [];
    for (var dim in resultados) {
        desc.push(dim + ': ' + resultados[dim].nivel + ' (' + resultados[dim].percentual + '%)');
    }
    return desc.join(' | ');
}

// ============================================
// 3. ALGORITMO INTELIGÊNCIA EMOCIONAL (40 perguntas)
// ============================================

function calcularIE(respostas) {
    // respostas: array de objetos { pergunta: 1, valor: 1-5 }
    
    var competencias = {
        'Autoconsciência': { questions: [1, 6, 11, 16, 21, 26, 31, 36] },
        'Autorregulação': { questions: [2, 7, 12, 17, 22, 27, 32, 37] },
        'Motivação': { questions: [3, 8, 13, 18, 23, 28, 33, 38] },
        'Empatia': { questions: [4, 9, 14, 19, 24, 29, 34, 39] },
        'Habilidades Sociais': { questions: [5, 10, 15, 20, 25, 30, 35, 40] }
    };
    
    var resultados = {};
    var totalGeral = 0;
    var countGeral = 0;
    
    for (var comp in competencias) {
        var qs = competencias[comp].questions;
        var soma = 0;
        var count = 0;
        
        for (var i = 0; i < qs.length; i++) {
            var pergunta = qs[i];
            var valor = 0;
            
            for (var j = 0; j < respostas.length; j++) {
                var r = respostas[j];
                var numPergunta = r.pergunta || r.numero || (j + 1);
                if (numPergunta == pergunta) {
                    valor = r.valor || r.resposta || 3;
                    break;
                }
            }
            
            if (valor > 0) {
                soma += valor;
                count++;
            }
        }
        
        var media = count > 0 ? soma / count : 3;
        var percentual = Math.round(((media - 1) / 4) * 100);
        
        var nivel = '';
        if (percentual >= 75) nivel = 'Muito Alto';
        else if (percentual >= 60) nivel = 'Alto';
        else if (percentual >= 40) nivel = 'Moderado';
        else if (percentual >= 25) nivel = 'Baixo';
        else nivel = 'Muito Baixo';
        
        resultados[comp] = {
            media: media,
            percentual: percentual,
            nivel: nivel,
            descricao: getDescricaoIE(comp, percentual)
        };
        
        totalGeral += soma;
        countGeral += count;
    }
    
    var indiceGeral = countGeral > 0 ? Math.round(((totalGeral / countGeral - 1) / 4) * 100) : 50;
    var nivelGeral = indiceGeral >= 60 ? 'Alta' : indiceGeral >= 40 ? 'Moderada' : 'Baixa';
    
    return {
        resultados: resultados,
        indice_geral: indiceGeral,
        nivel_geral: nivelGeral,
        descricao_geral: 'Inteligência Emocional ' + nivelGeral + ' (' + indiceGeral + '%)'
    };
}

function getDescricaoIE(competencia, percentual) {
    var descricoes = {
        'Autoconsciência': 'Capacidade de reconhecer e compreender as próprias emoções.',
        'Autorregulação': 'Capacidade de controlar e gerenciar as próprias emoções.',
        'Motivação': 'Capacidade de se manter motivado e focado em objetivos.',
        'Empatia': 'Capacidade de compreender e compartilhar os sentimentos dos outros.',
        'Habilidades Sociais': 'Capacidade de se relacionar e influenciar positivamente.'
    };
    return descricoes[competencia] || '';
}

// ============================================
// 4. ALGORITMO VALORES (36 perguntas)
// ============================================

function calcularValores(respostas) {
    // respostas: array de objetos { pergunta: 1, valor: 1-5 }
    
    var dimensoes = {
        'Realização': { questions: [1, 13, 25] },
        'Reconhecimento': { questions: [2, 14, 26] },
        'Segurança': { questions: [3, 15, 27] },
        'Autonomia': { questions: [4, 16, 28] },
        'Aprendizado': { questions: [5, 17, 29] },
        'Colaboração': { questions: [6, 18, 30] },
        'Estabilidade': { questions: [7, 19, 31] },
        'Inovação': { questions: [8, 20, 32] },
        'Propósito': { questions: [9, 21, 33] },
        'Ética': { questions: [10, 22, 34] },
        'Qualidade de Vida': { questions: [11, 23, 35] },
        'Resultado': { questions: [12, 24, 36] }
    };
    
    var resultados = {};
    var ranking = [];
    
    for (var dim in dimensoes) {
        var qs = dimensoes[dim].questions;
        var soma = 0;
        var count = 0;
        
        for (var i = 0; i < qs.length; i++) {
            var pergunta = qs[i];
            var valor = 0;
            
            for (var j = 0; j < respostas.length; j++) {
                var r = respostas[j];
                var numPergunta = r.pergunta || r.numero || (j + 1);
                if (numPergunta == pergunta) {
                    valor = r.valor || r.resposta || 3;
                    break;
                }
            }
            
            if (valor > 0) {
                soma += valor;
                count++;
            }
        }
        
        var media = count > 0 ? soma / count : 3;
        var percentual = Math.round(((media - 1) / 4) * 100);
        
        resultados[dim] = {
            media: media,
            percentual: percentual,
            valor: percentual
        };
        
        ranking.push({ nome: dim, valor: percentual });
    }
    
    // Ordenar ranking
    ranking.sort(function(a, b) { return b.valor - a.valor; });
    
    return {
        resultados: resultados,
        ranking: ranking,
        top_3: ranking.slice(0, 3),
        descricao_geral: 'Valores predominantes: ' + ranking.slice(0, 3).map(function(v) { return v.nome; }).join(', ')
    };
}

// ============================================
// 5. ALGORITMO SWOT (40 perguntas)
// ============================================

function calcularSWOT(respostas) {
    // respostas: array de objetos { pergunta: 1, valor: 1-5 }
    
    var quadrantes = {
        'Forças': { questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        'Fraquezas': { questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
        'Oportunidades': { questions: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
        'Ameaças': { questions: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] }
    };
    
    var resultados = {};
    var totalGeral = 0;
    var countGeral = 0;
    
    for (var quad in quadrantes) {
        var qs = quadrantes[quad].questions;
        var soma = 0;
        var count = 0;
        
        for (var i = 0; i < qs.length; i++) {
            var pergunta = qs[i];
            var valor = 0;
            
            for (var j = 0; j < respostas.length; j++) {
                var r = respostas[j];
                var numPergunta = r.pergunta || r.numero || (j + 1);
                if (numPergunta == pergunta) {
                    valor = r.valor || r.resposta || 3;
                    break;
                }
            }
            
            if (valor > 0) {
                soma += valor;
                count++;
            }
        }
        
        var media = count > 0 ? soma / count : 3;
        var percentual = Math.round(((media - 1) / 4) * 100);
        
        var nivel = '';
        if (percentual >= 75) nivel = 'Muito Alto';
        else if (percentual >= 60) nivel = 'Alto';
        else if (percentual >= 40) nivel = 'Moderado';
        else if (percentual >= 25) nivel = 'Baixo';
        else nivel = 'Muito Baixo';
        
        resultados[quad] = {
            media: media,
            percentual: percentual,
            nivel: nivel,
            descricao: getDescricaoSWOT(quad, percentual),
            itens: getItensSWOT(quad, respostas, qs)
        };
        
        totalGeral += soma;
        countGeral += count;
    }
    
    var indiceGeral = countGeral > 0 ? Math.round(((totalGeral / countGeral - 1) / 4) * 100) : 50;
    
    return {
        resultados: resultados,
        indice_geral: indiceGeral,
        descricao_geral: getDescricaoGeralSWOT(resultados)
    };
}

function getDescricaoSWOT(quadrante, percentual) {
    var descricoes = {
        'Forças': 'Você identificou forças significativas que podem ser potencializadas.',
        'Fraquezas': 'Você identificou áreas que podem ser desenvolvidas.',
        'Oportunidades': 'Você identificou oportunidades relevantes no mercado.',
        'Ameaças': 'Você identificou ameaças que precisam ser monitoradas.'
    };
    return descricoes[quadrante] || '';
}

function getItensSWOT(quadrante, respostas, questoes) {
    var itens = [];
    var descricoes = {
        'Forças': [
            'Habilidades técnicas', 'Capacidade de aprendizado', 'Resolução de problemas',
            'Comunicação clara', 'Experiência relevante', 'Organização',
            'Capacidade de liderança', 'Criatividade', 'Resiliência',
            'Relacionamentos profissionais'
        ],
        'Fraquezas': [
            'Dificuldade com prazos', 'Desconforto com mudanças', 'Falta de conhecimento técnico',
            'Dificuldade de falar em público', 'Procrastinação', 'Estresse sob pressão',
            'Baixa tolerância a feedbacks', 'Falta de idioma', 'Dificuldade em equipe',
            'Tarefas improdutivas'
        ],
        'Oportunidades': [
            'Mercado valoriza experiência', 'Cursos disponíveis', 'Networking em eventos',
            'Promoção na empresa', 'Crescimento do setor', 'Empresas buscam profissionais',
            'Especialização em alta', 'Novas tecnologias', 'Perfil raro no mercado',
            'Reposicionamento profissional'
        ],
        'Ameaças': [
            'Mercado competitivo', 'Mudanças tecnológicas', 'Crises econômicas',
            'Profissionais mais jovens', 'Automação', 'Falta de oportunidades',
            'Redução de custos', 'Concorrência qualificada', 'Mudanças legislativas',
            'Perda de contatos'
        ]
    };
    
    var lista = descricoes[quadrante] || [];
    var valores = [];
    
    for (var i = 0; i < questoes.length && i < respostas.length; i++) {
        var v = 0;
        for (var j = 0; j < respostas.length; j++) {
            if (respostas[j].pergunta == questoes[i] || respostas[j].numero == questoes[i]) {
                v = respostas[j].valor || respostas[j].resposta || 3;
                break;
            }
        }
        if (i < lista.length) {
            valores.push({ item: lista[i], valor: v });
        }
    }
    
    return valores;
}

function getDescricaoGeralSWOT(resultados) {
    var forcas = resultados['Forças'] ? resultados['Forças'].percentual : 0;
    var fraquezas = resultados['Fraquezas'] ? resultados['Fraquezas'].percentual : 0;
    var oportunidades = resultados['Oportunidades'] ? resultados['Oportunidades'].percentual : 0;
    var ameacas = resultados['Ameaças'] ? resultados['Ameaças'].percentual : 0;
    
    var desc = 'Forças: ' + forcas + '% | Fraquezas: ' + fraquezas + '% | Oportunidades: ' + oportunidades + '% | Ameaças: ' + ameacas + '%';
    return desc;
}

// ============================================
// EXPORTAÇÃO
// ============================================

if (typeof window !== 'undefined') {
    window.VigorreCalculadora = {
        calcularDISC: calcularDISC,
        calcularBigFive: calcularBigFive,
        calcularIE: calcularIE,
        calcularValores: calcularValores,
        calcularSWOT: calcularSWOT
    };
    console.log('✅ Calculadora VIGORRE carregada com sucesso!');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calcularDISC,
        calcularBigFive,
        calcularIE,
        calcularValores,
        calcularSWOT
    };
}
