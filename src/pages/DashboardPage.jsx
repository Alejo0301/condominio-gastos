import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { useGastos } from '../hooks/useGastos'
import { useAuth } from '../context/AuthContext'
import { formatCOP, agruparPorCategoria, calcularTotal } from '../utils/formatters'

// ── Componente de tarjeta de métrica ──────────────────────────────────────────
const MetricCard = ({ label, value, sub }) => (
  <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-5">
    <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-semibold text-surface-900 leading-tight">{value}</p>
    {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
  </div>
)

// ── Tooltip personalizado para gráficas ───────────────────────────────────────
const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-100 shadow-card rounded-xl px-3 py-2 text-sm">
      <p className="font-medium text-surface-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {formatCOP(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { gastos, cargando } = useGastos()
  const { usuario } = useAuth()

  // ── Métricas calculadas ────────────────────────────────────────────────────
  const total        = useMemo(() => calcularTotal(gastos), [gastos])
  const porCategoria = useMemo(() => agruparPorCategoria(gastos), [gastos])

  // Gasto acumulado mes a mes
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

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-7 h-7 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-8 max-w-screen-xl mx-auto space-y-6">

      {/* Saludo */}
      <div>
        <h1 className="text-xl font-semibold text-surface-900">
          Hola, {usuario?.nombre} 👋
        </h1>
        <p className="text-sm text-surface-400 mt-0.5">
          Resumen del proyecto · {new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total gastado"
          value={formatCOP(total)}
          sub={`${gastos.length} registros`}
        />
        <MetricCard
          label="Categorías"
          value={porCategoria.length}
          sub="tipos de gasto"
        />
        <MetricCard
          label="Mayor categoría"
          value={porCategoria.sort((a, b) => b.total - a.total)[0]?.categoria?.split(' ')[0] ?? '—'}
          sub={porCategoria[0] ? formatCOP(porCategoria[0].total) : ''}
        />
        <MetricCard
          label="Este mes"
          value={formatCOP(
            gastos
              .filter(g => {
                const hoy = new Date()
                return g.creadoEn instanceof Date &&
                  g.creadoEn.getMonth() === hoy.getMonth() &&
                  g.creadoEn.getFullYear() === hoy.getFullYear()
              })
              .reduce((acc, g) => acc + g.monto, 0)
          )}
          sub="mes en curso"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Barras por categoría */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-5">
          <h2 className="text-sm font-semibold text-surface-700 mb-4">Gastos por categoría</h2>
          {porCategoria.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-10">Sin datos aún</p>
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

        {/* Línea acumulada mes a mes */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-5">
          <h2 className="text-sm font-semibold text-surface-700 mb-4">Flujo de caja acumulado</h2>
          {porMes.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-10">Sin datos aún</p>
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
                <Line
                  type="monotone"
                  dataKey="monto"
                  name="Mes"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="acumulado"
                  name="Acumulado"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  )
}
