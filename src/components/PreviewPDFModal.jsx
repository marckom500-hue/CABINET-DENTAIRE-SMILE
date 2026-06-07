// import { useRef, useEffect, useState } from 'react'
// import SignaturePad from 'signature_pad'
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
// import Modal from './Modal'

// export default function PreviewPDFModal({ isOpen, onClose, document, type, patientName }) {
//   const canvasRef = useRef(null)
//   const sigPadRef = useRef(null)
//   const [signed, setSigned] = useState(false)

//   useEffect(() => {
//     if (isOpen && canvasRef.current) {
//       sigPadRef.current = new SignaturePad(canvasRef.current, {
//         backgroundColor: 'rgb(255,255,255)',
//         penColor: 'rgb(0,0,0)',
//       })
//       sigPadRef.current.addEventListener('endStroke', () => setSigned(true))
//     }
//     return () => {
//       if (sigPadRef.current) sigPadRef.current.off()
//     }
//   }, [isOpen])

//   const clearSignature = () => {
//     sigPadRef.current?.clear()
//     setSigned(false)
//   }

//   const generatePDF = () => {
//     const doc = new jsPDF()
//     const isFacture = type === 'facture'
//     const color = [13, 148, 136] // teal-600

//     // ── En-tête cabinet ──
//     doc.setFillColor(...color)
//     doc.rect(0, 0, 210, 28, 'F')
//     doc.setTextColor(255, 255, 255)
//     doc.setFontSize(18)
//     doc.setFont('helvetica', 'bold')
//     doc.text('Cabinet Dentaire', 14, 12)
//     doc.setFontSize(10)
//     doc.setFont('helvetica', 'normal')
//     doc.text('Immeuble Quiffererou Tamdja ,Bafoussam, Cameroun', 14, 20)

//     // Titre du document
//     doc.setTextColor(...color)
//     doc.setFontSize(16)
//     doc.setFont('helvetica', 'bold')
//     doc.text(isFacture ? 'FACTURE' : 'DEVIS', 196, 12, { align: 'right' })
//     doc.setTextColor(100, 100, 100)
//     doc.setFontSize(10)
//     doc.setFont('helvetica', 'normal')
//     doc.text(`N° ${document.numero || '—'}`, 196, 20, { align: 'right' })

//     // ── Infos document ──
//     doc.setTextColor(50, 50, 50)
//     doc.setFontSize(10)
//     const dateLabel = isFacture ? 'Date de facturation' : 'Date de création'
//     const dateVal = new Date(document.date || document.date_creation).toLocaleDateString('fr-FR')
//     doc.text(`${dateLabel} : ${dateVal}`, 14, 38)

//     if (!isFacture && document.date_validite) {
//       doc.text(`Validité : ${new Date(document.date_validite).toLocaleDateString('fr-FR')}`, 14, 45)
//     }

//     if (isFacture) {
//       const statutLabel = { paye: 'Payé', attente: 'En attente', annule: 'Annulé' }[document.statut] || document.statut
//       doc.text(`Statut : ${statutLabel}`, 14, 45)
//     }

//     // ── Patient ──
//     doc.setFillColor(245, 245, 245)
//     doc.rect(14, 52, 182, 18, 'F')
//     doc.setFont('helvetica', 'bold')
//     doc.text('Patient :', 18, 61)
//     doc.setFont('helvetica', 'normal')
//     doc.text(patientName || '—', 45, 61)

//     // ── Tableau des actes ──
//     const rows = isFacture
//       ? [[document.acte || '—', 1, `${Number(document.montant || 0).toLocaleString('fr-FR')} FCFA`, `${Number(document.montant || 0).toLocaleString('fr-FR')} FCFA`]]
//       : (document.lignes || []).map(l => [
//           l.description || l.acte || '—',
//           l.quantite ?? 1,
//           `${Number(l.prix_unitaire || 0).toLocaleString('fr-FR')} FCFA`,
//           `${(Number(l.prix_unitaire || 0) * Number(l.quantite || 1)).toLocaleString('fr-FR')} FCFA`,
//         ])

//     autoTable(doc, {
//       startY: 76,
//       head: [['Description', 'Qté', 'Prix unitaire', 'Total']],
//       body: rows.length > 0 ? rows : [['Aucun acte', '', '', '']],
//       headStyles: { fillColor: color, textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [245, 250, 250] },
//       styles: { fontSize: 10, cellPadding: 4 },
//       columnStyles: { 0: { cellWidth: 90 }, 3: { halign: 'right' } },
//     })

//     // ── Total ──
//     const finalY = doc.lastAutoTable.finalY + 6
//     const montant = isFacture
//       ? Number(document.montant || 0)
//       : Number(document.montant_total || 0)

//     doc.setFillColor(...color)
//     doc.rect(130, finalY, 66, 10, 'F')
//     doc.setTextColor(255, 255, 255)
//     doc.setFont('helvetica', 'bold')
//     doc.setFontSize(11)
//     doc.text('TOTAL :', 134, finalY + 7)
//     doc.text(`${montant.toLocaleString('fr-FR')} FCFA`, 194, finalY + 7, { align: 'right' })

//     // ── Signature ──
//     if (signed && sigPadRef.current && !sigPadRef.current.isEmpty()) {
//       const sigY = finalY + 22
//       doc.setTextColor(50, 50, 50)
//       doc.setFont('helvetica', 'bold')
//       doc.setFontSize(10)
//       doc.text('Signature du responsable :', 14, sigY)
//       doc.setDrawColor(...color)
//       doc.rect(14, sigY + 4, 80, 28)
//       const sigData = sigPadRef.current.toDataURL('image/png')
//       doc.addImage(sigData, 'PNG', 15, sigY + 5, 78, 26)
//     }

//     // ── Pied de page ──
//     doc.setTextColor(150, 150, 150)
//     doc.setFontSize(8)
//     doc.setFont('helvetica', 'normal')
//     doc.text('Document généré par le système de gestion du Cabinet Dentaire', 105, 285, { align: 'center' })

//     // Téléchargement
//     const filename = `${isFacture ? 'Facture' : 'Devis'}_${document.numero || document.id}_${new Date().toISOString().split('T')[0]}.pdf`
//     doc.save(filename)
//   }

//   if (!document) return null

//   const montant = type === 'facture'
//     ? Number(document.montant || 0)
//     : Number(document.montant_total || 0)

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title={`Aperçu — ${type === 'facture' ? 'Facture' : 'Devis'} ${document.numero || ''}`}>
//       <div className="space-y-4 max-w-lg">

//         {/* Résumé */}
//         <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
//           <div className="flex justify-between">
//             <span className="text-gray-500">Patient</span>
//             <span className="font-medium text-gray-800">{patientName || '—'}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Numéro</span>
//             <span className="font-medium text-gray-800">{document.numero || '—'}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Date</span>
//             <span className="font-medium text-gray-800">
//               {new Date(document.date || document.date_creation).toLocaleDateString('fr-FR')}
//             </span>
//           </div>
//           <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
//             <span className="text-gray-700 font-semibold">Total</span>
//             <span className="font-bold text-teal-600">{montant.toLocaleString('fr-FR')} FCFA</span>
//           </div>
//         </div>

//         {/* Zone signature */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <label className="text-xs font-semibold text-gray-700">Signature du responsable</label>
//             <button onClick={clearSignature} className="text-xs text-red-500 hover:underline">Effacer</button>
//           </div>
//           <canvas
//             ref={canvasRef}
//             width={460}
//             height={120}
//             className="border-2 border-dashed border-gray-300 rounded-lg w-full touch-none bg-white"
//           />
//           <p className="text-xs text-gray-400 mt-1">Signez dans le cadre ci-dessus</p>
//         </div>

//         {/* Boutons */}
//         <div className="flex gap-3 pt-1">
//           <button onClick={onClose}
//             className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
//             Fermer
//           </button>
//           <button onClick={generatePDF}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//             </svg>
//             Télécharger PDF
//           </button>
//         </div>
//       </div>
//     </Modal>
//   )
// }

// import { useRef, useEffect, useState } from 'react'
// import SignaturePad from 'signature_pad'
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
// import Modal from './Modal'
// import { FACTURE_STATUS, FACTURE_STATUS_META, normalizeFactureStatus } from '../lib/statuses'

// export default function PreviewPDFModal({ isOpen, onClose, document, type, patientName, onStatusChange }) {
//   const canvasRef = useRef(null)
//   const sigPadRef = useRef(null)
//   const [signed, setSigned] = useState(false)
//   const [statut, setStatut] = useState('')
//   const [saving, setSaving] = useState(false)

//   // Sync statut local quand le document change
//   useEffect(() => {
//     if (document && document.statut) {
//       setStatut(normalizeFactureStatus(document.statut))
//     }
//   }, [document])

//   useEffect(() => {
//     if (isOpen && canvasRef.current) {
//       sigPadRef.current = new SignaturePad(canvasRef.current, {
//         backgroundColor: 'rgb(255,255,255)',
//         penColor: 'rgb(0,0,0)',
//       })
//       sigPadRef.current.addEventListener('endStroke', () => setSigned(true))
//     }
//     return () => { 
//       if (sigPadRef.current) {
//         sigPadRef.current.off()
//       }
//     }
//   }, [isOpen])

//   const clearSignature = () => { 
//     sigPadRef.current?.clear() 
//     setSigned(false) 
//   }

//   const handleStatusChange = async (newStatut) => {
//     if (!onStatusChange || newStatut === statut) return
//     setSaving(true)
//     try {
//       await onStatusChange(document.id, newStatut)
//       setStatut(newStatut)
//     } catch (error) {
//       console.error('Erreur changement statut:', error)
//     } finally { 
//       setSaving(false) 
//     }
//   }

//   // Fonction pour formater le numéro de document
//   const getDocumentNumber = () => {
//     if (document.numero) return document.numero
//     if (document.id) {
//       // Convertir l'UUID en chaîne et prendre les 8 premiers caractères
//       const idStr = String(document.id)
//       return idStr.slice(0, 8).toUpperCase()
//     }
//     return '—'
//   }

//   const generatePDF = () => {
//     if (!document) {
//       console.error('Aucun document à générer')
//       return
//     }
    
//     const doc = new jsPDF()
//     const isFacture = type === 'facture'
//     const color = [13, 148, 136]

//     // Bandeau en-tête
//     doc.setFillColor(...color)
//     doc.rect(0, 0, 210, 28, 'F')
//     doc.setTextColor(255, 255, 255)
//     doc.setFontSize(18)
//     doc.setFont('helvetica', 'bold')
//     doc.text('Cabinet Dentaire SMILE', 14, 12)
//     doc.setFontSize(9)
//     doc.setFont('helvetica', 'normal')
//     doc.text('Immeuble Quiffererou Tamdja, Bafoussam, Cameroun', 14, 20)

//     // Titre + numéro
//     doc.setFontSize(16)
//     doc.setFont('helvetica', 'bold')
//     doc.text(isFacture ? 'FACTURE' : 'DEVIS', 196, 12, { align: 'right' })
//     doc.setFontSize(10)
//     doc.setFont('helvetica', 'normal')
//     doc.text(`N° ${getDocumentNumber()}`, 196, 20, { align: 'right' })

//     // Date de facturation
//     doc.setTextColor(50, 50, 50)
//     doc.setFontSize(10)
//     const dateLabel = isFacture ? 'Date de facturation' : 'Date de création'
    
//     let dateFormatted = new Date().toLocaleDateString('fr-FR')
//     const dateValue = document.date || document.date_creation || document.created_at
    
//     if (dateValue) {
//       try {
//         const dateObj = new Date(dateValue)
//         if (!isNaN(dateObj.getTime())) {
//           dateFormatted = dateObj.toLocaleDateString('fr-FR')
//         }
//       } catch (e) {
//         console.warn('Erreur formatage date:', e)
//       }
//     }
    
//     doc.text(`${dateLabel} : ${dateFormatted}`, 14, 38)

//     // Statut pour facture
//     if (isFacture) {
//       const statutNorm = normalizeFactureStatus(statut || document.statut)
//       const statutMeta = FACTURE_STATUS_META[statutNorm]
//       const statutLabel = statutMeta?.label || statutNorm

//       const statutColors = {
//         [FACTURE_STATUS.PAYE]: [22, 163, 74],
//         [FACTURE_STATUS.ATTENTE]: [217, 119, 6],
//         [FACTURE_STATUS.ANNULE]: [220, 38, 38],
//       }
//       const sc = statutColors[statutNorm] || [100, 100, 100]
//       doc.setFillColor(...sc)
//       doc.roundedRect(130, 33, 66, 8, 2, 2, 'F')
//       doc.setTextColor(255, 255, 255)
//       doc.setFont('helvetica', 'bold')
//       doc.setFontSize(9)
//       doc.text(`Statut : ${statutLabel}`, 163, 38.5, { align: 'center' })
//     }

//     // Bloc Patient
//     doc.setFillColor(241, 245, 249)
//     doc.rect(14, 48, 88, 22, 'F')
//     doc.setTextColor(100, 100, 100)
//     doc.setFont('helvetica', 'bold')
//     doc.setFontSize(8)
//     doc.text('PATIENT', 18, 54)
//     doc.setFont('helvetica', 'normal')
//     doc.setFontSize(11)
//     doc.setTextColor(15, 23, 42)
//     doc.text(patientName || '—', 18, 63)

//     // Bloc Acte
//     if (isFacture && document.acte) {
//       doc.setFillColor(240, 253, 250)
//       doc.rect(108, 48, 88, 22, 'F')
//       doc.setTextColor(100, 100, 100)
//       doc.setFont('helvetica', 'bold')
//       doc.setFontSize(8)
//       doc.text('ACTE DENTAIRE', 112, 54)
//       doc.setFont('helvetica', 'normal')
//       doc.setFontSize(11)
//       doc.setTextColor(13, 148, 136)
//       const acteText = doc.splitTextToSize(document.acte, 80)
//       doc.text(acteText, 112, 63)
//     }

//     // Calcul du montant
//     const montantTotal = Number(document.montant || 0)
//     const prixUnitaire = montantTotal
//     const quantite = 1

//     // Tableau
//     const rows = isFacture
//       ? [[
//           document.acte || '—', 
//           quantite,
//           `${prixUnitaire.toLocaleString('fr-FR')} FCFA`,
//           `${montantTotal.toLocaleString('fr-FR')} FCFA`
//         ]]
//       : (document.lignes || []).map(l => [
//           l.description || l.acte || '—', 
//           l.quantite ?? 1,
//           `${Number(l.prix_unitaire || 0).toLocaleString('fr-FR')} FCFA`,
//           `${(Number(l.prix_unitaire || 0) * Number(l.quantite || 1)).toLocaleString('fr-FR')} FCFA`,
//         ])

//     autoTable(doc, {
//       startY: 76,
//       head: [['Description / Acte', 'Qté', 'Prix unitaire', 'Total']],
//       body: rows.length > 0 ? rows : [['Aucun acte renseigné', '', '', '']],
//       headStyles: { fillColor: color, textColor: 255, fontStyle: 'bold', fontSize: 10 },
//       alternateRowStyles: { fillColor: [245, 250, 250] },
//       styles: { fontSize: 10, cellPadding: 4 },
//       columnStyles: { 0: { cellWidth: 90 }, 3: { halign: 'right', fontStyle: 'bold' } },
//     })

//     // Total
//     const finalY = doc.lastAutoTable.finalY + 6
//     const montant = montantTotal

//     doc.setFillColor(...color)
//     doc.rect(130, finalY, 66, 10, 'F')
//     doc.setTextColor(255, 255, 255)
//     doc.setFont('helvetica', 'bold')
//     doc.setFontSize(11)
//     doc.text('TOTAL :', 134, finalY + 7)
//     doc.text(`${montant.toLocaleString('fr-FR')} FCFA`, 194, finalY + 7, { align: 'right' })

//     // Signature
//     if (signed && sigPadRef.current && !sigPadRef.current.isEmpty()) {
//       const sigY = finalY + 22
//       doc.setTextColor(50, 50, 50)
//       doc.setFont('helvetica', 'bold')
//       doc.setFontSize(10)
//       doc.text('Signature du responsable :', 14, sigY)
//       doc.setDrawColor(...color)
//       doc.rect(14, sigY + 4, 80, 28)
//       const sigData = sigPadRef.current.toDataURL('image/png')
//       if (sigData) {
//         doc.addImage(sigData, 'PNG', 15, sigY + 5, 78, 26)
//       }
//     }

//     // Pied de page
//     doc.setTextColor(180, 180, 180)
//     doc.setFontSize(8)
//     doc.setFont('helvetica', 'normal')
//     doc.text('Document généré par SMILE — Système de gestion du Cabinet Dentaire', 105, 285, { align: 'center' })

//     const filename = `${isFacture ? 'Facture' : 'Devis'}_${patientName?.replace(/\s+/g, '_') || 'patient'}_${new Date().toISOString().split('T')[0]}.pdf`
//     doc.save(filename)
//   }

//   if (!document) return null

//   const montant = type === 'facture' ? Number(document.montant || 0) : Number(document.montant_total || 0)
//   const statutNorm = normalizeFactureStatus(statut || document.statut)

//   const statutBtnCls = {
//     [FACTURE_STATUS.PAYE]: 'bg-green-100 text-green-700 ring-green-300',
//     [FACTURE_STATUS.ATTENTE]: 'bg-amber-100 text-amber-700 ring-amber-300',
//     [FACTURE_STATUS.ANNULE]: 'bg-red-100 text-red-600 ring-red-300',
//   }

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}
//       title={`${type === 'facture' ? 'Facture' : 'Devis'} — ${patientName || ''}`}>
//       <div className="space-y-4 max-w-lg">

//         {/* Résumé */}
//         <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 border border-gray-100">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500">Patient</span>
//             <span className="font-semibold text-gray-800">{patientName || '—'}</span>
//           </div>
//           {type === 'facture' && (
//             <div className="flex justify-between items-start">
//               <span className="text-gray-500">Acte dentaire</span>
//               <span className="font-medium text-teal-700 text-right max-w-[60%]">{document.acte || '—'}</span>
//             </div>
//           )}
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500">N°</span>
//             <span className="font-medium text-gray-700 font-mono text-xs">
//               {getDocumentNumber()}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500">Date</span>
//             <span className="font-medium text-gray-700">
//               {(() => {
//                 const dateValue = document.date || document.date_creation || document.created_at
//                 if (dateValue) {
//                   try {
//                     const dateObj = new Date(dateValue)
//                     if (!isNaN(dateObj.getTime())) {
//                       return dateObj.toLocaleDateString('fr-FR')
//                     }
//                   } catch (e) {}
//                 }
//                 return new Date().toLocaleDateString('fr-FR')
//               })()}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500">Prix unitaire</span>
//             <span className="font-medium text-gray-700">{montant.toLocaleString('fr-FR')} FCFA</span>
//           </div>
//           <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
//             <span className="font-semibold text-gray-700">Total</span>
//             <span className="font-bold text-teal-600 text-base">{montant.toLocaleString('fr-FR')} FCFA</span>
//           </div>
//         </div>

//         {/* Changement de statut */}
//         {type === 'facture' && (
//           <div>
//             <p className="text-xs font-semibold text-gray-700 mb-2">Statut de la facture</p>
//             <div className="flex gap-2">
//               {[
//                 { key: FACTURE_STATUS.ATTENTE, label: 'En attente' },
//                 { key: FACTURE_STATUS.PAYE, label: 'Payée' },
//                 { key: FACTURE_STATUS.ANNULE, label: 'Annulée' },
//               ].map(s => (
//                 <button
//                   key={s.key}
//                   disabled={saving}
//                   onClick={() => handleStatusChange(s.key)}
//                   className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ring-1 ring-transparent
//                     ${statutNorm === s.key
//                       ? `${statutBtnCls[s.key]} ring-2`
//                       : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
//                     } disabled:opacity-50`}
//                 >
//                   {saving && statutNorm !== s.key ? '…' : s.label}
//                 </button>
//               ))}
//             </div>
//             <p className="text-xs text-gray-400 mt-1.5">
//               Le changement est enregistré immédiatement et reflété dans le PDF.
//             </p>
//           </div>
//         )}

//         {/* Zone signature */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <label className="text-xs font-semibold text-gray-700">Signature du responsable <span className="font-normal text-gray-400">(optionnelle)</span></label>
//             <button onClick={clearSignature} className="text-xs text-red-500 hover:underline">Effacer</button>
//           </div>
//           <canvas
//             ref={canvasRef}
//             width={460}
//             height={110}
//             className="border-2 border-dashed border-gray-300 rounded-lg w-full touch-none bg-white"
//           />
//           <p className="text-xs text-gray-400 mt-1">Signez dans le cadre ci-dessus</p>
//         </div>

//         {/* Boutons */}
//         <div className="flex gap-3 pt-1">
//           <button onClick={onClose}
//             className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
//             Fermer
//           </button>
//           <button onClick={generatePDF}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//             </svg>
//             Télécharger PDF
//           </button>
//         </div>
//       </div>
//     </Modal>
//   )
// }

// import { useRef, useEffect, useState } from 'react'
// import SignaturePad from 'signature_pad'
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
// import Modal from './Modal'
// import { FACTURE_STATUS, FACTURE_STATUS_META, normalizeFactureStatus } from '../lib/statuses'

// export default function PreviewPDFModal({ isOpen, onClose, document, type, patientName, onStatusChange }) {
//   const canvasRef = useRef(null)
//   const sigPadRef = useRef(null)
//   const [signed, setSigned] = useState(false)
//   const [statut, setStatut] = useState('')
//   const [saving, setSaving] = useState(false)

//   // Sync statut local quand le document change
//   useEffect(() => {
//     if (document && document.statut) {
//       setStatut(normalizeFactureStatus(document.statut))
//     }
//   }, [document])

//   useEffect(() => {
//     if (isOpen && canvasRef.current) {
//       sigPadRef.current = new SignaturePad(canvasRef.current, {
//         backgroundColor: 'rgb(255,255,255)',
//         penColor: 'rgb(0,0,0)',
//       })
//       sigPadRef.current.addEventListener('endStroke', () => setSigned(true))
//     }
//     return () => { 
//       if (sigPadRef.current) {
//         sigPadRef.current.off()
//       }
//     }
//   }, [isOpen])

//   const clearSignature = () => { 
//     sigPadRef.current?.clear() 
//     setSigned(false) 
//   }

//   const handleStatusChange = async (newStatut) => {
//     if (!onStatusChange || newStatut === statut) return
//     setSaving(true)
//     try {
//       await onStatusChange(document.id, newStatut)
//       setStatut(newStatut)
//     } catch (error) {
//       console.error('Erreur changement statut:', error)
//     } finally { 
//       setSaving(false) 
//     }
//   }

//   // Fonction pour formater le numéro de document
//   const getDocumentNumber = () => {
//     if (document.numero) return document.numero
//     if (document.id) {
//       const idStr = String(document.id)
//       return idStr.slice(0, 8).toUpperCase()
//     }
//     return '—'
//   }

//   // Fonction pour récupérer le montant
//   const getMontant = () => {
//     if (type === 'facture') {
//       return Number(document.montant) || 0
//     } else {
//       return Number(document.montant_total) || 0
//     }
//   }

//   // Fonction pour récupérer l'acte
//   const getActe = () => {
//     return document.acte || document.description || 'Acte dentaire'
//   }

//   // Fonction pour récupérer la date
//   const getDateFormatted = () => {
//     const dateValue = document.date || document.date_creation || document.created_at
//     if (dateValue) {
//       try {
//         const dateObj = new Date(dateValue)
//         if (!isNaN(dateObj.getTime())) {
//           return dateObj.toLocaleDateString('fr-FR')
//         }
//       } catch (e) {}
//     }
//     return new Date().toLocaleDateString('fr-FR')
//   }

//   const generatePDF = () => {
//     if (!document) {
//       console.error('Aucun document à générer')
//       return
//     }
    
//     const doc = new jsPDF()
//     const isFacture = type === 'facture'
//     const color = [13, 148, 136]
//     const montantTotal = getMontant()
//     const acte = getActe()

//     console.log('Génération PDF - Montant:', montantTotal, 'Acte:', acte)

//     // Bandeau en-tête
//     doc.setFillColor(...color)
//     doc.rect(0, 0, 210, 28, 'F')
//     doc.setTextColor(255, 255, 255)
//     doc.setFontSize(18)
//     doc.setFont('helvetica', 'bold')
//     doc.text('Cabinet Dentaire SMILE', 14, 12)
//     doc.setFontSize(9)
//     doc.setFont('helvetica', 'normal')
//     doc.text('Immeuble Quiffererou Tamdja, Bafoussam, Cameroun', 14, 20)

//     // Titre + numéro
//     doc.setFontSize(16)
//     doc.setFont('helvetica', 'bold')
//     doc.text(isFacture ? 'FACTURE' : 'DEVIS', 196, 12, { align: 'right' })
//     doc.setFontSize(10)
//     doc.setFont('helvetica', 'normal')
//     doc.text(`N° ${getDocumentNumber()}`, 196, 20, { align: 'right' })

//     // Date de facturation
//     doc.setTextColor(50, 50, 50)
//     doc.setFontSize(10)
//     const dateLabel = isFacture ? 'Date de facturation' : 'Date de création'
//     doc.text(`${dateLabel} : ${getDateFormatted()}`, 14, 38)

//     // Statut pour facture
//     if (isFacture) {
//       const statutNorm = normalizeFactureStatus(statut || document.statut)
//       const statutMeta = FACTURE_STATUS_META[statutNorm]
//       const statutLabel = statutMeta?.label || statutNorm

//       const statutColors = {
//         [FACTURE_STATUS.PAYE]: [22, 163, 74],
//         [FACTURE_STATUS.ATTENTE]: [217, 119, 6],
//         [FACTURE_STATUS.ANNULE]: [220, 38, 38],
//       }
//       const sc = statutColors[statutNorm] || [100, 100, 100]
//       doc.setFillColor(...sc)
//       doc.roundedRect(130, 33, 66, 8, 2, 2, 'F')
//       doc.setTextColor(255, 255, 255)
//       doc.setFont('helvetica', 'bold')
//       doc.setFontSize(9)
//       doc.text(`Statut : ${statutLabel}`, 163, 38.5, { align: 'center' })
//     }

//     // Bloc Patient
//     doc.setFillColor(241, 245, 249)
//     doc.rect(14, 48, 88, 22, 'F')
//     doc.setTextColor(100, 100, 100)
//     doc.setFont('helvetica', 'bold')
//     doc.setFontSize(8)
//     doc.text('PATIENT', 18, 54)
//     doc.setFont('helvetica', 'normal')
//     doc.setFontSize(11)
//     doc.setTextColor(15, 23, 42)
//     doc.text(patientName || '—', 18, 63)

//     // Bloc Acte
//     if (isFacture && acte) {
//       doc.setFillColor(240, 253, 250)
//       doc.rect(108, 48, 88, 22, 'F')
//       doc.setTextColor(100, 100, 100)
//       doc.setFont('helvetica', 'bold')
//       doc.setFontSize(8)
//       doc.text('ACTE DENTAIRE', 112, 54)
//       doc.setFont('helvetica', 'normal')
//       doc.setFontSize(11)
//       doc.setTextColor(13, 148, 136)
//       const acteText = doc.splitTextToSize(acte, 80)
//       doc.text(acteText, 112, 63)
//     }

//     // Tableau
//     const rows = isFacture
//       ? [[
//           acte, 
//           1,
//           `${montantTotal.toLocaleString('fr-FR')} FCFA`,
//           `${montantTotal.toLocaleString('fr-FR')} FCFA`
//         ]]
//       : (document.lignes || []).map(l => [
//           l.description || l.acte || '—', 
//           l.quantite ?? 1,
//           `${Number(l.prix_unitaire || 0).toLocaleString('fr-FR')} FCFA`,
//           `${(Number(l.prix_unitaire || 0) * Number(l.quantite || 1)).toLocaleString('fr-FR')} FCFA`,
//         ])

//     autoTable(doc, {
//       startY: 76,
//       head: [['Description / Acte', 'Qté', 'Prix unitaire', 'Total']],
//       body: rows.length > 0 ? rows : [['Aucun acte renseigné', '', '', '']],
//       headStyles: { fillColor: color, textColor: 255, fontStyle: 'bold', fontSize: 10 },
//       alternateRowStyles: { fillColor: [245, 250, 250] },
//       styles: { fontSize: 10, cellPadding: 4 },
//       columnStyles: { 0: { cellWidth: 90 }, 3: { halign: 'right', fontStyle: 'bold' } },
//     })

//     // Total
//     const finalY = doc.lastAutoTable.finalY + 6

//     doc.setFillColor(...color)
//     doc.rect(130, finalY, 66, 10, 'F')
//     doc.setTextColor(255, 255, 255)
//     doc.setFont('helvetica', 'bold')
//     doc.setFontSize(11)
//     doc.text('TOTAL :', 134, finalY + 7)
//     doc.text(`${montantTotal.toLocaleString('fr-FR')} FCFA`, 194, finalY + 7, { align: 'right' })

//     // Signature
//     if (signed && sigPadRef.current && !sigPadRef.current.isEmpty()) {
//       const sigY = finalY + 22
//       doc.setTextColor(50, 50, 50)
//       doc.setFont('helvetica', 'bold')
//       doc.setFontSize(10)
//       doc.text('Signature du responsable :', 14, sigY)
//       doc.setDrawColor(...color)
//       doc.rect(14, sigY + 4, 80, 28)
//       const sigData = sigPadRef.current.toDataURL('image/png')
//       if (sigData) {
//         doc.addImage(sigData, 'PNG', 15, sigY + 5, 78, 26)
//       }
//     }

//     // Pied de page
//     doc.setTextColor(180, 180, 180)
//     doc.setFontSize(8)
//     doc.setFont('helvetica', 'normal')
//     doc.text('Document généré par SMILE — Système de gestion du Cabinet Dentaire', 105, 285, { align: 'center' })

//     const filename = `${isFacture ? 'Facture' : 'Devis'}_${patientName?.replace(/\s+/g, '_') || 'patient'}_${new Date().toISOString().split('T')[0]}.pdf`
//     doc.save(filename)
//   }

//   if (!document) return null

//   const montantTotal = getMontant()
//   const statutNorm = normalizeFactureStatus(statut || document.statut)

//   const statutBtnCls = {
//     [FACTURE_STATUS.PAYE]: 'bg-green-100 text-green-700 ring-green-300',
//     [FACTURE_STATUS.ATTENTE]: 'bg-amber-100 text-amber-700 ring-amber-300',
//     [FACTURE_STATUS.ANNULE]: 'bg-red-100 text-red-600 ring-red-300',
//   }

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}
//       title={`${type === 'facture' ? 'Facture' : 'Devis'} — ${patientName || ''}`}>
//       <div className="space-y-4 max-w-lg">

//         {/* Résumé */}
//         <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 border border-gray-100">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500">Patient</span>
//             <span className="font-semibold text-gray-800">{patientName || '—'}</span>
//           </div>
//           {type === 'facture' && (
//             <div className="flex justify-between items-start">
//               <span className="text-gray-500">Acte dentaire</span>
//               <span className="font-medium text-teal-700 text-right max-w-[60%]">{getActe()}</span>
//             </div>
//           )}
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500">N°</span>
//             <span className="font-medium text-gray-700 font-mono text-xs">
//               {getDocumentNumber()}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500">Date</span>
//             <span className="font-medium text-gray-700">{getDateFormatted()}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500">Prix unitaire</span>
//             <span className="font-medium text-gray-700">{montantTotal.toLocaleString('fr-FR')} FCFA</span>
//           </div>
//           <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
//             <span className="font-semibold text-gray-700">Total</span>
//             <span className="font-bold text-teal-600 text-base">{montantTotal.toLocaleString('fr-FR')} FCFA</span>
//           </div>
//         </div>

//         {/* Changement de statut */}
//         {type === 'facture' && (
//           <div>
//             <p className="text-xs font-semibold text-gray-700 mb-2">Statut de la facture</p>
//             <div className="flex gap-2">
//               {[
//                 { key: FACTURE_STATUS.ATTENTE, label: 'En attente' },
//                 { key: FACTURE_STATUS.PAYE, label: 'Payée' },
//                 { key: FACTURE_STATUS.ANNULE, label: 'Annulée' },
//               ].map(s => (
//                 <button
//                   key={s.key}
//                   disabled={saving}
//                   onClick={() => handleStatusChange(s.key)}
//                   className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ring-1 ring-transparent
//                     ${statutNorm === s.key
//                       ? `${statutBtnCls[s.key]} ring-2`
//                       : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
//                     } disabled:opacity-50`}
//                 >
//                   {saving && statutNorm !== s.key ? '…' : s.label}
//                 </button>
//               ))}
//             </div>
//             <p className="text-xs text-gray-400 mt-1.5">
//               Le changement est enregistré immédiatement et reflété dans le PDF.
//             </p>
//           </div>
//         )}

//         {/* Zone signature */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <label className="text-xs font-semibold text-gray-700">Signature du responsable <span className="font-normal text-gray-400">(optionnelle)</span></label>
//             <button onClick={clearSignature} className="text-xs text-red-500 hover:underline">Effacer</button>
//           </div>
//           <canvas
//             ref={canvasRef}
//             width={460}
//             height={110}
//             className="border-2 border-dashed border-gray-300 rounded-lg w-full touch-none bg-white"
//           />
//           <p className="text-xs text-gray-400 mt-1">Signez dans le cadre ci-dessus</p>
//         </div>

//         {/* Boutons */}
//         <div className="flex gap-3 pt-1">
//           <button onClick={onClose}
//             className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
//             Fermer
//           </button>
//           <button onClick={generatePDF}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//             </svg>
//             Télécharger PDF
//           </button>
//         </div>
//       </div>
//     </Modal>
//   )
// }

import { useRef, useEffect, useState } from 'react'
import SignaturePad from 'signature_pad'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Modal from './Modal'
import { FACTURE_STATUS, FACTURE_STATUS_META, normalizeFactureStatus } from '../lib/statuses'

export default function PreviewPDFModal({ isOpen, onClose, document, type, patientName, onStatusChange }) {
  const canvasRef = useRef(null)
  const sigPadRef = useRef(null)
  const [signed, setSigned] = useState(false)
  const [statut, setStatut] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (document && document.statut) {
      setStatut(normalizeFactureStatus(document.statut))
    }
  }, [document])

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      sigPadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255,255,255)',
        penColor: 'rgb(0,0,0)',
      })
      sigPadRef.current.addEventListener('endStroke', () => setSigned(true))
    }
    return () => { 
      if (sigPadRef.current) {
        sigPadRef.current.off()
      }
    }
  }, [isOpen])

  const clearSignature = () => { 
    sigPadRef.current?.clear() 
    setSigned(false) 
  }

  const handleStatusChange = async (newStatut) => {
    if (!onStatusChange || newStatut === statut) return
    setSaving(true)
    try {
      await onStatusChange(document.id, newStatut)
      setStatut(newStatut)
    } catch (error) {
      console.error('Erreur changement statut:', error)
    } finally { 
      setSaving(false) 
    }
  }

  // Fonction pour formater les nombres SANS caractères spéciaux
  const formatMontant = (montant) => {
    if (!montant && montant !== 0) return '0 FCFA'
    const nombre = Number(montant)
    if (isNaN(nombre)) return '0 FCFA'
    // Formatage sans espace insécable, juste le nombre
    return nombre.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' FCFA'
  }

  // Formater le nombre simple (sans FCFA)
  const formatNombre = (montant) => {
    if (!montant && montant !== 0) return '0'
    const nombre = Number(montant)
    if (isNaN(nombre)) return '0'
    return nombre.toLocaleString('fr-FR').replace(/\s/g, ' ')
  }

  // Nettoyer les caractères spéciaux
  const cleanText = (text) => {
    if (!text) return ''
    return String(text)
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/[^\x20-\x7E\u00C0-\u00FF]/g, ' ')
      .trim()
  }

  // Formater le numéro de document
  const getDocumentNumber = () => {
    if (document.numero) return cleanText(document.numero)
    if (document.id) {
      const idStr = String(document.id)
      return idStr.slice(0, 8).toUpperCase()
    }
    return '—'
  }

  // Récupérer le montant
  const getMontant = () => {
    const montant = type === 'facture' 
      ? Number(document.montant) 
      : Number(document.montant_total)
    return isNaN(montant) ? 0 : montant
  }

  // Récupérer l'acte
  const getActe = () => {
    return cleanText(document.acte || document.description || 'Acte dentaire')
  }

  // Récupérer la date formatée
  const getDateFormatted = () => {
    const dateValue = document.date || document.date_creation || document.created_at
    if (dateValue) {
      try {
        const dateObj = new Date(dateValue)
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleDateString('fr-FR')
        }
      } catch (e) {}
    }
    return new Date().toLocaleDateString('fr-FR')
  }

  const generatePDF = () => {
    if (!document) {
      console.error('Aucun document à générer')
      return
    }
    
    const doc = new jsPDF()
    const isFacture = type === 'facture'
    const color = [13, 148, 136]
    const montantTotal = getMontant()
    const acte = getActe()
    const numero = getDocumentNumber()

    // Bandeau en-tête
    doc.setFillColor(...color)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Cabinet Dentaire SMILE', 14, 12)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Immeuble Quiffererou Tamdja, Bafoussam, Cameroun', 14, 20)

    // Titre + numéro
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(isFacture ? 'FACTURE' : 'DEVIS', 196, 12, { align: 'right' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° ${numero}`, 196, 20, { align: 'right' })

    // Date
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    const dateLabel = isFacture ? 'Date de facturation' : 'Date de création'
    doc.text(`${dateLabel} : ${getDateFormatted()}`, 14, 38)

    // Statut
    if (isFacture) {
      const statutNorm = normalizeFactureStatus(statut || document.statut)
      const statutMeta = FACTURE_STATUS_META[statutNorm]
      const statutLabel = statutMeta?.label || statutNorm

      const statutColors = {
        [FACTURE_STATUS.PAYE]: [22, 163, 74],
        [FACTURE_STATUS.ATTENTE]: [217, 119, 6],
        [FACTURE_STATUS.ANNULE]: [220, 38, 38],
      }
      const sc = statutColors[statutNorm] || [100, 100, 100]
      doc.setFillColor(...sc)
      doc.roundedRect(130, 33, 66, 8, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(`Statut : ${statutLabel}`, 163, 38.5, { align: 'center' })
    }

    // Bloc Patient
    doc.setFillColor(241, 245, 249)
    doc.rect(14, 48, 88, 22, 'F')
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('PATIENT', 18, 54)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    const patient = cleanText(patientName || '—')
    doc.text(patient, 18, 63)

    // Bloc Acte
    if (isFacture && acte) {
      doc.setFillColor(240, 253, 250)
      doc.rect(108, 48, 88, 22, 'F')
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text('ACTE DENTAIRE', 112, 54)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(13, 148, 136)
      const acteText = doc.splitTextToSize(acte, 80)
      doc.text(acteText, 112, 63)
    }

    // Tableau - Utilisation de formatNombre pour éviter les caractères spéciaux
    const rows = isFacture
      ? [[
          acte, 
          1,
          `${formatNombre(montantTotal)} FCFA`,
          `${formatNombre(montantTotal)} FCFA`
        ]]
      : (document.lignes || []).map(l => [
          cleanText(l.description || l.acte || '—'), 
          l.quantite ?? 1,
          `${formatNombre(l.prix_unitaire || 0)} FCFA`,
          `${formatNombre((l.prix_unitaire || 0) * (l.quantite || 1))} FCFA`,
        ])

    autoTable(doc, {
      startY: 76,
      head: [['Description / Acte', 'Qté', 'Prix unitaire', 'Total']],
      body: rows.length > 0 ? rows : [['Aucun acte renseigné', '', '', '']],
      headStyles: { fillColor: color, textColor: 255, fontStyle: 'bold', fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 250, 250] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 90 }, 3: { halign: 'right', fontStyle: 'bold' } },
    })

    // Total
    const finalY = doc.lastAutoTable.finalY + 6
    doc.setFillColor(...color)
    doc.rect(130, finalY, 66, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOTAL :', 134, finalY + 7)
    doc.text(`${formatNombre(montantTotal)} FCFA`, 194, finalY + 7, { align: 'right' })

    // Signature
    if (signed && sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const sigY = finalY + 22
      doc.setTextColor(50, 50, 50)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('Signature du responsable :', 14, sigY)
      doc.setDrawColor(...color)
      doc.rect(14, sigY + 4, 80, 28)
      const sigData = sigPadRef.current.toDataURL('image/png')
      if (sigData) {
        doc.addImage(sigData, 'PNG', 15, sigY + 5, 78, 26)
      }
    }

    // Pied de page
    doc.setTextColor(180, 180, 180)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Document généré par SMILE — Système de gestion du Cabinet Dentaire', 105, 285, { align: 'center' })

    const filename = `${isFacture ? 'Facture' : 'Devis'}_${patient.replace(/\s+/g, '_') || 'patient'}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  }

  if (!document) return null

  const montantTotal = getMontant()
  const statutNorm = normalizeFactureStatus(statut || document.statut)

  const statutBtnCls = {
    [FACTURE_STATUS.PAYE]: 'bg-green-100 text-green-700 ring-green-300',
    [FACTURE_STATUS.ATTENTE]: 'bg-amber-100 text-amber-700 ring-amber-300',
    [FACTURE_STATUS.ANNULE]: 'bg-red-100 text-red-600 ring-red-300',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={`${type === 'facture' ? 'Facture' : 'Devis'} — ${cleanText(patientName || '')}`}>
      <div className="space-y-4 max-w-lg">

        {/* Résumé */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Patient</span>
            <span className="font-semibold text-gray-800">{cleanText(patientName || '—')}</span>
          </div>
          {type === 'facture' && (
            <div className="flex justify-between items-start">
              <span className="text-gray-500">Acte dentaire</span>
              <span className="font-medium text-teal-700 text-right max-w-[60%]">{getActe()}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-500">N°</span>
            <span className="font-medium text-gray-700 font-mono text-xs">{getDocumentNumber()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-700">{getDateFormatted()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Prix unitaire</span>
            <span className="font-medium text-gray-700">{formatMontant(montantTotal)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-teal-600 text-base">{formatMontant(montantTotal)}</span>
          </div>
        </div>

        {/* Changement de statut */}
        {type === 'facture' && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Statut de la facture</p>
            <div className="flex gap-2">
              {[
                { key: FACTURE_STATUS.ATTENTE, label: 'En attente' },
                { key: FACTURE_STATUS.PAYE, label: 'Payée' },
                { key: FACTURE_STATUS.ANNULE, label: 'Annulée' },
              ].map(s => (
                <button
                  key={s.key}
                  disabled={saving}
                  onClick={() => handleStatusChange(s.key)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ring-1 ring-transparent
                    ${statutNorm === s.key
                      ? `${statutBtnCls[s.key]} ring-2`
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    } disabled:opacity-50`}
                >
                  {saving && statutNorm !== s.key ? '…' : s.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Le changement est enregistré immédiatement et reflété dans le PDF.
            </p>
          </div>
        )}

        {/* Zone signature */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-700">Signature du responsable <span className="font-normal text-gray-400">(optionnelle)</span></label>
            <button onClick={clearSignature} className="text-xs text-red-500 hover:underline">Effacer</button>
          </div>
          <canvas
            ref={canvasRef}
            width={460}
            height={110}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger PDF
          </button>
        </div>
      </div>
    </Modal>
  )
}
