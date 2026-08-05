import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { getPlano } from '@/config/planos'
import { randomUUID } from 'crypto'

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export async function POST(request) {
  try {
    const { usuario_id, plano_id } = await request.json()

    // Validar se o token existe
    if (!MP_ACCESS_TOKEN) {
      console.error('❌ MERCADO_PAGO_ACCESS_TOKEN não configurado!')
      return NextResponse.json(
        { error: 'Erro de configuração do pagamento' },
        { status: 500 }
      )
    }

    // Validar dados
    if (!usuario_id || typeof usuario_id !== 'string') {
      return NextResponse.json(
        { error: 'Usuário inválido' },
        { status: 400 }
      )
    }

    const plano = getPlano(plano_id)
    if (!plano) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      )
    }

    const order_nsu = randomUUID()

    // Criar pedido no Supabase
    const { error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        id: order_nsu,
        usuario_id: usuario_id,
        produto: plano.nome,
        valor_total: plano.preco,
        status: 'pending',
        tipo: plano.tipo || 'credito',
        quantidade: plano.quantidade || 1,
        metadata: {
          plano_id: plano_id,
          cupom: plano.cupom || null
        }
      })

    if (pedidoError) {
      console.error('❌ Erro ao criar pedido:', pedidoError)
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Criar preferência no Mercado Pago
    const payload = {
      items: [{
        title: plano.nome,
        description: plano.descricao,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: plano.preco
      }],
      external_reference: order_nsu,
      notification_url: `${APP_URL}/api/webhook/mercadopago`,
      back_urls: {
        success: `${APP_URL}/pagamento/sucesso?id=${order_nsu}`,
        pending: `${APP_URL}/pagamento/pendente?id=${order_nsu}`,
        failure: `${APP_URL}/pagamento/falha?id=${order_nsu}`
      },
      auto_return: 'approved'
    }

    const response = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Erro Mercado Pago:', data)
      return NextResponse.json(
        { error: 'Erro ao criar link de pagamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      checkout_url: data.init_point,
      preference_id: data.id,
      order_id: order_nsu
    })

  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
