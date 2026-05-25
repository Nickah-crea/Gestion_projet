import jsPDF from 'jspdf';
import logoBase64 from '../assets/img/logo-vide.png';

export const exportEpisodeWithSequencePDF = async (currentEpisode, currentSequence) => {
  if (!currentEpisode) return;
  
  try {
    // VÉRIFICATION : Si currentSequence est un tableau, c'est allSequences
    // Sinon, c'est une seule séquence
    const isMultipleSequences = Array.isArray(currentSequence);
    const sequences = isMultipleSequences ? currentSequence : [currentSequence];
    
    // Si on n'a pas de séquences du tout
    if (!sequences || sequences.length === 0) {
      console.warn('Aucune séquence à exporter');
      return;
    }
    
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
    
    // Calculer les totaux
    const totalScenes = sequences.reduce((total, seq) => total + (seq.scenes?.length || 0), 0);
    const totalDialogues = sequences.reduce((total, seq) => {
      return total + (seq.scenes?.reduce((sceneTotal, scene) => 
        sceneTotal + (scene.dialogues?.length || 0), 0) || 0);
    }, 0);
    
    // =============================================
    // PAGE DE GARDE
    // =============================================
    
    // Fond léger
    pdf.setFillColor(...primaryLight);
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Logo centré en haut
    let yStart = 40;
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, 'PNG', 80, 25, 50, 20);
        yStart = 70;
      } catch (imgError) {
        console.warn('Erreur insertion logo:', imgError);
      }
    }
    
    // Ligne décorative sous le logo
    pdf.setDrawColor(...secondPrimColor);
    pdf.setLineWidth(0.5);
    pdf.line(60, yStart - 5, 150, yStart - 5);
    
    // Titre principal
    pdf.setTextColor(...primaryDark);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    
    if (isMultipleSequences) {
      pdf.text(`ÉPISODE ${currentEpisode.ordre}`, 105, yStart + 20, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'normal');
      pdf.text(currentEpisode.titre.toUpperCase(), 105, yStart + 35, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(...accentColor);
      pdf.text("DOCUMENT DE PRODUCTION COMPLET", 105, yStart + 55, { align: 'center' });
      
      // Métriques
      const infoY = yStart + 85;
      pdf.setFontSize(11);
      pdf.setTextColor(...textSecondary);
      pdf.text(`${sequences.length} séquences`, 105, infoY, { align: 'center' });
      pdf.text(`${totalScenes} scènes`, 105, infoY + 8, { align: 'center' });
      pdf.text(`${totalDialogues} dialogues`, 105, infoY + 16, { align: 'center' });
      
    } else {
      pdf.text(`ÉPISODE ${currentEpisode.ordre}`, 105, yStart + 20, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(currentEpisode.titre, 105, yStart + 33, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(...accentColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`SÉQUENCE ${currentSequence.ordre}`, 105, yStart + 55, { align: 'center' });
      
      pdf.setFontSize(13);
      pdf.setTextColor(...primaryDark);
      pdf.setFont('helvetica', 'normal');
      pdf.text(currentSequence.titre, 105, yStart + 70, { align: 'center' });
    }
    
    // Métadonnées
    const metaY = isMultipleSequences ? yStart + 125 : yStart + 100;
    pdf.setFontSize(10);
    pdf.setTextColor(...textMuted);
    pdf.setFont('helvetica', 'normal');
    
    if (currentEpisode.realisateur) {
      pdf.text(`Réalisateur: ${currentEpisode.realisateur.nom}`, 105, metaY, { align: 'center' });
    }
    if (currentEpisode.scenariste) {
      pdf.text(`Scénariste: ${currentEpisode.scenariste.nom}`, 105, metaY + 7, { align: 'center' });
    }
    
    // Date
    pdf.setFontSize(9);
    pdf.setTextColor(...textMuted);
    pdf.text(`Document généré le ${new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 270, { align: 'center' });
    
    pdf.text('v1.0 • Confidential', 105, 280, { align: 'center' });
    
    pdf.addPage();
    
    // =============================================
    // EN-TÊTE STANDARD POUR TOUTES LES PAGES
    // =============================================
    let yPosition = 25;
    let pageNum = 2;
    
    const addHeader = (pageNum, currentTitle = '') => {
      // Ligne fine d'en-tête
      pdf.setDrawColor(...tertiaryLight);
      pdf.setLineWidth(0.3);
      pdf.line(20, 15, 190, 15);
      
      // Logo
      if (logoBase64) {
        try {
          pdf.addImage(logoBase64, 'PNG', 20, 18, 22, 9);
        } catch (imgError) {
          console.warn('Erreur insertion logo:', imgError);
        }
      }
      
      // Informations projet à droite
      pdf.setTextColor(...textSecondary);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${currentEpisode?.projetTitre || 'VDFI'}`, 185, 22, { align: 'right' });
      
      if (isMultipleSequences) {
        pdf.text(`Épisode ${currentEpisode.ordre}`, 185, 29, { align: 'right' });
      } else {
        pdf.text(`Épisode ${currentEpisode.ordre} - Seq ${currentSequence.ordre}`, 185, 29, { align: 'right' });
      }
      
      pdf.text(`Page ${pageNum}`, 185, 36, { align: 'right' });
      
      // Titre courant
      if (currentTitle) {
        pdf.setFontSize(7);
        pdf.setTextColor(...textMuted);
        pdf.setFont('helvetica', 'italic');
        pdf.text(currentTitle, 20, 32);
      }
    };
    
    // =============================================
    // SYNOPSIS DE L'ÉPISODE
    // =============================================
    addHeader(pageNum, 'Synopsis');
    yPosition = 50;
    
    pdf.setTextColor(...primaryDark);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text("SYNOPSIS", 20, yPosition);
    
    yPosition += 8;
    pdf.setDrawColor(...secondPrimColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 70, yPosition);
    yPosition += 12;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...textSecondary);
    const episodeSynopsis = currentEpisode.synopsis || 'Aucun synopsis disponible.';
    const episodeSynopsisLines = pdf.splitTextToSize(episodeSynopsis, 170);
    pdf.text(episodeSynopsisLines, 20, yPosition);
    yPosition += (episodeSynopsisLines.length * 5) + 20;
    
    // =============================================
    // CONTENU PRINCIPAL
    // =============================================
    
    if (isMultipleSequences) {
      // =============================================
      // TABLE DES MATIÈRES
      // =============================================
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryDark);
      pdf.setFont('helvetica', 'bold');
      pdf.text("TABLE DES MATIÈRES", 20, yPosition);
      
      yPosition += 8;
      pdf.setDrawColor(...secondPrimColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, 85, yPosition);
      yPosition += 15;
      
      sequences.forEach((sequence, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum, 'Table des matières');
          yPosition = 50;
        }
        
        const sceneCount = sequence.scenes?.length || 0;
        const dialogueCount = sequence.scenes?.reduce((total, scene) => 
          total + (scene.dialogues?.length || 0), 0) || 0;
        
        pdf.setFontSize(11);
        pdf.setTextColor(...accentColor);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${sequence.ordre}.`, 25, yPosition);
        
        pdf.setTextColor(...primaryDark);
        pdf.setFont('helvetica', 'normal');
        pdf.text(sequence.titre, 35, yPosition);
        
        pdf.setFontSize(8);
        pdf.setTextColor(...textMuted);
        pdf.text(`${sceneCount} scène${sceneCount > 1 ? 's' : ''} • ${dialogueCount} dialogue${dialogueCount > 1 ? 's' : ''}`, 35, yPosition + 5);
        
        yPosition += 15;
        
        if (index < sequences.length - 1) {
          pdf.setDrawColor(tertiaryLight[0], tertiaryLight[1], tertiaryLight[2]);
          pdf.setLineWidth(0.2);
          pdf.line(25, yPosition - 5, 185, yPosition - 5);
          yPosition += 5;
        }
      });
      
      yPosition += 15;
      
      // =============================================
      // CONTENU DÉTAILLÉ PAR SÉQUENCE
      // =============================================
      for (let seqIdx = 0; seqIdx < sequences.length; seqIdx++) {
        const sequence = sequences[seqIdx];
        
        if (seqIdx > 0 || yPosition > 50) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum, `Séquence ${sequence.ordre}`);
          yPosition = 50;
        }
        
        // Ligne fine au-dessus de la séquence
        pdf.setDrawColor(...primaryLight);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPosition - 3, 190, yPosition - 3);
        
        // Badge séquence
        pdf.setFillColor(...primaryLight);
        pdf.roundedRect(20, yPosition - 2, 55, 9, 2, 2, 'F');
        pdf.setTextColor(...accentColor);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Séquence ${sequence.ordre}`, 23, yPosition + 4);
        
        // Titre séquence
        pdf.setTextColor(...primaryDark);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(sequence.titre, 80, yPosition + 4);
        
        yPosition += 14;
        
        // Métadonnées
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...textMuted);
        pdf.text(`Statut: ${sequence.statutNom || 'Non défini'}`, 25, yPosition);
        
        if (sequence.synopsis && sequence.synopsis.trim()) {
          yPosition += 5;
          pdf.setTextColor(...textSecondary);
          const synopsisLines = pdf.splitTextToSize(sequence.synopsis, 165);
          pdf.text(synopsisLines, 25, yPosition);
          yPosition += (synopsisLines.length * 4);
        }
        
        yPosition += 8;
        
        // =============================================
        // SCÈNES DE LA SÉQUENCE
        // =============================================
        if (sequence.scenes && sequence.scenes.length > 0) {
          for (let sceneIdx = 0; sceneIdx < sequence.scenes.length; sceneIdx++) {
            const scene = sequence.scenes[sceneIdx];
            
            if (scene.dialogues?.length) {
              // Gestion des sauts de page
              if (yPosition > 240) {
                pdf.addPage();
                pageNum++;
                addHeader(pageNum, `Séquence ${sequence.ordre} - Suite`);
                yPosition = 50;
              }
              
              // Ligne fine au-dessus de la scène
              pdf.setDrawColor(...primaryLight);
              pdf.setLineWidth(0.3);
              pdf.line(20, yPosition - 3, 190, yPosition - 3);
              
              // Badge scène
              pdf.setFillColor(...primaryLight);
              pdf.roundedRect(20, yPosition - 2, 40, 9, 2, 2, 'F');
              pdf.setTextColor(...accentColor);
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              pdf.text(`Scène ${scene.ordre}`, 23, yPosition + 4);
              
              // Titre scène
              pdf.setTextColor(...primaryDark);
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'bold');
              const title = scene.titre || 'Sans titre';
              pdf.text(title, 65, yPosition + 4);
              
              // Nombre de dialogues
              const dialogueCount = scene.dialogues.length;
              pdf.setFillColor(...primaryLight);
              pdf.roundedRect(160, yPosition - 2, 30, 9, 2, 2, 'F');
              pdf.setTextColor(...accentLight);
              pdf.setFontSize(7);
              pdf.setFont('helvetica', 'bold');
              pdf.text(`${dialogueCount} dialogue${dialogueCount > 1 ? 's' : ''}`, 163, yPosition + 4);
              
              yPosition += 14;
              
              // SYNOPSIS COMPLET DE LA SCÈNE (modification 1)
              if (scene.synopsis && scene.synopsis.trim()) {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(...textSecondary);
                const synopsisLines = pdf.splitTextToSize(scene.synopsis, 165);
                pdf.text(synopsisLines, 25, yPosition);
                yPosition += (synopsisLines.length * 4) + 4;
              }
              
              // =============================================
              // DIALOGUES DE LA SCÈNE (style personnage à gauche)
              // =============================================
              for (let dIdx = 0; dIdx < scene.dialogues.length; dIdx++) {
                const dialogue = scene.dialogues[dIdx];
                
                if (yPosition > 265) {
                  pdf.addPage();
                  pageNum++;
                  addHeader(pageNum, `Scène ${scene.ordre} - Suite`);
                  yPosition = 50;
                }
                
                // Nom du personnage à gauche
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(...accentDark);
                const persoNom = dialogue.personnageNom || 'NARRATEUR';
                const persoText = `${persoNom}:`;
                const persoWidth = pdf.getTextWidth(persoText);
                pdf.text(persoText, 28, yPosition);
                
                // Texte du dialogue
                const dialogueText = dialogue.texte || '';
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(...textSecondary);
                
                const maxWidth = 155;
                const availableWidth = maxWidth - (persoWidth + 5);
                
                if (availableWidth > 0 && dialogueText.trim()) {
                  const textWidth = pdf.getTextWidth(dialogueText);
                  
                  if (textWidth <= availableWidth) {
                    pdf.text(dialogueText, 28 + persoWidth + 3, yPosition);
                    yPosition += 5;
                  } else {
                    const wrappedLines = pdf.splitTextToSize(dialogueText, availableWidth);
                    pdf.text(wrappedLines[0], 28 + persoWidth + 3, yPosition);
                    yPosition += 4;
                    
                    for (let lineIdx = 1; lineIdx < wrappedLines.length; lineIdx++) {
                      if (yPosition > 270) {
                        pdf.addPage();
                        pageNum++;
                        addHeader(pageNum, `Scène ${scene.ordre} - Suite`);
                        yPosition = 50;
                      }
                      pdf.text(wrappedLines[lineIdx], 28 + persoWidth + 3, yPosition);
                      yPosition += 4;
                    }
                    yPosition += 1;
                  }
                } else if (dialogueText.trim()) {
                  const wrappedLines = pdf.splitTextToSize(dialogueText, maxWidth);
                  wrappedLines.forEach(line => {
                    if (yPosition > 270) {
                      pdf.addPage();
                      pageNum++;
                      addHeader(pageNum, `Scène ${scene.ordre} - Suite`);
                      yPosition = 50;
                    }
                    pdf.text(line, 28, yPosition);
                    yPosition += 4;
                  });
                }
                
                // Observation
                if (dialogue.observation && dialogue.observation.trim()) {
                  yPosition += 1;
                  pdf.setFontSize(7);
                  pdf.setFont('helvetica', 'italic');
                  pdf.setTextColor(...textMuted);
                  pdf.text(`[Note: ${dialogue.observation}]`, 30, yPosition);
                  yPosition += 3;
                }
              }
              
              // Espace entre les scènes : 1.5 cm = 15 mm (modification 2)
              yPosition += 15;
            }
          }
        }
        
        yPosition += 8;
      }
      
    } else {
      // =============================================
      // EXPORT D'UNE SEULE SÉQUENCE
      // =============================================
      
      // Badge séquence
      pdf.setFillColor(...primaryLight);
      pdf.roundedRect(20, yPosition - 2, 55, 9, 2, 2, 'F');
      pdf.setTextColor(...accentColor);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Séquence ${currentSequence.ordre}`, 23, yPosition + 4);
      
      // Titre séquence
      pdf.setTextColor(...primaryDark);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(currentSequence.titre, 80, yPosition + 4);
      
      yPosition += 14;
      
      // Métadonnées
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textMuted);
      pdf.text(`Statut: ${currentSequence.statutNom || 'Non défini'}`, 25, yPosition);
      
      if (currentSequence.synopsis && currentSequence.synopsis.trim()) {
        yPosition += 5;
        pdf.setTextColor(...textSecondary);
        const synopsisLines = pdf.splitTextToSize(currentSequence.synopsis, 165);
        pdf.text(synopsisLines, 25, yPosition);
        yPosition += (synopsisLines.length * 4);
      }
      
      yPosition += 12;
      
      // =============================================
      // SCÈNES DE LA SÉQUENCE
      // =============================================
      if (currentSequence.scenes && currentSequence.scenes.length > 0) {
        for (let sceneIdx = 0; sceneIdx < currentSequence.scenes.length; sceneIdx++) {
          const scene = currentSequence.scenes[sceneIdx];
          
          if (scene.dialogues?.length) {
            if (yPosition > 240) {
              pdf.addPage();
              pageNum++;
              addHeader(pageNum, `Suite - Scène ${scene.ordre}`);
              yPosition = 50;
            }
            
            // Ligne fine au-dessus de la scène
            pdf.setDrawColor(...primaryLight);
            pdf.setLineWidth(0.3);
            pdf.line(20, yPosition - 3, 190, yPosition - 3);
            
            // Badge scène
            pdf.setFillColor(...primaryLight);
            pdf.roundedRect(20, yPosition - 2, 40, 9, 2, 2, 'F');
            pdf.setTextColor(...accentColor);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Scène ${scene.ordre}`, 23, yPosition + 4);
            
            // Titre scène
            pdf.setTextColor(...primaryDark);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            const title = scene.titre || 'Sans titre';
            pdf.text(title, 65, yPosition + 4);
            
            // Nombre de dialogues
            const dialogueCount = scene.dialogues.length;
            pdf.setFillColor(...primaryLight);
            pdf.roundedRect(160, yPosition - 2, 30, 9, 2, 2, 'F');
            pdf.setTextColor(...accentLight);
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${dialogueCount} dialogue${dialogueCount > 1 ? 's' : ''}`, 163, yPosition + 4);
            
            yPosition += 14;
            
            // SYNOPSIS COMPLET DE LA SCÈNE (modification 1)
            if (scene.synopsis && scene.synopsis.trim()) {
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(...textSecondary);
              const synopsisLines = pdf.splitTextToSize(scene.synopsis, 165);
              pdf.text(synopsisLines, 25, yPosition);
              yPosition += (synopsisLines.length * 4) + 4;
            }
            
            // =============================================
            // DIALOGUES DE LA SCÈNE
            // =============================================
            for (let dIdx = 0; dIdx < scene.dialogues.length; dIdx++) {
              const dialogue = scene.dialogues[dIdx];
              
              if (yPosition > 265) {
                pdf.addPage();
                pageNum++;
                addHeader(pageNum, `Scène ${scene.ordre} - Suite`);
                yPosition = 50;
              }
              
              // Nom du personnage à gauche
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(...accentDark);
              const persoNom = dialogue.personnageNom || 'NARRATEUR';
              const persoText = `${persoNom}:`;
              const persoWidth = pdf.getTextWidth(persoText);
              pdf.text(persoText, 28, yPosition);
              
              // Texte du dialogue
              const dialogueText = dialogue.texte || '';
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(...textSecondary);
              
              const maxWidth = 155;
              const availableWidth = maxWidth - (persoWidth + 5);
              
              if (availableWidth > 0 && dialogueText.trim()) {
                const textWidth = pdf.getTextWidth(dialogueText);
                
                if (textWidth <= availableWidth) {
                  pdf.text(dialogueText, 28 + persoWidth + 3, yPosition);
                  yPosition += 5;
                } else {
                  const wrappedLines = pdf.splitTextToSize(dialogueText, availableWidth);
                  pdf.text(wrappedLines[0], 28 + persoWidth + 3, yPosition);
                  yPosition += 4;
                  
                  for (let lineIdx = 1; lineIdx < wrappedLines.length; lineIdx++) {
                    if (yPosition > 270) {
                      pdf.addPage();
                      pageNum++;
                      addHeader(pageNum, `Scène ${scene.ordre} - Suite`);
                      yPosition = 50;
                    }
                    pdf.text(wrappedLines[lineIdx], 28 + persoWidth + 3, yPosition);
                    yPosition += 4;
                  }
                  yPosition += 1;
                }
              } else if (dialogueText.trim()) {
                const wrappedLines = pdf.splitTextToSize(dialogueText, maxWidth);
                wrappedLines.forEach(line => {
                  if (yPosition > 270) {
                    pdf.addPage();
                    pageNum++;
                    addHeader(pageNum, `Scène ${scene.ordre} - Suite`);
                    yPosition = 50;
                  }
                  pdf.text(line, 28, yPosition);
                  yPosition += 4;
                });
              }
              
              // Observation
              if (dialogue.observation && dialogue.observation.trim()) {
                yPosition += 1;
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'italic');
                pdf.setTextColor(...textMuted);
                pdf.text(`[Note: ${dialogue.observation}]`, 30, yPosition);
                yPosition += 3;
              }
            }
            
            // Espace entre les scènes : 1.5 cm = 15 mm (modification 2)
            yPosition += 15;
          }
        }
      }
    }
    
    // =============================================
    // PIED DE PAGE MINIMALISTE
    // =============================================
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      pdf.setDrawColor(...tertiaryLight);
      pdf.setLineWidth(0.2);
      pdf.line(20, 280, 190, 280);
      
      pdf.setTextColor(...textMuted);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i}`, 105, 288, { align: 'center' });
      
      if (i === totalPages) {
        pdf.setFontSize(7);
        pdf.setTextColor(...tertiaryColor);
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 293, { align: 'center' });
      }
    }
    
    // =============================================
    // SAUVEGARDE
    // =============================================
    const fileName = isMultipleSequences 
      ? `Episode-${currentEpisode.ordre}-${currentEpisode.titre.replace(/[^a-z0-9]/gi, '_')}-Complet.pdf`
      : `Episode-${currentEpisode.ordre}-Sequence-${currentSequence.ordre}-${currentSequence.titre.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    throw error;
  }
};

export default exportEpisodeWithSequencePDF;

