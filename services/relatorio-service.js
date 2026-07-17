import supabase from '../supabase-config.js';
import algorithms from '../algorithms/index.js';
import CreditoService from './credito-service.js';

class RelatorioService {
  
  async gerarRelatorio(participanteId, empresaId, testeId) {
    try {
      const reserva = await CreditoService.reservarCredito(
        empresaId,
        'relatorio',
        participanteId,
        testeId
      );
      
      const { data: participante } = await supabase
        .from('participantes')
        .select('*')
        .eq('id', participanteId)
        .single();
      
      const { data: resultado } = await supabase
        .from('resultados')
        .select('*')
        .eq('participante_id', participanteId)
        .eq('teste_id', testeId)
        .single();
      
      const relatorio = this.montarRelatorio(participante, resultado);
      
      const { data: relatorioSalvo } = await supabase
        .from('relatorios')
        .insert({
          participante_id: participanteId,
          empresa_id: empresaId,
          teste_id: testeId,
          conteudo: relatorio,
          data_geracao: new Date().toISOString()
        })
        .select()
        .single();
      
      await CreditoService.confirmarConsumo(reserva.id);
      
      return relatorioSalvo;
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }
  
  montarRelatorio(participante, resultado) {
    const dados = resultado.resultados;
    const tipo = dados.tipo;
    
    const base = {
      identificacao: {
        nome: participante.nome,
        email: participante.email,
        cargo: participante.cargo,
        data_geracao: new Date().toISOString(),
        tipo_teste: tipo
      }
    };
    
    switch (tipo) {
      case 'disc':
        return { ...base, ...this.montarRelatorioDISC(dados) };
      case 'bigfive':
        return { ...base, ...this.montarRelatorioBigFive(dados) };
      case 'ie':
        return { ...base, ...this.montarRelatorioIE(dados) };
      case 'valores':
        return { ...base, ...this.montarRelatorioValores(dados) };
      case 'swot':
        return { ...base, ...this.montarRelatorioSWOT(dados) };
      default:
        return base;
    }
  }
  
  montarRelatorioDISC(dados) {
    return {
      perfil: dados.profile,
      scores: dados.normalized,
      descricao: this.getDescricaoDISC(dados.profile),
      recomendacoes: this.getRecomendacoesDISC(dados.profile)
    };
  }
  
  montarRelatorioBigFive(dados) {
    return {
      scores: dados.normalized,
      descricao: this.getDescricaoBigFive(dados.normalized),
      recomendacoes: this.getRecomendacoesBigFive(dados.normalized)
    };
  }
  
  montarRelatorioIE(dados) {
    return {
      dimensoes: dados.dimensions,
      indice_geral: dados.generalIndex,
      nivel: dados.level,
      recomendacoes: this.getRecomendacoesIE(dados.dimensions)
    };
  }
  
  montarRelatorioValores(dados) {
    return {
      ranking: dados.ranking,
      top5: dados.top5,
      top1: dados.top1,
      recomendacoes: this.getRecomendacoesValores(dados.top5)
    };
  }
  
  montarRelatorioSWOT(dados) {
    return {
      scores: dados.scores,
      recomendacoes: this.getRecomendacoesSWOT(dados.scores)
    };
  }
  
  getDescricaoDISC(profile) {
    const descricoes = {
      'Dominância': 'Orientado a resultados, direto e competitivo',
      'Influência': 'Comunicativo, persuasivo e otimista',
      'Estabilidade': 'Paciente, confiável e colaborativo',
      'Conformidade': 'Detalhista, preciso e analítico'
    };
    return descricoes[profile] || 'Perfil equilibrado e adaptável';
  }
  
  getRecomendacoesDISC(profile) {
    const recomendacoes = {
      'Dominância': 'Trabalhe a paciência e escuta ativa',
      'Influência': 'Desenvolva organização e follow-up',
      'Estabilidade': 'Fortaleça a tomada de decisão',
      'Conformidade': 'Desenvolva flexibilidade e adaptação'
    };
    return recomendacoes[profile] || 'Continue desenvolvendo todos os aspectos';
  }
  
  getDescricaoBigFive(scores) {
    let desc = '';
    const maior = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const nomes = {
      O: 'Abertura à Experiência',
      C: 'Conscienciosidade',
      E: 'Extroversão',
      A: 'Amabilidade',
      N: 'Neuroticismo'
    };
    return `${nomes[maior[0]]} é sua dimensão predominante`;
  }
  
  getRecomendacoesBigFive(scores) {
    const recs = [];
    Object.entries(scores).forEach(([dim, score]) => {
      if (score < 40) {
        const nomes = {
          O: 'Explore novas experiências e saia da zona de conforto',
          C: 'Desenvolva organização e disciplina',
          E: 'Fortaleça sua rede de contatos e comunicação',
          A: 'Desenvolva empatia e colaboração',
          N: 'Trabalhe o controle emocional e resiliência'
        };
        recs.push(nomes[dim]);
      }
    });
    return recs;
  }
  
  getRecomendacoesIE(dimensoes) {
    const recs = [];
    Object.entries(dimensoes).forEach(([dim, score]) => {
      if (score < 50) {
        const nomes = {
          self_awareness: 'Pratique autoconhecimento e reflexão',
          self_regulation: 'Desenvolva técnicas de controle emocional',
          motivation: 'Encontre seu propósito e motivação',
          empathy: 'Pratique escuta ativa e empatia',
          social_skills: 'Desenvolva habilidades de relacionamento'
        };
        recs.push(nomes[dim]);
      }
    });
    return recs;
  }
  
  getRecomendacoesValores(top5) {
    if (!top5 || top5.length === 0) return ['Explore seus valores pessoais'];
    return [`Seus valores principais são: ${top5.map(v => v.name).join(', ')}`];
  }
  
  getRecomendacoesSWOT(scores) {
    const recs = [];
    if (scores.forcas < 50) recs.push('Identifique e desenvolva suas forças');
    if (scores.fraquezas > 60) recs.push('Trabalhe suas áreas de desenvolvimento');
    if (scores.oportunidades < 40) recs.push('Crie oportunidades de crescimento');
    if (scores.ameacas > 60) recs.push('Desenvolva estratégias para mitigar riscos');
    return recs;
  }
}

export default new RelatorioService();
