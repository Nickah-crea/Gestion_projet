<!-- TypesRaccordCRUD.vue -->
<template>
  <div class="app-wrapper-global-type-raccord">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-type-raccord">
      <div class="sidebar-header-type-raccord">
        <h2 class="sidebar-title-type-raccord">
          <i class="fas fa-tags"></i> Gestion des Types de Raccord
        </h2>
        <p class="sidebar-subtitle-type-raccord">
          Gérez tous les types de raccords de continuité
        </p>
      </div>

      <!-- Statistiques -->
      <div class="sidebar-section-type-raccord">
        <h3 class="section-title-type-raccord">
          <i class="fas fa-chart-bar"></i> Statistiques
        </h3>
        <div class="stats-type-raccord">
          <div class="stat-item-type-raccord">
            <span class="stat-number-type-raccord">{{ totalTypes }}</span>
            <span class="stat-label-type-raccord">Total types</span>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="sidebar-section-type-raccord">
        <h3 class="section-title-type-raccord">
          <i class="fas fa-filter"></i> Filtres
        </h3>
        <div class="filter-group-type-raccord">
          <div class="filter-item-type-raccord">
            <label for="searchFilter">Recherche</label>
            <div class="search-input-container-type-raccord">
              <i class="fas fa-search search-icon-type-raccord"></i>
              <input
                type="text"
                id="searchFilter"
                v-model="searchTerm"
                @input="applyFilter"
                placeholder="Rechercher un type..."
                class="search-input-type-raccord"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="sidebar-section-type-raccord">
        <h3 class="section-title-type-raccord">
          <i class="fas fa-bolt"></i> Actions Rapides
        </h3>
        <div class="sidebar-actions-type-raccord">
          <button 
            @click="openCreateModal"
            class="sidebar-btn-type-raccord"
          >
            <i class="fas fa-plus"></i> Nouveau type
          </button>
          <button 
            @click="loadTypes"
            class="sidebar-btn-type-raccord"
          >
            <i class="fas fa-sync-alt"></i> Actualiser
          </button>
        </div>
      </div>

      <!-- Types prédéfinis -->
      <div class="sidebar-section-type-raccord">
        <h3 class="section-title-type-raccord">
          <i class="fas fa-star"></i> Types courants
        </h3>
        <div class="common-types-type-raccord">
          <div 
            v-for="commonType in commonTypes" 
            :key="commonType.code"
            class="common-type-item-type-raccord"
            @click="prefillForm(commonType)"
          >
            <span class="common-type-code-type-raccord">{{ commonType.code }}</span>
            <span class="common-type-name-type-raccord">{{ commonType.nom }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="creation-body-type-raccord">
      <div class="creation-main-content-type-raccord">
        
        <!-- En-tête principal -->
        <div class="main-header-type-raccord">
          <h1 class="page-title-type-raccord">
            <i class="fas fa-link"></i> Types de Raccord
          </h1>
          <p class="page-subtitle-type-raccord">
            Gérez les catégories de raccords pour assurer la continuité dans vos productions
          </p>
        </div>

        <!-- Liste des types -->
        <div class="types-container-type-raccord">
          <!-- En-tête de la liste -->
          <div class="types-header-type-raccord">
            <div class="types-title-type-raccord">
              <h3><i class="fas fa-list"></i> Liste des types de raccord</h3>
              <p class="types-description-type-raccord">
                {{ filteredTypes.length }} type(s) trouvé(s)
              </p>
            </div>
            <button 
              @click="openCreateModal"
              class="btn-create-type-raccord"
            >
              <i class="fas fa-plus"></i> Ajouter un type
            </button>
          </div>

          <!-- État de chargement -->
          <div v-if="loading" class="loading-state-type-raccord">
            <i class="fas fa-spinner fa-spin"></i> Chargement des types...
          </div>

          <!-- État vide -->
          <div v-else-if="filteredTypes.length === 0" class="empty-state-type-raccord">
            <i class="fas fa-inbox"></i>
            <div v-if="searchTerm">
              Aucun type ne correspond à votre recherche.
            </div>
            <div v-else>
              Aucun type de raccord défini. Commencez par en créer un !
            </div>
          </div>

          <!-- Grille des types -->
          <div v-else class="types-grid-type-raccord">
            <div 
              v-for="type in filteredTypes" 
              :key="type.id"
              class="type-card-type-raccord"
            >
              <div class="type-card-header-type-raccord">
                <div class="type-code-type-raccord" :class="getTypeColorClass(type)">
                  <span class="code-badge-type-raccord">{{ type.code }}</span>
                  <span class="type-date-type-raccord">
                    <i class="far fa-calendar"></i>
                    {{ formatDate(type.creeLe) }}
                  </span>
                </div>
                <div class="type-actions-type-raccord">
                  <button 
                    @click="editType(type)" 
                    class="btn-action-type-raccord edit" 
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="deleteType(type)" 
                    class="btn-action-type-raccord delete" 
                    title="Supprimer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div class="type-card-body-type-raccord">
                <h4 class="type-name-type-raccord">{{ type.nomType }}</h4>
                <p class="type-description-type-raccord">
                  {{ type.description || 'Aucune description' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création/modification -->
    <div v-if="showModal" class="modal-overlay-type-raccord" @click="closeModal">
      <div class="modal-content-type-raccord" @click.stop>
        <div class="modal-header-type-raccord">
          <h3>
            <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
            {{ isEditing ? 'Modifier le type' : 'Créer un nouveau type' }}
          </h3>
          <button @click="closeModal" class="modal-close-btn-type-raccord">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-type-raccord">
          <form @submit.prevent="submitType" class="type-form-type-raccord">
            <div class="form-row-type-raccord">
              <div class="form-group-type-raccord">
                <label for="code">Code *</label>
                <input
                  type="text"
                  id="code"
                  v-model="formData.code"
                  required
                  placeholder="ex: decor, costume, etc."
                  class="form-input-type-raccord"
                  :class="{ 'error': errors.code }"
                />
                <div v-if="errors.code" class="error-message-type-raccord">{{ errors.code }}</div>
                <div class="input-hint-type-raccord">
                  Doit être unique, en minuscules, sans espaces
                </div>
              </div>

              <div class="form-group-type-raccord">
                <label for="nomType">Nom *</label>
                <input
                  type="text"
                  id="nomType"
                  v-model="formData.nomType"
                  required
                  placeholder="Nom du type de raccord"
                  class="form-input-type-raccord"
                  :class="{ 'error': errors.nomType }"
                />
                <div v-if="errors.nomType" class="error-message-type-raccord">{{ errors.nomType }}</div>
              </div>
            </div>

            <div class="form-group-type-raccord">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="4"
                placeholder="Description détaillée du type de raccord..."
                class="form-textarea-type-raccord"
              ></textarea>
              <div class="input-hint-type-raccord">
                Décrivez les caractéristiques de ce type de raccord
              </div>
            </div>

            <div v-if="formError" class="form-error-type-raccord">
              <i class="fas fa-exclamation-triangle"></i> {{ formError }}
            </div>

            <div class="form-actions-type-raccord">
              <button
                type="button"
                @click="closeModal"
                class="cancel-btn-type-raccord"
              >
                <i class="fas fa-times"></i> Annuler
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="submit-btn-type-raccord"
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
    <div v-if="showConfirmModal" class="modal-overlay-type-raccord" @click="closeConfirmModal">
      <div class="modal-content-type-raccord confirmation-modal-type-raccord" @click.stop>
        <div class="modal-header-type-raccord">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            Confirmer la suppression
          </h3>
          <button @click="closeConfirmModal" class="modal-close-btn-type-raccord">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-type-raccord">
          <div class="confirmation-content-type-raccord">
            <p class="confirmation-message-type-raccord">
              Êtes-vous sûr de vouloir supprimer le type "{{ typeToDelete?.nomType }}" ?
              Cette action est irréversible.
            </p>
            
            <div class="confirmation-actions-type-raccord">
              <button
                type="button"
                @click="closeConfirmModal"
                class="cancel-btn-type-raccord"
              >
                <i class="fas fa-times"></i> Annuler
              </button>
              <button
                type="button"
                @click="confirmDelete"
                class="confirm-btn-type-raccord confirm-danger"
                :disabled="isDeleting"
              >
                <i v-if="isDeleting" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-trash"></i>
                {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="notifications-container-type-raccord">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification-type-raccord', `notification-${notification.type}`]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon-type-raccord">
          <i :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-content-type-raccord">
          <p class="notification-message-type-raccord">{{ notification.message }}</p>
        </div>
        <button 
          @click.stop="removeNotification(notification.id)"
          class="notification-close-type-raccord"
        >
          <i class="fas fa-times"></i>
        </button>
        <div 
          class="notification-progress-type-raccord" 
          :style="{ animationDuration: `${notification.duration}ms` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TypesRaccordCRUD',
  data() {
    return {
      // Données
      types: [],
      
      // Filtres
      searchTerm: '',
      
      // Modal
      showModal: false,
      isEditing: false,
      editingId: null,
      isSubmitting: false,
      formError: '',
      
      // Formulaire
      formData: {
        code: '',
        nomType: '',
        description: ''
      },
      errors: {},
      
      // Modal de confirmation
      showConfirmModal: false,
      typeToDelete: null,
      isDeleting: false,
      
      // États
      loading: false,
      
      // Notifications
      notifications: [],
      notificationId: 0,
      
      // Types courants prédéfinis
      commonTypes: [
        { code: 'decor', nom: 'Décor', description: 'Raccord de décor et environnement' },
        { code: 'costume', nom: 'Costume', description: 'Raccord de vêtements et accessoires vestimentaires' },
        { code: 'accessoire', nom: 'Accessoire', description: 'Raccord d\'objets et accessoires' },
        { code: 'coiffure', nom: 'Coiffure', description: 'Raccord de coiffure et maquillage' },
        { code: 'lumiere', nom: 'Lumière', description: 'Raccord d\'éclairage et ambiance lumineuse' },
        { code: 'position', nom: 'Position', description: 'Raccord de position des acteurs et objets' },
        { code: 'props', nom: 'Props', description: 'Raccord d\'accessoires de plateau' },
        { code: 'meteo', nom: 'Météo', description: 'Raccord de conditions météorologiques' },
        { code: 'continuite', nom: 'Continuité', description: 'Raccord général de continuité' }
      ]
    };
  },
  computed: {
    totalTypes() {
      return this.types.length;
    },
    
    filteredTypes() {
      if (!this.searchTerm.trim()) {
        return this.types.sort((a, b) => a.code.localeCompare(b.code));
      }
      
      const search = this.searchTerm.toLowerCase();
      return this.types.filter(type => 
        type.code.toLowerCase().includes(search) ||
        type.nomType.toLowerCase().includes(search) ||
        (type.description && type.description.toLowerCase().includes(search))
      ).sort((a, b) => a.code.localeCompare(b.code));
    }
  },
  async mounted() {
    await this.loadTypes();
  },
  methods: {
    // Méthodes pour charger les données
    async loadTypes() {
      this.loading = true;
      try {
        const response = await axios.get('/api/types-raccord');
        this.types = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des types:', error);
        this.showError('Erreur lors du chargement des types');
      } finally {
        this.loading = false;
      }
    },
    
    // Méthodes utilitaires
    getTypeColorClass(type) {
      const code = type.code?.toLowerCase() || '';
      if (code.includes('decor') || code.includes('position')) {
        return 'type-primary';
      } else if (code.includes('costume') || code.includes('coiffure')) {
        return 'type-secondary';
      } else if (code.includes('accessoire') || code.includes('props')) {
        return 'type-tertiary';
      } else if (code.includes('lumiere') || code.includes('meteo')) {
        return 'type-quaternary';
      } else {
        return 'type-default';
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Non disponible';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return 'Date invalide';
      }
    },
    
    // Filtres
    applyFilter() {
      // Le filtrage se fait dans la computed property
    },
    
    // Pré-remplir avec un type courant
    prefillForm(commonType) {
      this.resetForm();
      this.formData = {
        code: commonType.code,
        nomType: commonType.nom,
        description: commonType.description
      };
      this.openCreateModal();
    },
    
    // Modal
    openCreateModal() {
      this.resetForm();
      this.isEditing = false;
      this.showModal = true;
    },
    
    editType(type) {
      this.resetForm();
      this.isEditing = true;
      this.editingId = type.id;
      
      // Remplir le formulaire
      this.formData = {
        code: type.code,
        nomType: type.nomType,
        description: type.description || ''
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
        nomType: '',
        description: ''
      };
      this.errors = {};
      this.formError = '';
      this.isEditing = false;
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
      
      if (!this.formData.nomType.trim()) {
        this.errors.nomType = 'Le nom est requis';
        isValid = false;
      }
      
      return isValid;
    },
    
    async submitType() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isSubmitting = true;
      this.formError = '';
      
      try {
        const endpoint = '/api/types-raccord';
        
        if (this.isEditing) {
          await axios.put(`${endpoint}/${this.editingId}`, this.formData);
          this.showSuccess('Type modifié avec succès');
        } else {
          await axios.post(endpoint, this.formData);
          this.showSuccess('Type créé avec succès');
        }
        
        await this.loadTypes();
        this.closeModal();
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        
        let errorMessage = 'Erreur lors de la sauvegarde';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        
        this.showError(errorMessage);
        this.formError = errorMessage;
        
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // Confirmation de suppression
    openDeleteConfirm(type) {
      this.typeToDelete = type;
      this.showConfirmModal = true;
    },
    
    closeConfirmModal() {
      this.showConfirmModal = false;
      this.typeToDelete = null;
      this.isDeleting = false;
    },
    
    async deleteType(type) {
      this.openDeleteConfirm(type);
    },
    
    async confirmDelete() {
      if (!this.typeToDelete) return;
      
      this.isDeleting = true;
      
      try {
        await axios.delete(`/api/types-raccord/${this.typeToDelete.id}`);
        
        // Supprimer de la liste locale
        const index = this.types.findIndex(t => t.id === this.typeToDelete.id);
        if (index !== -1) {
          this.types.splice(index, 1);
        }
        
        this.showSuccess('Type supprimé avec succès');
        this.closeConfirmModal();
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        
        let errorMessage = 'Erreur lors de la suppression';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        this.showError(errorMessage);
        
      } finally {
        this.isDeleting = false;
      }
    },
    
    // Notifications
    addNotification(type, message, duration = 5000) {
      const id = ++this.notificationId;
      const notification = {
        id,
        type,
        message,
        duration
      };
      
      this.notifications.push(notification);
      
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
      
      return id;
    },
    
    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
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
    
    getNotificationIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      return icons[type] || 'fas fa-info-circle';
    }
  }
};
</script>
