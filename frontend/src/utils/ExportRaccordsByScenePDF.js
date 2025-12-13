import jsPDF from 'jspdf';
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

    if (!raccords || raccords.length === 0) {
      alert('Aucun raccord trouvé pour cette scène.');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Couleurs professionnelles
    const colorPrimary = [59, 1, 11];
    const colorSecondary = [117, 22, 45];
    const colorAccent = [242, 217, 160];
    
    // Page de garde
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 210, 297, 'F');
    
    pdf.setFillColor(...colorAccent);
    pdf.rect(0, 0, 210, 5, 'F');
    
    pdf.setFontSize(26);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colorPrimary);
    pdf.text("RAPPORT DES RACCORDS", 105, 70, { align: 'center' });
    
    pdf.setDrawColor(...colorSecondary);
    pdf.setLineWidth(1);
    pdf.line(60, 80, 150, 80);
    
    pdf.setFontSize(32);
    pdf.setTextColor(...colorSecondary);
    pdf.text(`SCÈNE ${sceneOrdre}`, 105, 100, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.setTextColor(...colorPrimary);
    const sceneTitleLines = pdf.splitTextToSize(sceneTitre, 160);
    let titleY = 115;
    sceneTitleLines.forEach(line => {
      pdf.text(line, 105, titleY, { align: 'center' });
      titleY += 10;
    });
    
    if (store.currentSequence) {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Séquence ${store.currentSequence.ordre} : ${store.currentSequence.titre}`, 105, titleY + 5, { align: 'center' });
    }
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 275, { align: 'center' });

    // Pages suivantes
    let currentPage = 2;
    let yPosition = 30;
    
    const addPageHeader = () => {
      pdf.setFillColor(250, 247, 242);
      pdf.rect(0, 0, 210, 25, 'F');
      
      pdf.setDrawColor(...colorAccent);
      pdf.setLineWidth(0.3);
      pdf.line(0, 25, 210, 25);
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colorPrimary);
      pdf.text(`SCÈNE ${sceneOrdre} : ${sceneTitre}`, 20, 15);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colorSecondary);
      pdf.text(`Page ${currentPage - 1}`, 190, 15, { align: 'right' });
      
      yPosition = 35;
    };

    pdf.addPage();
    addPageHeader();

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

    // Parcourir les raccords
    for (const [index, raccord] of raccords.entries()) {
      const raccordIndex = index + 1;
      
      if (yPosition > 250) {
        pdf.addPage();
        currentPage++;
        addPageHeader();
      }
      
      // En-tête du raccord
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(15, yPosition - 5, 180, 12, 4, 4, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colorPrimary);
      
      let raccordTitle = `Raccord ${raccordIndex} : ${raccord.typeRaccordNom || 'Type non spécifié'}`;
      pdf.text(raccordTitle, 20, yPosition);
      
      if (raccord.estCritique) {
        pdf.setFillColor(...colorSecondary);
        pdf.circle(190, yPosition - 2, 3, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(6);
        pdf.text('C', 189.5, yPosition);
        pdf.setTextColor(...colorPrimary);
      }
      
      yPosition += 10;
      
      // Informations du raccord
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      
      const otherScene = raccord.sceneSourceId === sceneId ? raccord.sceneCibleTitre : raccord.sceneSourceTitre;
      pdf.text(`Scènes : ${sceneTitre} → ${otherScene}`, 20, yPosition);
      yPosition += 6;
      
      if (raccord.personnageNom || raccord.comedienNom) {
        const actorText = raccord.personnageNom ? 
          `${raccord.personnageNom}${raccord.comedienNom ? ` (${raccord.comedienNom})` : ''}` : 
          raccord.comedienNom || '';
        pdf.text(`Interprète : ${actorText}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (raccord.description) {
        const descLines = pdf.splitTextToSize(`Description : ${raccord.description}`, 165);
        descLines.forEach(line => {
          pdf.text(line, 20, yPosition);
          yPosition += 5;
        });
        yPosition += 2;
      }
      
      if (raccord.dateTournageSource || raccord.dateTournageCible) {
        const dateSource = raccord.dateTournageSource ? formatDate(raccord.dateTournageSource) : 'À planifier';
        const dateCible = raccord.dateTournageCible ? formatDate(raccord.dateTournageCible) : 'À planifier';
        pdf.text(`Dates tournage : ${dateSource} → ${dateCible}`, 20, yPosition);
        yPosition += 6;
      }
      
      pdf.text(`Statut : ${raccord.statutRaccordNom || 'Non défini'}`, 20, yPosition);
      yPosition += 10;
      
      // Images
      if (raccord.images && raccord.images.length > 0) {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...colorPrimary);
        pdf.text("Images directes :", 20, yPosition);
        yPosition += 8;
        
        let imageX = 25;
        let imageY = yPosition;
        let imagesInCurrentRow = 0;
        
        for (const [imgIndex, image] of raccord.images.entries()) {
          try {
            const base64 = await addImageToPDF(image);
            
            if (base64) {
              if (imageX + 50 > 185 && imagesInCurrentRow > 0) {
                imageX = 25;
                imageY += 65;
                imagesInCurrentRow = 0;
              }
              
              if (imageY + 65 > 270) {
                pdf.addPage();
                currentPage++;
                addPageHeader();
                imageX = 25;
                imageY = yPosition;
                imagesInCurrentRow = 0;
              }
              
              pdf.addImage(base64, 'JPEG', imageX, imageY, 50, 50);
              
              if (image.estImageReference) {
                pdf.setFillColor(...colorSecondary);
                pdf.circle(imageX + 5, imageY + 5, 4, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(6);
                pdf.text('R', imageX + 4, imageY + 6.5);
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
      if (index < raccords.length - 1) {
        if (yPosition < 270) {
          pdf.setDrawColor(230, 230, 230);
          pdf.setLineWidth(0.3);
          pdf.line(20, yPosition, 190, yPosition);
          yPosition += 15;
        }
      }
    }
    
    // Pied de page sur toutes les pages
    const totalPages = pdf.internal.getNumberOfPages();
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      pdf.setPage(pageNum);
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.line(20, 280, 190, 280);
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      
      if (pageNum === 1) {
        pdf.text(`Document des raccords avec images`, 105, 285, { align: 'center' });
      } else {
        const pageTitle = sceneTitre.substring(0, 25) + (sceneTitre.length > 25 ? '...' : '');
        pdf.text(pageTitle, 20, 285);
        pdf.text(`Page ${pageNum - 1}/${totalPages - 1}`, 105, 285, { align: 'center' });
        const now = new Date();
        pdf.text(`${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`, 190, 285, { align: 'right' });
      }
    }
    
    const safeFileName = `raccords-scene-${sceneOrdre}-${sceneTitre}`
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    pdf.save(`raccords-${safeFileName}.pdf`);
    
    console.log(`Export PDF terminé avec succès !`);
    
  } catch (err) {
    console.error('Erreur lors de l\'export PDF:', err);
    throw err;
  }
};

