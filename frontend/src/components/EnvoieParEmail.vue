<template>
  <div v-if="showModal" class="modal-overlay-email" @click="closeModal">
    <div class="modal-content-email" @click.stop>
      <!-- En-tête de la modale -->
      <div class="modal-header-email">
        <h2>
          <i class="fas fa-paper-plane"></i>
          Envoyer un PDF par email
        </h2>
        <button @click="closeModal" class="close-btn-email">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Contenu de la modale -->
      <div class="modal-body-email">
        <!-- Sélection du type d'export -->
        <div class="form-section-email">
          <label class="form-label-email">Type d'export à envoyer :</label>
          <select v-model="selectedExportType" class="form-select-email">
            <option value="">Sélectionnez un type d'export</option>
            <option value="scenes">Scènes PDF (Séquence actuelle)</option>
            <option value="sequence-dialogues">Dialogues PDF (Séquence actuelle)</option>
            <option value="sequence-complete">Séquence PDF complète</option>
            <option value="episode">Épisode PDF</option>
            <option value="raccords-projet">Raccords Projet PDF</option>
            <option value="raccords-comedien">Raccords Comédien PDF</option>
            <option value="raccords-scene">Raccords Scène PDF</option>
          </select>
        </div>

        <!-- Sélection du comédien pour les raccords -->
        <div v-if="selectedExportType === 'raccords-comedien'" class="form-section-email">
          <label class="form-label-email">Sélectionner un comédien :</label>
          <select v-model="selectedComedienId" class="form-select-email">
            <option value="">Sélectionnez un comédien</option>
            <option v-for="comedien in comediens" :key="comedien.id" :value="comedien.id">
              {{ comedien.nom }}
            </option>
          </select>
        </div>

        <!-- Sélection de la scène pour les raccords -->
        <div v-if="selectedExportType === 'raccords-scene'" class="form-section-email">
          <label class="form-label-email">Sélectionner une scène :</label>
          <select v-model="selectedSceneId" class="form-select-email">
            <option value="">Sélectionnez une scène</option>
            <option 
              v-for="scene in currentSequence?.scenes || []" 
              :key="scene.idScene" 
              :value="scene.idScene"
            >
              Scène {{ scene.ordre }}: {{ scene.titre }}
            </option>
          </select>
        </div>

        <!-- Destinataire -->
        <div class="form-section-email">
          <label class="form-label-email">Destinataire :</label>
          <div class="recipient-options-email">
            <label class="radio-label-email">
              <input 
                type="radio" 
                v-model="recipientType" 
                value="comedien" 
                class="radio-input-email"
              >
              Sélectionner un comédien
            </label>
            <label class="radio-label-email">
              <input 
                type="radio" 
                v-model="recipientType" 
                value="manual" 
                class="radio-input-email"
              >
              Saisir un email manuellement
            </label>
          </div>

          <!-- Sélection du comédien destinataire -->
          <select 
            v-if="recipientType === 'comedien'" 
            v-model="selectedRecipientComedienId" 
            class="form-select-email"
          >
            <option value="">Sélectionnez un comédien</option>
            <option v-for="comedien in comediens" :key="comedien.id" :value="comedien.id">
              {{ comedien.nom }} - {{ comedien.email || 'Email non disponible' }}
            </option>
          </select>

          <!-- Saisie manuelle d'email -->
          <input 
            v-if="recipientType === 'manual'" 
            v-model="manualEmail" 
            type="email" 
            placeholder="Entrez l'adresse email"
            class="form-input-email"
          >
        </div>

        <!-- Sujet de l'email -->
        <div class="form-section-email">
          <label class="form-label-email">Sujet de l'email :</label>
          <input 
            v-model="emailSubject" 
            type="text" 
            class="form-input-email"
            placeholder="Sujet de l'email..."
          >
        </div>

        <!-- Message de l'email -->
        <div class="form-section-email">
          <label class="form-label-email">Message :</label>
          <textarea 
            v-model="emailMessage" 
            rows="4" 
            class="form-textarea-email"
            placeholder="Message accompagnant le PDF..."
          ></textarea>
        </div>

        <!-- Informations de prévisualisation -->
        <div v-if="selectedExportType" class="preview-section-email">
          <h4>Résumé de l'envoi :</h4>
          <div class="preview-info-email">
            <p><strong>Type :</strong> {{ getExportTypeLabel(selectedExportType) }}</p>
            <p v-if="selectedComedienId && selectedExportType === 'raccords-comedien'">
              <strong>Comédien :</strong> {{ getComedienName(selectedComedienId) }}
            </p>
            <p v-if="selectedSceneId && selectedExportType === 'raccords-scene'">
              <strong>Scène :</strong> {{ getSceneName(selectedSceneId) }}
            </p>
            <p><strong>Destinataire :</strong> {{ getRecipientInfo() }}</p>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="error-message-email">
          {{ errorMessage }}
        </div>

        <!-- Message de succès -->
        <div v-if="successMessage" class="success-message-email">
          {{ successMessage }}
        </div>
      </div>

      <!-- Pied de la modale -->
      <div class="modal-footer-email">
        <button @click="closeModal" class="cancel-btn-email">
          Annuler
        </button>
        <button 
          @click="sendEmail" 
          :disabled="!canSendEmail || isLoading"
          class="send-btn-email"
        >
          <i class="fas fa-paper-plane"></i>
          {{ isLoading ? 'Envoi en cours...' : 'Envoyer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineExpose } from 'vue'
import axios from 'axios'
import jsPDF from 'jspdf'

// Props
const props = defineProps({
  showModal: Boolean,
  currentEpisode: Object,
  currentSequence: Object,
  comediens: Array,
  projetInfos: Object
})

// Émits
const emit = defineEmits(['close', 'email-sent'])

// États réactifs
const selectedExportType = ref('')
const selectedComedienId = ref('')
const selectedSceneId = ref('')
const recipientType = ref('comedien')
const selectedRecipientComedienId = ref('')
const manualEmail = ref('')
const emailSubject = ref('')
const emailMessage = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Computed properties
const canSendEmail = computed(() => {
  if (!selectedExportType.value) return false
  
  // Vérifications spécifiques selon le type d'export
  if (selectedExportType.value === 'raccords-comedien' && !selectedComedienId.value) {
    return false
  }
  
  if (selectedExportType.value === 'raccords-scene' && !selectedSceneId.value) {
    return false
  }
  
  // Vérification du destinataire
  if (recipientType.value === 'comedien' && !selectedRecipientComedienId.value) {
    return false
  }
  
  if (recipientType.value === 'manual' && !manualEmail.value) {
    return false
  }
  
  return !!emailSubject.value
})

// Méthodes
const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  selectedExportType.value = ''
  selectedComedienId.value = ''
  selectedSceneId.value = ''
  selectedRecipientComedienId.value = ''
  manualEmail.value = ''
  emailSubject.value = ''
  emailMessage.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = false
}

const getExportTypeLabel = (type) => {
  const labels = {
    'scenes': 'Scènes PDF',
    'sequence-dialogues': 'Dialogues PDF',
    'sequence-complete': 'Séquence PDF complète',
    'episode': 'Épisode PDF',
    'raccords-projet': 'Raccords Projet PDF',
    'raccords-comedien': 'Raccords Comédien PDF',
    'raccords-scene': 'Raccords Scène PDF'
  }
  return labels[type] || type
}

const getComedienName = (comedienId) => {
  const comedien = props.comediens.find(c => c.id === comedienId)
  return comedien ? comedien.nom : 'Inconnu'
}

const getSceneName = (sceneId) => {
  const scene = props.currentSequence?.scenes?.find(s => s.idScene === sceneId)
  return scene ? `Scène ${scene.ordre}: ${scene.titre}` : 'Inconnue'
}

const getRecipientInfo = () => {
  if (recipientType.value === 'comedien' && selectedRecipientComedienId.value) {
    const comedien = props.comediens.find(c => c.id === selectedRecipientComedienId.value)
    return comedien ? `${comedien.nom} (${comedien.email || 'Email non disponible'})` : 'Non sélectionné'
  } else if (recipientType.value === 'manual' && manualEmail.value) {
    return manualEmail.value
  }
  return 'Non spécifié'
}

const generateDefaultSubject = () => {
  let base = 'Export PDF - '
  
  switch (selectedExportType.value) {
    case 'scenes':
      base += `Scènes Séquence ${props.currentSequence?.ordre}`
      break
    case 'sequence-dialogues':
      base += `Dialogues Séquence ${props.currentSequence?.ordre}`
      break
    case 'sequence-complete':
      base += `Séquence ${props.currentSequence?.ordre} - ${props.currentSequence?.titre}`
      break
    case 'episode':
      base += `Épisode ${props.currentEpisode?.ordre} - ${props.currentEpisode?.titre}`
      break
    case 'raccords-projet':
      base += `Raccords Projet ${props.projetInfos?.titre}`
      break
    case 'raccords-comedien':
      base += `Raccords ${getComedienName(selectedComedienId.value)}`
      break
    case 'raccords-scene':
      base += `Raccords ${getSceneName(selectedSceneId.value)}`
      break
    default:
      base += 'Document'
  }
  
  return base
}

const generateDefaultMessage = () => {
  let base = 'Bonjour,\n\nVeuillez trouver ci-joint le document PDF demandé.\n\n'
  
  switch (selectedExportType.value) {
    case 'scenes':
      base += `Ce document contient la liste des scènes de la séquence ${props.currentSequence?.ordre} : "${props.currentSequence?.titre}".`
      break
    case 'sequence-dialogues':
      base += `Ce document contient tous les dialogues de la séquence ${props.currentSequence?.ordre} : "${props.currentSequence?.titre}".`
      break
    case 'sequence-complete':
      base += `Ce document contient les détails complets de la séquence ${props.currentSequence?.ordre} : "${props.currentSequence?.titre}".`
      break
    case 'episode':
      base += `Ce document contient les informations de l'épisode ${props.currentEpisode?.ordre} : "${props.currentEpisode?.titre}".`
      break
    case 'raccords-projet':
      base += `Ce document contient tous les raccords du projet "${props.projetInfos?.titre}".`
      break
    case 'raccords-comedien':
      base += `Ce document contient vos raccords (accessoires, vêtements, coiffure) pour le projet "${props.projetInfos?.titre}".`
      break
    case 'raccords-scene':
      base += `Ce document contient les raccords de la ${getSceneName(selectedSceneId.value)}.`
      break
    default:
      base += 'Document PDF.'
  }
  
  base += '\n\nCordialement,\nL\'équipe de production'
  
  return base
}

// Watchers
watch(selectedExportType, (newType) => {
  if (newType) {
    emailSubject.value = generateDefaultSubject()
    emailMessage.value = generateDefaultMessage()
  }
})

watch(selectedComedienId, (newComedienId) => {
  if (newComedienId && selectedExportType.value === 'raccords-comedien') {
    emailSubject.value = generateDefaultSubject()
  }
})

watch(selectedSceneId, (newSceneId) => {
  if (newSceneId && selectedExportType.value === 'raccords-scene') {
    emailSubject.value = generateDefaultSubject()
  }
})

// Méthode principale d'envoi d'email
const sendEmail = async () => {
  if (!canSendEmail.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    // 1. Récupérer l'email du destinataire
    let recipientEmail = ''
    
    if (recipientType.value === 'comedien') {
      const comedien = props.comediens.find(c => c.id === selectedRecipientComedienId.value)
      if (!comedien || !comedien.email) {
        throw new Error('Aucun email trouvé pour le comédien sélectionné')
      }
      recipientEmail = comedien.email
    } else {
      recipientEmail = manualEmail.value
    }
    
    // 2. Générer le PDF selon le type sélectionné en utilisant les méthodes existantes
    let pdfData = null
    let attachmentName = generateAttachmentName()
    
    console.log('Génération PDF pour:', selectedExportType.value);
    
    // Utiliser les méthodes de génération de PDF existantes
    switch (selectedExportType.value) {
      case 'scenes':
        pdfData = await generateScenesPDF();
        break;
      case 'sequence-dialogues':
        pdfData = await generateSequenceDialoguesPDF();
        break;
      case 'sequence-complete':
        pdfData = await generateSequenceCompletePDF();
        break;
      case 'episode':
        pdfData = await generateEpisodePDF();
        break;
      case 'raccords-projet':
        pdfData = await generateRaccordsProjetPDF();
        break;
      case 'raccords-comedien':
        pdfData = await generateRaccordsComedienPDF(selectedComedienId.value);
        break;
      case 'raccords-scene':
        pdfData = await generateRaccordsScenePDF(selectedSceneId.value);
        break;
      default:
        throw new Error('Type d\'export non supporté');
    }
    
    if (!pdfData) {
      throw new Error('Erreur lors de la génération du PDF');
    }
    
    console.log('PDF généré avec succès, taille:', pdfData.length);
    
    // Convertir les bytes en Base64
    let base64String = '';
    for (let i = 0; i < pdfData.length; i++) {
      base64String += String.fromCharCode(pdfData[i]);
    }
    const pdfBase64 = btoa(base64String);
    
    console.log('PDF en Base64, taille:', pdfBase64.length);
    
    // 3. Préparer les données pour l'envoi
    const emailRequest = {
      toEmail: recipientEmail,
      subject: emailSubject.value,
      message: emailMessage.value,
      attachmentName: attachmentName,
      pdfData: pdfBase64 // Maintenant en Base64 string
    };
    
    console.log('Envoi email à:', recipientEmail);
    
    // 4. Envoyer l'email via l'API
    const response = await axios.post('/api/export/send-pdf-email', emailRequest, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 secondes timeout
    });
    
    if (response.data.success) {
      successMessage.value = 'Email envoyé avec succès !';
      setTimeout(() => {
        closeModal();
        emit('email-sent');
      }, 2000);
    } else {
      throw new Error(response.data.message || 'Erreur lors de l\'envoi de l\'email');
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Erreur lors de l\'envoi de l\'email';
  } finally {
    isLoading.value = false;
  }
};

const generateAttachmentName = () => {
  let baseName = 'export';
  
  switch (selectedExportType.value) {
    case 'scenes':
      baseName = `scenes-sequence-${props.currentSequence?.ordre}`;
      break;
    case 'sequence-dialogues':
      baseName = `dialogues-sequence-${props.currentSequence?.ordre}`;
      break;
    case 'sequence-complete':
      baseName = `sequence-${props.currentSequence?.ordre}-complete`;
      break;
    case 'episode':
      baseName = `episode-${props.currentEpisode?.ordre}`;
      break;
    case 'raccords-projet':
      baseName = `raccords-projet-${props.projetInfos?.id}`;
      break;
    case 'raccords-comedien':
      const comedienName = getComedienName(selectedComedienId.value).replace(/\s+/g, '-');
      baseName = `raccords-${comedienName}`;
      break;
    case 'raccords-scene':
      const sceneName = getSceneName(selectedSceneId.value)
        .replace(/\s+/g, '-')
        .substring(0, 20)
        .replace(/[^a-zA-Z0-9-]/g, '');
      baseName = `raccords-${sceneName}`;
      break;
    default:
      baseName = 'document';
  }
  
  return `${baseName}.pdf`;
};

// Méthodes de génération de PDF - Adaptation des méthodes existantes d'EcranTravail.vue
const generateScenesPDF = async () => {
  return new Promise((resolve) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    let yPosition = 20;
    
    // En-tête avec design de facture
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Logo/Titre à gauche
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${props.currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${props.currentEpisode?.ordre}: ${props.currentEpisode?.titre}`, 20, 25);
    
    // Informations à droite
    pdf.text(`Séquence ${props.currentSequence.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Scènes: ${props.currentSequence.scenes?.length || 0}`, 160, 29);
    
    // Ligne de séparation
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    yPosition = 60;
    
    // Titre principal
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(18);
    pdf.text(`LISTE DES SCÈNES - SÉQUENCE ${props.currentSequence.ordre}`, 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Séquence: ${props.currentSequence.titre}`, 20, yPosition);
    
    yPosition += 20;
    
    // Tableau des scènes
    props.currentSequence.scenes.forEach((scene, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
        
        // En-tête sur les nouvelles pages
        pdf.setFillColor(...primaryColor);
        pdf.rect(0, 0, 210, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(`Suite - Scènes Séquence ${props.currentSequence.ordre}`, 20, 20);
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
      if (index < props.currentSequence.scenes.length - 1) {
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
    
    const pdfOutput = pdf.output('arraybuffer');
    resolve(new Uint8Array(pdfOutput));
  });
};

const generateSequenceDialoguesPDF = async () => {
  return new Promise((resolve) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    // En-tête
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(`PROJET: ${props.currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${props.currentEpisode?.ordre}: ${props.currentEpisode?.titre}`, 20, 25);
    
    pdf.text(`Séquence ${props.currentSequence.ordre}`, 160, 15);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 160, 22);
    pdf.text(`Scènes: ${props.currentSequence.scenes?.length || 0}`, 160, 29);
    
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
    
    let yPosition = 60;
    
    // Titre
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(18);
    pdf.text(`DIALOGUES COMPLETS - SÉQUENCE ${props.currentSequence.ordre}`, 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Séquence: ${props.currentSequence.titre}`, 20, yPosition);
    
    yPosition += 20;
    
    // Parcourir toutes les scènes
    props.currentSequence.scenes.forEach(scene => {
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
    
    const pdfOutput = pdf.output('arraybuffer');
    resolve(new Uint8Array(pdfOutput));
  });
};

const generateSequenceCompletePDF = async () => {
  return new Promise((resolve) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    // Page de garde
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 297, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.text(`SÉQUENCE ${props.currentSequence.ordre}`, 105, 120, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(props.currentSequence.titre.toUpperCase(), 105, 140, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.text(`Statut: ${props.currentSequence.statutNom}`, 105, 160, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Épisode ${props.currentEpisode?.ordre}: ${props.currentEpisode?.titre}`, 105, 180, { align: 'center' });
    pdf.text(`Projet: ${props.currentEpisode?.projetTitre || 'Série TV'}`, 105, 190, { align: 'center' });
    
    pdf.text(`Exporté le ${new Date().toLocaleDateString()}`, 105, 210, { align: 'center' });
    
    pdf.addPage();
    
    // En-tête pages suivantes
    const addHeader = (pageNum) => {
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(`SÉQUENCE ${props.currentSequence.ordre} - ${props.currentSequence.titre}`, 20, 15);
      pdf.text(`Page ${pageNum}`, 190, 15, { align: 'right' });
      
      pdf.setDrawColor(...secondaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, 35, 190, 35);
    };
    
    let yPosition = 45;
    let pageNum = 2;
    
    addHeader(pageNum);
    
    // Synopsis séquence
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(16);
    pdf.text('SYNOPSIS DE LA SÉQUENCE', 20, yPosition);
    
    yPosition += 12;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const synopsisLines = pdf.splitTextToSize(props.currentSequence.synopsis || 'Aucun synopsis', 170);
    pdf.text(synopsisLines, 20, yPosition);
    yPosition += (synopsisLines.length * 4) + 25;
    
    // Scènes
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryColor);
    pdf.text('DÉTAIL DES SCÈNES', 20, yPosition);
    yPosition += 20;
    
    props.currentSequence.scenes.forEach((scene, sceneIndex) => {
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
      pdf.setTextColor(...primaryColor);
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
          pdf.setTextColor(23, 162, 184);
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
      if (sceneIndex < props.currentSequence.scenes.length - 1) {
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
    
    const pdfOutput = pdf.output('arraybuffer');
    resolve(new Uint8Array(pdfOutput));
  });
};

const generateEpisodePDF = async () => {
  return new Promise((resolve) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const primaryColor = [33, 41, 79];
    const secondaryColor = [220, 53, 69];
    
    // Page de garde
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 297, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text(`ÉPISODE ${props.currentEpisode.ordre}`, 105, 100, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(props.currentEpisode.titre.toUpperCase(), 105, 120, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(`Séquence ${props.currentSequence.ordre}`, 105, 140, { align: 'center' });
    pdf.text(props.currentSequence.titre, 105, 155, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Statut: ${props.currentEpisode.statutNom}`, 105, 175, { align: 'center' });
    
    // Équipe
    if (props.currentEpisode.realisateur || props.currentEpisode.scenariste) {
      pdf.text('ÉQUIPE:', 105, 195, { align: 'center' });
      let teamY = 205;
      
      if (props.currentEpisode.realisateur) {
        pdf.text(`Réalisateur: ${props.currentEpisode.realisateur.nom}`, 105, teamY, { align: 'center' });
        teamY += 8;
      }
      
      if (props.currentEpisode.scenariste) {
        pdf.text(`Scénariste: ${props.currentEpisode.scenariste.nom}`, 105, teamY, { align: 'center' });
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
      pdf.text(`ÉPISODE ${props.currentEpisode.ordre} - ${props.currentEpisode.titre}`, 20, 15);
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
    const episodeSynopsisLines = pdf.splitTextToSize(props.currentEpisode.synopsis || 'Aucun synopsis', 170);
    pdf.text(episodeSynopsisLines, 20, yPosition);
    yPosition += (episodeSynopsisLines.length * 4) + 25;
    
    // Informations séquence
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryColor);
    pdf.text('INFORMATIONS DE LA SÉQUENCE', 20, yPosition);
    
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Séquence ${props.currentSequence.ordre}: ${props.currentSequence.titre}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Statut: ${props.currentSequence.statutNom}`, 20, yPosition);
    yPosition += 8;
    
    const sequenceSynopsisLines = pdf.splitTextToSize(`Synopsis: ${props.currentSequence.synopsis || 'Aucun synopsis'}`, 170);
    pdf.text(sequenceSynopsisLines, 20, yPosition);
    yPosition += (sequenceSynopsisLines.length * 4) + 20;
    
    // Résumé des scènes
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryColor);
    pdf.text('RÉSUMÉ DES SCÈNES', 20, yPosition);
    yPosition += 15;
    
    props.currentSequence.scenes.forEach((scene, index) => {
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
      if (index < props.currentSequence.scenes.length - 1) {
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
      pdf.text(`Rapport Épisode ${props.currentEpisode.ordre} - Séquence ${props.currentSequence.ordre}`, 105, 290, { align: 'center' });
    }
    
    const pdfOutput = pdf.output('arraybuffer');
    resolve(new Uint8Array(pdfOutput));
  });
};

// Méthodes pour les raccords (simplifiées pour l'exemple)
const generateRaccordsProjetPDF = async () => {
  // Implémentez la logique de génération du PDF des raccords projet
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    pdf.text(`RACCORDS PROJET - ${props.projetInfos?.titre}`, 20, 20);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    pdf.text(`Projet ID: ${props.projetInfos?.id}`, 20, 40);
    // Ajoutez ici la logique complète des raccords...
    
    const pdfOutput = pdf.output('arraybuffer');
    resolve(new Uint8Array(pdfOutput));
  });
};

const generateRaccordsComedienPDF = async (comedienId) => {
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    const comedienName = getComedienName(comedienId);
    pdf.text(`RACCORDS COMÉDIEN - ${comedienName}`, 20, 20);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    pdf.text(`Projet: ${props.projetInfos?.titre}`, 20, 40);
    // Ajoutez ici la logique complète des raccords comédien...
    
    const pdfOutput = pdf.output('arraybuffer');
    resolve(new Uint8Array(pdfOutput));
  });
};

const generateRaccordsScenePDF = async (sceneId) => {
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    const sceneName = getSceneName(sceneId);
    pdf.text(`RACCORDS SCÈNE - ${sceneName}`, 20, 20);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    pdf.text(`Projet: ${props.projetInfos?.titre}`, 20, 40);
    // Ajoutez ici la logique complète des raccords scène...
    
    const pdfOutput = pdf.output('arraybuffer');
    resolve(new Uint8Array(pdfOutput));
  });
};

// Exposer les méthodes si nécessaire
defineExpose({
  generateScenesPDF,
  generateSequenceDialoguesPDF,
  generateSequenceCompletePDF,
  generateEpisodePDF
});
</script>

<style scoped>
/* Les styles restent identiques à votre version précédente */
.modal-overlay-email {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content-email {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header-email {
  background: linear-gradient(135deg, #21294F, #2c3e50);
  color: white;
  padding: 20px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: between;
  align-items: center;
}

.modal-header-email h2 {
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn-email {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn-email:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body-email {
  padding: 25px;
}

.form-section-email {
  margin-bottom: 20px;
}

.form-label-email {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #21294F;
}

.form-select-email,
.form-input-email,
.form-textarea-email {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-select-email:focus,
.form-input-email:focus,
.form-textarea-email:focus {
  outline: none;
  border-color: #21294F;
}

.form-textarea-email {
  resize: vertical;
  min-height: 80px;
}

.recipient-options-email {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.radio-label-email {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.radio-input-email {
  margin: 0;
}

.preview-section-email {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #21294F;
  margin-top: 20px;
}

.preview-section-email h4 {
  margin: 0 0 10px 0;
  color: #21294F;
}

.preview-info-email p {
  margin: 5px 0;
  font-size: 14px;
}

.error-message-email {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  margin: 15px 0;
  border: 1px solid #f5c6cb;
}

.success-message-email {
  background: #d1edff;
  color: #0c5460;
  padding: 12px;
  border-radius: 6px;
  margin: 15px 0;
  border: 1px solid #bee5eb;
}

.modal-footer-email {
  padding: 20px;
  border-top: 1px solid #e1e5e9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn-email {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.cancel-btn-email:hover {
  background: #5a6268;
}

.send-btn-email {
  background: linear-gradient(135deg, #21294F, #2c3e50);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.send-btn-email:hover:not(:disabled) {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  transform: translateY(-1px);
}

.send-btn-email:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content-email {
    width: 95%;
    margin: 20px;
  }
  
  .recipient-options-email {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-footer-email {
    flex-direction: column;
  }
  
  .cancel-btn-email,
  .send-btn-email {
    width: 100%;
  }
}
</style>