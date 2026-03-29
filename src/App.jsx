import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import GastosPage from './pages/GastosPage'
import NuevoGastoPage from './pages/NuevoGastoPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/condominio-gastos">
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas — todas dentro del layout con sidebar */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/gastos"       element={<GastosPage />} />
            <Route path="/nuevo-gasto"  element={<NuevoGastoPage />} />

            {/* Redirige la raíz al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Cualquier ruta desconocida va al dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
