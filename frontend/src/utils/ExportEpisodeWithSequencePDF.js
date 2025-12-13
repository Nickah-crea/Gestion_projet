import jsPDF from 'jspdf';

export const exportEpisodeWithSequencePDF = async (currentEpisode, currentSequence) => {
  if (!currentEpisode || !currentSequence) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    // Page de garde
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 297, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text(`ÉPISODE ${currentEpisode.ordre}`, 105, 100, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(currentEpisode.titre.toUpperCase(), 105, 120, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(`Séquence ${currentSequence.ordre}`, 105, 140, { align: 'center' });
    pdf.text(currentSequence.titre, 105, 155, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Statut: ${currentEpisode.statutNom}`, 105, 175, { align: 'center' });
    
    // Équipe
    if (currentEpisode.realisateur || currentEpisode.scenariste) {
      pdf.text('ÉQUIPE:', 105, 195, { align: 'center' });
      let teamY = 205;
      
      if (currentEpisode.realisateur) {
        pdf.text(`Réalisateur: ${currentEpisode.realisateur.nom}`, 105, teamY, { align: 'center' });
        teamY += 8;
      }
      
      if (currentEpisode.scenariste) {
        pdf.text(`Scénariste: ${currentEpisode.scenariste.nom}`, 105, teamY, { align: 'center' });
        teamY += 8;
      }
    }
    
    pdf.text(`Exporté le ${new Date().toLocaleDateString()}`, 105, 230, { align: 'center' });
    
    pdf.addPage();
    
    let yPosition = 20;
    let pageNum = 2;
    
    // En-tête pages suivantes
    const addHeader = (pageNum) => {
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(`ÉPISODE ${currentEpisode.ordre} - ${currentEpisode.titre}`, 20, 15);
      pdf.text(`Page ${pageNum}`, 190, 15, { align: 'right' });
      
      pdf.setDrawColor(...secondaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, 35, 190, 35);
    };
    
    addHeader(pageNum);
    yPosition = 45;
    
    // Synopsis épisode
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(16);
    pdf.text('SYNOPSIS DE L\'ÉPISODE', 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const episodeSynopsisLines = pdf.splitTextToSize(currentEpisode.synopsis || 'Aucun synopsis', 170);
    pdf.text(episodeSynopsisLines, 20, yPosition);
    yPosition += (episodeSynopsisLines.length * 4) + 25;
    
    // Informations séquence
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryColor);
    pdf.text('INFORMATIONS DE LA SÉQUENCE', 20, yPosition);
    
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Séquence ${currentSequence.ordre}: ${currentSequence.titre}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Statut: ${currentSequence.statutNom}`, 20, yPosition);
    yPosition += 8;
    
    const sequenceSynopsisLines = pdf.splitTextToSize(`Synopsis: ${currentSequence.synopsis || 'Aucun synopsis'}`, 170);
    pdf.text(sequenceSynopsisLines, 20, yPosition);
    yPosition += (sequenceSynopsisLines.length * 4) + 20;
    
    // Résumé des scènes
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryColor);
    pdf.text('RÉSUMÉ DES SCÈNES', 20, yPosition);
    yPosition += 15;
    
    currentSequence.scenes.forEach((scene, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        pageNum++;
        addHeader(pageNum);
        yPosition = 45;
      }
      
      pdf.setFontSize(11);
      pdf.setTextColor(...primaryColor);
      pdf.text(`• Scène ${scene.ordre}: ${scene.titre}`, 25, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      
      // Synopsis court
      const shortSynopsis = scene.synopsis 
        ? (scene.synopsis.length > 120 ? scene.synopsis.substring(0, 120) + '...' : scene.synopsis)
        : 'Aucun synopsis';
      pdf.text(`  ${shortSynopsis}`, 28, yPosition);
      yPosition += 5;
      
      // Statut et lieux
      pdf.text(`  Statut: ${scene.statutNom || 'Non défini'}`, 28, yPosition);
      yPosition += 4;
      
      const lieuxCount = scene.sceneLieus?.length || 0;
      pdf.text(`  Lieux: ${lieuxCount}`, 28, yPosition);
      yPosition += 4;
      
      const dialoguesCount = scene.dialogues?.length || 0;
      pdf.text(`  Dialogues: ${dialoguesCount}`, 28, yPosition);
      yPosition += 8;
      
      // Ligne de séparation
      if (index < currentSequence.scenes.length - 1) {
        pdf.setDrawColor(220, 220, 220);
        pdf.line(25, yPosition - 2, 185, yPosition - 2);
        yPosition += 5;
      }
    });
    
    // Pied de page final
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Rapport Épisode ${currentEpisode.ordre} - Séquence ${currentSequence.ordre}`, 105, 290, { align: 'center' });
    }
    
    pdf.save(`episode-${currentEpisode.ordre}-sequence-${currentSequence.ordre}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF épisode + séquence:', error);
    throw error;
  }
};

