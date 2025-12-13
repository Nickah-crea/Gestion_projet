import jsPDF from 'jspdf';

export const exportScenesOnlyPDF = async (currentSequence, currentEpisode) => {
  if (!currentSequence) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    const accentColor = [23, 162, 184];
    
    let yPosition = 20;
    
    // En-tête avec design de facture
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Logo/Titre à gauche
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${currentEpisode?.ordre}: ${currentEpisode?.titre}`, 20, 25);
    
    // Informations à droite
    pdf.text(`Séquence ${currentSequence.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Scènes: ${currentSequence.scenes?.length || 0}`, 160, 29);
    
    // Ligne de séparation
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    yPosition = 60;
    
    // Titre principal
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(18);
    pdf.text(`LISTE DES SCÈNES - SÉQUENCE ${currentSequence.ordre}`, 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Séquence: ${currentSequence.titre}`, 20, yPosition);
    
    yPosition += 20;
    
    // Tableau des scènes
    currentSequence.scenes.forEach((scene, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
        
        // En-tête sur les nouvelles pages
        pdf.setFillColor(...primaryColor);
        pdf.rect(0, 0, 210, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(`Suite - Scènes Séquence ${currentSequence.ordre}`, 20, 20);
        yPosition = 40;
      }
      
      // En-tête de scène
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition - 8, 170, 10, 'F');
      
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(11);
      pdf.text(`SCÈNE ${scene.ordre}: ${scene.titre}`, 22, yPosition);
      
      yPosition += 12;
      
      // Informations scène
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      
      // Synopsis
      const synopsisLines = pdf.splitTextToSize(scene.synopsis || 'Aucun synopsis', 160);
      pdf.text('Synopsis:', 22, yPosition);
      pdf.text(synopsisLines, 25, yPosition + 4);
      
      // Statut et lieux à droite
      pdf.text(`Statut: ${scene.statutNom || 'Non défini'}`, 130, yPosition);
      
      const lieuxText = scene.sceneLieus?.length 
        ? scene.sceneLieus.map(sl => sl.lieuNom).join(', ')
        : 'Aucun lieu';
      const lieuxLines = pdf.splitTextToSize(`Lieux: ${lieuxText}`, 55);
      pdf.text(lieuxLines, 130, yPosition + 5);
      
      yPosition += Math.max(synopsisLines.length * 3.5, lieuxLines.length * 3.5, 15) + 15;
      
      // Ligne de séparation
      if (index < currentSequence.scenes.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, yPosition - 5, 190, yPosition - 5);
        yPosition += 5;
      }
    });
    
    // Pied de page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' });
      pdf.text(`Exporté le ${new Date().toLocaleDateString()}`, 105, 293, { align: 'center' });
    }
    
    pdf.save(`scenes-sequence-${currentSequence.ordre}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des scènes:', error);
    throw error;
  }
};

