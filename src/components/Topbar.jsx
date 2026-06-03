import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import Modal from './Modal'
import FormulairePatient from './FormulairePatient'
import FormulaireRdv from './FormulaireRdv'
import ConfirmDialog from './ConfirmDialog'
import ReminderNotificationBell from './ReminderNotificationBell'
import NotificationCenter from './NotificationCenter'
import { usePatients } from '../hooks/usePatients'
import { useRendezVous } from '../hooks/useRendezVous'
import { useAuthContext } from '../hooks/AuthContext'

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
  const { profile, role } = useAuthContext()

  // ── État des modales ──────────────────────────────────────────────────
  const [modalPatient, setModalPatient] = useState(false)
  const [modalRdv, setModalRdv]         = useState(false)

  // ── État des formulaires (pour détecter dirty) ────────────────────────
  const [formPatient, setFormPatient] = useState(EMPTY_PATIENT)
  const [formRdv, setFormRdv]         = useState(EMPTY_RDV)

  // ── Confirmation d'abandon ────────────────────────────────────────────
  const [confirmPatient, setConfirmPatient] = useState(false)
  const [confirmRdv, setConfirmRdv]         = useState(false)

  const title      = PAGE_TITLES[pathname] || 'Dashboard'
  const showButtons = !['/rendez-vous', '/patients'].includes(pathname)

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  )
  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    , 1000)
    return () => clearInterval(id)
  }, [])

  // ── Helpers dirty ─────────────────────────────────────────────────────
  const isDirty = (form, empty) =>
    Object.keys(empty).some((k) => (form[k] ?? '') !== (empty[k] ?? ''))

  // ── Ouverture des modales (réinitialise le form) ──────────────────────
  const openPatient = () => { setFormPatient(EMPTY_PATIENT); setModalPatient(true) }
  const openRdv     = () => { setFormRdv(EMPTY_RDV);         setModalRdv(true) }

  // ── Tentative de fermeture (avec ou sans confirmation) ────────────────
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

  // ── Fermeture confirmée ───────────────────────────────────────────────
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
      {/* ── En-tête Réduit avec Défilement Auto ── */}
      <div className="flex flex-col gap-3 pb-4">
        {/* Bandeau Principal Réduit */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 sm:p-5 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="min-w-0 overflow-hidden">
              <p className="text-sm sm:text-base font-medium opacity-90">Bienvenue</p>
              
              {/* Défilement Automatique du Nom */}
              <div className="overflow-hidden bg-white/10 rounded-lg py-1 px-2 mt-1">
                <style>{`
                  @keyframes scroll-text {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                  }
                  .auto-scroll {
                    animation: scroll-text 10s linear infinite;
                    display: inline-block;
                    white-space: nowrap;
                  }
                `}</style>
                <h1 className="text-lg sm:text-2xl md:text-2xl font-bold font-serif auto-scroll">
                  {(role === 'medecin' || role === 'superadmin') && 'Dr. '}
                  {profile?.prenom ? `${profile.prenom} ${profile?.nom || ''}`.trim() : 'Utilisateur'}
                </h1>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs sm:text-sm font-medium opacity-90 capitalize">{today}</p>
              <p className="text-lg sm:text-xl font-mono font-bold">{time}</p>
            </div>
          </div>
          
          {/* Défilement Automatique du Titre de Page */}
          <div className="mt-2 overflow-hidden bg-black/20 rounded-lg py-1 px-2">
            <style>{`
              @keyframes scroll-text-page {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              .auto-scroll-page {
                animation: scroll-text-page 8s linear infinite;
                display: inline-block;
                white-space: nowrap;
              }
            `}</style>
            <p className="text-xs sm:text-sm font-medium auto-scroll-page">
              📍 {title}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div />
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <ReminderNotificationBell />
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
        </div>
      </div>
      <Modal
        isOpen={modalRdv}
        onClose={requestCloseRdv}
        title="Nouveau rendez-vous"
      >
        <FormulaireRdv
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

      {/* ── Modale Patient ── */}
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

      {/* ── ConfirmDialog abandon Patient ── */}
      <ConfirmDialog
        isOpen={confirmPatient}
        tone="warning"
        title="Abandonner le formulaire ?"
        message="Les informations saisies ne seront pas enregistrées. Voulez-vous vraiment fermer ce formulaire ?"
        confirmLabel="Abandonner"
        cancelLabel="Continuer la saisie"
        onConfirm={forceClosePatient}
        onCancel={() => setConfirmPatient(false)}
      />

      {/* ── ConfirmDialog abandon RDV ── */}
      <ConfirmDialog
        isOpen={confirmRdv}
        tone="warning"
        title="Abandonner le formulaire ?"
        message="Les informations saisies ne seront pas enregistrées. Voulez-vous vraiment fermer ce formulaire ?"
        confirmLabel="Abandonner"
        cancelLabel="Continuer la saisie"
        onConfirm={forceCloseRdv}
        onCancel={() => setConfirmRdv(false)}
      />
    </>
  )
}
