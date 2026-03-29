import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { useGastos } from '../hooks/useGastos'
import { useAuth } from '../context/AuthContext'
import { formatCOP, agruparPorCategoria, calcularTotal } from '../utils/formatters'

// ── Tarjeta de métrica ────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, accent }) => (
  <div className={`rounded-2xl border p-5 transition-shadow hover:shadow-card-hover ${accent ? 'bg-primary-600 border-primary-700' : 'bg-white border-surface-100 shadow-card'}`}>
    <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${accent ? 'text-primary-200' : 'text-surface-400'}`}>
      {label}
    </p>
    <p className={`text-2xl font-semibold leading-tight ${accent ? 'text-white' : 'text-surface-900'}`}>
      {value}
    </p>
    {sub && (
      <p className={`text-xs mt-1 ${accent ? 'text-primary-200' : 'text-surface-400'}`}>
        {sub}
      </p>
    )}
  </div>
)

// ── Tooltip personalizado ─────────────────────────────────────────────────────
const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-100 shadow-card rounded-xl px-3 py-2 text-sm">
      <p className="font-medium text-surface-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{formatCOP(p.value)}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { gastos, cargando } = useGastos()
  const { usuario } = useAuth()

  const total        = useMemo(() => calcularTotal(gastos), [gastos])
  const porCategoria = useMemo(() => agruparPorCategoria(gastos), [gastos])

  const porMes = useMemo(() => {
    const mapa = {}
    gastos.forEach(g => {
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
  }, [gastos])

  const gastoEsteMes = useMemo(() => {
    const hoy = new Date()
    return gastos
      .filter(g => g.creadoEn instanceof Date &&
        g.creadoEn.getMonth() === hoy.getMonth() &&
        g.creadoEn.getFullYear() === hoy.getFullYear())
      .reduce((acc, g) => acc + g.monto, 0)
  }, [gastos])

  const mayorCategoria = useMemo(() =>
    [...porCategoria].sort((a, b) => b.total - a.total)[0],
    [porCategoria]
  )

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-7 h-7 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-8 max-w-screen-xl mx-auto space-y-6">

      {/* ── Encabezado del proyecto ── */}
      <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {/* Nombre del proyecto */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-500" />
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">
                Condominio La Trinidad · Pinchote, Santander
              </span>
            </div>
            {/* Saludo */}
            <h1 className="text-2xl font-semibold text-surface-900 leading-tight">
              Hola, {usuario?.nombre} 👋
            </h1>
            <p className="text-sm text-surface-400 mt-1">
              <span className="font-medium text-accent-600">{usuario?.cargo}</span>
              {' · '}
              {new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}
            </p>
          </div>

          {/* Botón atajo registrar */}
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

      {/* ── Métricas ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total invertido"
          value={formatCOP(total)}
          sub={`${gastos.length} registros`}
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

      {/* ── Gráficas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Barras por categoría */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-1">Gastos por categoría</h2>
          <p className="text-xs text-surface-400 mb-5">Distribución del total invertido</p>
          {porCategoria.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-surface-300">
              <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-sm font-medium">Sin datos aún</p>
              <p className="text-xs mt-1">Registra el primer gasto para ver la gráfica</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porCategoria} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="categoria"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={v => v.split(' ')[0]}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
                />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="total" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Línea acumulada */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-1">Flujo de caja acumulado</h2>
          <p className="text-xs text-surface-400 mb-5">Evolución de la inversión mes a mes</p>
          {porMes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-surface-300">
              <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <p className="text-sm font-medium">Sin datos aún</p>
              <p className="text-xs mt-1">Registra gastos para ver la tendencia</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={porMes} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`}
                />
                <Tooltip content={<TooltipCustom />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="monto" name="Mes" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="acumulado" name="Acumulado" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Pie de página ── */}
      <p className="text-center text-xs text-surface-300 pb-2">
        Condominio La Trinidad · Pinchote, Santander · Uso interno
      </p>

    </div>
  )
}
