// usePDFExporter.js
import { ref } from 'vue';
import axios from 'axios';
import jsPDF from 'jspdf';

export function usePDFExporter(emits) {
  
  // Couleurs de l'application
  const colorPrimary = [33, 41, 79];      // #21294F
  const colorSecondary = [220, 53, 69];   // #dc3545
  const colorAccent = [23, 162, 184];     // #17a2b8
  const colorLight = [240, 240, 240];
  
  // Fonction utilitaire pour charger les images
  const getBase64FromUrl = async (filename) => {
    if (!filename || filename.includes('undefined') || filename === 'undefined') {
      console.warn('Nom de fichier invalide:', filename);
      return null;
    }

    try {
      const staticUrl = `http://localhost:8080/api/images/raccords/${filename}`;
      
      const staticResponse = await axios.get(staticUrl, {
        responseType: 'blob',
        timeout: 5000
      });
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(staticResponse.data);
      });
    } catch (staticError) {
      console.warn('Erreur avec serveur statique, tentative API:', staticError.message);
      
      try {
        const apiUrl = `http://localhost:8080/api/api/images/raccord/${filename}`;
        
        const apiResponse = await axios.get(apiUrl, {
          responseType: 'blob',
          timeout: 5000
        });
        
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(apiResponse.data);
        });
      } catch (apiError) {
        console.warn('Échec des deux méthodes pour:', filename, apiError.message);
        return null;
      }
    }
  };

  // Fonction pour ajouter l'en-tête standard
  const addStandardHeader = (pdf, currentSequence, currentEpisode, pageTitle) => {
    // En-tête avec fond
    pdf.setFillColor(...colorPrimary);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Texte à gauche
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${currentEpisode?.ordre}: ${currentEpisode?.titre}`, 20, 25);
    
    // Informations à droite
    pdf.text(pageTitle, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    
    // Ligne de séparation
    pdf.setDrawColor(...colorSecondary);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    return 60; // Retourne la position Y de départ
  };

  // Fonction pour ajouter le pied de page
  const addStandardFooter = (pdf, totalPages) => {
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} sur ${totalPages}`, 105, 290, { align: 'center' });
      pdf.text(`Exporté le ${new Date().toLocaleDateString()}`, 105, 293, { align: 'center' });
    }
  };

  // 1. Export des scènes seulement
  const exportScenesOnlyPDF = async (currentSequence, currentEpisode) => {
    if (!currentSequence) {
      emits('export-error', { error: new Error('Aucune séquence sélectionnée'), type: 'scenes' });
      return;
    }
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let yPosition = addStandardHeader(pdf, currentSequence, currentEpisode, `Séquence ${currentSequence.ordre}`);
      
      // Titre principal
      pdf.setTextColor(...colorPrimary);
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
          pdf.setFillColor(...colorPrimary);
          pdf.rect(0, 0, 210, 40, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(12);
          pdf.text(`Suite - Scènes Séquence ${currentSequence.ordre}`, 20, 20);
          yPosition = 40;
        }
        
        // En-tête de scène
        pdf.setFillColor(colorLight[0], colorLight[1], colorLight[2]);
        pdf.rect(20, yPosition - 8, 170, 10, 'F');
        
        pdf.setTextColor(...colorPrimary);
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
      addStandardFooter(pdf, pdf.internal.getNumberOfPages());
      
      pdf.save(`scenes-sequence-${currentSequence.ordre}.pdf`);
      emits('export-complete', { type: 'scenes', sequenceId: currentSequence.idSequence });
      
    } catch (error) {
      console.error('Erreur export PDF scènes:', error);
      emits('export-error', { error, type: 'scenes' });
    }
  };

  // 2. Export des dialogues d'une scène
  const exportSceneDialoguesPDF = async (scene, currentEpisode) => {
    if (!scene) {
      emits('export-error', { error: new Error('Aucune scène sélectionnée'), type: 'scene-dialogues' });
      return;
    }
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // En-tête
      pdf.setFillColor(...colorPrimary);
      pdf.rect(0, 0, 210, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text(`PROJET: ${currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
      pdf.setFontSize(12);
      pdf.text(`Épisode ${currentEpisode?.ordre} - Séquence ${currentEpisode?.currentSequence?.ordre || ''}`, 20, 25);
      
      pdf.text(`Scène ${scene.ordre}`, 160, 15);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
      pdf.text(`Dialogues: ${scene.dialogues?.length || 0}`, 160, 29);
      
      pdf.setDrawColor(...colorSecondary);
      pdf.setLineWidth(0.5);
      pdf.line(20, 45, 190, 45);
      
      let yPosition = 60;
      
      // Titre
      pdf.setTextColor(...colorPrimary);
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
          pdf.setTextColor(...colorPrimary);
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
      emits('export-complete', { type: 'scene-dialogues', sceneId: scene.idScene });
      
    } catch (error) {
      console.error('Erreur export PDF dialogues scène:', error);
      emits('export-error', { error, type: 'scene-dialogues' });
    }
  };

  // 3. Export des dialogues de toute la séquence
  const exportSequenceDialoguesPDF = async (currentSequence, currentEpisode) => {
    if (!currentSequence) {
      emits('export-error', { error: new Error('Aucune séquence sélectionnée'), type: 'sequence-dialogues' });
      return;
    }
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // En-tête
      pdf.setFillColor(...colorPrimary);
      pdf.rect(0, 0, 210, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text(`PROJET: ${currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
      pdf.setFontSize(12);
      pdf.text(`Épisode ${currentEpisode?.ordre}: ${currentEpisode?.titre}`, 20, 25);
      
      pdf.text(`Séquence ${currentSequence.ordre}`, 160, 15);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
      pdf.text(`Scènes: ${currentSequence.scenes?.length || 0}`, 160, 29);
      
      pdf.setDrawColor(...colorSecondary);
      pdf.setLineWidth(0.5);
      pdf.line(20, 45, 190, 45);
      
      let yPosition = 60;
      
      // Titre
      pdf.setTextColor(...colorPrimary);
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
          pdf.setTextColor(...colorPrimary);
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
            pdf.setTextColor(...colorAccent);
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
      emits('export-complete', { type: 'sequence-dialogues', sequenceId: currentSequence.idSequence });
      
    } catch (error) {
      console.error('Erreur export PDF dialogues de séquence:', error);
      emits('export-error', { error, type: 'sequence-dialogues' });
    }
  };

  // 4. Export complet de la séquence
  const exportSequenceCompletePDF = async (currentSequence, currentEpisode) => {
    if (!currentSequence) {
      emits('export-error', { error: new Error('Aucune séquence sélectionnée'), type: 'sequence-complete' });
      return;
    }
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Page de garde
      pdf.setFillColor(...colorPrimary);
      pdf.rect(0, 0, 210, 297, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text(`SÉQUENCE ${currentSequence.ordre}`, 105, 120, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text(currentSequence.titre.toUpperCase(), 105, 140, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text(`Statut: ${currentSequence.statutNom}`, 105, 160, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Épisode ${currentEpisode?.ordre}: ${currentEpisode?.titre}`, 105, 180, { align: 'center' });
      pdf.text(`Projet: ${currentEpisode?.projetTitre || 'Série TV'}`, 105, 190, { align: 'center' });
      
      pdf.text(`Exporté le ${new Date().toLocaleDateString()}`, 105, 210, { align: 'center' });
      
      pdf.addPage();
      
      // En-tête pages suivantes
      const addHeader = (pageNum) => {
        pdf.setFillColor(...colorPrimary);
        pdf.rect(0, 0, 210, 30, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(`SÉQUENCE ${currentSequence.ordre} - ${currentSequence.titre}`, 20, 15);
        pdf.text(`Page ${pageNum}`, 190, 15, { align: 'right' });
        
        pdf.setDrawColor(...colorSecondary);
        pdf.setLineWidth(0.5);
        pdf.line(20, 35, 190, 35);
      };
      
      let yPosition = 45;
      let pageNum = 2;
      
      addHeader(pageNum);
      
      // Synopsis séquence
      pdf.setTextColor(...colorPrimary);
      pdf.setFontSize(16);
      pdf.text('SYNOPSIS DE LA SÉQUENCE', 20, yPosition);
      
      yPosition += 12;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const synopsisLines = pdf.splitTextToSize(currentSequence.synopsis || 'Aucun synopsis', 170);
      pdf.text(synopsisLines, 20, yPosition);
      yPosition += (synopsisLines.length * 4) + 25;
      
      // Scènes
      pdf.setFontSize(16);
      pdf.setTextColor(...colorPrimary);
      pdf.text('DÉTAIL DES SCÈNES', 20, yPosition);
      yPosition += 20;
      
      currentSequence.scenes.forEach((scene, sceneIndex) => {
        if (yPosition > 250) {
          pdf.addPage();
          pageNum++;
          addHeader(pageNum);
          yPosition = 45;
        }
        
        // En-tête scène
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, yPosition - 5, 170, 8, 'F');
        
        pdf.setFontSize(14);
        pdf.setTextColor(...colorPrimary);
        pdf.text(`SCÈNE ${scene.ordre}: ${scene.titre}`, 22, yPosition);
        yPosition += 15;
        
        // Informations scène
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Statut: ${scene.statutNom || 'Non défini'}`, 22, yPosition);
        yPosition += 8;
        
        // Synopsis scène
        pdf.text('Synopsis:', 22, yPosition);
        const sceneSynopsisLines = pdf.splitTextToSize(scene.synopsis || 'Aucun synopsis', 160);
        pdf.text(sceneSynopsisLines, 25, yPosition + 4);
        yPosition += (sceneSynopsisLines.length * 3.5) + 10;
        
        // Lieux
        if (scene.sceneLieus?.length) {
          pdf.text('Lieux:', 22, yPosition);
          scene.sceneLieus.forEach((sceneLieu, lieuIndex) => {
            const lieuText = `• ${sceneLieu.lieuNom}${sceneLieu.plateauNom ? ` (Plateau: ${sceneLieu.plateauNom})` : ''}`;
            pdf.text(lieuText, 25, yPosition + 4 + (lieuIndex * 4));
          });
          yPosition += (scene.sceneLieus.length * 4) + 8;
        }
        
        // Dialogues (premiers seulement)
        if (scene.dialogues?.length) {
          pdf.text('Dialogues:', 22, yPosition);
          yPosition += 6;
          
          // Afficher seulement les 3 premiers dialogues pour l'aperçu
          scene.dialogues.slice(0, 3).forEach((dialogue, dialogueIndex) => {
            pdf.setFontSize(9);
            pdf.setTextColor(...colorAccent);
            pdf.text(`${dialogue.personnageNom || 'NARRATEUR'}:`, 25, yPosition);
            yPosition += 4;
            
            pdf.setFontSize(8);
            pdf.setTextColor(0, 0, 0);
            const previewText = dialogue.texte.length > 100 ? dialogue.texte.substring(0, 100) + '...' : dialogue.texte;
            const previewLines = pdf.splitTextToSize(previewText, 155);
            pdf.text(previewLines, 30, yPosition);
            yPosition += (previewLines.length * 3) + 6;
          });
          
          if (scene.dialogues.length > 3) {
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`... et ${scene.dialogues.length - 3} dialogue(s) supplémentaire(s)`, 25, yPosition);
            yPosition += 8;
          }
        }
        
        yPosition += 15;
        
        // Ligne de séparation entre scènes
        if (sceneIndex < currentSequence.scenes.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.line(20, yPosition - 5, 190, yPosition - 5);
          yPosition += 10;
        }
      });
      
      // Pied de page final
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.text(`Document complet - ${totalPages - 1} pages`, 105, 290, { align: 'center' });
      }
      
      pdf.save(`sequence-${currentSequence.ordre}-complete.pdf`);
      emits('export-complete', { type: 'sequence-complete', sequenceId: currentSequence.idSequence });
      
    } catch (error) {
      console.error('Erreur export PDF complet de la séquence:', error);
      emits('export-error', { error, type: 'sequence-complete' });
    }
  };

  // 5. Export épisode avec séquence
  const exportEpisodeWithSequencePDF = async (currentEpisode, currentSequence) => {
    if (!currentEpisode || !currentSequence) {
      emits('export-error', { error: new Error('Épisode ou séquence manquant'), type: 'episode-sequence' });
      return;
    }
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Page de garde
      pdf.setFillColor(...colorPrimary);
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
        pdf.setFillColor(...colorPrimary);
        pdf.rect(0, 0, 210, 30, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(`ÉPISODE ${currentEpisode.ordre} - ${currentEpisode.titre}`, 20, 15);
        pdf.text(`Page ${pageNum}`, 190, 15, { align: 'right' });
        
        pdf.setDrawColor(...colorSecondary);
        pdf.setLineWidth(0.5);
        pdf.line(20, 35, 190, 35);
      };
      
      addHeader(pageNum);
      yPosition = 45;
      
      // Synopsis épisode
      pdf.setTextColor(...colorPrimary);
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
      pdf.setTextColor(...colorPrimary);
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
      pdf.setTextColor(...colorPrimary);
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
        pdf.setTextColor(...colorPrimary);
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
      emits('export-complete', { type: 'episode-sequence', episodeId: currentEpisode.idEpisode });
      
    } catch (error) {
      console.error('Erreur export PDF épisode + séquence:', error);
      emits('export-error', { error, type: 'episode-sequence' });
    }
  };

  // 6. Export d'une scène complète
  const exportScenePDF = async (scene, currentEpisode) => {
    if (!scene) {
      emits('export-error', { error: new Error('Aucune scène sélectionnée'), type: 'scene' });
      return;
    }
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let yPosition = 20;
      
      // ========== EN-TÊTE ==========
      pdf.setFillColor(...colorPrimary);
      pdf.rect(0, 0, 210, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text(`PROJET: ${currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
      pdf.setFontSize(12);
      pdf.text(`Épisode ${currentEpisode?.ordre}: ${currentEpisode?.titre}`, 20, 25);
      
      pdf.text(`Scène ${scene.ordre}`, 160, 15);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
      pdf.text(`Statut: ${scene.statutNom || 'Non défini'}`, 160, 29);
      
      pdf.setDrawColor(...colorSecondary);
      pdf.setLineWidth(0.5);
      pdf.line(20, 45, 190, 45);
      
      yPosition = 60;
      
      // ========== TITRE DE LA SCÈNE ==========
      pdf.setTextColor(...colorPrimary);
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
        pdf.setTextColor(...colorPrimary);
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
          pdf.setTextColor(...colorAccent);
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
      emits('export-complete', { type: 'scene', sceneId: scene.idScene });
      
    } catch (error) {
      console.error('Erreur export PDF scène:', error);
      emits('export-error', { error, type: 'scene' });
    }
  };

  // 7. Export des raccords du projet
  const exportRaccordsProjetPDF = async (projetId, projetTitle) => {
    if (!projetId) {
      emits('export-error', { error: new Error('Aucun projet sélectionné'), type: 'projet-raccords' });
      return;
    }

    try {
      console.log('Début export PDF pour projet:', projetId);
      
      const response = await axios.get(`/api/raccords/export/projet/${projetId}`);
      const raccords = response.data;

      console.log('Raccords reçus:', raccords);

      if (!raccords || raccords.length === 0) {
        alert("Aucun raccord trouvé pour ce projet");
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');

      // Page de garde
      pdf.setFillColor(...colorPrimary);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text("FICHE RACCORDS", 105, 100, { align: 'center' });
      pdf.setFontSize(18);
      pdf.text((projetTitle || 'PROJET').toUpperCase(), 105, 115, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 105, 180, { align: 'center' });

      pdf.addPage();
      let y = 30;

      // En-tête
      pdf.setFillColor(...colorPrimary);
      pdf.rect(0, 0, 210, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text("TOUS LES RACCORDS DU PROJET", 105, 15, { align: 'center' });

      // Parcourir tous les raccords
      for (const [index, r] of raccords.entries()) {
        if (y > 250) {
          pdf.addPage();
          y = 30;
        }

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. ${r.typeRaccordNom || 'Type inconnu'} – ${r.sceneSourceTitre || '?'} → ${r.sceneCibleTitre || '?'}`, 15, y);
        y += 8;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        
        // Informations détaillées
        if (r.projetTitre) pdf.text(`Projet: ${r.projetTitre}`, 20, y), y += 6;
        if (r.episodeTitre) pdf.text(`Épisode: ${r.episodeTitre}`, 20, y), y += 6;
        if (r.sequenceTitre) pdf.text(`Séquence: ${r.sequenceTitre}`, 20, y), y += 6;
        if (r.comedienNom) pdf.text(`Comédien: ${r.comedienNom}`, 20, y), y += 6;
        if (r.personnageNom) pdf.text(`Personnage: ${r.personnageNom}`, 20, y), y += 6;
        
        if (r.description) {
          const lines = pdf.splitTextToSize(`Description: ${r.description}`, 170);
          pdf.text(lines, 20, y);
          y += lines.length * 5 + 4;
        }

        pdf.text(`Statut: ${r.statutRaccordNom || '?'} | Critique: ${r.estCritique ? 'Oui' : 'Non'}`, 20, y);
        y += 6;

        if (r.dateTournageSource || r.dateTournageCible) {
          pdf.text(`Tournage: ${formatDate(r.dateTournageSource) || '?'} → ${formatDate(r.dateTournageCible) || '?'}`, 20, y);
          y += 6;
        }

        // Images
        if (r.images && r.images.length > 0) {
          console.log(`Raccord ${index} a ${r.images.length} images:`, r.images);
          
          pdf.text('Images associées:', 20, y);
          y += 8;
          
          let x = 20;
          let imagesAdded = 0;
          
          for (const img of r.images) {
            if (imagesAdded >= 2) break;
            
            if (!img.nomFichier || img.nomFichier.includes('undefined')) {
              console.warn('Nom de fichier invalide ignoré:', img.nomFichier);
              continue;
            }
            
            try {
              console.log('Tentative de chargement image:', img.nomFichier);
              const base64 = await getBase64FromUrl(img.nomFichier);
              
              if (base64) {
                pdf.addImage(base64, 'JPEG', x, y, 35, 35);
                x += 40;
                imagesAdded++;
                
                if (x > 150) {
                  x = 20;
                  y += 40;
                }
                
                console.log('Image chargée avec succès:', img.nomFichier);
              } else {
                console.warn('Échec chargement image:', img.nomFichier);
              }
            } catch (imgError) {
              console.warn('Erreur lors du chargement image:', img.nomFichier, imgError);
            }
          }
          
          if (imagesAdded > 0) {
            y += 40;
            console.log(`${imagesAdded} images ajoutées pour le raccord ${index}`);
          } else {
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150);
            pdf.text('Aucune image disponible', 20, y);
            y += 15;
            console.log('Aucune image disponible pour le raccord', index);
          }
        } else {
          console.log('Aucune image pour le raccord', index);
        }

        y += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(15, y - 5, 195, y - 5);
        y += 5;
      }

      // Pied de page
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Projet: ${projetTitle} – Page ${i - 1}/${totalPages - 1}`, 105, 290, { align: 'center' });
      }

      pdf.save(`raccords-projet-${projetId}.pdf`);
      console.log('Export PDF projet terminé avec succès');
      emits('export-complete', { type: 'projet-raccords', projetId });
      
    } catch (err) {
      console.error('Erreur export raccords projet:', err);
      emits('export-error', { error: err, type: 'projet-raccords' });
    }
  };

  // 8. Export des raccords d'une scène
  const exportRaccordsByScene = async (sceneId, scene) => {
    if (!sceneId || !scene) {
      emits('export-error', { error: new Error('Scène invalide'), type: 'scene-raccords' });
      return;
    }
    
    try {
      console.log('🚨 Début export PDF pour scène:', sceneId);
      
      // Récupérer les raccords
      const response = await axios.get(`/api/raccords/export/scene/${sceneId}`);
      const raccords = response.data;

      console.log('📊 Réponse brute de l\'API:', raccords);
      console.log(`Nombre de raccords: ${raccords.length}`);
      
      if (!raccords || raccords.length === 0) {
        alert('Aucun raccord trouvé pour cette scène');
        return;
      }

      // Calculer les statistiques
      const totalRaccords = raccords.length;
      const totalImages = raccords.reduce((sum, r) => sum + (r.images?.length || 0), 0);
      const raccordsCritiques = raccords.filter(r => r.estCritique).length;
      
      console.log(`📈 Statistiques: ${totalRaccords} raccords, ${totalImages} images, ${raccordsCritiques} critiques`);

      const sceneTitre = scene.titre || `Scène ${sceneId}`;
      const sceneOrdre = scene.ordre || '';

      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Couleurs professionnelles
      const colorWine = [59, 1, 11];         // #3B010B - Deep Wine
      const colorBurgundy = [117, 22, 45];   // #75162D - Burgundy
      const colorSand = [242, 217, 160];     // #F2D9A0 - Sand Gold
      const colorLightBg = [250, 247, 242];  // #FAF7F2 - Fond clair
      
      // ========== PAGE DE GARDE ==========
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 210, 297, 'F');
      
      // Bordure décorative supérieure
      pdf.setFillColor(...colorSand);
      pdf.rect(0, 0, 210, 5, 'F');
      
      // Titre principal
      pdf.setFontSize(26);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colorWine);
      pdf.text("RAPPORT DES RACCORDS", 105, 70, { align: 'center' });
      
      // Ligne décorative
      pdf.setDrawColor(...colorBurgundy);
      pdf.setLineWidth(1);
      pdf.line(60, 80, 150, 80);
      
      // Titre de la scène
      pdf.setFontSize(32);
      pdf.setTextColor(...colorBurgundy);
      pdf.text(`SCÈNE ${sceneOrdre}`, 105, 100, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setTextColor(...colorWine);
      const sceneTitleLines = pdf.splitTextToSize(sceneTitre, 160);
      let titleY = 115;
      sceneTitleLines.forEach(line => {
        pdf.text(line, 105, titleY, { align: 'center' });
        titleY += 10;
      });
      
      // Statistiques
      const statsY = titleY + 35;
      pdf.setFillColor(...colorLightBg);
      pdf.roundedRect(50, statsY, 110, 40, 8, 8, 'F');
      pdf.setDrawColor(...colorSand);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(50, statsY, 110, 40, 8, 8);
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colorWine);
      pdf.text("RÉSUMÉ", 105, statsY + 10, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${totalRaccords} raccords`, 60, statsY + 22);
      pdf.text(`${totalImages} images`, 105, statsY + 22, { align: 'center' });
      pdf.text(`${raccordsCritiques} critiques`, 150, statsY + 22, { align: 'right' });
      
      // Date
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 270, { align: 'center' });

      // ========== PAGES SUIVANTES ==========
      let currentPage = 2;
      let yPosition = 30;
      
      const addPageHeader = () => {
        pdf.setFillColor(...colorLightBg);
        pdf.rect(0, 0, 210, 25, 'F');
        
        pdf.setDrawColor(...colorSand);
        pdf.setLineWidth(0.3);
        pdf.line(0, 25, 210, 25);
        
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colorWine);
        pdf.text(`SCÈNE ${sceneOrdre} : ${sceneTitre}`, 20, 15);
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...colorBurgundy);
        pdf.text(`Page ${currentPage - 1}`, 190, 15, { align: 'right' });
        
        yPosition = 35;
      };

      pdf.addPage();
      addPageHeader();

      // ========== PARCOURIR LES RACCORDS ==========
      for (const [index, raccord] of raccords.entries()) {
        const raccordIndex = index + 1;
        
        // Vérifier l'espace avant d'écrire
        const sectionHeightWithoutImages = 40 + (raccord.description ? 20 : 0);
        
        if (yPosition + sectionHeightWithoutImages > 270) {
          pdf.addPage();
          currentPage++;
          addPageHeader();
        }
        
        // En-tête du raccord
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(15, yPosition - 5, 180, 10, 4, 4, 'F');
        
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colorWine);
        pdf.text(`Raccord ${raccordIndex} : ${raccord.typeRaccordNom || 'Type non spécifié'}`, 20, yPosition);
        
        // Indicateur critique
        if (raccord.estCritique) {
          pdf.setFillColor(...colorBurgundy);
          pdf.circle(190, yPosition - 2, 3, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(6);
          pdf.text('C', 189.5, yPosition);
          pdf.setTextColor(...colorWine);
        }
        
        yPosition += 8;
        
        // Informations
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(60, 60, 60);
        
        // Scènes
        pdf.text(`Scènes : ${raccord.sceneSourceTitre || 'Source'} → ${raccord.sceneCibleTitre || 'Cible'}`, 20, yPosition);
        yPosition += 6;
        
        // Personnage/Comédien
        if (raccord.personnageNom || raccord.comedienNom) {
          const actorText = raccord.personnageNom ? 
            `${raccord.personnageNom}${raccord.comedienNom ? ` (${raccord.comedienNom})` : ''}` : 
            raccord.comedienNom || '';
          pdf.text(`Interprète : ${actorText}`, 20, yPosition);
          yPosition += 6;
        }
        
        // Description
        if (raccord.description) {
          const descLines = pdf.splitTextToSize(`Description : ${raccord.description}`, 165);
          descLines.forEach(line => {
            pdf.text(line, 20, yPosition);
            yPosition += 5;
          });
          yPosition += 2;
        }
        
        // Dates et statut
        if (raccord.dateTournageSource || raccord.dateTournageCible) {
          const dateSource = raccord.dateTournageSource ? formatDate(raccord.dateTournageSource) : 'À planifier';
          const dateCible = raccord.dateTournageCible ? formatDate(raccord.dateTournageCible) : 'À planifier';
          pdf.text(`Dates tournage : ${dateSource} → ${dateCible}`, 20, yPosition);
          yPosition += 6;
        }
        
        pdf.text(`Statut : ${raccord.statutRaccordNom || 'Non défini'}`, 20, yPosition);
        yPosition += 8;
        
        // Images
        if (raccord.images && raccord.images.length > 0) {
          console.log(`Raccord ${raccordIndex} - ${raccord.images.length} image(s)`);
          
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...colorWine);
          pdf.text("Images associées :", 20, yPosition);
          yPosition += 8;
          
          let imageX = 25;
          let imageY = yPosition;
          let imagesInCurrentRow = 0;
          
          // Parcourir toutes les images
          for (const [imgIndex, image] of raccord.images.entries()) {
            if (!image.nomFichier || image.nomFichier.includes('undefined')) {
              console.warn(`Image ${imgIndex} ignorée - nom invalide`);
              continue;
            }
            
            try {
              console.log(`Chargement image ${imgIndex + 1}:`, image.nomFichier);
              
              const imageUrl = `http://localhost:8080/api/images/raccords/${image.nomFichier}`;
              const imageResponse = await axios.get(imageUrl, {
                responseType: 'blob',
                timeout: 15000
              });
              
              const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(imageResponse.data);
              });
              
              if (base64) {
                // Obtenir les dimensions réelles
                const img = new Image();
                await new Promise((resolve, reject) => {
                  img.onload = () => resolve();
                  img.onerror = reject;
                  img.src = base64;
                });
                
                const originalWidth = img.naturalWidth;
                const originalHeight = img.naturalHeight;
                const aspectRatio = originalWidth / originalHeight;
                
                // Définir les dimensions d'affichage
                let displayWidth, displayHeight;
                const MAX_WIDTH = 80;
                const MAX_HEIGHT = 80;
                const MIN_SIZE = 30;
                
                if (aspectRatio > 1) {
                  displayWidth = Math.min(MAX_WIDTH, originalWidth / 10);
                  displayHeight = displayWidth / aspectRatio;
                  
                  if (displayHeight < MIN_SIZE) {
                    displayHeight = MIN_SIZE;
                    displayWidth = displayHeight * aspectRatio;
                  }
                } else {
                  displayHeight = Math.min(MAX_HEIGHT, originalHeight / 10);
                  displayWidth = displayHeight * aspectRatio;
                  
                  if (displayWidth < MIN_SIZE) {
                    displayWidth = MIN_SIZE;
                    displayHeight = displayWidth / aspectRatio;
                  }
                }
                
                const captionHeight = 10;
                const totalImageHeight = displayHeight + captionHeight + 5;
                
                // Vérifier si l'image rentre sur la page
                if (imageY + totalImageHeight > 270) {
                  pdf.addPage();
                  currentPage++;
                  addPageHeader();
                  imageX = 25;
                  imageY = yPosition;
                  imagesInCurrentRow = 0;
                }
                
                if (imageX + displayWidth > 185 && imagesInCurrentRow > 0) {
                  imageX = 25;
                  imageY += totalImageHeight;
                  imagesInCurrentRow = 0;
                  
                  if (imageY + totalImageHeight > 270) {
                    pdf.addPage();
                    currentPage++;
                    addPageHeader();
                    imageX = 25;
                    imageY = yPosition;
                    imagesInCurrentRow = 0;
                  }
                }
                
                // Cadre pour l'image
                pdf.setFillColor(250, 250, 250);
                pdf.roundedRect(imageX - 2, imageY - 2, displayWidth + 4, displayHeight + 4, 4, 4, 'F');
                
                pdf.setDrawColor(...colorSand);
                pdf.setLineWidth(0.5);
                pdf.roundedRect(imageX - 2, imageY - 2, displayWidth + 4, displayHeight + 4, 4, 4);
                
                // Ajouter l'image
                pdf.addImage(base64, 'JPEG', imageX, imageY, displayWidth, displayHeight);
                
                // Badge référence
                if (image.estImageReference) {
                  pdf.setFillColor(...colorBurgundy);
                  pdf.circle(imageX + 5, imageY + 5, 4, 'F');
                  pdf.setTextColor(255, 255, 255);
                  pdf.setFontSize(6);
                  pdf.text('R', imageX + 4, imageY + 6.5);
                }
                
                // Légende avec taille
                pdf.setFontSize(7);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(80, 80, 80);
                
                let caption = image.descriptionImage || `Image ${imgIndex + 1}`;
                caption += ` (${originalWidth}×${originalHeight})`;
                
                const captionLines = pdf.splitTextToSize(caption, displayWidth - 10);
                
                captionLines.forEach((line, lineIndex) => {
                  pdf.text(line, imageX, imageY + displayHeight + 5 + (lineIndex * 3));
                });
                
                imagesInCurrentRow++;
                imageX += displayWidth + 15;
                
                if (imageX + 50 > 185) {
                  imageX = 25;
                  imageY += totalImageHeight;
                  imagesInCurrentRow = 0;
                }
                
                console.log(`✅ Image ${imgIndex + 1} ajoutée (${displayWidth.toFixed(0)}×${displayHeight.toFixed(0)}mm)`);
              }
            } catch (imageError) {
              console.warn(`Erreur image ${imgIndex + 1}:`, imageError);
              
              // Placeholder pour image manquante
              const placeholderSize = 50;
              const placeholderTotalHeight = placeholderSize + 15;
              
              if (imageY + placeholderTotalHeight > 270) {
                pdf.addPage();
                currentPage++;
                addPageHeader();
                imageX = 25;
                imageY = yPosition;
                imagesInCurrentRow = 0;
              }
              
              pdf.setFillColor(245, 245, 245);
              pdf.roundedRect(imageX, imageY, placeholderSize, placeholderSize, 4, 4, 'F');
              
              pdf.setDrawColor(200, 200, 200);
              pdf.setLineWidth(0.5);
              pdf.line(imageX, imageY, imageX + placeholderSize, imageY + placeholderSize);
              pdf.line(imageX + placeholderSize, imageY, imageX, imageY + placeholderSize);
              
              pdf.setTextColor(150, 150, 150);
              pdf.setFontSize(8);
              pdf.setFont("helvetica", "italic");
              pdf.text('Non disponible', imageX + placeholderSize/2 - 15, imageY + placeholderSize/2);
              
              imagesInCurrentRow++;
              imageX += placeholderSize + 15;
              
              if (imageX + 50 > 185) {
                imageX = 25;
                imageY += placeholderTotalHeight;
                imagesInCurrentRow = 0;
              }
            }
          }
          
          if (imagesInCurrentRow > 0) {
            imageY += 80;
          }
          yPosition = imageY;
          
          console.log(`${raccord.images.filter(img => img.nomFichier && !img.nomFichier.includes('undefined')).length} image(s) ajoutée(s)`);
        } else {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "italic");
          pdf.setTextColor(150, 150, 150);
          pdf.text('Aucune image disponible', 20, yPosition);
          yPosition += 15;
        }
        
        // Séparation entre raccords
        if (index < raccords.length - 1) {
          if (yPosition < 270) {
            pdf.setDrawColor(230, 230, 230);
            pdf.setLineWidth(0.3);
            pdf.line(20, yPosition, 190, yPosition);
            yPosition += 15;
          }
        }
      }
      
      // ========== PAGE DE SYNTHÈSE ==========
      pdf.addPage();
      currentPage++;
      
      // Header pour la page de synthèse
      pdf.setFillColor(...colorLightBg);
      pdf.rect(0, 0, 210, 25, 'F');
      
      pdf.setDrawColor(...colorSand);
      pdf.setLineWidth(0.3);
      pdf.line(0, 25, 210, 25);
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colorWine);
      pdf.text("SYNTHÈSE DU RAPPORT", 20, 15);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colorBurgundy);
      pdf.text(`Page ${currentPage - 1}`, 190, 15, { align: 'right' });
      
      yPosition = 40;
      
      // Titre
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colorWine);
      pdf.text("RÉCAPITULATIF", 20, yPosition);
      yPosition += 15;
      
      // Cadre de synthèse
      pdf.setFillColor(...colorLightBg);
      pdf.roundedRect(20, yPosition - 5, 170, 100, 8, 8, 'F');
      pdf.setDrawColor(...colorSand);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(20, yPosition - 5, 170, 100, 8, 8);
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colorWine);
      
      const summaryY = yPosition + 5;
      let lineY = summaryY;
      
      const summaryItems = [
        `Scène documentée : ${sceneOrdre} - ${sceneTitre}`,
        `Total des raccords : ${totalRaccords}`,
        `Raccords critiques : ${raccordsCritiques}`,
        `Images documentées : ${totalImages}`,
        `Date de génération : ${new Date().toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`
      ];
      
      // Types de raccords
      const typesUniques = [...new Set(raccords.map(r => r.typeRaccordNom).filter(Boolean))];
      if (typesUniques.length > 0) {
        summaryItems.push(`Types de raccords : ${typesUniques.join(', ')}`);
      }
      
      summaryItems.forEach(item => {
        pdf.text(`• ${item}`, 25, lineY);
        lineY += 7;
      });
      
      // Note
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(120, 120, 120);
      pdf.text("Document technique à usage interne de la production", 105, lineY + 15, { align: 'center' });
      
      // ========== PIED DE PAGE SUR TOUTES LES PAGES ==========
      const totalPages = pdf.internal.getNumberOfPages();
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        pdf.setPage(pageNum);
        
        // Ligne de séparation bas de page
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.line(20, 280, 190, 280);
        
        // Texte pied de page
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        
        if (pageNum === 1) {
          pdf.text(`Production`, 20, 285);
          pdf.text(`Document des raccords`, 105, 285, { align: 'center' });
          pdf.text(`Scène ${sceneOrdre}`, 190, 285, { align: 'right' });
        } else {
          pdf.text(`${sceneTitre.substring(0, 25)}${sceneTitre.length > 25 ? '...' : ''}`, 20, 285);
          pdf.text(`Page ${pageNum - 1}/${totalPages - 1}`, 105, 285, { align: 'center' });
          const now = new Date();
          pdf.text(`${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`, 190, 285, { align: 'right' });
        }
      }
      
      // ========== SAUVEGARDE ==========
      const safeFileName = `raccords-scene-${sceneOrdre}-${sceneTitre}`
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 30);
      
      pdf.save(`raccords-${safeFileName}.pdf`);
      
      console.log(`Export PDF terminé avec succès !`);
      console.log(`Fichier : raccords-${safeFileName}.pdf`);
      console.log(`${totalRaccords} raccord(s), ${totalImages} image(s)`);
      
      emits('export-complete', { type: 'scene-raccords', sceneId });
      
    } catch (err) {
      console.error('Erreur lors de l\'export PDF:', err);
      emits('export-error', { error: err, type: 'scene-raccords' });
    }
  };

  // 9. Export des raccords par comédien
  const exportRaccordsByComedien = async (comedienId, comediens) => {
    if (!comedienId) {
      emits('export-error', { error: new Error('Aucun comédien sélectionné'), type: 'comedien-raccords' });
      return;
    }

    try {
      console.log('Début export PDF pour comédien:', comedienId);
      
      const response = await axios.get(`/api/raccords/export/comedien/${comedienId}`);
      const raccords = response.data;

      console.log('Raccords reçus pour comédien:', raccords);

      if (!raccords || raccords.length === 0) {
        alert('Aucun raccord trouvé pour ce comédien');
        return;
      }

      const comedienNom = raccords[0]?.comedienNom || comediens.find(c => c.id === comedienId)?.nom || 'Comédien inconnu';

      const pdf = new jsPDF('p', 'mm', 'a4');

      // Page de garde
      pdf.setFillColor(...colorPrimary);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text(`RACCORDS POUR`, 105, 90, { align: 'center' });
      pdf.text(`${comedienNom.toUpperCase()}`, 105, 105, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text('Accessoires • Vêtements • Coiffure', 105, 120, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 105, 180, { align: 'center' });

      pdf.addPage();
      let y = 30;

      // En-tête
      pdf.setFillColor(...colorPrimary);
      pdf.rect(0, 0, 210, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text(`RACCORDS - ${comedienNom.toUpperCase()}`, 105, 15, { align: 'center' });

      for (const [index, r] of raccords.entries()) {
        if (y > 250) {
          pdf.addPage();
          y = 30;
        }

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. ${r.typeRaccordNom || 'Type inconnu'} – ${r.sceneSourceTitre || '?'} → ${r.sceneCibleTitre || '?'}`, 15, y);
        y += 8;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        
        if (r.projetTitre) pdf.text(`Projet: ${r.projetTitre}`, 20, y), y += 6;
        if (r.episodeTitre) pdf.text(`Épisode: ${r.episodeTitre}`, 20, y), y += 6;
        if (r.sequenceTitre) pdf.text(`Séquence: ${r.sequenceTitre}`, 20, y), y += 6;
        if (r.personnageNom) pdf.text(`Personnage: ${r.personnageNom}`, 20, y), y += 6;
        
        if (r.description) {
          const lines = pdf.splitTextToSize(`Description: ${r.description}`, 170);
          pdf.text(lines, 20, y);
          y += lines.length * 5 + 4;
        }

        pdf.text(`Statut: ${r.statutRaccordNom || '?'} | Critique: ${r.estCritique ? 'Oui' : 'Non'}`, 20, y);
        y += 6;

        if (r.dateTournageSource || r.dateTournageCible) {
          pdf.text(`Tournage: ${formatDate(r.dateTournageSource) || '?'} → ${formatDate(r.dateTournageCible) || '?'}`, 20, y);
          y += 6;
        }

        // Images
        if (r.images && r.images.length > 0) {
          console.log(`Raccord ${index} a ${r.images.length} images:`, r.images);
          
          pdf.text('Images associées:', 20, y);
          y += 8;
          
          let x = 20;
          let imagesAdded = 0;
          
          for (const img of r.images) {
            if (imagesAdded >= 2) break;
            
            if (!img.nomFichier || img.nomFichier.includes('undefined')) {
              console.warn('Nom de fichier invalide ignoré:', img.nomFichier);
              continue;
            }
            
            try {
              console.log('Tentative de chargement image:', img.nomFichier);
              const base64 = await getBase64FromUrl(img.nomFichier);
              
              if (base64) {
                pdf.addImage(base64, 'JPEG', x, y, 35, 35);
                x += 40;
                imagesAdded++;
                
                if (x > 150) {
                  x = 20;
                  y += 40;
                }
                
                console.log('Image chargée avec succès:', img.nomFichier);
              } else {
                console.warn('Échec chargement image:', img.nomFichier);
              }
            } catch (imgError) {
              console.warn('Erreur lors du chargement image:', img.nomFichier, imgError);
            }
          }
          
          if (imagesAdded > 0) {
            y += 40;
            console.log(`${imagesAdded} images ajoutées pour le raccord ${index}`);
          } else {
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150);
            pdf.text('Aucune image disponible', 20, y);
            y += 15;
            console.log('Aucune image disponible pour le raccord', index);
          }
        } else {
          console.log('Aucune image pour le raccord', index);
        }

        y += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(15, y - 5, 195, y - 5);
        y += 5;
      }

      // Pied de page
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Raccords pour ${comedienNom} – Page ${i - 1}/${totalPages - 1}`, 105, 290, { align: 'center' });
      }

      pdf.save(`raccords-${comedienNom.replace(/\s+/g, '-')}.pdf`);
      console.log('Export PDF comédien terminé avec succès');
      emits('export-complete', { type: 'comedien-raccords', comedienId });
      
    } catch (err) {
      console.error('Erreur export comédien:', err);
      emits('export-error', { error: err, type: 'comedien-raccords' });
    }
  };

  // Fonction utilitaire pour formater les dates
  const formatDate = (date) => {
    if (!date) return 'Non planifié';
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return {
    exportScenesOnlyPDF,
    exportSceneDialoguesPDF,
    exportSequenceDialoguesPDF,
    exportSequenceCompletePDF,
    exportEpisodeWithSequencePDF,
    exportScenePDF,
    exportRaccordsProjetPDF,
    exportRaccordsByScene,
    exportRaccordsByComedien,
    formatDate,
    getBase64FromUrl
  };
}

