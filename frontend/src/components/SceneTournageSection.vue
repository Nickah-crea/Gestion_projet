<template>
  <div class="tournage-section">
    <!-- En-tête réorganisé -->
    <div class="section-header">
      <!-- Titre à gauche -->
      <h4>
        <i class="fas fa-video" style="color: #007bff;"></i>
        Planning de tournage - {{ scene.titre }}
      </h4>
      
      <!-- Statut à droite -->
      <div v-if="tournage" class="statut-container">
        <span class="statut-indicator" :class="`statut-${tournage.statutTournage}`">
          {{ getStatutLibelle(tournage.statutTournage) }}
        </span>
      </div>
    </div>

    <!-- Boutons d'action en dessous -->
    <div class="action-buttons-row">
      <div class="tournage-actions">
        <!-- Replanifier - seulement si tournage existe -->
        <ReplanificationComponent 
          :sceneId="scene.idScene"
          :showTriggerButton="true"
          :sceneInfo="scene"
          :userPermissions="userPermissions"
          @tournage-updated="chargerTournage"
          @replanification-appliquee="onReplanificationAppliquee"
        />
        
        <!-- Boutons de changement de statut -->
        <template v-if="tournage && userPermissions.canCreateScene">
          <!-- Confirmer - seulement si planifié -->
          <button v-if="tournage.statutTournage === 'planifie'" 
                  @click="modifierStatutRapide('confirme')" 
                  class="btn-confirmer">
            <i class="fas fa-check-circle"></i> Confirmer
          </button>
          
          <!-- Reporter - pas possible si terminé -->
          <button v-if="tournage.statutTournage !== 'termine'" 
                  @click="modifierStatutRapide('reporte')" 
                  class="btn-reporter">
            <i class="fas fa-calendar-times"></i> Reporter
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
        </template>
        
        <!-- Planifier - seulement si pas de tournage existant -->
        <button v-if="!tournage && userPermissions.canCreateScene" 
                @click="ouvrirModalPlanification" 
                class="btn-planifier">
          <i class="fas fa-calendar-plus"></i> Planifier
        </button>
        
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
      <div class="tournage-details simple-grid">
        <div class="detail-item simple">
          <strong><i class="fas fa-calendar-day"></i> Date:</strong>
          <span>{{ formatDate(tournage.dateTournage) }}</span>
        </div>
        
        <div class="detail-item simple">
          <strong><i class="fas fa-clock"></i> Heure:</strong>
          <span>{{ formatHeure(tournage.heureDebut) }} - {{ formatHeure(tournage.heureFin) }}</span>
        </div>
        
        <div v-if="tournage.lieuNom" class="detail-item simple">
          <strong><i class="fas fa-map-marker-alt"></i> Lieu:</strong>
          <span>{{ tournage.lieuNom }}</span>
        </div>
        
        <div v-if="tournage.plateauNom" class="detail-item simple">
          <strong><i class="fas fa-film"></i> Plateau:</strong>
          <span>{{ tournage.plateauNom }}</span>
        </div>
        
        <div v-if="tournage.notes" class="detail-item simple notes">
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

    <!-- bouton pour masquer l'historique -->
    <div v-if="historiqueReplanifications.length > 0" class="historique-toggle">
      <button 
        @click="afficherHistorique = !afficherHistorique" 
        class="btn-historique"
        :class="{ 'active': afficherHistorique }"
      >
        <i class="fas fa-history"></i>
        {{ afficherHistorique ? 'Masquer' : 'Voir' }} l'historique des planifications
        <i class="fas" :class="afficherHistorique ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </button>
    </div>

    <!-- Nouvelle section pour l'historique des replanifications -->
    <div v-if="afficherHistorique && historiqueReplanifications.length > 0" class="historique-section">
      <h5>
        <i class="fas fa-history"></i>
        Historique des planifications
      </h5>
      <div class="historique-list">
        <div 
          v-for="historique in historiqueReplanifications" 
          :key="historique.id"
          class="historique-item"
        >
          <div class="historique-header">
            <strong>Ancienne date: {{ formatDate(historique.ancienneDate) }}</strong>
            <span class="historique-statut">{{ historique.ancienStatut }}</span>
          </div>
          <p class="historique-raison">
            <strong>Raison:</strong> {{ historique.raisonReplanification }}
          </p>
          <p class="historique-date">
            Replanifié le: {{ formatDateTime(historique.dateReplanification) }}
          </p>
        </div>
      </div>
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
                :disabled="hasSceneLieu && !isModification"
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
              <small v-if="hasSceneLieu && !isModification" class="field-info">
                <i class="fas fa-info-circle"></i>
                Lieu pré-défini pour cette scène
              </small>
            </div>
            
            <div class="form-group">
              <label for="plateauId">Plateau</label>
              <select 
                id="plateauId"
                v-model="formData.plateauId" 
                class="form-select"
                :disabled="(!formData.lieuId) || (hasSceneLieu && !isModification)"
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
              <small v-if="hasSceneLieu && !isModification" class="field-info">
                <i class="fas fa-info-circle"></i>
                Plateau pré-défini pour cette scène
              </small>
            </div>
          </div>

          <!-- Sélection du statut dans le formulaire -->
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
import ReplanificationComponent from './ReplanificationComponent.vue'; 

export default {
  name: 'SceneTournageSection',
  components: {
    ReplanificationComponent
  },
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
    const afficherHistorique = ref(false);
    const lieuxDisponibles = ref([]);
    const plateauxDisponibles = ref([]);
    const historiqueReplanifications = ref([]);
    const sceneLieus = ref([]);
    const hasSceneLieu = ref(false);
    const sceneLieuData = ref({
      lieuId: null,
      plateauId: null
    });
        
    const formData = ref({
      sceneId: null,
      dateTournage: '',
      heureDebut: '09:00',
      heureFin: '12:00',
      lieuId: null,
      plateauId: null,
      statutTournage: 'planifie',
      notes: ''
    });

    // Charger les données initiales
    onMounted(async () => {
      await Promise.all([
        chargerTournage(),
        chargerLieuxDisponibles(),
         chargerSceneLieus() 
      ]);
    });

    // Watcher pour recharger quand la scène change
   watch(() => props.scene.idScene, async (newSceneId) => {
      if (newSceneId) {
        formData.value.sceneId = newSceneId;
        await Promise.all([
          chargerTournage(),
          chargerSceneLieus() 
        ]);
      }
    });

       watch(() => formData.value.lieuId, (newLieuId) => {
          if (newLieuId && !hasSceneLieu.value) {
            chargerPlateaux();
          } else if (!newLieuId) {
            plateauxDisponibles.value = [];
          }
        });

    // Méthodes
  const chargerTournage = async () => {
    try {
      const response = await axios.get(`/api/scene-tournage/scene/${props.scene.idScene}`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        tournage.value = { ...response.data[0] };
      } else if (response.data && !Array.isArray(response.data)) {
        tournage.value = { ...response.data };
      } else {
        tournage.value = null;
      }
      
      console.log('✅ Tournage chargé:', tournage.value);
      return tournage.value;
      
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Erreur chargement tournage:', error);
      } else {
        tournage.value = null;
      }
      return null;
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

    const onReplanificationAppliquee = (data) => {
      console.log('🔄 Replanification appliquée, mise à jour du tournage:', data)
      
      if (data.sceneId === props.scene.idScene) {
        chargerTournage().then(() => {
          console.log('✅ Tournage rechargé après replanification')
          emit('tournage-updated', tournage.value)
        }).catch(error => {
          console.error('❌ Erreur lors du rechargement:', error)
        })
      }
    }

    const initialiserFormData = () => {
      if (isModification.value && tournage.value) {
        formData.value = {
           sceneId: props.scene.idScene,
          dateTournage: tournage.value.dateTournage,
          heureDebut: tournage.value.heureDebut,
          heureFin: tournage.value.heureFin,
          lieuId: tournage.value.lieuId,
          plateauId: tournage.value.plateauId,
          statutTournage: tournage.value.statutTournage,
          notes: tournage.value.notes || ''
        };
        
        if (tournage.value.lieuId) {
          chargerPlateaux();
        }
      } else {
        formData.value = {
            sceneId: props.scene.idScene,
            dateTournage: '',
            heureDebut: '09:00',
            heureFin: '12:00',
            lieuId: hasSceneLieu.value ? sceneLieuData.value.lieuId : null,
            plateauId: hasSceneLieu.value ? sceneLieuData.value.plateauId : null,
            statutTournage: 'planifie',
            notes: ''
        };

        if (hasSceneLieu.value && sceneLieuData.value.lieuId) {
          chargerPlateaux();
        }
      }
    };

    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return '';
      
      try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Erreur formatDateTime:', error);
        return dateTimeString;
      }
    };

    const fermerModal = () => {
      showModal.value = false;
      erreur.value = '';
      formData.value.lieuId = null;
      formData.value.plateauId = null;
      plateauxDisponibles.value = [];
    };

    const chargerSceneLieus = async () => {
      try {
        const response = await axios.get(`/api/scene-tournage/scene-lieux/scene/${props.scene.idScene}`);
        sceneLieus.value = response.data;
        
        if (sceneLieus.value.length > 0) {
          hasSceneLieu.value = true;
          const premierLieu = sceneLieus.value[0];
          sceneLieuData.value = {
            lieuId: premierLieu.lieuId,
            plateauId: premierLieu.plateauId
          };
        } else {
          hasSceneLieu.value = false;
          sceneLieuData.value = {
            lieuId: null,
            plateauId: null
          };
        }
      } catch (error) {
        console.error('Erreur chargement lieux scène:', error);
        sceneLieus.value = [];
        hasSceneLieu.value = false;
      }
    };

    const verifierConflits = async () => {
      if (!formData.value.dateTournage || !formData.value.heureDebut || !formData.value.heureFin) {
        return true;
      }

      try {
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
        return true;
      }
    };

    const verifierConflitsTempsReel = async () => {
      if (formData.value.dateTournage && formData.value.heureDebut && formData.value.heureFin) {
        try {
          const disponibilitesResponse = await axios.get('/api/conflicts/check-disponibilites', {
            params: {
              sceneId: props.scene.idScene,
              dateTournage: formData.value.dateTournage
            }
          });

          const conflitsResponse = await axios.get('/api/conflicts/check', {
            params: {
              sceneId: props.scene.idScene,
              dateTournage: formData.value.dateTournage,
              heureDebut: formData.value.heureDebut,
              heureFin: formData.value.heureFin
            }
          });

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
      
      if (heureString.length === 5 && heureString.includes(':')) {
        return heureString;
      }
      
      if (heureString.length >= 8) {
        return heureString.substring(0, 5);
      }
      
      return heureString;
    };

    const chargerHistoriqueReplanifications = async () => {
      try {
        const response = await axios.get(`/api/historique-planning/scene/${props.scene.idScene}`);
        historiqueReplanifications.value = response.data;
      } catch (error) {
        console.error('Erreur chargement historique:', error);
        historiqueReplanifications.value = [];
      }
    };

    onMounted(() => {
      chargerHistoriqueReplanifications();
    });

    watch(() => tournage.value, () => {
      chargerHistoriqueReplanifications();
    });

    return {
      tournage,
      showModal,
      isModification,
      chargement,
      erreur,
      lieuxDisponibles,
      plateauxDisponibles,
      formData,
      afficherHistorique, 
      sceneLieus, 
      hasSceneLieu,
      ouvrirModalPlanification,
      ouvrirModalModification,
      supprimerTournage,
      fermerModal,
      soumettreTournage,
      modifierStatutRapide,
      verifierConflitsTempsReel,
      formatDate,
      formatHeure,
      formatDateTime,
      getStatutLibelle,
      historiqueReplanifications,
      chargerHistoriqueReplanifications,
      onReplanificationAppliquee,
      chargerSceneLieus
    };
  }
};
</script>


