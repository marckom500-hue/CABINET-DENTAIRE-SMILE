import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatPhone, formatPhoneList } from "./phone";

const cabinetInfos = {
  nom: "Cabinet Dentaire Smile",
  adresse: "IMMEUBLE QUIFFEROU TAMDJA",
  telephone: "675 06 99 63 / 691 63 58 93",
  email: "cabinetssmile@yahoo.com",
  logoPath: "/SMILE.jpg"
};

async function imageToBase64(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function getOrdonnanceHTML(ordonnance, patient, medecinTraitant, medecinPrescripteur) {
  const date = ordonnance.created_at 
    ? new Date(ordonnance.created_at).toLocaleDateString('fr-FR')
    : new Date().toLocaleDateString('fr-FR');
  
  const nomPatient = patient ? `${patient.prenom || ''} ${patient.nom || ''}`.trim() : "Patient";
  
  const dateNaissance = patient?.date_naissance 
    ? new Date(patient.date_naissance).toLocaleDateString('fr-FR')
    : "Non renseignée";
  const telephone = formatPhone(patient?.telephone, "Non renseignée");
  
  // Information du médecin traitant (celui qui suit le patient)
  const medecinTraitantNom = medecinTraitant 
    ? `Dr ${medecinTraitant.nom} ${medecinTraitant.prenom}`
    : "Non renseignée";
  const medecinTraitantSpecialite = medecinTraitant?.specialite || "";
  const medecinTraitantTel = medecinTraitant?.telephone ? formatPhone(medecinTraitant.telephone, "") : "";
  const cabinetTelephone = formatPhoneList(cabinetInfos.telephone);
  
  // Information du médecin prescripteur (celui qui signe)
  const medecinPrescripteurNom = medecinPrescripteur 
    ? `Dr ${medecinPrescripteur.nom} ${medecinPrescripteur.prenom}`
    : cabinetInfos.nom;
  const medicaments = ordonnance.medicaments || "Aucun médicament prescrit";
  const posologie = ordonnance.posologie || "Aucune posologie indiquée";
  const duree = ordonnance.duree || "7 jours";
  const notes = ordonnance.notes || "";
  const signature = ordonnance.signature || "";

  
  let logoBase64 = null;
  try {
    logoBase64 = await imageToBase64(cabinetInfos.logoPath);
  } catch (e) {
    console.warn("Logo non chargé");
  }
  
  const div = document.createElement('div');
  div.style.width = '210mm';
  div.style.padding = '20px';
  div.style.backgroundColor = 'white';
  div.style.fontFamily = 'Arial, sans-serif';
  
  div.innerHTML = `
    <div style="text-align: center; border-bottom: 3px solid #0f5b7a; padding-bottom: 15px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
        ${logoBase64 ? `<img src="${logoBase64}" style="height: 60px; width: auto;" alt="Logo">` : ''}
        <div>
          <div style="font-size: 28px; font-weight: bold; color: #0f5b7a;">${cabinetInfos.nom}</div>
        </div>
      </div>
      <div style="font-size: 11px; color: #666;">${cabinetInfos.adresse}</div>
      <div style="font-size: 10px; color: #888;">☎︎ ${cabinetTelephone} | ✉︎ ${cabinetInfos.email}</div>
    </div>
    
    <!-- MÃ‰DECIN TRAITANT -->
    <div style="background: #e8f4f0; padding: 10px 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #2c7a4d;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; color: #2c7a4d; font-weight: bold;">MÉDECIN TRAITANT</span>
          <div style="font-size: 13px; font-weight: bold; color: #333;">${medecinTraitantNom}</div>
          ${medecinTraitantSpecialite ? `<div style="font-size: 10px; color: #666;">${medecinTraitantSpecialite}</div>` : ''}
        </div>
        ${medecinTraitantTel ? `<div style="font-size: 10px; color: #666;">☎︎ ${medecinTraitantTel}</div>` : ''}
      </div>
    </div>
    
    <!-- INFORMATIONS PATIENT (sans mutuelle) -->
    <div style="background: #f0f7fa; padding: 12px 15px; border-radius: 8px; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: bold; color: #0f5b7a; margin-bottom: 10px; border-bottom: 1px solid #cde5f0; padding-bottom: 5px;">INFORMATIONS PATIENT</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div>
          <div style="font-size: 10px; color: #666;">Patient</div>
          <div style="font-size: 13px; font-weight: bold; color: #333;">${nomPatient}</div>
        </div>
        <div>
          <div style="font-size: 10px; color: #666;">Date de naissance</div>
          <div style="font-size: 12px; color: #333;">${dateNaissance}</div>
        </div>
        <div>
          <div style="font-size: 10px; color: #666;">Téléphone</div>
          <div style="font-size: 12px; color: #333;">${telephone}</div>
        </div>
      </div>

      <div style="margin-top: 8px; padding-top: 5px; border-top: 1px dashed #cde5f0;">
        <span style="font-size: 10px; color: #666;">Date ordonnance :</span>
        <span style="font-size: 11px; font-weight: bold; color: #333;"> ${date}</span>
      </div>
    </div>
    
    <div style="text-align: center; font-size: 26px; font-weight: bold; color: #0f5b7a; margin: 20px 0;">ORDONNANCE</div>
    
    <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0f5b7a; color: white; padding: 10px 15px; font-weight: bold;">💊 MÉDICAMENTS PRESCRITS</div>
      <div style="padding: 15px; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${medicaments}</div>
    </div>

    
    <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0f5b7a; color: white; padding: 10px 15px; font-weight: bold;">⚙️ POSOLOGIE</div>
      <div style="padding: 15px; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${posologie}</div>
    </div>

    
    <div style="background: #fff3cd; border-left: 4px solid #e74c3c; padding: 10px 15px; margin: 15px 0; font-weight: bold;">
      🕒 DURÉE DU TRAITEMENT : ${duree}
    </div>

    
    ${notes ? `<div style="background: #f9f9f9; padding: 10px 15px; border-radius: 8px; margin: 15px 0; font-size: 11px; color: #666; font-style: italic;">📝 NOTE : ${notes}</div>` : ''}

    
    <!-- ZONE SIGNATURE AVEC LE NOM DU MÃ‰DECIN TRAITANT ET SA SIGNATURE DESSINÃ‰E -->
    <div style="margin-top: 40px; text-align: right; border-top: 1px dashed #ccc; padding-top: 30px;">
      <div style="width: 250px; text-align: center; margin-left: auto;">
        <div style="font-size: 12px; font-weight: bold; color: #0f5b7a; margin-bottom: 8px;">
          ${medecinTraitantNom}
        </div>
        ${signature ? `
          <img src="${signature}" style="height: 60px; margin: 5px auto; display: block; border: 1px solid #e0e0e0; border-radius: 4px;" alt="Signature">
        ` : '<div style="height: 60px; border-bottom: 1px solid #999; margin: 5px 0;"></div>'}
        <div style="font-size: 9px; color: #999; margin-top: 8px;">
          Signature & Cachet du médecin
        </div>

      </div>
    </div>
    
    <div style="margin-top: 30px; text-align: center; font-size: 7px; color: #aaa; border-top: 1px solid #eee; padding-top: 15px;">
      ${cabinetInfos.nom} - ${cabinetInfos.adresse}<br>
      ${cabinetTelephone} - ${cabinetInfos.email}
    </div>
  `;
  
  return div;
}

export async function generateOrdonnancePDF(ordonnance, patient, medecinTraitant, medecinPrescripteur) {
  const element = await getOrdonnanceHTML(ordonnance, patient, medecinTraitant, medecinPrescripteur);
  
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '0';
  document.body.appendChild(element);
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    document.body.removeChild(element);
    
    return pdf;
  } catch (error) {
    console.error("Erreur:", error);
    document.body.removeChild(element);
    throw error;
  }
}

export async function downloadOrdonnancePDF(ordonnance, patient, medecinTraitant, medecinPrescripteur) {
  const pdf = await generateOrdonnancePDF(ordonnance, patient, medecinTraitant, medecinPrescripteur);
  const nomFichier = patient?.nom 
    ? `ordonnance_${patient.nom}_${new Date().toISOString().slice(0, 10)}.pdf`
    : `ordonnance_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(nomFichier);
}

export async function previewOrdonnancePDF(ordonnance, patient, medecinTraitant, medecinPrescripteur) {
  const pdf = await generateOrdonnancePDF(ordonnance, patient, medecinTraitant, medecinPrescripteur);
  const pdfBlob = pdf.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
