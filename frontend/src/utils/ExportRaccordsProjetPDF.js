import jsPDF from 'jspdf';
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
    const primaryColor = [33, 41, 79];

    // Page de garde
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 297, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text("FICHE RACCORDS", 105, 100, { align: 'center' });
    pdf.setFontSize(18);
    pdf.text(projetTitle.toUpperCase(), 105, 115, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 105, 180, { align: 'center' });

    pdf.addPage();
    let y = 30;

    // En-tête
    pdf.setFillColor(...primaryColor);
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

      // IMAGES
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

    pdf.save(`raccords-projet-${projetInfos.id}.pdf`);
    console.log('Export PDF terminé avec succès');

  } catch (err) {
    console.error('Erreur export raccords:', err);
    throw err;
  }
};