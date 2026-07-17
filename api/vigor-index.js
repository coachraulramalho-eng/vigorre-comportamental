import supabase from '../supabase-config.js';
import algorithms from '../algorithms/index.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const { participanteId } = req.query;
    
    if (!participanteId) {
      return res.status(400).json({ error: 'ID do participante é obrigatório' });
    }
    
    const { data: resultados } = await supabase
      .from('resultados')
      .select('*')
      .eq('participante_id', participanteId);
    
    if (!resultados || resultados.length === 0) {
      return res.status(404).json({ error: 'Nenhum resultado encontrado' });
    }
    
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
    
    return res.status(200).json({
      success: true,
      data: vigorIndex
    });
    
  } catch (error) {
    console.error('Erro ao calcular índice VIGOR:', error);
    return res.status(500).json({
      error: 'Erro ao calcular índice VIGOR',
      details: error.message
    });
  }
}
