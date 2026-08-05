'use client'

import Link from 'next/link'

export default function PagamentoFalha() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-red-600">Falha no Pagamento</h1>
        <p className="text-gray-600 mt-2">
          Ocorreu um erro ao processar seu pagamento.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Por favor, tente novamente ou use outro método de pagamento.
        </p>
        <Link
          href="/planos"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Ver Planos Novamente
        </Link>
      </div>
    </div>
  )
}
