import jsPDF from 'jspdf';
import { formatDate } from './exportUtils';

export const exportScenePDF = async (scene, currentEpisode, getSceneCommentCount) => {
  if (!scene) return;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    const accentColor = [23, 162, 184];
    
    let yPosition = 20;
    
    // ========== EN-TÊTE ==========
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${currentEpisode?.ordre}: ${currentEpisode?.titre}`, 20, 25);
    
    pdf.text(`Scène ${scene.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Statut: ${scene.statutNom || 'Non défini'}`, 160, 29);
    
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    yPosition = 60;
    
    // ========== TITRE DE LA SCÈNE ==========
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(`SCÈNE ${scene.ordre}: ${scene.titre}`, 20, yPosition);
    
    yPosition += 15;
    
    // ========== INFORMATIONS GÉNÉRALES ==========
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    
    // Synopsis
    if (scene.synopsis) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Synopsis:", 20, yPosition);
      yPosition += 7;
      
      pdf.setFont("helvetica", "normal");
      const synopsisLines = pdf.splitTextToSize(scene.synopsis, 170);
      pdf.text(synopsisLines, 25, yPosition);
      yPosition += (synopsisLines.length * 4.5) + 10;
    }
    
    // Statut
    pdf.setFont("helvetica", "bold");
    pdf.text("Statut:", 20, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(scene.statutNom || 'Non défini', 45, yPosition);
    yPosition += 10;
    
    // Lieux et plateaux
    if (scene.sceneLieus?.length > 0) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Lieux et Plateaux:", 20, yPosition);
      yPosition += 7;
      
      pdf.setFont("helvetica", "normal");
      scene.sceneLieus.forEach((sceneLieu, index) => {
        let lieuText = `• ${sceneLieu.lieuNom}`;
        if (sceneLieu.plateauNom) {
          lieuText += ` (Plateau: ${sceneLieu.plateauNom})`;
        }
        if (sceneLieu.descriptionUtilisation) {
          lieuText += ` - ${sceneLieu.descriptionUtilisation}`;
        }
        
        const lieuLines = pdf.splitTextToSize(lieuText, 165);
        lieuLines.forEach(line => {
          pdf.text(line, 25, yPosition);
          yPosition += 4.5;
        });
        yPosition += 2;
      });
      yPosition += 5;
    }
    
    // ========== DIALOGUES ==========
    if (scene.dialogues?.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text("DIALOGUES:", 20, yPosition);
      yPosition += 15;
      
      scene.dialogues.forEach((dialogue, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // En-tête dialogue
        pdf.setFillColor(245, 245, 245);
        pdf.rect(20, yPosition - 5, 170, 8, 'F');
        
        // Personnage
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...accentColor);
        pdf.text(`${dialogue.personnageNom || 'NARRATEUR'}:`, 22, yPosition);
        
        yPosition += 10;
        
        // Texte du dialogue
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        const dialogueLines = pdf.splitTextToSize(dialogue.texte, 165);
        pdf.text(dialogueLines, 25, yPosition);
        yPosition += (dialogueLines.length * 4.5) + 8;
        
        // Observation
        if (dialogue.observation) {
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.setFont("helvetica", "italic");
          const observationLines = pdf.splitTextToSize(`Note: ${dialogue.observation}`, 160);
          pdf.text(observationLines, 28, yPosition);
          yPosition += (observationLines.length * 4) + 6;
          pdf.setFont("helvetica", "normal");
        }
        
        // Ordre
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Dialogue ${dialogue.ordre}`, 180, yPosition - 10, { align: 'right' });
        
        yPosition += 10;
        
        // Ligne de séparation
        if (index < scene.dialogues.length - 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.line(20, yPosition - 3, 190, yPosition - 3);
          yPosition += 5;
        }
      });
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "italic");
      pdf.text("Aucun dialogue dans cette scène", 20, yPosition);
      yPosition += 15;
    }
    
    // ========== COMMENTAIRES ==========
    if (getSceneCommentCount && getSceneCommentCount(scene.idScene) > 0) {
      yPosition += 10;
      
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text(`COMMENTAIRES (${getSceneCommentCount(scene.idScene)})`, 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${getSceneCommentCount(scene.idScene)} commentaire(s) disponible(s)`, 25, yPosition);
      yPosition += 15;
    }
    
    // ========== INFORMATIONS DE TOURNAGE ==========
    if (scene.tournages && scene.tournages.length > 0) {
      yPosition += 5;
      
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text("INFORMATIONS DE TOURNAGE:", 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      scene.tournages.forEach((tournage, index) => {
        const tournageText = `${tournage.dateTournage ? formatDate(tournage.dateTournage) : 'Date non définie'} - ${tournage.statutNom || 'Statut inconnu'}`;
        pdf.text(`• ${tournageText}`, 25, yPosition);
        yPosition += 6;
      });
    }
    
    // ========== PIED DE PAGE ==========
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Scène ${scene.ordre} - ${scene.titre.substring(0, 30)}${scene.titre.length > 30 ? '...' : ''}`, 20, 290);
      pdf.text(`Page ${i} sur ${totalPages}`, 105, 290, { align: 'center' });
      pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 190, 290, { align: 'right' });
    }
    
    // ========== SAUVEGARDE ==========
    const safeFileName = `scene-${scene.ordre}-${scene.titre}`
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    pdf.save(`${safeFileName}.pdf`);
    
    console.log(`PDF de la scène ${scene.ordre} exporté avec succès`);
    
  } catch (error) {
    console.error('Erreur lors de l\'export PDF de la scène:', error);
    throw error;
  }
};
