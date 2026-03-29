import { useState, useEffect, useCallback } from 'react'
import {
  obtenerGastos,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
} from '../services/gastoService'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../constants/usuarios'

export const useGastos = () => {
  const { usuario } = useAuth()
  const [gastos, setGastos]     = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const datos = await obtenerGastos()
      setGastos(datos)
    } catch (e) {
      setError('No se pudieron cargar los gastos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const agregar = async (gasto) => {
    await crearGasto(gasto, usuario)
    await cargar()
  }

  // Solo disponible para admins (Interface Segregation)
  const editar = async (id, cambios) => {
    if (usuario?.rol !== ROLES.ADMIN) throw new Error('Sin permisos')
    await actualizarGasto(id, cambios)
    await cargar()
  }

  const eliminar = async (id) => {
    if (usuario?.rol !== ROLES.ADMIN) throw new Error('Sin permisos')
    await eliminarGasto(id)
    await cargar()
  }

  return { gastos, cargando, error, agregar, editar, eliminar, recargar: cargar }
}
