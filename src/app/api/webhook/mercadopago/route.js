import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('📥 Webhook recebido:', body)

    // Verificar se o token existe
    if (!MP_ACCESS_TOKEN) {
      console.error('❌ MERCADO_PAGO_ACCESS_TOKEN não configurado!')
      return NextResponse.json(
        { error: 'Erro de configuração' },
        { status: 500 }
      )
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing payment id' },
        { status: 400 }
      )
    }

    // 🔍 CONSULTAR PAGAMENTO (segurança)
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
      }
    )

    const payment = await paymentResponse.json()
    console.log('🔍 Status do pagamento:', payment.status)

    // Validar status
    if (payment.status !== 'approved') {
      return NextResponse.json({
        message: 'Pagamento não aprovado',
        status: payment.status
      })
    }

    // Buscar pedido
    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('id', payment.external_reference)
      .single()

    if (pedidoError || !pedido) {
      console.error('❌ Pedido não encontrado:', payment.external_reference)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Validar valor
    if (payment.transaction_amount !== pedido.valor_total) {
      console.error('❌ Valor divergente:', {
        esperado: pedido.valor_total,
        recebido: payment.transaction_amount
      })
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      )
    }

    // Atualizar pedido
    const { error: updateError } = await supabaseAdmin
      .from('pedidos')
      .update({
        status: 'paid',
        transaction_id: payment.id,
        payment_method: payment.payment_method_id,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', pedido.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar pedido:', updateError)
      return NextResponse.json(
        { error: 'Error updating order' },
        { status: 500 }
      )
    }

    // ✅ LIBERAR CRÉDITOS
    if (pedido.tipo === 'credito') {
      await supabaseAdmin.rpc('fn_liberar_creditos', {
        p_usuario_id: pedido.usuario_id,
        p_quantidade: pedido.quantidade || 1,
        p_pedido_id: pedido.id
      })
    }

    console.log('✅ Pagamento confirmado:', pedido.id)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
