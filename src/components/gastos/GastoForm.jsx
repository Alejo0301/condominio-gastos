import { useState } from 'react'
import { CATEGORIAS, CASAS_LOTES } from '../../constants/usuarios'

const FORM_INICIAL = {
  casaLote:  '',
  categoria: '',
  unidad:    '',
  monto:     '',
  notas:     '',
}

// Formatea número con puntos de miles (estilo Colombia)
const formatMiles = (valor) => {
  const solo = valor.replace(/\D/g, '')
  if (!solo) return ''
  return Number(solo).toLocaleString('es-CO')
}

// Quita los puntos para obtener el número limpio
const parseMonto = (valor) => valor.replace(/\./g, '').replace(/\D/g, '')

export default function GastoForm({ onSubmit, cargando = false, onCancel, initialValues }) {
  const [form, setForm] = useState(
    initialValues
      ? {
          casaLote:  initialValues.casaLote  ?? '',
          categoria: initialValues.categoria ?? '',
          unidad:    initialValues.unidad    ?? '',
          monto:     initialValues.monto ? formatMiles(String(initialValues.monto)) : '',
          notas:     initialValues.notas     ?? '',
        }
      : FORM_INICIAL
  )
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'monto') {
      setForm(prev => ({ ...prev, monto: formatMiles(value) }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const montoNum = Number(parseMonto(form.monto))

    if (!form.casaLote)       return setError('Selecciona una casa o lote.')
    if (!form.categoria)      return setError('Selecciona una categoría.')
    if (!form.unidad.trim())  return setError('Describe la unidad o detalle del gasto.')
    if (!form.monto || montoNum <= 0) return setError('Ingresa un monto válido.')

    try {
      await onSubmit({ ...form, monto: montoNum })
      if (!initialValues) setForm(FORM_INICIAL)
    } catch {
      setError('No se pudo guardar el gasto. Intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Casa / Lote */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          Casa / Lote <span className="text-red-400">*</span>
        </label>
        <select
          name="casaLote"
          value={form.casaLote}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-surface-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        >
          <option value="">Seleccionar casa o lote...</option>
          {CASAS_LOTES.map(cl => (
            <option key={cl} value={cl}>{cl}</option>
          ))}
        </select>
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          Categoría <span className="text-red-400">*</span>
        </label>
        <select
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-surface-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        >
          <option value="">Seleccionar categoría...</option>
          {CATEGORIAS.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Descripción / Unidad */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          Descripción / unidad <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="unidad"
          value={form.unidad}
          onChange={handleChange}
          placeholder="Ej: Varillas de acero 3/8, 100 unidades"
          className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        />
      </div>

      {/* Monto con separación de miles */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          Monto (COP) <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-400 font-medium">$</span>
          <input
            type="text"
            name="monto"
            value={form.monto}
            onChange={handleChange}
            inputMode="numeric"
            placeholder="0"
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        {form.monto && (
          <p className="text-xs text-surface-400 mt-1 pl-1">
            {Number(parseMonto(form.monto)).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
          </p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">
          Notas <span className="text-surface-400 font-normal">(opcional)</span>
        </label>
        <textarea
          name="notas"
          value={form.notas}
          onChange={handleChange}
          rows={3}
          placeholder="Proveedor, número de factura, observaciones..."
          className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-surface-900 placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={cargando}
          className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium rounded-xl text-sm transition-colors"
        >
          {cargando ? 'Guardando...' : initialValues ? 'Guardar cambios' : 'Guardar gasto'}
        </button>
      </div>
    </form>
  )
}
