// export/pdfExportPersonnage.js

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

function addStatRow(pdf, label, value, margin, yPosition) {
  let currentY = yPosition;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.textMedium);
  pdf.text(label, margin, currentY);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.primary);
  pdf.text(value.toString(), margin + 70, currentY);
  
  currentY += 7;
  
  return currentY;
}

export function exporterPDFPersonnage(pdf, resultat, resultatDetails, margin, yPosition, contentWidth) {
  let currentY = yPosition;
  
  // Section Informations du personnage
  currentY = addSection(pdf, 'Informations du personnage', margin, currentY);
  
  currentY = addInfoRow(pdf, 'Comedien :', resultat.comedienNom || '—', margin, currentY);
  currentY += 4;
  
  if (resultatDetails.informationsComplementaires?.age) {
    currentY = addInfoRow(pdf, 'Age :', resultatDetails.informationsComplementaires.age, margin, currentY);
    currentY += 4;
  }
  
  if (resultatDetails.informationsComplementaires?.typePersonnage) {
    currentY = addInfoRow(pdf, 'Type :', resultatDetails.informationsComplementaires.typePersonnage, margin, currentY);
    currentY += 4;
  }
  
  currentY += 8;
  
  // Section Projet
  currentY = addSection(pdf, 'Projet', margin, currentY);
  currentY = addInfoRow(pdf, 'Projet :', resultat.projetTitre || '—', margin, currentY);
  currentY += 8;
  
  // Section Statistiques
  if (resultatDetails.statistiques) {
    currentY = addSection(pdf, 'Statistiques', margin, currentY);
    
    const stats = resultatDetails.statistiques;
    
    currentY = addStatRow(pdf, 'Scenes', stats.nbScenes || 0, margin, currentY);
    currentY = addStatRow(pdf, 'Dialogues', stats.nbDialogues || 0, margin, currentY);
    currentY = addStatRow(pdf, 'Total mots', stats.totalMots || 0, margin, currentY);
    
    if (stats.pourcentageDialogues) {
      const pourcentage = Math.round(stats.pourcentageDialogues * 100) / 100;
      currentY = addStatRow(pdf, 'Part dialogues', `${pourcentage}%`, margin, currentY);
    }
    
    if (stats.dureeTotale) {
      currentY = addStatRow(pdf, 'Duree totale', stats.dureeTotale, margin, currentY);
    }
    
    currentY += 8;
  }
  
  // Planning de tournage
  const scenesAvecPlanning = resultatDetails.scenes?.filter(scene => scene.dateTournage) || [];
  if (scenesAvecPlanning.length > 0) {
    currentY = exporterPlanningTournage(pdf, scenesAvecPlanning, margin, currentY);
  }
  
  // Dialogues
  if (resultatDetails.dialogues && resultatDetails.dialogues.length > 0) {
    currentY = exporterDialoguesPersonnage(pdf, resultatDetails.dialogues, margin, currentY, contentWidth);
  }
  
  return currentY;
}

function exporterPlanningTournage(pdf, scenes, margin, yPosition) {
  let currentY = yPosition;
  
  currentY = addSection(pdf, 'Planning de tournage', margin, currentY);
  
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    
    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
      currentY = addSection(pdf, 'Planning de tournage (suite)', margin, currentY);
    }
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.primary);
    pdf.text(`${i + 1}. ${scene.titre}`, margin, currentY);
    currentY += 6;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.textMedium);
    
    const dateStr = formatDate(scene.dateTournage);
    const heureStr = scene.heureDebut && scene.heureFin ? `${scene.heureDebut} - ${scene.heureFin}` : 'Horaires non specifies';
    const lieuStr = scene.lieuNom ? ` • ${scene.lieuNom}` : '';
    
    pdf.text(`${dateStr}  •  ${heureStr}${lieuStr}`, margin + 4, currentY);
    currentY += 5;
    
    if (scene.nbDialogues) {
      pdf.setTextColor(COLORS.accent);
      pdf.text(`${scene.nbDialogues} dialogue${scene.nbDialogues > 1 ? 's' : ''}`, margin + 4, currentY);
      currentY += 4;
    }
    
    currentY += 6;
  }
  
  return currentY + 5;
}

function exporterDialoguesPersonnage(pdf, dialogues, margin, yPosition, contentWidth) {
  let currentY = yPosition;
  
  currentY = addSection(pdf, 'Dialogues', margin, currentY);
  
  let dialogueCount = 0;
  for (const dialogue of dialogues) {
    if (dialogueCount >= 25) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(COLORS.textLight);
      pdf.text(`... et ${dialogues.length - 25} dialogues supplementaires`, margin, currentY);
      currentY += 6;
      break;
    }
    
    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
      currentY = addSection(pdf, 'Dialogues (suite)', margin, currentY);
    }
    
    const personnage = dialogue.personnageNom || 'Narrateur';
    const texte = dialogue.texte;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.primary);
    pdf.text(personnage, margin, currentY);
    currentY += 5;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.textMedium);
    
    const lines = pdf.splitTextToSize(`« ${texte} »`, contentWidth - 10);
    lines.forEach(line => {
      pdf.text(line, margin + 4, currentY);
      currentY += 4;
    });
    
    currentY += 4;
    dialogueCount++;
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

