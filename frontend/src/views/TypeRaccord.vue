<!-- TypesRaccordCRUD.vue -->
<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <aside class="utilisateurs-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Types de Raccord</h2>
        <p class="sidebar-subtitle">Gestion des catégories de raccords</p>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-users"></i> Navigation
        </h3>
        <div class="sidebar-actions">
          <button 
            class="sidebar-btn" 
            :class="{ active: activeTab === 'liste' }"
            @click="activeTab = 'liste'"
          >
            <i class="fas fa-list"></i>
            Liste des Types
          </button>
          <button 
            class="sidebar-btn" 
            :class="{ active: activeTab === 'ajout' }"
            @click="activeTab = 'ajout'"
          >
            <i class="fas fa-plus"></i>
            Ajouter un Type
          </button>
        </div>
      </div>

      <div class="sidebar-section" v-if="activeTab === 'liste'">
        <h3 class="section-title">
          <i class="fas fa-filter"></i> Filtres
        </h3>
        <div class="filter-group">
          <div class="filter-item">
            <label>Recherche</label>
            <div class="search-input-container">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchTerm" 
                placeholder="Rechercher un type..."
                class="search-input-large"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-chart-pie"></i> Statistiques
        </h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">{{ totalTypes }}</span>
            <span class="stat-label">Types totaux</span>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-star"></i> Types courants
        </h3>
        <div class="common-types">
          <div 
            v-for="commonType in commonTypes" 
            :key="commonType.code"
            class="common-type-item"
            @click="prefillForm(commonType)"
          >
            <span class="common-type-code">{{ commonType.code }}</span>
            <span class="common-type-name">{{ commonType.nom }}</span>
          </div>
        </div>
      </div>

    </aside>

    <!-- Contenu principal à droite -->
    <div class="utilisateurs-body">
      <main class="utilisateurs-main-content">
        <!-- Système d'onglets -->
        <div class="tabs-container">
          <div class="tabs-header">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'liste' }"
              @click="activeTab = 'liste'"
            >
              <i class="fas fa-list"></i>
              Liste des Types
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'ajout' }"
              @click="activeTab = 'ajout'"
            >
              <i class="fas fa-plus"></i>
              Ajouter un Type
            </button>
            <div class="tab-indicator" :style="tabIndicatorStyle"></div>
          </div>

          <div class="tabs-content">
            <!-- Onglet 1: Liste des types -->
            <div v-if="activeTab === 'liste'" class="tab-pane">
              <div class="content-header">
                <div>
                  <h3>
                    <i class="fas fa-link"></i>
                    Gestion des Types de Raccord
                  </h3>
                  <p>Administrez les catégories de raccords pour assurer la continuité dans vos productions</p>
                </div>
                
                <div class="search-section">
                  <div class="search-group">
                    <label>Recherche rapide</label>
                    <div class="search-input-container">
                      <i class="fas fa-search search-icon"></i>
                      <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Rechercher un type..." 
                        class="search-input-large"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Grille des types -->
              <div class="types-grid-container">
                <div v-if="loading" class="loading-state">
                  <i class="fas fa-spinner fa-spin"></i> Chargement des types...
                </div>

                <div v-else-if="filteredTypes.length === 0" class="empty-state">
                  <i class="fas fa-inbox"></i>
                  <h3>Aucun type trouvé</h3>
                  <p v-if="searchQuery">Aucun type ne correspond à votre recherche</p>
                  <p v-else>Ajoutez votre premier type pour commencer</p>
                </div>

                <div v-else class="types-grid">
                  <div 
                    v-for="type in filteredTypes" 
                    :key="type.id"
                    class="type-card"
                  >
                    <div class="type-card-header">
                      <div class="type-code" :class="getTypeColorClass(type)">
                        <span class="code-badge">{{ type.code }}</span>
                        <span class="type-date">
                          <i class="far fa-calendar"></i>
                          {{ formatDate(type.creeLe) }}
                        </span>
                      </div>
                      <div class="type-actions">
                        <button 
                          @click="editType(type)" 
                          class="btn-edit" 
                          title="Modifier"
                        >
                          <i class="fas fa-marker"></i>
                        </button>
                        <button 
                          @click="deleteType(type)" 
                          class="btn-edit delete-btn" 
                          title="Supprimer"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="type-card-body">
                      <h4 class="type-name">{{ type.nomType }}</h4>
                      <p class="type-description">
                        {{ type.description || 'Aucune description' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet 2: Formulaire d'ajout/modification -->
            <div v-if="activeTab === 'ajout'" class="tab-pane">
              <div class="form-header">
                <h3>
                  <i class="fas" :class="isEditing ? 'fa-edit' : 'fa-plus'"></i>
                  {{ isEditing ? 'Modifier le type' : 'Ajouter un nouveau type' }}
                </h3>
                <button @click="goToList" class="back-btn">
                  <i class="fas fa-arrow-left"></i>
                  Retour à la liste
                </button>
              </div>

              <form @submit.prevent="submitType" class="user-form">
                <!-- Informations du type -->
                <div class="form-section">
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="code">Code </label>
                      <input 
                        type="text" 
                        id="code"
                        v-model="formData.code" 
                        required 
                        placeholder="ex: decor, costume, etc."
                        class="form-input"
                        :class="{ 'error-input': errors.code }"
                      />
                      <div v-if="errors.code" class="error-message">{{ errors.code }}</div>
                      <div class="input-hint">
                        Doit être unique, en minuscules, sans espaces
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="nomType">Nom </label>
                      <input 
                        type="text" 
                        id="nomType"
                        v-model="formData.nomType" 
                        required 
                        placeholder="Nom du type de raccord"
                        class="form-input"
                        :class="{ 'error-input': errors.nomType }"
                      />
                      <div v-if="errors.nomType" class="error-message">{{ errors.nomType }}</div>
                    </div>

                    <div class="form-group full-width">
                      <label for="description">Description</label>
                      <textarea 
                        id="description"
                        v-model="formData.description" 
                        placeholder="Description détaillée du type de raccord..."
                        rows="4"
                        class="form-textarea"
                      ></textarea>
                      <div class="input-hint">
                        Décrivez les caractéristiques de ce type de raccord
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="formError" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ formError }}
                </div>

                <div class="form-actions">
                  <button type="button" @click="resetForm" class="cancel-btn">
                    <i class="fas fa-times"></i>
                    Annuler
                  </button>
                  <button type="submit" class="submit-btn" :disabled="isSubmitting">
                    <i class="fas" :class="isSubmitting ? 'fa-spinner fa-spin' : (isEditing ? 'fa-save' : 'fa-check')"></i>
                    {{ isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier le type' : 'Créer le type') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2>Confirmer la suppression</h2>
          <button class="modal-close-btn" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <i class="fas fa-exclamation-triangle warning-icon"></i>
          <p>Êtes-vous sûr de vouloir supprimer le type <strong>{{ typeToDelete?.nomType }}</strong> ?</p>
          <p class="warning-text">Cette action est irréversible.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="cancel-btn" @click="showDeleteModal = false">
            Annuler
          </button>
          <button type="button" class="submit-btn delete-btn" @click="confirmDelete" :disabled="isDeleting">
            <i class="fas" :class="isDeleting ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
            {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
          </button>
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
  name: 'TypesRaccordCRUD',
  data() {
    return {
      activeTab: 'liste',
      types: [],
      loading: false,
      isSubmitting: false,
      isDeleting: false,
      searchTerm: '',
      searchQuery: '',
      showDeleteModal: false,
      typeToDelete: null,
      isEditing: false,
      editingId: null,
      formData: {
        code: '',
        nomType: '',
        description: ''
      },
      errors: {},
      formError: '',
      toast: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fa-check'
      },
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
    filteredTypes() {
      let filtered = this.types;
      
      const searchTerm = this.searchQuery || this.searchTerm;
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(type => 
          type.code.toLowerCase().includes(search) ||
          type.nomType.toLowerCase().includes(search) ||
          (type.description && type.description.toLowerCase().includes(search))
        );
      }
      
      return filtered.sort((a, b) => a.code.localeCompare(b.code));
    },
    
    totalTypes() {
      return this.types.length;
    },
    
    tabIndicatorStyle() {
      const tabs = ['liste', 'ajout'];
      const index = tabs.indexOf(this.activeTab);
      return {
        width: `${100 / tabs.length}%`,
        transform: `translateX(${index * 100}%)`
      };
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
        this.showToast('Erreur lors du chargement des types', 'error');
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
    
    // Pré-remplir avec un type courant
    prefillForm(commonType) {
      this.resetForm();
      this.formData = {
        code: commonType.code,
        nomType: commonType.nom,
        description: commonType.description
      };
      this.activeTab = 'ajout';
      this.isEditing = false;
    },
    
    // Modal
    openCreateModal() {
      this.resetForm();
      this.isEditing = false;
      this.activeTab = 'ajout';
    },
    
    editType(type) {
      this.resetForm();
      this.isEditing = true;
      this.editingId = type.id;
      this.activeTab = 'ajout';
      
      // Remplir le formulaire
      this.formData = {
        code: type.code,
        nomType: type.nomType,
        description: type.description || ''
      };
    },
    
    goToList() {
      this.activeTab = 'liste';
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
          this.showToast('Type modifié avec succès', 'success');
        } else {
          await axios.post(endpoint, this.formData);
          this.showToast('Type créé avec succès', 'success');
        }
        
        await this.loadTypes();
        this.activeTab = 'liste';
        this.resetForm();
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        
        let errorMessage = 'Erreur lors de la sauvegarde';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        
        this.showToast(errorMessage, 'error');
        this.formError = errorMessage;
        
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // Confirmation de suppression
    deleteType(type) {
      this.typeToDelete = type;
      this.showDeleteModal = true;
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
        
        this.showToast('Type supprimé avec succès', 'success');
        this.showDeleteModal = false;
        this.typeToDelete = null;
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        
        let errorMessage = 'Erreur lors de la suppression';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        this.showToast(errorMessage, 'error');
        
      } finally {
        this.isDeleting = false;
      }
    },
    
    // Toast notifications
    showToast(message, type = 'success') {
      this.toast = {
        show: true,
        message,
        type,
        icon: type === 'success' ? 'fa-check' : 'fa-exclamation-circle'
      };
      
      setTimeout(() => {
        this.toast.show = false;
      }, 5000);
    },
    
    clearMessage() {
      this.formError = '';
      this.toast.show = false;
    }
  }
};
</script>

