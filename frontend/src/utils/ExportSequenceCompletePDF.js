import jsPDF from 'jspdf';
import logoBase64 from '../assets/img/logo-vide.png';

export const exportSequenceCompletePDF = async (currentSequence, currentEpisode) => {
  // Validation des données d'entrée
  if (!currentSequence) {
    console.error('Aucune séquence fournie');
    return;
  }

  if (!currentSequence.scenes) {
    console.error('La séquence n\'a pas de propriété "scenes"');
    return;
  }
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // === PALETTE DE COULEURS MINIMALISTE PROFESSIONNELLE ===
    const primaryColor = [138, 155, 120];        // $color-primary: #8A9B78
    const secondPrimColor = [220, 207, 184];     // $color-second-prim: #DCCFB8
    const primaryLight = [241, 239, 230];        // $color-primary-light: #F1EFE6
    const primaryDark = [83, 68, 61];            // $color-primary-dark: #53443D
    const accentColor = [173, 117, 86];          // $color-accent: #AD7556
    const accentLight = [198, 146, 114];         // $color-accent-light: #C69272
    const accentDark = [140, 90, 66];            // $color-accent-dark: #8C5A42
    const tertiaryColor = [184, 169, 154];       // $color-tertiary: #B8A99A
    const tertiaryLight = [218, 207, 191];       // $color-tertiary-light: #DACFBF
    const textPrimary = [44, 36, 30];            // Texte principal
    const textSecondary = [107, 90, 78];         // Texte secondaire
    const textMuted = [150, 140, 130];           // Texte atténué
    
    let yPosition = 25;
    
    // === EN-TÊTE MINIMALISTE ===
    // Ligne fine supérieure
    pdf.setDrawColor(...tertiaryLight);
    pdf.setLineWidth(0.3);
    pdf.line(20, 15, 190, 15);
    
    // Logo
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, 'PNG', 20, 20, 25, 10);
      } catch (imgError) {
        console.warn('Erreur insertion logo:', imgError);
      }
    }
    
    // Informations projet à droite
    pdf.setTextColor(...textSecondary);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${currentEpisode?.projetTitre || 'PROJET'}`, 185, 22, { align: 'right' });
    pdf.text(`Épisode ${currentEpisode?.ordre || ''}`, 185, 29, { align: 'right' });
    pdf.text(`${new Date().toLocaleDateString('fr-FR')}`, 185, 36, { align: 'right' });
    
    // Petit titre indicateur
    yPosition = 50;
    pdf.setTextColor(...textMuted);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text("Fiche complète de la", 20, yPosition);
    
    // Titre principal de la séquence
    yPosition = 58;
    pdf.setTextColor(...primaryDark);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Séquence ${currentSequence.ordre}`, 20, yPosition);
    
    yPosition += 8;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'light');
    pdf.setTextColor(...textSecondary);
    pdf.text(currentSequence.titre || 'Sans titre', 20, yPosition);
    
    // Ligne de séparation
    yPosition += 12;
    pdf.setDrawColor(...secondPrimColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 190, yPosition);
    
    yPosition += 10;
    
    // Badge statut
    pdf.setFillColor(...primaryLight);
    pdf.roundedRect(20, yPosition - 4, 55, 7, 2, 2, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...accentColor);
    pdf.text(`Statut: ${currentSequence.statutNom || 'Non défini'}`, 23, yPosition);
    
    yPosition += 15;
    
    // === SYNOPSIS DE LA SÉQUENCE ===
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Synopsis', 20, yPosition);
    
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...textSecondary);
    
    const synopsisText = currentSequence.synopsis || 'Aucun synopsis disponible pour cette séquence.';
    const synopsisLines = pdf.splitTextToSize(synopsisText, 170);
    pdf.text(synopsisLines, 20, yPosition);
    
    yPosition += (synopsisLines.length * 4.5) + 20;
    
    // === SECTION SCÈNES ===
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Scènes', 20, yPosition);
    
    yPosition += 12;
    
    const scenes = currentSequence.scenes || [];
    const sceneCount = scenes.length;
    
    // Badge compteur
    pdf.setFillColor(...primaryLight);
    pdf.roundedRect(20, yPosition - 4, 40, 7, 2, 2, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text(`${sceneCount} scène${sceneCount > 1 ? 's' : ''}`, 23, yPosition);
    
    yPosition += 15;
    
    // === PARCOURS DES SCÈNES (style épuré) ===
    for (let idx = 0; idx < scenes.length; idx++) {
      const scene = scenes[idx];
      
      // Gestion des sauts de page
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 25;
        
        // Petit rappel en haut de page
        pdf.setDrawColor(...tertiaryLight);
        pdf.setLineWidth(0.3);
        pdf.line(20, 15, 190, 15);
        pdf.setTextColor(...textMuted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Suite - Séquence ${currentSequence.ordre}`, 20, 22);
        yPosition = 40;
      }
      
      // === CARD SCÈNE MINIMALISTE ===
      
      // Numéro de scène (badge)
      pdf.setFillColor(...primaryLight);
      pdf.roundedRect(20, yPosition - 5, 28, 8, 2, 2, 'F');
      pdf.setTextColor(...accentColor);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${scene.ordre || idx + 1}`, 27, yPosition);
      
      // Titre de la scène
      pdf.setTextColor(...textPrimary);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const title = scene.titre || 'Sans titre';
      const displayTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
      pdf.text(displayTitle, 54, yPosition);
      
      // Statut (à droite)
      if (scene.statutNom) {
        pdf.setTextColor(...tertiaryColor);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(scene.statutNom, 185, yPosition, { align: 'right' });
      }
      
      yPosition += 10;
      
      // Synopsis de la scène
      if (scene.synopsis) {
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...textSecondary);
        
        const sceneSynopsis = scene.synopsis;
        const sceneSynopsisLines = pdf.splitTextToSize(sceneSynopsis, 160);
        pdf.text(sceneSynopsisLines, 20, yPosition);
        yPosition += (sceneSynopsisLines.length * 4.5) + 6;
      } else {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(...textMuted);
        pdf.text('Aucun synopsis', 20, yPosition);
        yPosition += 6;
      }
      
      // === LIEUX ===
      if (scene.sceneLieus && scene.sceneLieus.length > 0) {
        // Icône lieu (point)
        pdf.setFillColor(...accentLight);
        pdf.circle(22, yPosition - 2, 1.2, 'F');
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...textMuted);
        
        const lieuxText = scene.sceneLieus.map(sl => {
          let text = sl.lieuNom || 'Lieu inconnu';
          if (sl.plateauNom) text += ` (${sl.plateauNom})`;
          return text;
        }).join(' • ');
        
        const lieuxLines = pdf.splitTextToSize(lieuxText, 160);
        pdf.text(lieuxLines, 26, yPosition);
        yPosition += (lieuxLines.length * 4) + 6;
      }
      
      // === NOTES ===
      if (scene.notes && scene.notes.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...accentColor);
        pdf.text('Notes:', 20, yPosition);
        yPosition += 4;
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(...textSecondary);
        
        const notesLines = pdf.splitTextToSize(scene.notes, 170);
        pdf.text(notesLines, 20, yPosition);
        yPosition += (notesLines.length * 4) + 6;
      }
      
      // === DIALOGUES ===
      if (scene.dialogues && scene.dialogues.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.text('Dialogues:', 20, yPosition);
        yPosition += 5;
        
        const maxDialogues = Math.min(scene.dialogues.length, 10);
        
        for (let dIdx = 0; dIdx < maxDialogues; dIdx++) {
          const dialogue = scene.dialogues[dIdx];
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 25;
            pdf.setDrawColor(...tertiaryLight);
            pdf.setLineWidth(0.3);
            pdf.line(20, 15, 190, 15);
            pdf.setTextColor(...textMuted);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.text(`Suite - Séquence ${currentSequence.ordre}`, 20, 22);
            yPosition = 40;
          }
          
          // Nom du personnage
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...accentDark);
          const persoNom = dialogue.personnageNom || 'NARRATEUR';
          const persoText = `${persoNom}:`;
          const persoWidth = pdf.getTextWidth(persoText);
          pdf.text(persoText, 22, yPosition);
          
          // Texte du dialogue
          let dialogueText = dialogue.texte || '';
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...textSecondary);
          
          const maxWidth = 160;
          const availableWidth = maxWidth - persoWidth;
          const textWidth = pdf.getTextWidth(dialogueText);
          
          if (textWidth <= availableWidth) {
            pdf.text(dialogueText, 22 + persoWidth + 2, yPosition);
            yPosition += 5;
          } else {
            const wrappedLines = pdf.splitTextToSize(dialogueText, availableWidth);
            pdf.text(wrappedLines[0], 22 + persoWidth + 2, yPosition);
            yPosition += 4;
            
            for (let lineIdx = 1; lineIdx < wrappedLines.length; lineIdx++) {
              if (yPosition > 270) {
                pdf.addPage();
                yPosition = 25;
                pdf.setDrawColor(...tertiaryLight);
                pdf.setLineWidth(0.3);
                pdf.line(20, 15, 190, 15);
                pdf.setTextColor(...textMuted);
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'italic');
                pdf.text(`Suite - Séquence ${currentSequence.ordre}`, 20, 22);
                yPosition = 40;
              }
              pdf.text(wrappedLines[lineIdx], 22 + persoWidth + 2, yPosition);
              yPosition += 4;
            }
            yPosition += 1;
          }
        }
        
        if (scene.dialogues.length > 10) {
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(...textMuted);
          pdf.text(`+ ${scene.dialogues.length - 10} dialogue(s) supplémentaire(s)`, 22, yPosition);
          yPosition += 6;
        }
        
        yPosition += 2;
      }
      
      yPosition += 8;
      
      // Ligne de séparation (sauf dernière)
      if (idx < sceneCount - 1) {
        pdf.setDrawColor(...primaryLight);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPosition - 2, 190, yPosition - 2);
        yPosition += 8;
      }
    }
    
    // === PIED DE PAGE MINIMALISTE ===
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      pdf.setDrawColor(...tertiaryLight);
      pdf.setLineWidth(0.2);
      pdf.line(20, 280, 190, 280);
      
      pdf.setTextColor(...textMuted);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i}`, 105, 288, { align: 'center' });
      
      if (i === pageCount) {
        pdf.setFontSize(7);
        pdf.setTextColor(...tertiaryColor);
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 293, { align: 'center' });
      }
    }
    
    // Sauvegarde
    const fileName = `SEQ-${currentSequence.ordre}_complete.pdf`;
    pdf.save(fileName);
    
    return true;
    
  } catch (error) {
    console.error('Erreur détaillée export PDF:', error);
    throw error;
  }
};

