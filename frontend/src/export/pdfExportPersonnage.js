import { COLORS, addStandardHeader, addStandardFooter } from './pdfExport';

/**
 * Exporte le PDF d'un personnage
 */
export async function exporterPDFPersonnage(pdf, resultat, resultatDetails, margin, yPosition, contentWidth, currentPageNum, itemTitle) {
  let currentY = yPosition;
  let pageNum = currentPageNum;
  
  // === Section Informations du personnage ===
  currentY = addSection(pdf, 'Informations du personnage', margin, currentY);
  
  currentY = addInfoRow(pdf, 'Comédien', resultat.comedienNom || '—', margin, currentY);
  currentY += 6;
  
  if (resultatDetails.informationsComplementaires?.age) {
    currentY = addInfoRow(pdf, 'Âge', resultatDetails.informationsComplementaires.age, margin, currentY);
    currentY += 6;
  }
  
  if (resultatDetails.informationsComplementaires?.typePersonnage) {
    currentY = addInfoRow(pdf, 'Type', resultatDetails.informationsComplementaires.typePersonnage, margin, currentY);
    currentY += 6;
  }
  
  if (resultatDetails.informationsComplementaires?.description) {
    currentY = addInfoRow(pdf, 'Description', resultatDetails.informationsComplementaires.description, margin, currentY);
    currentY += 6;
  }
  
  currentY += 8;
  
  // === Section Projet ===
  if (resultat.projetTitre) {
    currentY = addSection(pdf, 'Projet', margin, currentY);
    currentY = addInfoRow(pdf, 'Projet', resultat.projetTitre, margin, currentY);
    currentY += 12;
  }
  
  // === Section Statistiques ===
  if (resultatDetails.statistiques) {
    currentY = addSection(pdf, 'Statistiques', margin, currentY);
    
    const stats = resultatDetails.statistiques;
    const dialogueCount = resultatDetails.dialogues?.length || 0;
    const scenesCount = resultatDetails.scenes?.length || 0;
    
    // Cartes statistiques
    const cardWidth = 72;
    const cardHeight = 28;
    
    if (currentY + cardHeight > 270) {
      pdf.addPage();
      pageNum++;
      addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Personnage - Suite`);
      currentY = 50;
      currentY = addSection(pdf, 'Statistiques (suite)', margin, currentY);
    }
    
    pdf.setFillColor(...COLORS.primaryLight);
    pdf.roundedRect(margin, currentY, cardWidth, cardHeight, 3, 3, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.textMuted);
    pdf.text("SCÈNES", margin + 5, currentY + 8);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...COLORS.primary);
    pdf.text((stats.nbScenes || scenesCount || 0).toString(), margin + 5, currentY + 24);
    
    pdf.setFillColor(...COLORS.primaryLight);
    pdf.roundedRect(margin + cardWidth + 6, currentY, cardWidth, cardHeight, 3, 3, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.textMuted);
    pdf.text("DIALOGUES", margin + cardWidth + 11, currentY + 8);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...COLORS.accent);
    pdf.text((stats.nbDialogues || dialogueCount || 0).toString(), margin + cardWidth + 11, currentY + 24);
    
    currentY += cardHeight + 8;
    
    if (currentY + cardHeight > 270) {
      pdf.addPage();
      pageNum++;
      addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Personnage - Suite`);
      currentY = 50;
    }
    
    pdf.setFillColor(...COLORS.primaryLight);
    pdf.roundedRect(margin + (cardWidth + 6) / 2, currentY, cardWidth, cardHeight, 3, 3, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.textMuted);
    pdf.text("TOTAL MOTS", margin + (cardWidth + 6) / 2 + 5, currentY + 8);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...COLORS.tertiary);
    pdf.text((stats.totalMots || 0).toLocaleString(), margin + (cardWidth + 6) / 2 + 5, currentY + 24);
    
    currentY += cardHeight + 16;
  }
  
  // === Planning de tournage ===
  const scenesAvecPlanning = resultatDetails.scenes?.filter(scene => scene.dateTournage) || [];
  if (scenesAvecPlanning.length > 0) {
    if (currentY > 250) {
      pdf.addPage();
      pageNum++;
      addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Planning de tournage`);
      currentY = 50;
    }
    
    currentY = addSection(pdf, 'Planning de tournage', margin, currentY);
    
    for (let i = 0; i < Math.min(scenesAvecPlanning.length, 15); i++) {
      const scene = scenesAvecPlanning[i];
      
      if (currentY > 250) {
        pdf.addPage();
        pageNum++;
        addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Planning de tournage (suite)`);
        currentY = 50;
        currentY = addSection(pdf, 'Planning de tournage (suite)', margin, currentY);
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
      const heureStr = scene.heureDebut && scene.heureFin ? `${scene.heureDebut} - ${scene.heureFin}` : 'Horaires non spécifiés';
      const lieuStr = scene.lieuNom ? ` • ${scene.lieuNom}` : '';
      
      pdf.text(`${dateStr}  •  ${heureStr}${lieuStr}`, margin + 4, currentY);
      currentY += 5;
      
      if (scene.nbDialogues) {
        pdf.setTextColor(...COLORS.accent);
        pdf.text(`${scene.nbDialogues} dialogue${scene.nbDialogues > 1 ? 's' : ''}`, margin + 4, currentY);
        currentY += 4;
      }
      
      currentY += 8;
    }
    
    if (scenesAvecPlanning.length > 15) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(...COLORS.textMuted);
      pdf.text(`... et ${scenesAvecPlanning.length - 15} scènes supplémentaires`, margin, currentY);
      currentY += 6;
    }
    
    currentY += 8;
  }
  
  // === Dialogues ===
  if (resultatDetails.dialogues && resultatDetails.dialogues.length > 0) {
    if (currentY > 230) {
      pdf.addPage();
      pageNum++;
      addStandardHeader(pdf, pageNum, itemTitle, resultat.projetTitre || 'VDFI', `Dialogues`);
      currentY = 50;
    }
    
    currentY = addSection(pdf, 'Dialogues', margin, currentY);
    
    let dialogueCount = 0;
    for (let i = 0; i < resultatDetails.dialogues.length; i++) {
      const dialogue = resultatDetails.dialogues[i];
      
      if (dialogueCount >= 25) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(...COLORS.textMuted);
        pdf.text(`... et ${resultatDetails.dialogues.length - 25} dialogues supplémentaires`, margin, currentY);
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
      const personnage = dialogue.personnageNom || resultat.titre || 'Narrateur';
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...COLORS.accentDark);
      pdf.text(`${personnage}:`, margin + 8, currentY);
      
      const persoWidth = pdf.getTextWidth(`${personnage}:`);
      
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
      if (i < resultatDetails.dialogues.length - 1 && dialogueCount < 25) {
        pdf.setDrawColor(...COLORS.tertiaryLight);
        pdf.setLineWidth(0.2);
        pdf.line(margin + 5, currentY - 2, 190, currentY - 2);
        currentY += 4;
      }
    }
  }
  
  return currentY + 5;
}

// Fonctions utilitaires
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

