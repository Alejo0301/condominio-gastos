import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLECCION = 'gastos'
const ref = () => collection(db, COLECCION)

// Crear un nuevo gasto
export const crearGasto = async (gasto, usuario) => {
  const docRef = await addDoc(ref(), {
    ...gasto,
    monto: Number(gasto.monto),
    creadoPor: usuario.email,
    nombreUsuario: usuario.nombre,
    cargoUsuario: usuario.cargo,        // ← cargo del responsable
    creadoEn: serverTimestamp(),        // guarda fecha Y hora exacta
  })
  return docRef.id
}

// Obtener todos los gastos ordenados por fecha descendente
export const obtenerGastos = async () => {
  const q = query(ref(), orderBy('creadoEn', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
    creadoEn: d.data().creadoEn?.toDate() ?? new Date(),
  }))
}

// Actualizar un gasto existente (solo admin)
export const actualizarGasto = async (id, cambios) => {
  const docRef = doc(db, COLECCION, id)
  await updateDoc(docRef, {
    ...cambios,
    monto: Number(cambios.monto),
  })
}

// Eliminar un gasto (solo admin)
export const eliminarGasto = async (id) => {
  const docRef = doc(db, COLECCION, id)
  await deleteDoc(docRef)
}
