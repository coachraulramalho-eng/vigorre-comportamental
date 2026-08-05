'use client'

import Link from 'next/link'

export default function PagamentoPendente() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-3xl font-bold text-yellow-600">Pagamento Pendente</h1>
        <p className="text-gray-600 mt-2">
          Seu pagamento está sendo processado.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Você receberá uma notificação quando for confirmado.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Voltar para a Home
        </Link>
      </div>
    </div>
  )
}
