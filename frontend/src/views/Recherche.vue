<template>
  <div class="app-wrapper-global-recherche">
    <!-- Sidebar latérale -->
    <div class="search-sidebar-recherche">
      <div class="sidebar-header-recherche">
        <h2 class="sidebar-title-recherche">Filtres</h2>
        <p class="sidebar-subtitle-recherche">Affinez votre recherche</p>
      </div>

      <!-- Section Projet -->
      <div class="filter-section-recherche">
        <h3 class="section-title-recherche"><i class="fas fa-folder"></i> Projet</h3>
        <div class="filter-group-recherche">
          <select v-model="criteres.projetId" class="filter-select-recherche" @change="onProjetChange">
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
      </div>

      <!-- Section Types -->
      <div class="filter-section-recherche">
        <h3 class="section-title-recherche"><i class="fas fa-bullseye"></i> Types</h3>
        <div class="filter-group-recherche">
          <div class="filter-dropdown-recherche">
            <button @click="toggleTypesDropdown" class="dropdown-trigger-recherche" :class="{ open: showTypesDropdown }">
              <span class="dropdown-text-recherche">{{ getTypesDisplayText() }}</span>
              <i class="fas fa-chevron-down dropdown-icon-recherche"></i>
            </button>
            <div v-if="showTypesDropdown" class="dropdown-menu-recherche">
              <div class="dropdown-options-recherche">
                <label class="dropdown-option-recherche">
                  <input type="checkbox" value="scenes" v-model="criteres.typesRecherche" @change="updateTypesSelection" />
                  <i class="fas fa-film"></i> Scènes
                </label>
                <label class="dropdown-option-recherche">
                  <input type="checkbox" value="personnages" v-model="criteres.typesRecherche" @change="updateTypesSelection" />
                  <i class="fas fa-users"></i> Personnages
                </label>
                <label class="dropdown-option-recherche">
                  <input type="checkbox" value="lieux" v-model="criteres.typesRecherche" @change="updateTypesSelection" />
                  <i class="fas fa-landmark"></i> Lieux
                </label>
                <label class="dropdown-option-recherche">
                  <input type="checkbox" value="plateaux" v-model="criteres.typesRecherche" @change="updateTypesSelection" />
                  <i class="fas fa-theater-masks"></i> Plateaux
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Statuts -->
      <div class="filter-section-recherche">
        <h3 class="section-title-recherche"><i class="fas fa-chart-bar"></i> Statuts</h3>
        <div class="filter-group-recherche">
          <div class="filter-dropdown-recherche">
            <button @click="toggleStatutsDropdown" class="dropdown-trigger-recherche" :class="{ open: showStatutsDropdown }">
              <span class="dropdown-text-recherche">{{ getStatutsDisplayText() }}</span>
              <i class="fas fa-chevron-down dropdown-icon-recherche"></i>
            </button>
            <div v-if="showStatutsDropdown" class="dropdown-menu-recherche">
              <div class="dropdown-options-recherche">
                <label v-for="statut in statutsDisponibles" :key="statut" class="dropdown-option-recherche">
                  <input type="checkbox" :value="statut" v-model="criteres.statuts" @change="updateStatutsSelection" />
                  {{ formatStatut(statut) }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Dates -->
      <div class="filter-section-recherche">
        <h3 class="section-title-recherche"><i class="fas fa-calendar-alt"></i> Dates</h3>
        <div class="filter-group-recherche">
          <!-- Date début -->
          <div class="filter-dropdown-recherche">
            <button @click="toggleDateDebutDropdown" class="dropdown-trigger-recherche" :class="{ open: showDateDebutDropdown }">
              <span class="dropdown-text-recherche">{{ getDateDebutDisplayText() }}</span>
              <i class="fas fa-chevron-down dropdown-icon-recherche"></i>
            </button>
            <div v-if="showDateDebutDropdown" class="dropdown-menu-recherche">
              <div class="dropdown-options-recherche">
                <input 
                  type="date" 
                  v-model="criteres.dateDebut" 
                  @change="updateDateDebut"
                  class="date-input-recherche" 
                />
                <button @click="clearDateDebut" class="clear-date-btn-recherche">
                  <i class="fas fa-times"></i> Effacer
                </button>
              </div>
            </div>
          </div>

          <!-- Date fin -->
          <div class="filter-dropdown-recherche">
            <button @click="toggleDateFinDropdown" class="dropdown-trigger-recherche" :class="{ open: showDateFinDropdown }">
              <span class="dropdown-text-recherche">{{ getDateFinDisplayText() }}</span>
              <i class="fas fa-chevron-down dropdown-icon-recherche"></i>
            </button>
            <div v-if="showDateFinDropdown" class="dropdown-menu-recherche">
              <div class="dropdown-options-recherche">
                <input 
                  type="date" 
                  v-model="criteres.dateFin" 
                  @change="updateDateFin"
                  class="date-input-recherche" 
                />
                <button @click="clearDateFin" class="clear-date-btn-recherche">
                  <i class="fas fa-times"></i> Effacer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Regroupement -->
      <div class="filter-section-recherche">
        <h3 class="section-title-recherche"><i class="fas fa-layer-group"></i> Regroupement</h3>
        <div class="filter-group-recherche">
          <select v-model="criteres.regroupement" class="filter-select-recherche">
            <option value="">Aucun regroupement</option>
            <option value="plateau">Plateau</option>
            <option value="lieu">Lieu</option>
            <option value="personnage">Personnage</option>
            <option value="statut">Statut</option>
          </select>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="sidebar-actions-recherche">
        <button @click="rechercher" class="search-btn-sidebar-recherche" :disabled="chargement">
          <i :class="chargement ? 'fas fa-spinner fa-spin' : 'fas fa-search'"></i>
          {{ chargement ? 'Recherche...' : 'Lancer la recherche' }}
        </button>
        <button @click="reinitialiser" class="reset-btn-sidebar-recherche">
          <i class="fas fa-undo"></i>
          Tout réinitialiser
        </button>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="search-body-recherche">
      <div class="search-main-content-recherche">
        <!-- En-tête principal -->
        <div class="main-header-recherche">
          <h1 class="page-title-recherche"><i class="fas fa-search"></i> Recherche Multiple</h1>
          <p class="page-subtitle-recherche">Trouvez des scènes, personnages, lieux et plateaux selon vos critères</p>
        </div>

        <!-- Barre de recherche principale -->
        <div class="search-bar-main-recherche">
          <div class="search-input-container-recherche">
            <i class="fas fa-search search-icon-main-recherche"></i>
            <input
              v-model="criteres.termeRecherche"
              type="text"
              placeholder="Rechercher des personnages, lieux, dialogues, titres..."
              class="search-input-large-recherche"
              @keyup.enter="rechercher"
            />
            <button v-if="criteres.termeRecherche" @click="criteres.termeRecherche = ''" class="clear-search-btn-main-recherche">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Indicateur de filtre projet actif -->
        <div v-if="criteres.projetId" class="projet-filter-indicator-recherche">
          <div class="projet-indicator-content-recherche">
            <span class="projet-label-recherche">
              <i class="fas fa-folder"></i> Projet sélectionné :
            </span>
            <span class="projet-nom-recherche">{{ getProjetNom() }}</span>
            <button @click="reinitialiserProjet" class="clear-projet-btn-recherche">
              <i class="fas fa-times"></i>
              Changer de projet
            </button>
          </div>
        </div>

        <!-- Résultats -->
        <div class="results-section-recherche">
          <div v-if="resultats.length === 0 && !chargement" class="empty-state-recherche">
            <div class="empty-icon-recherche">
              <i class="fas fa-search"></i>
            </div>
            <h3>Aucun résultat</h3>
            <p v-if="criteres.projetId">
              Aucun résultat trouvé pour le projet "{{ getProjetNom() }}" avec les critères actuels
            </p>
            <p v-else>
              Aucun résultat trouvé avec les critères de recherche actuels
            </p>
          </div>

          <div v-else-if="chargement" class="loading-state-recherche">
            <div class="spinner-recherche">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Recherche en cours...</p>
          </div>

          <div v-else class="results-container-recherche modern-results-recherche">
            <div class="results-header-recherche">
              <h2>
                <i class="fas fa-list-alt"></i> Résultats ({{ resultats.length }})
              </h2>
              <div class="results-info-recherche">
                <span v-if="criteres.projetId" class="projet-info-recherche">
                  <i class="fas fa-folder"></i> Projet : <strong>{{ getProjetNom() }}</strong> 
                </span>
                <span v-if="criteres.regroupement" class="regroupement-info-recherche">
                  • <i class="fas fa-layer-group"></i> Groupés par : <strong>{{ getRegroupementLabel() }}</strong>
                </span>
              </div>
              <button @click="reinitialiser" class="reset-all-btn-recherche">
                <i class="fas fa-undo"></i>
                Tout réinitialiser
              </button>
            </div>
            
            <!-- Liste des résultats groupés -->
            <div class="results-list-recherche">
              <div
                v-for="(groupe, index) in resultatsGroupes"
                :key="index"
                class="result-group-recherche"
              >
                <!-- En-tête de groupe -->
                <div
                  v-if="groupe.estGroupe"
                  class="group-header-recherche"
                  :class="getGroupHeaderClass(groupe.type)"
                >
                  <span class="group-icon-recherche">{{ getGroupIcon(groupe.type) }}</span>
                  <span class="group-title-recherche">{{ groupe.titre }}</span>
                  <span class="group-count-recherche">({{ groupe.elements.length }} éléments)</span>
                </div>

                <!-- Éléments du groupe -->
                <div
                  v-for="(resultat, resultIndex) in groupe.elements"
                  :key="resultat.id + '-' + resultIndex"
                  class="result-item-recherche"
                  :class="'type-' + resultat.type"
                >
                  <router-link 
                    :to="getDetailLink(resultat)"
                    class="result-link-recherche"
                  >
                    <div class="result-content-recherche">
                      
                      <!-- Scène -->
                      <div v-if="resultat.type === 'scene'" class="scene-result-recherche">
                        <div class="result-header-recherche">
                          <span class="result-type-badge-recherche scene-badge-recherche">
                            <i class="fas fa-film"></i> Scène
                          </span>
                          <h3 class="result-title-recherche">{{ resultat.titre }}</h3>
                          <span class="result-status-recherche" :class="'status-' + resultat.statut">
                            {{ formatStatut(resultat.statut) }}
                          </span>
                        </div>
                        
                        <div class="result-details-recherche">
                          <div class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-calendar-alt"></i> Date :
                            </span>
                            <span>{{ formatDate(resultat.dateTournage) }}</span>
                          </div>
                          <div class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-clock"></i> Heure :
                            </span>
                            <span>{{ resultat.heureDebut }} - {{ resultat.heureFin }}</span>
                          </div>
                          <div v-if="resultat.lieuNom" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-landmark"></i> Lieu :
                            </span>
                            <span>{{ resultat.lieuNom }}</span>
                          </div>
                          <div v-if="resultat.plateauNom" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-theater-masks"></i> Plateau :
                            </span>
                            <span>{{ resultat.plateauNom }}</span>
                          </div>
                          <div v-if="resultat.personnageNom" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-users"></i> Personnage :
                            </span>
                            <span>{{ resultat.personnageNom }}</span>
                            <span v-if="resultat.comedienNom" class="comedien-recherche">
                              ({{ resultat.comedienNom }})
                            </span>
                          </div>
                        </div>

                        <!-- Dialogues -->
                        <div v-if="resultat.dialogues && resultat.dialogues.length > 0" class="dialogues-section-recherche">
                          <div class="dialogues-title-recherche">
                            <i class="fas fa-comments"></i> Dialogues :
                          </div>
                          <div class="dialogues-list-recherche">
                            <div
                              v-for="(dialogue, dialogueIndex) in resultat.dialogues"
                              :key="dialogueIndex"
                              class="dialogue-item-recherche"
                            >
                              "{{ dialogue }}"
                            </div>
                          </div>
                        </div>

                        <!-- Hiérarchie -->
                        <div class="hierarchy-recherche">
                          <span v-if="resultat.projetTitre" class="hierarchy-item-recherche">
                            <i class="fas fa-folder"></i> {{ resultat.projetTitre }}
                          </span>
                          <span v-else class="hierarchy-item-recherche sans-projet-recherche">
                            <i class="fas fa-info-circle"></i> Sans projet
                          </span>
                          <span v-if="resultat.episodeTitre" class="hierarchy-item-recherche">
                            <i class="fas fa-film"></i> {{ resultat.episodeTitre }}
                          </span>
                          <span v-if="resultat.sequenceTitre" class="hierarchy-item-recherche">
                            <i class="fas fa-list-ol"></i> {{ resultat.sequenceTitre }}
                          </span>
                        </div>

                        <!-- Indicateur de clic -->
                        <div class="view-details-recherche">
                          <span class="view-details-text-recherche">
                            <i class="fas fa-book-open"></i> Voir tous les détails →
                          </span>
                        </div>
                      </div>

                      <!-- Personnage -->
                      <div v-else-if="resultat.type === 'personnage'" class="personnage-result-recherche">
                        <div class="result-header-recherche">
                          <span class="result-type-badge-recherche personnage-badge-recherche">
                            <i class="fas fa-users"></i> Personnage
                          </span>
                          <h3 class="result-title-recherche">{{ resultat.titre }}</h3>
                        </div>
                        <div class="result-details-recherche">
                          <div v-if="resultat.description" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-file-alt"></i> Description :
                            </span>
                            <span>{{ resultat.description }}</span>
                          </div>
                          <div v-if="resultat.comedienNom" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-user-tie"></i> Comédien :
                            </span>
                            <span>{{ resultat.comedienNom }}</span>
                          </div>
                          <div v-if="resultat.projetTitre" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-folder"></i> Projet :
                            </span>
                            <span>{{ resultat.projetTitre }}</span>
                          </div>
                          <div v-else class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-info-circle"></i> Projet :
                            </span>
                            <span class="sans-projet-recherche">Sans projet</span>
                          </div>
                        </div>
                        <div class="view-details-recherche">
                          <span class="view-details-text-recherche">
                            <i class="fas fa-user-circle"></i> Voir fiche personnage →
                          </span>
                        </div>
                      </div>

                      <!-- Lieu -->
                      <div v-else-if="resultat.type === 'lieu'" class="lieu-result-recherche">
                        <div class="result-header-recherche">
                          <span class="result-type-badge-recherche lieu-badge-recherche">
                            <i class="fas fa-landmark"></i> Lieu
                          </span>
                          <h3 class="result-title-recherche">{{ resultat.titre }}</h3>
                        </div>
                        <div class="result-details-recherche">
                          <div v-if="resultat.description" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-file-alt"></i> Description :
                            </span>
                            <span>{{ resultat.description }}</span>
                          </div>
                          <div v-if="resultat.projetTitre" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-folder"></i> Projet :
                            </span>
                            <span>{{ resultat.projetTitre }}</span>
                          </div>
                          <div v-else class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-info-circle"></i> Projet :
                            </span>
                            <span class="sans-projet-recherche">Sans projet</span>
                          </div>
                        </div>
                        <div class="view-details-recherche">
                          <span class="view-details-text-recherche">
                            <i class="fas fa-landmark"></i> Voir fiche lieu →
                          </span>
                        </div>
                      </div>

                      <!-- Plateau -->
                      <div v-else-if="resultat.type === 'plateau'" class="plateau-result-recherche">
                        <div class="result-header-recherche">
                          <span class="result-type-badge-recherche plateau-badge-recherche">
                            <i class="fas fa-theater-masks"></i> Plateau
                          </span>
                          <h3 class="result-title-recherche">{{ resultat.titre }}</h3>
                        </div>
                        <div class="result-details-recherche">
                          <div v-if="resultat.description" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-file-alt"></i> Description :
                            </span>
                            <span>{{ resultat.description }}</span>
                          </div>
                          <div v-if="resultat.lieuNom" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-landmark"></i> Lieu :
                            </span>
                            <span>{{ resultat.lieuNom }}</span>
                          </div>
                          <div v-if="resultat.projetTitre" class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-folder"></i> Projet :
                            </span>
                            <span>{{ resultat.projetTitre }}</span>
                          </div>
                          <div v-else class="detail-row-recherche">
                            <span class="detail-label-recherche">
                              <i class="fas fa-info-circle"></i> Projet :
                            </span>
                            <span class="sans-projet-recherche">Sans projet</span>
                          </div>
                        </div>
                        <div class="view-details-recherche">
                          <span class="view-details-text-recherche">
                            <i class="fas fa-theater-masks"></i> Voir fiche plateau →
                          </span>
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
      // États des dropdowns
      showTypesDropdown: false,
      showStatutsDropdown: false,
      showDateDebutDropdown: false,
      showDateFinDropdown: false,

      // Données
      projets: [],
      statutsDisponibles: [],
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
    // Méthodes de chargement des données
    async chargerProjets() {
      try {
        this.projets = await getProjets()
      } catch (error) {
        console.error('Erreur chargement projets:', error)
        this.projets = []
      }
    },

    async onProjetChange() {
      console.log('Mode recherche:', this.criteres.projetId ? `Projet ${this.criteres.projetId}` : 'Sans projet')
    },

    async chargerStatuts() {
      try {
        this.statutsDisponibles = await getStatutsDisponibles()
      } catch (error) {
        console.error('Erreur chargement statuts:', error)
        this.statutsDisponibles = ['planifie', 'confirme', 'en_cours', 'termine', 'reporte']
      }
    },

    // Méthodes de gestion des dropdowns
    toggleTypesDropdown() {
      this.showTypesDropdown = !this.showTypesDropdown
      this.showStatutsDropdown = false
    },
    
    toggleStatutsDropdown() {
      this.showStatutsDropdown = !this.showStatutsDropdown
      this.showTypesDropdown = false
    },
    
    handleClickOutside(event) {
      if (!event.target.closest('.filter-dropdown-recherche')) {
        this.showTypesDropdown = false
        this.showStatutsDropdown = false
        this.showDateDebutDropdown = false
        this.showDateFinDropdown = false
      }
    },

    // Méthodes d'affichage des textes
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

    // Méthodes de mise à jour des sélections
    updateTypesSelection() {
      this.$forceUpdate()
    },
    
    updateStatutsSelection() {
      this.$forceUpdate()
    },

    // Méthodes utilitaires
    getProjetNom() {
      if (!this.criteres.projetId) return ''
      const projet = this.projets.find(p => p.id === this.criteres.projetId)
      return projet ? projet.titre : 'Projet inconnu'
    },

    reinitialiserProjet() {
      this.criteres.projetId = null
    },

    reinitialiserDates() {
      this.criteres.dateDebut = null
      this.criteres.dateFin = null
    },
    
    normaliserDates() {
      // S'assurer que les dates sont au format YYYY-MM-DD
      if (this.criteres.dateDebut) {
        const date = new Date(this.criteres.dateDebut);
        this.criteres.dateDebut = date.toISOString().split('T')[0];
      }
      if (this.criteres.dateFin) {
        const date = new Date(this.criteres.dateFin);
        this.criteres.dateFin = date.toISOString().split('T')[0];
      }
    },

    // Méthodes de recherche
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
        
        console.log('Critères envoyés:', criteresNettoyes);
        
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
      return `group-header-${type}-recherche`
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
    },

    toggleDateDebutDropdown() {
    this.showDateDebutDropdown = !this.showDateDebutDropdown
    this.showDateFinDropdown = false
    this.closeOtherDropdowns('dateDebut')
  },

  toggleDateFinDropdown() {
    this.showDateFinDropdown = !this.showDateFinDropdown
    this.showDateDebutDropdown = false
    this.closeOtherDropdowns('dateFin')
  },

  closeOtherDropdowns(current) {
    const dropdowns = ['types', 'statuts', 'dateDebut', 'dateFin']
    dropdowns.forEach(dropdown => {
      if (dropdown !== current) {
        if (dropdown === 'types') this.showTypesDropdown = false
        if (dropdown === 'statuts') this.showStatutsDropdown = false
        if (dropdown === 'dateDebut') this.showDateDebutDropdown = false
        if (dropdown === 'dateFin') this.showDateFinDropdown = false
      }
    })
  },

  // Méthodes d'affichage des textes
  getDateDebutDisplayText() {
    return this.criteres.dateDebut ? this.formatDateDisplay(this.criteres.dateDebut) : 'Date début'
  },

  getDateFinDisplayText() {
    return this.criteres.dateFin ? this.formatDateDisplay(this.criteres.dateFin) : 'Date fin'
  },

  formatDateDisplay(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  },
  updateDateDebut() {
    this.showDateDebutDropdown = false
    this.normaliserDates()
  },

  updateDateFin() {
    this.showDateFinDropdown = false
    this.normaliserDates()
  },

  clearDateDebut() {
    this.criteres.dateDebut = null
    this.showDateDebutDropdown = false
  },

  clearDateFin() {
    this.criteres.dateFin = null
    this.showDateFinDropdown = false
  }

  }
}
</script>

