import AvaliacaoService from '../services/avaliacao-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const { participanteId } = req.query;
    
    if (!participanteId) {
      return res.status(400).json({ error: 'ID do participante é obrigatório' });
    }
    
    const matches = await AvaliacaoService.calcularCompatibilidadeVagas(participanteId);
    
    return res.status(200).json({
      success: true,
      data: matches
    });
    
  } catch (error) {
    console.error('Erro ao calcular compatibilidade:', error);
    return res.status(500).json({
      error: 'Erro ao calcular compatibilidade',
      details: error.message
    });
  }
}
