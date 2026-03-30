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

const colorPorCategoria = (cat) => {
  const idx = CATEGORIAS.indexOf(cat)
  return idx >= 0 ? COLORES_CATEGORIAS[idx] : '#94a3b8'
}

// ── Componentes base ──────────────────────────────────────────────────────────

const S = {
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #EBEBEB',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    padding: '24px',
  },
  label: {
    fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#AAAAAA', marginBottom: '4px',
    display: 'block',
  },
  sectionTitle: {
    fontSize: '13px', fontWeight: 600, color: '#1A1A1A', marginBottom: '2px',
  },
  sectionSub: {
    fontSize: '12px', color: '#AAAAAA', marginBottom: '20px',
  },
}

const MetricCard = ({ label, value, sub, accent }) => (
  <div style={{
    ...S.card,
    background: accent ? '#1A1A1A' : '#FFFFFF',
    border: accent ? '1px solid #2A2A2A' : '1px solid #EBEBEB',
    position: 'relative', overflow: 'hidden',
  }}>
    {accent && (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, #C9A84C, #E8C96A)',
      }} />
    )}
    <span style={{
      ...S.label,
      color: accent ? '#888' : '#AAAAAA',
    }}>{label}</span>
    <div style={{
      fontSize: '22px', fontWeight: 700, lineHeight: 1.2,
      color: accent ? '#C9A84C' : '#1A1A1A',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.02em',
    }}>{value}</div>
    {sub && (
      <div style={{ fontSize: '11px', color: accent ? '#666' : '#AAAAAA', marginTop: '4px' }}>
        {sub}
      </div>
    )}
  </div>
)

const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#FFF', border: '1px solid #EBEBEB',
      borderRadius: '10px', padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontSize: '12px',
    }}>
      <div style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color ?? p.fill }}>{formatCOP(p.value)}</div>
      ))}
    </div>
  )
}

const TooltipPie = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{
      background: '#FFF', border: '1px solid #EBEBEB',
      borderRadius: '10px', padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontSize: '12px',
    }}>
      <div style={{ fontWeight: 600, color: '#1A1A1A' }}>{name}</div>
      <div style={{ color: '#888', marginTop: '2px' }}>{formatCOP(value)}</div>
    </div>
  )
}

const EmptyState = ({ mensaje = 'Sin datos aún' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '40px 0', color: '#D0D0D0',
  }}>
    <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
    <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '8px' }}>{mensaje}</div>
  </div>
)

// ── Página principal ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { gastos, cargando } = useGastos()
  const { usuario } = useAuth()
  const [filtroCasa, setFiltroCasa] = useState('')

  const gastosFiltrados = useMemo(() =>
    filtroCasa ? gastos.filter(g => g.casaLote === filtroCasa) : gastos,
    [gastos, filtroCasa]
  )

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

  const dataCategorias = useMemo(() =>
    porCategoria
      .sort((a, b) => b.total - a.total)
      .map(item => ({ ...item, fill: colorPorCategoria(item.categoria) })),
    [porCategoria]
  )

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

  const dataResponsables = useMemo(() => {
    const mapa = {}
    gastosFiltrados.forEach(g => {
      const nombre = g.nombreUsuario ?? g.creadoPor
      mapa[nombre] = (mapa[nombre] ?? 0) + g.monto
    })
    return Object.entries(mapa).map(([nombre, total]) => ({ nombre, total }))
  }, [gastosFiltrados])

  const dataCasas = useMemo(() => {
    const mapa = {}
    gastos.forEach(g => {
      const key = g.casaLote || 'Sin asignar'
      mapa[key] = (mapa[key] ?? 0) + g.monto
    })
    return Object.entries(mapa).map(([casa, total]) => ({ casa, total }))
  }, [gastos])

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
      padding: '24px 16px',
      maxWidth: '1280px',
      margin: '0 auto',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex', flexDirection: 'column', gap: '16px',
    }}>

      {/* ── Encabezado ── */}
      <div style={{ ...S.card, padding: '24px 28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: '#C9A84C', textTransform: 'uppercase' }}>
                Condominio La Trinidad · Pinchote, Santander
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em', margin: 0 }}>
              Hola, {usuario?.nombre} 👋
            </h1>
            <p style={{ fontSize: '13px', color: '#AAAAAA', marginTop: '4px' }}>
              <span style={{ color: '#C9A84C', fontWeight: 600 }}>{usuario?.cargo}</span>
              {' · '}
              {new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}
            </p>
          </div>
          <Link
            to="/nuevo-gasto"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px',
              background: '#C9A84C', color: '#1A1A1A',
              fontWeight: 700, fontSize: '13px',
              borderRadius: '12px', textDecoration: 'none',
              letterSpacing: '0.02em', flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#B8942E'}
            onMouseLeave={e => e.currentTarget.style.background = '#C9A84C'}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Registrar gasto
          </Link>
        </div>
      </div>

      {/* ── Filtros por lote ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#AAAAAA', marginRight: '4px' }}>Filtrar por lote:</span>
        {['', ...CASAS_LOTES].map(cl => (
          <button
            key={cl || 'todos'}
            onClick={() => setFiltroCasa(cl)}
            style={{
              padding: '6px 14px', borderRadius: '20px',
              fontSize: '12px', fontWeight: 600,
              border: '1.5px solid',
              borderColor: filtroCasa === cl ? '#C9A84C' : '#E8E8E8',
              background: filtroCasa === cl ? '#C9A84C' : '#FFFFFF',
              color: filtroCasa === cl ? '#1A1A1A' : '#7A7A7A',
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {cl || 'Todos'}
          </button>
        ))}
      </div>

      {/* ── Métricas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
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

      {/* ── Fila 1: Barras + Dona ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="charts-row-1">
        <div style={S.card}>
          <div style={S.sectionTitle}>Gastos por categoría</div>
          <div style={S.sectionSub}>Cada categoría con su color identificador</div>
          {dataCategorias.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dataCategorias} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis
                  dataKey="categoria"
                  tick={{ fontSize: 10, fill: '#BBBBBB' }}
                  tickFormatter={v => v.split(' ')[0]}
                  angle={-35} textAnchor="end" interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#BBBBBB' }}
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

        <div style={S.card}>
          <div style={S.sectionTitle}>Proporción por categoría</div>
          <div style={S.sectionSub}>Top 6 rubros del proyecto</div>
          {dataDona.length === 0 ? <EmptyState /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={dataDona} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                    {dataDona.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<TooltipPie />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {dataDona.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.fill, flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, color: '#1A1A1A', flexShrink: 0 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="charts-row-2">
        <div style={S.card}>
          <div style={S.sectionTitle}>Gastos por responsable</div>
          <div style={S.sectionSub}>Quién ha registrado más inversión</div>
          {dataResponsables.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataResponsables} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#BBBBBB' }} tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11, fill: '#555' }} width={100} />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {dataResponsables.map((_, i) => {
                    const cols = ['#C9A84C', '#8A8A8A', '#1A1A1A']
                    return <Cell key={i} fill={cols[i % cols.length]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={S.card}>
          <div style={S.sectionTitle}>Inversión por casa / lote</div>
          <div style={S.sectionSub}>Distribución entre lotes del proyecto</div>
          {dataCasas.length === 0 ? <EmptyState mensaje="Sin gastos asignados a lotes" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataCasas} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis dataKey="casa" tick={{ fontSize: 11, fill: '#BBBBBB' }} />
                <YAxis tick={{ fontSize: 10, fill: '#BBBBBB' }} tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {['#C9A84C', '#8A8A8A', '#2A2A2A', '#E8C96A'].map((c, i) => <Cell key={i} fill={c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Flujo acumulado ── */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Flujo de caja acumulado</div>
        <div style={S.sectionSub}>Evolución de la inversión mes a mes</div>
        {porMes.length === 0 ? <EmptyState mensaje="Registra gastos para ver la tendencia" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={porMes} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#BBBBBB' }} />
              <YAxis tick={{ fontSize: 11, fill: '#BBBBBB' }} tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip content={<TooltipCustom />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="monto" name="Gasto del mes" stroke="#8A8A8A" strokeWidth={2} dot={{ r: 4, fill: '#8A8A8A' }} />
              <Line type="monotone" dataKey="acumulado" name="Acumulado" stroke="#C9A84C" strokeWidth={2.5} dot={{ r: 4, fill: '#C9A84C' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#CCCCCC', paddingBottom: '8px' }}>
        Condominio La Trinidad · Pinchote, Santander · Uso interno · Escala AYN Constructora
      </p>

      <style>{`
        @media (min-width: 1024px) {
          .charts-row-1 { grid-template-columns: 3fr 2fr !important; }
          .charts-row-2 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
