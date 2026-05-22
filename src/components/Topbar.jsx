import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import Modal from './Modal'
import FormulairePatient from './FormulairePatient'
import FormulaireRdv from './FormulaireRdv'
import ConfirmDialog from './ConfirmDialog'
import { usePatients } from '../hooks/usePatients'
import { useRendezVous } from '../hooks/useRendezVous'

const PAGE_TITLES = {
  '/': 'Tableau de bord',
  '/rendez-vous': 'Rendez-vous',
  '/patients': 'Patients',
  '/ordonnances': 'Ordonnances',
  '/facturation': 'Facturation',
  '/stock': 'Stock',
  '/rappels': 'Rappels SMS',
  '/rapports': 'Rapports',
  '/utilisateurs': 'Utilisateurs',
}

const EMPTY_PATIENT = {
  nom: '', prenom: '', telephone: '', email: '',
  date_naissance: '', adresse: '', groupe_sanguin: '',
}

const EMPTY_RDV = {
  patient_id: '', date: '', heure: '', motif: '', notes: '', statut: '',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { ajouterPatient } = usePatients()
  const { ajouterRdv } = useRendezVous()

  // â”€â”€ Ã‰tat des modales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [modalPatient, setModalPatient] = useState(false)
  const [modalRdv, setModalRdv]         = useState(false)

  // â”€â”€ Ã‰tat des formulaires (pour dÃ©tecter dirty) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [formPatient, setFormPatient] = useState(EMPTY_PATIENT)
  const [formRdv, setFormRdv]         = useState(EMPTY_RDV)

  // â”€â”€ Confirmation d'abandon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [confirmPatient, setConfirmPatient] = useState(false)
  const [confirmRdv, setConfirmRdv]         = useState(false)

  const title      = PAGE_TITLES[pathname] || 'Dashboard'
  const showButtons = !['/rendez-vous', '/patients'].includes(pathname)

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  // â”€â”€ Helpers dirty â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const isDirty = (form, empty) =>
    Object.keys(empty).some((k) => (form[k] ?? '') !== (empty[k] ?? ''))

  // â”€â”€ Ouverture des modales (rÃ©initialise le form) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openPatient = () => { setFormPatient(EMPTY_PATIENT); setModalPatient(true) }
  const openRdv     = () => { setFormRdv(EMPTY_RDV);         setModalRdv(true) }

  // â”€â”€ Tentative de fermeture (avec ou sans confirmation) â”€â”€â”€â”€â”€â”€
  const requestClosePatient = useCallback(() => {
    if (isDirty(formPatient, EMPTY_PATIENT)) {
      setConfirmPatient(true)
    } else {
      setModalPatient(false)
    }
  }, [formPatient])

  const requestCloseRdv = useCallback(() => {
    if (isDirty(formRdv, EMPTY_RDV)) {
      setConfirmRdv(true)
    } else {
      setModalRdv(false)
    }
  }, [formRdv])

  // â”€â”€ Fermeture confirmÃ©e â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const forceClosePatient = () => {
    setConfirmPatient(false)
    setModalPatient(false)
    setFormPatient(EMPTY_PATIENT)
  }

  const forceCloseRdv = () => {
    setConfirmRdv(false)
    setModalRdv(false)
    setFormRdv(EMPTY_RDV)
  }

  return (
    <>
      {/* â”€â”€ En-tÃªte â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{today}</p>
        </div>

        {showButtons && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openRdv}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-3 rounded-2xl transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nouveau RDV</span>
            </button>

            <button
              onClick={openPatient}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-3 rounded-2xl transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Nouveau Patient</span>
            </button>
          </div>
        )}
      </div>

      {/* â”€â”€ Modale RDV â”€â”€ */}
      <Modal
        isOpen={modalRdv}
        onClose={requestCloseRdv}   /* clic sur la croix ou hors modale â†’ confirmation si dirty */
        title="Nouveau rendez-vous"
      >
        <FormulaireRdv
          /* On remonte les changements du formulaire pour dÃ©tecter dirty */
          onFormChange={setFormRdv}
          onSubmit={async (d) => {
            await ajouterRdv(d)
            setModalRdv(false)
            setFormRdv(EMPTY_RDV)
            navigate('/rendez-vous')
          }}
          onCancel={requestCloseRdv}
        />
      </Modal>

      {/* â”€â”€ Modale Patient â”€â”€ */}
      <Modal
        isOpen={modalPatient}
        onClose={requestClosePatient}
        title="Nouveau patient"
      >
        <FormulairePatient
          onFormChange={setFormPatient}
          onSubmit={async (d) => {
            await ajouterPatient(d)
            setModalPatient(false)
            setFormPatient(EMPTY_PATIENT)
            navigate('/patients')
          }}
          onCancel={requestClosePatient}
        />
      </Modal>

      {/* â”€â”€ ConfirmDialog abandon Patient â”€â”€ */}
      <ConfirmDialog
        isOpen={confirmPatient}
        tone="warning"
        title="Abandonner le formulaire ?"
        message="Les informations saisies ne seront pas enregistrÃ©es. Voulez-vous vraiment fermer ce formulaire ?"
        confirmLabel="Abandonner"
        cancelLabel="Continuer la saisie"
        onConfirm={forceClosePatient}
        onCancel={() => setConfirmPatient(false)}
      />

      {/* â”€â”€ ConfirmDialog abandon RDV â”€â”€ */}
      <ConfirmDialog
        isOpen={confirmRdv}
        tone="warning"
        title="Abandonner le formulaire ?"
        message="Les informations saisies ne seront pas enregistrÃ©es. Voulez-vous vraiment fermer ce formulaire ?"
        confirmLabel="Abandonner"
        cancelLabel="Continuer la saisie"
        onConfirm={forceCloseRdv}
        onCancel={() => setConfirmRdv(false)}
      />
    </>
  )
}
