<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <aside class="utilisateurs-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Gestion Utilisateurs</h2>
        <p class="sidebar-subtitle">Administration des comptes</p>
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
            Liste des Utilisateurs
          </button>
          <button 
            class="sidebar-btn" 
            :class="{ active: activeTab === 'ajout' }"
            @click="activeTab = 'ajout'"
          >
            <i class="fas fa-user-plus"></i>
            Ajouter un Utilisateur
          </button>
        </div>
      </div>

      <div class="sidebar-section" v-if="activeTab === 'liste'">
        <h3 class="section-title">
          <i class="fas fa-filter"></i> Filtres
        </h3>
        <div class="filter-group">
          <div class="filter-item">
            <label>Rôle</label>
            <select v-model="filterRole" class="filter-select">
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Administrateur</option>
              <option value="SCENARISTE">Scénariste</option>
              <option value="REALISATEUR">Réalisateur</option>
            </select>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-chart-pie"></i> Statistiques
        </h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">{{ users.length }}</span>
            <span class="stat-label">Utilisateurs totaux</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ adminCount }}</span>
            <span class="stat-label">Administrateurs</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ scenaristeCount }}</span>
            <span class="stat-label">Scénaristes</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ realisateurCount }}</span>
            <span class="stat-label">Réalisateurs</span>
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
              Liste des Utilisateurs
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'ajout' }"
              @click="activeTab = 'ajout'"
            >
              <i class="fas fa-user-plus"></i>
              Ajouter un Utilisateur
            </button>
            <div class="tab-indicator" :style="tabIndicatorStyle"></div>
          </div>

          <div class="tabs-content">
            <!-- Onglet 1: Liste des utilisateurs -->
            <div v-if="activeTab === 'liste'" class="tab-pane">
              <div class="content-header">
                <div>
                  <h3>
                    <i class="fas fa-users"></i>
                    Gestion des Utilisateurs
                  </h3>
                  <p>Administrez les comptes administrateurs, scénaristes et réalisateurs</p>
                </div>
                
                <div class="search-section">
                  <div class="search-group">
                    <label>Recherche rapide</label>
                    <div class="search-input-container">
                      <i class="fas fa-search search-icon"></i>
                      <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Rechercher un utilisateur..." 
                        class="search-input-large"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tableau des utilisateurs -->
              <div class="table-container">
                <div class="episodes-table-container">
                  <table class="episodes-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Date création</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in filteredUsers" :key="user.idUtilisateur || user.id">
                        <td class="user-photo">
                          <div class="photo-avatar" @click="showPhotoPopup(user)">
                            <img 
                              :src="getUserAvatar(user)" 
                              :alt="user.nom"
                              @error="handleAvatarError"
                              class="user-avatar-img clickable"
                            />
                            <div v-if="!user.profilePhotoPath" class="avatar-placeholder clickable">
                              <i class="fas fa-user"></i>
                            </div>
                          </div>
                        </td>
                        <td class="user-name">
                          <div class="title-wrapper">
                            <div>
                              <strong>{{ user.nom }}</strong>
                              <p v-if="user.specialite" class="user-specialite">
                                {{ user.specialite }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>{{ user.email }}</td>
                        <td>
                          <span class="episode-status" :class="getRoleClass(user.role)">
                            {{ getRoleLabel(user.role) }}
                          </span>
                        </td>
                        <td>{{ formatDate(user.creeLe) }}</td>
                        <td>
                          <div class="table-actions">
                            <button class="btn-edit" @click="editUser(user)" title="Modifier">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-edit delete-btn" @click="confirmDelete(user)" title="Supprimer">
                              <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn-view" @click="manageUserPhoto(user)" title="Gérer la photo">
                              <i class="fas fa-camera"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div v-if="filteredUsers.length === 0" class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Aucun utilisateur trouvé</h3>
                    <p>Ajoutez votre premier utilisateur pour commencer</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet 2: Formulaire d'ajout/modification -->
            <div v-if="activeTab === 'ajout'" class="tab-pane">
              <div class="form-header">
                <h3>
                  <i class="fas" :class="editingUser ? 'fa-edit' : 'fa-user-plus'"></i>
                  {{ editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur' }}
                </h3>
                <button @click="goToList" class="back-btn">
                  <i class="fas fa-arrow-left"></i>
                  Retour à la liste
                </button>
              </div>

              <form @submit.prevent="submitForm" class="user-form">
                <!-- Informations de l'utilisateur -->
                <div class="form-section">
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="nom">Nom complet *</label>
                      <input 
                        type="text" 
                        id="nom"
                        v-model="formData.nom" 
                        required 
                        placeholder="Entrez le nom complet"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label for="email">Email *</label>
                      <input 
                        type="email" 
                        id="email"
                        v-model="formData.email" 
                        required 
                        placeholder="Entrez l'email"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label for="password">
                        Mot de passe {{ editingUser ? '' : '*' }}
                        <span v-if="editingUser" class="info-text">
                          (Laisser vide pour ne pas modifier)
                        </span>
                      </label>
                      <input 
                        type="password" 
                        id="password"
                        v-model="formData.motDePasse" 
                        :required="!editingUser"
                        placeholder="Entrez le mot de passe"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group">
                      <label for="role">Rôle *</label>
                      <select 
                        id="role"
                        v-model="formData.role" 
                        required
                        class="form-select"
                      >
                        <option value="">Sélectionnez un rôle</option>
                        <option value="ADMIN">Administrateur</option>
                        <option value="SCENARISTE">Scénariste</option>
                        <option value="REALISATEUR">Réalisateur</option>
                      </select>
                    </div>

                    <div v-if="formData.role === 'SCENARISTE' || formData.role === 'REALISATEUR'" class="form-group">
                      <label for="specialite">Spécialité</label>
                      <input 
                        type="text" 
                        id="specialite"
                        v-model="formData.specialite" 
                        placeholder="Entrez la spécialité"
                        class="form-input"
                      />
                    </div>

                    <div v-if="formData.role === 'SCENARISTE' || formData.role === 'REALISATEUR'" class="form-group full-width">
                      <label for="biographie">Biographie</label>
                      <textarea 
                        id="biographie"
                        v-model="formData.biographie" 
                        placeholder="Entrez la biographie"
                        rows="4"
                        class="form-textarea"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div v-if="editingUser" class="photo-management-section">
                  <h4><i class="fas fa-camera"></i> Gestion de la photo de profil</h4>
                  <div class="photo-management-info">
                    <p>
                      <i class="fas fa-info-circle"></i>
                      Pour gérer la photo de profil, utilisez le bouton "Gérer la photo" dans la liste des utilisateurs.
                    </p>
                    <button type="button" class="cancel-btn" @click="goToListAndManagePhoto">
                      <i class="fas fa-camera"></i>
                      Aller gérer la photo
                    </button>
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
                  <button type="submit" class="submit-btn" :disabled="loading">
                    <i class="fas" :class="loading ? 'fa-spinner fa-spin' : (editingUser ? 'fa-save' : 'fa-check')"></i>
                    {{ loading ? 'Enregistrement...' : (editingUser ? 'Modifier l\'utilisateur' : 'Créer l\'utilisateur') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal de visualisation de photo -->
    <div v-if="showPhotoModal" class="modal-overlay" @click="closePhotoModal">
      <div class="modal-content photo-modal" @click.stop>
        <div class="modal-header">
          <h2>Photo de profil</h2>
          <button class="modal-close-btn" @click="closePhotoModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="photo-display">
            <img 
              :src="selectedUserPhoto" 
              :alt="selectedUserName"
              class="large-photo"
              @error="handleLargePhotoError"
            />
            <div v-if="!selectedUserPhoto || photoError" class="no-photo">
              <i class="fas fa-user-circle"></i>
              <p>Aucune photo de profil</p>
            </div>
          </div>
          <div class="photo-info">
            <h3>{{ selectedUserName }}</h3>
            <p>{{ selectedUserEmail }}</p>
            <p class="user-role">{{ getRoleLabel(selectedUserRole) }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="cancel-btn" @click="closePhotoModal">
            Fermer
          </button>
          <button v-if="selectedUser && selectedUser.profilePhotoPath" type="button" class="submit-btn delete-btn" @click="deleteUserPhotoFromModal">
            <i class="fas fa-trash"></i> Supprimer la photo
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de gestion de photo -->
    <div v-if="showPhotoManagementModal" class="modal-overlay" @click="closePhotoManagementModal">
      <div class="modal-content photo-management-modal" @click.stop>
        <div class="modal-header">
          <h2>
            <i class="fas fa-camera"></i>
            Gestion de la photo de profil
          </h2>
          <button class="modal-close-btn" @click="closePhotoManagementModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="current-photo-section">
            <h3>Photo actuelle</h3>
            <div class="photo-preview">
              <img 
                :src="getUserAvatar(photoManagementUser)" 
                :alt="photoManagementUser?.nom"
                class="current-photo"
                @error="handleManagementPhotoError"
              />
              <div v-if="!photoManagementUser?.profilePhotoPath || managementPhotoError" class="no-current-photo">
                <i class="fas fa-user-circle"></i>
                <p>Aucune photo</p>
              </div>
            </div>
          </div>
          
          <div class="photo-upload-section">
            <h3>Modifier la photo</h3>
            <div class="upload-area" @dragover.prevent @drop="handleDrop">
              <input 
                type="file" 
                id="photo-management-upload" 
                accept="image/*" 
                @change="handleManagementPhotoUpload"
                hidden
              />
              <label for="photo-management-upload" class="upload-label-large">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Cliquez pour sélectionner une image</p>
                <p class="hint">ou glissez-déposez ici</p>
              </label>
            </div>
            
            <div v-if="photoManagementFile" class="selected-photo">
              <h4>Nouvelle photo sélectionnée :</h4>
              <img :src="photoManagementPreview" alt="Nouvelle photo" class="new-photo-preview" />
              <div class="photo-management-actions">
                <button 
                  @click="uploadManagementPhoto"
                  class="submit-btn"
                  :disabled="uploadingPhoto"
                >
                  <i v-if="uploadingPhoto" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-upload"></i>
                  {{ uploadingPhoto ? 'Upload en cours...' : 'Uploader la photo' }}
                </button>
                <button 
                  @click="removeManagementPhoto"
                  class="cancel-btn"
                >
                  <i class="fas fa-times"></i> Annuler
                </button>
              </div>
            </div>
            
            <div class="photo-instructions">
              <p><strong>Instructions :</strong></p>
              <ul>
                <li>Formats acceptés : JPEG, PNG, GIF</li>
                <li>Taille maximum : 5 MB</li>
                <li>Dimensions recommandées : 300x300 px</li>
                <li>Aspect ratio carré recommandé</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
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
          <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete?.nom }}</strong> ?</p>
          <p class="warning-text">Cette action est irréversible.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="cancel-btn" @click="showDeleteModal = false">
            Annuler
          </button>
          <button type="button" class="submit-btn delete-btn" @click="deleteUser" :disabled="loading">
            <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
            {{ loading ? 'Suppression...' : 'Supprimer' }}
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
import defaultProfileImage from '../assets/img/default-profile.jpg';

export default {
  name: 'UtilisateursView',
  data() {
    return {
      activeTab: 'liste',
      users: [],
      loading: false,
      uploadingPhoto: false,
      searchQuery: '',
      filterRole: '',
      showDeleteModal: false,
      showPhotoModal: false,
      showPhotoManagementModal: false,
      userToDelete: null,
      editingUser: null,
      selectedUser: null,
      photoManagementUser: null,
      formData: {
        nom: '',
        email: '',
        motDePasse: '',
        role: '',
        specialite: '',
        biographie: ''
      },
      photoManagementFile: null,
      photoManagementPreview: null,
      managementPhotoError: false,
      photoError: false,
      defaultPhoto: defaultProfileImage,
      formError: '',
      toast: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fa-check'
      }
    };
  },
  computed: {
    filteredUsers() {
      let filtered = this.users;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(user => 
          user.nom.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query) ||
          (user.specialite && user.specialite.toLowerCase().includes(query))
        );
      }

      if (this.filterRole) {
        filtered = filtered.filter(user => user.role === this.filterRole);
      }

      return filtered;
    },
    adminCount() {
      return this.users.filter(u => u.role === 'ADMIN').length;
    },
    scenaristeCount() {
      return this.users.filter(u => u.role === 'SCENARISTE').length;
    },
    realisateurCount() {
      return this.users.filter(u => u.role === 'REALISATEUR').length;
    },
    tabIndicatorStyle() {
      const tabs = ['liste', 'ajout'];
      const index = tabs.indexOf(this.activeTab);
      return {
        width: `${100 / tabs.length}%`,
        transform: `translateX(${index * 100}%)`
      };
    },
    selectedUserPhoto() {
      if (!this.selectedUser) return '';
      if (this.selectedUser.profilePhotoPath) {
        return `/api/profil/photo/${this.selectedUser.profilePhotoPath}`;
      }
      return '';
    },
    selectedUserName() {
      return this.selectedUser ? this.selectedUser.nom : '';
    },
    selectedUserEmail() {
      return this.selectedUser ? this.selectedUser.email : '';
    },
    selectedUserRole() {
      return this.selectedUser ? this.selectedUser.role : '';
    }
  },
  async mounted() {
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        this.loading = true;
        const response = await axios.get('/api/utilisateurs');
        this.users = response.data;
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        this.showToast('Erreur lors du chargement des utilisateurs', 'error');
      } finally {
        this.loading = false;
      }
    },

    getUserAvatar(user) {
      if (user && user.profilePhotoPath) {
        return `/api/profil/photo/${user.profilePhotoPath}`;
      }
      return '';
    },

    handleAvatarError(event) {
      event.target.style.display = 'none';
      const parent = event.target.parentElement;
      if (parent) {
        parent.querySelector('.avatar-placeholder').style.display = 'flex';
      }
    },

    handleLargePhotoError(event) {
      this.photoError = true;
      event.target.style.display = 'none';
    },

    handleManagementPhotoError(event) {
      this.managementPhotoError = true;
      event.target.style.display = 'none';
    },

    getRoleClass(role) {
      const roleClasses = {
        'ADMIN': 'status-admin',
        'SCENARISTE': 'status-scenariste',
        'REALISATEUR': 'status-realisateur'
      };
      return roleClasses[role] || 'status-planifie';
    },

    getRoleLabel(role) {
      const roleLabels = {
        'ADMIN': 'Administrateur',
        'SCENARISTE': 'Scénariste',
        'REALISATEUR': 'Réalisateur'
      };
      return roleLabels[role] || role;
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    },

    editUser(user) {
      this.activeTab = 'ajout';
      this.editingUser = user;
      this.formData = {
        nom: user.nom,
        email: user.email,
        motDePasse: '',
        role: user.role,
        specialite: user.specialite || '',
        biographie: user.biographie || ''
      };
    },

    showPhotoPopup(user) {
      this.selectedUser = user;
      this.photoError = false;
      this.showPhotoModal = true;
    },

    closePhotoModal() {
      this.showPhotoModal = false;
      this.selectedUser = null;
      this.photoError = false;
    },

    manageUserPhoto(user) {
      this.photoManagementUser = user;
      this.photoManagementFile = null;
      this.photoManagementPreview = null;
      this.managementPhotoError = false;
      this.showPhotoManagementModal = true;
    },

    closePhotoManagementModal() {
      this.showPhotoManagementModal = false;
      this.photoManagementUser = null;
      this.photoManagementFile = null;
      this.photoManagementPreview = null;
      this.managementPhotoError = false;
    },

    confirmDelete(user) {
      this.userToDelete = user;
      this.showDeleteModal = true;
    },

    goToList() {
      this.activeTab = 'liste';
      this.resetForm();
    },

    goToListAndManagePhoto() {
      this.activeTab = 'liste';
      this.resetForm();
      // Ici, on pourrait ajouter un scroll vers l'utilisateur concerné
      // ou ouvrir directement la modal de gestion
      if (this.editingUser) {
        setTimeout(() => {
          this.manageUserPhoto(this.editingUser);
        }, 100);
      }
    },

    resetForm() {
      this.editingUser = null;
      this.formData = {
        nom: '',
        email: '',
        motDePasse: '',
        role: '',
        specialite: '',
        biographie: ''
      };
      this.formError = '';
    },

    handleDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.handleManagementPhotoUpload({ target: { files } });
      }
    },

    handleManagementPhotoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        this.showError('Veuillez sélectionner une image (JPEG, PNG, etc.)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.showError('L\'image ne doit pas dépasser 5MB');
        return;
      }

      this.photoManagementFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoManagementPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeManagementPhoto() {
      this.photoManagementFile = null;
      this.photoManagementPreview = null;
      const fileInput = document.getElementById('photo-management-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    },

    async uploadManagementPhoto() {
      if (!this.photoManagementFile || !this.photoManagementUser) {
        this.showError('Veuillez d\'abord sélectionner une photo');
        return;
      }

      this.uploadingPhoto = true;
      this.formError = '';
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('photo', this.photoManagementFile);

        const response = await axios.post(
          `/api/profil/${this.photoManagementUser.idUtilisateur || this.photoManagementUser.id}/photo`,
          formData, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        // Mettre à jour l'utilisateur dans la liste
        const userIndex = this.users.findIndex(u => 
          u.idUtilisateur === this.photoManagementUser.idUtilisateur || 
          u.id === this.photoManagementUser.id
        );
        
        if (userIndex !== -1) {
          this.users[userIndex].profilePhotoPath = response.data.profilePhotoPath;
        }
        
        this.photoManagementFile = null;
        this.photoManagementPreview = null;
        this.managementPhotoError = false;
        
        this.showToast('Photo de profil mise à jour avec succès', 'success');
        this.closePhotoManagementModal();
        
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        
        if (error.response?.status === 400) {
          this.formError = error.response.data?.message || 'Format d\'image invalide';
          this.showToast(this.formError, 'error');
        } else {
          this.formError = error.response?.data?.message || 'Erreur lors de l\'upload de la photo';
          this.showToast(this.formError, 'error');
        }
      } finally {
        this.uploadingPhoto = false;
      }
    },

    async deleteUserPhotoFromModal() {
      if (!this.selectedUser) {
        this.showError('Aucun utilisateur sélectionné');
        return;
      }

      if (!confirm('Êtes-vous sûr de vouloir supprimer la photo de profil ?')) {
        return;
      }

      this.loading = true;
      this.formError = '';
      
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`/api/profil/${this.selectedUser.idUtilisateur || this.selectedUser.id}/photo`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Mettre à jour l'utilisateur dans la liste
        const userIndex = this.users.findIndex(u => 
          u.idUtilisateur === this.selectedUser.idUtilisateur || 
          u.id === this.selectedUser.id
        );
        
        if (userIndex !== -1) {
          this.users[userIndex].profilePhotoPath = null;
        }
        
        this.selectedUser.profilePhotoPath = null;
        this.photoError = false;
        
        this.showToast('Photo de profil supprimée avec succès', 'success');
        this.closePhotoModal();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.formError = 'Erreur lors de la suppression de la photo';
        this.showToast(this.formError, 'error');
      } finally {
        this.loading = false;
      }
    },

    async submitForm() {
      if (!this.formData.nom.trim()) {
        this.showError('Le nom est requis');
        return;
      }

      if (!this.formData.email.trim()) {
        this.showError('L\'email est requis');
        return;
      }

      if (!this.editingUser && !this.formData.motDePasse) {
        this.showError('Le mot de passe est requis pour un nouvel utilisateur');
        return;
      }

      this.loading = true;
      this.formError = '';

      try {
        if (this.editingUser) {
          // Modification - Ne pas envoyer le mot de passe s'il est vide
          const updateData = { ...this.formData };
          if (!updateData.motDePasse) {
            delete updateData.motDePasse;
          }
          
          await axios.put(`/api/utilisateurs/${this.editingUser.idUtilisateur || this.editingUser.id}`, updateData);
          this.showToast('Utilisateur modifié avec succès', 'success');
        } else {
          // Création
          await axios.post('/api/auth/register', this.formData);
          this.showToast('Utilisateur créé avec succès', 'success');
        }

        await this.loadUsers();
        this.resetForm();
        this.activeTab = 'liste';
      } catch (error) {
        console.error('Erreur soumission formulaire:', error);
        const message = error.response?.data?.message || 'Erreur lors de l\'opération';
        this.formError = message;
        this.showToast(message, 'error');
      } finally {
        this.loading = false;
      }
    },

    async deleteUser() {
      try {
        this.loading = true;
        
        await axios.delete(`/api/utilisateurs/${this.userToDelete.idUtilisateur || this.userToDelete.id}`);
        this.showToast('Utilisateur supprimé avec succès', 'success');
        this.showDeleteModal = false;
        await this.loadUsers();
        
      } catch (error) {
        console.error('Erreur suppression:', error);
        const message = error.response?.data?.message || 'Erreur lors de la suppression';
        this.showToast(message, 'error');
      } finally {
        this.loading = false;
        this.userToDelete = null;
      }
    },

    showError(text) {
      this.formError = text;
      this.showToast(text, 'error');
    },

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

<style scoped>
</style>


