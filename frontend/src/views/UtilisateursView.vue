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
                      <tr v-for="user in filteredUsers" :key="user.id">
                        <td class="user-photo-cell">
                          <div class="user-photo" @click="viewUserPhoto(user)">
                            <img 
                              v-if="getUserPhotoUrl(user)" 
                              :src="getUserPhotoUrl(user)" 
                              :alt="user.nom"
                              @error="handlePhotoError"
                              class="user-photo-img"
                            />
                            <div v-else class="user-photo-placeholder">
                              {{ getUserInitials(user.nom) }}
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
                            <button class="btn-view" @click="viewUserDetails(user)" title="Voir détails">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-edit delete-btn" @click="confirmDelete(user)" title="Supprimer">
                              <i class="fas fa-trash"></i>
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

            <!-- Onglet 2: Formulaire d'ajout -->
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

              <form @submit.prevent="submitForm" class="user-form" enctype="multipart/form-data">
                <div class="form-group photo-upload-group">
                  <label>Photo de profil</label>
                  <div class="photo-upload-container">
                    <div class="photo-preview">
                      <img 
                        v-if="photoPreview || (editingUser && getUserPhotoUrl(editingUser))" 
                        :src="photoPreview || getUserPhotoUrl(editingUser)" 
                        alt="Photo de profil"
                        @error="handlePreviewError"
                        class="photo-preview-img"
                      />
                      <div v-else class="photo-placeholder">
                        <i class="fas fa-user"></i>
                        <span>Photo non définie</span>
                      </div>
                    </div>
                    <div class="photo-upload-actions">
                      <label for="photo-upload" class="upload-btn">
                        <i class="fas fa-camera"></i>
                        {{ photoFile ? 'Changer la photo' : 'Choisir une photo' }}
                        <input 
                          type="file" 
                          id="photo-upload"
                          ref="photoInput"
                          @change="handlePhotoUpload"
                          accept="image/*"
                          class="hidden-input"
                        />
                      </label>
                      <button 
                        v-if="photoPreview || (editingUser && editingUser.profilePhotoPath)" 
                        type="button" 
                        class="remove-btn"
                        @click="removePhoto"
                      >
                        <i class="fas fa-trash"></i>
                        Supprimer
                      </button>
                    </div>
                    <p class="photo-hint">Formats acceptés : JPG, PNG, GIF (max 2MB)</p>
                  </div>
                </div>

                <div class="form-row">
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
                </div>

                <div class="form-row">
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

                <div v-if="formData.role === 'SCENARISTE' || formData.role === 'REALISATEUR'" class="form-group">
                  <label for="biographie">Biographie</label>
                  <textarea 
                    id="biographie"
                    v-model="formData.biographie" 
                    placeholder="Entrez la biographie"
                    rows="4"
                    class="form-textarea"
                  ></textarea>
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

    <!-- Modal de visualisation de la photo -->
    <div v-if="showPhotoModal" class="modal-overlay" @click="showPhotoModal = false">
      <div class="modal-content photo-modal" @click.stop>
        <div class="modal-header">
          <h2>Photo de {{ selectedUser?.nom }}</h2>
          <button class="modal-close-btn" @click="showPhotoModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body photo-modal-body">
          <div class="photo-full-container">
            <img 
              v-if="selectedUser && getUserPhotoUrl(selectedUser)" 
              :src="getUserPhotoUrl(selectedUser)" 
              :alt="selectedUser.nom"
              class="photo-full-img"
            />
            <div v-else class="photo-full-placeholder">
              <i class="fas fa-user"></i>
              <span>Pas de photo de profil</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="cancel-btn" @click="showPhotoModal = false">
            <i class="fas fa-times"></i>
            Fermer
          </button>
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

export default {
  name: 'UtilisateursView',
  data() {
    return {
      activeTab: 'liste',
      users: [],
      loading: false,
      searchQuery: '',
      filterRole: '',
      showDeleteModal: false,
      showPhotoModal: false,
      userToDelete: null,
      selectedUser: null,
      editingUser: null,
      photoFile: null,
      photoPreview: null,
      formData: {
        nom: '',
        email: '',
        motDePasse: '',
        role: '',
        specialite: '',
        biographie: '',
        currentPassword: '', // Pour la modification (non utilisé en admin)
        newPassword: '' // Pour la modification (alias de motDePasse)
      },
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
    }
  },
  async mounted() {
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        this.loading = true;
        // Charger tous les utilisateurs via l'API de profil
        const response = await axios.get('/api/utilisateurs');
        this.users = response.data;
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        this.showToast('Erreur lors du chargement des utilisateurs', 'error');
      } finally {
        this.loading = false;
      }
    },

    getUserPhotoUrl(user) {
      if (!user) return null;
      
      // Si l'utilisateur a une photo de profil dans la base de données
      if (user.profilePhotoPath) {
        // Retourner l'URL complète de la photo (API du contrôleur ProfilController)
        return `/api/profil/photo/${user.profilePhotoPath}`;
      }
      
      return null;
    },

    getUserInitials(nom) {
      if (!nom) return '??';
      return nom
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },

    handlePhotoError(event) {
      // En cas d'erreur de chargement, remplace par placeholder
      const parent = event.target.parentElement;
      if (parent.classList.contains('user-photo')) {
        const user = this.getUserFromPhoto(parent);
        parent.innerHTML = `<div class="user-photo-placeholder">${this.getUserInitials(user?.nom)}</div>`;
      }
    },

    handlePreviewError(event) {
      // En cas d'erreur de prévisualisation
      event.target.style.display = 'none';
      const parent = event.target.parentElement;
      parent.innerHTML = `
        <div class="photo-placeholder">
          <i class="fas fa-user"></i>
          <span>Photo non disponible</span>
        </div>
      `;
    },

    getUserFromPhoto(element) {
      // Trouver l'utilisateur correspondant à l'élément photo
      const row = element.closest('tr');
      if (!row) return null;
      
      // Trouver l'index de la ligne
      const rowIndex = Array.from(row.parentNode.children).indexOf(row) - 1; // -1 pour l'en-tête
      return this.filteredUsers[rowIndex];
    },

    viewUserPhoto(user) {
      this.selectedUser = user;
      this.showPhotoModal = true;
    },

    viewUserDetails(user) {
      this.selectedUser = user;
      alert(`Détails de ${user.nom}:\nEmail: ${user.email}\nRôle: ${this.getRoleLabel(user.role)}\nCrée le: ${this.formatDate(user.creeLe)}`);
    },

    handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Vérifier la taille (max 5MB comme dans le service)
      if (file.size > 5 * 1024 * 1024) {
        this.formError = 'La photo ne doit pas dépasser 5MB';
        return;
      }

      // Vérifier le type
      if (!file.type.match('image.*')) {
        this.formError = 'Veuillez sélectionner une image valide';
        return;
      }

      this.photoFile = file;
      this.photoPreview = URL.createObjectURL(file);
      this.formError = '';
    },

    removePhoto() {
      this.photoFile = null;
      this.photoPreview = null;
      // Marquer pour suppression si on modifie un utilisateur existant
      if (this.editingUser) {
        this.formData.removePhoto = true;
      }
      if (this.$refs.photoInput) {
        this.$refs.photoInput.value = '';
      }
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
      this.photoFile = null;
      this.photoPreview = null;
      this.formData = {
        nom: user.nom,
        email: user.email,
        motDePasse: '',
        role: user.role,
        specialite: user.specialite || '',
        biographie: user.biographie || '',
        currentPassword: '', // Laissé vide en admin
        newPassword: '' // Laissé vide
      };
    },

    confirmDelete(user) {
      this.userToDelete = user;
      this.showDeleteModal = true;
    },

    goToList() {
      this.activeTab = 'liste';
      this.resetForm();
    },

    resetForm() {
      this.editingUser = null;
      this.photoFile = null;
      this.photoPreview = null;
      this.formData = {
        nom: '',
        email: '',
        motDePasse: '',
        role: '',
        specialite: '',
        biographie: '',
        currentPassword: '',
        newPassword: ''
      };
      this.formError = '';
      if (this.$refs.photoInput) {
        this.$refs.photoInput.value = '';
      }
    },

    async submitForm() {
      this.loading = true;
      this.formError = '';

      try {
        if (this.editingUser) {
          // MODIFICATION avec ProfilController
          await this.updateUser();
        } else {
          // CRÉATION (vous aurez besoin d'un endpoint de création admin)
          await this.createUser();
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

    async updateUser() {
      const userId = this.editingUser.id;
      
      // 1. Mise à jour des données de base (sans photo)
      const updateData = {
        nom: this.formData.nom,
        email: this.formData.email,
        specialite: this.formData.specialite,
        biographie: this.formData.biographie
      };

      // Ajouter le mot de passe seulement si fourni
      if (this.formData.motDePasse) {
        updateData.newPassword = this.formData.motDePasse;
        // En admin, on ne demande pas le currentPassword
        updateData.currentPassword = ''; 
      }

      await axios.put(`/api/profil/${userId}`, updateData);

      // 2. Upload de la photo si sélectionnée
      if (this.photoFile) {
        const photoFormData = new FormData();
        photoFormData.append('photo', this.photoFile);
        
        await axios.put(`/api/profil/${userId}/photo`, photoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      // 3. Suppression de la photo si demandée
      if (this.formData.removePhoto && !this.photoFile) {
        await axios.delete(`/api/profil/${userId}/photo`);
      }

      this.showToast('Utilisateur modifié avec succès', 'success');
    },

    
    async createUser() {
      // Création via l'endpoint d'inscription admin
      const userData = {
        nom: this.formData.nom,
        email: this.formData.email,
        motDePasse: this.formData.motDePasse,
        role: this.formData.role,
        specialite: this.formData.specialite,
        biographie: this.formData.biographie
      };

      // Utiliser l'endpoint d'inscription (à adapter selon votre API)
      const response = await axios.post('/api/auth/register/admin', userData);
      const newUserId = response.data.id;

      // Upload de la photo si sélectionnée
      if (this.photoFile) {
        const photoFormData = new FormData();
        photoFormData.append('photo', this.photoFile);
        
        await axios.post(`/api/profil/${newUserId}/photo`, photoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      this.showToast('Utilisateur créé avec succès', 'success');
    },

    async deleteUser() {
      try {
        this.loading = true;
        
        // Supprimer via l'API utilisateurs
        await axios.delete(`/api/utilisateurs/${this.userToDelete.id}`);
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

    showToast(message, type = 'success') {
      this.toast = {
        show: true,
        message,
        type,
        icon: type === 'success' ? 'fa-check' : 'fa-exclamation-circle'
      };
      
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    }
  },
  beforeUnmount() {
    // Nettoyer les URL d'objets blob pour éviter les fuites mémoire
    if (this.photoPreview) {
      URL.revokeObjectURL(this.photoPreview);
    }
  }
};
</script>

<style scoped>
</style>

