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
            <option value="scene-dialogues">Dialogues d'une Scène PDF</option>
            <option value="scene-complete">Scène Complète PDF</option>
          </select>
        </div>

        <!-- Indicateur de chargement -->
        <div v-if="loadingComediens" class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Chargement des comédiens...
        </div>

        <!-- Sélection du comédien pour les raccords -->
        <div v-if="selectedExportType === 'raccords-comedien'" class="form-section-email">
          <label class="form-label-email">Sélectionner un comédien :</label>
          <select v-model="selectedComedienId" class="form-select-email" :disabled="loadingComediens">
            <option value="">Sélectionnez un comédien</option>
            <option v-for="comedien in comediensList" :key="comedien.id" :value="comedien.id">
              {{ comedien.nom }} {{ comedien.email ? `(${comedien.email})` : '' }}
            </option>
          </select>
          <p v-if="comediensList.length === 0 && !loadingComediens" class="empty-message">
            Aucun comédien trouvé pour ce projet
          </p>
        </div>

        <!-- Sélection de la scène pour les raccords -->
        <div v-if="selectedExportType === 'raccords-scene' || selectedExportType === 'scene-dialogues' || selectedExportType === 'scene-complete'" class="form-section-email">
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
            :disabled="loadingComediens"
          >
            <option value="">Sélectionnez un comédien</option>
            <option v-for="comedien in comediensList" :key="comedien.id" :value="comedien.id">
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
            <p v-if="selectedSceneId && (selectedExportType === 'raccords-scene' || selectedExportType === 'scene-dialogues' || selectedExportType === 'scene-complete')">
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

const comediensList = ref([])
const loadingComediens = ref(false)

// Computed properties
const canSendEmail = computed(() => {
  if (!selectedExportType.value) return false
  
  // Vérifications spécifiques selon le type d'export
  if (selectedExportType.value === 'raccords-comedien' && !selectedComedienId.value) {
    return false
  }
  
  if ((selectedExportType.value === 'raccords-scene' || 
       selectedExportType.value === 'scene-dialogues' || 
       selectedExportType.value === 'scene-complete') && 
      !selectedSceneId.value) {
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
    'raccords-scene': 'Raccords Scène PDF',
    'scene-dialogues': 'Dialogues d\'une Scène PDF',
    'scene-complete': 'Scène Complète PDF'
  }
  return labels[type] || type
}

const loadComediens = async () => {
  loadingComediens.value = true
  try {
    // Si un projet est sélectionné, charger les comédiens de ce projet
    if (props.projetInfos?.id) {
      const response = await axios.get(`/api/comediens/projet/${props.projetInfos.id}`)
      comediensList.value = response.data
      console.log('Comédiens chargés:', comediensList.value.length)
    } 
    // Sinon, charger tous les comédiens
    else {
      const response = await axios.get('/api/comediens')
      comediensList.value = response.data
      console.log('Tous les comédiens chargés:', comediensList.value.length)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des comédiens:', error)
    errorMessage.value = 'Erreur lors du chargement des comédiens'
    comediensList.value = []
  } finally {
    loadingComediens.value = false
  }
}

const getComedienName = (comedienId) => {
  const comedien = comediensList.value.find(c => c.id === comedienId)
  return comedien ? comedien.nom : 'Inconnu'
}

const getSceneName = (sceneId) => {
  const scene = props.currentSequence?.scenes?.find(s => s.idScene === sceneId)
  return scene ? `Scène ${scene.ordre}: ${scene.titre}` : 'Inconnue'
}

const getRecipientInfo = () => {
  if (recipientType.value === 'comedien' && selectedRecipientComedienId.value) {
    const comedien = comediensList.value.find(c => c.id === selectedRecipientComedienId.value)
    return comedien ? `${comedien.nom} (${comedien.email || 'Email non disponible'})` : 'Non sélectionné'
  } else if (recipientType.value === 'manual' && manualEmail.value) {
    return manualEmail.value
  }
  return 'Non spécifié'
}

// Watcher pour charger les comédiens quand la modale s'ouvre
watch(() => props.showModal, (newValue) => {
  if (newValue) {
    loadComediens()
    resetForm()
  }
})

// Watcher pour charger les comédiens quand le projet change
watch(() => props.projetInfos?.id, () => {
  if (props.showModal) {
    loadComediens()
  }
})

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
    case 'scene-dialogues':
      base += `Dialogues ${getSceneName(selectedSceneId.value)}`
      break
    case 'scene-complete':
      base += `Scène ${getSceneName(selectedSceneId.value)}`
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
    case 'scene-dialogues':
      base += `Ce document contient les dialogues de la ${getSceneName(selectedSceneId.value)}.`
      break
    case 'scene-complete':
      base += `Ce document contient les informations complètes de la ${getSceneName(selectedSceneId.value)}.`
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
  if (newSceneId && (selectedExportType.value === 'raccords-scene' || 
                     selectedExportType.value === 'scene-dialogues' || 
                     selectedExportType.value === 'scene-complete')) {
    emailSubject.value = generateDefaultSubject()
  }
})

// Méthode principale d'envoi d'email
// Méthode principale d'envoi d'email
const sendEmail = async () => {
  if (!canSendEmail.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    // Debug: Afficher les données
    console.log('Debug - comediensList:', comediensList.value)
    console.log('Debug - selectedRecipientComedienId:', selectedRecipientComedienId.value)
    console.log('Debug - recipientType:', recipientType.value)
    
    // 1. Récupérer l'email du destinataire
    let recipientEmail = ''
    
    if (recipientType.value === 'comedien') {
      // CORRECTION : Utiliser comediensList.value
      const comedien = comediensList.value.find(c => c.id === selectedRecipientComedienId.value)
      
      // Debug supplémentaire
      console.log('Debug - comedien trouvé:', comedien)
      console.log('Debug - email du comédien:', comedien?.email)
      
      if (!comedien) {
        throw new Error('Comédien non trouvé')
      }
      
      if (!comedien.email || comedien.email.trim() === '') {
        throw new Error(`Le comédien "${comedien.nom}" n'a pas d'email enregistré`)
      }
      
      recipientEmail = comedien.email.trim()
    } else {
      if (!manualEmail.value || manualEmail.value.trim() === '') {
        throw new Error('Veuillez saisir une adresse email valide')
      }
      recipientEmail = manualEmail.value.trim()
    }
    
    console.log('Debug - recipientEmail final:', recipientEmail)
    
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
        // Vérifier que le comédien pour les raccords a un email
        const raccordComedien = comediensList.value.find(c => c.id === selectedComedienId.value)
        if (raccordComedien && (!raccordComedien.email || raccordComedien.email.trim() === '')) {
          console.warn(`Le comédien "${raccordComedien.nom}" pour les raccords n'a pas d'email`)
        }
        pdfData = await generateRaccordsComedienPDF(selectedComedienId.value);
        break;
      case 'raccords-scene':
        pdfData = await generateRaccordsScenePDF(selectedSceneId.value);
        break;
      case 'scene-dialogues':
        pdfData = await generateSceneDialoguesPDF(selectedSceneId.value);
        break;
      case 'scene-complete':
        pdfData = await generateSceneCompletePDF(selectedSceneId.value);
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
      pdfData: pdfBase64
    };
    
    console.log('Envoi email à:', recipientEmail);
    console.log('Sujet:', emailSubject.value);
    
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
    case 'scene-dialogues':
    case 'scene-complete':
      const scene = props.currentSequence?.scenes?.find(s => s.idScene === selectedSceneId.value);
      const sceneName = scene ? `scene-${scene.ordre}-${scene.titre}`.substring(0, 30).replace(/[^a-zA-Z0-9-]/g, '') : 'scene';
      baseName = `${selectedExportType.value}-${sceneName}`;
      break;
    default:
      baseName = 'document';
  }
  
  return `${baseName}.pdf`;
};

// 1. PDF des scènes de la séquence
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

// 2. PDF des dialogues de la séquence
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

// 3. PDF complet de la séquence
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

// 4. PDF de l'épisode
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

const loadRaccordImage = async (filename) => {
  if (!filename || filename.includes('undefined') || filename === 'undefined') {
    console.warn('Nom de fichier invalide:', filename);
    return null;
  }

  try {
    // Essayer différentes URLs pour charger l'image
    const urls = [
      `http://localhost:8080/api/images/raccords/${filename}`,
      `http://localhost:8080/api/images/raccord/${filename}`,
      `http://localhost:8080/api/static/images/raccords/${filename}`
    ];

    for (const url of urls) {
      try {
        console.log('Tentative de chargement depuis:', url);
        const response = await axios.get(url, {
          responseType: 'blob',
          timeout: 10000
        });
        
        if (response.status === 200) {
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(response.data);
          });
          console.log('Image chargée avec succès:', filename);
          return base64;
        }
      } catch (urlError) {
        console.warn(`Échec avec URL ${url}:`, urlError.message);
      }
    }
    
    console.warn('Échec de tous les essais pour:', filename);
    return null;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'image:', filename, error);
    return null;
  }
};


// 5. PDF des raccords du projet
const generateRaccordsProjetPDF = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`/api/raccords/export/projet/${props.projetInfos?.id}`);
      const raccords = response.data;

      if (!raccords || raccords.length === 0) {
        throw new Error('Aucun raccord trouvé pour ce projet');
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
      pdf.text(props.projetInfos?.titre.toUpperCase(), 105, 115, { align: 'center' });
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
        if (y > 200) { // Réduire pour laisser de la place pour les images
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

        // IMAGES - NOUVEAU : Charger et afficher les images
        if (r.images && r.images.length > 0) {
          console.log(`Raccord ${index} a ${r.images.length} images`);
          
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...primaryColor);
          pdf.text("Images associées:", 20, y);
          y += 8;
          
          let imageX = 25;
          let imagesInRow = 0;
          const maxImagesPerRow = 3;
          
          for (const [imgIndex, image] of r.images.entries()) {
            if (!image.nomFichier || image.nomFichier.includes('undefined')) {
              console.warn(`Image ${imgIndex} ignorée - nom invalide`);
              continue;
            }
            
            // Vérifier si on a besoin d'une nouvelle page
            if (y > 230) {
              pdf.addPage();
              y = 30;
              imageX = 25;
              imagesInRow = 0;
            }
            
            try {
              console.log(`Chargement image ${imgIndex + 1}:`, image.nomFichier);
              const base64 = await loadRaccordImage(image.nomFichier);
              
              if (base64) {
                // Créer un cadre pour l'image
                pdf.setFillColor(250, 250, 250);
                pdf.roundedRect(imageX - 2, y - 2, 40, 40, 4, 4, 'F');
                
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.5);
                pdf.roundedRect(imageX - 2, y - 2, 40, 40, 4, 4);
                
                // Ajouter l'image (redimensionnée pour s'adapter)
                pdf.addImage(base64, 'JPEG', imageX, y, 36, 36);
                
                // Badge de référence si c'est une image de référence
                if (image.estImageReference) {
                  pdf.setFillColor(220, 53, 69);
                  pdf.circle(imageX + 5, y + 5, 4, 'F');
                  pdf.setTextColor(255, 255, 255);
                  pdf.setFontSize(6);
                  pdf.text('R', imageX + 4, y + 6.5);
                }
                
                // Légende
                pdf.setFontSize(7);
                pdf.setTextColor(100, 100, 100);
                const caption = image.descriptionImage || `Image ${imgIndex + 1}`;
                const captionLines = pdf.splitTextToSize(caption, 36);
                
                captionLines.forEach((line, lineIndex) => {
                  pdf.text(line, imageX, y + 40 + (lineIndex * 3));
                });
                
                imagesInRow++;
                imageX += 45;
                
                if (imagesInRow >= maxImagesPerRow) {
                  imageX = 25;
                  y += 55;
                  imagesInRow = 0;
                }
                
                console.log(`✅ Image ${imgIndex + 1} ajoutée`);
              }
            } catch (imageError) {
              console.warn(`Erreur image ${imgIndex + 1}:`, imageError);
              
              // Placeholder pour image manquante
              pdf.setFillColor(245, 245, 245);
              pdf.roundedRect(imageX, y, 36, 36, 4, 4, 'F');
              
              pdf.setDrawColor(200, 200, 200);
              pdf.setLineWidth(0.5);
              pdf.line(imageX, y, imageX + 36, y + 36);
              pdf.line(imageX + 36, y, imageX, y + 36);
              
              pdf.setTextColor(150, 150, 150);
              pdf.setFontSize(8);
              pdf.setFont("helvetica", "italic");
              pdf.text('N/A', imageX + 15, y + 18);
              
              imagesInRow++;
              imageX += 45;
              
              if (imagesInRow >= maxImagesPerRow) {
                imageX = 25;
                y += 55;
                imagesInRow = 0;
              }
            }
          }
          
          if (imagesInRow > 0) {
            y += 55; // Espace après les images
          }
          
          console.log(`${r.images.filter(img => img.nomFichier && !img.nomFichier.includes('undefined')).length} image(s) ajoutée(s) pour ce raccord`);
        } else {
          pdf.setFontSize(9);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Aucune image disponible', 20, y);
          y += 15;
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
        pdf.text(`Projet: ${props.projetInfos?.titre} – Page ${i - 1}/${totalPages - 1}`, 105, 290, { align: 'center' });
      }

      const pdfOutput = pdf.output('arraybuffer');
      resolve(new Uint8Array(pdfOutput));

    } catch (err) {
      console.error('Erreur génération PDF raccords projet:', err);
      reject(err);
    }
  });
};

// 6. PDF des raccords par comédien
const generateRaccordsComedienPDF = async (comedienId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`/api/raccords/export/comedien/${comedienId}`);
      const raccords = response.data;

      if (!raccords || raccords.length === 0) {
        throw new Error('Aucun raccord trouvé pour ce comédien');
      }

      const comedienNom = raccords[0]?.comedienNom || 'Comédien inconnu';
      const pdf = new jsPDF('p', 'mm', 'a4');
      const primaryColor = [33, 41, 79];

      // Page de garde
      pdf.setFillColor(...primaryColor);
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
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text(`RACCORDS - ${comedienNom.toUpperCase()}`, 105, 15, { align: 'center' });

      for (const [index, r] of raccords.entries()) {
        if (y > 200) { // Réduire pour laisser de la place pour les images
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

        // IMAGES - NOUVEAU : Charger et afficher les images
        if (r.images && r.images.length > 0) {
          console.log(`Raccord ${index} a ${r.images.length} images`);
          
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...primaryColor);
          pdf.text("Images associées:", 20, y);
          y += 8;
          
          let imageX = 25;
          let imagesInRow = 0;
          const maxImagesPerRow = 3;
          
          for (const [imgIndex, image] of r.images.entries()) {
            if (!image.nomFichier || image.nomFichier.includes('undefined')) {
              console.warn(`Image ${imgIndex} ignorée - nom invalide`);
              continue;
            }
            
            // Vérifier si on a besoin d'une nouvelle page
            if (y > 230) {
              pdf.addPage();
              y = 30;
              imageX = 25;
              imagesInRow = 0;
            }
            
            try {
              console.log(`Chargement image ${imgIndex + 1}:`, image.nomFichier);
              const base64 = await loadRaccordImage(image.nomFichier);
              
              if (base64) {
                // Créer un cadre pour l'image
                pdf.setFillColor(250, 250, 250);
                pdf.roundedRect(imageX - 2, y - 2, 40, 40, 4, 4, 'F');
                
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.5);
                pdf.roundedRect(imageX - 2, y - 2, 40, 40, 4, 4);
                
                // Ajouter l'image
                pdf.addImage(base64, 'JPEG', imageX, y, 36, 36);
                
                // Badge de référence
                if (image.estImageReference) {
                  pdf.setFillColor(220, 53, 69);
                  pdf.circle(imageX + 5, y + 5, 4, 'F');
                  pdf.setTextColor(255, 255, 255);
                  pdf.setFontSize(6);
                  pdf.text('R', imageX + 4, y + 6.5);
                }
                
                // Légende
                pdf.setFontSize(7);
                pdf.setTextColor(100, 100, 100);
                const caption = image.descriptionImage || `Image ${imgIndex + 1}`;
                const captionLines = pdf.splitTextToSize(caption, 36);
                
                captionLines.forEach((line, lineIndex) => {
                  pdf.text(line, imageX, y + 40 + (lineIndex * 3));
                });
                
                imagesInRow++;
                imageX += 45;
                
                if (imagesInRow >= maxImagesPerRow) {
                  imageX = 25;
                  y += 55;
                  imagesInRow = 0;
                }
              }
            } catch (imageError) {
              console.warn(`Erreur image ${imgIndex + 1}:`, imageError);
              
              // Placeholder pour image manquante
              pdf.setFillColor(245, 245, 245);
              pdf.roundedRect(imageX, y, 36, 36, 4, 4, 'F');
              
              pdf.setDrawColor(200, 200, 200);
              pdf.setLineWidth(0.5);
              pdf.line(imageX, y, imageX + 36, y + 36);
              pdf.line(imageX + 36, y, imageX, y + 36);
              
              pdf.setTextColor(150, 150, 150);
              pdf.setFontSize(8);
              pdf.setFont("helvetica", "italic");
              pdf.text('N/A', imageX + 15, y + 18);
              
              imagesInRow++;
              imageX += 45;
              
              if (imagesInRow >= maxImagesPerRow) {
                imageX = 25;
                y += 55;
                imagesInRow = 0;
              }
            }
          }
          
          if (imagesInRow > 0) {
            y += 55;
          }
        } else {
          pdf.setFontSize(9);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Aucune image disponible', 20, y);
          y += 15;
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

      const pdfOutput = pdf.output('arraybuffer');
      resolve(new Uint8Array(pdfOutput));
      
    } catch (err) {
      console.error('Erreur génération PDF raccords comédien:', err);
      reject(err);
    }
  });
};


// 7. PDF des raccords par scène
const generateRaccordsScenePDF = async (sceneId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(`/api/raccords/scene/${sceneId}`);
      const raccords = response.data;

      if (!raccords || raccords.length === 0) {
        throw new Error('Aucun raccord trouvé pour cette scène');
      }

      const scene = props.currentSequence?.scenes?.find(s => s.idScene === sceneId);
      const sceneTitre = scene?.titre || `Scène ${sceneId}`;
      const sceneOrdre = scene?.ordre || '';
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const primaryColor = [33, 41, 79];

      // Page de garde
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text("RAPPORT DES RACCORDS", 105, 100, { align: 'center' });
      pdf.setFontSize(18);
      pdf.text(`SCÈNE ${sceneOrdre}`, 105, 120, { align: 'center' });
      
      if (sceneTitre) {
        const titleLines = pdf.splitTextToSize(sceneTitre, 160);
        let titleY = 140;
        titleLines.forEach(line => {
          pdf.text(line, 105, titleY, { align: 'center' });
          titleY += 10;
        });
      }
      
      pdf.setFontSize(12);
      pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 105, 180, { align: 'center' });

      pdf.addPage();
      let y = 30;

      // En-tête
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text(`RACCORDS - SCÈNE ${sceneOrdre}`, 105, 15, { align: 'center' });

      for (const [index, r] of raccords.entries()) {
        if (y > 200) { // Réduire pour laisser de la place pour les images
          pdf.addPage();
          y = 30;
        }

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. ${r.typeRaccordNom || 'Type inconnu'}`, 15, y);
        y += 8;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        
        pdf.text(`De: ${r.sceneSourceTitre || '?'} → À: ${r.sceneCibleTitre || '?'}`, 20, y);
        y += 6;
        
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

        // IMAGES - NOUVEAU : Charger et afficher les images
        if (r.images && r.images.length > 0) {
          console.log(`Raccord ${index} a ${r.images.length} images`);
          
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...primaryColor);
          pdf.text("Images associées:", 20, y);
          y += 8;
          
          let imageX = 25;
          let imagesInRow = 0;
          const maxImagesPerRow = 3;
          
          for (const [imgIndex, image] of r.images.entries()) {
            if (!image.nomFichier || image.nomFichier.includes('undefined')) {
              console.warn(`Image ${imgIndex} ignorée - nom invalide`);
              continue;
            }
            
            // Vérifier si on a besoin d'une nouvelle page
            if (y > 230) {
              pdf.addPage();
              y = 30;
              imageX = 25;
              imagesInRow = 0;
            }
            
            try {
              console.log(`Chargement image ${imgIndex + 1}:`, image.nomFichier);
              const base64 = await loadRaccordImage(image.nomFichier);
              
              if (base64) {
                // Créer un cadre pour l'image
                pdf.setFillColor(250, 250, 250);
                pdf.roundedRect(imageX - 2, y - 2, 50, 50, 4, 4, 'F');
                
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.5);
                pdf.roundedRect(imageX - 2, y - 2, 50, 50, 4, 4);
                
                // Ajouter l'image (un peu plus grande pour les raccords de scène)
                pdf.addImage(base64, 'JPEG', imageX, y, 46, 46);
                
                // Badge de référence
                if (image.estImageReference) {
                  pdf.setFillColor(220, 53, 69);
                  pdf.circle(imageX + 5, y + 5, 5, 'F');
                  pdf.setTextColor(255, 255, 255);
                  pdf.setFontSize(6);
                  pdf.text('R', imageX + 4.5, y + 7);
                }
                
                // Légende détaillée
                pdf.setFontSize(7);
                pdf.setTextColor(100, 100, 100);
                let caption = image.descriptionImage || `Image ${imgIndex + 1}`;
                if (image.dateCreation) {
                  caption += ` (${formatDate(image.dateCreation)})`;
                }
                const captionLines = pdf.splitTextToSize(caption, 46);
                
                captionLines.forEach((line, lineIndex) => {
                  pdf.text(line, imageX, y + 50 + (lineIndex * 3));
                });
                
                imagesInRow++;
                imageX += 55;
                
                if (imagesInRow >= maxImagesPerRow) {
                  imageX = 25;
                  y += 65;
                  imagesInRow = 0;
                }
              }
            } catch (imageError) {
              console.warn(`Erreur image ${imgIndex + 1}:`, imageError);
              
              // Placeholder pour image manquante
              pdf.setFillColor(245, 245, 245);
              pdf.roundedRect(imageX, y, 46, 46, 4, 4, 'F');
              
              pdf.setDrawColor(200, 200, 200);
              pdf.setLineWidth(0.5);
              pdf.line(imageX, y, imageX + 46, y + 46);
              pdf.line(imageX + 46, y, imageX, y + 46);
              
              pdf.setTextColor(150, 150, 150);
              pdf.setFontSize(8);
              pdf.setFont("helvetica", "italic");
              pdf.text('N/A', imageX + 19, y + 23);
              
              imagesInRow++;
              imageX += 55;
              
              if (imagesInRow >= maxImagesPerRow) {
                imageX = 25;
                y += 65;
                imagesInRow = 0;
              }
            }
          }
          
          if (imagesInRow > 0) {
            y += 65;
          }
        } else {
          pdf.setFontSize(9);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Aucune image disponible', 20, y);
          y += 15;
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
        pdf.text(`Raccords Scène ${sceneOrdre} – Page ${i - 1}/${totalPages - 1}`, 105, 290, { align: 'center' });
      }

      const pdfOutput = pdf.output('arraybuffer');
      resolve(new Uint8Array(pdfOutput));
      
    } catch (err) {
      console.error('Erreur génération PDF raccords scène:', err);
      reject(err);
    }
  });
};


// 8. PDF des dialogues d'une scène spécifique
const generateSceneDialoguesPDF = async (sceneId) => {
  return new Promise((resolve) => {
    const scene = props.currentSequence?.scenes?.find(s => s.idScene === sceneId);
    if (!scene) {
      resolve(new Uint8Array());
      return;
    }

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
    pdf.text(`Épisode ${props.currentEpisode?.ordre} - Séquence ${props.currentSequence?.ordre}`, 20, 25);
    
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
    
    const pdfOutput = pdf.output('arraybuffer');
    resolve(new Uint8Array(pdfOutput));
  });
};

// 9. PDF complet d'une scène
const generateSceneCompletePDF = async (sceneId) => {
  return new Promise((resolve) => {
    const scene = props.currentSequence?.scenes?.find(s => s.idScene === sceneId);
    if (!scene) {
      resolve(new Uint8Array());
      return;
    }

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
    pdf.text(`PROJET: ${props.currentEpisode?.projetTitre || 'Cinema'}`, 20, 15);
    pdf.setFontSize(12);
    pdf.text(`Épisode ${props.currentEpisode?.ordre}: ${props.currentEpisode?.titre}`, 20, 25);
    
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
    // Note: On pourrait ajouter les commentaires ici si disponibles
    yPosition += 10;
    
    if (yPosition > 230) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryColor);
    pdf.text("INFORMATIONS SUPPLÉMENTAIRES", 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    
    // Informations de tournage si disponibles
    if (scene.tournages && scene.tournages.length > 0) {
      pdf.text("Informations de tournage:", 25, yPosition);
      yPosition += 7;
      
      scene.tournages.forEach((tournage, idx) => {
        const tournageText = `${tournage.dateTournage ? formatDate(tournage.dateTournage) : 'Date non définie'} - ${tournage.statutNom || 'Statut inconnu'}`;
        pdf.text(`• ${tournageText}`, 30, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
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
    
    const pdfOutput = pdf.output('arraybuffer');
    resolve(new Uint8Array(pdfOutput));
  });
};

// Fonction utilitaire pour formater les dates
const formatDate = (dateString) => {
  if (!dateString) return 'Non planifié';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Exposer les méthodes si nécessaire
defineExpose({
  generateScenesPDF,
  generateSequenceDialoguesPDF,
  generateSequenceCompletePDF,
  generateEpisodePDF,
  generateRaccordsProjetPDF,
  generateRaccordsComedienPDF,
  generateRaccordsScenePDF,
  generateSceneDialoguesPDF,
  generateSceneCompletePDF
});
</script>

<style scoped>
.modal-overlay-email {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content-email {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header-email {
  background: #21294F;
  color: white;
  padding: 20px;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
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
}

.modal-body-email {
  padding: 20px;
}

.form-section-email {
  margin-bottom: 20px;
}

.form-label-email {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-select-email, 
.form-input-email,
.form-textarea-email {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-select-email:focus, 
.form-input-email:focus,
.form-textarea-email:focus {
  outline: none;
  border-color: #21294F;
  box-shadow: 0 0 0 2px rgba(33, 41, 79, 0.2);
}

.recipient-options-email {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.radio-label-email {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-input-email {
  margin: 0;
}

.preview-section-email {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-top: 20px;
  border-left: 4px solid #21294F;
}

.preview-section-email h4 {
  margin-top: 0;
  color: #21294F;
}

.preview-info-email p {
  margin: 5px 0;
}

.error-message-email {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin: 15px 0;
  border: 1px solid #f5c6cb;
}

.success-message-email {
  background: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin: 15px 0;
  border: 1px solid #c3e6cb;
}

.modal-footer-email {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn-email {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn-email:hover {
  background: #5a6268;
}

.send-btn-email {
  background: #21294F;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.send-btn-email:hover:not(:disabled) {
  background: #1a2138;
}

.send-btn-email:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 