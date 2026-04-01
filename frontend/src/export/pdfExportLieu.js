// export/pdfExportLieu.js

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

export function exporterPDFLieu(pdf, resultat, resultatDetails, margin, yPosition, contentWidth) {
  let currentY = yPosition;
  
  // Section Informations du lieu
  currentY = addSection(pdf, 'Informations du lieu', margin, currentY);
  
  currentY = addInfoRow(pdf, 'Type :', getTypeFromDescription(resultat.description), margin, currentY);
  currentY += 4;
  
  if (resultatDetails.informationsComplementaires?.adresse) {
    currentY = addInfoRow(pdf, 'Adresse :', resultatDetails.informationsComplementaires.adresse, margin, currentY);
    currentY += 4;
  }
  
  currentY += 8;
  
  // Section Scenes tournees ici
  if (resultatDetails.scenes && resultatDetails.scenes.length > 0) {
    currentY = addSection(pdf, 'Scenes tournees ici', margin, currentY);
    
    for (let i = 0; i < Math.min(resultatDetails.scenes.length, 20); i++) {
      const scene = resultatDetails.scenes[i];
      
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
        currentY = addSection(pdf, 'Scenes tournees ici (suite)', margin, currentY);
      }
      
      // Titre de la scene
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(COLORS.primary);
      pdf.text(`${i + 1}. ${scene.titre}`, margin, currentY);
      currentY += 6;
      
      // Details
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(COLORS.textMedium);
      
      const dateStr = formatDate(scene.dateTournage);
      const statutStr = formatStatut(scene.statut);
      const heureStr = scene.heureDebut && scene.heureFin ? `${scene.heureDebut} - ${scene.heureFin}` : 'Horaires non specifies';
      
      pdf.text(`${dateStr}  •  ${statutStr}  •  ${heureStr}`, margin + 4, currentY);
      currentY += 5;
      
      if (scene.nbPersonnages) {
        pdf.setTextColor(COLORS.accent);
        pdf.text(`${scene.nbPersonnages} personnage${scene.nbPersonnages > 1 ? 's' : ''}`, margin + 4, currentY);
        currentY += 4;
      }
      
      currentY += 6;
    }
    
    if (resultatDetails.scenes.length > 20) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(COLORS.textLight);
      pdf.text(`... et ${resultatDetails.scenes.length - 20} scenes supplementaires`, margin, currentY);
      currentY += 6;
    }
  }
  
  return currentY + 5;
}

function getTypeFromDescription(description) {
  if (!description) return '—';
  const desc = description.toLowerCase();
  if (desc.includes('interieur')) return 'Interieur';
  if (desc.includes('exterieur')) return 'Exterieur';
  if (desc.includes('studio')) return 'Studio';
  if (desc.length > 40) return description.substring(0, 37) + '...';
  return description;
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
    'annule': 'Annule',
    'tourne': 'Tourne',
    'monte': 'Monte',
    'valide': 'Valide'
  };
  return statuts[statut] || statut || '—';
}
