import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange, logoutService } from '../services/authService'
import { ROLES } from '../constants/usuarios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario]   = useState(undefined) // undefined = cargando
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setUsuario(user)
      setCargando(false)
    })
    return unsub
  }, [])

  const cerrarSesion = () => logoutService()

  const esAdmin = usuario?.rol === ROLES.ADMIN

  return (
    <AuthContext.Provider value={{ usuario, cargando, cerrarSesion, esAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para consumir el contexto fácilmente
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
