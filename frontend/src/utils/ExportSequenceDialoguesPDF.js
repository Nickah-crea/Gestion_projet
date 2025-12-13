import jsPDF from 'jspdf';

export const exportSequenceDialoguesPDF = async (currentSequence, currentEpisode) => {
  if (!currentSequence) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    // En-tête
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${currentEpisode?.ordre}: ${currentEpisode?.titre}`, 20, 25);
    
    pdf.text(`Séquence ${currentSequence.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Scènes: ${currentSequence.scenes?.length || 0}`, 160, 29);
    
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    let yPosition = 60;
    
    // Titre
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(18);
    pdf.text(`DIALOGUES COMPLETS - SÉQUENCE ${currentSequence.ordre}`, 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Séquence: ${currentSequence.titre}`, 20, yPosition);
    
    yPosition += 20;
    
    // Parcourir toutes les scènes
    currentSequence.scenes.forEach(scene => {
      if (scene.dialogues?.length) {
        // Titre de la scène
        if (yPosition > 230) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, yPosition - 5, 170, 8, 'F');
        
        pdf.setFontSize(14);
        pdf.setTextColor(...primaryColor);
        pdf.text(`SCÈNE ${scene.ordre}: ${scene.titre}`, 22, yPosition);
        yPosition += 15;
        
        // Dialogues de la scène
        scene.dialogues.forEach((dialogue, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Personnage
          pdf.setFontSize(11);
          pdf.setTextColor(23, 162, 184);
          pdf.text(`${dialogue.personnageNom || 'NARRATEUR'}:`, 25, yPosition);
          
          yPosition += 7;
          
          // Texte
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          const dialogueLines = pdf.splitTextToSize(dialogue.texte, 160);
          pdf.text(dialogueLines, 30, yPosition);
          yPosition += (dialogueLines.length * 4.5) + 8;
          
          // Ligne de séparation entre dialogues
          if (index < scene.dialogues.length - 1) {
            pdf.setDrawColor(220, 220, 220);
            pdf.line(25, yPosition - 3, 185, yPosition - 3);
            yPosition += 5;
          }
        });
        
        yPosition += 15;
        
        // Ligne de séparation entre scènes
        pdf.setDrawColor(180, 180, 180);
        pdf.line(20, yPosition - 5, 190, yPosition - 5);
        yPosition += 10;
      }
    });
    
    // Pied de page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    pdf.save(`dialogues-sequence-${currentSequence.ordre}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des dialogues de séquence:', error);
    throw error;
  }
};

