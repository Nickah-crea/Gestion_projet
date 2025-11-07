<template>
  <div class="app-wrapper">
    <!-- Header compact -->
    <div class="search-header-compact">
      <div class="header-content">
        <h1 class="page-title">🔍 Recherche Avancée</h1>
        <p class="page-subtitle">Trouvez des scènes, personnages, lieux et plateaux selon vos critères</p>
      </div>
    </div>

    <!-- Filtres principaux compacts -->
    <div class="main-filters-compact">
      <div class="filters-row">
        <!-- Sélection du Projet - EN PREMIER -->
        <div class="filter-group-compact">
          <label class="filter-label">📁 Projet</label>
          <select v-model="criteres.projetId" class="filter-select" @change="onProjetChange">
            <option value="">Tous les projets</option>
            <option 
              v-for="projet in projets" 
              :key="projet.id" 
              :value="projet.id"
            >
              {{ projet.titre }}
            </option>
          </select>
        </div>

        <!-- Types de recherche - Dropdown -->
        <div class="filter-group-compact">
          <label class="filter-label">🎯 Types</label>
          <div class="dropdown-filter">
            <button @click="toggleTypesDropdown" class="dropdown-trigger">
              <span class="dropdown-text">
                {{ getTypesDisplayText() }}
              </span>
              <i class="fas fa-chevron-down dropdown-icon"></i>
            </button>
            <div v-if="showTypesDropdown" class="dropdown-menu">
              <div class="dropdown-options">
                <label class="dropdown-option">
                  <input 
                    type="checkbox" 
                    v-model="criteres.typesRecherche" 
                    value="scenes"
                    @change="updateTypesSelection"
                  />
                  <span class="checkmark"></span>
                  🎬 Scènes
                </label>
                <label class="dropdown-option">
                  <input 
                    type="checkbox" 
                    v-model="criteres.typesRecherche" 
                    value="personnages"
                    @change="updateTypesSelection"
                  />
                  <span class="checkmark"></span>
                  👥 Personnages
                </label>
                <label class="dropdown-option">
                  <input 
                    type="checkbox" 
                    v-model="criteres.typesRecherche" 
                    value="lieux"
                    @change="updateTypesSelection"
                  />
                  <span class="checkmark"></span>
                  🏛️ Lieux
                </label>
                <label class="dropdown-option">
                  <input 
                    type="checkbox" 
                    v-model="criteres.typesRecherche" 
                    value="plateaux"
                    @change="updateTypesSelection"
                  />
                  <span class="checkmark"></span>
                  🎭 Plateaux
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Statuts - Dropdown -->
        <div class="filter-group-compact">
          <label class="filter-label">📊 Statuts</label>
          <div class="dropdown-filter">
            <button @click="toggleStatutsDropdown" class="dropdown-trigger">
              <span class="dropdown-text">
                {{ getStatutsDisplayText() }}
              </span>
              <i class="fas fa-chevron-down dropdown-icon"></i>
            </button>
            <div v-if="showStatutsDropdown" class="dropdown-menu">
              <div class="dropdown-options">
                <label 
                  v-for="statut in statutsDisponibles" 
                  :key="statut"
                  class="dropdown-option"
                >
                  <input 
                    type="checkbox" 
                    v-model="criteres.statuts" 
                    :value="statut"
                    @change="updateStatutsSelection"
                  />
                  <span class="checkmark"></span>
                  {{ formatStatut(statut) }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Regroupement - Select normal -->
        <div class="filter-group-compact">
          <label class="filter-label">🔀 Regrouper par</label>
          <select v-model="criteres.regroupement" class="filter-select">
            <option value="">Aucun</option>
            <option value="plateau">🎭 Plateau</option>
            <option value="lieu">🏛️ Lieu</option>
            <option value="personnage">👥 Personnage</option>
            <option value="statut">📊 Statut</option>
          </select>
        </div>

        <!-- Bouton recherche -->
        <div class="filter-group-compact">
          <button @click="rechercher" class="search-btn-compact" :disabled="chargement">
            {{ chargement ? '⏳' : '🔍' }}
            {{ chargement ? 'Recherche...' : 'Rechercher' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Indicateur de filtre projet actif -->
    <div v-if="criteres.projetId" class="projet-filter-indicator">
      <div class="projet-indicator-content">
        <span class="projet-label">📁 Projet sélectionné :</span>
        <span class="projet-nom">{{ getProjetNom() }}</span>
        <button @click="reinitialiserProjet" class="clear-projet-btn">
          <i class="fas fa-times"></i>
          Changer de projet
        </button>
      </div>
    </div>

    <!-- Barre de recherche principale -->
    <div class="search-bar-main">
      <div class="search-input-container">
        <i class="fas fa-search search-icon-main"></i>
        <input
          v-model="criteres.termeRecherche"
          type="text"
          placeholder="Rechercher des personnages, lieux, dialogues, titres..."
          class="search-input-large"
          @keyup.enter="rechercher"
        />
        <button v-if="criteres.termeRecherche" @click="criteres.termeRecherche = ''" class="clear-search-btn-main">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Filtres avancés (dates) avec toggle -->
    <div class="advanced-filters-minimal">
      <button @click="toggleDateFilters" class="toggle-date-btn">
        <i class="fas" :class="showDateFilters ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        Filtres dates
      </button>

      <div v-if="showDateFilters" class="date-filters-panel">
        <div class="date-filters-row">
          <div class="date-filter-group">
            <label>Date de début</label>
            <input v-model="criteres.dateDebut" type="date" class="date-input-compact" />
          </div>
          <div class="date-filter-group">
            <label>Date de fin</label>
            <input v-model="criteres.dateFin" type="date" class="date-input-compact" />
          </div>
          <button @click="reinitialiserDates" class="reset-dates-btn">
            <i class="fas fa-undo"></i>
            Réinitialiser dates
          </button>
        </div>
      </div>
    </div>

    <!-- Résultats -->
    <div class="results-section">
      <div v-if="resultats.length === 0 && !chargement" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Aucun résultat</h3>
        <p v-if="criteres.projetId">
          Aucun résultat trouvé pour le projet "{{ getProjetNom() }}" avec les critères actuels
        </p>
        <p v-else>
          Utilisez les filtres ci-dessus pour lancer une recherche
        </p>
      </div>

      <div v-else-if="chargement" class="loading-state">
        <div class="spinner"></div>
        <p>Recherche en cours...</p>
      </div>

      <div v-else class="results-container modern-results">
        <div class="results-header flex-header">
          <h2>📋 Résultats ({{ resultats.length }})</h2>
          <div class="results-info">
            <span v-if="criteres.projetId" class="projet-info">
              Projet : <strong>{{ getProjetNom() }}</strong> •
            </span>
            Groupés par : <strong>{{ getRegroupementLabel() }}</strong>
          </div>
          <button @click="reinitialiser" class="reset-all-btn">
            <i class="fas fa-undo"></i>
            Tout réinitialiser
          </button>
        </div>

        <!-- Liste des résultats groupés -->
        <div class="results-list">
          <div
            v-for="(groupe, index) in resultatsGroupes"
            :key="index"
            class="result-group compact-group"
          >
            <!-- En-tête de groupe -->
            <div
              v-if="groupe.estGroupe"
              class="group-header"
              :class="getGroupHeaderClass(groupe.type)"
            >
              <span class="group-icon">{{ getGroupIcon(groupe.type) }}</span>
              <span class="group-title">{{ groupe.titre }}</span>
              <span class="group-count">({{ groupe.elements.length }} éléments)</span>
            </div>

            <!-- Éléments du groupe -->
            <div
              v-for="(resultat, resultIndex) in groupe.elements"
              :key="resultat.id + '-' + resultIndex"
              class="result-item slim-item"
              :class="'type-' + resultat.type"
            >
              <router-link 
                :to="getDetailLink(resultat)"
                class="result-link"
              >
                <div class="result-content flex-content">
                  
                  <!-- Scène -->
                  <div v-if="resultat.type === 'scene'" class="scene-result">
                    <div class="result-header flex-header">
                      <span class="result-type-badge scene-badge">🎬 Scène</span>
                      <h3 class="result-title">{{ resultat.titre }}</h3>
                      <span class="result-status" :class="'status-' + resultat.statut">
                        {{ formatStatut(resultat.statut) }}
                      </span>
                    </div>
                    
                    <div class="result-details grid-details">
                      <div class="detail-row">
                        <span class="detail-label">📅 Date :</span>
                        <span>{{ formatDate(resultat.dateTournage) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">🕒 Heure :</span>
                        <span>{{ resultat.heureDebut }} - {{ resultat.heureFin }}</span>
                      </div>
                      <div v-if="resultat.lieuNom" class="detail-row">
                        <span class="detail-label">🏛️ Lieu :</span>
                        <span>{{ resultat.lieuNom }}</span>
                      </div>
                      <div v-if="resultat.plateauNom" class="detail-row">
                        <span class="detail-label">🎭 Plateau :</span>
                        <span>{{ resultat.plateauNom }}</span>
                      </div>
                      <div v-if="resultat.personnageNom" class="detail-row">
                        <span class="detail-label">👥 Personnage :</span>
                        <span>{{ resultat.personnageNom }}</span>
                        <span v-if="resultat.comedienNom" class="comedien">
                          ({{ resultat.comedienNom }})
                        </span>
                      </div>
                    </div>

                    <!-- Dialogues -->
                    <div v-if="resultat.dialogues && resultat.dialogues.length > 0" class="dialogues-section compact-dialogues">
                      <div class="dialogues-title">💬 Dialogues :</div>
                      <div class="dialogues-list">
                        <div
                          v-for="(dialogue, dialogueIndex) in resultat.dialogues"
                          :key="dialogueIndex"
                          class="dialogue-item"
                        >
                          "{{ dialogue }}"
                        </div>
                      </div>
                    </div>

                    <!-- Hiérarchie -->
                    <div class="hierarchy flex-hierarchy">
                      <span v-if="resultat.projetTitre" class="hierarchy-item">
                        📁 {{ resultat.projetTitre }}
                      </span>
                      <span v-if="resultat.episodeTitre" class="hierarchy-item">
                        ▶️ {{ resultat.episodeTitre }}
                      </span>
                      <span v-if="resultat.sequenceTitre" class="hierarchy-item">
                        🎞️ {{ resultat.sequenceTitre }}
                      </span>
                    </div>

                    <!-- Indicateur de clic -->
                    <div class="view-details">
                      <span class="view-details-text">📖 Voir tous les détails →</span>
                    </div>
                  </div>

                  <!-- Personnage -->
                  <div v-else-if="resultat.type === 'personnage'" class="personnage-result">
                    <div class="result-header flex-header">
                      <span class="result-type-badge personnage-badge">👥 Personnage</span>
                      <h3 class="result-title">{{ resultat.titre }}</h3>
                    </div>
                    <div class="result-details grid-details">
                      <div v-if="resultat.description" class="detail-row">
                        <span class="detail-label">📝 Description :</span>
                        <span>{{ resultat.description }}</span>
                      </div>
                      <div v-if="resultat.comedienNom" class="detail-row">
                        <span class="detail-label">🎭 Comédien :</span>
                        <span>{{ resultat.comedienNom }}</span>
                      </div>
                      <div v-if="resultat.projetTitre" class="detail-row">
                        <span class="detail-label">📁 Projet :</span>
                        <span>{{ resultat.projetTitre }}</span>
                      </div>
                    </div>
                    <div class="view-details">
                      <span class="view-details-text">👤 Voir fiche personnage →</span>
                    </div>
                  </div>

                  <!-- Lieu -->
                  <div v-else-if="resultat.type === 'lieu'" class="lieu-result">
                    <div class="result-header flex-header">
                      <span class="result-type-badge lieu-badge">🏛️ Lieu</span>
                      <h3 class="result-title">{{ resultat.titre }}</h3>
                    </div>
                    <div class="result-details grid-details">
                      <div v-if="resultat.description" class="detail-row">
                        <span class="detail-label">📝 Description :</span>
                        <span>{{ resultat.description }}</span>
                      </div>
                      <div v-if="resultat.projetTitre" class="detail-row">
                        <span class="detail-label">📁 Projet :</span>
                        <span>{{ resultat.projetTitre }}</span>
                      </div>
                    </div>
                    <div class="view-details">
                      <span class="view-details-text">🏛️ Voir fiche lieu →</span>
                    </div>
                  </div>

                  <!-- Plateau -->
                  <div v-else-if="resultat.type === 'plateau'" class="plateau-result">
                    <div class="result-header flex-header">
                      <span class="result-type-badge plateau-badge">🎭 Plateau</span>
                      <h3 class="result-title">{{ resultat.titre }}</h3>
                    </div>
                    <div class="result-details grid-details">
                      <div v-if="resultat.description" class="detail-row">
                        <span class="detail-label">📝 Description :</span>
                        <span>{{ resultat.description }}</span>
                      </div>
                      <div v-if="resultat.lieuNom" class="detail-row">
                        <span class="detail-label">🏛️ Lieu :</span>
                        <span>{{ resultat.lieuNom }}</span>
                      </div>
                    </div>
                    <div class="view-details">
                      <span class="view-details-text">🎭 Voir fiche plateau →</span>
                    </div>
                  </div>

                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { rechercheAvancee, getStatutsDisponibles, getProjets } from '../service/rechercheService'
import '../assets/css/recherche.css';

export default {
  name: 'RechercheAvancee',
  data() {
    return {
      showTypesDropdown: false,
      showStatutsDropdown: false,
      showDateFilters: false,
      projets: [],
      criteres: {
        termeRecherche: '',
        typesRecherche: ['scenes', 'personnages', 'lieux', 'plateaux'],
        dateDebut: null,
        dateFin: null,
        statuts: [],
        regroupement: '',
        projetId: null,
        page: 0,
        taille: 50
      },
      resultats: [],
      statutsDisponibles: [],
      chargement: false
    }
  },
  computed: {
    resultatsGroupes() {
      if (!this.criteres.regroupement) {
        return [{
          estGroupe: false,
          elements: this.resultats
        }]
      }

      const groupes = {}
      this.resultats.forEach(resultat => {
        if (resultat.type === 'groupe') return
        
        const cleGroupe = this.getCleGroupe(resultat)
        if (!groupes[cleGroupe]) {
          groupes[cleGroupe] = []
        }
        groupes[cleGroupe].push(resultat)
      })

      return Object.entries(groupes).map(([cle, elements]) => {
        const groupeHeader = this.resultats.find(r => 
          r.type === 'groupe' && r.groupeValeur === cle
        )
        return {
          estGroupe: true,
          type: this.criteres.regroupement,
          titre: groupeHeader ? groupeHeader.titre : `Groupe: ${cle}`,
          elements: elements
        }
      })
    }
  },
  async mounted() {
    await this.chargerProjets()
    await this.chargerStatuts()
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async chargerProjets() {
      try {
        this.projets = await getProjets()
      } catch (error) {
        console.error('Erreur chargement projets:', error)
        this.projets = []
      }
    },

    async onProjetChange() {
      // Quand le projet change, on peut recharger les statuts si nécessaire
      console.log('Projet sélectionné:', this.criteres.projetId)
    },

    getProjetNom() {
      if (!this.criteres.projetId) return ''
      const projet = this.projets.find(p => p.id === this.criteres.projetId)
      return projet ? projet.titre : 'Projet inconnu'
    },

    reinitialiserProjet() {
      this.criteres.projetId = null
    },

    toggleTypesDropdown() {
      this.showTypesDropdown = !this.showTypesDropdown
      this.showStatutsDropdown = false
    },
    
    toggleStatutsDropdown() {
      this.showStatutsDropdown = !this.showStatutsDropdown
      this.showTypesDropdown = false
    },
    
    toggleDateFilters() {
      this.showDateFilters = !this.showDateFilters
    },
    
    handleClickOutside(event) {
      if (!event.target.closest('.dropdown-filter')) {
        this.showTypesDropdown = false
        this.showStatutsDropdown = false
      }
    },
    
    getTypesDisplayText() {
      if (this.criteres.typesRecherche.length === 0) return 'Aucun type'
      if (this.criteres.typesRecherche.length === 4) return 'Tous les types'
      
      const typesMap = {
        scenes: 'Scènes',
        personnages: 'Personnages',
        lieux: 'Lieux',
        plateaux: 'Plateaux'
      }
      
      const selectedTypes = this.criteres.typesRecherche.map(type => typesMap[type])
      return selectedTypes.join(', ')
    },
    
    getStatutsDisplayText() {
      if (this.criteres.statuts.length === 0) return 'Tous statuts'
      if (this.criteres.statuts.length === this.statutsDisponibles.length) return 'Tous statuts'
      
      return `${this.criteres.statuts.length} statut(s)`
    },
    
    updateTypesSelection() {
      this.$forceUpdate()
    },
    
    updateStatutsSelection() {
      this.$forceUpdate()
    },
    
    reinitialiserDates() {
      this.criteres.dateDebut = null
      this.criteres.dateFin = null
    },
    
    async chargerStatuts() {
      try {
        this.statutsDisponibles = await getStatutsDisponibles()
      } catch (error) {
        console.error('Erreur chargement statuts:', error)
        this.statutsDisponibles = ['planifie', 'confirme', 'en_cours', 'termine', 'reporte']
      }
    },
    
    // async rechercher() {
    //   this.chargement = true
    //   try {
    //     const criteresNettoyes = { ...this.criteres }
    //     if (!criteresNettoyes.termeRecherche) delete criteresNettoyes.termeRecherche
    //     if (criteresNettoyes.statuts.length === 0) delete criteresNettoyes.statuts
    //     if (!criteresNettoyes.regroupement) delete criteresNettoyes.regroupement
    //     if (!criteresNettoyes.projetId) delete criteresNettoyes.projetId

    //     this.resultats = await rechercheAvancee(criteresNettoyes)
    //   } catch (error) {
    //     console.error('Erreur recherche:', error)
    //     alert('Erreur lors de la recherche')
    //   } finally {
    //     this.chargement = false
    //   }
    // },
    
    async rechercher() {
  this.chargement = true
  try {
    const criteresNettoyes = { ...this.criteres }
    
    // Convertir les types de recherche pour le backend
    if (criteresNettoyes.typesRecherche && criteresNettoyes.typesRecherche.length > 0) {
      criteresNettoyes.typesRecherche = criteresNettoyes.typesRecherche.map(type => 
        type.replace('scenes', 'scenes')
            .replace('personnages', 'personnages')
            .replace('lieux', 'lieux')
            .replace('plateaux', 'plateaux')
      );
    }
    
    console.log('Critères envoyés:', criteresNettoyes); // Pour debug
    
    this.resultats = await rechercheAvancee(criteresNettoyes)
  } catch (error) {
    console.error('Erreur recherche:', error)
    alert('Erreur lors de la recherche')
  } finally {
    this.chargement = false
  }
},

    reinitialiser() {
      this.criteres = {
        termeRecherche: '',
        typesRecherche: ['scenes', 'personnages', 'lieux', 'plateaux'],
        dateDebut: null,
        dateFin: null,
        statuts: [],
        regroupement: '',
        projetId: null,
        page: 0,
        taille: 50
      }
      this.resultats = []
      this.showDateFilters = false
      this.showTypesDropdown = false
      this.showStatutsDropdown = false
    },
    
    formatStatut(statut) {
      const statutsMap = {
        planifie: '🟡 Planifié',
        confirme: '🔵 Confirmé',
        en_cours: '🟠 En cours',
        termine: '🟢 Terminé',
        reporte: '🔴 Reporté'
      }
      return statutsMap[statut] || statut
    },
    
    formatDate(date) {
      if (!date) return 'Non spécifiée'
      return new Date(date).toLocaleDateString('fr-FR')
    },
    
    getCleGroupe(resultat) {
      switch (this.criteres.regroupement) {
        case 'plateau': return resultat.plateauNom || 'Non spécifié'
        case 'lieu': return resultat.lieuNom || 'Non spécifié'
        case 'personnage': return resultat.personnageNom || 'Non spécifié'
        case 'statut': return resultat.statut || 'Non spécifié'
        default: return 'Autre'
      }
    },
    
    getRegroupementLabel() {
      const labels = {
        plateau: 'Plateau',
        lieu: 'Lieu',
        personnage: 'Personnage',
        statut: 'Statut'
      }
      return labels[this.criteres.regroupement] || 'Aucun'
    },
    
    getGroupIcon(type) {
      const icons = {
        plateau: '🎭',
        lieu: '🏛️',
        personnage: '👥',
        statut: '📊'
      }
      return icons[type] || '📁'
    },
    
    getGroupHeaderClass(type) {
      return `group-header-${type}`
    },
    
    getDetailLink(resultat) {
      return {
        name: 'ResultatRecherche',
        params: {
          type: resultat.type,
          id: resultat.id
        },
        query: {
          recherche: JSON.stringify(this.criteres)
        }
      }
    }
  }
}
</script>

