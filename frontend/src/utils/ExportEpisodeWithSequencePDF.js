import jsPDF from 'jspdf';

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
    
    // Variables de design basées sur _variables.scss
    const primaryColor = [45, 26, 26];        // $color-black: #2D1A1A
    const accentColor = [227, 28, 52];        // $color-accent: #E31C34
    const secondaryColor = [245, 124, 0];     // $color-primary: #F57C00
    const tertiaryColor = [191, 226, 70];     // $color-tertiary: #BFE246
    const lightBgColor = [255, 248, 240];     // $color-tertiary-light: #FFF8F0
    const textColor = [45, 26, 26];           // $color-text-primary
    const mutedTextColor = [109, 26, 42];     // $color-text-secondary
    const borderColor = [245, 124, 0, 0.18 * 255]; // $color-border
    
    // Police principalement Playfair Display avec différents poids
    const fontTitle = "playfair-bold";
    const fontSubtitle = "playfair-medium";
    const fontBody = "helvetica";
    const fontEmphasis = "helvetica-bold";
    
    // Calculer les totaux
    const totalScenes = sequences.reduce((total, seq) => total + (seq.scenes?.length || 0), 0);
    const totalDialogues = sequences.reduce((total, seq) => {
      return total + (seq.scenes?.reduce((sceneTotal, scene) => 
        sceneTotal + (scene.dialogues?.length || 0), 0) || 0);
    }, 0);
    
    // =============================================
    // PAGE DE GARDE - MINIMALISTE ET PROFESSIONNEL
    // =============================================
    
    // Fond léger minimaliste
    pdf.setFillColor(...lightBgColor);
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Ligne décorative en haut
    pdf.setFillColor(...accentColor);
    pdf.rect(0, 0, 210, 8, 'F');
    
    // Logo/Identité en haut à droite
    pdf.setFontSize(10);
    pdf.setTextColor(...mutedTextColor);
    pdf.setFont(fontBody);
    pdf.text('VDFI', 190, 15, { align: 'right' });
    
    // Titre principal
    pdf.setFontSize(32);
    pdf.setTextColor(...primaryColor);
    pdf.setFont(fontTitle);
    
    const yStart = 80;
    
    if (isMultipleSequences) {
      // Export complet de l'épisode
      pdf.text(`ÉPISODE ${currentEpisode.ordre}`, 105, yStart, { align: 'center' });
      
      pdf.setFontSize(24);
      pdf.setFont(fontSubtitle);
      pdf.text(currentEpisode.titre.toUpperCase(), 105, yStart + 15, { align: 'center' });
      
      // Ligne décorative sous le titre
      pdf.setDrawColor(...secondaryColor);
      pdf.setLineWidth(1);
      pdf.line(60, yStart + 25, 150, yStart + 25);
      
      pdf.setFontSize(14);
      pdf.setTextColor(...mutedTextColor);
      pdf.setFont(fontBody);
      pdf.text('DOCUMENT DE PRODUCTION COMPLET', 105, yStart + 40, { align: 'center' });
      
      // Informations minimalistes
      const infoY = yStart + 65;
      pdf.setFontSize(12);
      pdf.text(`${sequences.length} séquences`, 105, infoY, { align: 'center' });
      pdf.text(`${totalScenes} scènes`, 105, infoY + 8, { align: 'center' });
      pdf.text(`${totalDialogues} dialogues`, 105, infoY + 16, { align: 'center' });
      pdf.text(`Statut: ${currentEpisode.statutNom}`, 105, infoY + 24, { align: 'center' });
      
    } else {
      // Export d'une seule séquence
      pdf.text(`ÉPISODE ${currentEpisode.ordre}`, 105, yStart, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setFont(fontSubtitle);
      pdf.text(currentEpisode.titre, 105, yStart + 15, { align: 'center' });
      
      // Ligne décorative
      pdf.setDrawColor(...secondaryColor);
      pdf.setLineWidth(1);
      pdf.line(70, yStart + 25, 140, yStart + 25);
      
      pdf.setFontSize(16);
      pdf.setTextColor(...accentColor);
      pdf.setFont(fontTitle);
      pdf.text(`SÉQUENCE ${currentSequence.ordre}`, 105, yStart + 45, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryColor);
      pdf.setFont(fontSubtitle);
      pdf.text(currentSequence.titre, 105, yStart + 60, { align: 'center' });
    }
    
    // Métadonnées minimalistes
    const metaY = isMultipleSequences ? yStart + 110 : yStart + 90;
    pdf.setFontSize(10);
    pdf.setTextColor(...mutedTextColor);
    pdf.setFont(fontBody);
    
    if (currentEpisode.realisateur) {
      pdf.text(`Réalisateur: ${currentEpisode.realisateur.nom}`, 105, metaY, { align: 'center' });
    }
    
    if (currentEpisode.scenariste) {
      pdf.text(`Scénariste: ${currentEpisode.scenariste.nom}`, 105, metaY + 6, { align: 'center' });
    }
    
    // Date en bas
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Document généré le ${new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 270, { align: 'center' });
    
    // Numéro de version
    pdf.text('v1.0 • Confidential', 105, 280, { align: 'center' });
    
    pdf.addPage();
    
    // =============================================
    // EN-TÊTE STANDARD POUR TOUTES LES PAGES
    // =============================================
    let yPosition = 30;
    let pageNum = 2;
    
    const addHeader = (pageNum, currentTitle = '') => {
      // Ligne d'en-tête
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 20, 'F');
      
      // Numéro de page
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont(fontBody);
      pdf.text(`Page ${pageNum}`, 200, 12, { align: 'right' });
      
      // Titre du document
      pdf.setFontSize(11);
      pdf.setFont(fontEmphasis);
      if (isMultipleSequences) {
        pdf.text(`Épisode ${currentEpisode.ordre}: ${currentEpisode.titre}`, 20, 12);
      } else {
        pdf.text(`Épisode ${currentEpisode.ordre} - Séquence ${currentSequence.ordre}`, 20, 12);
      }
      
      // Sous-titre courant si fourni
      if (currentTitle) {
        pdf.setFontSize(9);
        pdf.setFont(fontBody);
        pdf.setTextColor(200, 200, 200);
        pdf.text(currentTitle, 20, 17);
      }
      
      // Ligne de séparation
      pdf.setDrawColor(...accentColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, 25, 190, 25);
    };
    
    // =============================================
    // SYNOPSIS DE L'ÉPISODE
    // =============================================
    addHeader(pageNum, 'Synopsis');
    yPosition = 40;
    
    // Titre section
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryColor);
    pdf.setFont(fontTitle);
    pdf.text('SYNOPSIS', 20, yPosition);
    
    yPosition += 10;
    
    // Ligne décorative
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.3);
    pdf.line(20, yPosition - 2, 50, yPosition - 2);
    
    yPosition += 8;
    
    // Contenu du synopsis
    pdf.setFontSize(11);
    pdf.setTextColor(...textColor);
    pdf.setFont(fontBody);
    const episodeSynopsis = currentEpisode.synopsis || 'Aucun synopsis disponible.';
    const episodeSynopsisLines = pdf.splitTextToSize(episodeSynopsis, 170);
    pdf.text(episodeSynopsisLines, 20, yPosition);
    yPosition += (episodeSynopsisLines.length * 5) + 25;
    
    // =============================================
    // CONTENU PRINCIPAL - ADAPTÉ AU TYPE D'EXPORT
    // =============================================
    
    if (isMultipleSequences) {
      // =============================================
      // EXPORT COMPLET : TOUTES LES SÉQUENCES
      // =============================================
      
      // Table des matières
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryColor);
      pdf.setFont(fontTitle);
      pdf.text('TABLE DES MATIÈRES', 20, yPosition);
      
      yPosition += 10;
      pdf.setDrawColor(...secondaryColor);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition - 2, 60, yPosition - 2);
      yPosition += 15;
      
      pdf.setFontSize(10);
      pdf.setTextColor(...textColor);
      pdf.setFont(fontBody);
      
      sequences.forEach((sequence, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum, 'Table des matières');
          yPosition = 40;
        }
        
        const sceneCount = sequence.scenes?.length || 0;
        const dialogueCount = sequence.scenes?.reduce((total, scene) => 
          total + (scene.dialogues?.length || 0), 0) || 0;
        
        // Numéro de séquence en accent
        pdf.setFontSize(11);
        pdf.setTextColor(...accentColor);
        pdf.setFont(fontEmphasis);
        pdf.text(`${sequence.ordre}.`, 25, yPosition);
        
        // Titre de la séquence
        pdf.setTextColor(...primaryColor);
        pdf.text(sequence.titre, 35, yPosition);
        
        // Métadonnées minimales
        pdf.setFontSize(9);
        pdf.setTextColor(...mutedTextColor);
        pdf.setFont(fontBody);
        pdf.text(`• ${sceneCount} scène${sceneCount > 1 ? 's' : ''} • ${dialogueCount} dialogue${dialogueCount > 1 ? 's' : ''}`, 35, yPosition + 5);
        
        yPosition += 15;
        
        if (index < sequences.length - 1) {
          pdf.setDrawColor(230, 230, 230);
          pdf.setLineWidth(0.1);
          pdf.line(25, yPosition - 5, 185, yPosition - 5);
          yPosition += 5;
        }
      });
      
      yPosition += 10;
      
      // =============================================
      // CONTENU DÉTAILLÉ PAR SÉQUENCE
      // =============================================
      sequences.forEach((sequence, seqIndex) => {
        // Nouvelle page pour chaque séquence (sauf première)
        if (seqIndex > 0 || yPosition > 50) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum, `Séquence ${sequence.ordre}`);
          yPosition = 40;
        }
        
        // En-tête de séquence
        pdf.setFontSize(16);
        pdf.setTextColor(...primaryColor);
        pdf.setFont(fontTitle);
        pdf.text(`SÉQUENCE ${sequence.ordre}`, 20, yPosition);
        
        yPosition += 8;
        pdf.setDrawColor(...accentColor);
        pdf.setLineWidth(1);
        pdf.line(20, yPosition - 2, 70, yPosition - 2);
        
        yPosition += 5;
        
        // Titre de la séquence
        pdf.setFontSize(14);
        pdf.setFont(fontSubtitle);
        pdf.text(sequence.titre, 20, yPosition);
        
        yPosition += 10;
        
        // Métadonnées de la séquence
        pdf.setFontSize(10);
        pdf.setTextColor(...mutedTextColor);
        pdf.setFont(fontBody);
        pdf.text(`Statut: ${sequence.statutNom || 'Non défini'}`, 20, yPosition);
        
        if (sequence.synopsis && sequence.synopsis.trim()) {
          yPosition += 6;
          pdf.text('Synopsis:', 20, yPosition);
          yPosition += 4;
          
          const synopsisLines = pdf.splitTextToSize(sequence.synopsis, 170);
          synopsisLines.forEach(line => {
            pdf.text(`  ${line}`, 22, yPosition);
            yPosition += 4;
          });
        } else {
          yPosition += 6;
        }
        
        yPosition += 10;
        
        // =============================================
        // SCÈNES DE LA SÉQUENCE
        // =============================================
        if (sequence.scenes && sequence.scenes.length > 0) {
          // Titre section scènes
          pdf.setFontSize(12);
          pdf.setTextColor(...primaryColor);
          pdf.setFont(fontEmphasis);
          pdf.text('SCÈNES', 20, yPosition);
          
          yPosition += 5;
          pdf.setDrawColor(...secondaryColor);
          pdf.setLineWidth(0.3);
          pdf.line(20, yPosition - 2, 40, yPosition - 2);
          yPosition += 8;
          
          sequence.scenes.forEach((scene, sceneIndex) => {
            if (yPosition > 250) {
              pdf.addPage();
              pageNum++;
              addHeader(pageNum, `Séquence ${sequence.ordre} - Scène ${scene.ordre}`);
              yPosition = 40;
            }
            
            // En-tête de scène
            pdf.setFillColor(...lightBgColor);
            pdf.rect(20, yPosition - 4, 170, 8, 'F');
            
            pdf.setFontSize(11);
            pdf.setTextColor(...primaryColor);
            pdf.setFont(fontEmphasis);
            pdf.text(`Scène ${scene.ordre}: ${scene.titre}`, 22, yPosition);
            
            yPosition += 10;
            
            // Métadonnées de la scène
            pdf.setFontSize(9);
            pdf.setTextColor(...mutedTextColor);
            pdf.setFont(fontBody);
            
            pdf.text(`Statut: ${scene.statutNom || 'Non défini'}`, 25, yPosition);
            
            const lieuxCount = scene.sceneLieus?.length || 0;
            if (lieuxCount > 0) {
              pdf.text(`• Lieux: ${lieuxCount}`, 60, yPosition);
            }
            
            yPosition += 5;
            
            // Synopsis de la scène (si présent)
            if (scene.synopsis && scene.synopsis.trim()) {
              const sceneSynopsis = scene.synopsis.length > 150 ? 
                scene.synopsis.substring(0, 150) + '...' : scene.synopsis;
              pdf.text(`"${sceneSynopsis}"`, 25, yPosition);
              yPosition += 6;
            }
            
            // =============================================
            // DIALOGUES DE LA SCÈNE
            // =============================================
            if (scene.dialogues && scene.dialogues.length > 0) {
              yPosition += 5;
              
              scene.dialogues.forEach((dialogue, dialogueIndex) => {
                if (yPosition > 250) {
                  pdf.addPage();
                  pageNum++;
                  addHeader(pageNum, `Scène ${scene.ordre} - Dialogues`);
                  yPosition = 40;
                }
                
                // Personnage en accent
                pdf.setFontSize(10);
                pdf.setTextColor(...accentColor);
                pdf.setFont(fontEmphasis);
                
                const personnage = dialogue.personnageNom || 'NARRATEUR';
                pdf.text(`${personnage.toUpperCase()}:`, 30, yPosition);
                
                yPosition += 5;
                
                // Texte du dialogue
                pdf.setFontSize(9);
                pdf.setTextColor(...textColor);
                pdf.setFont(fontBody);
                
                const dialogueText = dialogue.texte || '';
                if (dialogueText.trim()) {
                  const dialogueLines = pdf.splitTextToSize(dialogueText, 155);
                  dialogueLines.forEach(line => {
                    pdf.text(`  ${line}`, 32, yPosition);
                    yPosition += 4;
                  });
                }
                
                // Observation (si présente)
                if (dialogue.observation && dialogue.observation.trim()) {
                  yPosition += 2;
                  pdf.setFontSize(8);
                  pdf.setTextColor(...mutedTextColor);
                  pdf.setFont(fontBody);
                  pdf.text(`[Note: ${dialogue.observation}]`, 32, yPosition);
                  yPosition += 4;
                }
                
                // Séparation entre dialogues (sauf dernier)
                if (dialogueIndex < scene.dialogues.length - 1) {
                  yPosition += 3;
                  pdf.setDrawColor(240, 240, 240);
                  pdf.setLineWidth(0.1);
                  pdf.line(30, yPosition, 180, yPosition);
                  yPosition += 5;
                }
              });
              
              yPosition += 8;
            }
            
            // Séparation entre scènes (sauf dernière)
            if (sceneIndex < sequence.scenes.length - 1) {
              pdf.setDrawColor(230, 230, 230);
              pdf.setLineWidth(0.1);
              pdf.line(25, yPosition, 185, yPosition);
              yPosition += 10;
            }
          });
        } else {
          pdf.setFontSize(10);
          pdf.setTextColor(...mutedTextColor);
          pdf.setFont(fontBody);
          pdf.text('Aucune scène dans cette séquence.', 25, yPosition);
          yPosition += 10;
        }
        
        yPosition += 15;
      });
      
    } else {
      // =============================================
      // EXPORT D'UNE SEULE SÉQUENCE
      // =============================================
      
      // Titre de la séquence
      pdf.setFontSize(16);
      pdf.setTextColor(...primaryColor);
      pdf.setFont(fontTitle);
      pdf.text(`SÉQUENCE ${currentSequence.ordre}`, 20, yPosition);
      
      yPosition += 8;
      pdf.setDrawColor(...accentColor);
      pdf.setLineWidth(1);
      pdf.line(20, yPosition - 2, 70, yPosition - 2);
      
      yPosition += 5;
      
      pdf.setFontSize(14);
      pdf.setFont(fontSubtitle);
      pdf.text(currentSequence.titre, 20, yPosition);
      
      yPosition += 12;
      
      // Métadonnées de la séquence
      pdf.setFontSize(10);
      pdf.setTextColor(...mutedTextColor);
      pdf.setFont(fontBody);
      pdf.text(`Statut: ${currentSequence.statutNom || 'Non défini'}`, 20, yPosition);
      
      if (currentSequence.synopsis && currentSequence.synopsis.trim()) {
        yPosition += 6;
        const synopsisLines = pdf.splitTextToSize(`Synopsis: ${currentSequence.synopsis}`, 170);
        pdf.text(synopsisLines, 20, yPosition);
        yPosition += (synopsisLines.length * 4) + 15;
      } else {
        yPosition += 10;
      }
      
      // =============================================
      // SCÈNES DE LA SÉQUENCE
      // =============================================
      if (currentSequence.scenes && currentSequence.scenes.length > 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(...primaryColor);
        pdf.setFont(fontEmphasis);
        pdf.text('SCÈNES', 20, yPosition);
        
        yPosition += 5;
        pdf.setDrawColor(...secondaryColor);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPosition - 2, 40, yPosition - 2);
        yPosition += 10;
        
        currentSequence.scenes.forEach((scene, sceneIndex) => {
          if (yPosition > 250) {
            pdf.addPage();
            pageNum++;
            addHeader(pageNum, `Scène ${scene.ordre}`);
            yPosition = 40;
          }
          
          // Titre de la scène
          pdf.setFillColor(...lightBgColor);
          pdf.rect(20, yPosition - 4, 170, 8, 'F');
          
          pdf.setFontSize(11);
          pdf.setTextColor(...primaryColor);
          pdf.setFont(fontEmphasis);
          pdf.text(`Scène ${scene.ordre}: ${scene.titre}`, 22, yPosition);
          
          yPosition += 10;
          
          // Métadonnées de la scène
          pdf.setFontSize(9);
          pdf.setTextColor(...mutedTextColor);
          pdf.setFont(fontBody);
          
          pdf.text(`Statut: ${scene.statutNom || 'Non défini'}`, 25, yPosition);
          
          const lieuxCount = scene.sceneLieus?.length || 0;
          if (lieuxCount > 0) {
            pdf.text(`• Lieux: ${lieuxCount}`, 60, yPosition);
          }
          
          yPosition += 5;
          
          // Synopsis de la scène
          if (scene.synopsis && scene.synopsis.trim()) {
            const sceneSynopsis = scene.synopsis.length > 120 ? 
              scene.synopsis.substring(0, 120) + '...' : scene.synopsis;
            pdf.text(`"${sceneSynopsis}"`, 25, yPosition);
            yPosition += 6;
          }
          
          // =============================================
          // DIALOGUES DE LA SCÈNE
          // =============================================
          if (scene.dialogues && scene.dialogues.length > 0) {
            yPosition += 5;
            
            scene.dialogues.forEach((dialogue, dialogueIndex) => {
              if (yPosition > 250) {
                pdf.addPage();
                pageNum++;
                addHeader(pageNum, `Scène ${scene.ordre} - Dialogues`);
                yPosition = 40;
              }
              
              // Personnage
              pdf.setFontSize(10);
              pdf.setTextColor(...accentColor);
              pdf.setFont(fontEmphasis);
              
              const personnage = dialogue.personnageNom || 'NARRATEUR';
              pdf.text(`${personnage.toUpperCase()}:`, 30, yPosition);
              
              yPosition += 5;
              
              // Texte du dialogue
              pdf.setFontSize(9);
              pdf.setTextColor(...textColor);
              pdf.setFont(fontBody);
              
              const dialogueText = dialogue.texte || '';
              if (dialogueText.trim()) {
                const dialogueLines = pdf.splitTextToSize(dialogueText, 155);
                dialogueLines.forEach(line => {
                  pdf.text(`  ${line}`, 32, yPosition);
                  yPosition += 4;
                });
              }
              
              // Observation
              if (dialogue.observation && dialogue.observation.trim()) {
                yPosition += 2;
                pdf.setFontSize(8);
                pdf.setTextColor(...mutedTextColor);
                pdf.setFont(fontBody);
                pdf.text(`[Note: ${dialogue.observation}]`, 32, yPosition);
                yPosition += 4;
              }
              
              // Séparation entre dialogues
              if (dialogueIndex < scene.dialogues.length - 1) {
                yPosition += 3;
                pdf.setDrawColor(240, 240, 240);
                pdf.setLineWidth(0.1);
                pdf.line(30, yPosition, 180, yPosition);
                yPosition += 5;
              }
            });
            
            yPosition += 8;
          }
          
          // Séparation entre scènes
          if (sceneIndex < currentSequence.scenes.length - 1) {
            pdf.setDrawColor(230, 230, 230);
            pdf.setLineWidth(0.1);
            pdf.line(25, yPosition, 185, yPosition);
            yPosition += 10;
          }
        });
      }
    }
    
    // =============================================
    // PAGE DE RÉSUMÉ FINAL
    // =============================================
    pdf.addPage();
    pageNum++;
    addHeader(pageNum, 'Résumé');
    yPosition = 40;
    
    // Titre résumé
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryColor);
    pdf.setFont(fontTitle);
    pdf.text('RÉSUMÉ', 20, yPosition);
    
    yPosition += 10;
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.3);
    pdf.line(20, yPosition - 2, 50, yPosition - 2);
    yPosition += 15;
    
    // Statistiques principales
    pdf.setFontSize(12);
    pdf.setTextColor(...primaryColor);
    pdf.setFont(fontEmphasis);
    pdf.text('STATISTIQUES', 20, yPosition);
    
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(...textColor);
    pdf.setFont(fontBody);
    
    if (isMultipleSequences) {
      pdf.text(`Épisode: ${currentEpisode.titre}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Séquences: ${sequences.length}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Scènes totales: ${totalScenes}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Dialogues totaux: ${totalDialogues}`, 25, yPosition);
      yPosition += 15;
      
      // Détail par séquence
      pdf.setFontSize(11);
      pdf.setTextColor(...primaryColor);
      pdf.setFont(fontEmphasis);
      pdf.text('DÉTAIL PAR SÉQUENCE', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(9);
      pdf.setTextColor(...textColor);
      pdf.setFont(fontBody);
      
      sequences.forEach((sequence, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum, 'Résumé détaillé');
          yPosition = 40;
        }
        
        const sceneCount = sequence.scenes?.length || 0;
        const dialogueCount = sequence.scenes?.reduce((total, scene) => 
          total + (scene.dialogues?.length || 0), 0) || 0;
        
        pdf.setFontSize(10);
        pdf.setTextColor(...accentColor);
        pdf.text(`Séquence ${sequence.ordre}:`, 25, yPosition);
        
        pdf.setFontSize(9);
        pdf.setTextColor(...textColor);
        pdf.text(`  ${sequence.titre}`, 50, yPosition);
        yPosition += 5;
        pdf.text(`  • Scènes: ${sceneCount}`, 52, yPosition);
        yPosition += 4;
        pdf.text(`  • Dialogues: ${dialogueCount}`, 52, yPosition);
        yPosition += 4;
        pdf.text(`  • Statut: ${sequence.statutNom || 'Non défini'}`, 52, yPosition);
        yPosition += 8;
        
        if (index < sequences.length - 1) {
          pdf.setDrawColor(240, 240, 240);
          pdf.setLineWidth(0.1);
          pdf.line(25, yPosition - 2, 185, yPosition - 2);
          yPosition += 5;
        }
      });
    } else {
      pdf.text(`Séquence: ${currentSequence.titre}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Scènes: ${currentSequence.scenes?.length || 0}`, 25, yPosition);
      
      const dialogueCount = currentSequence.scenes?.reduce((total, scene) => 
        total + (scene.dialogues?.length || 0), 0) || 0;
      pdf.text(`Dialogues: ${dialogueCount}`, 25, yPosition + 6);
    }
    
    yPosition += 20;
    
    // Signature/Footer
    pdf.setDrawColor(...accentColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 80, yPosition);
    
    yPosition += 5;
    pdf.setFontSize(9);
    pdf.setTextColor(...mutedTextColor);
    pdf.setFont(fontBody);
    pdf.text('Document approuvé pour production', 20, yPosition);
    
    yPosition += 4;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Date d'approbation: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
    
    // =============================================
    // PIED DE PAGE SUR TOUTES LES PAGES
    // =============================================
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Ligne de pied de page
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.3);
      pdf.line(20, 285, 190, 285);
      
      // Texte du pied de page
      pdf.setFontSize(8);
      pdf.setTextColor(...mutedTextColor);
      pdf.setFont(fontBody);
      
      if (isMultipleSequences) {
        pdf.text(`Épisode ${currentEpisode.ordre} - ${currentEpisode.titre} • ${sequences.length} séquences • Page ${i}/${totalPages}`, 105, 290, { align: 'center' });
      } else {
        pdf.text(`Épisode ${currentEpisode.ordre} - Séquence ${currentSequence.ordre} • Page ${i}/${totalPages}`, 105, 290, { align: 'center' });
      }
      
      // Copyright
      pdf.setTextColor(180, 180, 180);
      pdf.text('© VDFI • Document confidentiel', 105, 295, { align: 'center' });
    }
    
    // =============================================
    // SAUVEGARDE DU DOCUMENT
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


