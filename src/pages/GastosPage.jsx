import { useState, useMemo } from 'react'
import { useGastos } from '../hooks/useGastos'
import { useAuth } from '../context/AuthContext'
import { formatCOP, formatFecha, calcularTotal } from '../utils/formatters'
import { CATEGORIAS, CASAS_LOTES, USUARIOS_AUTORIZADOS, COLORES_CATEGORIAS } from '../constants/usuarios'
import { generarPDF } from '../services/pdfService'
import GastoForm from '../components/gastos/GastoForm'

// ── Color por categoría ───────────────────────────────────────────────────────
const colorCat = (cat) => {
  const idx = CATEGORIAS.indexOf(cat)
  return idx >= 0 ? COLORES_CATEGORIAS[idx] : '#94a3b8'
}

// ── Pill de categoría con color dinámico ──────────────────────────────────────
const CategoriaPill = ({ categoria }) => (
  <span
    className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border"
    style={{
      background: colorCat(categoria) + '18',
      color: colorCat(categoria),
      borderColor: colorCat(categoria) + '40',
    }}
  >
    {categoria}
  </span>
)

// ── Pill de casa/lote ─────────────────────────────────────────────────────────
const CasaPill = ({ casaLote }) => {
  if (!casaLote) return null
  const color = casaLote === 'Casa Lote 4' ? '#16a34a' : '#7c3aed'
  return (
    <span
      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full border ml-1"
      style={{ background: color + '15', color, borderColor: color + '40' }}
    >
      {casaLote}
    </span>
  )
}

// ── Modal de edición ──────────────────────────────────────────────────────────
const ModalEditar = ({ gasto, onSave, onClose, cargando }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-surface-900">Editar gasto</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <GastoForm initialValues={gasto} onSubmit={onSave} onCancel={onClose} cargando={cargando} />
    </div>
  </div>
)

export default function GastosPage() {
  const { gastos, cargando, eliminar, editar } = useGastos()
  const { esAdmin } = useAuth()

  const [busqueda,     setBusqueda]     = useState('')
  const [categoria,    setCategoria]    = useState('')
  const [responsable,  setResponsable]  = useState('')
  const [casaLote,     setCasaLote]     = useState('')
  const [editando,     setEditando]     = useState(null)
  const [guardando,    setGuardando]    = useState(false)
  const [exportando,   setExportando]   = useState(false)

  // ── Filtros combinados ────────────────────────────────────────────────────
  const gastosFiltrados = useMemo(() => {
    return gastos.filter(g => {
      const q = busqueda.toLowerCase()
      const coincideBusqueda = !busqueda ||
        g.unidad?.toLowerCase().includes(q) ||
        g.nombreUsuario?.toLowerCase().includes(q) ||
        g.cargoUsuario?.toLowerCase().includes(q) ||
        g.notas?.toLowerCase().includes(q)
      const coincideCategoria   = !categoria   || g.categoria === categoria
      const coincideResponsable = !responsable || g.nombreUsuario === responsable
      const coincideCasaLote    = !casaLote    || g.casaLote === casaLote
      return coincideBusqueda && coincideCategoria && coincideResponsable && coincideCasaLote
    })
  }, [gastos, busqueda, categoria, responsable, casaLote])

  const total = useMemo(() => calcularTotal(gastosFiltrados), [gastosFiltrados])

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este gasto? Esta acción no se puede deshacer.')) return
    await eliminar(id)
  }

  const handleEditar = async (cambios) => {
    setGuardando(true)
    try {
      await editar(editando.id, cambios)
      setEditando(null)
    } finally {
      setGuardando(false)
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoria('')
    setResponsable('')
    setCasaLote('')
  }

  const hayFiltros = busqueda || categoria || responsable || casaLote

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-7 h-7 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-8 max-w-screen-xl mx-auto space-y-5">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Historial de gastos</h1>
          <p className="text-sm text-surface-400 mt-0.5">
            {gastosFiltrados.length} registros ·{' '}
            <span className="font-medium text-surface-700">{formatCOP(total)}</span>
          </p>
        </div>
        <button
          onClick={() => { setExportando(true); try { generarPDF(gastosFiltrados) } finally { setTimeout(() => setExportando(false), 1000) } }}
          disabled={exportando || gastosFiltrados.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors flex-shrink-0 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {exportando ? 'Generando...' : 'Exportar PDF'}
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-4 space-y-3">
        {/* Búsqueda */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por descripción, responsable, notas..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>

        {/* Selectores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={responsable}
            onChange={e => setResponsable(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            <option value="">Todos los responsables</option>
            {USUARIOS_AUTORIZADOS.map(u => (
              <option key={u.email} value={u.nombre}>{u.nombre} — {u.cargo}</option>
            ))}
          </select>

          <select
            value={casaLote}
            onChange={e => setCasaLote(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            <option value="">Todos los lotes</option>
            {CASAS_LOTES.map(cl => <option key={cl} value={cl}>{cl}</option>)}
          </select>
        </div>

        {/* Limpiar filtros */}
        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Lista ── */}
      {gastosFiltrados.length === 0 ? (
        <div className="text-center py-20 text-surface-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-surface-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          <p className="text-base font-medium">Sin resultados</p>
          <p className="text-sm mt-1">Cambia los filtros o registra el primer gasto</p>
        </div>
      ) : (
        <>
          {/* Tabla desktop */}
          <div className="hidden sm:block bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Fecha y hora</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Lote</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Categoría</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Descripción</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden lg:table-cell">Responsable</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Monto</th>
                  {esAdmin && <th className="px-3 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {gastosFiltrados.map(g => (
                  <tr key={g.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3.5 text-surface-500 whitespace-nowrap text-xs">{formatFecha(g.creadoEn)}</td>
                    <td className="px-5 py-3.5">
                      <CasaPill casaLote={g.casaLote} />
                    </td>
                    <td className="px-5 py-3.5"><CategoriaPill categoria={g.categoria} /></td>
                    <td className="px-5 py-3.5 text-surface-700 max-w-xs">
                      <p className="truncate">{g.unidad}</p>
                      {g.notas && <p className="text-xs text-surface-400 truncate mt-0.5">{g.notas}</p>}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="text-surface-700 text-xs font-medium">{g.nombreUsuario ?? g.creadoPor}</p>
                      {g.cargoUsuario && <p className="text-xs text-surface-400">{g.cargoUsuario}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-surface-900">{formatCOP(g.monto)}</td>
                    {esAdmin && (
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setEditando(g)} className="p-1.5 rounded-lg text-surface-400 hover:text-accent-600 hover:bg-accent-50 transition" title="Editar">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            </svg>
                          </button>
                          <button onClick={() => handleEliminar(g.id)} className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-surface-200 bg-surface-50">
                  <td colSpan={esAdmin ? 5 : 4} className="px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Total filtrado</td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-surface-900">{formatCOP(total)}</td>
                  {esAdmin && <td />}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cards móvil */}
          <div className="sm:hidden space-y-3">
            {gastosFiltrados.map(g => (
              <div key={g.id} className="bg-white rounded-2xl border border-surface-100 shadow-card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap gap-1.5">
                    <CategoriaPill categoria={g.categoria} />
                    <CasaPill casaLote={g.casaLote} />
                  </div>
                  <span className="font-mono font-semibold text-surface-900 flex-shrink-0">{formatCOP(g.monto)}</span>
                </div>
                <p className="text-sm text-surface-700 mb-1">{g.unidad}</p>
                <p className="text-xs text-surface-400">{formatFecha(g.creadoEn)}</p>
                <p className="text-xs text-surface-500 font-medium mt-0.5">
                  {g.nombreUsuario ?? g.creadoPor}
                  {g.cargoUsuario && <span className="font-normal text-surface-400"> · {g.cargoUsuario}</span>}
                </p>
                {esAdmin && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-surface-50">
                    <button onClick={() => setEditando(g)} className="flex-1 py-1.5 text-xs font-medium text-accent-600 bg-accent-50 rounded-lg hover:bg-accent-100 transition">Editar</button>
                    <button onClick={() => handleEliminar(g.id)} className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">Eliminar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {editando && (
        <ModalEditar gasto={editando} onSave={handleEditar} onClose={() => setEditando(null)} cargando={guardando} />
      )}
    </div>
  )
}
