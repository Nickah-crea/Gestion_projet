<!-- StatusCRUD.vue -->
<template>
  <div class="app-wrapper-global-status">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-status">
      <div class="sidebar-header-status">
        <h2 class="sidebar-title-status"><i class="fas fa-sliders-h"></i> Gestion des Statuts</h2>
        <p class="sidebar-subtitle-status">Gérez tous les statuts de votre application</p>
      </div>

      <!-- Navigation rapide -->
      <div class="sidebar-section-status">
        <h3 class="section-title-status"><i class="fas fa-bolt"></i> Navigation Rapide</h3>
        <div class="sidebar-actions-status">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="sidebar-btn-status" 
            :class="{ active: activeTab === tab.id }"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Statistiques globales -->
      <div class="sidebar-section-status">
        <h3 class="section-title-status"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-status">
          <div class="stat-item-status">
            <span class="stat-number-status">{{ totalStatuts }}</span>
            <span class="stat-label-status">Total statuts</span>
          </div>
          <div class="stat-item-status">
            <span class="stat-number-status">{{ totalStatutsActifs }}</span>
            <span class="stat-label-status">Statuts actifs</span>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="sidebar-section-status">
        <h3 class="section-title-status"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-status">
          <div class="filter-item-status">
            <label for="statutFilter">Statut d'activation</label>
            <select 
              id="statutFilter" 
              v-model="filtreActif" 
              @change="applyFilter"
              class="filter-select-status"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actifs seulement</option>
              <option value="false">Inactifs seulement</option>
            </select>
          </div>
          
          <div class="filter-item-status">
            <label for="searchFilter">Recherche globale</label>
            <div class="search-input-container-status">
              <i class="fas fa-search search-icon-status"></i>
              <input
                type="text"
                id="searchFilter"
                v-model="searchTerm"
                @input="applyFilter"
                placeholder="Rechercher..."
                class="search-input-status"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-status">
      <div class="creation-main-content-status">
        
        <!-- En-tête principal -->
        <div class="main-header-status">
          <h1 class="page-title-status"><i class="fas fa-cogs"></i> Gestion des Statuts Système</h1>
          <p class="page-subtitle-status">Créez, modifiez et gérez tous les statuts de votre application de gestion de films</p>
        </div>

        <!-- Système d'onglets -->
        <div class="tabs-container-status">
          <div class="tabs-header-status">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="['tab-btn-status', { active: activeTab === tab.id }]"
            >
              <i :class="tab.icon"></i>
              {{ tab.label }}
              <span class="tab-count-status">{{ getStatutsCount(tab.id) }}</span>
            </button>
          </div>
          
          <div class="tabs-content-status">
            <!-- Indicateur visuel de l'onglet actif -->
            <div class="tab-indicator-status" :style="getTabIndicatorStyle"></div>
            
            <!-- Contenu de chaque onglet -->
            <div v-for="tab in tabs" :key="tab.id" v-show="activeTab === tab.id" class="tab-pane-status">
              <div class="tab-content-wrapper-status">
                <!-- En-tête de l'onglet -->
                <div class="tab-header-status">
                  <div class="tab-title-status">
                    <h3><i :class="tab.icon"></i> {{ tab.label }}</h3>
                    <p class="tab-description-status">{{ getTabDescription(tab.id) }}</p>
                  </div>
                  <button 
                    @click="openCreateModal(tab.id)"
                    class="btn-create-status"
                  >
                    <i class="fas fa-plus"></i> Ajouter un statut
                  </button>
                </div>

                <!-- Liste des statuts -->
                <div class="statuts-list-status">
                  <div v-if="loading" class="loading-state-status">
                    <i class="fas fa-spinner fa-spin"></i> Chargement des statuts...
                  </div>
                  
                  <div v-else-if="getFilteredStatuts(tab.id).length === 0" class="empty-state-status">
                    <i class="fas fa-inbox"></i>
                    <div v-if="searchTerm || filtreActif !== ''">
                      Aucun statut ne correspond à vos critères de recherche.
                    </div>
                    <div v-else>
                      Aucun statut défini pour cette catégorie.
                    </div>
                  </div>

                  <div v-else class="statuts-grid-status">
                    <div 
                      v-for="statut in getFilteredStatuts(tab.id)" 
                      :key="statut.id || statut.idStatutProjet || statut.idStatutEpisode"
                      class="statut-card-status"
                      :class="{ 'inactive': !getStatutActif(statut) }"
                    >
                      <div class="statut-card-header-status">
                        <div class="statut-code-status" :class="getStatutColorClass(statut)">
                          <span class="code-badge-status">{{ statut.code }}</span>
                          <span class="activation-badge-status" :class="getActivationClass(statut)">
                            {{ getStatutActif(statut) ? 'Actif' : 'Inactif' }}
                          </span>
                        </div>
                        <div class="statut-actions-status">
                          <button @click="editStatut(tab.id, statut)" class="btn-action-status edit" title="Modifier">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            @click="toggleActivation(tab.id, statut)" 
                            class="btn-action-status toggle" 
                            :title="getStatutActif(statut) ? 'Désactiver' : 'Activer'"
                          >
                            <i :class="getStatutActif(statut) ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                          </button>
                          <button @click="deleteStatut(tab.id, statut)" class="btn-action-status delete" title="Supprimer">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div class="statut-card-body-status">
                        <h4 class="statut-name-status">{{ getStatutName(statut) }}</h4>
                        <p class="statut-description-status">{{ getStatutDescription(statut) }}</p>
                        
                        <div class="statut-meta-status">
                          <div class="meta-item-status">
                            <i class="fas fa-sort-numeric-down"></i>
                            <span>Ordre: {{ getStatutOrdre(statut) }}</span>
                          </div>
                          <div v-if="getStatutCreatedAt(statut)" class="meta-item-status">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Créé le: {{ formatDate(getStatutCreatedAt(statut)) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création/modification -->
    <div v-if="showModal" class="modal-overlay-status" @click="closeModal">
      <div class="modal-content-status" @click.stop>
        <div class="modal-header-status">
          <h3>
            <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
            {{ isEditing ? 'Modifier le statut' : 'Créer un nouveau statut' }}
          </h3>
          <button @click="closeModal" class="modal-close-btn-status">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-status">
          <form @submit.prevent="submitStatut" class="statut-form-status">
            <div class="form-row-status">
              <div class="form-group-status">
                <label for="code">Code *</label>
                <input
                  type="text"
                  id="code"
                  v-model="formData.code"
                  required
                  placeholder="ex: en_cours, valide, etc."
                  class="form-input-status"
                  :class="{ 'error': errors.code }"
                />
                <div v-if="errors.code" class="error-message-status">{{ errors.code }}</div>
                <div class="input-hint-status">Doit être unique et en minuscules avec underscores</div>
              </div>

              <div class="form-group-status">
                <label for="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  v-model="formData.nom"
                  required
                  placeholder="Nom du statut"
                  class="form-input-status"
                  :class="{ 'error': errors.nom }"
                />
                <div v-if="errors.nom" class="error-message-status">{{ errors.nom }}</div>
              </div>
            </div>

            <div class="form-group-status">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                placeholder="Description du statut"
                class="form-textarea-status"
              ></textarea>
            </div>

            <div class="form-row-status">
              <div class="form-group-status">
                <label for="ordreAffichage">Ordre d'affichage *</label>
                <input
                  type="number"
                  id="ordreAffichage"
                  v-model="formData.ordreAffichage"
                  required
                  min="1"
                  class="form-input-status"
                  :class="{ 'error': errors.ordreAffichage }"
                />
                <div v-if="errors.ordreAffichage" class="error-message-status">{{ errors.ordreAffichage }}</div>
                <div class="input-hint-status">Détermine l'ordre dans les listes déroulantes</div>
              </div>

              <div class="form-group-status">
                <label for="estActif">Statut</label>
                <div class="checkbox-group-status">
                  <input
                    type="checkbox"
                    id="estActif"
                    v-model="formData.estActif"
                    class="checkbox-input-status"
                  />
                  <label for="estActif" class="checkbox-label-status">
                    <span class="checkbox-custom-status"></span>
                    Actif
                  </label>
                </div>
                <div class="input-hint-status">Un statut inactif n'apparaîtra pas dans les sélections</div>
              </div>
            </div>

            <div v-if="formError" class="form-error-status">
              <i class="fas fa-exclamation-triangle"></i> {{ formError }}
            </div>

            <div class="form-actions-status">
              <button
                type="button"
                @click="closeModal"
                class="cancel-btn-status"
              >
                <i class="fas fa-times"></i> Annuler
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="submit-btn-status"
              >
                <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
                {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Enregistrer' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="notifications-container-status">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification-status', `notification-${notification.type}`, { 'leaving': notification.leaving }]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon-status">
          <i :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-content-status">
          <p class="notification-message-status">{{ notification.message }}</p>
        </div>
        <button 
          @click.stop="removeNotification(notification.id)"
          class="notification-close-status"
        >
          <i class="fas fa-times"></i>
        </button>
        <div 
          class="notification-progress-status" 
          :style="{ animationDuration: `${notification.duration}ms` }"
        ></div>
      </div>
    </div>

    <!-- Modal de confirmation -->
    <div v-if="showConfirmModal" class="modal-overlay-status" @click="closeConfirmModal">
      <div class="modal-content-status confirmation-modal-status" @click.stop>
        <div class="modal-header-status">
          <h3>
            <i :class="getConfirmIcon"></i>
            {{ confirmConfig.title }}
          </h3>
          <button @click="closeConfirmModal" class="modal-close-btn-status">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-status">
          <div class="confirmation-content-status">
            <p class="confirmation-message-status">{{ confirmConfig.message }}</p>
            
            <div class="confirmation-actions-status">
              <button
                type="button"
                @click="closeConfirmModal"
                class="cancel-btn-status"
              >
                <i class="fas fa-times"></i> Annuler
              </button>
              <button
                type="button"
                @click="confirmAction"
                :class="['confirm-btn-status', `confirm-${confirmConfig.type}`]"
              >
                <i :class="getConfirmActionIcon"></i>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StatusCRUD',
  data() {
    return {
      activeTab: 'projet',
      tabs: [
        { id: 'projet', label: 'Statuts Projet', icon: 'fas fa-project-diagram' },
        { id: 'episode', label: 'Statuts Épisode', icon: 'fas fa-film' },
        { id: 'scene', label: 'Statuts Scène', icon: 'fas fa-video' },
        { id: 'sequence', label: 'Statuts Séquence', icon: 'fas fa-list-ol' },
        { id: 'planning', label: 'Statuts Planning', icon: 'fas fa-calendar-alt' },
        { id: 'raccord', label: 'Statuts Raccord', icon: 'fas fa-link' }
      ],
      
      // Données des statuts
      statutsProjet: [],
      statutsEpisode: [],
      statutsScene: [],
      statutsSequence: [],
      statutsPlanning: [],
      statutsRaccord: [],
      
      // Filtres
      filtreActif: '',
      searchTerm: '',
      
      // Modal
      showModal: false,
      isEditing: false,
      editingType: null,
      editingId: null,
      isSubmitting: false,
      formError: '',
      notifications: [],
      notificationId: 0,
      showConfirmModal: false,
      confirmConfig: {
        title: '',
        message: '',
        type: 'warning', // warning, danger, info
        onConfirm: null,
        onCancel: null
      },
      
      // Formulaire
      formData: {
        code: '',
        nom: '',
        description: '',
        ordreAffichage: 1,
        estActif: true
      },
      errors: {},
      
      // États
      loading: false
    };
  },
  computed: {
    totalStatuts() {
      return this.statutsProjet.length + 
             this.statutsEpisode.length + 
             this.statutsScene.length + 
             this.statutsSequence.length + 
             this.statutsPlanning.length + 
             this.statutsRaccord.length;
    },
    
    totalStatutsActifs() {
      const countActifs = (statuts) => statuts.filter(s => this.getStatutActif(s)).length;
      return countActifs(this.statutsProjet) + 
             countActifs(this.statutsEpisode) + 
             countActifs(this.statutsScene) + 
             countActifs(this.statutsSequence) + 
             countActifs(this.statutsPlanning) + 
             countActifs(this.statutsRaccord);
    },
    
    getTabIndicatorStyle() {
      const tabCount = this.tabs.length;
      const tabWidth = 100 / tabCount;
      const activeIndex = this.tabs.findIndex(tab => tab.id === this.activeTab);
      const translateX = activeIndex * 100;
      
      return {
        transform: `translateX(${translateX}%)`,
        width: `${tabWidth}%`
      };
    },

    getConfirmIcon() {
        const icons = {
        warning: 'fas fa-exclamation-triangle',
        danger: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle'
      };
      return icons[this.confirmConfig.type] || 'fas fa-exclamation-triangle';
    },
  
    getConfirmActionIcon() {
      const icons = {
        warning: 'fas fa-toggle-off',
        danger: 'fas fa-trash',
        info: 'fas fa-toggle-on',
        success: 'fas fa-check'
      };
      return icons[this.confirmConfig.type] || 'fas fa-check';
    }
  },

  async mounted() {
    await this.loadAllStatuts();
  },

  methods: {
    // Méthodes pour charger les données
    async loadAllStatuts() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadStatuts('projet'),
          this.loadStatuts('episode'),
          this.loadStatuts('scene'),
          this.loadStatuts('sequence'),
          this.loadStatuts('planning'),
          this.loadStatuts('raccord')
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
        
        let errorMessage = 'Erreur lors du chargement des statuts';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        this.showError(errorMessage);
      } finally {
        this.loading = false;
      }
    },
    
    async loadStatuts(type) {
      try {
        const endpoint = this.getEndpoint(type);
        const response = await axios.get(endpoint);
        this[`statuts${this.capitalizeFirst(type)}`] = response.data;
      } catch (error) {
        console.error(`Erreur lors du chargement des statuts ${type}:`, error);
        
        // Ne pas afficher de notification pour chaque type individuellement
        // pour éviter de spammer l'utilisateur
        if (error.response?.status === 404) {
          // Endpoint non trouvé, peut-être le contrôleur n'existe pas
          console.warn(`Endpoint ${type} non trouvé:`, endpoint);
        }
      }
    },

    // Méthodes pour la confirmation personnalisée
    openConfirmModal(config) {
      this.confirmConfig = {
        title: config.title || 'Confirmation',
        message: config.message || 'Êtes-vous sûr ?',
        type: config.type || 'warning',
        onConfirm: config.onConfirm || (() => {}),
        onCancel: config.onCancel || (() => {})
      };
      this.showConfirmModal = true;
    },

    closeConfirmModal() {
      this.showConfirmModal = false;
      this.confirmConfig = {
        title: '',
        message: '',
        type: 'warning',
        onConfirm: null,
        onCancel: null
      };
    },

    confirmAction() {
      if (this.confirmConfig.onConfirm) {
        this.confirmConfig.onConfirm();
      }
      this.closeConfirmModal();
    },

    cancelAction() {
      if (this.confirmConfig.onCancel) {
        this.confirmConfig.onCancel();
      }
      this.closeConfirmModal();
    },
    
    // Méthodes pour les notifications
    addNotification(type, message, duration = 5000) {
      const id = ++this.notificationId;
      const notification = {
        id,
        type,
        message,
        duration
      };
      
      this.notifications.push(notification);
      
      // Supprimer automatiquement après la durée spécifiée
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
      
      return id;
    },

    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        // Ajouter une classe d'animation de sortie
        const notification = this.notifications[index];
        notification.leaving = true;
        
        // Attendre la fin de l'animation avant de supprimer
        setTimeout(() => {
          const newIndex = this.notifications.findIndex(n => n.id === id);
          if (newIndex !== -1) {
            this.notifications.splice(newIndex, 1);
          }
        }, 300); // Durée de l'animation
      }
    },

    showSuccess(message) {
      this.addNotification('success', message);
    },

    showError(message) {
      this.addNotification('error', message);
    },

    showWarning(message) {
      this.addNotification('warning', message);
    },

    showInfo(message) {
      this.addNotification('info', message);
    },

    // Méthodes utilitaires
    getEndpoint(type) {
      const endpoints = {
        projet: '/api/statuts-projet',       // Ajoutez /api ici
        episode: '/api/statuts-episode',     // Ajoutez /api ici
        scene: '/api/statuts-scene',         // Ajoutez /api ici
        sequence: '/api/statuts-sequence',   // Ajoutez /api ici
        planning: '/api/statuts-planning',   // Ajoutez /api ici
        raccord: '/api/statuts-raccord'      // Ajoutez /api ici
      };
      return endpoints[type];
    },
    
    capitalizeFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    getStatutsCount(type) {
      return this[`statuts${this.capitalizeFirst(type)}`].length;
    },
    
    getTabDescription(type) {
      const descriptions = {
        projet: 'Statuts globaux des projets (en cours, terminé, annulé...)',
        episode: 'Statuts de progression des épisodes (planifié, tourné, monté...)',
        scene: 'Statuts des scènes (écrite, préparée, tournée, validée...)',
        sequence: 'Statuts des séquences (à planifier, planifiée, prête, tournée...)',
        planning: 'Statuts du planning (planifié, confirmé, en cours, terminé...)',
        raccord: 'Statuts des raccords (à vérifier, validé, non conforme, corrigé...)'
      };
      return descriptions[type];
    },
    
    getFilteredStatuts(type) {
      let statuts = this[`statuts${this.capitalizeFirst(type)}`];
      
      // Filtrer par statut d'activation
      if (this.filtreActif !== '') {
        const actif = this.filtreActif === 'true';
        statuts = statuts.filter(statut => this.getStatutActif(statut) === actif);
      }
      
      // Filtrer par recherche
      if (this.searchTerm.trim() !== '') {
        const search = this.searchTerm.toLowerCase();
        statuts = statuts.filter(statut => 
          statut.code?.toLowerCase().includes(search) ||
          this.getStatutName(statut)?.toLowerCase().includes(search) ||
          this.getStatutDescription(statut)?.toLowerCase().includes(search)
        );
      }
      
      // Trier par ordre d'affichage
      return statuts.sort((a, b) => this.getStatutOrdre(a) - this.getStatutOrdre(b));
    },
    
    // Méthodes d'accès aux propriétés des statuts (pour gérer les différences entre les entités)
    getStatutActif(statut) {
      return statut.estActif !== undefined ? statut.estActif : true;
    },
    
    getStatutName(statut) {
      return statut.nomStatutsProjet || 
             statut.nomStatutsEpisode || 
             statut.nomStatutsScene || 
             statut.nomStatutsSequence || 
             statut.nomStatut || 
             statut.nomStatutsEpisode || 
             'Nom non défini';
    },
    
    getStatutDescription(statut) {
      return statut.description || 'Aucune description';
    },
    
    getStatutOrdre(statut) {
      return statut.ordreAffichage || 99;
    },
    
    getStatutCreatedAt(statut) {
      return statut.creeLe;
    },
    
    getStatutColorClass(statut) {
      const code = statut.code?.toLowerCase() || '';
      if (code.includes('valide') || code.includes('termine') || code.includes('confirme')) {
        return 'status-success';
      } else if (code.includes('annule') || code.includes('erreur') || code.includes('non_conforme')) {
        return 'status-error';
      } else if (code.includes('en_cours') || code.includes('tournage') || code.includes('en_travail')) {
        return 'status-warning';
      } else if (code.includes('planifie') || code.includes('a_planifier') || code.includes('a_verifier')) {
        return 'status-info';
      } else {
        return 'status-default';
      }
    },
    
    getActivationClass(statut) {
      return this.getStatutActif(statut) ? 'active' : 'inactive';
    },
    
    // Méthodes de formatage
    formatDate(dateString) {
      if (!dateString) return 'Non disponible';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    // Filtres
    applyFilter() {
      // Le filtrage se fait dans les computed properties
    },
    
    // Modal
    openCreateModal(type) {
      this.resetForm();
      this.isEditing = false;
      this.editingType = type;
      this.showModal = true;
    },
    
    editStatut(type, statut) {
      this.resetForm();
      this.isEditing = true;
      this.editingType = type;
      this.editingId = statut.id || statut.idStatutProjet || statut.idStatutEpisode;
      
      // Remplir le formulaire avec les données du statut
      this.formData = {
        code: statut.code,
        nom: this.getStatutName(statut),
        description: this.getStatutDescription(statut),
        ordreAffichage: this.getStatutOrdre(statut),
        estActif: this.getStatutActif(statut)
      };
      
      this.showModal = true;
    },
    
    closeModal() {
      this.showModal = false;
      this.resetForm();
    },
    
    resetForm() {
      this.formData = {
        code: '',
        nom: '',
        description: '',
        ordreAffichage: 1,
        estActif: true
      };
      this.errors = {};
      this.formError = '';
      this.isEditing = false;
      this.editingType = null;
      this.editingId = null;
    },
    
    validateForm() {
      this.errors = {};
      let isValid = true;
      
      if (!this.formData.code.trim()) {
        this.errors.code = 'Le code est requis';
        isValid = false;
      } else if (!/^[a-z0-9_]+$/.test(this.formData.code)) {
        this.errors.code = 'Le code doit contenir seulement des lettres minuscules, chiffres et underscores';
        isValid = false;
      }
      
      if (!this.formData.nom.trim()) {
        this.errors.nom = 'Le nom est requis';
        isValid = false;
      }
      
      if (!this.formData.ordreAffichage || this.formData.ordreAffichage < 1) {
        this.errors.ordreAffichage = 'L\'ordre d\'affichage doit être un nombre positif';
        isValid = false;
      }
      
      return isValid;
    },
    
    async submitStatut() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isSubmitting = true;
      this.formError = '';
      
      try {
        const endpoint = this.getEndpoint(this.editingType);
        
        // Créez l'objet avec les champs corrects selon le type
        let requestData;
        switch(this.editingType) {
          case 'projet':
            requestData = {
              code: this.formData.code,
              nomStatutsProjet: this.formData.nom,
              description: this.formData.description,
              ordreAffichage: this.formData.ordreAffichage,
              estActif: this.formData.estActif
            };
            break;
          case 'episode':
            requestData = {
              code: this.formData.code,
              nomStatutsEpisode: this.formData.nom,
              description: this.formData.description,
              ordreAffichage: this.formData.ordreAffichage,
              estActif: this.formData.estActif
            };
            break;
          case 'scene':
            requestData = {
              code: this.formData.code,
              nomStatutsScene: this.formData.nom,
              description: this.formData.description,
              ordreAffichage: this.formData.ordreAffichage,
              estActif: this.formData.estActif
            };
            break;
          case 'sequence':
            requestData = {
              code: this.formData.code,
              nomStatutsSequence: this.formData.nom,
              description: this.formData.description,
              ordreAffichage: this.formData.ordreAffichage,
              estActif: this.formData.estActif
            };
            break;
          case 'planning':
            requestData = {
              code: this.formData.code,
              nomStatut: this.formData.nom,
              description: this.formData.description,
              ordreAffichage: this.formData.ordreAffichage,
              estActif: this.formData.estActif
            };
            break;
          case 'raccord':
            requestData = {
              code: this.formData.code,
              nomStatut: this.formData.nom,
              description: this.formData.description
            };
            break;
          default:
            requestData = { ...this.formData };
        }
        
        let response;
        
        if (this.isEditing) {
          response = await axios.put(`${endpoint}/${this.editingId}`, requestData);
          this.showSuccess('Statut modifié avec succès');
        } else {
          response = await axios.post(endpoint, requestData);
          this.showSuccess('Statut créé avec succès');
        }
        
        await this.loadStatuts(this.editingType);
        this.closeModal();
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        
        let errorMessage = 'Erreur lors de la sauvegarde';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.showError(errorMessage);
        this.formError = errorMessage;
        
      } finally {
        this.isSubmitting = false;
      }
    },
    
    async toggleActivation(type, statut) {
      const id = statut.id || statut.idStatutProjet || statut.idStatutEpisode;
      const isActive = this.getStatutActif(statut);
      const statutName = this.getStatutName(statut);
      
      this.openConfirmModal({
        title: isActive ? 'Désactiver le statut' : 'Activer le statut',
        message: `Êtes-vous sûr de vouloir ${isActive ? 'désactiver' : 'activer'} le statut "${statutName}" ?`,
        type: isActive ? 'warning' : 'info',
        onConfirm: async () => {
          try {
            const endpoint = this.getEndpoint(type);
            await axios.patch(`${endpoint}/${id}/toggle-activation`);
            
            // Recharger les données
            await this.loadStatuts(type);
            this.showSuccess(`Statut ${isActive ? 'désactivé' : 'activé'} avec succès`);
            
          } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            
            let errorMessage = 'Erreur lors du changement de statut';
            if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            }
            
            this.showError(errorMessage);
          }
        }
      });
    },
    
    async deleteStatut(type, statut) {
      const id = statut.id || statut.idStatutProjet || statut.idStatutEpisode;
      const statutName = this.getStatutName(statut);
      
      this.openConfirmModal({
        title: 'Supprimer le statut',
        message: `Êtes-vous sûr de vouloir supprimer le statut "${statutName}" ? Cette action est irréversible.`,
        type: 'danger',
        onConfirm: async () => {
          try {
            const endpoint = this.getEndpoint(type);
            
            // Appeler l'API DELETE
            await axios.delete(`${endpoint}/${id}`);
            
            // Mettre à jour directement l'état local
            const statutKey = `statuts${this.capitalizeFirst(type)}`;
            const index = this[statutKey].findIndex(s => 
              (s.id === id) || (s.idStatutProjet === id) || (s.idStatutEpisode === id)
            );
            
            if (index !== -1) {
              // Supprimer complètement de la liste
              this[statutKey].splice(index, 1);
            }
            
            // Forcer le re-render du composant
            this.$forceUpdate();
            
            this.showSuccess('Statut supprimé avec succès');
            
          } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            
            let errorMessage = 'Erreur lors de la suppression';
            if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            }
            
            // Si l'erreur indique que le statut est utilisé
            if (errorMessage.toLowerCase().includes('utilisé') || 
                errorMessage.toLowerCase().includes('en cours') ||
                errorMessage.toLowerCase().includes('référencé')) {
              this.showWarning('Impossible de supprimer ce statut car il est utilisé dans des éléments du système.');
            } else {
              this.showError(errorMessage);
            }
          }
        }
      });
    },

    getNotificationIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      return icons[type] || 'fas fa-info-circle';
    },
  }
};
</script>

