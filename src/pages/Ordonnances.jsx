import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { PermissionGate } from '../components/RoleGuard'
import { usePatients } from '../hooks/usePatients'
import { useNotifications } from '../hooks/NotificationsContext'
import { downloadOrdonnancePDF, previewOrdonnancePDF } from '../utils/pdfGenerator'
import SignaturePad from '../components/SignaturePad'

function useOrdonnances() {
  const [ordonnances, setOrdonnances] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()
  
  const fetch = async () => {
    setLoading(true)
    try {
      const { data: ordonnancesData, error: ordonnancesError } = await supabase
        .from('ordonnances')
        .select(`
          *,
          patients(
            id,
            nom,
            prenom,
            telephone,
            date_naissance
          )
        `)
        .order('created_at', { ascending: false })
      
      if (ordonnancesError) throw ordonnancesError
      
      if (!ordonnancesData || ordonnancesData.length === 0) {
        setOrdonnances([])
        setLoading(false)
        return
      }
      
      const medecinIds = [...new Set(
        ordonnancesData
          .filter(o => o.id_medecin_traitant)
          .map(o => o.id_medecin_traitant)
      )]
      
      let medecinsMap = {}
      if (medecinIds.length > 0) {
        const { data: medecinsData, error: medecinsError } = await supabase
          .from('users_profiles')
          .select('id, nom, prenom, specialite, telephone, role')
          .in('id', medecinIds)
        
        if (!medecinsError && medecinsData) {
          medecinsMap = medecinsData.reduce((acc, m) => {
            acc[m.id] = m
            return acc
          }, {})
        }
      }
      
      const ordonnancesAvecMedecin = ordonnancesData.map(o => ({
        ...o,
        medecin_traitant: o.id_medecin_traitant ? medecinsMap[o.id_medecin_traitant] || null : null
      }))
      
      setOrdonnances(ordonnancesAvecMedecin)
    } catch (error) {
      console.error('Erreur chargement:', error)
      notify({ type: 'error', message: `Erreur lors du chargement: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => { fetch() }, [])
  
  const ajouter = async (o) => {
    const { error } = await supabase.from('ordonnances').insert(o)
    if (error) {
      notify({ type:'error', message:`Ordonnance non ajoutee : ${error.message}` })
      throw error
    }
    notify({ type:'success', message:'Ordonnance ajoutee' })
    await fetch()
  }
  
  const modifier = async (id, o) => {
    const { error } = await supabase.from('ordonnances').update(o).eq('id', id)
    if (error) {
      notify({ type:'error', message:`Ordonnance non modifiee : ${error.message}` })
      throw error
    }
    notify({ type:'success', message:'Ordonnance modifiee' })
    await fetch()
  }
  
  const supprimer = async (id) => {
    const { error } = await supabase.from('ordonnances').delete().eq('id', id)
    if (error) {
      notify({ type:'error', message:`Ordonnance non supprimee : ${error.message}` })
      throw error
    }
    notify({ type:'success', message:'Ordonnance supprimee' })
    await fetch()
  }
  
  return { ordonnances, loading, ajouter, modifier, supprimer }
}

const empty = { 
  patient_id: '', 
  medicaments: '', 
  posologie: '', 
  duree: '7 jours', 
  notes: '',
  id_medecin_traitant: '',
  signature: ''
}

export default function Ordonnances() {
  const { ordonnances, loading, ajouter, modifier, supprimer } = useOrdonnances()
  const { patients, loading: loadingPatients } = usePatients()
  const { notify } = useNotifications()
  const [modal, setModal] = useState(false)
  const [editO, setEditO] = useState(null)
  const [confirmD, setConfirmD] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [exportingId, setExportingId] = useState(null)
  const [previewId, setPreviewId] = useState(null)
  const [medecins, setMedecins] = useState([])
  const [userConnected, setUserConnected] = useState(null)
  
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }))
  
  // RÃ©cupÃ©rer l'utilisateur connectÃ© (mÃ©decin prescripteur)
  useEffect(() => {
    const fetchUserConnected = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users_profiles')
          .select('id, nom, prenom, role, specialite')
          .eq('id', user.id)
          .single()
        setUserConnected(profile)
      }
    }
    fetchUserConnected()
  }, [])
  
  // RÃ©cupÃ©rer la liste des mÃ©decins traitants
  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        const { data } = await supabase
          .from('users_profiles')
          .select('id, nom, prenom, specialite, telephone, role')
          .in('role', ['medecin', 'superadmin'])
          .eq('actif', true)
          .order('nom')
        setMedecins(data || [])
      } catch (error) {
        console.error('Erreur chargement mÃ©decins:', error)
      }
    }
    fetchMedecins()
  }, [])
  
  const patientOptions = patients.map(p => ({
    value: p.id,
    label: `${p.prenom ?? ''} ${p.nom ?? ''}${p.telephone ? ` - ${p.telephone}` : ''}`.trim(),
  }))

  const openCreate = () => { setEditO(null); setForm(empty); setModal(true) }
  const openEdit = (o) => { 
    setEditO(o); 
    setForm({ 
      patient_id: o.patient_id, 
      medicaments: o.medicaments, 
      posologie: o.posologie, 
      duree: o.duree, 
      notes: o.notes,
      id_medecin_traitant: o.id_medecin_traitant || '',
      signature: o.signature || ''
    }); 
    setModal(true); 
  }

  const handleExportPDF = async (ordonnance, patient) => {
    setExportingId(ordonnance.id)
    try {
      let medecinTraitant = null
      if (ordonnance.id_medecin_traitant) {
        const { data } = await supabase
          .from('users_profiles')
          .select('id, nom, prenom, specialite, telephone, role')
          .eq('id', ordonnance.id_medecin_traitant)
          .single()
        medecinTraitant = data
      }
      await downloadOrdonnancePDF(ordonnance, patient, medecinTraitant, userConnected)
      notify({ type: 'success', message: 'PDF gÃ©nÃ©rÃ© avec succÃ¨s' })
    } catch (error) {
      console.error('Export Ã©chouÃ©:', error)
      notify({ type: 'error', message: 'Erreur lors de la gÃ©nÃ©ration du PDF' })
    } finally {
      setExportingId(null)
    }
  }

  const handlePreviewPDF = async (ordonnance, patient) => {
    setPreviewId(ordonnance.id)
    try {
      let medecinTraitant = null
      if (ordonnance.id_medecin_traitant) {
        const { data } = await supabase
          .from('users_profiles')
          .select('id, nom, prenom, specialite, telephone, role')
          .eq('id', ordonnance.id_medecin_traitant)
          .single()
        medecinTraitant = data
      }
      await previewOrdonnancePDF(ordonnance, patient, medecinTraitant, userConnected)
    } catch (error) {
      console.error('AperÃ§u Ã©chouÃ©:', error)
      notify({ type: 'error', message: 'Erreur lors de l\'aperÃ§u du PDF' })
    } finally {
      setPreviewId(null)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      if (editO) await modifier(editO.id, form)
      else await ajouter(form)
      setModal(false)
    } catch {
      // Le hook affiche deja la notification d'erreur.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Ordonnances</h2>
          <p className="text-sm text-gray-500">{ordonnances.length} ordonnance{ordonnances.length > 1 ? 's' : ''}</p>
        </div>
        <PermissionGate module="ordonnances" requireWrite>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle ordonnance
          </button>
        </PermissionGate>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">MÃ©dicaments</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Posologie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">DurÃ©e</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">MÃ©decin traitant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chargement...</td></tr>
              ) : ordonnances.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucune ordonnance</td></tr>
              ) : (
                ordonnances.map((o) => {
                  const patient = o.patients
                  const medecin = o.medecin_traitant
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {patient ? `${patient.prenom} ${patient.nom}` : `ID: ${o.patient_id}`}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs">
                        <p className="truncate">{o.medicaments}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{o.posologie}</td>
                      <td className="px-4 py-3 text-gray-600">{o.duree}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {medecin ? (
                          <span>
                            Dr {medecin.nom} {medecin.prenom}
                            {medecin.role === 'superadmin' && (
                              <span className="ml-1 text-xs text-purple-500">(Admin)</span>
                            )}
                          </span>
                        ) : 'â€”'}
                       </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : 'â€”'}
                       </td>
                      <td className="px-4 py-3">
                        <PermissionGate module="ordonnances" requireWrite>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handlePreviewPDF(o, patient)} 
                              disabled={previewId === o.id}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="AperÃ§u PDF"
                            >
                              {previewId === o.id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                            
                            <button 
                              onClick={() => handleExportPDF(o, patient)} 
                              disabled={exportingId === o.id}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="TÃ©lÃ©charger PDF"
                            >
                              {exportingId === o.id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </button>
                            
                            <button onClick={() => openEdit(o)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Modifier">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            <button onClick={() => setConfirmD(o)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </PermissionGate>
                       </td>
                     </tr>
                  )
                })
              )}
            </tbody>
           </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editO ? 'Modifier l\'ordonnance' : 'Nouvelle ordonnance'} confirmOnClose>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Patient</label>
            <select value={form.patient_id} onChange={set('patient_id')} disabled={loadingPatients}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:bg-gray-50 disabled:text-gray-400">
              <option value="">-- Choisir un patient --</option>
              {patientOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ðŸ‘¨â€âš•ï¸ MÃ©decin traitant</label>
            <select value={form.id_medecin_traitant || ''} onChange={set('id_medecin_traitant')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              <option value="">-- SÃ©lectionner un mÃ©decin traitant --</option>
              {medecins.map(m => (
                <option key={m.id} value={m.id}>
                  Dr {m.nom} {m.prenom} 
                  {m.role === 'superadmin' ? ' (Super Admin)' : ''}
                  {m.specialite ? ` - ${m.specialite}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">MÃ©decin traitant du patient (optionnel)</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">MÃ©dicaments</label>
            <textarea value={form.medicaments} onChange={set('medicaments')} rows={3}
              placeholder="Ex: Amoxicilline 500mg, IbuprofÃ¨ne 400mg..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Posologie</label>
            <textarea value={form.posologie} onChange={set('posologie')} rows={2}
              placeholder="Ex: 1 comprimÃ© 3x/jour pendant les repas"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">DurÃ©e du traitement</label>
            <select value={form.duree} onChange={set('duree')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              {['3 jours','5 jours','7 jours','10 jours','14 jours','21 jours','1 mois'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2}
              placeholder="Instructions complÃ©mentaires..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              âœï¸ Signature du mÃ©decin
            </label>
            <SignaturePad
              onSave={(signature) => setForm({ ...form, signature: signature })}
              onClear={() => setForm({ ...form, signature: null })}
              initialSignature={form.signature}
            />
            <p className="text-xs text-gray-400 mt-1">
              Dessinez votre signature avec la souris ou le pavÃ© tactile
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Annuler</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Enregistrement...' : (editO ? 'Modifier' : 'CrÃ©er')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirmD} onConfirm={async () => { try { await supprimer(confirmD.id); setConfirmD(null) } catch {} }}
        onCancel={() => setConfirmD(null)} title="Supprimer l'ordonnance"
        message="Supprimer dÃ©finitivement cette ordonnance ?" />
    </div>
  )
}
