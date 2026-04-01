// export/pdfExportScene.js

const COLORS = {
  primary: '#5F7E96',
  primaryDark: '#53443D',
  accent: '#AD7556',
  textDark: '#2C241E',
  textMedium: '#6B5A4E',
  textLight: '#9B8A7A',
  border: '#E8E0D5',
  background: '#FDF9F2',
};

function addSection(pdf, title, margin, yPosition) {
  let currentY = yPosition;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.primaryDark);
  pdf.text(title.toUpperCase(), margin, currentY);
  currentY += 6;
  
  pdf.setDrawColor(COLORS.primary);
  pdf.setLineWidth(0.5);
  pdf.line(margin, currentY - 1, margin + 45, currentY - 1);
  currentY += 12;
  
  return currentY;
}

function addInfoRow(pdf, label, value, margin, yPosition) {
  let currentY = yPosition;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.textMedium);
  pdf.text(label, margin, currentY);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.textDark);
  
  const valueX = margin + 50;
  const lines = pdf.splitTextToSize(value || '—', 120);
  lines.forEach((line, i) => {
    pdf.text(line, valueX, currentY + (i * 4));
  });
  
  currentY += Math.max(5, lines.length * 4);
  
  return currentY;
}

export function exporterPDFScene(pdf, resultat, resultatDetails, margin, yPosition, contentWidth) {
  let currentY = yPosition;
  
  // Section Informations de tournage
  currentY = addSection(pdf, 'Informations de tournage', margin, currentY);
  
  currentY = addInfoRow(pdf, 'Date :', formatDate(resultat.dateTournage), margin, currentY);
  currentY += 4;
  currentY = addInfoRow(pdf, 'Heure debut :', resultat.heureDebut || '—', margin, currentY);
  currentY += 4;
  currentY = addInfoRow(pdf, 'Heure fin :', resultat.heureFin || '—', margin, currentY);
  currentY += 4;
  currentY = addInfoRow(pdf, 'Statut :', formatStatut(resultat.statut), margin, currentY);
  currentY += 4;
  currentY = addInfoRow(pdf, 'Duree estimee :', calculerDureeScene(resultat.heureDebut, resultat.heureFin), margin, currentY);
  currentY += 8;
  
  // Localisation
  if (resultat.lieuNom || resultat.plateauNom) {
    currentY = addSection(pdf, 'Localisation', margin, currentY);
    
    if (resultat.lieuNom) {
      currentY = addInfoRow(pdf, 'Lieu :', resultat.lieuNom, margin, currentY);
      currentY += 4;
    }
    if (resultat.plateauNom) {
      currentY = addInfoRow(pdf, 'Plateau :', resultat.plateauNom, margin, currentY);
      currentY += 4;
    }
    currentY += 8;
  }
  
  // Structure du projet
  if (resultat.projetTitre || resultat.episodeTitre || resultat.sequenceTitre) {
    currentY = addSection(pdf, 'Structure du projet', margin, currentY);
    
    if (resultat.projetTitre) {
      currentY = addInfoRow(pdf, 'Projet :', resultat.projetTitre, margin, currentY);
      currentY += 4;
    }
    if (resultat.episodeTitre) {
      currentY = addInfoRow(pdf, 'Episode :', resultat.episodeTitre, margin, currentY);
      currentY += 4;
    }
    if (resultat.sequenceTitre) {
      currentY = addInfoRow(pdf, 'Sequence :', resultat.sequenceTitre, margin, currentY);
      currentY += 4;
    }
    currentY += 8;
  }
  
  // Personnages impliques
  if (resultatDetails.personnages && resultatDetails.personnages.length > 0) {
    currentY = addSection(pdf, 'Personnages impliques', margin, currentY);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.textMedium);
    
    for (const personnage of resultatDetails.personnages) {
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
        currentY = addSection(pdf, 'Personnages impliques (suite)', margin, currentY);
      }
      
      const info = `${personnage.nom}${personnage.comedien ? ` (${personnage.comedien})` : ''} — ${personnage.nbDialogues} dialogue${personnage.nbDialogues > 1 ? 's' : ''}`;
      pdf.text(`• ${info}`, margin, currentY);
      currentY += 5;
    }
    currentY += 6;
  }
  
  // Dialogues complets
  if (resultatDetails.dialoguesComplets && resultatDetails.dialoguesComplets.length > 0) {
    currentY = addSection(pdf, 'Dialogues', margin, currentY);
    
    let dialogueCount = 0;
    for (const dialogue of resultatDetails.dialoguesComplets) {
      if (dialogueCount >= 20) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(COLORS.textLight);
        pdf.text(`... et ${resultatDetails.dialoguesComplets.length - 20} dialogues supplementaires`, margin, currentY);
        currentY += 6;
        break;
      }
      
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
        currentY = addSection(pdf, 'Dialogues (suite)', margin, currentY);
      }
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(COLORS.primary);
      pdf.text(dialogue.personnageNom || 'Narrateur', margin, currentY);
      currentY += 5;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(COLORS.textMedium);
      
      const lines = pdf.splitTextToSize(`« ${dialogue.texte} »`, contentWidth - 10);
      lines.forEach(line => {
        pdf.text(line, margin + 4, currentY);
        currentY += 4;
      });
      
      if (dialogue.observation) {
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(COLORS.accent);
        pdf.text(`Note: ${dialogue.observation}`, margin + 4, currentY);
        currentY += 4;
      }
      
      currentY += 6;
      dialogueCount++;
    }
  }
  
  return currentY + 5;
}

function formatDate(date) {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('fr-FR');
  } catch (error) {
    return '—';
  }
}

function formatStatut(statut) {
  const statuts = {
    'planifie': 'Planifie',
    'confirme': 'Confirme',
    'en_cours': 'En cours',
    'termine': 'Termine',
    'reporte': 'Reporte',
    'annule': 'Annule'
  };
  return statuts[statut] || statut || '—';
}

function calculerDureeScene(debut, fin) {
  if (!debut || !fin) return '—';
  try {
    const [debutHeures, debutMinutes] = debut.split(':').map(Number);
    const [finHeures, finMinutes] = fin.split(':').map(Number);
    const debutTotalMinutes = debutHeures * 60 + debutMinutes;
    const finTotalMinutes = finHeures * 60 + finMinutes;
    const dureeMinutes = finTotalMinutes - debutTotalMinutes;
    if (dureeMinutes <= 0) return '—';
    const heures = Math.floor(dureeMinutes / 60);
    const minutes = dureeMinutes % 60;
    return heures > 0 ? `${heures}h ${minutes}min` : `${minutes}min`;
  } catch (error) {
    return '—';
  }
}

