'use client'

import { useState } from 'react'

export function BotaoComprar({ usuarioId, planoId, children }) {
  const [loading, setLoading] = useState(false)

  const handleComprar = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId, plano_id: planoId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      window.location.href = data.checkout_url

    } catch (error) {
      alert('Erro ao iniciar pagamento. Tente novamente.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleComprar}
      disabled={loading}
      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? 'Processando...' : children || 'Comprar com Mercado Pago'}
    </button>
  )
}
