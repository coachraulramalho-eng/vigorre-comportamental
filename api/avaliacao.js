import AvaliacaoService from '../services/avaliacao-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const { participanteId, testeId, respostas } = req.body;
    
    if (!participanteId || !testeId || !respostas) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    const result = await AvaliacaoService.processarAvaliacao(
      participanteId,
      testeId,
      respostas
    );
    
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Avaliação processada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao processar avaliação:', error);
    return res.status(500).json({
      error: 'Erro ao processar avaliação',
      details: error.message
    });
  }
}
