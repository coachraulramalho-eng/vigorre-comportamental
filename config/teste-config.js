// Configurações para os testes

export const TESTE_CONFIG = {
  // Sessão única
  sessaoUnica: true,
  tempoLimite: 30, // minutos
  
  // Mensagens por teste
  mensagens: {
    disc: {
      titulo: 'Assessment DISC Vigorre™',
      descricao: 'Identifica seu estilo comportamental predominante',
      tempo: '5 minutos',
      perguntas: 28,
      formato: 'Selecione MAIS e MENOS representa'
    },
    bigfive: {
      titulo: 'Assessment Big Five Vigorre™',
      descricao: 'Avalia cinco dimensões da personalidade',
      tempo: '12 minutos',
      perguntas: 60,
      formato: 'Escala Likert de 1 a 5'
    },
    ie: {
      titulo: 'Assessment Inteligência Emocional Vigorre™',
      descricao: 'Mede capacidade de reconhecer e gerenciar emoções',
      tempo: '8 minutos',
      perguntas: 40,
      formato: 'Escala Likert de 1 a 5'
    },
    valores: {
      titulo: 'Assessment Valores Vigorre™',
      descricao: 'Identifica o que é mais importante para você',
      tempo: '6 minutos',
      perguntas: 36,
      formato: 'Escala Likert de 1 a 5'
    },
    swot: {
      titulo: 'Assessment SWOT Vigorre™',
      descricao: 'Analisa pontos fortes e oportunidades de desenvolvimento',
      tempo: '10 minutos',
      perguntas: 40,
      formato: 'Escala Likert de 1 a 5'
    }
  },
  
  // Frases motivacionais
  frases: [
    'Respire fundo. Você tem todo o tempo do mundo.',
    'Vai com calma. Cada resposta é um passo no seu autoconhecimento.',
    'Não existe resposta errada. Apenas confie em você.',
    'Você está indo muito bem. Continue no seu ritmo.',
    'Quase lá! Mais algumas perguntas e você terá insights incríveis.',
    'Parabéns! Você concluiu mais uma etapa da sua jornada de autoconhecimento.'
  ],
  
  // Modo foco
  modoFoco: {
    ativo: true,
    fundoNeutro: true,
    fonteMinima: '16px',
    semNotificacoes: true
  },
  
  // Acessibilidade
  acessibilidade: {
    contrasteMinimo: '4.5:1',
    navegacaoTeclado: true,
    leitoresTela: true
  }
};
