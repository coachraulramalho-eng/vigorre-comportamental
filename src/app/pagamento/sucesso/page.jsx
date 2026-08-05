'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function PagamentoSucesso() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    console.log('✅ Pedido pago:', id)
  }, [id])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-green-600">Pagamento Confirmado!</h1>
        <p className="text-gray-600 mt-2">
          Seu pedido foi pago com sucesso.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Seus créditos já estão disponíveis no seu dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Ir para o Dashboard
        </Link>
      </div>
    </div>
  )
}
