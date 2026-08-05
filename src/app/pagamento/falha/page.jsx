'use client'

export default function PagamentoFalha() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-red-600">Falha no Pagamento</h1>
        <p className="text-gray-600 mt-2">
          Ocorreu um erro ao processar seu pagamento. <br />
          Por favor, tente novamente ou use outro método de pagamento.
        </p>
        <a href="/planos" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
          Voltar aos Planos
        </a>
      </div>
    </div>
  )
}
