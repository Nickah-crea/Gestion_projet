<template>
  <div class="raccords-verification">
    <!-- Header avec titre et boutons d'action -->
    <div class="header-section">
      <div class="header-title">
        <h1><i class="fas fa-clipboard-check"></i> Vérification des Raccords</h1>
        <p>Tableau de bord qualité et suivi des contrôles de continuité</p>
      </div>
      <div class="header-actions">
        <button @click="exporterRapport" class="btn btn-outline-primary">
          <i class="fas fa-file-export"></i> Exporter Rapport
        </button>
        <button @click="rafraichirDonnees" class="btn btn-primary">
          <i class="fas fa-sync-alt"></i> Actualiser
        </button>
      </div>
    </div>

    <!-- Cartes de statistiques -->
    <div class="stats-cards">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="fas fa-link"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalRaccords }}</h3>
          <p>Raccords Total</p>
        </div>
      </div>
      
      <div class="stat-card verifies">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.raccordsVerifies }}</h3>
          <p>Raccords Vérifiés</p>
        </div>
      </div>
      
      <div class="stat-card critiques">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.raccordsCritiques }}</h3>
          <p>Raccords Critiques</p>
        </div>
      </div>
      
      <div class="stat-card non-conformes">
        <div class="stat-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.raccordsNonConformes }}</h3>
          <p>Non Conformes</p>
        </div>
      </div>
    </div>

    <!-- Filtres avancés -->
    <div class="filters-section">
      <div class="filters-header">
        <h3><i class="fas fa-filter"></i> Filtres de Vérification</h3>
        <button @click="toggleFilters" class="btn btn-sm btn-outline-secondary">
          {{ showFilters ? 'Masquer' : 'Afficher' }} Filtres
        </button>
      </div>
      
      <div v-if="showFilters" class="filters-grid">
        <div class="filter-group">
          <label>Statut de Vérification</label>
          <select v-model="filters.statutVerification" @change="appliquerFiltres">
            <option value="">Tous les statuts</option>
            <option value="CONFORME">Conforme</option>
            <option value="NON_CONFORME">Non Conforme</option>
            <option value="A_CORRIGER">À Corriger</option>
            <option value="A_VERIFIER">À Vérifier</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Type de Raccord</label>
          <select v-model="filters.typeRaccord" @change="appliquerFiltres">
            <option value="">Tous les types</option>
            <option v-for="type in typesRaccord" :key="type.id" :value="type.id">
              {{ type.nomType }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Niveau de Critique</label>
          <select v-model="filters.critique" @change="appliquerFiltres">
            <option value="">Tous</option>
            <option value="true">Critiques uniquement</option>
            <option value="false">Non critiques</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Période</label>
          <select v-model="filters.periode" @change="appliquerFiltres">
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="all">Toute période</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Projet</label>
          <select v-model="filters.projetId" @change="appliquerFiltres">
            <option value="">Tous les projets</option>
            <option v-for="projet in projets" :key="projet.id" :value="projet.id">
              {{ projet.titre }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tableau des vérifications -->
    <div class="verifications-table-section">
      <div class="section-header">
        <h3><i class="fas fa-list-alt"></i> Historique des Vérifications</h3>
        <div class="table-actions">
          <input 
            v-model="searchTerm" 
            @input="rechercherVerifications" 
            placeholder="Rechercher dans les vérifications..."
            class="search-input"
          >
          <select v-model="itemsPerPage" @change="changerPagination" class="page-select">
            <option value="10">10/page</option>
            <option value="25">25/page</option>
            <option value="50">50/page</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="verifications-table">
          <thead>
            <tr>
              <th @click="trierPar('raccordDescription')" class="sortable">
                Raccord
                <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'raccordDescription' && sortOrder === 'asc', 'fa-sort-down': sortField === 'raccordDescription' && sortOrder === 'desc'}"></i>
              </th>
              <th @click="trierPar('typeRaccord')" class="sortable">
                Type
                <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'typeRaccord' && sortOrder === 'asc', 'fa-sort-down': sortField === 'typeRaccord' && sortOrder === 'desc'}"></i>
              </th>
              <th @click="trierPar('statutVerification')" class="sortable">
                Statut
                <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'statutVerification' && sortOrder === 'asc', 'fa-sort-down': sortField === 'statutVerification' && sortOrder === 'desc'}"></i>
              </th>
              <th>Vérificateur</th>
              <th @click="trierPar('dateVerification')" class="sortable">
                Date
                <i class="fas fa-sort" :class="{'fa-sort-up': sortField === 'dateVerification' && sortOrder === 'asc', 'fa-sort-down': sortField === 'dateVerification' && sortOrder === 'desc'}"></i>
              </th>
              <th>Preuves</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="verification in verificationsFiltrees" :key="verification.id" 
                :class="getRowClass(verification)">
              <td class="raccord-info">
                <div class="raccord-title">{{ verification.raccordDescription }}</div>
                <div class="scenes-info">
                  <small>De: {{ verification.sceneSourceTitre }}</small><br>
                  <small>Vers: {{ verification.sceneCibleTitre }}</small>
                </div>
                <span v-if="verification.estCritique" class="badge badge-critique">
                  <i class="fas fa-exclamation-triangle"></i> Critique
                </span>
              </td>
              <td>
                <span class="type-badge">{{ verification.typeRaccord }}</span>
              </td>
              <td>
                <span :class="`status-badge status-${verification.statutVerification.toLowerCase()}`">
                  <i :class="getStatusIcon(verification.statutVerification)"></i>
                  {{ verification.statutVerification }}
                </span>
              </td>
              <td>
                <div class="verificateur-info">
                  <div class="verificateur-nom">{{ verification.verificateurNom }}</div>
                  <small class="verificateur-role">{{ verification.verificateurRole }}</small>
                </div>
              </td>
              <td>
                <div class="date-info">
                  <div>{{ formatDate(verification.dateVerification) }}</div>
                  <small class="text-muted">{{ formatTime(verification.dateVerification) }}</small>
                </div>
              </td>
              <td>
                <div class="preuves-section">
                  <span v-if="verification.nombrePreuves > 0" class="preuves-badge">
                    <i class="fas fa-camera"></i> {{ verification.nombrePreuves }}
                  </span>
                  <span v-else class="no-preuves">Aucune</span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="voirDetails(verification)" class="btn btn-sm btn-info" title="Détails">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button @click="telechargerPreuves(verification)" 
                          :disabled="verification.nombrePreuves === 0"
                          class="btn btn-sm btn-outline-primary" title="Télécharger preuves">
                    <i class="fas fa-download"></i>
                  </button>
                  <button v-if="peutReVerifier(verification)" 
                          @click="demarrerReVerification(verification)"
                          class="btn btn-sm btn-warning" title="Re-vérifier">
                    <i class="fas fa-redo"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button @click="pagePrecedente" :disabled="currentPage === 1" class="btn-pagination">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <span class="page-info">
            Page {{ currentPage }} sur {{ totalPages }}
          </span>
          
          <button @click="pageSuivante" :disabled="currentPage === totalPages" class="btn-pagination">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div v-if="verificationsFiltrees.length === 0" class="no-data">
          <i class="fas fa-inbox"></i>
          <p>Aucune vérification trouvée</p>
        </div>
      </div>
    </div>

    <!-- Section Analytics -->
    <div class="analytics-section">
      <div class="section-header">
        <h3><i class="fas fa-chart-bar"></i> Analytics Qualité</h3>
      </div>
      
      <div class="analytics-grid">
        <!-- Graphique de répartition des statuts -->
        <div class="analytics-card">
          <h4>Répartition des Statuts</h4>
          <div class="chart-container">
            <canvas ref="statutChart"></canvas>
          </div>
        </div>
        
        <!-- Graphique d'évolution temporelle -->
        <div class="analytics-card">
          <h4>Évolution des Vérifications</h4>
          <div class="chart-container">
            <canvas ref="evolutionChart"></canvas>
          </div>
        </div>
        
        <!-- Métriques de qualité -->
        <div class="metrics-card">
          <h4>Indicateurs de Qualité</h4>
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-value">{{ calculerTauxConformite() }}%</div>
              <div class="metric-label">Taux de Conformité</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ stats.moyenneTempsVerification }}</div>
              <div class="metric-label">Temps Moyen de Vérification</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ stats.verificationsCeMois }}</div>
              <div class="metric-label">Vérifications ce Mois</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ stats.tauxResolution }}</div>
              <div class="metric-label">Taux de Résolution</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails -->
    <div v-if="showDetailModal" class="modal-overlay" @click="fermerModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h4>Détails de la Vérification</h4>
          <button @click="fermerModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="verificationSelectionnee" class="verification-details">
            <!-- Informations de base -->
            <div class="detail-section">
              <h5>Informations du Raccord</h5>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Description:</label>
                  <span>{{ verificationSelectionnee.raccordDescription }}</span>
                </div>
                <div class="detail-item">
                  <label>Type:</label>
                  <span class="type-badge">{{ verificationSelectionnee.typeRaccord }}</span>
                </div>
                <div class="detail-item">
                  <label>Statut:</label>
                  <span :class="`status-badge status-${verificationSelectionnee.statutVerification.toLowerCase()}`">
                    {{ verificationSelectionnee.statutVerification }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Scène Source:</label>
                  <span>{{ verificationSelectionnee.sceneSourceTitre }}</span>
                </div>
                <div class="detail-item">
                  <label>Scène Cible:</label>
                  <span>{{ verificationSelectionnee.sceneCibleTitre }}</span>
                </div>
                <div class="detail-item">
                  <label>Critique:</label>
                  <span :class="verificationSelectionnee.estCritique ? 'text-danger' : 'text-success'">
                    {{ verificationSelectionnee.estCritique ? 'Oui' : 'Non' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Informations de vérification -->
            <div class="detail-section">
              <h5>Détails de la Vérification</h5>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Vérificateur:</label>
                  <span>{{ verificationSelectionnee.verificateurNom }}</span>
                </div>
                <div class="detail-item">
                  <label>Date:</label>
                  <span>{{ formatDateTime(verificationSelectionnee.dateVerification) }}</span>
                </div>
                <div class="detail-item full-width">
                  <label>Notes:</label>
                  <div class="notes-content">{{ verificationSelectionnee.notes || 'Aucune note' }}</div>
                </div>
              </div>
            </div>
            
            <!-- Preuves documentaires -->
            <div class="detail-section" v-if="verificationSelectionnee.preuves && verificationSelectionnee.preuves.length > 0">
              <h5>Preuves Documentaires</h5>
              <div class="preuves-gallery">
                <div v-for="preuve in verificationSelectionnee.preuves" :key="preuve.id" class="preuve-item">
                  <img :src="`/api/verifications/preuve/${preuve.cheminFichier}`" 
                       :alt="preuve.description"
                       @click="agrandirImage(preuve)"
                       class="preuve-image">
                  <div class="preuve-info">
                    <p>{{ preuve.description }}</p>
                    <small>{{ formatDate(preuve.dateCreation) }}</small>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Historique des vérifications -->
            <div class="detail-section" v-if="verificationSelectionnee.historique && verificationSelectionnee.historique.length > 0">
              <h5>Historique des Vérifications</h5>
              <div class="historique-list">
                <div v-for="historique in verificationSelectionnee.historique" :key="historique.id" 
                     class="historique-item">
                  <div class="historique-header">
                    <span class="historique-statut">{{ historique.statut }}</span>
                    <span class="historique-date">{{ formatDateTime(historique.date) }}</span>
                  </div>
                  <div class="historique-verificateur">{{ historique.verificateur }}</div>
                  <div class="historique-notes" v-if="historique.notes">{{ historique.notes }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="fermerModal" class="btn btn-secondary">Fermer</button>
          <button v-if="peutReVerifier(verificationSelectionnee)" 
                  @click="demarrerReVerification(verificationSelectionnee)"
                  class="btn btn-warning">
            <i class="fas fa-redo"></i> Re-vérifier
          </button>
        </div>
      </div>
    </div>

    <!-- Modal d'image agrandie -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="fermerImageModal">
      <div class="image-modal-content">
        <button @click="fermerImageModal" class="close-btn-image">
          <i class="fas fa-times"></i>
        </button>
        <img :src="imageAgrandieUrl" :alt="imageAgrandieDescription" class="agrandie-image">
        <p class="image-description">{{ imageAgrandieDescription }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'RaccordsVerification',
  data() {
    return {
      // Données principales
      verifications: [],
      projets: [],
      typesRaccord: [],
      
      // Filtres et recherche
      filters: {
        statutVerification: '',
        typeRaccord: '',
        critique: '',
        periode: '30',
        projetId: ''
      },
      searchTerm: '',
      showFilters: true,
      
      // Pagination et tri
      currentPage: 1,
      itemsPerPage: 10,
      sortField: 'dateVerification',
      sortOrder: 'desc',
      
      // Stats
      stats: {
        totalRaccords: 0,
        raccordsVerifies: 0,
        raccordsCritiques: 0,
        raccordsNonConformes: 0,
        moyenneTempsVerification: '2h 30m',
        verificationsCeMois: 0,
        tauxResolution: '85%'
      },
      
      // Modals
      showDetailModal: false,
      showImageModal: false,
      verificationSelectionnee: null,
      imageAgrandieUrl: '',
      imageAgrandieDescription: '',
      
      // Charts
      statutChart: null,
      evolutionChart: null
    };
  },
  
  computed: {
    verificationsFiltrees() {
      let filtered = this.verifications;
      
      // Appliquer les filtres
      if (this.filters.statutVerification) {
        filtered = filtered.filter(v => v.statutVerification === this.filters.statutVerification);
      }
      
      if (this.filters.typeRaccord) {
        filtered = filtered.filter(v => v.typeRaccordId === this.filters.typeRaccord);
      }
      
      if (this.filters.critique !== '') {
        filtered = filtered.filter(v => v.estCritique === (this.filters.critique === 'true'));
      }
      
      if (this.filters.projetId) {
        filtered = filtered.filter(v => v.projetId === this.filters.projetId);
      }
      
      // Appliquer la recherche
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(v => 
          v.raccordDescription.toLowerCase().includes(term) ||
          v.sceneSourceTitre.toLowerCase().includes(term) ||
          v.sceneCibleTitre.toLowerCase().includes(term) ||
          v.verificateurNom.toLowerCase().includes(term)
        );
      }
      
      // Appliquer le tri
      filtered.sort((a, b) => {
        let aValue = a[this.sortField];
        let bValue = b[this.sortField];
        
        if (this.sortField === 'dateVerification') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      
      return filtered;
    },
    
    totalPages() {
      return Math.ceil(this.verificationsFiltrees.length / this.itemsPerPage);
    },
    
    verificationsPaginees() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.verificationsFiltrees.slice(start, end);
    }
  },
  
  async mounted() {
    await this.chargerDonnees();
    this.initialiserCharts();
  },
  
  beforeUnmount() {
    if (this.statutChart) this.statutChart.destroy();
    if (this.evolutionChart) this.evolutionChart.destroy();
  },
  
  methods: {
    async chargerDonnees() {
      try {
        const [verificationsRes, projetsRes, typesRes] = await Promise.all([
          axios.get('/api/raccords/verifications'),
          axios.get('/api/projets'),
          axios.get('/api/raccords/types')
        ]);
        
        this.verifications = verificationsRes.data;
        this.projets = projetsRes.data;
        this.typesRaccord = typesRes.data;
        
        this.calculerStats();
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        alert('Erreur lors du chargement des données');
      }
    },
    
    calculerStats() {
      this.stats.totalRaccords = this.verifications.length;
      this.stats.raccordsVerifies = this.verifications.filter(v => 
        ['CONFORME', 'NON_CONFORME'].includes(v.statutVerification)
      ).length;
      this.stats.raccordsCritiques = this.verifications.filter(v => v.estCritique).length;
      this.stats.raccordsNonConformes = this.verifications.filter(v => 
        v.statutVerification === 'NON_CONFORME'
      ).length;
    },
    
    initialiserCharts() {
      // Chart de répartition des statuts
      const statutCtx = this.$refs.statutChart.getContext('2d');
      this.statutChart = new Chart(statutCtx, {
        type: 'doughnut',
        data: {
          labels: ['Conforme', 'Non Conforme', 'À Corriger', 'À Vérifier'],
          datasets: [{
            data: [
              this.verifications.filter(v => v.statutVerification === 'CONFORME').length,
              this.verifications.filter(v => v.statutVerification === 'NON_CONFORME').length,
              this.verifications.filter(v => v.statutVerification === 'A_CORRIGER').length,
              this.verifications.filter(v => v.statutVerification === 'A_VERIFIER').length
            ],
            backgroundColor: ['#28a745', '#dc3545', '#ffc107', '#17a2b8']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      
      // Chart d'évolution temporelle
      const evolutionCtx = this.$refs.evolutionChart.getContext('2d');
      this.evolutionChart = new Chart(evolutionCtx, {
        type: 'line',
        data: {
          labels: this.genererLabelsEvolution(),
          datasets: [
            {
              label: 'Vérifications',
              data: this.genererDonneesEvolution(),
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    
    genererLabelsEvolution() {
      // Générer les 7 derniers jours
      const labels = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(this.formatDateCourt(date));
      }
      return labels;
    },
    
    genererDonneesEvolution() {
      const donnees = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const count = this.verifications.filter(v => {
          const vDate = new Date(v.dateVerification);
          return vDate.toDateString() === date.toDateString();
        }).length;
        donnees.push(count);
      }
      return donnees;
    },
    
    // Méthodes de filtrage et recherche
    appliquerFiltres() {
      this.currentPage = 1;
    },
    
    rechercherVerifications() {
      this.currentPage = 1;
    },
    
    trierPar(champ) {
      if (this.sortField === champ) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = champ;
        this.sortOrder = 'asc';
      }
    },
    
    // Pagination
    changerPagination() {
      this.currentPage = 1;
    },
    
    pagePrecedente() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    pageSuivante() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    // Méthodes d'interface
    getRowClass(verification) {
      return {
        'row-critique': verification.estCritique,
        'row-non-conforme': verification.statutVerification === 'NON_CONFORME',
        'row-a-verifier': verification.statutVerification === 'A_VERIFIER'
      };
    },
    
    getStatusIcon(statut) {
      const icons = {
        'CONFORME': 'fas fa-check-circle',
        'NON_CONFORME': 'fas fa-times-circle',
        'A_CORRIGER': 'fas fa-exclamation-triangle',
        'A_VERIFIER': 'fas fa-clock'
      };
      return icons[statut] || 'fas fa-question-circle';
    },
    
    peutReVerifier(verification) {
      return verification.statutVerification === 'NON_CONFORME' || 
             verification.statutVerification === 'A_CORRIGER';
    },
    
    // Méthodes de formatage
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR');
    },
    
    formatTime(date) {
      return new Date(date).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },
    
    formatDateTime(date) {
      return `${this.formatDate(date)} à ${this.formatTime(date)}`;
    },
    
    formatDateCourt(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
    },
    
    // Méthodes de calcul
    calculerTauxConformite() {
      const conformes = this.verifications.filter(v => v.statutVerification === 'CONFORME').length;
      return this.verifications.length > 0 ? 
        Math.round((conformes / this.verifications.length) * 100) : 0;
    },
    
    // Méthodes d'action
    async exporterRapport() {
      try {
        const response = await axios.get('/api/raccords/verifications/rapport', {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `rapport-verifications-${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        alert('Rapport exporté avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        alert('Erreur lors de l\'export du rapport');
      }
    },
    
    async rafraichirDonnees() {
      await this.chargerDonnees();
     alert('Données actualisées');
    },
    
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    
    voirDetails(verification) {
      this.verificationSelectionnee = verification;
      this.showDetailModal = true;
    },
    
    async telechargerPreuves(verification) {
      try {
        const response = await axios.get(`/api/raccords/verifications/${verification.id}/preuves/zip`, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `preuves-verification-${verification.id}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        alert('Preuves téléchargées avec succès');
      } catch (error) {
        console.error('Erreur téléchargement preuves:', error);
        alert('Erreur lors du téléchargement des preuves');
      }
    },
    
    demarrerReVerification(verification) {
      this.$router.push({
        path: '/gestion-raccords',
        query: { 
          raccordId: verification.raccordId,
          reVerification: 'true'
        }
      });
    },
    
    agrandirImage(preuve) {
      this.imageAgrandieUrl = `/api/verifications/preuve/${preuve.cheminFichier}`;
      this.imageAgrandieDescription = preuve.description;
      this.showImageModal = true;
    },
    
    fermerModal() {
      this.showDetailModal = false;
      this.verificationSelectionnee = null;
    },
    
    fermerImageModal() {
      this.showImageModal = false;
      this.imageAgrandieUrl = '';
      this.imageAgrandieDescription = '';
    }
  }
};
</script>

<style scoped>
.raccords-verification {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.header-title h1 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title p {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Cartes de statistiques */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #007bff;
}

.stat-card.total { border-left-color: #007bff; }
.stat-card.verifies { border-left-color: #28a745; }
.stat-card.critiques { border-left-color: #ffc107; }
.stat-card.non-conformes { border-left-color: #dc3545; }

.stat-icon {
  font-size: 2rem;
  margin-right: 15px;
  opacity: 0.8;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Filtres */
.filters-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filters-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #495057;
}

.filter-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
}

/* Table */
.verifications-table-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.section-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  min-width: 250px;
}

.page-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
}

.table-container {
  overflow-x: auto;
}

.verifications-table {
  width: 100%;
  border-collapse: collapse;
}

.verifications-table th,
.verifications-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.verifications-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #e9ecef;
}

/* Styles des lignes */
.row-critique {
  background-color: #fff3cd !important;
  border-left: 4px solid #ffc107;
}

.row-non-conforme {
  background-color: #f8d7da !important;
  border-left: 4px solid #dc3545;
}

.row-a-verifier {
  background-color: #d1ecf1 !important;
  border-left: 4px solid #17a2b8;
}

/* Badges et statuts */
.raccord-info {
  max-width: 250px;
}

.raccord-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.scenes-info {
  font-size: 0.85rem;
  color: #6c757d;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 5px;
}

.badge-critique {
  background-color: #ffc107;
  color: #212529;
}

.type-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-conforme {
  background-color: #d4edda;
  color: #155724;
}

.status-non_conforme {
  background-color: #f8d7da;
  color: #721c24;
}

.status-a_corriger {
  background-color: #fff3cd;
  color: #856404;
}

.status-a_verifier {
  background-color: #d1ecf1;
  color: #0c5460;
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 5px;
}

.action-buttons .btn {
  padding: 6px 8px;
  font-size: 0.8rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
}

.btn-pagination {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-pagination:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #495057;
}

/* Analytics */
.analytics-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.analytics-card, .metrics-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.metrics-card {
  grid-column: 1 / -1;
}

.analytics-card h4, .metrics-card h4 {
  margin: 0 0 15px 0;
  color: #495057;
}

.chart-container {
  height: 200px;
  position: relative;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.metric-item {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.large-modal {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h4 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Détails de vérification */
.verification-details {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.detail-section h5 {
  margin: 0 0 15px 0;
  color: #495057;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.notes-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #007bff;
  white-space: pre-wrap;
}

/* Preuves */
.preuves-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.preuve-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.preuve-item:hover {
  transform: scale(1.05);
}

.preuve-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.preuve-info {
  padding: 10px;
}

.preuve-info p {
  margin: 0 0 5px 0;
  font-size: 0.8rem;
}

.preuve-info small {
  color: #6c757d;
  font-size: 0.7rem;
}

/* Historique */
.historique-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.historique-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.historique-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.historique-statut {
  font-weight: 600;
  color: #495057;
}

.historique-date {
  color: #6c757d;
  font-size: 0.8rem;
}

.historique-verificateur {
  font-weight: 500;
  margin-bottom: 5px;
}

.historique-notes {
  color: #6c757d;
  font-size: 0.9rem;
  font-style: italic;
}

/* Modal image */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.close-btn-image {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.agrandie-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.image-description {
  color: white;
  text-align: center;
  margin-top: 10px;
}

/* États vides */
.no-data {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .table-actions {
    justify-content: space-between;
  }
  
  .search-input {
    min-width: auto;
    flex: 1;
  }
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s;
}
.slide-enter, .slide-leave-to {
  transform: translateY(-20px);
}
</style>