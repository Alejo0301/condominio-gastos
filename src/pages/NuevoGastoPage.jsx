import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GastoForm from '../components/gastos/GastoForm'
import { useGastos } from '../hooks/useGastos'

export default function NuevoGastoPage() {
  const { agregar } = useGastos()
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [exito, setExito]       = useState(false)

  const handleSubmit = async (gasto) => {
    setCargando(true)
    try {
      await agregar(gasto)
      setExito(true)
      setTimeout(() => {
        setExito(false)
        navigate('/gastos')
      }, 1500)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="px-4 py-6 lg:px-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-surface-900">Registrar gasto</h1>
        <p className="text-sm text-surface-400 mt-0.5">
          Completa los campos para añadir un nuevo gasto al proyecto
        </p>
      </div>

      {exito ? (
        <div className="bg-primary-50 border border-primary-100 rounded-2xl px-6 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="font-medium text-primary-700">Gasto guardado correctamente</p>
          <p className="text-sm text-primary-500 mt-1">Redirigiendo al historial...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6">
          <GastoForm
            onSubmit={handleSubmit}
            cargando={cargando}
            onCancel={() => navigate('/gastos')}
          />
        </div>
      )}
    </div>
  )
}
