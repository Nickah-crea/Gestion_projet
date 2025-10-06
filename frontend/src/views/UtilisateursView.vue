<template>
  <div class="app-wrapper-utilisateur">
    <div class="utilisateurs-container-utilisateur">
      <h1 class="title-utilisateur">Liste des Utilisateurs</h1>
      
      <!-- Boutons d'action -->
      <div class="actions-bar-utilisateur">
        <button @click="showCreateForm = true" class="btn-utilisateur btn-primary-utilisateur">
          + Ajouter un Utilisateur
        </button>
        <button @click="fetchUtilisateurs" class="btn-utilisateur btn-secondary-utilisateur">
          🔄 Actualiser
        </button>
      </div>

      <!-- Tableau des utilisateurs -->
      <table class="utilisateurs-table-utilisateur">
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
          <tr v-for="utilisateur in utilisateurs" :key="utilisateur.id" class="table-row-utilisateur">
            <td>{{ utilisateur.id }}</td>
            <td>{{ utilisateur.nom }}</td>
            <td>{{ utilisateur.email }}</td>
            <td>
              <span :class="['role-badge-utilisateur', utilisateur.role.toLowerCase()]">
                {{ utilisateur.role }}
              </span>
            </td>
            <td>{{ formatDate(utilisateur.creeLe) }}</td>
            <td>{{ formatDate(utilisateur.modifieLe) }}</td>
            <td class="actions-utilisateur">
              <button @click="editUtilisateur(utilisateur)" class="btn-edit-utilisateur">
                ✏️ Modifier
              </button>
              <button @click="deleteUtilisateur(utilisateur)" class="btn-delete-utilisateur">
                🗑️ Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal de création -->
      <div v-if="showCreateForm" class="modal-overlay-utilisateur">
        <div class="modal-content-utilisateur">
          <h2 class="modal-title-utilisateur">Créer un Utilisateur</h2>
          
          <form @submit.prevent="submitForm" class="modal-form-utilisateur">
            <div class="form-group-utilisateur">
              <label class="form-label-utilisateur">Nom *</label>
              <input v-model="formData.nom" type="text" required class="form-input-utilisateur">
            </div>
            
            <div class="form-group-utilisateur">
              <label class="form-label-utilisateur">Email *</label>
              <input v-model="formData.email" type="email" required class="form-input-utilisateur">
            </div>
            
            <div class="form-group-utilisateur password-group-utilisateur">
              <label class="form-label-utilisateur">Mot de passe *</label>
              <div class="password-input-container-utilisateur">
                <input 
                  v-model="formData.motDePasse" 
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  class="password-input-utilisateur">
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="password-toggle-utilisateur">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>
            
            <div class="form-group-utilisateur">
              <label class="form-label-utilisateur">Rôle *</label>
              <input v-model="formData.role" type="text" required placeholder="Ex: ADMIN, SCENARISTE, REALISATEUR" class="form-input-utilisateur">
              <small class="form-hint-utilisateur">Saisissez le rôle librement (majuscules recommandées).</small>
            </div>

            <div v-if="isRoleWithDetails" class="form-group-utilisateur">
              <label class="form-label-utilisateur">Spécialité</label>
              <input v-model="formData.specialite" type="text" class="form-input-utilisateur">
            </div>

            <div v-if="isRoleWithDetails" class="form-group-utilisateur">
              <label class="form-label-utilisateur">Biographie</label>
              <textarea v-model="formData.biographie" rows="3" class="form-textarea-utilisateur"></textarea>
            </div>

            <div class="form-actions-utilisateur">
              <button type="submit" class="btn-utilisateur btn-primary-utilisateur">
                Créer
              </button>
              <button type="button" @click="closeModal" class="btn-utilisateur btn-secondary-utilisateur">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de modification -->
      <div v-if="editingUtilisateur" class="modal-overlay-utilisateur">
        <div class="modal-content-utilisateur">
          <h2 class="modal-title-utilisateur">Modifier l'Utilisateur</h2>
          
          <form @submit.prevent="submitForm" class="modal-form-utilisateur">
            <div class="form-group-utilisateur">
              <label class="form-label-utilisateur">Nom *</label>
              <input v-model="formData.nom" type="text" required class="form-input-utilisateur">
            </div>
            
            <div class="form-group-utilisateur">
              <label class="form-label-utilisateur">Email *</label>
              <input v-model="formData.email" type="email" required class="form-input-utilisateur">
            </div>
            
            <div class="form-group-utilisateur password-group-utilisateur">
              <label class="form-label-utilisateur">Mot de passe (laisser vide pour ne pas modifier)</label>
              <div class="password-input-container-utilisateur">
                <input 
                  v-model="formData.motDePasse" 
                  :type="showPassword ? 'text' : 'password'" 
                  class="password-input-utilisateur">
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="password-toggle-utilisateur">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>
            
            <div class="form-group-utilisateur">
              <label class="form-label-utilisateur">Rôle *</label>
              <input v-model="formData.role" type="text" required disabled class="form-input-utilisateur">
              <small class="role-note-utilisateur">Le rôle ne peut pas être modifié</small>
            </div>

            <div v-if="isRoleWithDetails" class="form-group-utilisateur">
              <label class="form-label-utilisateur">Spécialité</label>
              <input v-model="formData.specialite" type="text" class="form-input-utilisateur">
            </div>

            <div v-if="isRoleWithDetails" class="form-group-utilisateur">
              <label class="form-label-utilisateur">Biographie</label>
              <textarea v-model="formData.biographie" rows="3" class="form-textarea-utilisateur"></textarea>
            </div>

            <div class="form-actions-utilisateur">
              <button type="submit" class="btn-utilisateur btn-primary-utilisateur">
                Modifier
              </button>
              <button type="button" @click="closeModal" class="btn-utilisateur btn-secondary-utilisateur">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Chargement et messages -->
      <div v-if="loading" class="loading-utilisateur">Chargement...</div>
      <div v-if="message" :class="['message-utilisateur', messageType + '-utilisateur']">
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
          id: s.idUtilisateur,
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
        data.role = data.role.toUpperCase();

        let endpoint;
        if (this.showCreateForm) {
          // Création
          if (data.role === 'SCENARISTE') {
            endpoint = '/api/utilisateurs/creer-scenariste';
          } else if (data.role === 'REALISATEUR') {
            endpoint = '/api/utilisateurs/creer-realisateur';
          } else if (data.role === 'ADMIN') {
            endpoint = '/api/utilisateurs/creer-admin';
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
          if (data.motDePasse === '') delete data.motDePasse;
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
