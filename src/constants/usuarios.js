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
// esCasa: true  → una casa individual (se puede filtrar/reportar por separado)
// esCasa: false → contenedor de gastos administrativos del proyecto completo,
//                 no se debe repartir entre casas
export const CASAS_LOTES = [
  { nombre: 'Casa Lote 4',  tipo: 'casa',    esCasa: true },
  { nombre: 'Casa Lote 13', tipo: 'casa',    esCasa: true },
  { nombre: 'Casa Lote 12', tipo: 'casa',    esCasa: true },
  { nombre: 'Administración General', tipo: 'general', esCasa: false },
]

// Busca la definición de un lote por el nombre guardado en el gasto (g.casaLote)
export const obtenerLote = (nombre) => CASAS_LOTES.find(l => l.nombre === nombre)

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
    rol: ROLES.ADMIN,
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
