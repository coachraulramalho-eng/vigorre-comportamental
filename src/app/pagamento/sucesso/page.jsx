'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function PagamentoSucesso() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    console.log('✅ Pedido pago:', id)
  }, [id])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold">Pagamento Confirmado!</h1>
        <p className="text-gray-600 mt-2">
          Seu pedido foi pago com sucesso. <br />
          Seus créditos já estão disponíveis.
        </p>
        <a href="/dashboard" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
          Ir para o Dashboard
        </a>
      </div>
    </div>
  )
}
