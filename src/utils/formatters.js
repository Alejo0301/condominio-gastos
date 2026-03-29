// Formatea un número como pesos colombianos
export const formatCOP = (monto) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)

// Formatea fecha para mostrar en tabla
export const formatFecha = (fecha) => {
  if (!fecha) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha instanceof Date ? fecha : new Date(fecha))
}

// Agrupa gastos por categoría y suma montos
export const agruparPorCategoria = (gastos) => {
  const mapa = {}
  gastos.forEach(({ categoria, monto }) => {
    mapa[categoria] = (mapa[categoria] ?? 0) + monto
  })
  return Object.entries(mapa).map(([categoria, total]) => ({ categoria, total }))
}

// Calcula el total general de una lista de gastos
export const calcularTotal = (gastos) =>
  gastos.reduce((acc, g) => acc + (Number(g.monto) || 0), 0)
