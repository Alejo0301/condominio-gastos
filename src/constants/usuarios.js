// Principio O (Open/Closed): para agregar categorías solo edita este archivo
export const CATEGORIAS = [
  'Materiales de construcción',
  'Mano de obra',
  'Honorarios profesionales',
  'Trámites legales / permisos',
]

// Roles del sistema
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
}

// Usuarios autorizados con su rol
// ADMIN puede crear, editar y eliminar gastos
// EDITOR solo puede crear gastos
export const USUARIOS_AUTORIZADOS = [
  {
    email: 'gutierrezyeison436@gmail.com',   // ← cambia por el correo real de tu papá
    nombre: 'Papá',
    cargo: 'Representante Legal',
    rol: ROLES.ADMIN,
  },
  {
    email: 'arq.andersongutierrez@gmail.com', // ← correo real de tu hermano
    nombre: 'Hermano',
    cargo: 'Arquitecto',
    rol: ROLES.EDITOR,
  },
  {
    email: 'gionnygutierrezp@gmail.com',     // ← tu correo
    nombre: 'Yo',
    cargo: 'Ingeniero',
    rol: ROLES.ADMIN,
  },
]

export const EMAILS_AUTORIZADOS = USUARIOS_AUTORIZADOS.map(u => u.email)
