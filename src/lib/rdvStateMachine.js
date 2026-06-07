/**
 * Machine à états pour les Rendez-vous
 * Gère les transitions valides et les permissions par rôle
 */

export const RDV_STATES = {
  PROGRAMME: 'programmé',
  CONFIRME: 'confirmé',
  TERMINE: 'terminé',
  ANNULE: 'annulé',
};

export const RDV_ACTIONS = {
  CONFIRMER: 'confirmer',
  TERMINER_PRESENT: 'terminerPresent',
  MARQUER_ABSENT: 'marquerAbsent',
  MARQUER_ABSENT_DEPART: 'marquerAbsentDepart',
  ANNULER: 'annuler',
  RECTIFIER: 'rectifier',
  RESTAURER: 'restaurer',
};

/**
 * Transitions autorisées: {état_actuel: [{action, destination, acteurs_autorisés, condition}]}
 */
export const TRANSITIONS = {
  [RDV_STATES.PROGRAMME]: [
    { 
      action: RDV_ACTIONS.CONFIRMER, 
      destination: RDV_STATES.CONFIRME, 
      actors: ['medecin', 'superadmin'],
      label: 'Confirmer',
      color: 'green',
    },
    { 
      action: RDV_ACTIONS.MARQUER_ABSENT_DEPART, 
      destination: RDV_STATES.TERMINE, 
      actors: ['medecin', 'superadmin'],
      data: { patient_present: false },
      label: 'Absent dès départ',
      color: 'orange',
    },
    { 
      action: RDV_ACTIONS.ANNULER, 
      destination: RDV_STATES.ANNULE, 
      actors: ['secretaire', 'medecin', 'superadmin'],
      label: 'Annuler',
      color: 'red',
    },
  ],

  [RDV_STATES.CONFIRME]: [
    { 
      action: RDV_ACTIONS.TERMINER_PRESENT, 
      destination: RDV_STATES.TERMINE, 
      actors: ['medecin', 'superadmin'],
      data: { patient_present: true },
      label: 'Terminer (Présent)',
      color: 'blue',
    },
    { 
      action: RDV_ACTIONS.MARQUER_ABSENT, 
      destination: RDV_STATES.TERMINE, 
      actors: ['medecin', 'superadmin'],
      data: { patient_present: false },
      label: 'Marquer absent',
      color: 'red',
    },
    { 
      action: RDV_ACTIONS.RECTIFIER, 
      destination: RDV_STATES.PROGRAMME, 
      actors: ['medecin', 'superadmin'],
      label: 'Rectifier',
      color: 'gray',
    },
    { 
      action: RDV_ACTIONS.ANNULER, 
      destination: RDV_STATES.ANNULE, 
      actors: ['medecin', 'superadmin'],
      label: 'Annuler',
      color: 'red',
    },
  ],

  [RDV_STATES.TERMINE]: [
    { 
      action: RDV_ACTIONS.RECTIFIER, 
      destination: RDV_STATES.PROGRAMME, 
      actors: ['medecin', 'superadmin'],
      condition: 'patient_present IS NULL',
      label: 'Rectifier',
      color: 'gray',
    },
    { 
      action: RDV_ACTIONS.ANNULER, 
      destination: RDV_STATES.ANNULE, 
      actors: ['superadmin'],
      label: 'Annuler (Admin)',
      color: 'black',
    },
  ],

  [RDV_STATES.ANNULE]: [
    { 
      action: RDV_ACTIONS.RESTAURER, 
      destination: RDV_STATES.PROGRAMME, 
      actors: ['superadmin'],
      label: 'Restaurer',
      color: 'purple',
    },
  ],
};

/**
 * Vérifie si une transition est autorisée
 * @param {string} currentState - État actuel du RDV
 * @param {string} action - Action à effectuer
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {object} rdv - Objet RDV (pour vérifier les conditions)
 * @returns {boolean}
 */
export function canTransition(currentState, action, userRole, rdv = null) {
  const transitions = TRANSITIONS[currentState];
  
  if (!transitions) return false;
  
  const transition = transitions.find(t => t.action === action);
  
  if (!transition) return false;
  
  // Vérifier le rôle de l'utilisateur
  if (!transition.actors.includes(userRole)) {
    return false;
  }
  
  // Vérifier les conditions supplémentaires
  if (transition.condition && rdv) {
    if (transition.condition === 'patient_present IS NULL' && rdv.patient_present !== null) {
      return false;
    }
  }
  
  return true;
}

/**
 * Obtient les données à envoyer lors d'une transition
 * @param {string} state - État actuel
 * @param {string} action - Action
 * @returns {object} Données à merger dans l'UPDATE
 */
export function getTransitionData(state, action) {
  const transitions = TRANSITIONS[state] || [];
  const transition = transitions.find(t => t.action === action);
  return transition?.data || {};
}

/**
 * Obtient toutes les actions possibles depuis l'état actuel
 * @param {string} currentState - État actuel
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {object} rdv - Objet RDV (pour vérifier les conditions)
 * @returns {array} Actions possibles avec leurs métadonnées
 */
export function getPossibleActions(currentState, userRole, rdv = null) {
  const transitions = TRANSITIONS[currentState] || [];
  
  return transitions.filter(t => {
    // Filtrer par rôle
    if (!t.actors.includes(userRole)) {
      return false;
    }
    
    // Filtrer par conditions
    if (t.condition && rdv) {
      if (t.condition === 'patient_present IS NULL' && rdv.patient_present !== null) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Effectue une transition
 * @param {string} currentState - État actuel
 * @param {string} action - Action à effectuer
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {object} rdv - Objet RDV
 * @returns {object} {success, newState, updateData, error}
 */
export function executeTransition(currentState, action, userRole, rdv = null) {
  // Vérifier si la transition est autorisée
  if (!canTransition(currentState, action, userRole, rdv)) {
    return {
      success: false,
      error: `Transition non autorisée: ${action} depuis ${currentState} pour le rôle ${userRole}`,
    };
  }
  
  const transition = TRANSITIONS[currentState].find(t => t.action === action);
  
  return {
    success: true,
    newState: transition.destination,
    updateData: getTransitionData(currentState, action),
  };
}

/**
 * Labels et styles pour les actions
 */
export function getActionMetadata(action) {
  for (const stateActions of Object.values(TRANSITIONS)) {
    const found = stateActions.find(t => t.action === action);
    if (found) {
      return {
        label: found.label,
        color: found.color,
      };
    }
  }
  return { label: action, color: 'gray' };
}
