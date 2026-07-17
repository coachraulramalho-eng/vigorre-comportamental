// ============================================
// PERGUNTAS DO SWOT - 40 QUESTÕES
// ============================================

export const perguntasSWOT = [
    // ===== FORÇAS (10 perguntas) =====
    { enunciado: 'Possuo habilidades técnicas que me destacam.', dimensao: 'forcas' },
    { enunciado: 'Tenho facilidade para aprender rapidamente.', dimensao: 'forcas' },
    { enunciado: 'Sou bom em resolver problemas complexos.', dimensao: 'forcas' },
    { enunciado: 'Me comunico de forma clara e objetiva.', dimensao: 'forcas' },
    { enunciado: 'Tenho experiência relevante na minha área.', dimensao: 'forcas' },
    { enunciado: 'Sou organizado e planejado.', dimensao: 'forcas' },
    { enunciado: 'Tenho boa capacidade de liderança.', dimensao: 'forcas' },
    { enunciado: 'Sou criativo e inovador.', dimensao: 'forcas' },
    { enunciado: 'Tenho resiliência diante de desafios.', dimensao: 'forcas' },
    { enunciado: 'Construo relacionamentos profissionais sólidos.', dimensao: 'forcas' },

    // ===== FRAQUEZAS (10 perguntas) =====
    { enunciado: 'Tenho dificuldade com prazos curtos.', dimensao: 'fraquezas', reverse: true },
    { enunciado: 'Me sinto desconfortável com mudanças.', dimensao: 'fraquezas', reverse: true },
    { enunciado: 'Não tenho conhecimento em algumas áreas técnicas.', dimensao: 'fraquezas', reverse: true },
    { enunciado: 'Tenho dificuldade de falar em público.', dimensao: 'fraquezas', reverse: true },
    { enunciado: 'Procrastino tarefas importantes.', dimensao: 'fraquezas', reverse: true },
    { enunciado: 'Me estresso facilmente com pressão.', dimensao: 'fraquezas', reverse: true },
    { enunciado: 'Tenho baixa tolerância a feedbacks.', dimensao: 'fraquezas', reverse: true },
    { enunciado: 'Não tenho domínio de outro idioma.', dimensao: 'fraquezas', reverse: true },
    { enunciado: 'Tenho dificuldade de trabalhar em equipe.', dimensao: 'fraquezas', reverse: true },
    { enunciado: 'Gasto muito tempo em tarefas improdutivas.', dimensao: 'fraquezas', reverse: true },

    // ===== OPORTUNIDADES (10 perguntas) =====
    { enunciado: 'O mercado valoriza minha experiência.', dimensao: 'oportunidades' },
    { enunciado: 'Cursos e certificações estão disponíveis.', dimensao: 'oportunidades' },
    { enunciado: 'Posso fazer networking em eventos.', dimensao: 'oportunidades' },
    { enunciado: 'Oportunidades de promoção na empresa.', dimensao: 'oportunidades' },
    { enunciado: 'Crescimento do setor está acelerado.', dimensao: 'oportunidades' },
    { enunciado: 'Empresas buscam profissionais como eu.', dimensao: 'oportunidades' },
    { enunciado: 'Posso me especializar em áreas em alta.', dimensao: 'oportunidades' },
    { enunciado: 'Novas tecnologias abrem portas.', dimensao: 'oportunidades' },
    { enunciado: 'Meu perfil é raro no mercado.', dimensao: 'oportunidades' },
    { enunciado: 'Posso me reposicionar profissionalmente.', dimensao: 'oportunidades' },

    // ===== AMEAÇAS (10 perguntas) =====
    { enunciado: 'O mercado está muito competitivo.', dimensao: 'ameacas', reverse: true },
    { enunciado: 'Mudanças tecnológicas podem me desatualizar.', dimensao: 'ameacas', reverse: true },
    { enunciado: 'Crises econômicas podem reduzir vagas.', dimensao: 'ameacas', reverse: true },
    { enunciado: 'Profissionais mais jovens disputam minha vaga.', dimensao: 'ameacas', reverse: true },
    { enunciado: 'Minha área pode ser automatizada.', dimensao: 'ameacas', reverse: true },
    { enunciado: 'Falta de oportunidades na minha região.', dimensao: 'ameacas', reverse: true },
    { enunciado: 'Empresas estão reduzindo custos.', dimensao: 'ameacas', reverse: true },
    { enunciado: 'A concorrência está mais qualificada.', dimensao: 'ameacas', reverse: true },
    { enunciado: 'Mudanças na legislação podem impactar.', dimensao: 'ameacas', reverse: true },
    { enunciado: 'Perder contatos profissionais importantes.', dimensao: 'ameacas', reverse: true }
];

// ============================================
// DIMENSÕES SWOT PARA REFERÊNCIA
// ============================================

export const dimensoesSWOT = {
    forcas: {
        nome: 'Forças',
        cor: '#10B981',
        icone: '💪',
        descricao: 'Competências e talentos que você possui'
    },
    fraquezas: {
        nome: 'Fraquezas',
        cor: '#EF4444',
        icone: '⚠️',
        descricao: 'Áreas que precisam de desenvolvimento'
    },
    oportunidades: {
        nome: 'Oportunidades',
        cor: '#3B82F6',
        icone: '🌟',
        descricao: 'Possibilidades de crescimento e avanço'
    },
    ameacas: {
        nome: 'Ameaças',
        cor: '#F59E0B',
        icone: '⚡',
        descricao: 'Riscos e desafios externos'
    }
};
