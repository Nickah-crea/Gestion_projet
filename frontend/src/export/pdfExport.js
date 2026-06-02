import jsPDF from 'jspdf';
import logoVide from '../assets/img/logo-vide.png';
import { exporterPDFPersonnage } from './pdfExportPersonnage';
import { exporterPDFScene } from './pdfExportScene';
import { exporterPDFLieu } from './pdfExportLieu';
import { exporterPDFPlateau } from './pdfExportPlateau';

// === PALETTE DE COULEURS ===
export const COLORS = {
  primary: [138, 155, 120],        // $color-primary: #8A9B78
  secondPrim: [220, 207, 184],     // $color-second-prim: #DCCFB8
  primaryLight: [241, 239, 230],   // $color-primary-light: #F1EFE6
  primaryDark: [83, 68, 61],       // $color-primary-dark: #53443D
  accent: [173, 117, 86],          // $color-accent: #AD7556
  accentLight: [198, 146, 114],    // $color-accent-light: #C69272
  accentDark: [140, 90, 66],       // $color-accent-dark: #8C5A42
  secondary: [196, 122, 107],      // $color-secondary: #C47A6B
  secondaryLight: [217, 154, 138], // $color-secondary-light: #D99A8A
  secondaryDark: [165, 94, 79],    // $color-secondary-dark: #A55E4F
  tertiary: [184, 169, 154],       // $color-tertiary: #B8A99A
  tertiaryLight: [218, 207, 191],  // $color-tertiary-light: #DACFBF
  tertiaryDark: [142, 123, 107],   // $color-tertiary-dark: #8E7B6B
  cool: [155, 183, 201],           // $color-cool: #9BB7C9
  coolLight: [227, 236, 242],      // $color-cool-light: #E3ECF2
  green: [184, 201, 168],          // $color-green: #B8C9A8
  greenLight: [217, 229, 204],     // $color-green-light: #D9E5CC
  greenDark: [138, 155, 120],      // $color-green-dark: #8A9B78
  textPrimary: [44, 36, 30],
  textSecondary: [107, 90, 78],
  textMuted: [150, 140, 130],
};

let cachedLogo = null;

export const getLogoBase64 = async () => {
  if (cachedLogo) return cachedLogo;
  
  try {
    const response = await fetch(logoVide);
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedLogo = reader.result;
        resolve(cachedLogo);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Erreur chargement logo:', error);
    return null;
  }
};

export function addStandardHeader(pdf, pageNum, title, projetTitre = 'VDFI', extraInfo = '') {
  pdf.setDrawColor(...COLORS.tertiaryLight);
  pdf.setLineWidth(0.3);
  pdf.line(20, 15, 190, 15);
  
  pdf.setTextColor(...COLORS.textSecondary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(projetTitre, 185, 22, { align: 'right' });
  pdf.text(extraInfo, 185, 29, { align: 'right' });
  pdf.text(`Page ${pageNum}`, 185, 36, { align: 'right' });
  
  if (title) {
    pdf.setFontSize(7);
    pdf.setTextColor(...COLORS.textMuted);
    pdf.setFont('helvetica', 'italic');
    const truncatedTitle = title.length > 45 ? title.substring(0, 42) + '...' : title;
    pdf.text(truncatedTitle, 20, 32);
  }
}

export function addStandardFooter(pdf, pageNum, totalPages, documentType, itemTitle) {
  pdf.setDrawColor(...COLORS.tertiaryLight);
  pdf.setLineWidth(0.2);
  pdf.line(20, 280, 190, 280);
  
  pdf.setTextColor(...COLORS.textMuted);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Page ${pageNum}`, 105, 288, { align: 'center' });
  
  if (pageNum === 1) {
    pdf.setFontSize(7);
    pdf.text(documentType, 105, 293, { align: 'center' });
  } else {
    pdf.setFontSize(7);
    const truncatedTitle = itemTitle.length > 40 ? itemTitle.substring(0, 37) + '...' : itemTitle;
    pdf.text(truncatedTitle, 20, 293);
  }
  
  if (pageNum === totalPages) {
    pdf.setFontSize(7);
    pdf.setTextColor(...COLORS.tertiary);
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 293, { align: 'center' });
  }
}

export async function createCoverPage(pdf, title, subtitle, metadata, documentType) {
  pdf.setFillColor(...COLORS.primaryLight);
  pdf.rect(0, 0, 210, 297, 'F');
  
  let yStart = 40;
  const logoBase64 = await getLogoBase64();
  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, 'PNG', 80, 25, 50, 20);
      yStart = 70;
    } catch (imgError) {
      console.warn('Erreur insertion logo:', imgError);
    }
  }
  
  pdf.setDrawColor(...COLORS.secondPrim);
  pdf.setLineWidth(0.5);
  pdf.line(60, yStart - 5, 150, yStart - 5);
  
  pdf.setTextColor(...COLORS.primaryDark);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(documentType.toUpperCase(), 105, yStart + 20, { align: 'center' });
  
  if (subtitle) {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.accent);
    pdf.text(subtitle, 105, yStart + 45, { align: 'center' });
  }
  
  pdf.setFontSize(13);
  pdf.setTextColor(...COLORS.primaryDark);
  pdf.setFont('helvetica', 'normal');
  const titleLines = pdf.splitTextToSize(title, 160);
  let titleY = subtitle ? yStart + 65 : yStart + 50;
  titleLines.forEach(line => {
    pdf.text(line, 105, titleY, { align: 'center' });
    titleY += 7;
  });
  
  if (metadata && metadata.length > 0) {
    const infoY = titleY + 20;
    pdf.setFontSize(10);
    pdf.setTextColor(...COLORS.textSecondary);
    pdf.setFont('helvetica', 'normal');
    metadata.forEach((meta, index) => {
      pdf.text(meta, 105, infoY + (index * 10), { align: 'center' });
    });
  }
  
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.textMuted);
  pdf.text(`Document généré le ${new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 105, 270, { align: 'center' });
  
  pdf.text('v1.0 • Export VDFI', 105, 280, { align: 'center' });
  
  return pdf;
}

export async function genererPDF(resultat, resultatDetails) {
  let pdf = new jsPDF('p', 'mm', 'a4');
  
  const typeLabel = getTypeLabel(resultat.type);
  const documentType = `FICHE ${typeLabel.toUpperCase()}`;
  const subtitle = resultat.titre || 'Sans titre';
  
  const metadata = [];
  if (resultat.projetTitre) metadata.push(`Projet: ${resultat.projetTitre}`);
  if (resultat.type === 'personnage' && resultat.comedienNom) metadata.push(`Comédien: ${resultat.comedienNom}`);
  if (resultat.type === 'scene' && resultat.dateTournage) metadata.push(`Date: ${formatDate(resultat.dateTournage)}`);
  
  pdf = await createCoverPage(pdf, subtitle, null, metadata, documentType);
  pdf.addPage();
  
  let yPosition = 50;
  let pageNum = 2;
  const margin = 20;
  const contentWidth = 170;
  
  addStandardHeader(pdf, pageNum, subtitle, resultat.projetTitre || 'VDFI', `${typeLabel} - ${subtitle.substring(0, 30)}`);
  
  pdf.setFillColor(...COLORS.primaryLight);
  pdf.roundedRect(margin, yPosition - 2, 55, 9, 2, 2, 'F');
  pdf.setTextColor(...COLORS.accent);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(typeLabel, margin + 3, yPosition + 4);
  
  pdf.setTextColor(...COLORS.primaryDark);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  const shortTitle = subtitle.length > 45 ? subtitle.substring(0, 42) + '...' : subtitle;
  pdf.text(shortTitle, margin + 60, yPosition + 4);
  
  yPosition += 14;
  
  pdf.setDrawColor(...COLORS.secondPrim);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, 190, yPosition);
  yPosition += 12;
  
  switch (resultat.type) {
    case 'personnage':
      yPosition = await exporterPDFPersonnage(pdf, resultat, resultatDetails, margin, yPosition, contentWidth, pageNum, subtitle);
      break;
    case 'scene':
      yPosition = await exporterPDFScene(pdf, resultat, resultatDetails, margin, yPosition, contentWidth, pageNum, subtitle);
      break;
    case 'lieu':
      yPosition = await exporterPDFLieu(pdf, resultat, resultatDetails, margin, yPosition, contentWidth, pageNum, subtitle);
      break;
    case 'plateau':
      yPosition = await exporterPDFPlateau(pdf, resultat, resultatDetails, margin, yPosition, contentWidth, pageNum, subtitle);
      break;
  }
  
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addStandardFooter(pdf, i, totalPages, documentType, subtitle);
  }
  
  return pdf;
}

export async function genererPDFBlob(resultat, resultatDetails) {
  const pdf = await genererPDF(resultat, resultatDetails);
  return pdf.output('blob');
}

export function genererPDFSimple(resultat, resultatDetails) {
  return genererPDF(resultat, resultatDetails);
}

function getTypeLabel(type) {
  const labels = {
    scene: 'Scène',
    personnage: 'Personnage',
    lieu: 'Lieu',
    plateau: 'Plateau'
  };
  return labels[type] || type;
}

function formatDate(date) {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('fr-FR');
  } catch (error) {
    return '—';
  }
}

