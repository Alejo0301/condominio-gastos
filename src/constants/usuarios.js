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

// Colores por categoría para gráficas — Paleta Escala Hayn
export const COLORES_CATEGORIAS = [
  '#C9A84C', // Mano de obra        — dorado principal
  '#A88B38', // Materiales          — dorado oscuro
  '#E8C96A', // Equipos y maquinaria — dorado claro
  '#1A1A1A', // Herramientas        — negro
  '#3A3A3A', // Transporte          — carbón
  '#555555', // Servicios en obra   — gris oscuro
  '#8A8A8A', // Honorarios          — gris medio
  '#AAAAAA', // Trámites            — gris claro
  '#D4B86A', // Estudios            — dorado suave
  '#7A6830', // Seguridad SST       — dorado tierra
  '#2A2A2A', // Administración      — negro suave
  '#CCCCCC', // Imprevistos         — gris muy claro
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
    email: 'Lauradulcey2015@gmail.com',
    nombre: 'Laura Dulcey',
    cargo: 'Administradora-Propietaria',
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
