import jsPDF from 'jspdf';
import logoBase64 from '../assets/img/logo-vide.png';

export const exportScenesOnlyPDF = async (currentSequence, currentEpisode) => {
  if (!currentSequence) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Palette de couleurs
    const primaryColor = [95, 126, 150];     // #5F7E96 - Chambray
    const secondaryColor = [196, 122, 107];  // #C47A6B - Dusty rose
    const accentColor = [173, 117, 86];      // #AD7556 - Terracotta
    const textColor = [44, 36, 30];          // #2C241E - Warm black
    const textMutedColor = [107, 90, 78];    // #6B5A4E - Taupe
    
    let yPosition = 20;
    
    // En-tête avec design de facture
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Logo à gauche
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, 'PNG', 10, 8, 35, 15);
      } catch (imgError) {
        console.warn('Erreur insertion logo:', imgError);
      }
    }
    
    // Titres à droite du logo
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${currentEpisode?.projetTitre || 'CINEMA'}`, 45, 15);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Épisode ${currentEpisode?.ordre}: ${currentEpisode?.titre || ''}`, 45, 24);
    
    // Informations à droite
    pdf.setFontSize(10);
    pdf.text(`SÉQUENCE ${currentSequence.ordre}`, 150, 15);
    pdf.text(`${new Date().toLocaleDateString('fr-FR')}`, 150, 24);
    pdf.text(`${currentSequence.scenes?.length || 0} scènes`, 150, 33);
    
    // Ligne de séparation
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.8);
    pdf.line(20, 45, 190, 45);
    
    yPosition = 55;
    
    // Titre principal
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`LISTE DES SCÈNES`, 20, yPosition);
    
    yPosition += 8;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...textMutedColor);
    pdf.text(`Séquence ${currentSequence.ordre} : ${currentSequence.titre || 'Sans titre'}`, 20, yPosition);
    
    yPosition += 20;
    
    // Tableau des scènes
    currentSequence.scenes.forEach((scene, index) => {
      if (yPosition > 260) {
        pdf.addPage();
        yPosition = 20;
        
        // En-tête sur les nouvelles pages
        pdf.setFillColor(...primaryColor);
        pdf.rect(0, 0, 210, 35, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Suite - Scènes Séquence ${currentSequence.ordre}`, 20, 22);
        yPosition = 40;
      }
      
      // Numéro de scène
      pdf.setFillColor(241, 239, 230);
      pdf.rect(20, yPosition - 6, 25, 8, 'F');
      pdf.setTextColor(...accentColor);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${scene.ordre}`, 23, yPosition);
      
      // Titre de la scène
      pdf.setTextColor(...textColor);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(scene.titre || 'Sans titre', 50, yPosition);
      
      yPosition += 12;
      
      // Synopsis (à gauche)
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textMutedColor);
      
      const synopsisText = scene.synopsis || 'Aucun synopsis';
      const synopsisLines = pdf.splitTextToSize(synopsisText, 110);
      pdf.text(synopsisLines, 22, yPosition);
      
      // Informations à droite avec plus d'espace
      const synopsisHeight = synopsisLines.length * 4;
      
      // Position de départ pour les infos de droite (plus haut pour aligner avec le début du synopsis)
      let infoYStart = yPosition;
      
      pdf.setTextColor(...secondaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Statut:', 150, infoYStart);
      pdf.setTextColor(...textMutedColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text(scene.statutNom || 'Non défini', 165, infoYStart);
      
      const lieuxText = scene.sceneLieus?.length 
        ? scene.sceneLieus.map(sl => sl.lieuNom).join(', ')
        : 'Aucun lieu';
      const lieuxLines = pdf.splitTextToSize(lieuxText, 55);
      
      pdf.setTextColor(...secondaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Lieux:', 150, infoYStart + 8);
      pdf.setTextColor(...textMutedColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text(lieuxLines, 150, infoYStart + 12);
      
      // Calcul de la hauteur pour les lieux
      const lieuxHeight = lieuxLines.length * 4 + 8;
      
      // Utiliser la hauteur maximale entre synopsis et lieux, avec espace supplémentaire
      yPosition += Math.max(synopsisHeight, lieuxHeight, 25) + 20;
      
      // Ligne de séparation avec plus d'espace
      if (index < currentSequence.scenes.length - 1) {
        pdf.setDrawColor(220, 207, 184);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPosition - 8, 190, yPosition - 8);
        yPosition += 8;
      }
    });
    
    // Pied de page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(...textMutedColor);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i} / ${pageCount}`, 105, 285, { align: 'center' });
      pdf.text(`${new Date().toLocaleDateString('fr-FR')}`, 105, 290, { align: 'center' });
    }
    
    pdf.save(`SEQ-${currentSequence.ordre}_scenes.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des scènes:', error);
    throw error;
  }
};

