<template>
  <div class="app-wrapper">
    <div class="utilisateurs-container">
      <h1>Liste des Utilisateurs</h1>
      
      <!-- Boutons d'action -->
      <div class="actions-bar">
        <button @click="showCreateForm = true" class="btn btn-primary">
          + Ajouter un Utilisateur
        </button>
        <button @click="fetchUtilisateurs" class="btn btn-secondary">
          🔄 Actualiser
        </button>
      </div>

      <!-- Tableau des utilisateurs -->
      <table class="utilisateurs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Créé le</th>
            <th>Modifié le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="utilisateur in utilisateurs" :key="utilisateur.id">
            <td>{{ utilisateur.id }}</td>
            <td>{{ utilisateur.nom }}</td>
            <td>{{ utilisateur.email }}</td>
            <td>
              <span :class="['role-badge', utilisateur.role.toLowerCase()]">
                {{ utilisateur.role }}
              </span>
            </td>
            <td>{{ formatDate(utilisateur.creeLe) }}</td>
            <td>{{ formatDate(utilisateur.modifieLe) }}</td>
            <td class="actions">
              <button @click="editUtilisateur(utilisateur)" class="btn-edit">
                ✏️ Modifier
              </button>
              <button @click="deleteUtilisateur(utilisateur)" class="btn-delete">
                🗑️ Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal de création -->
      <div v-if="showCreateForm" class="modal-overlay">
        <div class="modal-content">
          <h2>Créer un Utilisateur</h2>
          
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>Nom *</label>
              <input v-model="formData.nom" type="text" required>
            </div>
            
            <div class="form-group">
              <label>Email *</label>
              <input v-model="formData.email" type="email" required>
            </div>
            
            <div class="form-group password-group">
              <label>Mot de passe *</label>
              <div class="password-input-container">
                <input 
                  v-model="formData.motDePasse" 
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  class="password-input">
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="password-toggle">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>Rôle *</label>
              <input v-model="formData.role" type="text" required placeholder="Ex: ADMIN, SCENARISTE, REALISATEUR">
              <small>Saisissez le rôle librement (majuscules recommandées).</small>
            </div>

            <div v-if="isRoleWithDetails" class="form-group">
              <label>Spécialité</label>
              <input v-model="formData.specialite" type="text">
            </div>

            <div v-if="isRoleWithDetails" class="form-group">
              <label>Biographie</label>
              <textarea v-model="formData.biographie" rows="3"></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                Créer
              </button>
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de modification -->
      <div v-if="editingUtilisateur" class="modal-overlay">
        <div class="modal-content">
          <h2>Modifier l'Utilisateur</h2>
          
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>Nom *</label>
              <input v-model="formData.nom" type="text" required>
            </div>
            
            <div class="form-group">
              <label>Email *</label>
              <input v-model="formData.email" type="email" required>
            </div>
            
            <div class="form-group password-group">
              <label>Mot de passe (laisser vide pour ne pas modifier)</label>
              <div class="password-input-container">
                <input 
                  v-model="formData.motDePasse" 
                  :type="showPassword ? 'text' : 'password'" 
                  class="password-input">
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="password-toggle">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>Rôle *</label>
              <input v-model="formData.role" type="text" required disabled>
              <small class="role-note">Le rôle ne peut pas être modifié</small>
            </div>

            <div v-if="isRoleWithDetails" class="form-group">
              <label>Spécialité</label>
              <input v-model="formData.specialite" type="text">
            </div>

            <div v-if="isRoleWithDetails" class="form-group">
              <label>Biographie</label>
              <textarea v-model="formData.biographie" rows="3"></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                Modifier
              </button>
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Chargement et messages -->
      <div v-if="loading" class="loading">Chargement...</div>
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '../assets/css/user_view.css';

export default {
  name: 'UtilisateursView',
  data() {
    return {
      utilisateurs: [],
      loading: false,
      message: '',
      messageType: 'success',
      showCreateForm: false,
      editingUtilisateur: null,
      showPassword: false,
      formData: {
        nom: '',
        email: '',
        motDePasse: '',
        role: '',
        specialite: '',
        biographie: ''
      }
    };
  },
  computed: {
    isRoleWithDetails() {
      const role = this.formData.role ? this.formData.role.toUpperCase() : '';
      return role === 'SCENARISTE' || role === 'REALISATEUR';
    }
  },
  created() {
    this.fetchUtilisateurs();
  },
  methods: {
    async fetchUtilisateurs() {
      this.loading = true;
      try {
        const [scenaristes, realisateurs, allUtilisateurs] = await Promise.all([
          axios.get('/api/utilisateurs/scenaristes'),
          axios.get('/api/utilisateurs/realisateurs'),
          axios.get('/api/utilisateurs')
        ]);

        // Scénaristes avec détails
        const scenMap = scenaristes.data.map(s => ({
          id: s.idUtilisateur,  // Utilise id_utilisateur pour cohérence
          nom: s.nom,
          email: s.email,
          role: 'SCENARISTE',
          creeLe: s.creeLe || new Date().toISOString(),
          modifieLe: s.modifieLe || new Date().toISOString(),
          specialite: s.specialite,
          biographie: s.biographie
        }));

        // Réalisateurs avec détails
        const realMap = realisateurs.data.map(r => ({
          id: r.idUtilisateur,
          nom: r.nom,
          email: r.email,
          role: 'REALISATEUR',
          creeLe: r.creeLe || new Date().toISOString(),
          modifieLe: r.modifieLe || new Date().toISOString(),
          specialite: r.specialite,
          biographie: r.biographie
        }));

        // Admins (de /utilisateurs, filtrés)
        const admins = allUtilisateurs.data
          .filter(u => u.role === 'ADMIN')
          .map(a => ({
            id: a.id,
            nom: a.nom,
            email: a.email,
            role: a.role,
            creeLe: a.creeLe || new Date().toISOString(),
            modifieLe: a.modifieLe || new Date().toISOString(),
            specialite: '',
            biographie: ''
          }));

        this.utilisateurs = [...scenMap, ...realMap, ...admins];
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        this.showMessage('Erreur lors du chargement des utilisateurs', 'error');
      } finally {
        this.loading = false;
      }
    },

    async submitForm() {
      try {
        const data = { ...this.formData };
        data.role = data.role.toUpperCase();  // Normalise en majuscules

        let endpoint;
        if (this.showCreateForm) {
          // Création
          if (data.role === 'SCENARISTE') {
            endpoint = '/api/utilisateurs/creer-scenariste';
          } else if (data.role === 'REALISATEUR') {
            endpoint = '/api/utilisateurs/creer-realisateur';
          } else if (data.role === 'ADMIN') {
            endpoint = '/api/utilisateurs/creer-admin';  // Nouveau endpoint
            // Pour admin, pas de spécialité/biographie
            delete data.specialite;
            delete data.biographie;
          } else {
            throw new Error('Rôle non supporté pour la création');
          }
          const response = await axios.post(endpoint, data);
          this.showMessage(response.data.message || 'Utilisateur créé avec succès', 'success');
        } else if (this.editingUtilisateur) {
          // Modification unifiée par id_utilisateur
          endpoint = `/api/utilisateurs/${this.editingUtilisateur.id}`;
          if (data.motDePasse === '') delete data.motDePasse;  // Ne pas envoyer si vide
          if (!this.isRoleWithDetails) {
            delete data.specialite;
            delete data.biographie;
          }
          const response = await axios.put(endpoint, data);
          this.showMessage(response.data.message || 'Utilisateur modifié avec succès', 'success');
        }

        this.closeModal();
        this.fetchUtilisateurs();
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        const errorMessage = error.response?.data?.message || 'Erreur lors de la soumission';
        this.showMessage(errorMessage, 'error');
      }
    },

    async deleteUtilisateur(utilisateur) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
      }

      try {
        // Suppression unifiée par id_utilisateur
        const endpoint = `/api/utilisateurs/${utilisateur.id}`;
        await axios.delete(endpoint);
        this.showMessage('Utilisateur supprimé avec succès', 'success');
        this.fetchUtilisateurs();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
        this.showMessage(errorMessage, 'error');
      }
    },

    editUtilisateur(utilisateur) {
      this.editingUtilisateur = utilisateur;
      this.formData = {
        nom: utilisateur.nom,
        email: utilisateur.email,
        motDePasse: '',
        role: utilisateur.role,
        specialite: utilisateur.specialite || '',
        biographie: utilisateur.biographie || ''
      };
      this.showPassword = false;
    },

    closeModal() {
      this.showCreateForm = false;
      this.editingUtilisateur = null;
      this.formData = {
        nom: '',
        email: '',
        motDePasse: '',
        role: '',
        specialite: '',
        biographie: ''
      };
      this.showPassword = false;
    },

    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      setTimeout(() => {
        this.message = '';
      }, 5000);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  }
};
</script>

<style scoped>
.app-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.utilisateurs-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.actions-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-edit {
  background-color: #ffc107;
  color: black;
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 5px;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.utilisateurs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.utilisateurs-table th, .utilisateurs-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.utilisateurs-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #495057;
}

.utilisateurs-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.utilisateurs-table tr:hover {
  background-color: #e9ecef;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.role-badge.scenariste {
  background-color: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.role-badge.realisateur {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

.role-badge.admin {
  background-color: #fce4ec;
  color: #c2185b;
  border: 1px solid #f8bbd9;
}

.actions {
  display: flex;
  gap: 5px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.password-group {
  position: relative;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-note {
  color: #6c757d;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #6c757d;
}

.message {
  padding: 12px 20px;
  margin: 15px 0;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

small {
  color: #6c757d;
  font-size: 12px;
}
</style>

