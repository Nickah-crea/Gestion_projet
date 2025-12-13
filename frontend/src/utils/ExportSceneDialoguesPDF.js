import jsPDF from 'jspdf';

export const exportSceneDialoguesPDF = async (scene, currentEpisode, currentSequence) => {
  if (!scene) return;
  
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
    pdf.text(`Épisode ${currentEpisode?.ordre} - Séquence ${currentSequence?.ordre}`, 20, 25);
    
    pdf.text(`Scène ${scene.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Dialogues: ${scene.dialogues?.length || 0}`, 160, 29);
    
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    let yPosition = 60;
    
    // Titre
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(18);
    pdf.text(`DIALOGUES - SCÈNE ${scene.ordre}`, 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Scène: ${scene.titre}`, 20, yPosition);
    
    yPosition += 15;
    
    // Dialogues
    if (scene.dialogues?.length) {
      scene.dialogues.forEach((dialogue, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Personnage avec fond
        pdf.setFillColor(245, 245, 245);
        pdf.rect(20, yPosition - 5, 170, 8, 'F');
        
        pdf.setFontSize(11);
        pdf.setTextColor(...primaryColor);
        pdf.text(`${dialogue.personnageNom || 'NARRATEUR'}:`, 22, yPosition);
        
        yPosition += 10;
        
        // Texte du dialogue
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        const dialogueLines = pdf.splitTextToSize(dialogue.texte, 165);
        pdf.text(dialogueLines, 25, yPosition);
        yPosition += (dialogueLines.length * 4.5) + 5;
        
        // Observation
        if (dialogue.observation) {
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Note: ${dialogue.observation}`, 25, yPosition);
          yPosition += 8;
        }
        
        yPosition += 8;
        
        // Ligne de séparation
        if (index < scene.dialogues.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.line(20, yPosition - 3, 190, yPosition - 3);
          yPosition += 5;
        }
      });
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Aucun dialogue dans cette scène', 20, yPosition);
    }
    
    // Pied de page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    pdf.save(`dialogues-scene-${scene.ordre}.pdf`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF des dialogues:', error);
    throw error;
  }
};


