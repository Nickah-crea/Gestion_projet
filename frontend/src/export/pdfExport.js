// export/pdfExport.js
import jsPDF from 'jspdf';
import { exporterPDFPersonnage } from './pdfExportPersonnage';
import { exporterPDFScene } from './pdfExportScene';
import { exporterPDFLieu } from './pdfExportLieu';
import { exporterPDFPlateau } from './pdfExportPlateau';

// Logo import - attention : il faut charger l'image en base64 ou via URL
// Pour une image locale, il faut la charger en base64
// Je te propose une fonction pour charger le logo dynamiquement

const COLORS = {
  primary: '#5F7E96',
  primaryDark: '#53443D',
  textDark: '#2C241E',
  textMedium: '#6B5A4E',
  textLight: '#9B8A7A',
  border: '#E8E0D5',
};

// Fonction pour charger une image en base64
async function loadImageAsBase64(imagePath) {
  const response = await fetch(imagePath);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Cache pour le logo chargé
let cachedLogo = null;

async function getLogoBase64() {
  if (cachedLogo) return cachedLogo;
  
  try {
    // Pour une image dans public/ (plus simple)
    // Mettre le logo dans le dossier public/ et utiliser '/logo-vide.png'
    const logoPath = '/logo-vide.png';
    cachedLogo = await loadImageAsBase64(logoPath);
    return cachedLogo;
  } catch (error) {
    console.warn('Logo non trouvé, génération sans logo:', error);
    return null;
  }
}

function addHeaderWithLogo(pdf, title, margin, yPosition, logoBase64 = null) {
  let currentY = yPosition;
  
  // Ajouter le logo à gauche si disponible
  if (logoBase64) {
    try {
      // Dimensions du logo (ajuste selon ton image)
      const logoWidth = 20;
      const logoHeight = 20;
      pdf.addImage(logoBase64, 'PNG', margin, currentY - 5, logoWidth, logoHeight);
      // Décale le titre pour éviter le logo
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(COLORS.primaryDark);
      pdf.text(title, margin + logoWidth + 5, currentY);
    } catch (error) {
      console.warn('Erreur lors de l\'ajout du logo:', error);
      pdf.text(title, margin, currentY);
    }
  } else {
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.primaryDark);
    pdf.text(title, margin, currentY);
  }
  
  currentY += 10;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.textLight);
  pdf.text(`Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, margin, currentY);
  currentY += 8;
  
  pdf.setDrawColor(COLORS.primary);
  pdf.setLineWidth(0.8);
  pdf.line(margin, currentY, margin + 50, currentY);
  currentY += 15;
  
  return currentY;
}

function addInfoCard(pdf, label, value, margin, yPosition) {
  let currentY = yPosition;
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.textMedium);
  pdf.text(label.toUpperCase(), margin, currentY);
  currentY += 5;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.textDark);
  
  const lines = pdf.splitTextToSize(value || '—', 80);
  lines.forEach(line => {
    pdf.text(line, margin, currentY);
    currentY += 5;
  });
  
  return currentY;
}

function addFooter(pdf, margin, pageNumber, totalPages) {
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(COLORS.textLight);
  pdf.text(`VDFI - Page ${pageNumber} sur ${totalPages}`, margin, pageHeight - 12);
  
  pdf.setDrawColor(COLORS.border);
  pdf.setLineWidth(0.3);
  pdf.line(margin, pageHeight - 18, margin + 35, pageHeight - 18);
}

// Version synchrone pour une utilisation simple (sans logo)
export function genererPDFSimple(resultat, resultatDetails) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  let yPosition = 20;
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (2 * margin);
  
  yPosition = addHeaderWithLogo(pdf, `Details du ${getTypeLabel(resultat.type)}`, margin, yPosition, null);
  
  // Carte informations principales
  pdf.setFillColor(250, 249, 242);
  pdf.roundedRect(margin, yPosition - 2, contentWidth, 38, 2, 2, 'F');
  
  let infoY = yPosition;
  infoY = addInfoCard(pdf, 'TITRE', resultat.titre, margin + 5, infoY);
  infoY += 8;
  infoY = addInfoCard(pdf, 'TYPE', getTypeLabel(resultat.type), margin + 5, infoY);
  infoY += 8;
  infoY = addInfoCard(pdf, 'DERNIERE MODIFICATION', formatDateTime(resultat.modifieLe), margin + 5, infoY);
  
  yPosition = infoY + 12;
  
  switch (resultat.type) {
    case 'personnage':
      yPosition = exporterPDFPersonnage(pdf, resultat, resultatDetails, margin, yPosition, contentWidth);
      break;
    case 'scene':
      yPosition = exporterPDFScene(pdf, resultat, resultatDetails, margin, yPosition, contentWidth);
      break;
    case 'lieu':
      yPosition = exporterPDFLieu(pdf, resultat, resultatDetails, margin, yPosition, contentWidth);
      break;
    case 'plateau':
      yPosition = exporterPDFPlateau(pdf, resultat, resultatDetails, margin, yPosition, contentWidth);
      break;
  }
  
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    addFooter(pdf, margin, i, pageCount);
  }
  
  return pdf;
}

// Version asynchrone avec logo
export async function genererPDFAvecLogo(resultat, resultatDetails) {
  const logoBase64 = await getLogoBase64();
  const pdf = new jsPDF('p', 'mm', 'a4');
  let yPosition = 20;
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (2 * margin);
  
  yPosition = addHeaderWithLogo(pdf, `Details du ${getTypeLabel(resultat.type)}`, margin, yPosition, logoBase64);
  
  // Carte informations principales
  pdf.setFillColor(250, 249, 242);
  pdf.roundedRect(margin, yPosition - 2, contentWidth, 38, 2, 2, 'F');
  
  let infoY = yPosition;
  infoY = addInfoCard(pdf, 'TITRE', resultat.titre, margin + 5, infoY);
  infoY += 8;
  infoY = addInfoCard(pdf, 'TYPE', getTypeLabel(resultat.type), margin + 5, infoY);
  infoY += 8;
  infoY = addInfoCard(pdf, 'DERNIERE MODIFICATION', formatDateTime(resultat.modifieLe), margin + 5, infoY);
  
  yPosition = infoY + 12;
  
  switch (resultat.type) {
    case 'personnage':
      yPosition = exporterPDFPersonnage(pdf, resultat, resultatDetails, margin, yPosition, contentWidth);
      break;
    case 'scene':
      yPosition = exporterPDFScene(pdf, resultat, resultatDetails, margin, yPosition, contentWidth);
      break;
    case 'lieu':
      yPosition = exporterPDFLieu(pdf, resultat, resultatDetails, margin, yPosition, contentWidth);
      break;
    case 'plateau':
      yPosition = exporterPDFPlateau(pdf, resultat, resultatDetails, margin, yPosition, contentWidth);
      break;
  }
  
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    addFooter(pdf, margin, i, pageCount);
  }
  
  return pdf;
}

// Fonction principale (garder la compatibilité)
export function genererPDF(resultat, resultatDetails) {
  return genererPDFSimple(resultat, resultatDetails);
}

export function genererPDFBlob(resultat, resultatDetails) {
  const pdf = genererPDF(resultat, resultatDetails);
  return pdf.output('blob');
}

function getTypeLabel(type) {
  const labels = {
    scene: 'Scene',
    personnage: 'Personnage',
    lieu: 'Lieu',
    plateau: 'Plateau'
  };
  return labels[type] || type;
}

function formatDateTime(dateTime) {
  if (!dateTime) return '—';
  try {
    return new Date(dateTime).toLocaleString('fr-FR');
  } catch (error) {
    return '—';
  }
}

