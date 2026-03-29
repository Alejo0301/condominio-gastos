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
export const USUARIOS_AUTORIZADOS = [
  {
    email: 'gutierrezyeison436@gmail.com',        // ← reemplaza con el correo real
    nombre: 'Yeison Gutierrez',
    cargo: 'Representante Legal',
    rol: ROLES.ADMIN,
  },
  {
    email: 'arq.andersongutierrez@gmail.com', // ← reemplaza con el correo real
    nombre: 'Anderson Gutierrez',
    cargo: 'Arquitecto',
    rol: ROLES.EDITOR,
  },
  {
    email: 'gionnygutierrezp@gmail.com',          // ← reemplaza con el correo real
    nombre: 'Gionny',
    cargo: 'Ingeniero',
    rol: ROLES.ADMIN,
  },
]

export const EMAILS_AUTORIZADOS = USUARIOS_AUTORIZADOS.map(u => u.email)
