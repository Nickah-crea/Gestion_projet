<template>
  <div class="app-wrapper-global-crea-profile">
    <!-- Sidebar latérale -->
    <div class="creation-sidebar-crea-profile">
      <div class="sidebar-header-crea-profile">
        <h2 class="sidebar-title-crea-profile">Gestion Profil</h2>
        <p class="sidebar-subtitle-crea-profile">Gérez vos informations personnelles</p>
      </div>

      <!-- Section Actions Rapides -->
      <div class="sidebar-section-crea-profile">
        <h3 class="section-title-crea-profile"><i class="fas fa-bolt"></i> Actions Rapides</h3>
        <div class="sidebar-actions-crea-profile">
          <button 
            @click="scrollToSection('profile')" 
            class="sidebar-btn-crea-profile" 
            :class="{ active: activeSection === 'profile' }"
          >
            <i class="fas fa-user"></i>
            Informations
          </button>
          <button 
            @click="scrollToSection('security')" 
            class="sidebar-btn-crea-profile"
            :class="{ active: activeSection === 'security' }"
          >
            <i class="fas fa-shield-alt"></i>
            Sécurité
          </button>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="sidebar-section-crea-profile">
        <h3 class="section-title-crea-profile"><i class="fas fa-chart-bar"></i> Statistiques</h3>
        <div class="stats-crea-profile">
          <div class="stat-item-crea-profile">
            <span class="stat-number-crea-profile">{{ daysSinceCreation }}</span>
            <span class="stat-label-crea-profile">Jours actif</span>
          </div>
          <div class="stat-item-crea-profile">
            <span class="stat-number-crea-profile">{{ user.role }}</span>
            <span class="stat-label-crea-profile">Rôle</span>
          </div>
        </div>
      </div>

      <!-- Section Informations rapides -->
      <div class="sidebar-section-crea-profile">
        <h3 class="section-title-crea-profile"><i class="fas fa-info-circle"></i> Informations</h3>
        <div class="quick-info-crea-profile">
          <div class="info-item-crea-profile">
            <i class="fas fa-envelope"></i>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-item-crea-profile">
            <i class="fas fa-calendar"></i>
            <span>Créé le {{ formatDateShort(user.creeLe) }}</span>
          </div>
          <div v-if="user.specialite" class="info-item-crea-profile">
            <i class="fas fa-star"></i>
            <span>{{ user.specialite }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-crea-profile">
      <div class="creation-main-content-crea-profile">
        
        <!-- En-tête principal -->
        <div class="main-header-crea-profile">
          <h1 class="page-title-crea-profile"><i class="fas fa-user-circle"></i> Mon Profil</h1>
          <p class="page-subtitle-crea-profile">Gérez vos informations personnelles, votre photo de profil et vos paramètres de sécurité</p>
        </div>

        <!-- Contenu principal -->
        <div class="profile-content-crea-profile">
          
          <!-- Section Profil avec image et informations côte à côte -->
          <div id="profile-section" class="profile-main-section-crea-profile" ref="profileSection">
            <!-- Conteneur pour image et infos -->
            <div class="profile-header-container-crea-profile">
              <!-- Photo de profil à gauche -->
              <div class="profile-photo-section-crea-profile">
                <div class="photo-wrapper-large-crea-profile">
                  <img 
                    :src="profilePhotoUrl" 
                    alt="Photo de profil" 
                    class="profile-photo-large-crea-profile"
                    @error="handleImageError"
                  >
                  <div class="photo-overlay-large-crea-profile">
                    <label for="photo-upload" class="upload-label-large-crea-profile">
                      <i class="fas fa-camera"></i>
                      <span>Changer la photo</span>
                    </label>
                    <input 
                      type="file" 
                      id="photo-upload" 
                      accept="image/*" 
                      @change="handlePhotoUpload"
                      hidden
                    >
                  </div>
                </div>
                
                <!-- Boutons d'action pour la photo -->
                <div v-if="previewPhoto" class="photo-actions-crea-profile">
                  <button 
                    @click="uploadPhoto"
                    class="upload-confirm-btn-crea-profile"
                    :disabled="loading"
                  >
                    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-upload"></i>
                    {{ loading ? 'Upload en cours...' : 'Uploader la photo' }}
                  </button>
                  
                  <button 
                    @click="removeSelectedPhoto"
                    class="cancel-photo-btn-crea-profile"
                  >
                    <i class="fas fa-times"></i> Annuler
                  </button>
                </div>
                
                <div v-if="!previewPhoto && hasProfilePhoto" class="photo-delete-action-crea-profile">
                  <button 
                    @click="deletePhoto"
                    class="delete-photo-btn-crea-profile"
                  >
                    <i class="fas fa-trash"></i> Supprimer la photo
                  </button>
                </div>
                
                <!-- Informations techniques -->
                <div class="photo-info-crea-profile">
                  <p><strong>Formats acceptés :</strong> JPEG, PNG, GIF</p>
                  <p><strong>Taille maximum :</strong> 5 MB</p>
                  <p><strong>Dimensions recommandées :</strong> 300x300 px</p>
                </div>
              </div>

              <!-- Informations personnelles à droite -->
              <div class="profile-info-section-crea-profile">
                <div class="section-header-crea-profile">
                  <h3><i class="fas fa-user"></i> Informations personnelles</h3>
                  <button 
                    v-if="!isEditing" 
                    @click="enableEditing"
                    class="edit-section-btn-crea-profile"
                  >
                    <i class="fas fa-edit"></i> Modifier
                  </button>
                  <div v-else class="edit-actions-crea-profile">
                    <button @click="saveChanges" class="save-section-btn-crea-profile" :disabled="loading">
                      <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-save"></i>
                      Enregistrer
                    </button>
                    <button @click="cancelEditing" class="cancel-section-btn-crea-profile">
                      <i class="fas fa-times"></i> Annuler
                    </button>
                  </div>
                </div>
                
                <div class="profile-form-crea-profile">
                  <div class="form-grid-crea-profile">
                    <div class="form-group-crea-profile">
                      <label for="nom">Nom complet *</label>
                      <input 
                        type="text" 
                        id="nom" 
                        v-model="formData.nom"
                        :disabled="!isEditing"
                        placeholder="Votre nom complet"
                        class="form-input-crea-profile"
                      >
                    </div>

                    <div class="form-group-crea-profile">
                      <label for="email">Email *</label>
                      <input 
                        type="email" 
                        id="email" 
                        v-model="formData.email"
                        :disabled="!isEditing"
                        placeholder="votre@email.com"
                        class="form-input-crea-profile"
                      >
                    </div>

                    <div class="form-group-crea-profile">
                      <label for="role">Rôle</label>
                      <input 
                        type="text" 
                        id="role" 
                        v-model="formData.role"
                        disabled
                        class="form-input-crea-profile"
                      >
                    </div>

                    <!-- Champs spécifiques selon le rôle -->
                    <div v-if="user.role === 'SCENARISTE' || user.role === 'REALISATEUR'" class="form-group-crea-profile">
                      <label for="specialite">Spécialité</label>
                      <input 
                        type="text" 
                        id="specialite" 
                        v-model="formData.specialite"
                        :disabled="!isEditing"
                        placeholder="Votre spécialité"
                        class="form-input-crea-profile"
                      >
                    </div>

                    <div v-if="user.role === 'SCENARISTE' || user.role === 'REALISATEUR'" class="form-group-crea-profile full-width">
                      <label for="biographie">Biographie</label>
                      <textarea 
                        id="biographie" 
                        v-model="formData.biographie"
                        :disabled="!isEditing"
                        rows="5"
                        placeholder="Décrivez votre parcours et expérience..."
                        class="form-textarea-crea-profile"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Sécurité (Mot de passe) -->
          <div id="security-section" class="profile-section-crea-profile" ref="securitySection">
            <div class="section-header-crea-profile">
              <h3><i class="fas fa-shield-alt"></i> Sécurité</h3>
              <button 
                v-if="!isEditingPassword" 
                @click="enablePasswordEditing"
                class="edit-section-btn-crea-profile"
              >
                <i class="fas fa-edit"></i> Changer mot de passe
              </button>
              <div v-else class="edit-actions-crea-profile">
                <button @click="savePassword" class="save-section-btn-crea-profile" :disabled="loading">
                  <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-save"></i>
                  Enregistrer
                </button>
                <button @click="cancelPasswordEditing" class="cancel-section-btn-crea-profile">
                  <i class="fas fa-times"></i> Annuler
                </button>
              </div>
            </div>
            
            <div v-if="isEditingPassword" class="password-form-crea-profile">
              <div class="form-grid-crea-profile">
                <div class="form-group-crea-profile">
                  <label for="currentPassword">Mot de passe actuel *</label>
                  <input 
                    type="password" 
                    id="currentPassword" 
                    v-model="passwordData.currentPassword"
                    placeholder="Votre mot de passe actuel"
                    class="form-input-crea-profile"
                  >
                </div>
                <div class="form-group-crea-profile">
                  <label for="newPassword">Nouveau mot de passe *</label>
                  <input 
                    type="password" 
                    id="newPassword" 
                    v-model="passwordData.newPassword"
                    placeholder="Nouveau mot de passe"
                    class="form-input-crea-profile"
                  >
                </div>
                <div class="form-group-crea-profile">
                  <label for="confirmPassword">Confirmer le mot de passe *</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    v-model="passwordData.confirmPassword"
                    placeholder="Confirmer le nouveau mot de passe"
                    class="form-input-crea-profile"
                  >
                </div>
              </div>
              <div class="password-requirements-crea-profile">
                <p><strong>Exigences de sécurité :</strong></p>
                <ul>
                  <li>Minimum 8 caractères</li>
                  <li>Au moins une lettre majuscule</li>
                  <li>Au moins un chiffre</li>
                  <li>Au moins un caractère spécial</li>
                </ul>
              </div>
            </div>
            <div v-else class="security-info-crea-profile">
              <p><i class="fas fa-info-circle"></i> Pour changer votre mot de passe, cliquez sur "Changer mot de passe"</p>
            </div>
          </div>

          <!-- Section Dates -->
          <div class="profile-section-crea-profile dates-section-crea-profile">
            <h3><i class="fas fa-history"></i> Historique</h3>
            <div class="dates-grid-crea-profile">
              <div class="date-item-crea-profile">
                <i class="fas fa-calendar-plus"></i>
                <div>
                  <p class="date-label-crea-profile">Compte créé le</p>
                  <p class="date-value-crea-profile">{{ formatDate(user.creeLe) }}</p>
                </div>
              </div>
              <div class="date-item-crea-profile">
                <i class="fas fa-calendar-check"></i>
                <div>
                  <p class="date-label-crea-profile">Dernière modification</p>
                  <p class="date-value-crea-profile">{{ formatDate(user.modifieLe) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages d'erreur/succès -->
    <div v-if="message" :class="['message-crea-profile', message.type]" @click="clearMessage">
      <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ message.text }}
      <button class="message-close-crea-profile">
        <i class="fas fa-times"></i>
      </button>
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
      activeSection: 'profile',
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
      message: null,
      defaultPhoto: defaultProfileImage,
      imageError: false,
      currentPhotoFile: null,
      previewPhoto: null
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
    }
  },
  mounted() {
    this.loadUserProfile();
    this.setupScrollSpy();
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

    setupScrollSpy() {
      window.addEventListener('scroll', this.handleScroll);
    },

    handleScroll() {
      const sections = ['profile', 'security'];
      for (const section of sections) {
        const element = this.$refs[`${section}Section`];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            this.activeSection = section;
            break;
          }
        }
      }
    },

    scrollToSection(section) {
      this.activeSection = section;
      const element = this.$refs[`${section}Section`];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
      this.clearMessage();
      
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
        this.showSuccess('Profil mis à jour avec succès');
        
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        
        if (error.response?.status === 409) {
          this.showError('Cet email est déjà utilisé');
        } else if (error.response?.status === 400) {
          this.showError(error.response.data?.message || 'Données invalides');
        } else {
          this.showError(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
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
      this.clearMessage();
      
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
        
        this.showSuccess('Mot de passe changé avec succès');
        
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        
        if (error.response?.status === 400) {
          this.showError('Mot de passe actuel incorrect');
        } else {
          this.showError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
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
      this.clearMessage();
      
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
        
        this.showSuccess('Photo de profil mise à jour avec succès');
        
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        
        if (error.response?.status === 400) {
          this.showError(error.response.data?.message || 'Format d\'image invalide');
        } else {
          this.showError(error.response?.data?.message || 'Erreur lors de l\'upload de la photo');
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
      this.clearMessage();
      
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

        this.showSuccess('Photo de profil supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.showError('Erreur lors de la suppression de la photo');
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

    showSuccess(text) {
      this.message = { type: 'success', text };
      setTimeout(() => this.clearMessage(), 5000);
    },

    showError(text) {
      this.message = { type: 'error', text };
      setTimeout(() => this.clearMessage(), 5000);
    },

    clearMessage() {
      this.message = null;
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>


