import { useRef, useEffect, useState } from 'react'
import SignaturePad from 'signature_pad'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Modal from './Modal'

export default function PreviewPDFModal({ isOpen, onClose, document, type, patientName }) {
  const canvasRef = useRef(null)
  const sigPadRef = useRef(null)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      sigPadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255,255,255)',
        penColor: 'rgb(0,0,0)',
      })
      sigPadRef.current.addEventListener('endStroke', () => setSigned(true))
    }
    return () => {
      if (sigPadRef.current) sigPadRef.current.off()
    }
  }, [isOpen])

  const clearSignature = () => {
    sigPadRef.current?.clear()
    setSigned(false)
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    const isFacture = type === 'facture'
    const color = [13, 148, 136] // teal-600

    // ── En-tête cabinet ──
    doc.setFillColor(...color)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Cabinet Dentaire', 14, 12)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Immeuble Quiffererou Tamdja ,Bafoussam, Cameroun', 14, 20)

    // Titre du document
    doc.setTextColor(...color)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(isFacture ? 'FACTURE' : 'DEVIS', 196, 12, { align: 'right' })
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° ${document.numero || '—'}`, 196, 20, { align: 'right' })

    // ── Infos document ──
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    const dateLabel = isFacture ? 'Date de facturation' : 'Date de création'
    const dateVal = new Date(document.date || document.date_creation).toLocaleDateString('fr-FR')
    doc.text(`${dateLabel} : ${dateVal}`, 14, 38)

    if (!isFacture && document.date_validite) {
      doc.text(`Validité : ${new Date(document.date_validite).toLocaleDateString('fr-FR')}`, 14, 45)
    }

    if (isFacture) {
      const statutLabel = { paye: 'Payé', attente: 'En attente', annule: 'Annulé' }[document.statut] || document.statut
      doc.text(`Statut : ${statutLabel}`, 14, 45)
    }

    // ── Patient ──
    doc.setFillColor(245, 245, 245)
    doc.rect(14, 52, 182, 18, 'F')
    doc.setFont('helvetica', 'bold')
    doc.text('Patient :', 18, 61)
    doc.setFont('helvetica', 'normal')
    doc.text(patientName || '—', 45, 61)

    // ── Tableau des actes ──
    const rows = isFacture
      ? [[document.acte || '—', 1, `${Number(document.montant || 0).toLocaleString('fr-FR')} FCFA`, `${Number(document.montant || 0).toLocaleString('fr-FR')} FCFA`]]
      : (document.lignes || []).map(l => [
          l.description || l.acte || '—',
          l.quantite ?? 1,
          `${Number(l.prix_unitaire || 0).toLocaleString('fr-FR')} FCFA`,
          `${(Number(l.prix_unitaire || 0) * Number(l.quantite || 1)).toLocaleString('fr-FR')} FCFA`,
        ])

    autoTable(doc, {
      startY: 76,
      head: [['Description', 'Qté', 'Prix unitaire', 'Total']],
      body: rows.length > 0 ? rows : [['Aucun acte', '', '', '']],
      headStyles: { fillColor: color, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 250, 250] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 90 }, 3: { halign: 'right' } },
    })

    // ── Total ──
    const finalY = doc.lastAutoTable.finalY + 6
    const montant = isFacture
      ? Number(document.montant || 0)
      : Number(document.montant_total || 0)

    doc.setFillColor(...color)
    doc.rect(130, finalY, 66, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL :', 134, finalY + 7)
    doc.text(`${montant.toLocaleString('fr-FR')} FCFA`, 194, finalY + 7, { align: 'right' })

    // ── Signature ──
    if (signed && sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const sigY = finalY + 22
      doc.setTextColor(50, 50, 50)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('Signature du responsable :', 14, sigY)
      doc.setDrawColor(...color)
      doc.rect(14, sigY + 4, 80, 28)
      const sigData = sigPadRef.current.toDataURL('image/png')
      doc.addImage(sigData, 'PNG', 15, sigY + 5, 78, 26)
    }

    // ── Pied de page ──
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Document généré par le système de gestion du Cabinet Dentaire', 105, 285, { align: 'center' })

    // Téléchargement
    const filename = `${isFacture ? 'Facture' : 'Devis'}_${document.numero || document.id}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  }

  if (!document) return null

  const montant = type === 'facture'
    ? Number(document.montant || 0)
    : Number(document.montant_total || 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Aperçu — ${type === 'facture' ? 'Facture' : 'Devis'} ${document.numero || ''}`}>
      <div className="space-y-4 max-w-lg">

        {/* Résumé */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Patient</span>
            <span className="font-medium text-gray-800">{patientName || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Numéro</span>
            <span className="font-medium text-gray-800">{document.numero || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-800">
              {new Date(document.date || document.date_creation).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-700 font-semibold">Total</span>
            <span className="font-bold text-teal-600">{montant.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        {/* Zone signature */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-700">Signature du responsable</label>
            <button onClick={clearSignature} className="text-xs text-red-500 hover:underline">Effacer</button>
          </div>
          <canvas
            ref={canvasRef}
            width={460}
            height={120}
            className="border-2 border-dashed border-gray-300 rounded-lg w-full touch-none bg-white"
          />
          <p className="text-xs text-gray-400 mt-1">Signez dans le cadre ci-dessus</p>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Fermer
          </button>
          <button onClick={generatePDF}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger PDF
          </button>
        </div>
      </div>
    </Modal>
  )
}