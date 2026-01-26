<template>
  <div class="app-wrapper-global">
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

      <!-- Section Épisode (visible seulement si projet sélectionné) -->
      <div v-if="criteres.projetId" class="filter-section-recherche">
        <h3 class="section-title-recherche"><i class="fas fa-play-circle"></i> Épisode</h3>
        <div class="filter-group-recherche">
          <select v-model="criteres.episodeId" class="filter-select-recherche" @change="onEpisodeChange">
            <option value="">Tous les épisodes</option>
            <option 
              v-for="episode in episodes" 
              :key="episode.id" 
              :value="episode.id"
            >
              {{ episode.titre }}
            </option>
          </select>
        </div>
      </div>

      <!-- Section Séquence (visible seulement si épisode sélectionné) -->
      <div v-if="criteres.episodeId" class="filter-section-recherche">
        <h3 class="section-title-recherche"><i class="fas fa-layer-group"></i> Séquence</h3>
        <div class="filter-group-recherche">
          <select v-model="criteres.sequenceId" class="filter-select-recherche">
            <option value="">Toutes les séquences</option>
            <option 
              v-for="sequence in sequences" 
              :key="sequence.id" 
              :value="sequence.id"
            >
              {{ sequence.titre }}
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
                <label class="dropdown-option-recherche">
                  <input type="checkbox" value="episodes" v-model="criteres.typesRecherche" @change="updateTypesSelection" />
                  <i class="fas fa-play-circle"></i> Épisodes
                </label>
                <label class="dropdown-option-recherche">
                  <input type="checkbox" value="sequences" v-model="criteres.typesRecherche" @change="updateTypesSelection" />
                  <i class="fas fa-layer-group"></i> Séquences
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
            <option value="episode">Épisode</option>
            <option value="sequence">Séquence</option>
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
        <!-- Section en-tête avec titre et barre de recherche -->
        <div class="header-search-section">
          <div class="main-header-recherche">
            <h1 class="page-title-recherche"><i class="fas fa-search"></i> Recherche Multiple</h1>
            <p class="page-subtitle-recherche">Trouvez des scènes, personnages, lieux, plateaux, épisodes et séquences selon vos critères</p>
          </div>

          <!-- Barre de recherche principale -->
          <div class="search-bar-main-recherche">
            <div class="search-input-container-recherche">
              <input
                v-model="criteres.termeRecherche"
                type="text"
                placeholder="Rechercher des personnages, lieux, dialogues, titres..."
                class="search-input-large-recherche"
                @keyup.enter="rechercher"
              />
              <!-- Bouton de recherche cliquable à droite -->
              <button @click="rechercher" class="search-btn-main-recherche" :disabled="chargement">
                <i :class="chargement ? 'fas fa-spinner fa-spin' : 'fas fa-search'"></i>
              </button>
              <button v-if="criteres.termeRecherche" @click="criteres.termeRecherche = ''" class="clear-search-btn-main-recherche">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Section filtres actifs et résultats -->
        <div class="filters-results-section">
          <!-- Filtres actifs (projet, épisode, séquence) -->
          <div v-if="criteres.projetId || criteres.episodeId || criteres.sequenceId" class="active-filters-container">
            <!-- Indicateur de filtre projet actif -->
            <div v-if="criteres.projetId" class="projet-filter-indicator-recherche">
              <div class="projet-indicator-content-recherche">
                <span class="projet-label-recherche">
                  <i class="fas fa-folder"></i> Projet :
                </span>
                <span class="projet-nom-recherche">{{ getProjetNom() }}</span>
                <button @click="reinitialiserProjet" class="clear-projet-btn-recherche">
                  <i class="fas fa-times"></i>
                  Changer
                </button>
              </div>
            </div>

            <!-- Indicateur de filtre épisode actif -->
            <div v-if="criteres.episodeId" class="projet-filter-indicator-recherche">
              <div class="projet-indicator-content-recherche">
                <span class="projet-label-recherche">
                  <i class="fas fa-play-circle"></i> Épisode :
                </span>
                <span class="projet-nom-recherche">{{ getEpisodeNom() }}</span>
                <button @click="reinitialiserEpisode" class="clear-projet-btn-recherche">
                  <i class="fas fa-times"></i>
                  Changer
                </button>
              </div>
            </div>

            <!-- Indicateur de filtre séquence actif -->
            <div v-if="criteres.sequenceId" class="projet-filter-indicator-recherche">
              <div class="projet-indicator-content-recherche">
                <span class="projet-label-recherche">
                  <i class="fas fa-layer-group"></i> Séquence :
                </span>
                <span class="projet-nom-recherche">{{ getSequenceNom() }}</span>
                <button @click="reinitialiserSequence" class="clear-projet-btn-recherche">
                  <i class="fas fa-times"></i>
                  Changer
                </button>
              </div>
            </div>
          </div>

          <!-- Indicateur du nombre de résultats -->
          <div v-if="!chargement && resultats.length > 0" class="result-count-indicator-Scenariste">
            <i class="fas fa-check-circle"></i>
            <span class="count-text-Scenariste">
              <strong>{{ resultats.length }}</strong> résultat(s) trouvé(s)
              <span v-if="criteres.projetId"> pour le projet "{{ getProjetNom() }}"</span>
            </span>
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

            <div v-else class="modern-results-recherche">
              <!-- En-tête des résultats -->
             <div class="results-header-recherche">
              <h2>
                <i class="fas fa-list-alt"></i> Résultats
              </h2>
              <div class="results-info-recherche">
                <span v-if="criteres.projetId" class="projet-info-recherche">
                  <i class="fas fa-folder"></i> Projet : <strong>{{ getProjetNom() }}</strong> 
                </span>
                <span v-if="criteres.regroupement" class="regroupement-info-recherche">
                  <i class="fas fa-layer-group"></i> Groupés par : <strong>{{ getRegroupementLabel() }}</strong>
                </span>
              </div>
              <button @click="reinitialiser" class="reset-all-btn-recherche">
                <i class="fas fa-undo"></i>
                Tout réinitialiser
              </button>
            </div>

              <!-- Résultats groupés -->
              <div v-if="criteres.regroupement" class="results-list-recherche">
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

                  <!-- Grille de cartes dans le groupe -->
                  <div class="projects-library-Scenariste">
                    <div
                      v-for="(resultat, resultIndex) in groupe.elements"
                      :key="resultat.id + '-' + resultIndex"
                      class="movie-card-Scenariste"
                      :class="'type-' + resultat.type"
                      :style="{ '--index': resultIndex }"
                      @click="voirDetails(resultat)"
                    >
                      <!-- En-tête de la carte -->
                      <div class="movie-card-header-Scenariste">
                        <!-- Badge de type -->
                        <span class="type-badge-Scenariste" :class="'type-' + resultat.type">
                          <i :class="getTypeIcon(resultat.type)"></i>
                          {{ formatType(resultat.type) }}
                        </span>
                        
                        <!-- Badge de statut (si disponible) -->
                        <span v-if="resultat.statut" class="statut-badge-Scenariste" :class="'statut-' + resultat.statut">
                          {{ formatStatut(resultat.statut) }}
                        </span>
                      </div>

                      <!-- Contenu de la carte -->
                      <div class="movie-info-Scenariste">
                        <!-- Titre -->
                        <h3 class="movie-title-Scenariste">{{ resultat.titre }}</h3>

                        <!-- Description/synopsis -->
                        <div v-if="resultat.description" class="movie-synopsis">
                          <p>{{ truncateText(resultat.description, 120) }}</p>
                        </div>

                        <!-- Hiérarchie (projet > épisode > séquence) -->
                        <div class="hierarchy-compact-Scenariste" v-if="resultat.projetTitre || resultat.episodeTitre || resultat.sequenceTitre">
                          <span v-if="resultat.projetTitre" class="hierarchy-item-Scenariste projet-item">
                            <i class="fas fa-folder"></i>
                            <span>{{ resultat.projetTitre }}</span>
                          </span>
                          <span v-if="resultat.episodeTitre" class="hierarchy-item-Scenariste episode-item">
                            <i class="fas fa-film"></i>
                            <span>{{ resultat.episodeTitre }}</span>
                          </span>
                          <span v-if="resultat.sequenceTitre" class="hierarchy-item-Scenariste sequence-item">
                            <i class="fas fa-layer-group"></i>
                            <span>{{ resultat.sequenceTitre }}</span>
                          </span>
                        </div>

                        <!-- Informations spécifiques selon le type -->
                        <div class="specific-info-Scenariste">
                          <!-- Scène -->
                          <div v-if="resultat.type === 'scene'" class="info-section-scene">
                            <div v-if="resultat.dateTournage" class="info-row-Scenariste">
                              <i class="fas fa-calendar-alt"></i>
                              <span>{{ formatDate(resultat.dateTournage) }}</span>
                            </div>
                            <div v-if="resultat.lieuNom" class="info-row-Scenariste">
                              <i class="fas fa-landmark"></i>
                              <span>{{ resultat.lieuNom }}</span>
                            </div>
                            <div v-if="resultat.plateauNom" class="info-row-Scenariste">
                              <i class="fas fa-theater-masks"></i>
                              <span>{{ resultat.plateauNom }}</span>
                            </div>
                            <div v-if="resultat.personnageNom" class="info-row-Scenariste">
                              <i class="fas fa-users"></i>
                              <span>{{ resultat.personnageNom }}</span>
                              <span v-if="resultat.comedienNom" class="comedien-text">
                                ({{ resultat.comedienNom }})
                              </span>
                            </div>
                          </div>

                          <!-- Personnage -->
                          <div v-if="resultat.type === 'personnage' && resultat.comedienNom" class="info-row-Scenariste">
                            <i class="fas fa-user-tie"></i>
                            <span>Comédien : {{ resultat.comedienNom }}</span>
                          </div>

                          <!-- Lieu/Plateau -->
                          <div v-if="(resultat.type === 'lieu' || resultat.type === 'plateau') && resultat.description" class="info-row-Scenariste">
                            <i class="fas fa-info-circle"></i>
                            <span>{{ truncateText(resultat.description, 60) }}</span>
                          </div>

                          <!-- Épisode/Séquence -->
                          <div v-if="(resultat.type === 'episode' || resultat.type === 'sequence') && resultat.description" class="info-row-Scenariste">
                            <i class="fas fa-file-alt"></i>
                            <span>{{ truncateText(resultat.description, 80) }}</span>
                          </div>
                        </div>

                        <!-- Dialogues (pour scènes) -->
                        <div v-if="resultat.dialogues && resultat.dialogues.length > 0" class="dialogues-compact-Scenariste">
                          <div v-for="(dialogue, idx) in resultat.dialogues.slice(0, 2)" :key="idx" class="dialogue-item-compact-Scenariste">
                            "{{ truncateText(dialogue, 50) }}"
                          </div>
                          <div v-if="resultat.dialogues.length > 2" class="dialogue-more-Scenariste">
                            + {{ resultat.dialogues.length - 2 }} autre(s) dialogue(s)
                          </div>
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="movie-actions-bottom-Scenariste">
                        <div class="actions-top-Scenariste">
                          <button class="action-btn-Scenariste primary-btn" @click.stop="voirDetails(resultat)">
                            <i class="fas fa-eye"></i>
                            <span>Détails</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Résultats sans regroupement -->
              <div v-else class="results-grid-simple-recherche">
                <div class="projects-library-Scenariste">
                  <div
                    v-for="(resultat, index) in resultats"
                    :key="resultat.id"
                    class="movie-card-Scenariste"
                    :class="'type-' + resultat.type"
                    :style="{ '--index': index }"
                    @click="voirDetails(resultat)"
                  >
                    <!-- En-tête de la carte -->
                    <div class="movie-card-header-Scenariste">
                      <!-- Badge de type -->
                      <span class="type-badge-Scenariste" :class="'type-' + resultat.type">
                        <i :class="getTypeIcon(resultat.type)"></i>
                        {{ formatType(resultat.type) }}
                      </span>
                      
                      <!-- Badge de statut (si disponible) -->
                      <span v-if="resultat.statut" class="statut-badge-Scenariste" :class="'statut-' + resultat.statut">
                        {{ formatStatut(resultat.statut) }}
                      </span>
                    </div>

                    <!-- Contenu de la carte -->
                    <div class="movie-info-Scenariste">
                      <!-- Titre -->
                      <h3 class="movie-title-Scenariste">{{ resultat.titre }}</h3>

                      <!-- Description/synopsis -->
                      <div v-if="resultat.description" class="movie-synopsis">
                        <p>{{ truncateText(resultat.description, 120) }}</p>
                      </div>

                      <!-- Hiérarchie (projet > épisode > séquence) -->
                      <div class="hierarchy-compact-Scenariste" v-if="resultat.projetTitre || resultat.episodeTitre || resultat.sequenceTitre">
                        <span v-if="resultat.projetTitre" class="hierarchy-item-Scenariste projet-item">
                          <i class="fas fa-folder"></i>
                          <span>{{ resultat.projetTitre }}</span>
                        </span>
                        <span v-if="resultat.episodeTitre" class="hierarchy-item-Scenariste episode-item">
                          <i class="fas fa-film"></i>
                          <span>{{ resultat.episodeTitre }}</span>
                        </span>
                        <span v-if="resultat.sequenceTitre" class="hierarchy-item-Scenariste sequence-item">
                          <i class="fas fa-layer-group"></i>
                          <span>{{ resultat.sequenceTitre }}</span>
                        </span>
                      </div>

                      <!-- Informations spécifiques selon le type -->
                      <div class="specific-info-Scenariste">
                        <!-- Scène -->
                        <div v-if="resultat.type === 'scene'" class="info-section-scene">
                          <div v-if="resultat.dateTournage" class="info-row-Scenariste">
                            <i class="fas fa-calendar-alt"></i>
                            <span>{{ formatDate(resultat.dateTournage) }}</span>
                          </div>
                          <div v-if="resultat.lieuNom" class="info-row-Scenariste">
                            <i class="fas fa-landmark"></i>
                            <span>{{ resultat.lieuNom }}</span>
                          </div>
                          <div v-if="resultat.plateauNom" class="info-row-Scenariste">
                            <i class="fas fa-theater-masks"></i>
                            <span>{{ resultat.plateauNom }}</span>
                          </div>
                          <div v-if="resultat.personnageNom" class="info-row-Scenariste">
                            <i class="fas fa-users"></i>
                            <span>{{ resultat.personnageNom }}</span>
                            <span v-if="resultat.comedienNom" class="comedien-text">
                              ({{ resultat.comedienNom }})
                            </span>
                          </div>
                        </div>

                        <!-- Personnage -->
                        <div v-if="resultat.type === 'personnage' && resultat.comedienNom" class="info-row-Scenariste">
                          <i class="fas fa-user-tie"></i>
                          <span>Comédien : {{ resultat.comedienNom }}</span>
                        </div>

                        <!-- Lieu/Plateau -->
                        <div v-if="(resultat.type === 'lieu' || resultat.type === 'plateau') && resultat.description" class="info-row-Scenariste">
                          <i class="fas fa-info-circle"></i>
                          <span>{{ truncateText(resultat.description, 60) }}</span>
                        </div>

                        <!-- Épisode/Séquence -->
                        <div v-if="(resultat.type === 'episode' || resultat.type === 'sequence') && resultat.description" class="info-row-Scenariste">
                          <i class="fas fa-file-alt"></i>
                          <span>{{ truncateText(resultat.description, 80) }}</span>
                        </div>
                      </div>

                      <!-- Dialogues (pour scènes) -->
                      <div v-if="resultat.dialogues && resultat.dialogues.length > 0" class="dialogues-compact-Scenariste">
                        <div v-for="(dialogue, idx) in resultat.dialogues.slice(0, 2)" :key="idx" class="dialogue-item-compact-Scenariste">
                          "{{ truncateText(dialogue, 50) }}"
                        </div>
                        <div v-if="resultat.dialogues.length > 2" class="dialogue-more-Scenariste">
                          + {{ resultat.dialogues.length - 2 }} autre(s) dialogue(s)
                        </div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="movie-actions-bottom-Scenariste">
                      <div class="actions-top-Scenariste">
                        <button class="action-btn-Scenariste primary-btn" @click.stop="voirDetails(resultat)">
                          <i class="fas fa-eye"></i>
                          <span>Détails</span>
                        </button>
                      </div>
                    </div>
                  </div>
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
import { rechercheAvancee, getStatutsDisponibles, getProjets, getEpisodesByProjet, getSequencesByEpisode } from '../service/rechercheService'

export default {
  name: 'RechercheAvancee',
  data() {
    return {
      // États des dropdowns
      showTypesDropdown: false,
      showStatutsDropdown: false,
      showDateDebutDropdown: false,
      showDateFinDropdown: false,
      triSelectionne: 'hierarchie',
      ordreCroissant: true,

      // Données
      projets: [],
      episodes: [],
      sequences: [],
      statutsDisponibles: [],
      criteres: {
        termeRecherche: '',
        typesRecherche: ['scenes', 'personnages', 'lieux', 'plateaux', 'episodes', 'sequences'],
        dateDebut: null,
        dateFin: null,
        statuts: [],
        regroupement: '',
        projetId: null,
        episodeId: null,
        sequenceId: null,
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

      return Object.entries(groupes)
        .sort(([cleA], [cleB]) => cleA.localeCompare(cleB))
        .map(([cle, elements]) => {
          const groupeHeader = this.resultats.find(r => 
            r.type === 'groupe' && r.groupeValeur === cle
          )
          
          return {
            estGroupe: true,
            type: this.criteres.regroupement,
            titre: groupeHeader ? groupeHeader.titre : cle,
            elements: this.organiserResultatsParHierarchie(elements)
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
  
  watch: {
    'criteres.projetId': async function(newProjetId) {
      if (newProjetId) {
        await this.chargerEpisodes(newProjetId)
        this.criteres.episodeId = null
        this.criteres.sequenceId = null
        this.sequences = []
      } else {
        this.episodes = []
        this.sequences = []
      }
    },
    
    'criteres.episodeId': async function(newEpisodeId) {
      if (newEpisodeId) {
        await this.chargerSequences(newEpisodeId)
        this.criteres.sequenceId = null
      } else {
        this.sequences = []
      }
    }
  },
  
  methods: {
    // Méthodes utilitaires pour le template
    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    
    getTypeIcon(type) {
      const icons = {
        scene: 'fas fa-film',
        personnage: 'fas fa-users',
        lieu: 'fas fa-landmark',
        plateau: 'fas fa-theater-masks',
        episode: 'fas fa-play-circle',
        sequence: 'fas fa-layer-group'
      }
      return icons[type] || 'fas fa-question-circle'
    },
    
    formatType(type) {
      const typesMap = {
        scene: 'Scène',
        personnage: 'Personnage',
        lieu: 'Lieu',
        plateau: 'Plateau',
        episode: 'Épisode',
        sequence: 'Séquence'
      }
      return typesMap[type] || type
    },
    
    voirDetails(resultat) {
      this.$router.push(this.getDetailLink(resultat))
    },
    
    ouvrirScene(scene) {
      // Implémentation pour ouvrir une scène
      console.log('Ouvrir scène:', scene)
      // Navigation vers l'éditeur de scène
    },

    // Méthodes existantes (à conserver)
    async chargerProjets() {
      try {
        this.projets = await getProjets()
      } catch (error) {
        console.error('Erreur chargement projets:', error)
        this.projets = []
      }
    },

    async chargerEpisodes(projetId) {
      try {
        this.episodes = await getEpisodesByProjet(projetId)
      } catch (error) {
        console.error('Erreur chargement episodes:', error)
        this.episodes = []
      }
    },

    async chargerSequences(episodeId) {
      try {
        this.sequences = await getSequencesByEpisode(episodeId)
      } catch (error) {
        console.error('Erreur chargement sequences:', error)
        this.sequences = []
      }
    },

    async chargerStatuts() {
      try {
        this.statutsDisponibles = await getStatutsDisponibles()
      } catch (error) {
        console.error('Erreur chargement statuts:', error)
        this.statutsDisponibles = ['planifie', 'confirme', 'en_cours', 'termine', 'reporte']
      }
    },

    trierResultats() {
      this.resultats = this.trierSelonCritere(this.resultats, this.triSelectionne, this.ordreCroissant)
    },

    toggleOrdreTri() {
      this.ordreCroissant = !this.ordreCroissant
      this.trierResultats()
    },

    trierSelonCritere(resultats, critere, croissant) {
      const ordreHierarchique = ['episode', 'sequence', 'scene', 'personnage', 'lieu', 'plateau']
      
      const resultatsCopie = [...resultats]
      
      resultatsCopie.sort((a, b) => {
        let comparaison = 0
        
        switch(critere) {
          case 'hierarchie':
            const indexA = ordreHierarchique.indexOf(a.type)
            const indexB = ordreHierarchique.indexOf(b.type)
            comparaison = indexA - indexB
            if (comparaison === 0 && a.titre && b.titre) {
              comparaison = a.titre.localeCompare(b.titre)
            }
            break
            
          case 'alphabetique':
            if (a.titre && b.titre) {
              comparaison = a.titre.localeCompare(b.titre)
            }
            break
            
          case 'type':
            comparaison = a.type.localeCompare(b.type)
            break
            
          case 'date':
            const dateA = a.dateTournage || a.dateCreation || '0'
            const dateB = b.dateTournage || b.dateCreation || '0'
            comparaison = dateA.localeCompare(dateB)
            break
        }
        
        return croissant ? comparaison : -comparaison
      })
      
      return resultatsCopie
    },

    toggleTypesDropdown() {
      this.showTypesDropdown = !this.showTypesDropdown
      this.showStatutsDropdown = false
      this.showDateDebutDropdown = false
      this.showDateFinDropdown = false
    },
    
    toggleStatutsDropdown() {
      this.showStatutsDropdown = !this.showStatutsDropdown
      this.showTypesDropdown = false
      this.showDateDebutDropdown = false
      this.showDateFinDropdown = false
    },

    toggleDateDebutDropdown() {
      this.showDateDebutDropdown = !this.showDateDebutDropdown
      this.showTypesDropdown = false
      this.showStatutsDropdown = false
      this.showDateFinDropdown = false
    },

    toggleDateFinDropdown() {
      this.showDateFinDropdown = !this.showDateFinDropdown
      this.showTypesDropdown = false
      this.showStatutsDropdown = false
      this.showDateDebutDropdown = false
    },
    
    handleClickOutside(event) {
      if (!event.target.closest('.filter-dropdown-recherche')) {
        this.showTypesDropdown = false
        this.showStatutsDropdown = false
        this.showDateDebutDropdown = false
        this.showDateFinDropdown = false
      }
    },

    getTypesDisplayText() {
      if (this.criteres.typesRecherche.length === 0) return 'Aucun type'
      if (this.criteres.typesRecherche.length === 6) return 'Tous les types'
      
      const typesMap = {
        scenes: 'Scènes',
        personnages: 'Personnages',
        lieux: 'Lieux',
        plateaux: 'Plateaux',
        episodes: 'Épisodes',
        sequences: 'Séquences'
      }
      
      const selectedTypes = this.criteres.typesRecherche.map(type => typesMap[type])
      return selectedTypes.join(', ')
    },
    
    getStatutsDisplayText() {
      if (this.criteres.statuts.length === 0) return 'Tous statuts'
      if (this.criteres.statuts.length === this.statutsDisponibles.length) return 'Tous statuts'
      
      return `${this.criteres.statuts.length} statut(s)`
    },

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

    updateTypesSelection() {
      this.$forceUpdate()
    },
    
    updateStatutsSelection() {
      this.$forceUpdate()
    },

    updateDateDebut() {
      this.showDateDebutDropdown = false
    },

    updateDateFin() {
      this.showDateFinDropdown = false
    },

    clearDateDebut() {
      this.criteres.dateDebut = null
      this.showDateDebutDropdown = false
    },

    clearDateFin() {
      this.criteres.dateFin = null
      this.showDateFinDropdown = false
    },

    getProjetNom() {
      if (!this.criteres.projetId) return ''
      const projet = this.projets.find(p => p.id === this.criteres.projetId)
      return projet ? projet.titre : 'Projet inconnu'
    },

    getEpisodeNom() {
      if (!this.criteres.episodeId) return ''
      const episode = this.episodes.find(e => e.id === this.criteres.episodeId)
      return episode ? episode.titre : 'Épisode inconnu'
    },

    getSequenceNom() {
      if (!this.criteres.sequenceId) return ''
      const sequence = this.sequences.find(s => s.id === this.criteres.sequenceId)
      return sequence ? sequence.titre : 'Séquence inconnue'
    },

    reinitialiserProjet() {
      this.criteres.projetId = null
      this.episodes = []
      this.sequences = []
    },

    reinitialiserEpisode() {
      this.criteres.episodeId = null
      this.sequences = []
    },

    reinitialiserSequence() {
      this.criteres.sequenceId = null
    },

    async rechercher() {
      this.chargement = true
      try {
        console.log('Critères envoyés:', this.criteres)
        const resultatsBruts = await rechercheAvancee(this.criteres)
        console.log('Résultats bruts reçus:', resultatsBruts.length)
        
        this.resultats = this.organiserResultatsParHierarchie(resultatsBruts)
        console.log('Résultats organisés:', this.resultats.length)
        
      } catch (error) {
        console.error('Erreur recherche:', error)
        alert('Erreur lors de la recherche: ' + error.message)
      } finally {
        this.chargement = false
      }
    },

    organiserResultatsParHierarchie(resultats) {
      const ordreHierarchique = ['episode', 'sequence', 'scene', 'personnage', 'lieu', 'plateau']
      
      return [...resultats].sort((a, b) => {
        const indexA = ordreHierarchique.indexOf(a.type)
        const indexB = ordreHierarchique.indexOf(b.type)
        
        if (indexA !== indexB) {
          return indexA - indexB
        }
        
        if (a.titre && b.titre) {
          return a.titre.localeCompare(b.titre)
        }
        
        return 0
      })
    },

    reinitialiser() {
      this.criteres = {
        termeRecherche: '',
        typesRecherche: ['scenes', 'personnages', 'lieux', 'plateaux', 'episodes', 'sequences'],
        dateDebut: null,
        dateFin: null,
        statuts: [],
        regroupement: '',
        projetId: null,
        episodeId: null,
        sequenceId: null,
        page: 0,
        taille: 50
      }
      this.resultats = []
      this.episodes = []
      this.sequences = []
      this.showTypesDropdown = false
      this.showStatutsDropdown = false
      this.showDateDebutDropdown = false
      this.showDateFinDropdown = false
    },
    
    formatStatut(statut) {
      const statutsMap = {
        planifie: 'Planifié',
        confirme: 'Confirmé',
        en_cours: 'En cours',
        termine: 'Terminé',
        reporte: 'Reporté',
        annule: 'Annulé'
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
        case 'episode': return resultat.episodeTitre || 'Non spécifié'
        case 'sequence': return resultat.sequenceTitre || 'Non spécifié'
        default: return 'Autre'
      }
    },
    
    getRegroupementLabel() {
      const labels = {
        plateau: 'Plateau',
        lieu: 'Lieu',
        personnage: 'Personnage',
        statut: 'Statut',
        episode: 'Épisode',
        sequence: 'Séquence'
      }
      return labels[this.criteres.regroupement] || 'Aucun'
    },
    
    getGroupIcon(type) {
      const icons = {
        plateau: '🎭',
        lieu: '🏛️',
        personnage: '👥',
        statut: '📊',
        episode: '📺',
        sequence: '🎞️'
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

    onProjetChange() {
      console.log('Projet sélectionné:', this.criteres.projetId)
    },

    onEpisodeChange() {
      console.log('Épisode sélectionné:', this.criteres.episodeId)
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
.comedien-text {
  font-style: italic;
  opacity: 0.8;
}

.dialogue-more-Scenariste {
  font-size: 0.8em;
  color: #666;
  text-align: center;
  padding: 4px 0;
}
</style>

