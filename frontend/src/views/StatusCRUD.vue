<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <aside class="status-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Gestion des Statuts</h2>
        <p class="sidebar-subtitle">Gérez tous les statuts système</p>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-sliders-h"></i> Navigation
        </h3>
        <div class="sidebar-actions">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="sidebar-btn" 
            :class="{ active: activeTab === tab.id }"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-chart-pie"></i> Statistiques
        </h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">{{ totalStatuts }}</span>
            <span class="stat-label">Total statuts</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalStatutsActifs }}</span>
            <span class="stat-label">Statuts actifs</span>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-filter"></i> Filtres
        </h3>
        <div class="filter-group">
          <div class="filter-item">
            <label>Statut d'activation</label>
            <select 
              v-model="filtreActif" 
              @change="applyFilter"
              class="filter-select"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actifs seulement</option>
              <option value="false">Inactifs seulement</option>
            </select>
          </div>
          
          <div class="filter-item">
            <label>Recherche globale</label>
            <div class="search-input-container">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                v-model="searchTerm"
                @input="applyFilter"
                placeholder="Rechercher..."
                class="search-input"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Contenu principal à droite -->
    <div class="status-body">
      <main class="status-main-content">
        <!-- Système d'onglets -->
        <div class="tabs-container">
          <div class="tabs-header">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
            >
              <i :class="tab.icon"></i>
              {{ tab.label }}
              <span class="tab-count">{{ getStatutsCount(tab.id) }}</span>
            </button>
            <div class="tab-indicator" :style="tabIndicatorStyle"></div>
          </div>

          <div class="tabs-content">
            <!-- Contenu de chaque onglet -->
            <div v-for="tab in tabs" :key="tab.id" v-show="activeTab === tab.id" class="tab-pane">
              <div class="tab-content-wrapper">
                <!-- En-tête de l'onglet -->
                <div class="tab-header">
                  <div>
                    <h3>
                      <i :class="tab.icon"></i> {{ tab.label }}
                    </h3>
                    <p class="tab-description">{{ getTabDescription(tab.id) }}</p>
                  </div>
                  <button 
                    @click="openCreateModal(tab.id)"
                    class="create-btn"
                  >
                    <i class="fas fa-plus"></i> Ajouter un statut
                  </button>
                </div>

                <!-- Liste des statuts -->
                <div class="status-list">
                  <div v-if="loading" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i> Chargement des statuts...
                  </div>
                  
                  <div v-else-if="getFilteredStatuts(tab.id).length === 0" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h4>Aucun statut trouvé</h4>
                    <p v-if="searchTerm || filtreActif !== ''">
                      Aucun statut ne correspond à vos critères de recherche.
                    </p>
                    <p v-else>
                      Aucun statut défini pour cette catégorie.
                    </p>
                  </div>

                  <div v-else class="status-grid">
                    <div 
                      v-for="statut in getFilteredStatuts(tab.id)" 
                      :key="statut.id || statut.idStatutProjet || statut.idStatutEpisode"
                      class="status-card"
                      :class="{ 'inactive': !getStatutActif(statut) }"
                    >
                      <div class="status-card-header">
                        <div class="status-code" :class="getStatutColorClass(statut)">
                          <span class="code-badge">{{ statut.code }}</span>
                          <span class="activation-badge" :class="getActivationClass(statut)">
                            {{ getStatutActif(statut) ? 'Actif' : 'Inactif' }}
                          </span>
                        </div>
                        <div class="status-actions">
                          <button @click="editStatut(tab.id, statut)" class="btn-action edit" title="Modifier">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            @click="toggleActivation(tab.id, statut)" 
                            class="btn-action toggle" 
                            :title="getStatutActif(statut) ? 'Désactiver' : 'Activer'"
                          >
                            <i :class="getStatutActif(statut) ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                          </button>
                          <button @click="deleteStatut(tab.id, statut)" class="btn-action delete" title="Supprimer">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div class="status-card-body">
                        <h4 class="status-name">{{ getStatutName(statut) }}</h4>
                        <p class="status-description">{{ getStatutDescription(statut) }}</p>
                        
                        <div class="status-meta">
                          <div class="meta-item">
                            <i class="fas fa-sort-numeric-down"></i>
                            <span>Ordre: {{ getStatutOrdre(statut) }}</span>
                          </div>
                          <div v-if="getStatutCreatedAt(statut)" class="meta-item">
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
      </main>
    </div>

    <!-- Modal de création/modification -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
            {{ isEditing ? 'Modifier le statut' : 'Créer un nouveau statut' }}
          </h3>
          <button @click="closeModal" class="modal-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitStatut" class="status-form">
            <div class="form-row">
              <div class="form-group">
                <label for="code">Code *</label>
                <input
                  type="text"
                  id="code"
                  v-model="formData.code"
                  required
                  placeholder="ex: en_cours, valide, etc."
                  class="form-input"
                  :class="{ 'error': errors.code }"
                />
                <div v-if="errors.code" class="error-message">{{ errors.code }}</div>
                <div class="input-hint">Doit être unique et en minuscules avec underscores</div>
              </div>

              <div class="form-group">
                <label for="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  v-model="formData.nom"
                  required
                  placeholder="Nom du statut"
                  class="form-input"
                  :class="{ 'error': errors.nom }"
                />
                <div v-if="errors.nom" class="error-message">{{ errors.nom }}</div>
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                placeholder="Description du statut"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="ordreAffichage">Ordre d'affichage *</label>
                <input
                  type="number"
                  id="ordreAffichage"
                  v-model="formData.ordreAffichage"
                  required
                  min="1"
                  class="form-input"
                  :class="{ 'error': errors.ordreAffichage }"
                />
                <div v-if="errors.ordreAffichage" class="error-message">{{ errors.ordreAffichage }}</div>
                <div class="input-hint">Détermine l'ordre dans les listes déroulantes</div>
              </div>

              <div class="form-group">
                <label for="estActif">Statut</label>
                <div class="checkbox-group">
                  <input
                    type="checkbox"
                    id="estActif"
                    v-model="formData.estActif"
                    class="checkbox-input"
                  />
                  <label for="estActif" class="checkbox-label">
                    <span class="checkbox-custom"></span>
                    Actif
                  </label>
                </div>
                <div class="input-hint">Un statut inactif n'apparaîtra pas dans les sélections</div>
              </div>
            </div>

            <div v-if="formError" class="form-error">
              <i class="fas fa-exclamation-triangle"></i> {{ formError }}
            </div>

            <div class="form-actions">
              <button
                type="button"
                @click="closeModal"
                class="cancel-btn"
              >
                <i class="fas fa-times"></i> Annuler
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="submit-btn"
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

    <!-- Modal de confirmation -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-content confirmation-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i :class="confirmIcon"></i>
            {{ confirmConfig.title }}
          </h3>
          <button @click="closeConfirmModal" class="modal-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="confirmation-content">
            <p class="confirmation-message">{{ confirmConfig.message }}</p>
            
            <div class="confirmation-actions">
              <button
                type="button"
                @click="closeConfirmModal"
                class="cancel-btn"
              >
                <i class="fas fa-times"></i> Annuler
              </button>
              <button
                type="button"
                @click="confirmAction"
                :class="['confirm-btn', `confirm-${confirmConfig.type}`]"
              >
                <i :class="confirmActionIcon"></i>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notification -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <i class="fas" :class="toast.icon"></i>
      <span>{{ toast.message }}</span>
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
        { id: 'projet', label: 'Projet', icon: 'fas fa-project-diagram' },
        { id: 'episode', label: 'Épisode', icon: 'fas fa-film' },
        { id: 'scene', label: 'Scène', icon: 'fas fa-video' },
        { id: 'sequence', label: 'Séquence', icon: 'fas fa-list-ol' },
        { id: 'planning', label: 'Planning', icon: 'fas fa-calendar-alt' },
        { id: 'raccord', label: 'Raccord', icon: 'fas fa-link' }
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
      
      showConfirmModal: false,
      confirmConfig: {
        title: '',
        message: '',
        type: 'warning',
        onConfirm: null
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
      
      // Toast
      toast: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fa-check'
      },
      
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
    
    tabIndicatorStyle() {
      const tabCount = this.tabs.length;
      const tabWidth = 100 / tabCount;
      const activeIndex = this.tabs.findIndex(tab => tab.id === this.activeTab);
      const translateX = activeIndex * 100;
      
      return {
        transform: `translateX(${translateX}%)`,
        width: `${tabWidth}%`
      };
    },

    confirmIcon() {
      const icons = {
        warning: 'fas fa-exclamation-triangle',
        danger: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle'
      };
      return icons[this.confirmConfig.type] || 'fas fa-exclamation-triangle';
    },

    confirmActionIcon() {
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
        this.showError('Erreur lors du chargement des statuts');
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
        if (error.response?.status === 404) {
          console.warn(`Endpoint ${type} non trouvé`);
        }
      }
    },

    // Méthodes pour la confirmation
    openConfirmModal(config) {
      this.confirmConfig = {
        title: config.title || 'Confirmation',
        message: config.message || 'Êtes-vous sûr ?',
        type: config.type || 'warning',
        onConfirm: config.onConfirm || (() => {})
      };
      this.showConfirmModal = true;
    },

    closeConfirmModal() {
      this.showConfirmModal = false;
      this.confirmConfig = {
        title: '',
        message: '',
        type: 'warning',
        onConfirm: null
      };
    },

    confirmAction() {
      if (this.confirmConfig.onConfirm) {
        this.confirmConfig.onConfirm();
      }
      this.closeConfirmModal();
    },
    
    // Méthodes utilitaires
    getEndpoint(type) {
      const endpoints = {
        projet: '/api/statuts-projet',
        episode: '/api/statuts-episode',
        scene: '/api/statuts-scene',
        sequence: '/api/statuts-sequence',
        planning: '/api/statuts-planning',
        raccord: '/api/statuts-raccord'
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
      
      if (this.filtreActif !== '') {
        const actif = this.filtreActif === 'true';
        statuts = statuts.filter(statut => this.getStatutActif(statut) === actif);
      }
      
      if (this.searchTerm.trim() !== '') {
        const search = this.searchTerm.toLowerCase();
        statuts = statuts.filter(statut => 
          statut.code?.toLowerCase().includes(search) ||
          this.getStatutName(statut)?.toLowerCase().includes(search) ||
          this.getStatutDescription(statut)?.toLowerCase().includes(search)
        );
      }
      
      return statuts.sort((a, b) => this.getStatutOrdre(a) - this.getStatutOrdre(b));
    },
    
    getStatutActif(statut) {
      return statut.estActif !== undefined ? statut.estActif : true;
    },
    
    getStatutName(statut) {
      return statut.nomStatutsProjet || 
             statut.nomStatutsEpisode || 
             statut.nomStatutsScene || 
             statut.nomStatutsSequence || 
             statut.nomStatut || 
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
    
    formatDate(dateString) {
      if (!dateString) return 'Non disponible';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
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
            
            await this.loadStatuts(type);
            this.showSuccess(`Statut ${isActive ? 'désactivé' : 'activé'} avec succès`);
            
          } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            this.showError('Erreur lors du changement de statut');
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
            await axios.delete(`${endpoint}/${id}`);
            
            const statutKey = `statuts${this.capitalizeFirst(type)}`;
            const index = this[statutKey].findIndex(s => 
              (s.id === id) || (s.idStatutProjet === id) || (s.idStatutEpisode === id)
            );
            
            if (index !== -1) {
              this[statutKey].splice(index, 1);
            }
            
            this.$forceUpdate();
            this.showSuccess('Statut supprimé avec succès');
            
          } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            let errorMessage = 'Erreur lors de la suppression';
            if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            }
            
            if (errorMessage.toLowerCase().includes('utilisé') || 
                errorMessage.toLowerCase().includes('en cours') ||
                errorMessage.toLowerCase().includes('référencé')) {
              this.showError('Impossible de supprimer ce statut car il est utilisé dans des éléments du système.');
            } else {
              this.showError(errorMessage);
            }
          }
        }
      });
    },

    // Toast notifications
    showSuccess(message) {
      this.toast = {
        show: true,
        message,
        type: 'success',
        icon: 'fa-check'
      };
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },

    showError(message) {
      this.toast = {
        show: true,
        message,
        type: 'error',
        icon: 'fa-exclamation-circle'
      };
      setTimeout(() => {
        this.toast.show = false;
      }, 5000);
    },

    showWarning(message) {
      this.toast = {
        show: true,
        message,
        type: 'warning',
        icon: 'fa-exclamation-triangle'
      };
      setTimeout(() => {
        this.toast.show = false;
      }, 4000);
    }
  }
};
</script>

<style scoped>
</style>

