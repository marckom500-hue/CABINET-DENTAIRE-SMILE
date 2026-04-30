export const mockKPIs = [
  { id:1, label:'Patients total',   value:'148',     trend:'+12%',  trendUp:true,  color:'teal',   icon:'users'   },
  { id:2, label:'RDV aujourd\'hui', value:'12',      trend:'3 urgents', trendUp:null, color:'blue',  icon:'calendar'},
  { id:3, label:'Chiffre d\'affaires', value:'840 000 FCFA', trend:'+8%', trendUp:true, color:'green', icon:'money'},
  { id:4, label:'Urgences',         value:'3',       trend:'-1',    trendUp:false, color:'red',    icon:'alert'   },
]

export const mockAppointments = [
  { id:1, time:'08:00', patient:'Paul ESSAMA',    type:'Détartrage',   status:'confirme', color:'#0d9488' },
  { id:2, time:'09:30', patient:'Marie NKANA',    type:'Extraction',   status:'urgent',   color:'#f43f5e' },
  { id:3, time:'11:00', patient:'Jean MVOGO',     type:'Consultation', status:'attente',  color:'#f59e0b' },
  { id:4, time:'14:00', patient:'Sophie ABANDA',  type:'Implant',      status:'confirme', color:'#0d9488' },
  { id:5, time:'15:30', patient:'Pierre MBALLA',  type:'Radiographie', status:'annule',   color:'#94a3b8' },
]

export const mockPatients = [
  { id:1, nom:'ESSAMA',  prenom:'Paul',   telephone:'699 000 001', statut:'Actif',    age:34 },
  { id:2, nom:'NKANA',   prenom:'Marie',  telephone:'677 000 002', statut:'Urgent',   age:28 },
  { id:3, nom:'MVOGO',   prenom:'Jean',   telephone:'655 000 003', statut:'Inactif',  age:52 },
  { id:4, nom:'ABANDA',  prenom:'Sophie', telephone:'690 000 004', statut:'Actif',    age:41 },
  { id:5, nom:'MBALLA',  prenom:'Pierre', telephone:'670 000 005', statut:'Nouveau',  age:19 },
]

export const mockStock = [
  { id:1, nom:'Gants latex (boîte)',   quantite:45, max:100, seuil:20, couleur:'#0d9488' },
  { id:2, nom:'Masques chirurgicaux',  quantite:12, max:200, seuil:50, couleur:'#f59e0b' },
  { id:3, nom:'Anesthésiant Lidocaïne',quantite:8,  max:50,  seuil:15, couleur:'#f43f5e' },
  { id:4, nom:'Fils de suture',        quantite:30, max:80,  seuil:20, couleur:'#3b82f6' },
  { id:5, nom:'Compresses stériles',   quantite:90, max:200, seuil:40, couleur:'#0d9488' },
]

export const mockNotifications = [
  { id:1, type:'urgent',  message:'Patient NKANA — douleur aiguë signalée',    time:'Il y a 5 min'  },
  { id:2, type:'stock',   message:'Stock anesthésiant sous le seuil critique',  time:'Il y a 1h'     },
  { id:3, type:'rdv',     message:'RDV 14h00 confirmé — Sophie ABANDA',        time:'Il y a 2h'     },
  { id:4, type:'sms',     message:'3 rappels SMS envoyés pour demain',          time:'Ce matin'      },
]
