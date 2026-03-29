import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { EMAILS_AUTORIZADOS, USUARIOS_AUTORIZADOS } from '../constants/usuarios'

// Inicio de sesión con validación de whitelist
export const loginService = async (email, password) => {
  const emailNormalizado = email.trim().toLowerCase()

  if (!EMAILS_AUTORIZADOS.includes(emailNormalizado)) {
    throw new Error('Este correo no está autorizado para acceder al sistema.')
  }

  const credencial = await signInWithEmailAndPassword(auth, emailNormalizado, password)
  return credencial.user
}

// Cierre de sesión
export const logoutService = () => signOut(auth)

// Escucha cambios de sesión y enriquece el usuario con su perfil local
export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, (firebaseUser) => {
    if (!firebaseUser) return callback(null)

    const perfil = USUARIOS_AUTORIZADOS.find(
      u => u.email === firebaseUser.email?.toLowerCase()
    )

    callback(perfil ? { ...firebaseUser, ...perfil } : null)
  })
