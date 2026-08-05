'use client'

export default function PagamentoPendente() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-3xl font-bold">Pagamento Pendente</h1>
        <p className="text-gray-600 mt-2">
          Seu pagamento está sendo processado. <br />
          Você receberá uma notificação quando for confirmado.
        </p>
      </div>
    </div>
  )
}
