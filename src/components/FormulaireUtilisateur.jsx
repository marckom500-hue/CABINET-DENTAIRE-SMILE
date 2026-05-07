// // src/components/FormulaireUtilisateur.jsx
// import { useState } from 'react'
// import FormField from './FormField'

// const empty = { 
//   nom: '', 
//   prenom: '', 
//   email: '', 
//   telephone: '', 
//   role: 'secretaire',
//   actif: true,
//   specialite: ''  // Uniquement pour les médecins
// }

// function normalizeUtilisateur(utilisateur) {
//   if (!utilisateur) return empty
//   return {
//     nom: utilisateur.nom ?? '',
//     prenom: utilisateur.prenom ?? '',
//     email: utilisateur.email ?? '',
//     telephone: utilisateur.telephone ?? '',
//     role: utilisateur.role ?? 'secretaire',
//     actif: utilisateur.actif ?? true,
//     specialite: utilisateur.specialite ?? ''
//   }
// }

// export default function FormulaireUtilisateur({ utilisateur, onSubmit, onCancel }) {
//   const [form, setForm] = useState(normalizeUtilisateur(utilisateur))
//   const [saving, setSaving] = useState(false)
  
//   const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
  
//   // Afficher les champs médicaux seulement pour médecin ou superadmin
//   const showMedicalFields = form.role === 'medecin' || form.role === 'superadmin'
  
//   const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')
//   const emailTouched = Boolean(form.email)
//   const canSubmit = Boolean(form.prenom && form.nom && (!form.email || emailIsValid))

//   const handleSubmit = async () => {
//     if (!canSubmit) return
//     setSaving(true)
//     try {
//       // Nettoyer les données selon le rôle
//       const dataToSubmit = { ...form }
//       if (!showMedicalFields) {
//         delete dataToSubmit.specialite
//       }
//       await onSubmit(dataToSubmit)
//     } catch {
//       // Le hook affiche déjà la notification d'erreur
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <div className="space-y-3">
//       <div className="grid grid-cols-2 gap-3">
//         <FormField 
//           label="Prénom" 
//           value={form.prenom} 
//           onChange={set('prenom')} 
//           required 
//         />
//         <FormField 
//           label="Nom" 
//           value={form.nom} 
//           onChange={set('nom')} 
//           required 
//         />
//       </div>
      
//       <FormField 
//         label="Email" 
//         type="email" 
//         value={form.email} 
//         onChange={set('email')}
//         validationState={emailTouched ? (emailIsValid ? 'success' : 'error') : undefined}
//         validationMessage={emailTouched ? (emailIsValid ? 'Email valide' : 'Email invalide') : 'Format: nom@exemple.com'}
//       />
      
//       <FormField 
//         label="Téléphone" 
//         value={form.telephone} 
//         onChange={set('telephone')}
//         placeholder="6XXXXXXXX"
//         inputMode="numeric"
//       />
      
//       <FormField 
//         label="Rôle" 
//         type="select" 
//         value={form.role} 
//         onChange={set('role')}
//         options={[
//           { value: 'secretaire', label: '📋 Secrétaire' },
//           { value: 'assistant', label: '🦷 Assistant dentaire' },
//           { value: 'comptable', label: '💰 Comptable' },
//           { value: 'medecin', label: '👨‍⚕️ Médecin dentiste' },
//           { value: 'superadmin', label: '👑 Super Administrateur' }
//         ]}
//         required
//       />
      
//       {/* CHAMPS DYNAMIQUES - Apparaissent uniquement pour médecin/superadmin */}
//       {showMedicalFields && (
//         <div className="border-t-2 border-teal-200 pt-4 mt-2">
//           <h3 className="text-sm font-semibold text-teal-700 mb-3">
//             👨‍⚕️ Informations médicales
//           </h3>
          
//           <FormField 
//             label="Spécialité" 
//             type="select" 
//             value={form.specialite} 
//             onChange={set('specialite')}
//             options={[
//               { value: '', label: '-- Sélectionner une spécialité --' },
//               { value: 'Chirurgie dentaire', label: 'Chirurgie dentaire' },
//               { value: 'Orthodontie', label: 'Orthodontie' },
//               { value: 'Parodontologie', label: 'Parodontologie' },
//               { value: 'Endodontie', label: 'Endodontie' },
//               { value: 'Pédodontie', label: 'Pédodontie' },
//               { value: 'Prothèse', label: 'Prothèse dentaire' },
//               { value: 'Implantologie', label: 'Implantologie' }
//             ]}
//           />
//         </div>
//       )}
      
//       <div className="flex items-center gap-2 mt-3">
//         <input
//           type="checkbox"
//           id="actif"
//           checked={form.actif}
//           onChange={(e) => set('actif')(e.target.checked)}
//           className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
//         />
//         <label htmlFor="actif" className="text-sm text-gray-700">
//           Compte actif
//         </label>
//       </div>
      
//       <div className="flex gap-3 pt-4">
//         <button 
//           onClick={onCancel} 
//           className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//         >
//           Annuler
//         </button>
//         <button 
//           onClick={handleSubmit} 
//           disabled={saving || !canSubmit}
//           className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
//         >
//           {saving ? 'Enregistrement...' : (utilisateur ? 'Modifier' : 'Ajouter')}
//         </button>
//       </div>
//     </div>
//   )
// }
// src/components/FormulaireUtilisateur.jsx
import { useState } from 'react'
import FormField from './FormField'

const empty = { 
  nom: '', 
  prenom: '', 
  email: '', 
  telephone: '', 
  role: 'secretaire',
  actif: true,
  specialite: ''
}

function normalizeUtilisateur(utilisateur) {
  if (!utilisateur) return empty
  return {
    nom: utilisateur.nom ?? '',
    prenom: utilisateur.prenom ?? '',
    email: utilisateur.email ?? '',
    telephone: utilisateur.telephone ?? '',
    role: utilisateur.role ?? 'secretaire',
    actif: utilisateur.actif ?? true,
    specialite: utilisateur.specialite ?? ''
  }
}

export default function FormulaireUtilisateur({ utilisateur, onSubmit, onCancel }) {
  const [form, setForm] = useState(normalizeUtilisateur(utilisateur))
  const [saving, setSaving] = useState(false)
  
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
  
  // Les superadmins sont aussi des médecins
  const showMedicalFields = form.role === 'medecin' || form.role === 'superadmin'
  
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')
  const emailTouched = Boolean(form.email)
  const canSubmit = Boolean(form.prenom && form.nom && (!form.email || emailIsValid))

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      const dataToSubmit = { ...form }
      if (!showMedicalFields) {
        delete dataToSubmit.specialite
      }
      await onSubmit(dataToSubmit)
    } catch {
      // Le hook affiche déjà la notification d'erreur
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField 
          label="Prénom" 
          value={form.prenom} 
          onChange={set('prenom')} 
          required 
        />
        <FormField 
          label="Nom" 
          value={form.nom} 
          onChange={set('nom')} 
          required 
        />
      </div>
      
      <FormField 
        label="Email" 
        type="email" 
        value={form.email} 
        onChange={set('email')}
        validationState={emailTouched ? (emailIsValid ? 'success' : 'error') : undefined}
        validationMessage={emailTouched ? (emailIsValid ? 'Email valide' : 'Email invalide') : 'Format: nom@exemple.com'}
      />
      
      <FormField 
        label="Téléphone" 
        value={form.telephone} 
        onChange={set('telephone')}
        placeholder="6XXXXXXXX"
        inputMode="numeric"
      />
      
      <FormField 
        label="Rôle" 
        type="select" 
        value={form.role} 
        onChange={set('role')}
        options={[
          { value: 'secretaire', label: '📋 Secrétaire' },
          { value: 'assistant', label: '🦷 Assistant dentaire' },
          { value: 'comptable', label: '💰 Comptable' },
          { value: 'medecin', label: '👨‍⚕️ Médecin dentiste' },
          { value: 'superadmin', label: '👑 Super Administrateur (Médecin)' }  // 👈 MODIFIÉ
        ]}
        required
      />
      
      {/* Les superadmins ont aussi accès aux champs médicaux */}
      {showMedicalFields && (
        <div className="border-t-2 border-teal-200 pt-4 mt-2">
          <h3 className="text-sm font-semibold text-teal-700 mb-3">
            👨‍⚕️ Informations médicales
          </h3>
          
          <FormField 
            label="Spécialité" 
            type="select" 
            value={form.specialite} 
            onChange={set('specialite')}
            options={[
              { value: '', label: '-- Sélectionner une spécialité --' },
              { value: 'Chirurgie dentaire', label: 'Chirurgie dentaire' },
              { value: 'Orthodontie', label: 'Orthodontie' },
              { value: 'Parodontologie', label: 'Parodontologie' },
              { value: 'Endodontie', label: 'Endodontie' },
              { value: 'Pédodontie', label: 'Pédodontie' },
              { value: 'Prothèse', label: 'Prothèse dentaire' },
              { value: 'Implantologie', label: 'Implantologie' }
            ]}
          />
        </div>
      )}
      
      <div className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          id="actif"
          checked={form.actif}
          onChange={(e) => set('actif')(e.target.checked)}
          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
        />
        <label htmlFor="actif" className="text-sm text-gray-700">
          Compte actif
        </label>
      </div>
      
      <div className="flex gap-3 pt-4">
        <button 
          onClick={onCancel} 
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Annuler
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={saving || !canSubmit}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : (utilisateur ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </div>
  )
}