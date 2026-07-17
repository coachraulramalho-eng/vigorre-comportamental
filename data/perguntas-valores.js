// ============================================
// PERGUNTAS DOS VALORES - 36 QUESTÕES
// ============================================

export const perguntasValores = [
    // ===== Realização (3 perguntas) =====
    { enunciado: 'Alcançar metas desafiadoras.', dimensao: 'realizacao' },
    { enunciado: 'Ser o melhor na minha área.', dimensao: 'realizacao' },
    { enunciado: 'Superar metas estabelecidas.', dimensao: 'realizacao' },

    // ===== Reconhecimento (3 perguntas) =====
    { enunciado: 'Ser reconhecido pelo meu trabalho.', dimensao: 'reconhecimento' },
    { enunciado: 'Ter visibilidade na organização.', dimensao: 'reconhecimento' },
    { enunciado: 'Receber reconhecimento público.', dimensao: 'reconhecimento' },

    // ===== Segurança (3 perguntas) =====
    { enunciado: 'Ter estabilidade profissional.', dimensao: 'seguranca' },
    { enunciado: 'Ter um emprego seguro.', dimensao: 'seguranca' },
    { enunciado: 'Ter um futuro profissional garantido.', dimensao: 'seguranca' },

    // ===== Autonomia (3 perguntas) =====
    { enunciado: 'Ter liberdade para tomar decisões.', dimensao: 'autonomia' },
    { enunciado: 'Ter autonomia sobre meu trabalho.', dimensao: 'autonomia' },
    { enunciado: 'Ter controle sobre minha agenda.', dimensao: 'autonomia' },

    // ===== Aprendizado (3 perguntas) =====
    { enunciado: 'Aprender coisas novas constantemente.', dimensao: 'aprendizado' },
    { enunciado: 'Buscar conhecimento continuamente.', dimensao: 'aprendizado' },
    { enunciado: 'Crescer intelectualmente.', dimensao: 'aprendizado' },

    // ===== Colaboração (3 perguntas) =====
    { enunciado: 'Trabalhar em equipe.', dimensao: 'colaboracao' },
    { enunciado: 'Colaborar com pessoas.', dimensao: 'colaboracao' },
    { enunciado: 'Fazer parte de uma equipe coesa.', dimensao: 'colaboracao' },

    // ===== Estabilidade (3 perguntas) =====
    { enunciado: 'Ter um ambiente de trabalho previsível.', dimensao: 'estabilidade' },
    { enunciado: 'Ter processos claros e definidos.', dimensao: 'estabilidade' },
    { enunciado: 'Ter rotina e estrutura.', dimensao: 'estabilidade' },

    // ===== Inovação (3 perguntas) =====
    { enunciado: 'Criar soluções inovadoras.', dimensao: 'inovacao' },
    { enunciado: 'Ser criativo e pensar diferente.', dimensao: 'inovacao' },
    { enunciado: 'Inovar e criar novas soluções.', dimensao: 'inovacao' },

    // ===== Propósito (3 perguntas) =====
    { enunciado: 'Contribuir para um propósito maior.', dimensao: 'proposito' },
    { enunciado: 'Ter um propósito de vida.', dimensao: 'proposito' },
    { enunciado: 'Fazer a diferença na vida das pessoas.', dimensao: 'proposito' },

    // ===== Ética (3 perguntas) =====
    { enunciado: 'Agir com honestidade e transparência.', dimensao: 'etica' },
    { enunciado: 'Agir com integridade.', dimensao: 'etica' },
    { enunciado: 'Ser ético em todas as decisões.', dimensao: 'etica' },

    // ===== Qualidade de Vida (3 perguntas) =====
    { enunciado: 'Ter equilíbrio entre vida pessoal e profissional.', dimensao: 'qualidade_vida' },
    { enunciado: 'Ter tempo para família e lazer.', dimensao: 'qualidade_vida' },
    { enunciado: 'Ter qualidade de vida.', dimensao: 'qualidade_vida' },

    // ===== Resultado (3 perguntas) =====
    { enunciado: 'Gerar resultados concretos.', dimensao: 'resultado' },
    { enunciado: 'Ser bem-sucedido profissionalmente.', dimensao: 'resultado' },
    { enunciado: 'Entregar resultados excepcionais.', dimensao: 'resultado' }
];

// ============================================
// DIMENSÕES VALORES PARA REFERÊNCIA
// ============================================

export const dimensoesValores = {
    realizacao: {
        nome: 'Realização',
        cor: '#EF4444',
        icone: '🏆',
        descricao: 'Busca por conquistas e metas desafiadoras'
    },
    reconhecimento: {
        nome: 'Reconhecimento',
        cor: '#F59E0B',
        icone: '👏',
        descricao: 'Desejo de ser valorizado e reconhecido'
    },
    seguranca: {
        nome: 'Segurança',
        cor: '#10B981',
        icone: '🛡️',
        descricao: 'Necessidade de estabilidade e previsibilidade'
    },
    autonomia: {
        nome: 'Autonomia',
        cor: '#3B82F6',
        icone: '🚀',
        descricao: 'Desejo de independência e liberdade'
    },
    aprendizado: {
        nome: 'Aprendizado',
        cor: '#8B5CF6',
        icone: '📚',
        descricao: 'Busca por conhecimento e desenvolvimento'
    },
    colaboracao: {
        nome: 'Colaboração',
        cor: '#EC4899',
        icone: '🤝',
        descricao: 'Valorização do trabalho em equipe'
    },
    estabilidade: {
        nome: 'Estabilidade',
        cor: '#6366F1',
        icone: '📋',
        descricao: 'Preferência por ambientes estruturados'
    },
    inovacao: {
        nome: 'Inovação',
        cor: '#14B8A6',
        icone: '💡',
        descricao: 'Criatividade e busca por novidades'
    },
    proposito: {
        nome: 'Propósito',
        cor: '#F472B6',
        icone: '🎯',
        descricao: 'Sentido de contribuição e impacto'
    },
    etica: {
        nome: 'Ética',
        cor: '#22D3EE',
        icone: '⚖️',
        descricao: 'Compromisso com integridade e transparência'
    },
    qualidade_vida: {
        nome: 'Qualidade de Vida',
        cor: '#A3E635',
        icone: '🌿',
        descricao: 'Equilíbrio entre vida pessoal e profissional'
    },
    resultado: {
        nome: 'Resultado',
        cor: '#FB923C',
        icone: '📈',
        descricao: 'Foco em entregas e desempenho'
    }
};
