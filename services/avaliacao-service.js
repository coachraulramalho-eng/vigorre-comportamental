import supabase from '../supabase-config.js';
import algorithms from '../algorithms/index.js';

class AvaliacaoService {
  
  async processarAvaliacao(participanteId, testeId, respostas) {
    try {
      const { data: teste } = await supabase
        .from('testes')
        .select('*')
        .eq('id', testeId)
        .single();
      
      await this.salvarRespostas(participanteId, testeId, respostas);
      
      let resultados;
      switch (teste.tipo) {
        case 'disc':
          resultados = await this.processarDISC(respostas);
          break;
        case 'bigfive':
          resultados = await this.processarBigFive(respostas);
          break;
        case 'ie':
          resultados = await this.processarIE(respostas);
          break;
        case 'valores':
          resultados = await this.processarValores(respostas);
          break;
        case 'swot':
          resultados = await this.processarSWOT(respostas);
          break;
        default:
          throw new Error('Tipo de teste não suportado');
      }
      
      const { data: resultado } = await supabase
        .from('resultados')
        .insert({
          participante_id: participanteId,
          teste_id: testeId,
          data: new Date().toISOString(),
          resultados: resultados
        })
        .select()
        .single();
      
      await this.verificarConsentimento(participanteId);
      await this.atualizarIndicesVigor(participanteId);
      
      return resultado;
      
    } catch (error) {
      console.error('Erro ao processar avaliação:', error);
      throw error;
    }
  }
  
  async processarDISC(respostas) {
    const rawScores = algorithms.disc.calculateRawScores(respostas);
    const normalized = algorithms.disc.normalizeScores(rawScores);
    const profile = algorithms.disc.determineProfile(normalized);
    return { tipo: 'disc', rawScores, normalized, profile };
  }
  
  async processarBigFive(respostas) {
    const averages = algorithms.bigfive.calculateRawScores(respostas);
    const normalized = algorithms.bigfive.normalizeScores(averages);
    return { tipo: 'bigfive', averages, normalized };
  }
  
  async processarIE(respostas) {
    return { tipo: 'ie', ...algorithms.ie.calculateIEScores(respostas) };
  }
  
  async processarValores(respostas) {
    return { tipo: 'valores', ...algorithms.valores.calculateValoresScores(respostas) };
  }
  
  async processarSWOT(respostas) {
    return { tipo: 'swot', ...algorithms.swot.calculateSWOTScores(respostas) };
  }
  
  async atualizarIndicesVigor(participanteId) {
    const { data: resultados } = await supabase
      .from('resultados')
      .select('*')
      .eq('participante_id', participanteId);
    
    if (!resultados || resultados.length === 0) return;
    
    const data = {};
    resultados.forEach(r => {
      switch (r.tipo) {
        case 'disc': data.disc = r.resultados.normalized; break;
        case 'bigfive': data.bigfive = r.resultados.normalized; break;
        case 'ie': data.ie = r.resultados; break;
        case 'valores': data.valores = r.resultados; break;
        case 'swot': data.swot = r.resultados; break;
      }
    });
    
    const vigorIndex = algorithms.vigor.calculateVigorIndex(data);
    
    await supabase
      .from('participantes')
      .update({ vigor_index: vigorIndex, updated_at: new Date().toISOString() })
      .eq('id', participanteId);
    
    return vigorIndex;
  }
  
  async verificarConsentimento(participanteId) {
    const { data: participante } = await supabase
      .from('participantes')
      .select('consentimento, consentimento_data')
      .eq('id', participanteId)
      .single();
    
    if (!participante?.consentimento) {
      await supabase
        .from('participantes')
        .update({
          consentimento: true,
          consentimento_data: new Date().toISOString(),
          termo_versao: '3.0'
        })
        .eq('id', participanteId);
    }
  }
  
  async salvarRespostas(participanteId, testeId, respostas) {
    const { data: existing } = await supabase
      .from('respostas')
      .select('id')
      .eq('participante_id', participanteId)
      .eq('teste_id', testeId);
    
    if (existing && existing.length > 0) {
      await supabase
        .from('respostas')
        .delete()
        .eq('participante_id', participanteId)
        .eq('teste_id', testeId);
    }
    
    const respostasData = respostas.map((r, index) => ({
      participante_id: participanteId,
      teste_id: testeId,
      pergunta_index: index,
      resposta: r,
      data: new Date().toISOString()
    }));
    
    await supabase.from('respostas').insert(respostasData);
  }
  
  async calcularCompatibilidadeVagas(participanteId) {
    const { data: participante } = await supabase
      .from('participantes')
      .select('*')
      .eq('id', participanteId)
      .single();
    
    const { data: resultados } = await supabase
      .from('resultados')
      .select('*')
      .eq('participante_id', participanteId);
    
    const data = {};
    resultados.forEach(r => {
      data[r.tipo] = r.resultados;
    });
    
    const { data: vagas } = await supabase
      .from('vagas')
      .select('*')
      .eq('status', 'aberta');
    
    const matches = vagas.map(vaga => ({
      vaga_id: vaga.id,
      ...algorithms.matching.calculateCompatibility(data, vaga)
    }));
    
    matches.sort((a, b) => b.score - a.score);
    return matches;
  }
}

export default new AvaliacaoService();
