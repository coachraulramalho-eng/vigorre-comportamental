// ============================================
// PERGUNTAS DO BIG FIVE - 60 QUESTÕES
// ============================================

export const perguntasBigFive = [
    // ===== O - Abertura (12 perguntas) =====
    { enunciado: 'Sou curioso sobre muitas coisas diferentes.', dimensao: 'O' },
    { enunciado: 'Tenho uma imaginação ativa.', dimensao: 'O' },
    { enunciado: 'Aprecio novas experiências.', dimensao: 'O' },
    { enunciado: 'Gosto de explorar novas ideias.', dimensao: 'O' },
    { enunciado: 'Tenho interesse em arte e cultura.', dimensao: 'O' },
    { enunciado: 'Sou criativo na resolução de problemas.', dimensao: 'O' },
    { enunciado: 'Gosto de aprender coisas novas.', dimensao: 'O' },
    { enunciado: 'Gosto de desafios intelectuais.', dimensao: 'O' },
    { enunciado: 'Sou aberto a mudanças.', dimensao: 'O' },
    { enunciado: 'Gosto de ler e estudar.', dimensao: 'O' },
    { enunciado: 'Busco novas experiências.', dimensao: 'O' },
    { enunciado: 'Sou curioso sobre o mundo.', dimensao: 'O' },

    // ===== C - Conscienciosidade (12 perguntas) =====
    { enunciado: 'Não tenho dificuldade em manter as coisas organizadas.', dimensao: 'C' },
    { enunciado: 'Presto atenção aos detalhes.', dimensao: 'C' },
    { enunciado: 'Sou disciplinado e cumpro prazos.', dimensao: 'C' },
    { enunciado: 'Mantenho minha mesa e espaço organizados.', dimensao: 'C' },
    { enunciado: 'Concluo as tarefas que começo.', dimensao: 'C' },
    { enunciado: 'Planejo minhas atividades com antecedência.', dimensao: 'C' },
    { enunciado: 'Sou uma pessoa organizada.', dimensao: 'C' },
    { enunciado: 'Cumpro minhas obrigações.', dimensao: 'C' },
    { enunciado: 'Sou metódico no que faço.', dimensao: 'C' },
    { enunciado: 'Sou confiável e responsável.', dimensao: 'C' },
    { enunciado: 'Sou persistente em meus objetivos.', dimensao: 'C' },
    { enunciado: 'Gosto de manter tudo em ordem.', dimensao: 'C' },

    // ===== E - Extroversão (12 perguntas) =====
    { enunciado: 'Gosto de ser o centro das atenções.', dimensao: 'E' },
    { enunciado: 'Sinto-me energizado em ambientes sociais.', dimensao: 'E' },
    { enunciado: 'Prefiro trabalhar em equipe.', dimensao: 'E' },
    { enunciado: 'Tenho facilidade para fazer amigos.', dimensao: 'E' },
    { enunciado: 'Gosto de conversar com estranhos.', dimensao: 'E' },
    { enunciado: 'Me sinto bem em festas e eventos.', dimensao: 'E' },
    { enunciado: 'Tenho facilidade para me comunicar.', dimensao: 'E' },
    { enunciado: 'Tenho uma rede ampla de contatos.', dimensao: 'E' },
    { enunciado: 'Gosto de conhecer pessoas novas.', dimensao: 'E' },
    { enunciado: 'Tenho facilidade para me expressar.', dimensao: 'E' },
    { enunciado: 'Tenho facilidade para influenciar pessoas.', dimensao: 'E' },
    { enunciado: 'Me sinto confiante em situações sociais.', dimensao: 'E' },

    // ===== A - Amabilidade (12 perguntas) =====
    { enunciado: 'Confio nas pessoas facilmente.', dimensao: 'A' },
    { enunciado: 'Sou compreensivo com os outros.', dimensao: 'A' },
    { enunciado: 'Trato todos com respeito.', dimensao: 'A' },
    { enunciado: 'Sou tolerante com as falhas dos outros.', dimensao: 'A' },
    { enunciado: 'Ajudo os outros sempre que posso.', dimensao: 'A' },
    { enunciado: 'Sou generoso com meu tempo.', dimensao: 'A' },
    { enunciado: 'Dou o benefício da dúvida aos outros.', dimensao: 'A' },
    { enunciado: 'Sou paciente com as pessoas.', dimensao: 'A' },
    { enunciado: 'Sou respeitoso com todos.', dimensao: 'A' },
    { enunciado: 'Sou gentil com os outros.', dimensao: 'A' },
    { enunciado: 'Sou colaborativo.', dimensao: 'A' },
    { enunciado: 'Sou empático com os sentimentos dos outros.', dimensao: 'A' },

    // ===== N - Neuroticismo (12 perguntas) =====
    { enunciado: 'Frequentemente me sinto tenso e ansioso.', dimensao: 'N', reverse: true },
    { enunciado: 'Fico facilmente preocupado com as coisas.', dimensao: 'N', reverse: true },
    { enunciado: 'Costumo me sentir triste ou deprimido.', dimensao: 'N', reverse: true },
    { enunciado: 'Me preocupo com coisas que podem dar errado.', dimensao: 'N', reverse: true },
    { enunciado: 'Costumo me sentir inseguro.', dimensao: 'N', reverse: true },
    { enunciado: 'Fico nervoso em situações novas.', dimensao: 'N', reverse: true },
    { enunciado: 'Frequentemente me sinto sobrecarregado.', dimensao: 'N', reverse: true },
    { enunciado: 'Tenho dificuldade para relaxar.', dimensao: 'N', reverse: true },
    { enunciado: 'Reajo fortemente a críticas.', dimensao: 'N', reverse: true },
    { enunciado: 'Fico abalado com facilidade.', dimensao: 'N', reverse: true },
    { enunciado: 'Tenho medo de cometer erros.', dimensao: 'N', reverse: true },
    { enunciado: 'Costumo me sentir culpado.', dimensao: 'N', reverse: true }
];

// ============================================
// DIMENSÕES BIG FIVE PARA REFERÊNCIA
// ============================================

export const dimensoesBigFive = {
    O: {
        nome: 'Abertura à Experiência',
        cor: '#8B5CF6',
        descricao: 'Criativo, curioso, mente aberta',
        icone: '🎨'
    },
    C: {
        nome: 'Conscienciosidade',
        cor: '#10B981',
        descricao: 'Organizado, disciplinado, confiável',
        icone: '📋'
    },
    E: {
        nome: 'Extroversão',
        cor: '#F59E0B',
        descricao: 'Sociável, energético, assertivo',
        icone: '🗣️'
    },
    A: {
        nome: 'Amabilidade',
        cor: '#EC4899',
        descricao: 'Cooperativo, empático, confiável',
        icone: '💝'
    },
    N: {
        nome: 'Neuroticismo (Estabilidade)',
        cor: '#EF4444',
        descricao: 'Ansioso, instável, reativo',
        icone: '🌊'
    }
};
