<template>
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
            <th>Spécialité</th>
            <th>Date création</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.idUtilisateur || user.id">
            <td>{{ user.idUtilisateur || user.id }}</td>
            <td class="user-name">
              <div class="avatar">
                <i class="fas fa-user"></i>
              </div>
              {{ user.nom }}
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="getRoleClass(user.role)">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td>{{ user.specialite || '-' }}</td>
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

<style scoped>
.utilisateurs-container {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.utilisateurs-header {
  margin-bottom: 30px;
  text-align: center;
}

.utilisateurs-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.utilisateurs-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.btn-add {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.search-bar {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.utilisateurs-table {
  width: 100%;
  border-collapse: collapse;
}

.utilisateurs-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.utilisateurs-table td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.role-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: #ffeaa7;
  color: #e17055;
}

.role-scenariste {
  background: #a29bfe;
  color: white;
}

.role-realisateur {
  background: #74b9ff;
  color: white;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #74b9ff;
  color: white;
}

.btn-edit:hover {
  background: #0984e3;
}

.btn-delete {
  background: #ff7675;
  color: white;
}

.btn-delete:hover {
  background: #d63031;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.delete-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #7f8c8d;
}

.user-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.hint {
  font-weight: normal;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-cancel, .btn-submit, .btn-delete-confirm {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-delete-confirm {
  background: #e74c3c;
  color: white;
}

.btn-delete-confirm:hover:not(:disabled) {
  background: #c0392b;
}

.btn-submit:disabled, .btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 20px;
}

.warning-text {
  color: #e74c3c;
  font-weight: 600;
}

/* Toast */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: #27ae60;
}

.toast.error {
  background: #e74c3c;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .utilisateurs-container {
    padding: 15px;
  }
  
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    width: 100%;
  }
  
  .utilisateurs-table {
    font-size: 14px;
  }
  
  .utilisateurs-table th,
  .utilisateurs-table td {
    padding: 12px 8px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
