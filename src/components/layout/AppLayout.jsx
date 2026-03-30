import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    to: '/gastos',
    label: 'Gastos',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    to: '/nuevo-gasto',
    label: 'Registrar',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
]

// Logo mark SVG — silueta de edificios Escala Hayn
function LogoMark({ size = 'md' }) {
  const heights = size === 'sm'
    ? [12, 18, 24, 16, 10]
    : [16, 24, 32, 20, 13]
  const width = size === 'sm' ? 4 : 5
  const gap = 2
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: `${gap}px` }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: `${width}px`, height: `${h}px`,
          background: i === 2 ? '#C9A84C' : i === 1 ? '#C9A84C' : i === 3 ? '#8A8A8A' : '#2A2A2A',
          borderRadius: '2px 2px 0 0',
          opacity: i === 0 || i === 4 ? 0.5 : 1,
        }} />
      ))}
    </div>
  )
}

export default function AppLayout() {
  const { usuario, cerrarSesion, esAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await cerrarSesion()
    navigate('/login')
  }

  const iniciales = usuario?.nombre
    ? usuario.nombre.slice(0, 2).toUpperCase()
    : '??'

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sidebar desktop ── */}
      <aside style={{
        display: 'none',
        width: '240px',
        background: '#FFFFFF',
        borderRight: '1px solid #EBEBEB',
        minHeight: '100vh',
        position: 'fixed',
        top: 0, left: 0, zIndex: 20,
        flexDirection: 'column',
      }} className="sidebar-desktop">

        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #F0F0F0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LogoMark size="md" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
                La Trinidad
              </div>
              <div style={{ fontSize: '10px', color: '#AAAAAA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Escala Hayn
              </div>
            </div>
          </div>
          {/* Línea dorada */}
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, #C9A84C, transparent)',
            borderRadius: '2px', marginTop: '16px',
          }} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              fontSize: '13px', fontWeight: isActive ? 600 : 400,
              color: isActive ? '#1A1A1A' : '#7A7A7A',
              background: isActive ? '#FDF8EE' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
              borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
            })}>
              <span style={{ opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario + logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #F0F0F0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', marginBottom: '4px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#FDF8EE', border: '1.5px solid #C9A84C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#C9A84C', flexShrink: 0,
            }}>
              {iniciales}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {usuario?.nombre}
              </div>
              <div style={{ fontSize: '11px', color: '#AAAAAA' }}>
                {esAdmin ? 'Administrador' : 'Editor'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '10px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: '13px', color: '#AAAAAA', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#AAAAAA' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main style={{ flex: 1, paddingBottom: '72px' }} className="main-content">

        {/* Header móvil */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#FFFFFF', borderBottom: '1px solid #EBEBEB',
          position: 'sticky', top: 0, zIndex: 10,
        }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogoMark size="sm" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>La Trinidad</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#FDF8EE', border: '1.5px solid #C9A84C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#C9A84C',
            }}>
              {iniciales}
            </div>
            <button onClick={handleLogout} style={{
              padding: '6px', borderRadius: '8px', border: 'none',
              background: 'transparent', cursor: 'pointer', color: '#AAAAAA',
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </header>

        <Outlet />
      </main>

      {/* ── Bottom nav móvil ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#FFFFFF', borderTop: '1px solid #EBEBEB',
        zIndex: 20, display: 'flex', justifyContent: 'space-around',
        alignItems: 'center', padding: '8px 0 10px',
      }} className="mobile-bottom-nav">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            padding: '6px 16px', borderRadius: '10px', textDecoration: 'none',
            fontSize: '10px', fontWeight: isActive ? 600 : 400,
            color: isActive ? '#C9A84C' : '#AAAAAA',
            transition: 'color 0.15s',
          })}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (min-width: 1024px) {
          .sidebar-desktop { display: flex !important; }
          .main-content { margin-left: 240px; padding-bottom: 0 !important; }
          .mobile-header { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}
