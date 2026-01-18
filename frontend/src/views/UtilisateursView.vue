<template>
  <div class="app-wrapper-global">
  <div class="utilisateurs-container">
    <!-- Header -->
    <div class="utilisateurs-header">
      <h1>Gestion des Utilisateurs</h1>
      <p>Administrez les comptes administrateurs, scénaristes et réalisateurs</p>
    </div>

    <!-- Bouton d'ajout -->
    <div class="actions-bar">
      <button class="btn-add" @click="showAddModal = true">
        <i class="fas fa-plus"></i>
        Ajouter un utilisateur
      </button>
      
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Rechercher un utilisateur..."
          class="search-input"
        >
        <i class="fas fa-search search-icon"></i>
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="table-container">
      <table class="utilisateurs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Date création</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.idUtilisateur || user.id">
            <td>{{ user.idUtilisateur || user.id }}</td>
          <td class="user-name">
              <div class="avatar">
                <img 
                  :src="getUserAvatar(user)" 
                  :alt="user.nom"
                  @error="handleAvatarError"
                >
              </div>
              {{ user.nom }}
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="getRoleClass(user.role)">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td>{{ formatDate(user.creeLe) }}</td>
            <td class="actions">
              <button class="btn-edit" @click="editUser(user)" title="Modifier">
                <i class="fas fa-marker"></i>
              </button>
              <button class="btn-delete" @click="confirmDelete(user)" title="Supprimer">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="filteredUsers.length === 0" class="no-data">
        <i class="fas fa-users"></i>
        <p>Aucun utilisateur trouvé</p>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showAddModal ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur' }}</h2>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm" class="user-form">
          <div class="form-group">
            <label for="nom">Nom complet *</label>
            <input 
              type="text" 
              id="nom"
              v-model="formData.nom" 
              required 
              placeholder="Entrez le nom complet"
            >
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input 
              type="email" 
              id="email"
              v-model="formData.email" 
              required 
              placeholder="Entrez l'email"
            >
          </div>

          <div class="form-group">
            <label for="password">
              Mot de passe {{ showAddModal ? '*' : '' }}
              <span v-if="!showAddModal" class="hint">(Laisser vide pour ne pas modifier)</span>
            </label>
            <input 
              type="password" 
              id="password"
              v-model="formData.motDePasse" 
              :required="showAddModal"
              placeholder="Entrez le mot de passe"
            >
          </div>

          <div class="form-group">
            <label for="role">Rôle *</label>
            <select id="role" v-model="formData.role" required>
              <option value="" disabled>Sélectionnez un rôle</option>
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
            >
          </div>

          <div v-if="formData.role === 'SCENARISTE' || formData.role === 'REALISATEUR'" class="form-group">
            <label for="biographie">Biographie</label>
            <textarea 
              id="biographie"
              v-model="formData.biographie" 
              placeholder="Entrez la biographie"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Annuler
            </button>
            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                {{ showAddModal ? 'Création...' : 'Modification...' }}
              </span>
              <span v-else>
                {{ showAddModal ? 'Créer' : 'Modifier' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2>Confirmer la suppression</h2>
        </div>
        <div class="modal-body">
          <i class="fas fa-exclamation-triangle warning-icon"></i>
          <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete?.nom }}</strong> ?</p>
          <p class="warning-text">Cette action est irréversible.</p>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="showDeleteModal = false">
            Annuler
          </button>
          <button type="button" class="btn-delete-confirm" @click="deleteUser" :disabled="loading">
            <span v-if="loading" class="loading">
              <i class="fas fa-spinner fa-spin"></i>
              Suppression...
            </span>
            <span v-else>
              Supprimer
            </span>
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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UtilisateursView',
  data() {
    return {
      users: [],
      loading: false,
      searchQuery: '',
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      userToDelete: null,
      formData: {
        nom: '',
        email: '',
        motDePasse: '',
        role: '',
        specialite: '',
        biographie: ''
      },
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
      if (!this.searchQuery) {
        return this.users;
      }
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user => 
        user.nom.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        (user.specialite && user.specialite.toLowerCase().includes(query))
      );
    }
  },
  async mounted() {
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        this.loading = true;
        // Charger tous les utilisateurs
        const response = await axios.get('/api/utilisateurs');
        this.users = response.data;
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        this.showToast('Erreur lors du chargement des utilisateurs', 'error');
      } finally {
        this.loading = false;
      }
    },

    getRoleClass(role) {
      const roleClasses = {
        'ADMIN': 'role-admin',
        'SCENARISTE': 'role-scenariste',
        'REALISATEUR': 'role-realisateur'
      };
      return roleClasses[role] || 'role-default';
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
      this.formData = {
        nom: user.nom,
        email: user.email,
        motDePasse: '',
        role: user.role,
        specialite: user.specialite || '',
        biographie: user.biographie || ''
      };
      this.userToDelete = user;
      this.showEditModal = true;
    },

    confirmDelete(user) {
      this.userToDelete = user;
      this.showDeleteModal = true;
    },

    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.formData = {
        nom: '',
        email: '',
        motDePasse: '',
        role: '',
        specialite: '',
        biographie: ''
      };
      this.userToDelete = null;
    },

      getUserAvatar(user) {
      // Si l'utilisateur a une photo de profil, utilisez l'API
      if (user.profilePhotoPath) {
        return `/api/profil/photo/${user.profilePhotoPath}`;
      }
      
      // Sinon, utilisez l'icône par défaut (vous devrez ajouter l'icon comme background CSS)
      return '';
    },
    
    handleAvatarError(event) {
      // En cas d'erreur de chargement, affichez l'icône par défaut
      event.target.style.display = 'none';
      event.target.parentElement.innerHTML = '<i class="fas fa-user"></i>';
    },
    

    async submitForm() {
      try {
        this.loading = true;
        
        if (this.showAddModal) {
          // Création
          await axios.post('/api/auth/register', this.formData);
          this.showToast('Utilisateur créé avec succès', 'success');
        } else {
          // Modification
          await axios.put(`/api/utilisateurs/${this.userToDelete.idUtilisateur || this.userToDelete.id}`, this.formData);
          this.showToast('Utilisateur modifié avec succès', 'success');
        }
        
        this.closeModal();
        await this.loadUsers();
        
      } catch (error) {
        console.error('Erreur soumission formulaire:', error);
        const message = error.response?.data?.message || 'Erreur lors de l\'opération';
        this.showToast(message, 'error');
      } finally {
        this.loading = false;
      }
    },

    async deleteUser() {
      try {
        this.loading = true;
        
        // Utiliser l'endpoint de suppression approprié selon le rôle
        let endpoint = `/api/utilisateurs/${this.userToDelete.idUtilisateur || this.userToDelete.id}`;
        
        await axios.delete(endpoint);
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
  }
};
</script>
