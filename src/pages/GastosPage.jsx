import { useState, useMemo } from 'react'
import { useGastos } from '../hooks/useGastos'
import { useAuth } from '../context/AuthContext'
import { formatCOP, formatFecha, calcularTotal } from '../utils/formatters'
import { CATEGORIAS, CASAS_LOTES, USUARIOS_AUTORIZADOS, COLORES_CATEGORIAS } from '../constants/usuarios'
import { previsualizarPDF } from '../services/pdfService'
import GastoForm from '../components/gastos/GastoForm'

// ── Color por categoría ───────────────────────────────────────────────────────
const colorCat = (cat) => {
  const idx = CATEGORIAS.indexOf(cat)
  return idx >= 0 ? COLORES_CATEGORIAS[idx] : '#94a3b8'
}

// ── Pill de categoría ─────────────────────────────────────────────────────────
const CategoriaPill = ({ categoria }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: '11px',
      fontWeight: 500,
      padding: '3px 10px',
      borderRadius: '20px',
      border: '1px solid',
      background: colorCat(categoria) + '18',
      color: colorCat(categoria),
      borderColor: colorCat(categoria) + '50',
      fontFamily: 'inherit',
    }}
  >
    {categoria}
  </span>
)

// ── Pill de casa/lote ─────────────────────────────────────────────────────────
const CasaPill = ({ casaLote }) => {
  if (!casaLote) return null
  const color = casaLote === 'Casa Lote 4' ? '#C9A84C' : '#8A8A8A'
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '11px', fontWeight: 500,
      padding: '3px 8px', borderRadius: '20px',
      border: '1px solid',
      background: color + '18',
      color,
      borderColor: color + '50',
    }}>
      {casaLote}
    </span>
  )
}

// ── Modal de edición ──────────────────────────────────────────────────────────
const ModalEditar = ({ gasto, onSave, onClose, cargando }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px', background: 'rgba(0,0,0,0.4)',
  }}>
    <div style={{
      background: '#fff', borderRadius: '20px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      width: '100%', maxWidth: '480px', padding: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>Editar gasto</h2>
        <button onClick={onClose} style={{
          padding: '6px', borderRadius: '8px', border: 'none',
          background: 'transparent', cursor: 'pointer', color: '#AAAAAA',
        }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <GastoForm initialValues={gasto} onSubmit={onSave} onCancel={onClose} cargando={cargando} />
    </div>
  </div>
)

// ── Estilos reutilizables ─────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 14px',
  border: '1.5px solid #EBEBEB',
  borderRadius: '10px',
  fontSize: '13px', color: '#1A1A1A',
  background: '#FAFAFA',
  outline: 'none', fontFamily: 'inherit',
}

const selectStyle = {
  ...inputStyle,
  appearance: 'auto',
  cursor: 'pointer',
}

export default function GastosPage() {
  const { gastos, cargando, eliminar, editar } = useGastos()
  const { esAdmin } = useAuth()

  const [busqueda,    setBusqueda]    = useState('')
  const [categoria,   setCategoria]   = useState('')
  const [responsable, setResponsable] = useState('')
  const [casaLote,    setCasaLote]    = useState('')
  const [fechaDesde,  setFechaDesde]  = useState('')
  const [fechaHasta,  setFechaHasta]  = useState('')
  const [editando,    setEditando]    = useState(null)
  const [guardando,   setGuardando]   = useState(false)
  const [exportando,  setExportando]  = useState(false)

  // ── Filtros combinados ────────────────────────────────────────────────────
  const gastosFiltrados = useMemo(() => {
    const desde = fechaDesde ? new Date(fechaDesde + 'T00:00:00') : null
    const hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : null

    return gastos.filter(g => {
      const q = busqueda.toLowerCase()
      const coincideBusqueda   = !busqueda || g.unidad?.toLowerCase().includes(q) || g.nombreUsuario?.toLowerCase().includes(q) || g.cargoUsuario?.toLowerCase().includes(q) || g.notas?.toLowerCase().includes(q)
      const coincideCategoria  = !categoria   || g.categoria === categoria
      const coincideResponsable= !responsable || g.nombreUsuario === responsable
      const coincideCasaLote   = !casaLote    || g.casaLote === casaLote
      const fecha              = g.creadoEn instanceof Date ? g.creadoEn : null
      const coincideDesde      = !desde || (fecha && fecha >= desde)
      const coincideHasta      = !hasta || (fecha && fecha <= hasta)
      return coincideBusqueda && coincideCategoria && coincideResponsable && coincideCasaLote && coincideDesde && coincideHasta
    })
  }, [gastos, busqueda, categoria, responsable, casaLote, fechaDesde, fechaHasta])

  const total = useMemo(() => calcularTotal(gastosFiltrados), [gastosFiltrados])

  const hayFiltros = busqueda || categoria || responsable || casaLote || fechaDesde || fechaHasta

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoria('')
    setResponsable('')
    setCasaLote('')
    setFechaDesde('')
    setFechaHasta('')
  }

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

  const handleExportar = () => {
    setExportando(true)
    try {
      previsualizarPDF(gastosFiltrados, {
        desde: fechaDesde || undefined,
        hasta: fechaHasta || undefined,
      })
    } finally {
      setTimeout(() => setExportando(false), 1000)
    }
  }

  if (cargando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          border: '2.5px solid #C9A84C', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      padding: '24px 16px', maxWidth: '1280px', margin: '0 auto',
      fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: '16px',
    }}>

      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em', margin: 0 }}>
            Historial de gastos
          </h1>
          <p style={{ fontSize: '13px', color: '#AAAAAA', marginTop: '4px' }}>
            {gastosFiltrados.length} registros ·{' '}
            <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{formatCOP(total)}</span>
          </p>
        </div>
        <button
          onClick={handleExportar}
          disabled={exportando || gastosFiltrados.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '11px 18px',
            background: exportando || gastosFiltrados.length === 0 ? '#D4B86A' : '#C9A84C',
            color: '#1A1A1A', fontWeight: 700, fontSize: '13px',
            border: 'none', borderRadius: '12px',
            cursor: exportando || gastosFiltrados.length === 0 ? 'not-allowed' : 'pointer',
            flexShrink: 0, fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!exportando && gastosFiltrados.length > 0) e.currentTarget.style.background = '#B8942E' }}
          onMouseLeave={e => { if (!exportando && gastosFiltrados.length > 0) e.currentTarget.style.background = '#C9A84C' }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {exportando ? 'Generando...' : 'Previsualizar PDF'}
        </button>
      </div>

      {/* ── Filtros ── */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px',
        border: '1px solid #EBEBEB',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>

        {/* Búsqueda */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#BBBBBB' }}
            width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por descripción, responsable, notas..."
            style={{ ...inputStyle, paddingLeft: '40px' }}
          />
        </div>

        {/* Selectores fila 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} style={selectStyle}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={responsable} onChange={e => setResponsable(e.target.value)} style={selectStyle}>
            <option value="">Todos los responsables</option>
            {USUARIOS_AUTORIZADOS.map(u => (
              <option key={u.email} value={u.nombre}>{u.nombre} — {u.cargo}</option>
            ))}
          </select>

          <select value={casaLote} onChange={e => setCasaLote(e.target.value)} style={selectStyle}>
            <option value="">Todos los lotes</option>
            {CASAS_LOTES.map(cl => <option key={cl} value={cl}>{cl}</option>)}
          </select>
        </div>

        {/* Filtro por fechas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#AAAAAA', whiteSpace: 'nowrap' }}>
            Fecha:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '140px' }}>
              <span style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '11px', color: '#AAAAAA', pointerEvents: 'none',
              }}>Desde</span>
              <input
                type="date"
                value={fechaDesde}
                onChange={e => setFechaDesde(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '56px', paddingRight: '10px' }}
              />
            </div>
            <span style={{ color: '#CCCCCC', fontSize: '13px' }}>→</span>
            <div style={{ position: 'relative', flex: 1, minWidth: '140px' }}>
              <span style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '11px', color: '#AAAAAA', pointerEvents: 'none',
              }}>Hasta</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={e => setFechaHasta(e.target.value)}
                min={fechaDesde || undefined}
                style={{ ...inputStyle, paddingLeft: '52px', paddingRight: '10px' }}
              />
            </div>
          </div>
          {(fechaDesde || fechaHasta) && (
            <button
              onClick={() => { setFechaDesde(''); setFechaHasta('') }}
              style={{
                fontSize: '11px', color: '#C9A84C', background: 'none',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px',
              }}
            >
              ✕ Limpiar fechas
            </button>
          )}
        </div>

        {/* Limpiar todos */}
        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            style={{
              fontSize: '12px', color: '#C9A84C', background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left', padding: 0, fontWeight: 600,
            }}
          >
            ✕ Limpiar todos los filtros
          </button>
        )}
      </div>

      {/* ── Lista / Tabla ── */}
      {gastosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#CCCCCC' }}>
          <svg width="48" height="48" style={{ margin: '0 auto 12px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#AAAAAA' }}>Sin resultados</p>
          <p style={{ fontSize: '13px', marginTop: '4px', color: '#CCCCCC' }}>Cambia los filtros o registra el primer gasto</p>
        </div>
      ) : (
        <>
          {/* Tabla desktop */}
          <div style={{
            display: 'none',
            background: '#FFFFFF', borderRadius: '16px',
            border: '1px solid #EBEBEB',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }} className="tabla-desktop">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F0F0F0', background: '#FAFAFA' }}>
                  {['Fecha y hora', 'Lote', 'Categoría', 'Descripción', 'Responsable', 'Monto'].map((h, i) => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: i === 5 ? 'right' : 'left',
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#AAAAAA',
                    }}>{h}</th>
                  ))}
                  {esAdmin && <th style={{ padding: '12px 8px' }} />}
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.map((g, idx) => (
                  <tr key={g.id} style={{
                    borderBottom: '1px solid #F8F8F8',
                    background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                  }}>
                    <td style={{ padding: '13px 16px', color: '#AAAAAA', whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {formatFecha(g.creadoEn)}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <CasaPill casaLote={g.casaLote} />
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <CategoriaPill categoria={g.categoria} />
                    </td>
                    <td style={{ padding: '13px 16px', color: '#1A1A1A', maxWidth: '220px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.unidad}</div>
                      {g.notas && <div style={{ fontSize: '11px', color: '#AAAAAA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{g.notas}</div>}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{g.nombreUsuario ?? g.creadoPor}</div>
                      {g.cargoUsuario && <div style={{ fontSize: '11px', color: '#AAAAAA' }}>{g.cargoUsuario}</div>}
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#1A1A1A' }}>
                      {formatCOP(g.monto)}
                    </td>
                    {esAdmin && (
                      <td style={{ padding: '13px 8px' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditando(g)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#AAAAAA' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FDF8EE'; e.currentTarget.style.color = '#C9A84C' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#AAAAAA' }}
                          >
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEliminar(g.id)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#AAAAAA' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#AAAAAA' }}
                          >
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                <tr style={{ borderTop: '2px solid #F0F0F0', background: '#FAFAFA' }}>
                  <td colSpan={esAdmin ? 5 : 4} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#AAAAAA' }}>
                    Total filtrado
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#1A1A1A', fontSize: '14px' }}>
                    {formatCOP(total)}
                  </td>
                  {esAdmin && <td />}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cards móvil */}
          <div className="cards-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {gastosFiltrados.map(g => (
              <div key={g.id} style={{
                background: '#FFFFFF', borderRadius: '14px',
                border: '1px solid #EBEBEB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <CategoriaPill categoria={g.categoria} />
                    <CasaPill casaLote={g.casaLote} />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1A1A1A', flexShrink: 0 }}>{formatCOP(g.monto)}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#1A1A1A', marginBottom: '4px' }}>{g.unidad}</p>
                <p style={{ fontSize: '11px', color: '#AAAAAA' }}>{formatFecha(g.creadoEn)}</p>
                <p style={{ fontSize: '11px', color: '#888', fontWeight: 600, marginTop: '2px' }}>
                  {g.nombreUsuario ?? g.creadoPor}
                  {g.cargoUsuario && <span style={{ fontWeight: 400, color: '#AAAAAA' }}> · {g.cargoUsuario}</span>}
                </p>
                {esAdmin && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F5F5F5' }}>
                    <button
                      onClick={() => setEditando(g)}
                      style={{
                        flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600,
                        color: '#C9A84C', background: '#FDF8EE', border: 'none',
                        borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >Editar</button>
                    <button
                      onClick={() => handleEliminar(g.id)}
                      style={{
                        flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600,
                        color: '#DC2626', background: '#FEF2F2', border: 'none',
                        borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >Eliminar</button>
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

      <style>{`
        @media (min-width: 640px) {
          .tabla-desktop { display: block !important; }
          .cards-mobile  { display: none !important; }
        }
      `}</style>
    </div>
  )
}
