import supabase from '../supabase-config.js';

class CreditoService {
  
  async verificarSaldo(empresaId, tipo) {
    const tabela = tipo === 'premium' ? 'creditos_premium' : 'creditos';
    
    const { data, error } = await supabase
      .from(tabela)
      .select('saldo')
      .eq('empresa_id', empresaId)
      .single();
    
    if (error || !data) return 0;
    return data.saldo || 0;
  }
  
  async consumirCredito(empresaId, tipo, quantidade = 1) {
    const tabela = tipo === 'premium' ? 'creditos_premium' : 'creditos';
    const saldoAtual = await this.verificarSaldo(empresaId, tipo);
    
    if (saldoAtual < quantidade) {
      throw new Error('Saldo insuficiente');
    }
    
    const { data, error } = await supabase
      .from(tabela)
      .update({ saldo: saldoAtual - quantidade })
      .eq('empresa_id', empresaId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async adicionarCreditos(empresaId, tipo, quantidade) {
    const tabela = tipo === 'premium' ? 'creditos_premium' : 'creditos';
    const saldoAtual = await this.verificarSaldo(empresaId, tipo);
    
    const { data, error } = await supabase
      .from(tabela)
      .upsert({
        empresa_id: empresaId,
        saldo: saldoAtual + quantidade,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async reservarCredito(empresaId, tipo, participanteId, testeId) {
    const reserva = {
      empresa_id: empresaId,
      participante_id: participanteId,
      teste_id: testeId,
      tipo: tipo,
      status: 'reservado',
      data_reserva: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('reservas_creditos')
      .insert(reserva)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async confirmarConsumo(reservaId) {
    const { data: reserva, error: findError } = await supabase
      .from('reservas_creditos')
      .select('*')
      .eq('id', reservaId)
      .single();
    
    if (findError || !reserva) throw new Error('Reserva não encontrada');
    if (reserva.status === 'consumido') throw new Error('Crédito já consumido');
    
    await this.consumirCredito(reserva.empresa_id, reserva.tipo);
    
    const { data, error } = await supabase
      .from('reservas_creditos')
      .update({
        status: 'consumido',
        data_consumo: new Date().toISOString()
      })
      .eq('id', reservaId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async cancelarReserva(reservaId) {
    const { data, error } = await supabase
      .from('reservas_creditos')
      .update({
        status: 'cancelado',
        data_cancelamento: new Date().toISOString()
      })
      .eq('id', reservaId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export default new CreditoService();
