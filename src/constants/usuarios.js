// Principio O (Open/Closed): para agregar categorías o lotes solo edita este archivo

export const CATEGORIAS = [
  'Mano de obra',
  'Materiales',
  'Equipos y maquinaria',
  'Herramientas y consumibles',
  'Transporte y logística',
  'Servicios en obra',
  'Honorarios profesionales',
  'Trámites y licencias',
  'Estudios y consultorías',
  'Seguridad y salud (SST)',
  'Administración de obra',
  'Imprevistos',
]

// Colores por categoría para gráficas (mismo orden que CATEGORIAS)
export const COLORES_CATEGORIAS = [
  '#16a34a', // Mano de obra
  '#2563eb', // Materiales
  '#d97706', // Equipos y maquinaria
  '#7c3aed', // Herramientas y consumibles
  '#0891b2', // Transporte y logística
  '#db2777', // Servicios en obra
  '#65a30d', // Honorarios profesionales
  '#dc2626', // Trámites y licencias
  '#0d9488', // Estudios y consultorías
  '#ea580c', // Seguridad y salud (SST)
  '#6366f1', // Administración de obra
  '#94a3b8', // Imprevistos
]

// Casas / Lotes del proyecto
export const CASAS_LOTES = [
  'Casa Lote 4',
  'Casa Lote 13',
]

// Roles del sistema
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
}

// Usuarios autorizados con su rol
export const USUARIOS_AUTORIZADOS = [
  {
    email: 'gutierrezyeison436@gmail.com',
    nombre: 'Yeison Gutierrez',
    cargo: 'Representante Legal',
    rol: ROLES.ADMIN,
  },
  {
    email: 'arq.andersongutierrez@gmail.com',
    nombre: 'Anderson Gutierrez',
    cargo: 'Arquitecto',
    rol: ROLES.EDITOR,
  },
  {
    email: 'gionnygutierrezp@gmail.com',
    nombre: 'Gionny',
    cargo: 'Ingeniero',
    rol: ROLES.ADMIN,
  },
]

export const EMAILS_AUTORIZADOS = USUARIOS_AUTORIZADOS.map(u => u.email.trim().toLowerCase())
