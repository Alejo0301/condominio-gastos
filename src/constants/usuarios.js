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
    email: 'papa@tudominio.com',        // ← reemplaza con el correo real
    nombre: 'Representante Legal',
    cargo: 'Representante Legal',
    rol: ROLES.ADMIN,
  },
  {
    email: 'hermano@tudominio.com',     // ← reemplaza con el correo real
    nombre: 'Arquitecto',
    cargo: 'Arquitecto',
    rol: ROLES.EDITOR,
  },
  {
    email: 'yo@tudominio.com',          // ← reemplaza con el correo real
    nombre: 'Gionny',
    cargo: 'Ingeniero',
    rol: ROLES.ADMIN,
  },
]

export const EMAILS_AUTORIZADOS = USUARIOS_AUTORIZADOS.map(u => u.email)
