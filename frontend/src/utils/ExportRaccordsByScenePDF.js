import jsPDF from 'jspdf';
import logoBase64 from '../assets/img/logo-vide.png';
import axios from 'axios';
import { getBase64FromUrl, formatDate } from './exportUtils';

export const exportRaccordsByScene = async (sceneId, store, formatDate, getBase64FromUrl) => {
  try {
    console.log('Début export PDF pour scène:', sceneId);
    
    const raccordsResponse = await axios.get(`/api/raccords/scene/${sceneId}`);
    const raccords = raccordsResponse.data;

    const scene = store.currentSequence?.scenes?.find(s => s.idScene === sceneId);
    const sceneTitre = scene?.titre || `Scène ${sceneId}`;
    const sceneOrdre = scene?.ordre || '';
    const currentEpisode = store.currentEpisode;
    const currentSequence = store.currentSequence;

    if (!raccords || raccords.length === 0) {
      alert('Aucun raccord trouvé pour cette scène.');
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
    pdf.text(`SCÈNE ${sceneOrdre}`, 105, yStart + 45, { align: 'center' });
    
    pdf.setFontSize(13);
    pdf.setTextColor(...primaryDark);
    pdf.setFont('helvetica', 'normal');
    const sceneTitleLines = pdf.splitTextToSize(sceneTitre, 160);
    let titleY = yStart + 60;
    sceneTitleLines.forEach(line => {
      pdf.text(line, 105, titleY, { align: 'center' });
      titleY += 7;
    });
    
    // Métriques
    const infoY = titleY + 15;
    pdf.setFontSize(11);
    pdf.setTextColor(...textSecondary);
    pdf.text(`Épisode ${currentEpisode?.ordre || ''}`, 105, infoY, { align: 'center' });
    pdf.text(`${currentEpisode?.titre || ''}`, 105, infoY + 8, { align: 'center' });
    
    if (currentSequence) {
      pdf.text(`Séquence ${currentSequence.ordre} : ${currentSequence.titre}`, 105, infoY + 20, { align: 'center' });
    }
    
    // Métadonnées des raccords
    const metaY = infoY + 40;
    pdf.setFontSize(10);
    pdf.setTextColor(...textMuted);
    pdf.setFont('helvetica', 'normal');
    
    pdf.text(`${raccordCount} raccord${raccordCount > 1 ? 's' : ''}`, 105, metaY, { align: 'center' });
    
    if (criticalCount > 0) {
      pdf.setTextColor(...accentColor);
      pdf.text(`${criticalCount} raccord${criticalCount > 1 ? 's' : ''} critique${criticalCount > 1 ? 's' : ''}`, 105, metaY + 8, { align: 'center' });
      pdf.setTextColor(...textMuted);
    }
    
    if (currentEpisode?.realisateur) {
      pdf.text(`Réalisateur: ${currentEpisode.realisateur.nom}`, 105, metaY + 20, { align: 'center' });
    }
    if (currentEpisode?.scenariste) {
      pdf.text(`Scénariste: ${currentEpisode.scenariste.nom}`, 105, metaY + 28, { align: 'center' });
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
    
    pdf.text('v1.0 • Raccords de continuité', 105, 280, { align: 'center' });
    
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
      pdf.text(`Épisode ${currentEpisode?.ordre || ''} - Scène ${sceneOrdre}`, 185, 29, { align: 'right' });
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
    addHeader(pageNum, `Raccords - ${sceneTitre.substring(0, 40)}`);
    yPosition = 50;
    
    // Badge scène
    pdf.setFillColor(...primaryLight);
    pdf.roundedRect(20, yPosition - 2, 55, 9, 2, 2, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Scène ${sceneOrdre}`, 23, yPosition + 4);
    
    // Titre scène
    pdf.setTextColor(...primaryDark);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const shortTitle = sceneTitre.length > 50 ? sceneTitre.substring(0, 47) + '...' : sceneTitre;
    pdf.text(shortTitle, 80, yPosition + 4);
    
    // Compteur de raccords
    pdf.setFillColor(...primaryLight);
    pdf.roundedRect(160, yPosition - 2, 30, 9, 2, 2, 'F');
    pdf.setTextColor(...accentLight);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${raccordCount} raccord${raccordCount > 1 ? 's' : ''}`, 163, yPosition + 4);
    
    yPosition += 14;
    
    // Ligne de séparation
    pdf.setDrawColor(...secondPrimColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 12;
    
    // =============================================
    // LISTE DES RACCORDS
    // =============================================
    
    // Fonction pour ajouter une image
    const addImageToPDF = async (image) => {
      if (!image.nomFichier || image.nomFichier.includes('undefined')) {
        console.warn('Image ignorée - nom invalide');
        return null;
      }
      
      try {
        const base64 = await getBase64FromUrl(image.nomFichier);
        return base64;
      } catch (imageError) {
        console.warn(`Erreur image:`, imageError);
        return null;
      }
    };
    
    for (let idx = 0; idx < raccords.length; idx++) {
      const raccord = raccords[idx];
      const raccordIndex = idx + 1;
      
      if (yPosition > 240) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum, `Raccords - ${sceneTitre.substring(0, 35)}`);
        yPosition = 50;
      }
      
      // Ligne fine au-dessus du raccord
      pdf.setDrawColor(...primaryLight);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition - 3, 190, yPosition - 3);
      
      // Badge raccord
      pdf.setFillColor(...primaryLight);
      pdf.roundedRect(20, yPosition - 2, 75, 9, 2, 2, 'F');
      pdf.setTextColor(...accentColor);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Raccord ${raccordIndex}`, 23, yPosition + 4);
      
      // Type de raccord
      pdf.setTextColor(...primaryDark);
      pdf.setFontSize(10);
      pdf.text(raccord.typeRaccordNom || 'Type non spécifié', 100, yPosition + 4);
      
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
      const otherScene = raccord.sceneSourceId === sceneId ? raccord.sceneCibleTitre : raccord.sceneSourceTitre;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textSecondary);
      pdf.text(`Connexion : ${sceneTitre} → ${otherScene}`, 25, yPosition);
      yPosition += 6;
      
      // Interprète
      if (raccord.personnageNom || raccord.comedienNom) {
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
      yPosition += 10;
      
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
        
        for (const [imgIndex, image] of raccord.images.entries()) {
          try {
            const base64 = await addImageToPDF(image);
            
            if (base64) {
              // Vérifier l'espace sur la ligne
              if (imageX + 50 > 185 && imagesInCurrentRow > 0) {
                imageX = 30;
                imageY += 65;
                imagesInCurrentRow = 0;
                
                if (imageY + 65 > 270) {
                  pdf.addPage();
                  pageNum++;
                  addHeader(pageNum, `Raccords - Suite`);
                  yPosition = 50;
                  imageX = 30;
                  imageY = yPosition;
                  imagesInCurrentRow = 0;
                }
              }
              
              pdf.addImage(base64, 'JPEG', imageX, imageY, 50, 50);
              
              // Indicateur image de référence
              if (image.estImageReference) {
                pdf.setFillColor(...accentColor);
                pdf.circle(imageX + 8, imageY + 8, 4, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(6);
                pdf.setFont('helvetica', 'bold');
                pdf.text('R', imageX + 6.5, imageY + 9);
                pdf.setTextColor(...textSecondary);
              }
              
              imagesInCurrentRow++;
              imageX += 55;
            }
          } catch (imageError) {
            console.warn(`Erreur image ${imgIndex + 1}:`, imageError);
          }
        }
        
        if (imagesInCurrentRow > 0) {
          yPosition = imageY + 60;
        }
      }
      
      yPosition += 15;
      
      // Séparation entre raccords
      if (idx < raccords.length - 1) {
        if (yPosition < 270) {
          pdf.setDrawColor(...tertiaryLight);
          pdf.setLineWidth(0.2);
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
        pdf.text(`Rapport des raccords - Scène ${sceneOrdre}`, 105, 293, { align: 'center' });
      } else {
        pdf.setFontSize(7);
        const pageTitle = sceneTitre.substring(0, 35);
        pdf.text(`${pageTitle}${sceneTitre.length > 35 ? '...' : ''}`, 20, 293);
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
    const safeFileName = `Episode-${currentEpisode?.ordre || ''}-Scene-${sceneOrdre}-Raccords`
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    pdf.save(`${safeFileName}.pdf`);
    
    console.log(`Export PDF des raccords terminé avec succès !`);
    
  } catch (err) {
    console.error('Erreur lors de l\'export PDF:', err);
    throw err;
  }
};

export default exportRaccordsByScene;


