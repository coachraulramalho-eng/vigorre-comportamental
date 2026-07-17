// ============================================
// PERGUNTAS DA INTELIGÊNCIA EMOCIONAL - 40 QUESTÕES
// ============================================

export const perguntasIE = [
    // ===== Autoconsciência (8 perguntas) =====
    { enunciado: 'Reconheço minhas emoções no momento em que elas surgem.', dimensao: 'self_awareness' },
    { enunciado: 'Entendo o que estou sentindo.', dimensao: 'self_awareness' },
    { enunciado: 'Sei identificar o que me deixa feliz ou triste.', dimensao: 'self_awareness' },
    { enunciado: 'Reconheço como meus sentimentos afetam meu desempenho.', dimensao: 'self_awareness' },
    { enunciado: 'Compreendo minhas reações emocionais.', dimensao: 'self_awareness' },
    { enunciado: 'Sei o que me motiva.', dimensao: 'self_awareness' },
    { enunciado: 'Reconheço minhas limitações emocionais.', dimensao: 'self_awareness' },
    { enunciado: 'Sei como minhas emoções afetam os outros.', dimensao: 'self_awareness' },

    // ===== Autorregulação (8 perguntas) =====
    { enunciado: 'Consigo controlar minhas reações emocionais.', dimensao: 'self_regulation' },
    { enunciado: 'Consigo me acalmar quando estou irritado.', dimensao: 'self_regulation' },
    { enunciado: 'Não deixo as emoções controlarem minhas ações.', dimensao: 'self_regulation' },
    { enunciado: 'Consigo expressar minhas emoções de forma adequada.', dimensao: 'self_regulation' },
    { enunciado: 'Tenho autocontrole em situações difíceis.', dimensao: 'self_regulation' },
    { enunciado: 'Consigo lidar com críticas construtivas.', dimensao: 'self_regulation' },
    { enunciado: 'Tenho equilíbrio emocional.', dimensao: 'self_regulation' },
    { enunciado: 'Consigo me recompor após uma frustração.', dimensao: 'self_regulation' },

    // ===== Motivação (8 perguntas) =====
    { enunciado: 'Tenho objetivos claros que me motivam.', dimensao: 'motivation' },
    { enunciado: 'Sou persistente mesmo diante de dificuldades.', dimensao: 'motivation' },
    { enunciado: 'Tenho energia e entusiasmo.', dimensao: 'motivation' },
    { enunciado: 'Sou otimista em relação ao futuro.', dimensao: 'motivation' },
    { enunciado: 'Mantenho o foco em meus objetivos.', dimensao: 'motivation' },
    { enunciado: 'Sou determinado a alcançar meus sonhos.', dimensao: 'motivation' },
    { enunciado: 'Sou movido por propósitos.', dimensao: 'motivation' },
    { enunciado: 'Tenho paixão pelo que faço.', dimensao: 'motivation' },

    // ===== Empatia (8 perguntas) =====
    { enunciado: 'Percebo quando os outros estão tristes ou preocupados.', dimensao: 'empathy' },
    { enunciado: 'Escuto os outros com atenção.', dimensao: 'empathy' },
    { enunciado: 'Me coloco no lugar do outro.', dimensao: 'empathy' },
    { enunciado: 'Percebo as necessidades emocionais dos outros.', dimensao: 'empathy' },
    { enunciado: 'Sou sensível aos sentimentos alheios.', dimensao: 'empathy' },
    { enunciado: 'Percebo quando alguém precisa de ajuda.', dimensao: 'empathy' },
    { enunciado: 'Tenho empatia pelas dificuldades dos outros.', dimensao: 'empathy' },
    { enunciado: 'Percebo mudanças no humor das pessoas.', dimensao: 'empathy' },

    // ===== Habilidades Sociais (8 perguntas) =====
    { enunciado: 'Sei como me conectar com as pessoas.', dimensao: 'social_skills' },
    { enunciado: 'Tenho facilidade para resolver conflitos.', dimensao: 'social_skills' },
    { enunciado: 'Sei como construir relacionamentos duradouros.', dimensao: 'social_skills' },
    { enunciado: 'Sei como influenciar pessoas positivamente.', dimensao: 'social_skills' },
    { enunciado: 'Sei como trabalhar em equipe.', dimensao: 'social_skills' },
    { enunciado: 'Sei como gerenciar relacionamentos.', dimensao: 'social_skills' },
    { enunciado: 'Sei como resolver conflitos interpessoais.', dimensao: 'social_skills' },
    { enunciado: 'Sei como criar conexões significativas.', dimensao: 'social_skills' }
];

// ============================================
// DIMENSÕES IE PARA REFERÊNCIA
// ============================================

export const dimensoesIE = {
    self_awareness: {
        nome: 'Autoconsciência',
        cor: '#8B5CF6',
        icone: '🧠',
        descricao: 'Reconhecer e compreender suas próprias emoções'
    },
    self_regulation: {
        nome: 'Autorregulação',
        cor: '#3B82F6',
        icone: '⚖️',
        descricao: 'Controlar e gerenciar reações emocionais'
    },
    motivation: {
        nome: 'Motivação',
        cor: '#10B981',
        icone: '🔥',
        descricao: 'Energia, propósito e persistência'
    },
    empathy: {
        nome: 'Empatia',
        cor: '#EC4899',
        icone: '❤️',
        descricao: 'Compreender e sentir as emoções dos outros'
    },
    social_skills: {
        nome: 'Habilidades Sociais',
        cor: '#F59E0B',
        icone: '🤝',
        descricao: 'Construir e manter relacionamentos saudáveis'
    }
};
