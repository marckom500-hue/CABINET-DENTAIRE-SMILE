import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Modal from './Modal'
import FormulairePatient from './FormulairePatient'
import FormulaireRdv from './FormulaireRdv'
import { usePatients } from '../hooks/usePatients'
import { useRendezVous } from '../hooks/useRendezVous'

const PAGE_TITLES = {
  '/': 'Tableau de bord', '/rendez-vous': 'Rendez-vous',
  '/patients': 'Patients', '/ordonnances': 'Ordonnances',
  '/facturation': 'Facturation', '/stock': 'Stock',
  '/rappels': 'Rappels SMS', '/rapports': 'Rapports', '/utilisateurs': 'Utilisateurs',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { ajouterPatient } = usePatients()
  const { ajouterRdv }     = useRendezVous()
  const [modalPatient, setModalPatient] = useState(false)
  const [modalRdv,     setModalRdv]     = useState(false)

  const masquerBoutons = ['/rendez-vous', '/patients'].includes(pathname)

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">
            {PAGE_TITLES[pathname] ?? 'Dashboard'}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 capitalize">{today}</p>
        </div>
        {!masquerBoutons && (
          <div className="flex gap-2">
            <button onClick={() => setModalRdv(true)}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs md:text-sm font-medium px-3 md:px-4 py-2 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden xs:inline">Nouveau RDV</span>
              <span className="xs:hidden">RDV</span>
            </button>
            <button onClick={() => setModalPatient(true)}
              className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs md:text-sm font-medium px-3 md:px-4 py-2 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="hidden xs:inline">Nouveau patient</span>
              <span className="xs:hidden">Patient</span>
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={modalRdv} onClose={() => setModalRdv(false)} title="Nouveau rendez-vous">
        <FormulaireRdv
          onSubmit={async (d) => { await ajouterRdv(d); setModalRdv(false); navigate('/rendez-vous') }}
          onCancel={() => setModalRdv(false)} />
      </Modal>
      <Modal isOpen={modalPatient} onClose={() => setModalPatient(false)} title="Nouveau patient">
        <FormulairePatient
          onSubmit={async (d) => { await ajouterPatient(d); setModalPatient(false); navigate('/patients') }}
          onCancel={() => setModalPatient(false)} />
      </Modal>
    </>
  )
}
