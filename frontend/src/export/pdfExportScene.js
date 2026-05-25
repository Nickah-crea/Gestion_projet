// export/pdfExportScene.js
import { COLORS, addStandardHeader, addStandardFooter } from './pdfExport';

export async function exporterPDFScene(pdf, resultat, resultatDetails, margin, yPosition, contentWidth, currentPageNum, itemTitle) {
  let currentY = yPosition;
  let pageNum = currentPageNum;
  
  // === Section Informations de tournage ===
  currentY = addSection(pdf, 'Informations de tournage', margin, currentY);
  
  currentY = addInfoRow(pdf, 'Date', formatDate(resultat.dateTournage), margin, currentY);
  currentY += 6;
  currentY = addInfoRow(pdf, 'Heure début', resultat.heureDebut || '—', margin, currentY);
  currentY += 6;
  currentY = addInfoRow(pdf, 'Heure fin', resultat.heureFin || '—', margin, currentY);
  currentY += 6;
  currentY = addInfoRow(pdf, 'Statut', formatStatut(resultat.statut), margin, currentY);
  currentY += 6;
  currentY = addInfoRow(pdf, 'Durée estimée', calculerDureeScene(resultat.heureDebut, resultat.heureFin), margin, currentY);
  currentY += 12;
  
  // === Localisation ===
  if (resultat.lieuNom || resultat.plateauNom) {
    currentY = addSection(pdf, 'Localisation', margin, currentY);
    
    if (resultat.lieuNom) {
      currentY = addInfoRow(pdf, 'Lieu', resultat.lieuNom, margin, currentY);
      currentY += 6;
    }
    if (resultat.plateauNom) {
      currentY = addInfoRow(pdf, 'Plateau', resultat.plateauNom, margin, currentY);
      currentY += 6;
    }
    currentY += 8;
  }
  
  // === Structure du projet ===
  if (resultat.projetTitre || resultat.episodeTitre || resultat.sequenceTitre) {
    if (currentY > 240) {
      pdf.addPage();
      pageNum++;
      addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Scène - Suite`);
      currentY = 50;
    }
    
    currentY = addSection(pdf, 'Structure du projet', margin, currentY);
    
    if (resultat.projetTitre) {
      currentY = addInfoRow(pdf, 'Projet', resultat.projetTitre, margin, currentY);
      currentY += 6;
    }
    if (resultat.episodeTitre) {
      currentY = addInfoRow(pdf, 'Épisode', resultat.episodeTitre, margin, currentY);
      currentY += 6;
    }
    if (resultat.sequenceTitre) {
      currentY = addInfoRow(pdf, 'Séquence', resultat.sequenceTitre, margin, currentY);
      currentY += 6;
    }
    currentY += 8;
  }
  
  // === Personnages impliqués ===
  if (resultatDetails.personnages && resultatDetails.personnages.length > 0) {
    if (currentY > 240) {
      pdf.addPage();
      pageNum++;
      addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Personnages`);
      currentY = 50;
    }
    
    currentY = addSection(pdf, 'Personnages impliqués', margin, currentY);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.textSecondary);
    
    for (const personnage of resultatDetails.personnages.slice(0, 15)) {
      if (currentY > 260) {
        pdf.addPage();
        pageNum++;
        addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Personnages (suite)`);
        currentY = 50;
        currentY = addSection(pdf, 'Personnages impliqués (suite)', margin, currentY);
      }
      
      const info = `${personnage.nom}${personnage.comedien ? ` (${personnage.comedien})` : ''} — ${personnage.nbDialogues} dialogue${personnage.nbDialogues > 1 ? 's' : ''}`;
      pdf.text(`• ${info}`, margin, currentY);
      currentY += 5;
    }
    
    if (resultatDetails.personnages.length > 15) {
      pdf.text(`• ... et ${resultatDetails.personnages.length - 15} autres personnages`, margin, currentY);
      currentY += 5;
    }
    
    currentY += 8;
  }
  
  // === Dialogues complets ===
  if (resultatDetails.dialoguesComplets && resultatDetails.dialoguesComplets.length > 0) {
    if (currentY > 230) {
      pdf.addPage();
      pageNum++;
      addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Dialogues`);
      currentY = 50;
    }
    
    currentY = addSection(pdf, 'Dialogues', margin, currentY);
    
    // Statistiques des dialogues
    const totalMots = resultatDetails.dialoguesComplets.reduce((total, d) => total + compterMots(d.texte), 0);
    const dureeEstimee = Math.ceil(totalMots / 150);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.textMuted);
    pdf.text(`Total: ${totalMots} mots • Durée estimée: ${dureeEstimee} min`, margin, currentY);
    currentY += 8;
    
    let dialogueCount = 0;
    for (let i = 0; i < resultatDetails.dialoguesComplets.length; i++) {
      const dialogue = resultatDetails.dialoguesComplets[i];
      
      if (dialogueCount >= 25) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(...COLORS.textMuted);
        pdf.text(`... et ${resultatDetails.dialoguesComplets.length - 25} dialogues supplémentaires`, margin, currentY);
        currentY += 6;
        break;
      }
      
      if (currentY > 260) {
        pdf.addPage();
        pageNum++;
        addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Dialogues (suite)`);
        currentY = 50;
        currentY = addSection(pdf, 'Dialogues (suite)', margin, currentY);
      }
      
      // Ligne fine au-dessus
      pdf.setDrawColor(...COLORS.primaryLight);
      pdf.setLineWidth(0.3);
      pdf.line(margin, currentY - 3, 190, currentY - 3);
      
      // Nom du personnage
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...COLORS.accentDark);
      pdf.text(`${dialogue.personnageNom || 'Narrateur'}:`, margin + 8, currentY);
      
      const persoWidth = pdf.getTextWidth(`${dialogue.personnageNom || 'Narrateur'}:`);
      
      // Texte du dialogue
      const texte = dialogue.texte || '';
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...COLORS.textSecondary);
      
      const maxWidth = 165;
      const availableWidth = maxWidth - (persoWidth + 5);
      
      if (availableWidth > 0 && texte.trim()) {
        const wrappedLines = pdf.splitTextToSize(texte, availableWidth);
        if (wrappedLines.length > 0) {
          pdf.text(wrappedLines[0], margin + 8 + persoWidth + 3, currentY);
          currentY += 4;
          
          for (let lineIdx = 1; lineIdx < wrappedLines.length; lineIdx++) {
            if (currentY > 270) {
              pdf.addPage();
              pageNum++;
              addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Dialogues (suite)`);
              currentY = 50;
            }
            pdf.text(wrappedLines[lineIdx], margin + 8 + persoWidth + 3, currentY);
            currentY += 4;
          }
        }
      } else if (texte.trim()) {
        const wrappedLines = pdf.splitTextToSize(texte, maxWidth);
        wrappedLines.forEach(line => {
          if (currentY > 270) {
            pdf.addPage();
            pageNum++;
            addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Dialogues (suite)`);
            currentY = 50;
          }
          pdf.text(line, margin + 8, currentY);
          currentY += 4;
        });
      }
      
      // Observation
      if (dialogue.observation && dialogue.observation.trim()) {
        currentY += 1;
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(...COLORS.textMuted);
        pdf.text(`[Note: ${dialogue.observation}]`, margin + 10, currentY);
        currentY += 3;
      }
      
      // Numéro de dialogue
      pdf.setFontSize(7);
      pdf.setTextColor(...COLORS.textMuted);
      pdf.text(`Dialogue ${dialogue.ordre || i + 1}`, 180, currentY - 3, { align: 'right' });
      
      currentY += 8;
      dialogueCount++;
      
      // Séparation
      if (i < resultatDetails.dialoguesComplets.length - 1 && dialogueCount < 25) {
        pdf.setDrawColor(...COLORS.tertiaryLight);
        pdf.setLineWidth(0.2);
        pdf.line(margin + 5, currentY - 2, 190, currentY - 2);
        currentY += 4;
      }
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

function compterMots(texte) {
  if (!texte) return 0;
  return texte.split(/\s+/).filter(word => word.length > 0).length;
}

