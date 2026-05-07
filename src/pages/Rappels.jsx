import { useState, useEffect } from 'react'
import { useRappels } from '../hooks/useRappels'
import { PermissionGate } from '../components/RoleGuard'

const STATUS_MAP = {
  envoye:  { label:'Envoyé',   cls:'bg-teal-100 text-teal-700'   },
  echec:   { label:'Échec',    cls:'bg-red-100 text-red-700'     },
  pending: { label:'En attente',cls:'bg-amber-100 text-amber-700'},
}

const DEFAULT_CONFIG = {
  actif: true,
  delai_heures: 24,
  message_template: "Bonjour {prenom}, vous avez un rendez-vous au Cabinet Dr. Boutchouang le {date} à {heure} ({type_acte}). Pour annuler ou reporter, appelez le 6XX XXX XXX.",
  envoi_auto: true,
}

export default function Rappels() {
  const { rappels, config, loading, sending, sauvegarderConfig, envoyerRappel, rdvSansRappel } = useRappels()
  const [rdvDemain, setRdvDemain]     = useState([])
  const [formConfig, setFormConfig]   = useState(DEFAULT_CONFIG)
  const [onglet, setOnglet]           = useState('historique') // 'historique' | 'config' | 'manuel'
  const [toast, setToast]             = useState(null)
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    if (config) setFormConfig({ ...DEFAULT_CONFIG, ...config })
  }, [config])

  useEffect(() => {
    if (onglet === 'manuel') {
      rdvSansRappel().then(setRdvDemain)
    }
  }, [onglet])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    await sauvegarderConfig(formConfig)
    setSaving(false)
    showToast('Configuration sauvegardée ✓')
  }

  const handleEnvoyer = async (rdvId) => {
    const res = await envoyerRappel(rdvId)
    if (res.success) showToast('Rappel envoyé avec succès ✓')
    else showToast(`Erreur : ${res.error}`, 'error')
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-teal-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Rappels SMS</h2>
          <p className="text-sm text-gray-500">Automatisation des rappels de rendez-vous</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          formConfig.actif ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${formConfig.actif ? 'bg-teal-500 animate-pulse' : 'bg-gray-400'}`} />
          {formConfig.actif ? 'Rappels actifs' : 'Rappels désactivés'}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-teal-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total envoyés</p>
          <p className="text-2xl font-bold text-teal-700">{rappels.filter(r => r.statut === 'envoye').length}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Échecs</p>
          <p className="text-2xl font-bold text-red-600">{rappels.filter(r => r.statut === 'echec').length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">RDV demain</p>
          <p className="text-2xl font-bold text-blue-700">{rdvDemain.length}</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {[
            { key:'historique', label:'Historique' },
            { key:'manuel',     label:'Envoi manuel' },
            { key:'config',     label:'Configuration' },
          ].map(t => (
            <button key={t.key} onClick={() => setOnglet(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                onglet === t.key
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu onglet Historique */}
      {onglet === 'historique' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Téléphone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">RDV</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Envoyé le</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">Chargement...</td></tr>
                ) : rappels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="text-gray-400 text-sm">Aucun rappel envoyé pour l'instant</div>
                      <div className="text-gray-400 text-xs mt-1">Les rappels automatiques apparaîtront ici</div>
                    </td>
                  </tr>
                ) : rappels.map(r => {
                  const rdv     = r.rendez_vous
                  const patient = rdv?.patients
                  const s       = STATUS_MAP[r.statut] ?? STATUS_MAP.pending
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {patient ? `${patient.prenom} ${patient.nom}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{patient?.telephone ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {rdv ? `${rdv.date} à ${rdv.heure}` : '—'}<br />
                        <span className="text-xs text-gray-400">{rdv?.type_acte}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(r.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                        {r.statut === 'echec' && r.erreur && (
                          <p className="text-xs text-red-400 mt-0.5">{r.erreur}</p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenu onglet Envoi manuel */}
      {onglet === 'manuel' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <strong>RDV de demain sans rappel envoyé.</strong> Cliquez sur "Envoyer" pour déclencher manuellement un SMS.
          </div>
          {rdvDemain.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
              Aucun RDV prévu demain sans rappel
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {rdvDemain.map(rdv => (
                <div key={rdv.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {rdv.patients?.prenom} {rdv.patients?.nom}
                    </p>
                    <p className="text-xs text-gray-500">{rdv.date} à {rdv.heure} — {rdv.type_acte}</p>
                    <p className="text-xs text-gray-400">{rdv.patients?.telephone}</p>
                  </div>
                  <PermissionGate module="rappels" requireWrite>
                    <button
                      onClick={() => handleEnvoyer(rdv.id)}
                      disabled={sending}
                      className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {sending ? '...' : 'Envoyer'}
                    </button>
                  </PermissionGate>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenu onglet Configuration */}
      {onglet === 'config' && (
        <PermissionGate module="rappels" requireWrite
          fallback={<div className="bg-gray-50 rounded-xl p-8 text-center text-sm text-gray-500">Vous n'avez pas les droits pour modifier la configuration.</div>}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-2xl">
            {/* Activation */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Rappels automatiques actifs</p>
                <p className="text-xs text-gray-500 mt-0.5">Les SMS sont envoyés automatiquement via Supabase cron</p>
              </div>
              <button
                onClick={() => setFormConfig(c => ({ ...c, actif: !c.actif }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formConfig.actif ? 'bg-teal-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formConfig.actif ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Délai */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Délai d'envoi avant le RDV
              </label>
              <select
                value={formConfig.delai_heures}
                onChange={e => setFormConfig(c => ({ ...c, delai_heures: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value={2}>2 heures avant</option>
                <option value={6}>6 heures avant</option>
                <option value={12}>12 heures avant</option>
                <option value={24}>24 heures avant (recommandé)</option>
                <option value={48}>48 heures avant</option>
              </select>
            </div>

            {/* Template message */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Modèle du message SMS
              </label>
              <textarea
                value={formConfig.message_template}
                onChange={e => setFormConfig(c => ({ ...c, message_template: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Variables disponibles : <code className="bg-gray-100 px-1 rounded">{'{prenom}'}</code>{' '}
                <code className="bg-gray-100 px-1 rounded">{'{nom}'}</code>{' '}
                <code className="bg-gray-100 px-1 rounded">{'{date}'}</code>{' '}
                <code className="bg-gray-100 px-1 rounded">{'{heure}'}</code>{' '}
                <code className="bg-gray-100 px-1 rounded">{'{type_acte}'}</code>
              </p>
            </div>

            {/* Aperçu */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Aperçu du message</p>
              <p className="text-sm text-gray-700">
                {formConfig.message_template
                  .replace('{prenom}', 'Marie')
                  .replace('{nom}', 'NKANA')
                  .replace('{date}', 'lundi 30 avril')
                  .replace('{heure}', '09h30')
                  .replace('{type_acte}', 'Détartrage')}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-700">
              <strong>Configuration Twilio :</strong> Pour activer l'envoi réel, renseignez les secrets
              <code> SMS_PROVIDER</code>, <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code> et
              <code> TWILIO_FROM_NUMBER</code> dans l'Edge Function Supabase <code>send-rappel-rdv</code>.
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
            </button>
          </div>
        </PermissionGate>
      )}
    </div>
  )
}
