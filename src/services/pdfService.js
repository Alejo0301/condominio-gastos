import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCOP, formatFecha, calcularTotal, agruparPorCategoria } from '../utils/formatters'

// Genera el doc PDF y lo retorna como blob URL para previsualizar
const buildPDF = (gastos, filtros = {}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const DORADO  = [201, 168, 76]
  const NEGRO   = [26, 26, 26]
  const GRIS_MD = [138, 138, 138]
  const GRIS_CL = [248, 247, 244]
  const BLANCO  = [255, 255, 255]

  const hoy    = new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })
  const total  = calcularTotal(gastos)
  const porCat = agruparPorCategoria(gastos)
  const W      = doc.internal.pageSize.getWidth()

  // ── Encabezado ─────────────────────────────────────────────────────────────
  doc.setFillColor(...NEGRO)
  doc.rect(0, 0, W, 36, 'F')

  // Línea dorada superior
  doc.setFillColor(...DORADO)
  doc.rect(0, 0, W, 2.5, 'F')

  // Logo mark — barras de edificio
  const bx = 14, by = 10
  const bars = [
    { w: 3, h: 8,  x: 0  },
    { w: 3, h: 14, x: 5  },
    { w: 4, h: 20, x: 10 },
    { w: 3, h: 12, x: 16 },
    { w: 3, h: 7,  x: 21 },
  ]
  bars.forEach((b, i) => {
    const col = (i === 1 || i === 2) ? DORADO : [80, 80, 80]
    doc.setFillColor(...col)
    doc.roundedRect(bx + b.x, by + (20 - b.h), b.w, b.h, 0.5, 0.5, 'F')
  })

  doc.setTextColor(...BLANCO)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Escala Ayn Constructora', 44, 17)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DORADO)
  doc.text('Control de Gastos — Proyecto La Trinidad · Pinchote, Santander', 44, 23)

  doc.setTextColor(180, 180, 180)
  doc.setFontSize(7.5)
  doc.text(`Reporte generado el ${hoy}`, 44, 29)

  if (filtros.desde || filtros.hasta) {
    const rango = `Período: ${filtros.desde ?? '—'} al ${filtros.hasta ?? '—'}`
    doc.text(rango, 44, 34)
  }

  // ── Resumen ejecutivo ──────────────────────────────────────────────────────
  let y = 48

  doc.setTextColor(...NEGRO)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen ejecutivo', 14, y)
  y += 6

  const cajas = [
    { label: 'Total gastado',    valor: formatCOP(total) },
    { label: 'N.º de registros', valor: String(gastos.length) },
    { label: 'Categorías',       valor: String(porCat.length) },
  ]

  const boxW = (W - 28 - 8) / 3
  cajas.forEach((c, i) => {
    const x = 14 + i * (boxW + 4)
    doc.setFillColor(...GRIS_CL)
    doc.roundedRect(x, y, boxW, 20, 3, 3, 'F')
    // Línea dorada izquierda
    doc.setFillColor(...DORADO)
    doc.roundedRect(x, y, 1.5, 20, 0.5, 0.5, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS_MD)
    doc.text(c.label.toUpperCase(), x + 5, y + 7)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NEGRO)
    doc.text(c.valor, x + 5, y + 15)
  })
  y += 28

  // ── Tabla por categoría ────────────────────────────────────────────────────
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NEGRO)
  doc.text('Distribución por categoría', 14, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['Categoría', 'Total (COP)', '% del total']],
    body: porCat
      .sort((a, b) => b.total - a.total)
      .map(c => [
        c.categoria,
        formatCOP(c.total),
        total > 0 ? `${((c.total / total) * 100).toFixed(1)}%` : '0%',
      ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: NEGRO, textColor: BLANCO, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: GRIS_CL },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10

  // ── Detalle completo de gastos ─────────────────────────────────────────────
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NEGRO)
  doc.text('Detalle de gastos', 14, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Lote', 'Categoría', 'Descripción', 'Responsable', 'Monto (COP)']],
    body: gastos.map(g => [
      formatFecha(g.creadoEn),
      g.casaLote ?? '—',
      g.categoria,
      g.unidad,
      g.nombreUsuario ?? g.creadoPor,
      formatCOP(g.monto),
    ]),
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: NEGRO, textColor: BLANCO, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: GRIS_CL },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 32 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 28 },
      5: { halign: 'right', cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
    foot: [['', '', '', '', 'TOTAL', formatCOP(total)]],
    footStyles: {
      fillColor: DORADO,
      textColor: NEGRO,
      fontStyle: 'bold',
      fontSize: 9,
    },
  })

  // ── Pie de página ──────────────────────────────────────────────────────────
  const totalPags = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPags; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...GRIS_MD)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Documento confidencial · Escala Ayn Constructora · Pág. ${i} de ${totalPags}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    )
    // Línea dorada pie
    doc.setFillColor(...DORADO)
    doc.rect(0, doc.internal.pageSize.getHeight() - 4, W, 1, 'F')
  }

  return doc
}

// Abre el PDF en una nueva pestaña para previsualizar — el usuario descarga desde ahí
export const previsualizarPDF = (gastos, filtros = {}) => {
  const doc = buildPDF(gastos, filtros)
  const blob = doc.output('blob')
  const url  = URL.createObjectURL(blob)
  window.open(url, '_blank')
  // Libera memoria tras 2 minutos
  setTimeout(() => URL.revokeObjectURL(url), 120_000)
}

// Descarga directa (se mantiene por compatibilidad si se necesita en el futuro)
export const generarPDF = (gastos, filtros = {}) => {
  const doc = buildPDF(gastos, filtros)
  doc.save(`gastos-escala-ayn-${new Date().toISOString().slice(0, 10)}.pdf`)
}
