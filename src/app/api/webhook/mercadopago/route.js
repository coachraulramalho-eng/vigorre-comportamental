import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('📥 Webhook recebido:', body)

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }

    // CONSULTAR O PAGAMENTO (segurança)
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
      }
    )

    const payment = await paymentResponse.json()
    console.log('🔍 Status:', payment.status)

    if (payment.status !== 'approved') {
      return NextResponse.json({ 
        message: 'Pagamento não aprovado', 
        status: payment.status 
      })
    }

    // Buscar pedido
    const { data: pedido } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('id', payment.external_reference)
      .single()

    if (!pedido) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validar valor
    if (payment.transaction_amount !== pedido.valor_total) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // Atualizar pedido
    await supabaseAdmin
      .from('pedidos')
      .update({
        status: 'paid',
        transaction_id: payment.id,
        paid_at: new Date().toISOString(),
        payment_method: payment.payment_method_id
      })
      .eq('id', pedido.id)

    // Liberar produto
    if (pedido.tipo === 'credito') {
      await supabaseAdmin
        .from('creditos')
        .insert({
          usuario_id: pedido.usuario_id,
          quantidade: pedido.quantidade || 1
        })
    }

    console.log('✅ Pagamento confirmado:', pedido.id)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
