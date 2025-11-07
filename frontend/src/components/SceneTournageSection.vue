<template>
  <div class="tournage-section">
    <div class="section-header">
      <h4>
        <i class="fas fa-video" style="color: #007bff;"></i>
        Planning de tournage
        <span v-if="tournage" class="statut-indicator" :class="`statut-${tournage.statutTournage}`">
          {{ getStatutLibelle(tournage.statutTournage) }}
        </span>
      </h4>
      
      <!-- Boutons d'action conditionnels -->
      <div class="tournage-actions">
        <!-- Planifier - seulement si pas de tournage existant -->
        <button v-if="!tournage && userPermissions.canCreateScene" 
                @click="ouvrirModalPlanification" 
                class="btn-planifier">
          <i class="fas fa-calendar-plus"></i> Planifier
        </button>
        
        <!-- Boutons de changement de statut rapide -->
        <template v-if="tournage && userPermissions.canCreateScene">
          <!-- Confirmer - seulement si planifié -->
          <button v-if="tournage.statutTournage === 'planifie'" 
                  @click="modifierStatutRapide('confirme')" 
                  class="btn-confirmer">
            <i class="fas fa-check-circle"></i> Confirmer
          </button>
          
          <!-- Commencer - seulement si confirmé -->
          <button v-if="tournage.statutTournage === 'confirme'" 
                  @click="modifierStatutRapide('en_cours')" 
                  class="btn-commencer">
            <i class="fas fa-play-circle"></i> Commencer
          </button>
          
          <!-- Terminer - seulement si en cours -->
          <button v-if="tournage.statutTournage === 'en_cours'" 
                  @click="modifierStatutRapide('termine')" 
                  class="btn-terminer">
            <i class="fas fa-stop-circle"></i> Terminer
          </button>
          
          <!-- Reporter - pas possible si terminé -->
          <button v-if="tournage.statutTournage !== 'termine'" 
                  @click="modifierStatutRapide('reporte')" 
                  class="btn-reporter">
            <i class="fas fa-calendar-times"></i> Reporter
          </button>
        </template>
        
        <!-- Modifier - toujours disponible sauf si terminé -->
        <button v-if="tournage && tournage.statutTournage !== 'termine' && userPermissions.canCreateScene" 
                @click="ouvrirModalModification" 
                class="btn-modifier">
          <i class="fas fa-edit"></i> Modifier
        </button>
        <button v-if="tournage && userPermissions.canCreateScene" 
              @click="supprimerTournage" 
              class="btn-supprimer">
          <i class="fas fa-trash-alt"></i> Supprimer
        </button>
      </div>
    </div>

    <!-- Affichage des informations du tournage -->
    <div v-if="tournage" class="tournage-info">
      <div class="tournage-details">
        <div class="detail-item">
          <strong><i class="fas fa-calendar-day"></i> Date:</strong>
          <span>{{ formatDate(tournage.dateTournage) }}</span>
        </div>
        
        <div class="detail-item">
          <strong><i class="fas fa-clock"></i> Heure:</strong>
          <span>{{ formatHeure(tournage.heureDebut) }} - {{ formatHeure(tournage.heureFin) }}</span>
        </div>
        
        <div v-if="tournage.lieuNom" class="detail-item">
          <strong><i class="fas fa-map-marker-alt"></i> Lieu:</strong>
          <span>{{ tournage.lieuNom }}</span>
        </div>
        
        <div v-if="tournage.plateauNom" class="detail-item">
          <strong><i class="fas fa-film"></i> Plateau:</strong>
          <span>{{ tournage.plateauNom }}</span>
        </div>
      
        
        <div v-if="tournage.notes" class="detail-item notes">
          <strong><i class="fas fa-sticky-note"></i> Notes:</strong>
          <span>{{ tournage.notes }}</span>
        </div>
      </div>
    </div>

    <!-- Message si aucun tournage -->
    <div v-else class="no-tournage">
      <p class="no-data-message">
        <i class="fas fa-info-circle"></i>
        Aucun tournage planifié pour cette scène
      </p>
    </div>

    <!-- Modal de planification/modification -->
    <div v-if="showModal" class="modal-overlay" @click="fermerModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-video"></i>
            {{ isModification ? 'Modifier le tournage' : 'Planifier le tournage' }} - {{ scene.titre }}
          </h3>
          <button @click="fermerModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="soumettreTournage" class="tournage-form">
          <div class="form-row">
            <div class="form-group">
              <label for="dateTournage">Date de tournage *</label>
              <input 
                type="date" 
                id="dateTournage"
                v-model="formData.dateTournage" 
                required
                class="form-input"
              >
            </div>
            
            <div class="form-group">
              <label for="heureDebut">Heure de début *</label>
              <input 
                type="time" 
                id="heureDebut"
                v-model="formData.heureDebut" 
                required
                class="form-input"
                step="1"
              >
            </div>
            
            <div class="form-group">
              <label for="heureFin">Heure de fin *</label>
              <input 
                type="time" 
                id="heureFin"
                v-model="formData.heureFin" 
                required
                class="form-input"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="lieuId">Lieu</label>
              <select 
                id="lieuId"
                v-model="formData.lieuId" 
                class="form-select"
                @change="chargerPlateaux"
              >
                <option value="">Sélectionner un lieu</option>
                <option 
                  v-for="lieu in lieuxDisponibles" 
                  :key="lieu.id" 
                  :value="lieu.id"
                >
                  {{ lieu.nomLieu }} ({{ lieu.typeLieu }})
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="plateauId">Plateau</label>
              <select 
                id="plateauId"
                v-model="formData.plateauId" 
                class="form-select"
                :disabled="!formData.lieuId"
              >
                <option value="">Sélectionner un plateau</option>
                <option 
                  v-for="plateau in plateauxDisponibles" 
                  :key="plateau.id" 
                  :value="plateau.id"
                >
                  {{ plateau.nom }} ({{ plateau.typePlateau }})
                </option>
              </select>
            </div>
          </div>

          <!-- NOUVEAU : Sélection du statut dans le formulaire -->
          <div class="form-row" v-if="isModification">
            <div class="form-group">
              <label for="statutTournage">Statut du tournage *</label>
              <select 
                id="statutTournage"
                v-model="formData.statutTournage" 
                required
                class="form-select"
              >
                <option value="planifie">Planifié</option>
                <option value="confirme">Confirmé</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="reporte">Reporté</option>
              </select>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label for="notes">Notes</label>
            <textarea 
              id="notes"
              v-model="formData.notes" 
              rows="3" 
              placeholder="Notes additionnelles pour le tournage..."
              class="form-textarea"
            ></textarea>
          </div>
          
          <div v-if="erreur" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ erreur }}
          </div>
          
          <div class="modal-actions">
            <button 
              type="button" 
              @click="fermerModal" 
              class="btn btn-secondary"
            >
              <i class="fas fa-times"></i> Annuler
            </button>
            <button 
              type="submit" 
              :disabled="chargement"
              class="btn btn-primary"
            >
              <i class="fas fa-save"></i>
              {{ chargement ? 'Enregistrement...' : (isModification ? 'Modifier' : 'Planifier') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';

export default {
  name: 'SceneTournageSection',
  props: {
    scene: {
      type: Object,
      required: true
    },
    projetId: {
      type: [String, Number],
      required: true
    },
    userPermissions: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['tournage-updated'],
  
  setup(props, { emit }) {
    const tournage = ref(null);
    const showModal = ref(false);
    const isModification = ref(false);
    const chargement = ref(false);
    const erreur = ref('');
    
    const lieuxDisponibles = ref([]);
    const plateauxDisponibles = ref([]);
    
    const formData = ref({
      sceneId: null,
      dateTournage: '',
      heureDebut: '09:00',
      heureFin: '12:00',
      lieuId: null,
      plateauId: null,
      statutTournage: 'planifie', // NOUVEAU : champ pour le statut
      notes: ''
    });

    // const minDate = computed(() => {
    //   return new Date().toISOString().split('T')[0];
    // });

    // Charger les données initiales
    onMounted(async () => {
      await Promise.all([
        chargerTournage(),
        chargerLieuxDisponibles()
      ]);
    });

    // Watcher pour recharger quand la scène change
    watch(() => props.scene.idScene, async (newSceneId) => {
      if (newSceneId) {
        formData.value.sceneId = newSceneId;
        await chargerTournage();
      }
    });

    // Méthodes

    const chargerTournage = async () => {
      try {
        const response = await axios.get(`/api/scene-tournage/scene/${props.scene.idScene}`);
        tournage.value = response.data;
      } catch (error) {
        // Si 404, c'est normal (pas de tournage)
        if (error.response?.status !== 404) {
          console.error('Erreur chargement tournage:', error);
        }
      }
    };

    const chargerLieuxDisponibles = async () => {
      try {
        const response = await axios.get(`/api/lieux/projets/${props.projetId}`);
        lieuxDisponibles.value = response.data;
      } catch (error) {
        console.error('Erreur chargement lieux:', error);
        lieuxDisponibles.value = [];
      }
    };

    const chargerPlateaux = async () => {
      if (!formData.value.lieuId) {
        plateauxDisponibles.value = [];
        return;
      }
      
      try {
        const response = await axios.get(`/api/plateaux/lieux/${formData.value.lieuId}`);
        plateauxDisponibles.value = response.data;
      } catch (error) {
        console.error('Erreur chargement plateaux:', error);
        plateauxDisponibles.value = [];
      }
    };

    const ouvrirModalPlanification = () => {
      if (!props.userPermissions.canCreateScene) {
        alert('Vous n\'êtes pas autorisé à planifier des tournages.');
        return;
      }
      
      isModification.value = false;
      initialiserFormData();
      showModal.value = true;
    };

    const ouvrirModalModification = () => {
      if (!props.userPermissions.canCreateScene) {
        alert('Vous n\'êtes pas autorisé à modifier des tournages.');
        return;
      }
      
      if (!tournage.value) return;
      
      isModification.value = true;
      initialiserFormData();
      showModal.value = true;
    };

    const supprimerTournage = async () => {
      if (!props.userPermissions.canCreateScene) {
        alert('Vous n\'êtes pas autorisé à supprimer des tournages.');
        return;
      }
      
      if (!tournage.value) return;
      
      if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce planning de tournage ? Cette action est irréversible.')) {
        return;
      }
      
      try {
        chargement.value = true;
        await axios.delete(`/api/scene-tournage/${tournage.value.id}`);
        
        // Réinitialiser les données
        tournage.value = null;
        emit('tournage-updated', null);
        
        alert('Planning de tournage supprimé avec succès!');
        
      } catch (error) {
        console.error('Erreur suppression tournage:', error);
        alert('Erreur: ' + (error.response?.data?.message || error.message));
      } finally {
        chargement.value = false;
      }
    };

    const initialiserFormData = () => {
      if (isModification.value && tournage.value) {
        // Remplir avec les données existantes
        formData.value = {
          sceneId: props.scene.idScene,
          dateTournage: tournage.value.dateTournage,
          heureDebut: tournage.value.heureDebut,
          heureFin: tournage.value.heureFin,
          lieuId: tournage.value.lieuId,
          plateauId: tournage.value.plateauId,
          statutTournage: tournage.value.statutTournage, // NOUVEAU : inclure le statut
          notes: tournage.value.notes || ''
        };
        
        // Charger les plateaux pour le lieu sélectionné
        if (tournage.value.lieuId) {
          chargerPlateaux();
        }
      } else {
        // Nouveau tournage
        formData.value = {
          sceneId: props.scene.idScene,
          dateTournage: '',
          heureDebut: '09:00',
          heureFin: '12:00',
          lieuId: null,
          plateauId: null,
          statutTournage: 'planifie', // NOUVEAU : statut par défaut
          notes: ''
        };
      }
    };

    const fermerModal = () => {
      showModal.value = false;
      erreur.value = '';
      formData.value.lieuId = null;
      formData.value.plateauId = null;
      plateauxDisponibles.value = [];
    };


const verifierConflits = async () => {
  if (!formData.value.dateTournage || !formData.value.heureDebut || !formData.value.heureFin) {
    return true;
  }

  try {
    // Vérifier d'abord les disponibilités (sans les horaires)
    const disponibilitesResponse = await axios.get('/api/conflicts/check-disponibilites', {
      params: {
        sceneId: props.scene.idScene,
        dateTournage: formData.value.dateTournage
      }
    });

    if (disponibilitesResponse.data.hasConflicts) {
      const messages = disponibilitesResponse.data.conflicts.join('\n');
      if (!confirm(`Problèmes de disponibilité détectés:\n\n${messages}\n\nVoulez-vous quand même continuer ?`)) {
        return false;
      }
    }

    // Ensuite vérifier les conflits horaires
    const conflitsResponse = await axios.get('/api/conflicts/check', {
      params: {
        sceneId: props.scene.idScene,
        dateTournage: formData.value.dateTournage,
        heureDebut: formData.value.heureDebut,
        heureFin: formData.value.heureFin
      }
    });

    if (conflitsResponse.data.hasConflicts) {
      const messages = conflitsResponse.data.conflicts.join('\n');
      if (!confirm(`Conflits de planning détectés:\n\n${messages}\n\nVoulez-vous quand même continuer ?`)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur vérification conflits:', error);
    // Continuer malgré l'erreur de vérification
    return true;
  }
};

const verifierConflitsTempsReel = async () => {
  if (formData.value.dateTournage && formData.value.heureDebut && formData.value.heureFin) {
    try {
      // Vérifier les disponibilités en temps réel
      const disponibilitesResponse = await axios.get('/api/conflicts/check-disponibilites', {
        params: {
          sceneId: props.scene.idScene,
          dateTournage: formData.value.dateTournage
        }
      });

      // Vérifier les conflits horaires en temps réel
      const conflitsResponse = await axios.get('/api/conflicts/check', {
        params: {
          sceneId: props.scene.idScene,
          dateTournage: formData.value.dateTournage,
          heureDebut: formData.value.heureDebut,
          heureFin: formData.value.heureFin
        }
      });

      // Combiner les messages d'erreur
      const allConflicts = [
        ...(disponibilitesResponse.data.conflicts || []),
        ...(conflitsResponse.data.conflicts || [])
      ];

      if (allConflicts.length > 0) {
        erreur.value = 'Conflits détectés:\n' + allConflicts.join('\n');
      } else {
        erreur.value = '';
      }
    } catch (error) {
      // Ne pas afficher d'erreur pour la vérification en temps réel
    }
  }
};

watch(() => formData.value.dateTournage, verifierConflitsTempsReel);
watch(() => formData.value.heureDebut, verifierConflitsTempsReel);
watch(() => formData.value.heureFin, verifierConflitsTempsReel);


  const soumettreTournage = async () => {
  if (!validerFormulaire()) return;
  
  // Vérifier les conflits avant soumission
  const peutContinuer = await verifierConflits();
  if (!peutContinuer) return;
  
  chargement.value = true;
  erreur.value = '';
  
  try {
    let response;
    
    if (isModification.value) {
      response = await axios.put(`/api/scene-tournage/${tournage.value.id}`, formData.value);
    } else {
      response = await axios.post('/api/scene-tournage', formData.value);
    }
    
    tournage.value = response.data;
    showModal.value = false;
    emit('tournage-updated', tournage.value);
    
    alert(`Tournage ${isModification.value ? 'modifié' : 'planifié'} avec succès!`);
    
  } catch (error) {
    console.error('Erreur sauvegarde tournage:', error);
    
    // Gérer spécifiquement les erreurs de conflit du backend
    if (error.response?.status === 400 && error.response?.data?.message?.includes('Conflits détectés')) {
      erreur.value = 'Conflits de planning détectés: ' + error.response.data.message;
    } else {
      erreur.value = error.response?.data?.message || 'Erreur lors de la sauvegarde du tournage';
    }
  } finally {
    chargement.value = false;
  }
};

    const validerFormulaire = () => {
      if (!formData.value.dateTournage) {
        erreur.value = 'La date de tournage est obligatoire';
        return false;
      }
      
      if (!formData.value.heureDebut || !formData.value.heureFin) {
        erreur.value = 'Les heures de début et fin sont obligatoires';
        return false;
      }
      
      if (formData.value.heureDebut.length > 5) {
        formData.value.heureDebut = formData.value.heureDebut.substring(0, 5);
      }
      if (formData.value.heureFin.length > 5) {
        formData.value.heureFin = formData.value.heureFin.substring(0, 5);
      }
      
      if (formData.value.heureDebut >= formData.value.heureFin) {
        erreur.value = 'L\'heure de fin doit être après l\'heure de début';
        return false;
      }
      
      return true;
    };

    // NOUVELLE MÉTHODE : Modification rapide du statut
    const modifierStatutRapide = async (nouveauStatut) => {
      if (!props.userPermissions.canCreateScene) {
        alert('Vous n\'êtes pas autorisé à modifier le statut des tournages.');
        return;
      }
      
      if (!tournage.value) return;
      
      if (nouveauStatut === 'termine' && !confirm('Êtes-vous sûr de vouloir marquer ce tournage comme terminé ?')) {
        return;
      }
      
      if (nouveauStatut === 'reporte' && !confirm('Êtes-vous sûr de vouloir reporter ce tournage ?')) {
        return;
      }
      
      try {
        const response = await axios.put(`/api/scene-tournage/${tournage.value.id}/statut/${nouveauStatut}`);
        tournage.value = response.data;
        emit('tournage-updated', tournage.value);
        
        const messages = {
          confirme: 'Tournage confirmé!',
          en_cours: 'Tournage commencé!',
          termine: 'Tournage terminé!',
          reporte: 'Tournage reporté!'
        };
        
        alert(messages[nouveauStatut] || 'Statut modifié!');
        
      } catch (error) {
        console.error('Erreur modification statut:', error);
        alert('Erreur: ' + (error.response?.data?.message || error.message));
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getStatutLibelle = (statut) => {
      const statuts = {
        'planifie': 'Planifié',
        'confirme': 'Confirmé',
        'en_cours': 'En cours',
        'termine': 'Terminé',
        'reporte': 'Reporté'
      };
      return statuts[statut] || statut;
    };

    const formatHeure = (heureString) => {
      if (!heureString) return '';
      
      // Si c'est déjà au format HH:mm, retourner tel quel
      if (heureString.length === 5 && heureString.includes(':')) {
        return heureString;
      }
      
      // Si c'est au format HH:mm:ss, extraire seulement HH:mm
      if (heureString.length >= 8) {
        return heureString.substring(0, 5);
      }
      
      return heureString;
    };

    return {
      tournage,
      showModal,
      isModification,
      chargement,
      erreur,
      lieuxDisponibles,
      plateauxDisponibles,
      formData,
      ouvrirModalPlanification,
      ouvrirModalModification,
      supprimerTournage,
      fermerModal,
      soumettreTournage,
      modifierStatutRapide,
      verifierConflitsTempsReel,
      formatDate,
      formatHeure,
      getStatutLibelle
    };
  }
};
</script>

