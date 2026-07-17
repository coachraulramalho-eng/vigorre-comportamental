import supabase from '../supabase-config.js';
import algorithms from '../algorithms/index.js';
import CreditoService from './credito-service.js';

class LaudoService {
  
  async gerarLaudo(participanteId, empresaId) {
    try {
      const reserva = await CreditoService.reservarCredito(
        empresaId,
        'premium',
        participanteId,
        'laudo'
      );
      
      const { data: participante } = await supabase
        .from('participantes')
        .select('*')
        .eq('id', participanteId)
        .single();
      
      const { data: resultados } = await supabase
        .from('resultados')
        .select('*')
        .eq('participante_id', participanteId);
      
      const dados = {};
      resultados.forEach(r => {
        dados[r.tipo] = r.resultados;
      });
      
      const vigorIndex = algorithms.vigor.calculateVigorIndex(dados);
      
      const laudo = this.montarLaudo(participante, dados, vigorIndex);
      
      const { data: laudoSalvo } = await supabase
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
      
      await CreditoService.confirmarConsumo(reserva.id);
      
      return laudoSalvo;
      
    } catch (error) {
      console.error('Erro ao gerar laudo:', error);
      throw error;
    }
  }
  
  montarLaudo(participante, dados, vigorIndex) {
    const { disc, bigfive, ie, valores, swot } = dados;
    
    return {
      identificacao: {
        nome: participante.nome,
        email: participante.email,
        cargo: participante.cargo,
        data_geracao: new Date().toISOString()
      },
      metodologia: {
        nome: 'VIGOR®',
        pilares: [
          'Visão Estratégica',
          'Inteligência Humana',
          'Gestão de Performance',
          'Organização Estrutural',
          'Resultados Sustentáveis'
        ]
      },
      perfil_geral: {
        disc: disc?.profile || null,
        bigfive: bigfive?.normalized || null,
        ie: ie?.generalIndex || null,
        vigor: vigorIndex
      },
      personalidade: {
        comunicacao: this.analisarComunicacao(disc, bigfive),
        lideranca: this.analisarLideranca(disc, bigfive),
        carreira: this.analisarCarreira(disc, bigfive, valores)
      },
      desenvolvimento: {
        pontos_fortes: this.identificarPontosFortes(disc, bigfive, ie),
        pontos_desenvolvimento: this.identificarPontosDesenvolvimento(disc, bigfive, ie),
        recomendacoes: vigorIndex.recommendations || []
      }
    };
  }
  
  analisarComunicacao(disc, bigfive) {
    if (!disc) return { perfil: 'Não disponível' };
    const perfil = disc.profile;
    const comunicacao = {
      direta: perfil.includes('Dominância') || perfil.includes('Influência'),
      detalhada: perfil.includes('Conformidade'),
      empatica: perfil.includes('Estabilidade')
    };
    return comunicacao;
  }
  
  analisarLideranca(disc, bigfive) {
    if (!disc || !bigfive) return { perfil: 'Não disponível' };
    const perfil = disc.profile;
    const lideranca = {
      estilo: perfil.includes('Dominância') ? 'Diretivo' :
              perfil.includes('Influência') ? 'Inspirador' :
              perfil.includes('Estabilidade') ? 'Apoiador' :
              perfil.includes('Conformidade') ? 'Analítico' : 'Equilibrado',
      potencial: bigfive.E > 60 ? 'Alto' :
                 bigfive.E > 40 ? 'Médio' : 'Baixo'
    };
    return lideranca;
  }
  
  analisarCarreira(disc, bigfive, valores) {
    if (!valores) return { perfil: 'Não disponível' };
    const top1 = valores.top1;
    return {
      perfil: top1?.name || 'Indefinido',
      ambiente_ideal: this.sugerirAmbiente(top1?.key)
    };
  }
  
  sugerirAmbiente(valor) {
    const ambientes = {
      realizacao: 'Ambientes competitivos com metas desafiadoras',
      reconhecimento: 'Ambientes com visibilidade e feedback',
      seguranca: 'Ambientes estáveis e previsíveis',
      autonomia: 'Ambientes flexíveis com liberdade',
      aprendizado: 'Ambientes com oportunidades de desenvolvimento',
      colaboracao: 'Ambientes colaborativos e em equipe'
    };
    return ambientes[valor] || 'Ambiente equilibrado';
  }
  
  identificarPontosFortes(disc, bigfive, ie) {
    const fortes = [];
    if (disc?.primaryScore > 70) fortes.push(`${disc.primaryName} (perfil DISC)`);
    if (bigfive?.O > 70) fortes.push('Abertura à Experiência');
    if (bigfive?.C > 70) fortes.push('Conscienciosidade');
    if (bigfive?.E > 70) fortes.push('Extroversão');
    if (ie?.generalIndex > 70) fortes.push('Inteligência Emocional');
    return fortes;
  }
  
  identificarPontosDesenvolvimento(disc, bigfive, ie) {
    const desenvolver = [];
    if (disc?.primaryScore < 40) desenvolver.push('Desenvolver perfil comportamental');
    if (bigfive?.C < 40) desenvolver.push('Organização e disciplina');
    if (bigfive?.E < 40) desenvolver.push('Comunicação e networking');
    if (ie?.generalIndex < 40) desenvolver.push('Inteligência Emocional');
    return desenvolver;
  }
}

export default new LaudoService();
