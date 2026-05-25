import jsPDF from 'jspdf';
import logoBase64 from '../assets/img/logo-vide.png';
import { formatDate } from './exportUtils';

export const exportScenePDF = async (scene, currentEpisode, getSceneCommentCount) => {
  if (!scene) return;
  
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
    
    const commentCount = getSceneCommentCount ? getSceneCommentCount(scene.idScene) : 0;
    const dialogueCount = scene.dialogues?.length || 0;
    const lieuCount = scene.sceneLieus?.length || 0;
    const tournageCount = scene.tournages?.length || 0;
    
    // =============================================
    // PAGE DE GARDE SPÉCIFIQUE SCÈNE
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
    pdf.text("FICHE SCÈNE", 105, yStart + 20, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...accentColor);
    pdf.text(`SCÈNE ${scene.ordre}`, 105, yStart + 45, { align: 'center' });
    
    pdf.setFontSize(13);
    pdf.setTextColor(...primaryDark);
    pdf.setFont('helvetica', 'normal');
    const sceneTitle = scene.titre || 'Sans titre';
    pdf.text(sceneTitle, 105, yStart + 60, { align: 'center' });
    
    // Métriques
    const infoY = yStart + 95;
    pdf.setFontSize(11);
    pdf.setTextColor(...textSecondary);
    pdf.text(`Épisode ${currentEpisode?.ordre || ''}`, 105, infoY, { align: 'center' });
    pdf.text(`${currentEpisode?.titre || ''}`, 105, infoY + 8, { align: 'center' });
    
    // Métadonnées de la scène
    const metaY = yStart + 130;
    pdf.setFontSize(10);
    pdf.setTextColor(...textMuted);
    pdf.setFont('helvetica', 'normal');
    
    pdf.text(`${dialogueCount} dialogue${dialogueCount > 1 ? 's' : ''}`, 105, metaY, { align: 'center' });
    pdf.text(`${lieuCount} lieu${lieuCount > 1 ? 'x' : ''}`, 105, metaY + 8, { align: 'center' });
    
    if (currentEpisode?.realisateur) {
      pdf.text(`Réalisateur: ${currentEpisode.realisateur.nom}`, 105, metaY + 20, { align: 'center' });
    }
    if (currentEpisode?.scenariste) {
      pdf.text(`Scénariste: ${currentEpisode.scenariste.nom}`, 105, metaY + 28, { align: 'center' });
    }
    
    // Statut
    if (scene.statutNom) {
      pdf.setTextColor(...accentColor);
      pdf.text(`Statut: ${scene.statutNom}`, 105, metaY + 40, { align: 'center' });
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
    
    pdf.text('v1.0 • Fiche scène', 105, 280, { align: 'center' });
    
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
      pdf.text(`Épisode ${currentEpisode?.ordre || ''} - Scène ${scene.ordre}`, 185, 29, { align: 'right' });
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
    // PREMIÈRE PAGE DE CONTENU
    // =============================================
    addHeader(pageNum, `Scène ${scene.ordre}`);
    yPosition = 50;
    
    // Badge scène
    pdf.setFillColor(...primaryLight);
    pdf.roundedRect(20, yPosition - 2, 55, 9, 2, 2, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Scène ${scene.ordre}`, 23, yPosition + 4);
    
    // Titre scène
    pdf.setTextColor(...primaryDark);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(sceneTitle, 80, yPosition + 4);
    
    // Métadonnées (statut à droite)
    if (scene.statutNom) {
      pdf.setFillColor(...primaryLight);
      pdf.roundedRect(160, yPosition - 2, 30, 9, 2, 2, 'F');
      pdf.setTextColor(...accentLight);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(scene.statutNom, 163, yPosition + 4);
    }
    
    yPosition += 14;
    
    // =============================================
    // SYNOPSIS
    // =============================================
    if (scene.synopsis && scene.synopsis.trim()) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textSecondary);
      const synopsisLines = pdf.splitTextToSize(scene.synopsis, 165);
      pdf.text(synopsisLines, 25, yPosition);
      yPosition += (synopsisLines.length * 4) + 8;
    }
    
    // =============================================
    // LIEUX ET PLATEAUX
    // =============================================
    if (scene.sceneLieus && scene.sceneLieus.length > 0) {
      if (yPosition > 250) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum, `Scène ${scene.ordre} - Lieux`);
        yPosition = 50;
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...primaryDark);
      pdf.text("LIEUX ET PLATEAUX", 20, yPosition);
      
      yPosition += 6;
      pdf.setDrawColor(...secondPrimColor);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition, 70, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textSecondary);
      
      scene.sceneLieus.forEach((sceneLieu, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum, `Scène ${scene.ordre} - Suite`);
          yPosition = 50;
        }
        
        let lieuText = `• ${sceneLieu.lieuNom}`;
        if (sceneLieu.plateauNom) {
          lieuText += ` (Plateau: ${sceneLieu.plateauNom})`;
        }
        
        pdf.text(lieuText, 25, yPosition);
        yPosition += 5;
        
        if (sceneLieu.descriptionUtilisation) {
          const descLines = pdf.splitTextToSize(sceneLieu.descriptionUtilisation, 160);
          pdf.setFontSize(8);
          pdf.setTextColor(...textMuted);
          pdf.text(descLines, 30, yPosition);
          yPosition += (descLines.length * 4);
          pdf.setFontSize(9);
          pdf.setTextColor(...textSecondary);
        }
        
        yPosition += 3;
      });
      
      yPosition += 8;
    }
    
    // =============================================
    // DIALOGUES
    // =============================================
    if (scene.dialogues && scene.dialogues.length > 0) {
      if (yPosition > 240) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum, `Scène ${scene.ordre} - Dialogues`);
        yPosition = 50;
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...primaryDark);
      pdf.text("DIALOGUES", 20, yPosition);
      
      yPosition += 6;
      pdf.setDrawColor(...secondPrimColor);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition, 70, yPosition);
      yPosition += 10;
      
      for (let dIdx = 0; dIdx < scene.dialogues.length; dIdx++) {
        const dialogue = scene.dialogues[dIdx];
        
        if (yPosition > 265) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum, `Scène ${scene.ordre} - Suite dialogues`);
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
        
        // Numéro de dialogue (discret à droite)
        pdf.setFontSize(7);
        pdf.setTextColor(...textMuted);
        pdf.text(`Dialogue ${dialogue.ordre || dIdx + 1}`, 180, yPosition - 3, { align: 'right' });
        
        yPosition += 6;
        
        // Ligne de séparation entre dialogues
        if (dIdx < scene.dialogues.length - 1) {
          pdf.setDrawColor(...primaryLight);
          pdf.setLineWidth(0.2);
          pdf.line(25, yPosition - 2, 190, yPosition - 2);
          yPosition += 5;
        }
      }
      
      yPosition += 10;
    } else {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(...textMuted);
      pdf.text("Aucun dialogue dans cette scène", 25, yPosition);
      yPosition += 15;
    }
    
    // =============================================
    // COMMENTAIRES
    // =============================================
    if (commentCount > 0) {
      if (yPosition > 250) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum, `Scène ${scene.ordre} - Commentaires`);
        yPosition = 50;
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...primaryDark);
      pdf.text("COMMENTAIRES", 20, yPosition);
      
      yPosition += 6;
      pdf.setDrawColor(...secondPrimColor);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition, 70, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textSecondary);
      pdf.text(`${commentCount} commentaire${commentCount > 1 ? 's' : ''} disponible${commentCount > 1 ? 's' : ''}`, 25, yPosition);
      yPosition += 15;
    }
    
    // =============================================
    // INFORMATIONS DE TOURNAGE
    // =============================================
    if (scene.tournages && scene.tournages.length > 0) {
      if (yPosition > 250) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum, `Scène ${scene.ordre} - Tournage`);
        yPosition = 50;
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...primaryDark);
      pdf.text("INFORMATIONS DE TOURNAGE", 20, yPosition);
      
      yPosition += 6;
      pdf.setDrawColor(...secondPrimColor);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition, 90, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textSecondary);
      
      scene.tournages.forEach((tournage, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum, `Scène ${scene.ordre} - Suite`);
          yPosition = 50;
        }
        
        const dateStr = tournage.dateTournage ? formatDate(tournage.dateTournage) : 'Date non définie';
        const statutStr = tournage.statutNom || 'Statut inconnu';
        pdf.text(`• ${dateStr} - ${statutStr}`, 25, yPosition);
        yPosition += 6;
      });
    }
    
    // =============================================
    // PIED DE PAGE MINIMALISTE (identique à l'épisode)
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
      
      // Référence de la scène en bas à gauche
      pdf.setFontSize(7);
      const shortTitle = sceneTitle.substring(0, 35);
      pdf.text(`Scène ${scene.ordre} - ${shortTitle}${sceneTitle.length > 35 ? '...' : ''}`, 20, 293);
      
      if (i === totalPages) {
        pdf.setFontSize(7);
        pdf.setTextColor(...tertiaryColor);
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 293, { align: 'center' });
      }
    }
    
    // =============================================
    // SAUVEGARDE
    // =============================================
    const safeFileName = `Episode-${currentEpisode?.ordre || ''}-Scene-${scene.ordre}-${sceneTitle}`
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    pdf.save(`${safeFileName}.pdf`);
    
    console.log(`PDF de la scène ${scene.ordre} exporté avec succès`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF de la scène:', error);
    throw error;
  }
};

export default exportScenePDF;

