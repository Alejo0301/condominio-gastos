import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth()

  // Mientras Firebase verifica la sesión mostramos un spinner
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
          <p className="text-sm text-surface-400">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!usuario) return <Navigate to="/login" replace />

  return children
}
