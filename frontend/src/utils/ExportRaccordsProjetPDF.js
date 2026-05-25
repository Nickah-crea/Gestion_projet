import jsPDF from 'jspdf';
import logoBase64 from '../assets/img/logo-vide.png';
import axios from 'axios';
import { getBase64FromUrl, formatDate } from './exportUtils';

export const exportRaccordsProjetPDF = async (projetInfos, projetTitle) => {
  if (!projetInfos?.id) {
    alert("Aucun projet sélectionné");
    return;
  }

  try {
    console.log('Début export PDF pour projet:', projetInfos.id);
    
    const response = await axios.get(`/api/raccords/export/projet/${projetInfos.id}`);
    const raccords = response.data;

    console.log('Raccords reçus:', raccords);

    if (!raccords || raccords.length === 0) {
      alert("Aucun raccord trouvé pour ce projet");
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
    
    const raccordCount = raccords.length;
    const criticalCount = raccords.filter(r => r.estCritique).length;
    
    // Grouper les raccords par épisode pour la table des matières
    const raccordsByEpisode = {};
    raccords.forEach(raccord => {
      const episodeKey = raccord.episodeId || 'sans-episode';
      if (!raccordsByEpisode[episodeKey]) {
        raccordsByEpisode[episodeKey] = {
          titre: raccord.episodeTitre || 'Épisode sans titre',
          ordre: raccord.episodeOrdre || '?',
          raccords: []
        };
      }
      raccordsByEpisode[episodeKey].raccords.push(raccord);
    });
    
    const episodeList = Object.values(raccordsByEpisode);
    
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
    pdf.text("RAPPORT DES RACCORDS", 105, yStart + 20, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...accentColor);
    const projectTitleLines = pdf.splitTextToSize(projetTitle.toUpperCase(), 160);
    let titleY = yStart + 45;
    projectTitleLines.forEach(line => {
      pdf.text(line, 105, titleY, { align: 'center' });
      titleY += 8;
    });
    
    // Métriques
    const infoY = titleY + 20;
    pdf.setFontSize(11);
    pdf.setTextColor(...textSecondary);
    pdf.text(`Projet complet`, 105, infoY, { align: 'center' });
    
    const metaY = infoY + 25;
    pdf.setFontSize(10);
    pdf.setTextColor(...textMuted);
    pdf.setFont('helvetica', 'normal');
    
    pdf.text(`${raccordCount} raccord${raccordCount > 1 ? 's' : ''}`, 105, metaY, { align: 'center' });
    pdf.text(`${episodeList.length} épisode${episodeList.length > 1 ? 's' : ''} concerné${episodeList.length > 1 ? 's' : ''}`, 105, metaY + 8, { align: 'center' });
    
    if (criticalCount > 0) {
      pdf.setTextColor(...accentColor);
      pdf.text(`${criticalCount} raccord${criticalCount > 1 ? 's' : ''} critique${criticalCount > 1 ? 's' : ''}`, 105, metaY + 18, { align: 'center' });
      pdf.setTextColor(...textMuted);
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
    
    pdf.text('v1.0 • Raccords de continuité - Projet', 105, 280, { align: 'center' });
    
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
      pdf.text(projetTitle.length > 30 ? projetTitle.substring(0, 27) + '...' : projetTitle, 185, 22, { align: 'right' });
      pdf.text(`Rapport complet`, 185, 29, { align: 'right' });
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
    // TABLE DES MATIÈRES
    // =============================================
    addHeader(pageNum, 'Table des matières');
    yPosition = 50;
    
    pdf.setTextColor(...primaryDark);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("TABLE DES MATIÈRES", 20, yPosition);
    
    yPosition += 8;
    pdf.setDrawColor(...secondPrimColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 85, yPosition);
    yPosition += 15;
    
    episodeList.forEach((episode, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum, 'Table des matières');
        yPosition = 50;
      }
      
      const episodeRaccordCount = episode.raccords.length;
      
      pdf.setFontSize(11);
      pdf.setTextColor(...accentColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Épisode ${episode.ordre}`, 25, yPosition);
      
      pdf.setTextColor(...primaryDark);
      pdf.setFont('helvetica', 'normal');
      const epTitle = episode.titre.length > 50 ? episode.titre.substring(0, 47) + '...' : episode.titre;
      pdf.text(epTitle, 60, yPosition);
      
      pdf.setFontSize(8);
      pdf.setTextColor(...textMuted);
      pdf.text(`${episodeRaccordCount} raccord${episodeRaccordCount > 1 ? 's' : ''}`, 160, yPosition);
      
      yPosition += 12;
      
      if (index < episodeList.length - 1) {
        pdf.setDrawColor(tertiaryLight[0], tertiaryLight[1], tertiaryLight[2]);
        pdf.setLineWidth(0.2);
        pdf.line(25, yPosition - 2, 185, yPosition - 2);
        yPosition += 5;
      }
    });
    
    yPosition += 15;
    
    // =============================================
    // LISTE DES RACCORDS PAR ÉPISODE
    // =============================================
    
    for (let epIdx = 0; epIdx < episodeList.length; epIdx++) {
      const episode = episodeList[epIdx];
      
      if (yPosition > 240) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum, `Épisode ${episode.ordre}`);
        yPosition = 50;
      }
      
      // En-tête d'épisode
      pdf.setFillColor(...primaryLight);
      pdf.roundedRect(20, yPosition - 2, 170, 12, 3, 3, 'F');
      
      pdf.setTextColor(...primaryDark);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Épisode ${episode.ordre}`, 25, yPosition + 6);
      
      pdf.setTextColor(...accentColor);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(episode.titre, 80, yPosition + 6);
      
      pdf.setTextColor(...textMuted);
      pdf.setFontSize(8);
      pdf.text(`${episode.raccords.length} raccord${episode.raccords.length > 1 ? 's' : ''}`, 170, yPosition + 6, { align: 'right' });
      
      yPosition += 18;
      
      // Parcourir les raccords de l'épisode
      for (let idx = 0; idx < episode.raccords.length; idx++) {
        const raccord = episode.raccords[idx];
        
        if (yPosition > 240) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum, `Épisode ${episode.ordre} - Suite`);
          yPosition = 50;
        }
        
        // Ligne fine au-dessus du raccord
        pdf.setDrawColor(...primaryLight);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPosition - 3, 190, yPosition - 3);
        
        // Badge raccord
        pdf.setFillColor(...primaryLight);
        pdf.roundedRect(20, yPosition - 2, 65, 9, 2, 2, 'F');
        pdf.setTextColor(...accentColor);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Raccord ${idx + 1}`, 23, yPosition + 4);
        
        // Type de raccord
        pdf.setTextColor(...primaryDark);
        pdf.setFontSize(9);
        pdf.text(raccord.typeRaccordNom || 'Type non spécifié', 90, yPosition + 4);
        
        // Indicateur critique
        if (raccord.estCritique) {
          pdf.setFillColor(...accentColor);
          pdf.circle(185, yPosition + 1, 3.5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(6);
          pdf.setFont('helvetica', 'bold');
          pdf.text('!', 184, yPosition + 2.5);
          pdf.setTextColor(...textSecondary);
        }
        
        yPosition += 14;
        
        // Scènes concernées
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...textSecondary);
        
        const sourceTitle = raccord.sceneSourceTitre || `Scène ${raccord.sceneSourceOrdre || '?'}`;
        const cibleTitle = raccord.sceneCibleTitre || `Scène ${raccord.sceneCibleOrdre || '?'}`;
        pdf.text(`Connexion : ${sourceTitle} → ${cibleTitle}`, 25, yPosition);
        yPosition += 6;
        
        // Séquence
        if (raccord.sequenceTitre) {
          pdf.text(`Séquence : ${raccord.sequenceTitre}`, 25, yPosition);
          yPosition += 6;
        }
        
        // Interprète
        if (raccord.comedienNom || raccord.personnageNom) {
          const actorText = raccord.personnageNom ? 
            `${raccord.personnageNom}${raccord.comedienNom ? ` (${raccord.comedienNom})` : ''}` : 
            raccord.comedienNom || '';
          pdf.text(`Interprète : ${actorText}`, 25, yPosition);
          yPosition += 6;
        }
        
        // Description
        if (raccord.description && raccord.description.trim()) {
          const descLines = pdf.splitTextToSize(`Description : ${raccord.description}`, 165);
          pdf.text(descLines, 25, yPosition);
          yPosition += (descLines.length * 4.5);
        }
        
        // Dates de tournage
        if (raccord.dateTournageSource || raccord.dateTournageCible) {
          const dateSource = raccord.dateTournageSource ? formatDate(raccord.dateTournageSource) : 'À planifier';
          const dateCible = raccord.dateTournageCible ? formatDate(raccord.dateTournageCible) : 'À planifier';
          pdf.text(`Tournage : ${dateSource} → ${dateCible}`, 25, yPosition);
          yPosition += 6;
        }
        
        // Statut
        pdf.text(`Statut : ${raccord.statutRaccordNom || 'Non défini'}`, 25, yPosition);
        yPosition += 8;
        
        // Images
        if (raccord.images && raccord.images.length > 0) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...primaryDark);
          pdf.text("Images de référence :", 25, yPosition);
          yPosition += 8;
          
          let imageX = 30;
          let imageY = yPosition;
          let imagesInCurrentRow = 0;
          let imagesAdded = 0;
          
          for (const img of raccord.images) {
            if (imagesAdded >= 2) break;
            
            if (!img.nomFichier || img.nomFichier.includes('undefined')) {
              console.warn('Nom de fichier invalide ignoré:', img.nomFichier);
              continue;
            }
            
            try {
              const base64 = await getBase64FromUrl(img.nomFichier);
              
              if (base64) {
                // Vérifier l'espace sur la ligne
                if (imageX + 50 > 185 && imagesInCurrentRow > 0) {
                  imageX = 30;
                  imageY += 65;
                  imagesInCurrentRow = 0;
                  
                  if (imageY + 65 > 270) {
                    pdf.addPage();
                    pageNum++;
                    addHeader(pageNum, `Suite - Épisode ${episode.ordre}`);
                    yPosition = 50;
                    imageX = 30;
                    imageY = yPosition;
                    imagesInCurrentRow = 0;
                  }
                }
                
                pdf.addImage(base64, 'JPEG', imageX, imageY, 50, 50);
                
                // Indicateur image de référence
                if (img.estImageReference) {
                  pdf.setFillColor(...accentColor);
                  pdf.circle(imageX + 8, imageY + 8, 4, 'F');
                  pdf.setTextColor(255, 255, 255);
                  pdf.setFontSize(6);
                  pdf.setFont('helvetica', 'bold');
                  pdf.text('R', imageX + 6.5, imageY + 9);
                  pdf.setTextColor(...textSecondary);
                }
                
                imagesAdded++;
                imagesInCurrentRow++;
                imageX += 55;
              }
            } catch (imgError) {
              console.warn('Erreur lors du chargement image:', img.nomFichier, imgError);
            }
          }
          
          if (imagesAdded > 0) {
            yPosition = imageY + 60;
          } else {
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(...textMuted);
            pdf.text('Aucune image disponible', 30, yPosition);
            yPosition += 12;
          }
        }
        
        yPosition += 15;
        
        // Séparation entre raccords
        if (idx < episode.raccords.length - 1) {
          if (yPosition < 270) {
            pdf.setDrawColor(...tertiaryLight);
            pdf.setLineWidth(0.2);
            pdf.line(20, yPosition, 190, yPosition);
            yPosition += 12;
          }
        }
      }
      
      yPosition += 15;
      
      // Séparation entre épisodes
      if (epIdx < episodeList.length - 1) {
        if (yPosition < 270) {
          pdf.setDrawColor(...secondPrimColor);
          pdf.setLineWidth(0.5);
          pdf.line(20, yPosition, 190, yPosition);
          yPosition += 15;
        }
      }
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
      
      // Référence sur la page de garde
      if (i === 1) {
        pdf.setFontSize(7);
        pdf.text(`Rapport des raccords - ${projetTitle.substring(0, 40)}`, 105, 293, { align: 'center' });
      } else {
        pdf.setFontSize(7);
        pdf.text(`Raccords de continuité - Projet ${projetTitle.substring(0, 30)}`, 20, 293);
      }
      
      if (i === totalPages) {
        pdf.setFontSize(7);
        pdf.setTextColor(...tertiaryColor);
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 293, { align: 'center' });
      }
    }
    
    // =============================================
    // SAUVEGARDE
    // =============================================
    const safeFileName = `Raccords-Projet-${projetInfos.id}-${projetTitle}`
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
    
    pdf.save(`${safeFileName}.pdf`);
    
    console.log('Export PDF des raccords projet terminé avec succès');

  } catch (err) {
    console.error('Erreur export raccords:', err);
    throw err;
  }
};

export default exportRaccordsProjetPDF;

