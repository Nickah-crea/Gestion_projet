// export/pdfExportPlateau.js
import { COLORS, addStandardHeader, addStandardFooter } from './pdfExport';

export async function exporterPDFPlateau(pdf, resultat, resultatDetails, margin, yPosition, contentWidth, currentPageNum, itemTitle) {
  let currentY = yPosition;
  let pageNum = currentPageNum;
  
  // === Section Informations du plateau ===
  currentY = addSection(pdf, 'Informations du plateau', margin, currentY);
  
  currentY = addInfoRow(pdf, 'Type', getTypeFromDescription(resultat.description), margin, currentY);
  currentY += 6;
  
  if (resultat.lieuNom) {
    currentY = addInfoRow(pdf, 'Lieu', resultat.lieuNom, margin, currentY);
    currentY += 6;
  }
  
  currentY += 12;
  
  // === Scènes tournées ici ===
  if (resultatDetails.scenes && resultatDetails.scenes.length > 0) {
    if (currentY > 230) {
      pdf.addPage();
      pageNum++;
      addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Scènes`);
      currentY = 50;
    }
    
    currentY = addSection(pdf, 'Scènes tournées ici', margin, currentY);
    
    for (let i = 0; i < Math.min(resultatDetails.scenes.length, 20); i++) {
      const scene = resultatDetails.scenes[i];
      
      if (currentY > 250) {
        pdf.addPage();
        pageNum++;
        addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Scènes (suite)`);
        currentY = 50;
        currentY = addSection(pdf, 'Scènes tournées ici (suite)', margin, currentY);
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...COLORS.primary);
      pdf.text(`${i + 1}. ${scene.titre || 'Scène sans titre'}`, margin, currentY);
      currentY += 6;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...COLORS.textSecondary);
      
      const dateStr = formatDate(scene.dateTournage);
      const statutStr = formatStatut(scene.statut);
      const heureStr = scene.heureDebut && scene.heureFin ? `${scene.heureDebut} - ${scene.heureFin}` : 'Horaires non spécifiés';
      
      pdf.text(`${dateStr}  •  ${statutStr}  •  ${heureStr}`, margin + 4, currentY);
      currentY += 5;
      
      if (scene.nbDialogues) {
        pdf.setTextColor(...COLORS.accent);
        pdf.text(`${scene.nbDialogues} dialogue${scene.nbDialogues > 1 ? 's' : ''}`, margin + 4, currentY);
        currentY += 4;
      }
      
      currentY += 8;
    }
    
    if (resultatDetails.scenes.length > 20) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(...COLORS.textMuted);
      pdf.text(`... et ${resultatDetails.scenes.length - 20} scènes supplémentaires`, margin, currentY);
      currentY += 6;
    }
  }
  
  return currentY + 5;
}

function addSection(pdf, title, margin, yPosition) {
  let currentY = yPosition;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.primaryDark);
  pdf.text(title.toUpperCase(), margin, currentY);
  currentY += 6;
  
  pdf.setDrawColor(...COLORS.primary);
  pdf.setLineWidth(0.5);
  pdf.line(margin, currentY - 1, margin + 45, currentY - 1);
  currentY += 12;
  
  return currentY;
}

function addInfoRow(pdf, label, value, margin, yPosition) {
  let currentY = yPosition;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.textSecondary);
  pdf.text(label, margin, currentY);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.textPrimary);
  
  const valueX = margin + 50;
  const lines = pdf.splitTextToSize(value || '—', 120);
  lines.forEach((line, i) => {
    pdf.text(line, valueX, currentY + (i * 4));
  });
  
  currentY += Math.max(5, lines.length * 4);
  
  return currentY;
}

function getTypeFromDescription(description) {
  if (!description) return '—';
  const desc = description.toLowerCase();
  if (desc.includes('intérieur')) return 'Intérieur';
  if (desc.includes('extérieur')) return 'Extérieur';
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
    'planifie': 'Planifié',
    'confirme': 'Confirmé',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'reporte': 'Reporté',
    'annule': 'Annulé'
  };
  return statuts[statut] || statut || '—';
}


