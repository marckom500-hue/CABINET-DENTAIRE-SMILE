// // ─────────────────────────────────────────────────────────────────────────────
// // FichePatient.jsx
// //
// // UTILISATION dans ton router (ex: react-router-dom v6) :
// //   <Route path="/patients/:id" element={<FichePatient />} />
// //
// // Dans Patients.jsx, remplace openMedicalRecord par :
// //   import { useNavigate } from 'react-router-dom'
// //   const navigate = useNavigate()
// //   <button onClick={() => navigate(`/patients/${p.id}`)}>...</button>
// // ─────────────────────────────────────────────────────────────────────────────
 
// import { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { supabase } from '../lib/supabase'   // adapte ce chemin
// import { useAntecedents } from '../hooks/useAntecedents'
// import { useTraitements }  from '../hooks/useTraitements'
// import { useAllergies }    from '../hooks/useAllergies'
// import { formatPhone }     from '../utils/phone'
// import { usePatientData } from '../hooks/usePatientData'
 
// // ── Couleurs gravité / statut (reprises de MedicalRecord) ─────────────────
// const GRAVITE_COLORS = {
//   normal:    'bg-blue-50  text-blue-700  border-blue-200',
//   important: 'bg-amber-50 text-amber-700 border-amber-200',
//   grave:     'bg-red-50   text-red-700   border-red-200',
//   critique:  'bg-red-100  text-red-800   border-red-300',
// }
// const STATUT_TRT_COLORS = {
//   en_cours: 'bg-blue-50  text-blue-700',
//   termine:  'bg-green-50 text-green-700',
//   suspendu: 'bg-amber-50 text-amber-700',
//   annule:   'bg-red-50   text-red-700',
// }
// const STATUT_FACTURE_COLORS = {
//   payee:     'bg-green-100 text-green-700',
//   partielle: 'bg-amber-100 text-amber-700',
//   impayee:   'bg-red-100   text-red-700',
// }
// const STATUT_RDV_COLORS = {
//   confirme:   'bg-teal-100  text-teal-700',
//   en_attente: 'bg-amber-100 text-amber-700',
//   termine:    'bg-gray-100  text-gray-600',
//   annule:     'bg-red-100   text-red-500',
//   no_show:    'bg-red-200   text-red-700',
// }
 
// // ── Hook : charger un patient par ID ──────────────────────────────────────
// function usePatient(id) {
//   const [patient, setPatient] = useState(null)
//   const [loading, setLoading] = useState(true)
 
//   useEffect(() => {
//     if (!id) return
//     supabase
//       .from('patients')
//       .select('*')
//       .eq('id', id)
//       .single()
//       .then(({ data }) => { setPatient(data); setLoading(false) })
//   }, [id])
 
//   return { patient, loading }
// }
 
// // ── Hook : ordonnances du patient ─────────────────────────────────────────
// function useOrdonnances(patientId) {
//   const [ordonnances, setOrdonnances] = useState([])
//   const [loading, setLoading] = useState(true)
 
//   useEffect(() => {
//     if (!patientId) return
//     supabase
//       .from('ordonnances')
//       .select('*, medecin:users(prenom, nom)')
//       .eq('patient_id', patientId)
//       .order('created_at', { ascending: false })
//       .then(({ data }) => { setOrdonnances(data ?? []); setLoading(false) })
//   }, [patientId])
 
//   return { ordonnances, loading }
// }
 
// // ── Hook : factures du patient ────────────────────────────────────────────
// function useFacturesPatient(patientId) {
//   const [factures, setFactures] = useState([])
//   const [loading, setLoading] = useState(true)
 
//   useEffect(() => {
//     if (!patientId) return
//     supabase
//       .from('factures')
//       .select('*')
//       .eq('patient_id', patientId)
//       .order('created_at', { ascending: false })
//       .then(({ data }) => { setFactures(data ?? []); setLoading(false) })
//   }, [patientId])
 
//   return { factures, loading }
// }
 
// // ── Hook : RDV du patient ─────────────────────────────────────────────────
// function useRdvPatient(patientId) {
//   const [rdvs, setRdvs] = useState([])
//   const [loading, setLoading] = useState(true)
 
//   useEffect(() => {
//     if (!patientId) return
//     supabase
//       .from('rendez_vous')
//       .select('*, medecin:users(prenom, nom)')
//       .eq('patient_id', patientId)
//       .order('date_heure', { ascending: false })
//       .then(({ data }) => { setRdvs(data ?? []); setLoading(false) })
//   }, [patientId])
 
//   return { rdvs, loading }
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // Composant principal
// // ─────────────────────────────────────────────────────────────────────────────
// export default function FichePatient() {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { patient, loading: pLoading } = usePatient(id)
//   const [activeTab, setActiveTab] = useState('dossier')
 
//   // Hooks médicaux (repris de MedicalRecord)
//   const { antecedents, loading: antLoading, ajouter: ajouterAnt, supprimer: supprimerAnt } = useAntecedents(id)
//   const { traitements, loading: trtLoading, ajouter: ajouterTrt, supprimer: supprimerTrt } = useTraitements(id)
//   const { allergies,   loading: allLoading, ajouter: ajouterAll, supprimer: supprimerAll } = useAllergies(id)
 
//   // Hooks ordonnances / factures / rdv
//   const { ordonnances, loading: ordLoading } = useOrdonnances(id)
//   const { factures,    loading: facLoading } = useFacturesPatient(id)
//   const { rdvs,        loading: rdvLoading } = useRdvPatient(id)
 
//   // Formulaires d'ajout (dossier médical)
//   const [addingAll, setAddingAll] = useState(false)
//   const [addingAnt, setAddingAnt] = useState(false)
//   const [addingTrt, setAddingTrt] = useState(false)
 
//   if (pLoading) return <PageLoader />
//   if (!patient) return <NotFound onBack={() => navigate('/patients')} />
 
//   const initiales = `${patient.prenom?.[0] ?? ''}${patient.nom?.[0] ?? ''}`.toUpperCase()
//   const age = patient.date_naissance
//     ? Math.floor((Date.now() - new Date(patient.date_naissance)) / 31557600000)
//     : null
 
//   const TABS = [
//     { id: 'infos',       label: 'Infos générales',  icon: IconUser,    count: null },
//     { id: 'dossier',     label: 'Dossier médical',   icon: IconClip,    count: allergies.length + antecedents.length + traitements.length },
//     { id: 'ordonnances', label: 'Ordonnances',        icon: IconRx,      count: ordonnances.length },
//     { id: 'factures',    label: 'Factures',           icon: IconInvoice, count: factures.length },
//     { id: 'rdv',         label: 'Rendez-vous',        icon: IconCal,     count: rdvs.length },
//   ]
 
//   return (
//     <div className="min-h-screen bg-gray-50">
 
//       {/* ── En-tête patient ───────────────────────────────────────────── */}
//       <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-5">
//         <div className="max-w-6xl mx-auto">
 
//           {/* Bouton retour */}
//           <button
//             onClick={() => navigate('/patients')}
//             className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//             Retour à la liste
//           </button>
 
//           <div className="flex items-start gap-4">
//             {/* Avatar */}
//             <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-sm">
//               {initiales}
//             </div>
 
//             {/* Infos principales */}
//             <div className="flex-1 min-w-0">
//               <div className="flex flex-wrap items-center gap-3">
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   {patient.prenom} {patient.nom}
//                 </h1>
//                 <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
//                   patient.statut === 'Actif' ? 'bg-teal-100 text-teal-700' :
//                   patient.statut === 'Urgent' ? 'bg-red-100 text-red-700' :
//                   'bg-gray-100 text-gray-500'
//                 }`}>
//                   {patient.statut ?? 'Actif'}
//                 </span>
//               </div>
//               <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-gray-500">
//                 {patient.telephone && <span className="flex items-center gap-1"><IconPhone className="w-3.5 h-3.5" /> {formatPhone(patient.telephone)}</span>}
//                 {patient.email     && <span className="flex items-center gap-1"><IconMail  className="w-3.5 h-3.5" /> {patient.email}</span>}
//                 {age !== null      && <span className="flex items-center gap-1"><IconCal   className="w-3.5 h-3.5" /> {age} ans · né(e) le {new Date(patient.date_naissance).toLocaleDateString('fr-FR')}</span>}
//               </div>
//             </div>
 
//             {/* Résumé rapide allergies (badge rouge si ≥1) */}
//             {allergies.length > 0 && (
//               <div className="hidden sm:flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-xl">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
//                 </svg>
//                 {allergies.length} allergie{allergies.length > 1 ? 's' : ''}
//               </div>
//             )}
//           </div>
 
//           {/* ── Onglets ─────────────────────────────────────────────────── */}
//           <div className="flex gap-0 mt-5 overflow-x-auto">
//             {TABS.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
//                   activeTab === tab.id
//                     ? 'border-teal-600 text-teal-700'
//                     : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
//                 }`}
//               >
//                 <tab.icon className="w-4 h-4" />
//                 {tab.label}
//                 {tab.count !== null && tab.count > 0 && (
//                   <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
//                     activeTab === tab.id ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
//                   }`}>
//                     {tab.count}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
 
//       {/* ── Contenu des onglets ───────────────────────────────────────── */}
//       <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
 
//         {/* ═══════════════════════════════════════════════
//             ONGLET 1 — Informations générales
//         ════════════════════════════════════════════════ */}
//         {activeTab === 'infos' && (
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
//               <h2 className="font-semibold text-gray-900">Informations personnelles</h2>
//             </div>
//             <div className="divide-y divide-gray-100">
//               {[
//                 ['Nom complet',      `${patient.prenom ?? ''} ${patient.nom ?? ''}`.trim() || '—'],
//                 ['Email',            patient.email        || '—'],
//                 ['Téléphone',        formatPhone(patient.telephone) || '—'],
//                 ['Date de naissance', patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : '—'],
//                 ['Âge',              age !== null ? `${age} ans` : '—'],
//                 ['Genre',            patient.genre        || '—'],
//                 ['Adresse',          patient.adresse      || '—'],
//                 ['Statut',           patient.statut       || 'Actif'],
//                 ['Créé le',          patient.created_at   ? new Date(patient.created_at).toLocaleDateString('fr-FR') : '—'],
//               ].map(([label, value]) => (
//                 <div key={label} className="flex px-6 py-3 text-sm">
//                   <span className="w-48 text-gray-500 font-medium flex-shrink-0">{label}</span>
//                   <span className="text-gray-900">{value}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
 
//         {/* ═══════════════════════════════════════════════
//             ONGLET 2 — Dossier médical (repris de MedicalRecord)
//         ════════════════════════════════════════════════ */}
//         {activeTab === 'dossier' && (
//           <div className="space-y-6">
 
//             {/* Allergies */}
//             <Section
//               title="⚠️ Allergies"
//               count={allergies.length}
//               onAdd={() => setAddingAll(!addingAll)}
//               loading={allLoading}
//             >
//               {addingAll && (
//                 <AllergieForm
//                   onSubmit={async (data) => { await ajouterAll(data); setAddingAll(false) }}
//                   onCancel={() => setAddingAll(false)}
//                 />
//               )}
//               {allergies.length === 0 && !addingAll
//                 ? <Empty text="Aucune allergie enregistrée" />
//                 : allergies.map(a => (
//                   <ItemCard
//                     key={a.id}
//                     colorClass={GRAVITE_COLORS[a.gravite]}
//                     title={a.allergie}
//                     subtitle={a.symptomes ? `Symptômes : ${a.symptomes}` : null}
//                     badge={a.gravite}
//                     onDelete={() => supprimerAll(a.id)}
//                   />
//                 ))
//               }
//             </Section>
 
//             {/* Antécédents */}
//             <Section
//               title="📋 Antécédents médicaux"
//               count={antecedents.length}
//               onAdd={() => setAddingAnt(!addingAnt)}
//               loading={antLoading}
//             >
//               {addingAnt && (
//                 <AntecedentForm
//                   onSubmit={async (data) => { await ajouterAnt(data); setAddingAnt(false) }}
//                   onCancel={() => setAddingAnt(false)}
//                 />
//               )}
//               {antecedents.length === 0 && !addingAnt
//                 ? <Empty text="Aucun antécédent enregistré" />
//                 : antecedents.map(a => (
//                   <ItemCard
//                     key={a.id}
//                     colorClass={GRAVITE_COLORS[a.gravite]}
//                     title={`${a.type} : ${a.description}`}
//                     subtitle={a.date_occurrence ? `Date : ${a.date_occurrence}` : null}
//                     badge={a.gravite}
//                     onDelete={() => supprimerAnt(a.id)}
//                   />
//                 ))
//               }
//             </Section>
 
//             {/* Traitements */}
//             <Section
//               title="🦷 Traitements"
//               count={traitements.length}
//               onAdd={() => setAddingTrt(!addingTrt)}
//               loading={trtLoading}
//             >
//               {addingTrt && (
//                 <TraitementForm
//                   onSubmit={async (data) => { await ajouterTrt(data); setAddingTrt(false) }}
//                   onCancel={() => setAddingTrt(false)}
//                 />
//               )}
//               {traitements.length === 0 && !addingTrt
//                 ? <Empty text="Aucun traitement enregistré" />
//                 : traitements.map(t => (
//                   <ItemCard
//                     key={t.id}
//                     colorClass={STATUT_TRT_COLORS[t.statut]}
//                     title={`${t.type_traitement}${t.dent_numero ? ` — Dent ${t.dent_numero}` : ''}`}
//                     subtitle={[
//                       t.date_debut && `Début : ${t.date_debut}`,
//                       t.cout       && `${Number(t.cout).toLocaleString('fr-FR')} FCFA`,
//                     ].filter(Boolean).join('  ·  ')}
//                     badge={t.statut?.replace('_', ' ')}
//                     onDelete={() => supprimerTrt(t.id)}
//                   />
//                 ))
//               }
//             </Section>
//           </div>
//         )}
 
//         {/* ═══════════════════════════════════════════════
//             ONGLET 3 — Ordonnances
//         ════════════════════════════════════════════════ */}
//         {activeTab === 'ordonnances' && (
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
//               <h2 className="font-semibold text-gray-900">
//                 Ordonnances
//                 {ordonnances.length > 0 && (
//                   <span className="ml-2 text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
//                     {ordonnances.length}
//                   </span>
//                 )}
//               </h2>
//             </div>
//             {ordLoading ? <Loader /> : ordonnances.length === 0
//               ? <Empty text="Aucune ordonnance pour ce patient" className="py-16" />
//               : (
//                 <div className="divide-y divide-gray-100">
//                   {ordonnances.map(ord => {
//                     const meds = Array.isArray(ord.medicaments) ? ord.medicaments : []
//                     return (
//                       <div key={ord.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
//                         <div className="flex items-start justify-between gap-4">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-1">
//                               <span className="text-sm font-semibold text-gray-900">
//                                 Ordonnance du {new Date(ord.date ?? ord.created_at).toLocaleDateString('fr-FR')}
//                               </span>
//                               {ord.medecin && (
//                                 <span className="text-xs text-gray-500">
//                                   · Dr. {ord.medecin.prenom} {ord.medecin.nom}
//                                 </span>
//                               )}
//                             </div>
//                             {meds.length > 0 && (
//                               <ul className="mt-2 space-y-1">
//                                 {meds.map((m, i) => (
//                                   <li key={i} className="flex items-baseline gap-2 text-sm">
//                                     <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
//                                     <span className="font-medium text-gray-800">{m.nom ?? m.medicament}</span>
//                                     {m.dosage    && <span className="text-gray-500 text-xs">— {m.dosage}</span>}
//                                     {m.frequence && <span className="text-gray-400 text-xs">{m.frequence}</span>}
//                                     {m.duree     && <span className="text-gray-400 text-xs">pendant {m.duree}</span>}
//                                   </li>
//                                 ))}
//                               </ul>
//                             )}
//                           </div>
//                           {ord.pdf_url && (
//                             <a
//                               href={ord.pdf_url}
//                               target="_blank"
//                               rel="noreferrer"
//                               className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
//                             >
//                               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                               </svg>
//                               PDF
//                             </a>
//                           )}
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               )
//             }
//           </div>
//         )}
 
//         {/* ═══════════════════════════════════════════════
//             ONGLET 4 — Factures
//         ════════════════════════════════════════════════ */}
//         {activeTab === 'factures' && (
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
//               <h2 className="font-semibold text-gray-900">
//                 Factures
//                 {factures.length > 0 && (
//                   <span className="ml-2 text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
//                     {factures.length}
//                   </span>
//                 )}
//               </h2>
//               {/* Solde total impayé */}
//               {(() => {
//                 const totalDu = factures
//                   .filter(f => f.statut !== 'payee')
//                   .reduce((sum, f) => sum + ((f.montant_total ?? 0) - (f.montant_paye ?? 0)), 0)
//                 return totalDu > 0 ? (
//                   <span className="text-sm font-semibold text-red-600">
//                     Solde dû : {totalDu.toLocaleString('fr-FR')} FCFA
//                   </span>
//                 ) : null
//               })()}
//             </div>
//             {facLoading ? <Loader /> : factures.length === 0
//               ? <Empty text="Aucune facture pour ce patient" className="py-16" />
//               : (
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="bg-gray-50 border-b border-gray-100">
//                         {['Date', 'N° Facture', 'Montant total', 'Payé', 'Solde restant', 'Statut', 'PDF'].map(h => (
//                           <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {factures.map(f => {
//                         const paye  = f.montant_paye  ?? 0
//                         const total = f.montant_total ?? 0
//                         const reste = total - paye
//                         return (
//                           <tr key={f.id} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
//                               {new Date(f.created_at).toLocaleDateString('fr-FR')}
//                             </td>
//                             <td className="px-4 py-3 font-mono text-gray-700 text-xs">
//                               {f.numero ?? `#${f.id.slice(0,8).toUpperCase()}`}
//                             </td>
//                             <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
//                               {total.toLocaleString('fr-FR')} FCFA
//                             </td>
//                             <td className="px-4 py-3 text-green-700 whitespace-nowrap">
//                               {paye.toLocaleString('fr-FR')} FCFA
//                             </td>
//                             <td className={`px-4 py-3 font-semibold whitespace-nowrap ${reste > 0 ? 'text-red-600' : 'text-green-600'}`}>
//                               {reste > 0 ? `${reste.toLocaleString('fr-FR')} FCFA` : '—'}
//                             </td>
//                             <td className="px-4 py-3">
//                               <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUT_FACTURE_COLORS[f.statut] ?? 'bg-gray-100 text-gray-500'}`}>
//                                 {f.statut ?? '—'}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3">
//                               {f.pdf_url ? (
//                                 <a href={f.pdf_url} target="_blank" rel="noreferrer"
//                                   className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium">
//                                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                   </svg>
//                                   Voir
//                                 </a>
//                               ) : <span className="text-gray-300 text-xs">—</span>}
//                             </td>
//                           </tr>
//                         )
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )
//             }
//           </div>
//         )}
 
//         {/* ═══════════════════════════════════════════════
//             ONGLET 5 — Rendez-vous
//         ════════════════════════════════════════════════ */}
//         {activeTab === 'rdv' && (
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
//               <h2 className="font-semibold text-gray-900">
//                 Historique des rendez-vous
//                 {rdvs.length > 0 && (
//                   <span className="ml-2 text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
//                     {rdvs.length}
//                   </span>
//                 )}
//               </h2>
//             </div>
//             {rdvLoading ? <Loader /> : rdvs.length === 0
//               ? <Empty text="Aucun rendez-vous pour ce patient" className="py-16" />
//               : (
//                 <div className="divide-y divide-gray-100">
//                   {rdvs.map(rdv => {
//                     const dt = new Date(rdv.date_heure)
//                     const isPast = dt < new Date()
//                     return (
//                       <div key={rdv.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${isPast ? 'opacity-80' : ''}`}>
//                         <div className="flex items-center justify-between gap-4">
//                           <div className="flex items-center gap-4">
//                             {/* Date bloc */}
//                             <div className="text-center w-12 flex-shrink-0">
//                               <div className="text-xs text-gray-400 uppercase">
//                                 {dt.toLocaleDateString('fr-FR', { month: 'short' })}
//                               </div>
//                               <div className="text-xl font-bold text-gray-900 leading-tight">
//                                 {dt.getDate()}
//                               </div>
//                               <div className="text-xs text-gray-400">{dt.getFullYear()}</div>
//                             </div>
//                             <div className="w-px h-10 bg-gray-200 flex-shrink-0" />
//                             <div>
//                               <p className="text-sm font-semibold text-gray-900">
//                                 {dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
//                                 {rdv.duree && <span className="font-normal text-gray-400 ml-1">· {rdv.duree} min</span>}
//                               </p>
//                               {rdv.medecin && (
//                                 <p className="text-xs text-gray-500 mt-0.5">
//                                   Dr. {rdv.medecin.prenom} {rdv.medecin.nom}
//                                 </p>
//                               )}
//                               {rdv.notes && (
//                                 <p className="text-xs text-gray-400 mt-1 italic">{rdv.notes}</p>
//                               )}
//                             </div>
//                           </div>
//                           <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUT_RDV_COLORS[rdv.statut] ?? 'bg-gray-100 text-gray-500'}`}>
//                             {rdv.statut?.replace('_', '-') ?? '—'}
//                           </span>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               )
//             }
//           </div>
//         )}
 
//       </div>
//     </div>
//   )
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // Sous-composants réutilisables
// // ─────────────────────────────────────────────────────────────────────────────
 
// function Section({ title, count, onAdd, loading, children }) {
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//       <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
//         <h2 className="font-semibold text-gray-900 flex items-center gap-2">
//           {title}
//           {count > 0 && (
//             <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{count}</span>
//           )}
//         </h2>
//         <button
//           onClick={onAdd}
//           className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
//         >
//           + Ajouter
//         </button>
//       </div>
//       <div className="p-4 space-y-2">
//         {loading ? <Loader /> : children}
//       </div>
//     </div>
//   )
// }
 
// function ItemCard({ colorClass, title, subtitle, badge, onDelete }) {
//   return (
//     <div className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${colorClass}`}>
//       <div className="flex-1 min-w-0">
//         <p className="font-medium text-sm">{title}</p>
//         {subtitle && <p className="text-xs mt-0.5 opacity-75">{subtitle}</p>}
//         {badge && (
//           <span className="inline-block mt-1 text-xs font-semibold capitalize opacity-80">
//             {badge}
//           </span>
//         )}
//       </div>
//       <button
//         onClick={onDelete}
//         className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
//         title="Supprimer"
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//         </svg>
//       </button>
//     </div>
//   )
// }
 
// function Empty({ text, className = '' }) {
//   return <p className={`text-center text-gray-400 text-sm py-8 ${className}`}>{text}</p>
// }
 
// function Loader() {
//   return <p className="text-center text-gray-400 text-sm py-8">Chargement...</p>
// }
 
// function PageLoader() {
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="text-gray-400 text-sm">Chargement du dossier...</div>
//     </div>
//   )
// }
 
// function NotFound({ onBack }) {
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
//       <p className="text-gray-500">Patient introuvable.</p>
//       <button onClick={onBack} className="text-teal-600 text-sm font-medium hover:underline">
//         ← Retour à la liste
//       </button>
//     </div>
//   )
// }
 
// // ── Mini-formulaires (repris de MedicalRecord) ────────────────────────────
 
// function AllergieForm({ onSubmit, onCancel }) {
//   const [form, setForm] = useState({ allergie: '', gravite: 'normal', symptomes: '' })
//   return (
//     <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-2">
//       <input type="text" placeholder="Nom de l'allergie" value={form.allergie}
//         onChange={e => setForm({ ...form, allergie: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
//       <input type="text" placeholder="Symptômes" value={form.symptomes}
//         onChange={e => setForm({ ...form, symptomes: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
//       <select value={form.gravite} onChange={e => setForm({ ...form, gravite: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg">
//         <option value="normal">Normal</option>
//         <option value="important">Important</option>
//         <option value="grave">Grave</option>
//         <option value="critique">Critique</option>
//       </select>
//       <div className="flex gap-2">
//         <button onClick={() => onSubmit(form)} disabled={!form.allergie}
//           className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
//           Enregistrer
//         </button>
//         <button onClick={onCancel}
//           className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
//           Annuler
//         </button>
//       </div>
//     </div>
//   )
// }
 
// function AntecedentForm({ onSubmit, onCancel }) {
//   const [form, setForm] = useState({ type: 'maladie', description: '', date_occurrence: '', gravite: 'normal', notes: '' })
//   return (
//     <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
//       <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg">
//         <option value="maladie">Maladie</option>
//         <option value="allergie">Allergie</option>
//         <option value="chirurgie">Chirurgie</option>
//         <option value="traitement">Traitement</option>
//         <option value="autre">Autre</option>
//       </select>
//       <input type="text" placeholder="Description" value={form.description}
//         onChange={e => setForm({ ...form, description: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
//       <input type="date" value={form.date_occurrence}
//         onChange={e => setForm({ ...form, date_occurrence: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
//       <div className="flex gap-2">
//         <button onClick={() => onSubmit(form)} disabled={!form.description}
//           className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
//           Enregistrer
//         </button>
//         <button onClick={onCancel}
//           className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg">
//           Annuler
//         </button>
//       </div>
//     </div>
//   )
// }
 
// function TraitementForm({ onSubmit, onCancel }) {
//   const [form, setForm] = useState({
//     type_traitement: '', dent_numero: '',
//     date_debut: new Date().toISOString().split('T')[0],
//     statut: 'en_cours', cout: '', notes: ''
//   })
//   return (
//     <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-2">
//       <input type="text" placeholder="Type de traitement (ex: détartrage)" value={form.type_traitement}
//         onChange={e => setForm({ ...form, type_traitement: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
//       <input type="text" placeholder="Numéro de dent (ex: 18)" value={form.dent_numero}
//         onChange={e => setForm({ ...form, dent_numero: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
//       <input type="number" placeholder="Coût en FCFA" value={form.cout}
//         onChange={e => setForm({ ...form, cout: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
//       <input type="text" placeholder="Notes (optionnel)" value={form.notes}
//         onChange={e => setForm({ ...form, notes: e.target.value })}
//         className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
//       <div className="flex gap-2">
//         <button onClick={() => onSubmit(form)} disabled={!form.type_traitement}
//           className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
//           Enregistrer
//         </button>
//         <button onClick={onCancel}
//           className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg">
//           Annuler
//         </button>
//       </div>
//     </div>
//   )
// }
 
// // ── Icônes SVG inline ─────────────────────────────────────────────────────
// const IconUser    = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
// const IconClip    = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
// const IconRx      = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
// const IconInvoice = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 2.5 2 2.5-2 3.5 2z" /></svg>
// const IconCal     = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
// const IconPhone   = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 9V5z" /></svg>
// const IconMail    = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
 
// ─────────────────────────────────────────────────────────────────────────────
// FichePatient.jsx
//
// UTILISATION dans ton router (ex: react-router-dom v6) :
//   <Route path="/patients/:id" element={<FichePatient />} />
//
// Dans Patients.jsx, remplace openMedicalRecord par :
//   import { useNavigate } from 'react-router-dom'
//   const navigate = useNavigate()
//   <button onClick={() => navigate(`/patients/${p.id}`)}>...</button>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAntecedents } from '../hooks/useAntecedents'
import { useTraitements } from '../hooks/useTraitements'
import { useAllergies } from '../hooks/useAllergies'
import { formatPhone } from '../utils/phone'
import { usePatientData } from '../hooks/usePatientData'

// ── Couleurs gravité / statut (reprises de MedicalRecord) ─────────────────
const GRAVITE_COLORS = {
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
  important: 'bg-amber-50 text-amber-700 border-amber-200',
  grave: 'bg-red-50 text-red-700 border-red-200',
  critique: 'bg-red-100 text-red-800 border-red-300',
}
const STATUT_TRT_COLORS = {
  en_cours: 'bg-blue-50 text-blue-700',
  termine: 'bg-green-50 text-green-700',
  suspendu: 'bg-amber-50 text-amber-700',
  annule: 'bg-red-50 text-red-700',
}
const STATUT_FACTURE_COLORS = {
  paye: 'bg-green-100 text-green-700',
  attente: 'bg-amber-100 text-amber-700',
  annule: 'bg-red-100 text-red-700',
}
const STATUT_RDV_COLORS = {
  planifie: 'bg-blue-100 text-blue-700',
  confirme: 'bg-teal-100 text-teal-700',
  realise: 'bg-green-100 text-green-700',
  annule: 'bg-red-100 text-red-700',
  absent: 'bg-gray-100 text-gray-500',
}

// ── Hook : charger un patient par ID ──────────────────────────────────────
function usePatient(id) {
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => { setPatient(data); setLoading(false) })
  }, [id])

  return { patient, loading }
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────
export default function FichePatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patient, loading: pLoading } = usePatient(id)
  const [activeTab, setActiveTab] = useState('dossier')

  // Hooks médicaux (repris de MedicalRecord)
  const { antecedents, loading: antLoading, ajouter: ajouterAnt, supprimer: supprimerAnt } = useAntecedents(id)
  const { traitements, loading: trtLoading, ajouter: ajouterTrt, supprimer: supprimerTrt } = useTraitements(id)
  const { allergies, loading: allLoading, ajouter: ajouterAll, supprimer: supprimerAll } = useAllergies(id)

  // Hook patient data avec déstructuration des loading
  const { 
    ordonnances, 
    factures, 
    rdvs, 
    loading: {
      ordonnances: ordLoading,
      factures: facLoading,
      rdvs: rdvLoading
    },
    totalOrdonnances,
    totalFactures,
    totalRdvs,
    totalImpaye 
  } = usePatientData(id)

  // Formulaires d'ajout (dossier médical)
  const [addingAll, setAddingAll] = useState(false)
  const [addingAnt, setAddingAnt] = useState(false)
  const [addingTrt, setAddingTrt] = useState(false)

  if (pLoading) return <PageLoader />
  if (!patient) return <NotFound onBack={() => navigate('/patients')} />

  const initiales = `${patient.prenom?.[0] ?? ''}${patient.nom?.[0] ?? ''}`.toUpperCase()
  const age = patient.date_naissance
    ? Math.floor((Date.now() - new Date(patient.date_naissance)) / 31557600000)
    : null

  const TABS = [
    { id: 'infos', label: 'Infos générales', icon: IconUser, count: null },
    { id: 'dossier', label: 'Dossier médical', icon: IconClip, count: allergies.length + antecedents.length + traitements.length },
    { id: 'ordonnances', label: 'Ordonnances', icon: IconRx, count: totalOrdonnances },
    { id: 'factures', label: 'Factures', icon: IconInvoice, count: totalFactures },
    { id: 'rdv', label: 'Rendez-vous', icon: IconCal, count: totalRdvs },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── En-tête patient ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-5">
        <div className="max-w-6xl mx-auto">

          {/* Bouton retour */}
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la liste
          </button>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-sm">
              {initiales}
            </div>

            {/* Infos principales */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.prenom} {patient.nom}
                </h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  patient.statut === 'Actif' ? 'bg-teal-100 text-teal-700' :
                  patient.statut === 'Urgent' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {patient.statut ?? 'Actif'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-gray-500">
                {patient.telephone && <span className="flex items-center gap-1"><IconPhone className="w-3.5 h-3.5" /> {formatPhone(patient.telephone)}</span>}
                {patient.email && <span className="flex items-center gap-1"><IconMail className="w-3.5 h-3.5" /> {patient.email}</span>}
                {age !== null && <span className="flex items-center gap-1"><IconCal className="w-3.5 h-3.5" /> {age} ans · né(e) le {new Date(patient.date_naissance).toLocaleDateString('fr-FR')}</span>}
              </div>
            </div>

            {/* Résumé rapide allergies (badge rouge si ≥1) */}
            {allergies.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {allergies.length} allergie{allergies.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* ── Onglets ─────────────────────────────────────────────────── */}
          <div className="flex gap-0 mt-5 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                    activeTab === tab.id ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenu des onglets ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">

        {/* ═══════════════════════════════════════════════
            ONGLET 1 — Informations générales
        ════════════════════════════════════════════════ */}
        {activeTab === 'infos' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Informations personnelles</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                ['Nom complet', `${patient.prenom ?? ''} ${patient.nom ?? ''}`.trim() || '—'],
                ['Email', patient.email || '—'],
                ['Téléphone', formatPhone(patient.telephone) || '—'],
                ['Date de naissance', patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : '—'],
                ['Âge', age !== null ? `${age} ans` : '—'],
                ['Genre', patient.genre || '—'],
                ['Adresse', patient.adresse || '—'],
                ['Statut', patient.statut || 'Actif'],
                ['Créé le', patient.created_at ? new Date(patient.created_at).toLocaleDateString('fr-FR') : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex px-6 py-3 text-sm">
                  <span className="w-48 text-gray-500 font-medium flex-shrink-0">{label}</span>
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            ONGLET 2 — Dossier médical (repris de MedicalRecord)
        ════════════════════════════════════════════════ */}
        {activeTab === 'dossier' && (
          <div className="space-y-6">

            {/* Allergies */}
            <Section
              title="⚠️ Allergies"
              count={allergies.length}
              onAdd={() => setAddingAll(!addingAll)}
              loading={allLoading}
            >
              {addingAll && (
                <AllergieForm
                  onSubmit={async (data) => { await ajouterAll(data); setAddingAll(false) }}
                  onCancel={() => setAddingAll(false)}
                />
              )}
              {allergies.length === 0 && !addingAll
                ? <Empty text="Aucune allergie enregistrée" />
                : allergies.map(a => (
                  <ItemCard
                    key={a.id}
                    colorClass={GRAVITE_COLORS[a.gravite]}
                    title={a.allergie}
                    subtitle={a.symptomes ? `Symptômes : ${a.symptomes}` : null}
                    badge={a.gravite}
                    onDelete={() => supprimerAll(a.id)}
                  />
                ))
              }
            </Section>

            {/* Antécédents */}
            <Section
              title="📋 Antécédents médicaux"
              count={antecedents.length}
              onAdd={() => setAddingAnt(!addingAnt)}
              loading={antLoading}
            >
              {addingAnt && (
                <AntecedentForm
                  onSubmit={async (data) => { await ajouterAnt(data); setAddingAnt(false) }}
                  onCancel={() => setAddingAnt(false)}
                />
              )}
              {antecedents.length === 0 && !addingAnt
                ? <Empty text="Aucun antécédent enregistré" />
                : antecedents.map(a => (
                  <ItemCard
                    key={a.id}
                    colorClass={GRAVITE_COLORS[a.gravite]}
                    title={`${a.type} : ${a.description}`}
                    subtitle={a.date_occurrence ? `Date : ${a.date_occurrence}` : null}
                    badge={a.gravite}
                    onDelete={() => supprimerAnt(a.id)}
                  />
                ))
              }
            </Section>

            {/* Traitements */}
            <Section
              title="🦷 Traitements"
              count={traitements.length}
              onAdd={() => setAddingTrt(!addingTrt)}
              loading={trtLoading}
            >
              {addingTrt && (
                <TraitementForm
                  onSubmit={async (data) => { await ajouterTrt(data); setAddingTrt(false) }}
                  onCancel={() => setAddingTrt(false)}
                />
              )}
              {traitements.length === 0 && !addingTrt
                ? <Empty text="Aucun traitement enregistré" />
                : traitements.map(t => (
                  <ItemCard
                    key={t.id}
                    colorClass={STATUT_TRT_COLORS[t.statut]}
                    title={`${t.type_traitement}${t.dent_numero ? ` — Dent ${t.dent_numero}` : ''}`}
                    subtitle={[
                      t.date_debut && `Début : ${t.date_debut}`,
                      t.cout && `${Number(t.cout).toLocaleString('fr-FR')} FCFA`,
                    ].filter(Boolean).join('  ·  ')}
                    badge={t.statut?.replace('_', ' ')}
                    onDelete={() => supprimerTrt(t.id)}
                  />
                ))
              }
            </Section>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            ONGLET 3 — Ordonnances
        ════════════════════════════════════════════════ */}
        {activeTab === 'ordonnances' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Ordonnances
                {totalOrdonnances > 0 && (
                  <span className="ml-2 text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                    {totalOrdonnances}
                  </span>
                )}
              </h2>
            </div>
            {ordLoading ? <Loader /> : ordonnances.length === 0
              ? <Empty text="Aucune ordonnance pour ce patient" className="py-16" />
              : (
                <div className="divide-y divide-gray-100">
                  {ordonnances.map(ord => (
                    <div key={ord.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              Ordonnance du {new Date(ord.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            {ord.medecin_traitant && (
                              <span className="text-xs text-gray-500">
                                · Dr. {ord.medecin_traitant.prenom} {ord.medecin_traitant.nom}
                              </span>
                            )}
                          </div>

                          {/* Médicaments */}
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">💊 Médicaments</p>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                              {ord.medicaments || 'Aucun médicament spécifié'}
                            </div>
                          </div>

                          {/* Posologie */}
                          {ord.posologie && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">⏰ Posologie</p>
                              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                {ord.posologie}
                              </div>
                            </div>
                          )}

                          {/* Durée */}
                          {ord.duree && (
                            <div className="mt-3 text-sm">
                              <span className="text-gray-500">📅 Durée : </span>
                              <span className="text-gray-700 font-medium">{ord.duree}</span>
                            </div>
                          )}

                          {/* Notes */}
                          {ord.notes && (
                            <div className="mt-2 text-sm text-gray-500 italic">
                              📝 {ord.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

               {/* ═══════════════════════════════════════════════
            ONGLET 4 — Factures
        ════════════════════════════════════════════════ */}
        {activeTab === 'factures' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Factures
                {totalFactures > 0 && (
                  <span className="ml-2 text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                    {totalFactures}
                  </span>
                )}
              </h2>
              {totalImpaye > 0 && (
                <span className="text-sm font-semibold text-red-600">
                  Solde dû : {totalImpaye.toLocaleString('fr-FR')} FCFA
                </span>
              )}
            </div>
            {facLoading ? <Loader /> : factures.length === 0
              ? <Empty text="Aucune facture pour ce patient" className="py-16" />
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Date', 'Acte', 'Montant', 'Statut'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {factures.map(f => (
                        <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {new Date(f.date || f.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {f.acte || 'Acte dentaire'}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                            {Number(f.montant || 0).toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUT_FACTURE_COLORS[f.statut] ?? 'bg-gray-100 text-gray-500'}`}>
                              {f.statut === 'paye' ? 'Payée' :
                                f.statut === 'attente' ? 'En attente' :
                                  f.statut === 'annule' ? 'Annulée' : f.statut || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            ONGLET 5 — Rendez-vous
        ════════════════════════════════════════════════ */}
        {activeTab === 'rdv' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900">
                Historique des rendez-vous
                {totalRdvs > 0 && (
                  <span className="ml-2 text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                    {totalRdvs}
                  </span>
                )}
              </h2>
            </div>
            {rdvLoading ? <Loader /> : rdvs.length === 0
              ? <Empty text="Aucun rendez-vous pour ce patient" className="py-16" />
              : (
                <div className="divide-y divide-gray-100">
                  {rdvs.map(rdv => {
                    const dateStr = rdv.date
                    const heureStr = rdv.heure
                    const dateObj = new Date(`${dateStr}T${heureStr || '12:00'}`)
                    const isPast = dateObj < new Date()
                    return (
                      <div key={rdv.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${isPast ? 'opacity-80' : ''}`}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {/* Date bloc */}
                            <div className="text-center w-12 flex-shrink-0">
                              <div className="text-xs text-gray-400 uppercase">
                                {dateObj.toLocaleDateString('fr-FR', { month: 'short' })}
                              </div>
                              <div className="text-xl font-bold text-gray-900 leading-tight">
                                {dateObj.getDate()}
                              </div>
                              <div className="text-xs text-gray-400">{dateObj.getFullYear()}</div>
                            </div>
                            <div className="w-px h-10 bg-gray-200 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {heureStr || '—'}
                                {rdv.duree_minutes && <span className="font-normal text-gray-400 ml-1">· {rdv.duree_minutes} min</span>}
                              </p>
                              {rdv.type_acte && (
                                <p className="text-xs text-gray-500 mt-0.5">{rdv.type_acte}</p>
                              )}
                              {rdv.medecin && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Dr. {rdv.medecin.prenom} {rdv.medecin.nom}
                                </p>
                              )}
                              {rdv.notes && (
                                <p className="text-xs text-gray-400 mt-1 italic">{rdv.notes}</p>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                            rdv.statut === 'confirme' ? 'bg-teal-100 text-teal-700' :
                            rdv.statut === 'planifie' ? 'bg-blue-100 text-blue-700' :
                            rdv.statut === 'realise' ? 'bg-green-100 text-green-700' :
                            rdv.statut === 'annule' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {rdv.statut?.replace('_', '-') || '—'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </div>
        )}

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composants réutilisables
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, count, onAdd, loading, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{count}</span>
          )}
        </h2>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
        >
          + Ajouter
        </button>
      </div>
      <div className="p-4 space-y-2">
        {loading ? <Loader /> : children}
      </div>
    </div>
  )
}

function ItemCard({ colorClass, title, subtitle, badge, onDelete }) {
  return (
    <div className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${colorClass}`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {subtitle && <p className="text-xs mt-0.5 opacity-75">{subtitle}</p>}
        {badge && (
          <span className="inline-block mt-1 text-xs font-semibold capitalize opacity-80">
            {badge}
          </span>
        )}
      </div>
      <button
        onClick={onDelete}
        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
        title="Supprimer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

function Empty({ text, className = '' }) {
  return <p className={`text-center text-gray-400 text-sm py-8 ${className}`}>{text}</p>
}

function Loader() {
  return <p className="text-center text-gray-400 text-sm py-8">Chargement...</p>
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Chargement du dossier...</div>
    </div>
  )
}

function NotFound({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Patient introuvable.</p>
      <button onClick={onBack} className="text-teal-600 text-sm font-medium hover:underline">
        ← Retour à la liste
      </button>
    </div>
  )
}

// ── Mini-formulaires (repris de MedicalRecord) ────────────────────────────

function AllergieForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ allergie: '', gravite: 'normal', symptomes: '' })
  return (
    <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-2">
      <input type="text" placeholder="Nom de l'allergie" value={form.allergie}
        onChange={e => setForm({ ...form, allergie: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
      <input type="text" placeholder="Symptômes" value={form.symptomes}
        onChange={e => setForm({ ...form, symptomes: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
      <select value={form.gravite} onChange={e => setForm({ ...form, gravite: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg">
        <option value="normal">Normal</option>
        <option value="important">Important</option>
        <option value="grave">Grave</option>
        <option value="critique">Critique</option>
      </select>
      <div className="flex gap-2">
        <button onClick={() => onSubmit(form)} disabled={!form.allergie}
          className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
          Enregistrer
        </button>
        <button onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
          Annuler
        </button>
      </div>
    </div>
  )
}

function AntecedentForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ type: 'maladie', description: '', date_occurrence: '', gravite: 'normal', notes: '' })
  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
      <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg">
        <option value="maladie">Maladie</option>
        <option value="allergie">Allergie</option>
        <option value="chirurgie">Chirurgie</option>
        <option value="traitement">Traitement</option>
        <option value="autre">Autre</option>
      </select>
      <input type="text" placeholder="Description" value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
      <input type="date" value={form.date_occurrence}
        onChange={e => setForm({ ...form, date_occurrence: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
      <div className="flex gap-2">
        <button onClick={() => onSubmit(form)} disabled={!form.description}
          className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          Enregistrer
        </button>
        <button onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg">
          Annuler
        </button>
      </div>
    </div>
  )
}

function TraitementForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    type_traitement: '', dent_numero: '',
    date_debut: new Date().toISOString().split('T')[0],
    statut: 'en_cours', cout: '', notes: ''
  })
  return (
    <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-2">
      <input type="text" placeholder="Type de traitement (ex: détartrage)" value={form.type_traitement}
        onChange={e => setForm({ ...form, type_traitement: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
      <input type="text" placeholder="Numéro de dent (ex: 18)" value={form.dent_numero}
        onChange={e => setForm({ ...form, dent_numero: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
      <input type="number" placeholder="Coût en FCFA" value={form.cout}
        onChange={e => setForm({ ...form, cout: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
      <input type="text" placeholder="Notes (optionnel)" value={form.notes}
        onChange={e => setForm({ ...form, notes: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
      <div className="flex gap-2">
        <button onClick={() => onSubmit(form)} disabled={!form.type_traitement}
          className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
          Enregistrer
        </button>
        <button onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg">
          Annuler
        </button>
      </div>
    </div>
  )
}

// ── Icônes SVG inline ─────────────────────────────────────────────────────
const IconUser = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
const IconClip = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
const IconRx = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
const IconInvoice = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 2.5 2 2.5-2 3.5 2z" /></svg>
const IconCal = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
const IconPhone = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 9V5z" /></svg>
const IconMail = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>