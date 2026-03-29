import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    to: '/gastos',
    label: 'Gastos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    to: '/nuevo-gasto',
    label: 'Registrar',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
]

// Clase activa reutilizable
const navClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary-50 text-primary-700'
      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
  }`

// Clase para bottom nav móvil
const mobileNavClass = ({ isActive }) =>
  `flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
    isActive ? 'text-primary-600' : 'text-surface-500'
  }`

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
    <div className="min-h-screen bg-surface-50 flex">

      {/* ── Sidebar desktop (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-surface-100 min-h-screen fixed top-0 left-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-100">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M6.75 3.75v17.25M17.25 3.75v17.25M3 7.5h3m-3 3.75h3m-3 3.75h3M21 7.5h-3m3 3.75h-3m3 3.75h-3M6.75 3.75h10.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 leading-tight">Condominio</p>
            <p className="text-xs text-surface-400">Control de gastos</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario + logout */}
        <div className="px-3 py-4 border-t border-surface-100 space-y-3">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-xs font-semibold text-accent-700 flex-shrink-0">
              {iniciales}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">{usuario?.nombre}</p>
              <p className="text-xs text-surface-400 truncate">{esAdmin ? 'Administrador' : 'Editor'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">
        {/* Header móvil / tablet */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-surface-100 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M6.75 3.75v17.25M17.25 3.75v17.25" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-surface-900">Condominio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent-100 flex items-center justify-center text-xs font-semibold text-accent-700">
              {iniciales}
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </header>

        {/* Páginas */}
        <Outlet />
      </main>

      {/* ── Bottom nav móvil / tablet ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-surface-100 z-20 flex justify-around items-center px-2 py-2 safe-area-pb">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} className={mobileNavClass}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
