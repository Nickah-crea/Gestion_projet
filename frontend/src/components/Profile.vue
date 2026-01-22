<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale fixe à gauche -->
    <aside class="profile-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Mon Profil</h2>
        <p class="sidebar-subtitle">Gestion personnelle</p>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-user-circle"></i> Navigation
        </h3>
        <div class="sidebar-actions">
          <button 
            class="sidebar-btn" 
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            <i class="fas fa-user"></i>
            Profil
          </button>
          <button 
            class="sidebar-btn" 
            :class="{ active: activeTab === 'security' }"
            @click="activeTab = 'security'"
          >
            <i class="fas fa-shield-alt"></i>
            Sécurité
          </button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-chart-pie"></i> Statistiques
        </h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">{{ daysSinceCreation }}</span>
            <span class="stat-label">Jours actif</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ getRoleLabel(user.role) }}</span>
            <span class="stat-label">Rôle</span>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="section-title">
          <i class="fas fa-info-circle"></i> Informations
        </h3>
        <div class="quick-info">
          <div class="info-item">
            <i class="fas fa-envelope"></i>
            <span>{{ user.email || 'Non défini' }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar"></i>
            <span>Créé le {{ formatDateShort(user.creeLe) }}</span>
          </div>
          <div v-if="user.specialite" class="info-item">
            <i class="fas fa-star"></i>
            <span>{{ user.specialite }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Contenu principal à droite -->
    <div class="profile-body">
      <main class="profile-main-content">
        <!-- Système d'onglets -->
        <div class="tabs-container">
          <div class="tabs-header">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'profile' }"
              @click="activeTab = 'profile'"
            >
              <i class="fas fa-user"></i>
              Profil
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'security' }"
              @click="activeTab = 'security'"
            >
              <i class="fas fa-shield-alt"></i>
              Sécurité
            </button>
            <div class="tab-indicator" :style="tabIndicatorStyle"></div>
          </div>

          <div class="tabs-content">
            <!-- Onglet 1: Profil complet (photo + infos) -->
            <div v-if="activeTab === 'profile'" class="tab-pane">
              <div class="profile-main-section">
                <!-- Conteneur pour image et infos côte à côte -->
                <div class="profile-header-container">
                  <!-- Photo de profil à gauche -->
                  <div class="profile-photo-section">
                    <div class="photo-wrapper">
                      <img 
                        :src="profilePhotoUrl" 
                        alt="Photo de profil" 
                        class="profile-photo"
                        @error="handleImageError"
                      />
                      <div class="photo-overlay">
                        <label for="photo-upload" class="upload-label">
                          <i class="fas fa-camera"></i>
                          <span>Changer la photo</span>
                        </label>
                        <input 
                          type="file" 
                          id="photo-upload" 
                          accept="image/*" 
                          @change="handlePhotoUpload"
                          hidden
                        />
                      </div>
                    </div>
                    
                    <!-- Boutons d'action pour la photo -->
                    <div v-if="previewPhoto" class="photo-actions">
                      <button 
                        @click="uploadPhoto"
                        class="submit-btn"
                        :disabled="loading"
                      >
                        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-upload"></i>
                        {{ loading ? 'Upload en cours...' : 'Uploader la photo' }}
                      </button>
                      
                      <button 
                        @click="removeSelectedPhoto"
                        class="cancel-btn"
                      >
                        <i class="fas fa-times"></i> Annuler
                      </button>
                    </div>
                    
                    <div v-if="!previewPhoto && hasProfilePhoto" class="photo-delete-action">
                      <button 
                        @click="deletePhoto"
                        class="cancel-btn delete-btn"
                      >
                        <i class="fas fa-trash"></i> Supprimer la photo
                      </button>
                    </div>
                    
                    <!-- Informations techniques -->
                    <div class="photo-info">
                      <h4><i class="fas fa-info-circle"></i> Instructions</h4>
                      <ul>
                        <li><strong>Formats acceptés :</strong> JPEG, PNG, GIF</li>
                        <li><strong>Taille maximum :</strong> 5 MB</li>
                        <li><strong>Dimensions recommandées :</strong> 300x300 px</li>
                        <li><strong>Aspect ratio :</strong> Carré (1:1) recommandé</li>
                      </ul>
                    </div>
                  </div>

                  <!-- Informations personnelles à droite -->
                  <div class="profile-info-section">
                    <div class="section-header">
                      <h3><i class="fas fa-user-edit"></i> Informations personnelles</h3>
                      <button 
                        v-if="!isEditing" 
                        @click="enableEditing"
                        class="edit-btn"
                      >
                        <i class="fas fa-edit"></i> Modifier
                      </button>
                      <div v-else class="edit-actions">
                        <button @click="saveChanges" class="submit-btn" :disabled="loading">
                          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                          <i v-else class="fas fa-save"></i>
                          Enregistrer
                        </button>
                        <button @click="cancelEditing" class="cancel-btn">
                          <i class="fas fa-times"></i> Annuler
                        </button>
                      </div>
                    </div>
                    
                    <form @submit.prevent="saveChanges" class="profile-form">
                      <div class="form-grid">
                        <div class="form-group">
                          <label for="nom">Nom complet *</label>
                          <input 
                            type="text" 
                            id="nom" 
                            v-model="formData.nom"
                            :disabled="!isEditing"
                            placeholder="Votre nom complet"
                            class="form-input"
                          />
                        </div>

                        <div class="form-group">
                          <label for="email">Email *</label>
                          <input 
                            type="email" 
                            id="email" 
                            v-model="formData.email"
                            :disabled="!isEditing"
                            placeholder="votre@email.com"
                            class="form-input"
                          />
                        </div>

                        <div class="form-group">
                          <label for="role">Rôle</label>
                          <input 
                            type="text" 
                            id="role" 
                            v-model="formData.role"
                            disabled
                            class="form-input"
                          />
                        </div>

                        <!-- Champs spécifiques selon le rôle -->
                        <div v-if="user.role === 'SCENARISTE' || user.role === 'REALISATEUR'" class="form-group">
                          <label for="specialite">Spécialité</label>
                          <input 
                            type="text" 
                            id="specialite" 
                            v-model="formData.specialite"
                            :disabled="!isEditing"
                            placeholder="Votre spécialité"
                            class="form-input"
                          />
                        </div>

                        <div v-if="user.role === 'SCENARISTE' || user.role === 'REALISATEUR'" class="form-group full-width">
                          <label for="biographie">Biographie</label>
                          <textarea 
                            id="biographie" 
                            v-model="formData.biographie"
                            :disabled="!isEditing"
                            rows="5"
                            placeholder="Décrivez votre parcours et expérience..."
                            class="form-textarea"
                          ></textarea>
                        </div>
                      </div>

                      <div v-if="formError" class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ formError }}
                      </div>
                    </form>
                  </div>
                </div>

                <!-- Section Dates -->
                <div class="dates-section">
                  <h3><i class="fas fa-history"></i> Historique</h3>
                  <div class="dates-grid">
                    <div class="date-item">
                      <i class="fas fa-calendar-plus"></i>
                      <div>
                        <p class="date-label">Compte créé le</p>
                        <p class="date-value">{{ formatDate(user.creeLe) }}</p>
                      </div>
                    </div>
                    <div class="date-item">
                      <i class="fas fa-calendar-check"></i>
                      <div>
                        <p class="date-label">Dernière modification</p>
                        <p class="date-value">{{ formatDate(user.modifieLe) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet 2: Sécurité -->
            <div v-if="activeTab === 'security'" class="tab-pane">
              <div class="security-section">
                <div class="section-header">
                  <h3><i class="fas fa-shield-alt"></i> Sécurité</h3>
                  <button 
                    v-if="!isEditingPassword" 
                    @click="enablePasswordEditing"
                    class="edit-btn"
                  >
                    <i class="fas fa-edit"></i>
                    Changer mot de passe
                  </button>
                  <div v-else class="edit-actions">
                    <button @click="savePassword" class="submit-btn" :disabled="loading">
                      <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-save"></i>
                      Enregistrer
                    </button>
                    <button @click="cancelPasswordEditing" class="cancel-btn">
                      <i class="fas fa-times"></i> Annuler
                    </button>
                  </div>
                </div>
                
                <div v-if="isEditingPassword" class="password-form">
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="currentPassword">Mot de passe actuel *</label>
                      <input 
                        type="password" 
                        id="currentPassword" 
                        v-model="passwordData.currentPassword"
                        placeholder="Votre mot de passe actuel"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label for="newPassword">Nouveau mot de passe *</label>
                      <input 
                        type="password" 
                        id="newPassword" 
                        v-model="passwordData.newPassword"
                        placeholder="Nouveau mot de passe"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label for="confirmPassword">Confirmer le mot de passe *</label>
                      <input 
                        type="password" 
                        id="confirmPassword" 
                        v-model="passwordData.confirmPassword"
                        placeholder="Confirmer le nouveau mot de passe"
                        class="form-input"
                      />
                    </div>
                  </div>
                  <div class="password-requirements">
                    <h4><i class="fas fa-exclamation-triangle"></i> Exigences de sécurité :</h4>
                    <ul>
                      <li>Minimum 8 caractères</li>
                      <li>Au moins une lettre majuscule</li>
                      <li>Au moins un chiffre</li>
                      <li>Au moins un caractère spécial (!@#$%^&*)</li>
                      <li>Ne doit pas être trop similaire à vos informations personnelles</li>
                    </ul>
                  </div>

                  <div v-if="formError" class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ formError }}
                  </div>
                </div>
                <div v-else class="security-info">
                  <div class="info-card">
                    <i class="fas fa-info-circle"></i>
                    <p>Pour changer votre mot de passe, cliquez sur "Changer mot de passe"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
  name: 'ProfilePage',
  data() {
    return {
      activeTab: 'profile',
      user: {
        id: null,
        nom: '',
        email: '',
        role: '',
        specialite: '',
        biographie: '',
        profilePhotoPath: null,
        creeLe: null,
        modifieLe: null
      },
      isEditing: false,
      isEditingPassword: false,
      loading: false,
      formData: {
        nom: '',
        email: '',
        role: '',
        specialite: '',
        biographie: ''
      },
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      formError: '',
      defaultPhoto: defaultProfileImage,
      imageError: false,
      currentPhotoFile: null,
      previewPhoto: null,
      toast: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fa-check'
      }
    };
  },
  computed: {
    profilePhotoUrl() {
      if (this.previewPhoto) {
        return this.previewPhoto;
      }
      
      if (this.imageError) {
        return this.defaultPhoto;
      }
      
      if (this.user.profilePhotoPath) {
        return `/api/profil/photo/${this.user.profilePhotoPath}`;
      }
      
      return this.defaultPhoto;
    },

    hasProfilePhoto() {
      return this.user.profilePhotoPath !== null && !this.imageError;
    },

    daysSinceCreation() {
      if (!this.user.creeLe) return 'N/A';
      const created = new Date(this.user.creeLe);
      const now = new Date();
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },

    tabIndicatorStyle() {
      const tabs = ['profile', 'security'];
      const index = tabs.indexOf(this.activeTab);
      return {
        width: `${100 / tabs.length}%`,
        transform: `translateX(${index * 100}%)`
      };
    }
  },
  mounted() {
    this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      this.loading = true;
      this.clearMessage();
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!userData) {
          this.showError('Utilisateur non connecté');
          this.$router.push('/login');
          return;
        }
        
        const user = JSON.parse(userData);
        const userId = user.id;
        
        const response = await axios.get(`/api/profil/${userId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        this.user = response.data;
        this.resetFormData();
        this.imageError = false;
        this.previewPhoto = null;
        this.currentPhotoFile = null;
        
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        
        if (error.response?.status === 401) {
          this.showError('Session expirée. Veuillez vous reconnecter');
          this.$router.push('/login');
        } else {
          this.showError(error.response?.data?.message || 'Impossible de charger le profil');
        }
      } finally {
        this.loading = false;
      }
    },

    resetFormData() {
      this.formData = {
        nom: this.user.nom || '',
        email: this.user.email || '',
        role: this.user.role || '',
        specialite: this.user.specialite || '',
        biographie: this.user.biographie || ''
      };
    },

    getRoleLabel(role) {
      const roleLabels = {
        'ADMIN': 'Administrateur',
        'SCENARISTE': 'Scénariste',
        'REALISATEUR': 'Réalisateur'
      };
      return roleLabels[role] || role;
    },

    enableEditing() {
      this.isEditing = true;
      this.clearMessage();
    },

    enablePasswordEditing() {
      this.isEditingPassword = true;
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.clearMessage();
    },

    cancelEditing() {
      this.isEditing = false;
      this.resetFormData();
      this.clearMessage();
    },

    cancelPasswordEditing() {
      this.isEditingPassword = false;
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.clearMessage();
    },

    async saveChanges() {
      if (!this.formData.nom.trim()) {
        this.showError('Le nom est requis');
        return;
      }

      if (!this.formData.email.trim()) {
        this.showError('L\'email est requis');
        return;
      }

      this.loading = true;
      this.formError = '';
      
      try {
        const token = localStorage.getItem('token');
        
        const updateData = {
          nom: this.formData.nom,
          email: this.formData.email,
          specialite: this.formData.specialite,
          biographie: this.formData.biographie
        };

        const response = await axios.put(
          `/api/profil/${this.user.id}`, 
          updateData, 
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.user = response.data;
        
        const updatedUser = { 
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          nom: this.user.nom,
          email: this.user.email,
          role: this.user.role,
          profilePhotoPath: this.user.profilePhotoPath
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.isEditing = false;
        this.showToast('Profil mis à jour avec succès', 'success');
        
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        
        if (error.response?.status === 409) {
          this.formError = 'Cet email est déjà utilisé';
          this.showToast('Cet email est déjà utilisé', 'error');
        } else if (error.response?.status === 400) {
          this.formError = error.response.data?.message || 'Données invalides';
          this.showToast(this.formError, 'error');
        } else {
          this.formError = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
          this.showToast(this.formError, 'error');
        }
      } finally {
        this.loading = false;
      }
    },

    async savePassword() {
      if (!this.passwordData.currentPassword) {
        this.showError('Veuillez entrer votre mot de passe actuel');
        return;
      }

      if (!this.passwordData.newPassword) {
        this.showError('Veuillez entrer un nouveau mot de passe');
        return;
      }

      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.showError('Les mots de passe ne correspondent pas');
        return;
      }

      this.loading = true;
      this.formError = '';
      
      try {
        const token = localStorage.getItem('token');
        
        const passwordData = {
          currentPassword: this.passwordData.currentPassword,
          newPassword: this.passwordData.newPassword
        };

        await axios.put(
          `/api/profil/${this.user.id}/password`, 
          passwordData, 
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.isEditingPassword = false;
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        this.showToast('Mot de passe changé avec succès', 'success');
        
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        
        if (error.response?.status === 400) {
          this.formError = 'Mot de passe actuel incorrect';
          this.showToast('Mot de passe actuel incorrect', 'error');
        } else {
          this.formError = error.response?.data?.message || 'Erreur lors du changement de mot de passe';
          this.showToast(this.formError, 'error');
        }
      } finally {
        this.loading = false;
      }
    },

    async uploadPhoto() {
      if (!this.currentPhotoFile) {
        this.showError('Veuillez d\'abord sélectionner une photo');
        return;
      }
      
      this.loading = true;
      this.formError = '';
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('photo', this.currentPhotoFile);

        const response = await axios.post(
          `/api/profil/${this.user.id}/photo`,
          formData, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        this.user.profilePhotoPath = response.data.profilePhotoPath;
        this.imageError = false;
        
        const updatedUser = { 
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          profilePhotoPath: this.user.profilePhotoPath
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.previewPhoto = null;
        this.currentPhotoFile = null;
        this.imageError = false;
        
        this.showToast('Photo de profil mise à jour avec succès', 'success');
        
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
        this.loading = false;
      }
    },

    handlePhotoUpload(event) {
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

      this.currentPhotoFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewPhoto = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    async deletePhoto() {
      if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
        return;
      }

      this.loading = true;
      this.formError = '';
      
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`/api/profil/${this.user.id}/photo`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        this.user.profilePhotoPath = null;
        this.imageError = false;
        this.previewPhoto = null;
        this.currentPhotoFile = null;
        
        const updatedUser = { 
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          profilePhotoPath: null
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.showToast('Photo de profil supprimée avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.formError = 'Erreur lors de la suppression de la photo';
        this.showToast(this.formError, 'error');
      } finally {
        this.loading = false;
      }
    },

    removeSelectedPhoto() {
      this.previewPhoto = null;
      this.currentPhotoFile = null;
      const fileInput = document.getElementById('photo-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    },

    handleImageError(event) {
      console.log('Erreur de chargement de l\'image, utilisation de l\'image par défaut');
      this.imageError = true;
      event.target.src = this.defaultPhoto;
      event.target.onerror = null;
    },

    formatDate(dateString) {
      if (!dateString) return 'Non disponible';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return 'Date invalide';
      }
    },

    formatDateShort(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (e) {
        return 'Date invalide';
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

