import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCOP, formatFecha, calcularTotal, agruparPorCategoria } from '../utils/formatters'

export const generarPDF = (gastos, filtros = {}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const VERDE   = [22, 163, 74]
  const GRIS_OS = [15, 23, 42]
  const GRIS_MD = [100, 116, 139]
  const GRIS_CL = [241, 245, 249]
  const BLANCO  = [255, 255, 255]

  const hoy      = new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })
  const total    = calcularTotal(gastos)
  const porCat   = agruparPorCategoria(gastos)
  const W        = doc.internal.pageSize.getWidth()

  // ── Encabezado ─────────────────────────────────────────────────────────────
  doc.setFillColor(...VERDE)
  doc.rect(0, 0, W, 32, 'F')

  doc.setTextColor(...BLANCO)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Control de Gastos — Proyecto Condominio', 14, 13)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Reporte generado el ${hoy}`, 14, 21)

  if (filtros.desde || filtros.hasta) {
    const rango = `Período: ${filtros.desde ?? '—'} al ${filtros.hasta ?? '—'}`
    doc.text(rango, 14, 27)
  }

  // ── Resumen ejecutivo ──────────────────────────────────────────────────────
  let y = 42

  doc.setTextColor(...GRIS_OS)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen ejecutivo', 14, y)
  y += 6

  // Cajas de métricas
  const cajas = [
    { label: 'Total gastado',    valor: formatCOP(total) },
    { label: 'N.º de registros', valor: String(gastos.length) },
    { label: 'Categorías',       valor: String(porCat.length) },
  ]

  const boxW = (W - 28 - 8) / 3
  cajas.forEach((c, i) => {
    const x = 14 + i * (boxW + 4)
    doc.setFillColor(...GRIS_CL)
    doc.roundedRect(x, y, boxW, 18, 3, 3, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS_MD)
    doc.text(c.label.toUpperCase(), x + 4, y + 6)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRIS_OS)
    doc.text(c.valor, x + 4, y + 14)
  })
  y += 26

  // ── Tabla por categoría ────────────────────────────────────────────────────
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GRIS_OS)
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
    headStyles: { fillColor: VERDE, textColor: BLANCO, fontStyle: 'bold' },
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
  doc.setTextColor(...GRIS_OS)
  doc.text('Detalle de gastos', 14, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Categoría', 'Descripción', 'Registrado por', 'Monto (COP)']],
    body: gastos.map(g => [
      formatFecha(g.creadoEn),
      g.categoria,
      g.unidad,
      g.nombreUsuario ?? g.creadoPor,
      formatCOP(g.monto),
    ]),
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: VERDE, textColor: BLANCO, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: GRIS_CL },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 38 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
    // Fila de total al final
    foot: [['', '', '', 'TOTAL', formatCOP(total)]],
    footStyles: {
      fillColor: GRIS_OS,
      textColor: BLANCO,
      fontStyle: 'bold',
      fontSize: 9,
    },
  })

  // ── Pie de página en todas las páginas ────────────────────────────────────
  const totalPags = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPags; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...GRIS_MD)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Documento confidencial · Proyecto Condominio · Pág. ${i} de ${totalPags}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    )
  }

  doc.save(`gastos-condominio-${new Date().toISOString().slice(0, 10)}.pdf`)
}
