import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { useGastos } from '../hooks/useGastos'
import { useAuth } from '../context/AuthContext'
import { formatCOP, agruparPorCategoria, calcularTotal } from '../utils/formatters'
import { CATEGORIAS, COLORES_CATEGORIAS, CASAS_LOTES, USUARIOS_AUTORIZADOS } from '../constants/usuarios'

// ── Helpers ───────────────────────────────────────────────────────────────────
const colorPorCategoria = (cat) => {
  const idx = CATEGORIAS.indexOf(cat)
  return idx >= 0 ? COLORES_CATEGORIAS[idx] : '#94a3b8'
}

// ── Tarjeta de métrica ────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, accent }) => (
  <div className={`rounded-2xl border p-5 transition-shadow hover:shadow-card-hover ${accent ? 'bg-primary-600 border-primary-700' : 'bg-white border-surface-100 shadow-card'}`}>
    <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${accent ? 'text-primary-200' : 'text-surface-400'}`}>{label}</p>
    <p className={`text-2xl font-semibold leading-tight ${accent ? 'text-white' : 'text-surface-900'}`}>{value}</p>
    {sub && <p className={`text-xs mt-1 ${accent ? 'text-primary-200' : 'text-surface-400'}`}>{sub}</p>}
  </div>
)

// ── Tooltip personalizado ─────────────────────────────────────────────────────
const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-100 shadow-card rounded-xl px-3 py-2 text-sm">
      <p className="font-medium text-surface-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color ?? p.fill }}>{formatCOP(p.value)}</p>
      ))}
    </div>
  )
}

// ── Tooltip para Pie ──────────────────────────────────────────────────────────
const TooltipPie = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-surface-100 shadow-card rounded-xl px-3 py-2 text-sm">
      <p className="font-medium text-surface-700">{name}</p>
      <p className="text-surface-500">{formatCOP(value)}</p>
    </div>
  )
}

// ── Estado vacío reutilizable ─────────────────────────────────────────────────
const EmptyState = ({ mensaje = 'Sin datos aún' }) => (
  <div className="flex flex-col items-center justify-center py-10 text-surface-300">
    <svg className="w-9 h-9 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
    <p className="text-sm font-medium">{mensaje}</p>
  </div>
)

export default function DashboardPage() {
  const { gastos, cargando } = useGastos()
  const { usuario } = useAuth()
  const [filtroCasa, setFiltroCasa] = useState('')

  // ── Filtro por casa/lote ──────────────────────────────────────────────────
  const gastosFiltrados = useMemo(() =>
    filtroCasa ? gastos.filter(g => g.casaLote === filtroCasa) : gastos,
    [gastos, filtroCasa]
  )

  // ── Métricas ──────────────────────────────────────────────────────────────
  const total        = useMemo(() => calcularTotal(gastosFiltrados), [gastosFiltrados])
  const porCategoria = useMemo(() => agruparPorCategoria(gastosFiltrados), [gastosFiltrados])

  const gastoEsteMes = useMemo(() => {
    const hoy = new Date()
    return gastosFiltrados
      .filter(g => g.creadoEn instanceof Date &&
        g.creadoEn.getMonth() === hoy.getMonth() &&
        g.creadoEn.getFullYear() === hoy.getFullYear())
      .reduce((acc, g) => acc + g.monto, 0)
  }, [gastosFiltrados])

  const mayorCategoria = useMemo(() =>
    [...porCategoria].sort((a, b) => b.total - a.total)[0],
    [porCategoria]
  )

  // ── Datos para gráfica de barras por categoría con colores ────────────────
  const dataCategorias = useMemo(() =>
    porCategoria
      .sort((a, b) => b.total - a.total)
      .map(item => ({ ...item, fill: colorPorCategoria(item.categoria) })),
    [porCategoria]
  )

  // ── Datos para gráfica de dona (proporciones por categoría) ───────────────
  const dataDona = useMemo(() =>
    porCategoria
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
      .map(item => ({
        name: item.categoria,
        value: item.total,
        fill: colorPorCategoria(item.categoria),
      })),
    [porCategoria]
  )

  // ── Datos por responsable ────────────────────────────────────────────────
  const dataResponsables = useMemo(() => {
    const mapa = {}
    gastosFiltrados.forEach(g => {
      const nombre = g.nombreUsuario ?? g.creadoPor
      mapa[nombre] = (mapa[nombre] ?? 0) + g.monto
    })
    return Object.entries(mapa).map(([nombre, total]) => ({ nombre, total }))
  }, [gastosFiltrados])

  // ── Datos por casa/lote ──────────────────────────────────────────────────
  const dataCasas = useMemo(() => {
    const mapa = {}
    gastos.forEach(g => {
      const key = g.casaLote || 'Sin asignar'
      mapa[key] = (mapa[key] ?? 0) + g.monto
    })
    return Object.entries(mapa).map(([casa, total]) => ({ casa, total }))
  }, [gastos])

  // ── Flujo acumulado mes a mes ─────────────────────────────────────────────
  const porMes = useMemo(() => {
    const mapa = {}
    gastosFiltrados.forEach(g => {
      const key = g.creadoEn instanceof Date
        ? g.creadoEn.toLocaleString('es-CO', { month: 'short', year: '2-digit' })
        : '—'
      mapa[key] = (mapa[key] ?? 0) + g.monto
    })
    let acum = 0
    return Object.entries(mapa).map(([mes, monto]) => {
      acum += monto
      return { mes, monto, acumulado: acum }
    })
  }, [gastosFiltrados])

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-7 h-7 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-8 max-w-screen-xl mx-auto space-y-6">

      {/* ── Encabezado ── */}
      <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-500" />
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">
                Condominio La Trinidad · Pinchote, Santander
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-surface-900 leading-tight">
              Hola, {usuario?.nombre} 👋
            </h1>
            <p className="text-sm text-surface-400 mt-1">
              <span className="font-medium text-accent-600">{usuario?.cargo}</span>
              {' · '}
              {new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}
            </p>
          </div>
          <Link
            to="/nuevo-gasto"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Registrar gasto
          </Link>
        </div>
      </div>

      {/* ── Filtro por casa/lote ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-surface-500">Filtrar por:</span>
        <button
          onClick={() => setFiltroCasa('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            filtroCasa === ''
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-surface-600 border-surface-200 hover:border-primary-400 hover:text-primary-600'
          }`}
        >
          Todos los lotes
        </button>
        {CASAS_LOTES.map(cl => (
          <button
            key={cl}
            onClick={() => setFiltroCasa(cl)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filtroCasa === cl
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-surface-600 border-surface-200 hover:border-primary-400 hover:text-primary-600'
            }`}
          >
            {cl}
          </button>
        ))}
      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total invertido"
          value={formatCOP(total)}
          sub={`${gastosFiltrados.length} registros`}
          accent
        />
        <MetricCard
          label="Este mes"
          value={formatCOP(gastoEsteMes)}
          sub="mes en curso"
        />
        <MetricCard
          label="Categorías"
          value={porCategoria.length}
          sub="tipos de gasto"
        />
        <MetricCard
          label="Mayor rubro"
          value={mayorCategoria?.categoria?.split(' ')[0] ?? '—'}
          sub={mayorCategoria ? formatCOP(mayorCategoria.total) : ''}
        />
      </div>

      {/* ── Fila 1: Barras categoría + Dona ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Barras por categoría con colores */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-surface-100 shadow-card p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-1">Gastos por categoría</h2>
          <p className="text-xs text-surface-400 mb-5">Cada categoría tiene su color identificador</p>
          {dataCategorias.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dataCategorias} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="categoria"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={v => v.split(' ')[0]}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
                />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {dataCategorias.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dona de proporciones */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-100 shadow-card p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-1">Proporción por categoría</h2>
          <p className="text-xs text-surface-400 mb-3">Top 6 rubros</p>
          {dataDona.length === 0 ? <EmptyState /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={dataDona}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dataDona.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipPie />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Leyenda compacta */}
              <div className="space-y-1.5 mt-2">
                {dataDona.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                      <span className="text-xs text-surface-600 truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-surface-700 flex-shrink-0">
                      {total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Fila 2: Por responsable + Por casa/lote ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Barras por responsable */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-1">Gastos por responsable</h2>
          <p className="text-xs text-surface-400 mb-5">Quién ha registrado más inversión</p>
          {dataResponsables.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataResponsables} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
                />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  width={100}
                />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {dataResponsables.map((entry, i) => {
                    const usuario = USUARIOS_AUTORIZADOS.find(u => u.nombre === entry.nombre)
                    const colores = ['#16a34a', '#7c3aed', '#0891b2']
                    return <Cell key={i} fill={colores[i % colores.length]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Barras por casa/lote */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-1">Inversión por casa / lote</h2>
          <p className="text-xs text-surface-400 mb-5">Distribución entre lotes del proyecto</p>
          {dataCasas.length === 0 ? <EmptyState mensaje="Sin gastos asignados a lotes" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataCasas} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="casa" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
                />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  <Cell fill="#16a34a" />
                  <Cell fill="#7c3aed" />
                  <Cell fill="#0891b2" />
                  <Cell fill="#d97706" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Fila 3: Flujo acumulado ── */}
      <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6">
        <h2 className="text-sm font-semibold text-surface-700 mb-1">Flujo de caja acumulado</h2>
        <p className="text-xs text-surface-400 mb-5">Evolución de la inversión mes a mes</p>
        {porMes.length === 0 ? <EmptyState mensaje="Registra gastos para ver la tendencia" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={porMes} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip content={<TooltipCustom />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="monto" name="Gasto del mes" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="acumulado" name="Acumulado" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-center text-xs text-surface-300 pb-2">
        Condominio La Trinidad · Pinchote, Santander · Uso interno
      </p>
    </div>
  )
}
