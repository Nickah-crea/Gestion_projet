<template>
  <div class="app-wrapper-global accueil-scenariste">
    <!-- SIDEBAR GAUCHE - Productivité et Dernières activités -->
    <div class="sidebar-left-fixed-Scenariste">
      <!-- Section Productivité -->
      <div class="personal-stats-compact-Scenariste">
        <h3 class="section-title-compact-Scenariste">
          <i class="fas fa-chart-line"></i> Productivité
        </h3>
        
        <div class="personal-stats-grid-compact-Scenariste">
          <div class="personal-stat-card-compact-Scenariste">
            <div class="stat-header-compact-Scenariste">
              <i class="fas fa-bolt"></i>
              <h4>Productivité</h4>
            </div>
            <div class="stat-content-compact-Scenariste">
              <div class="stat-value-compact-Scenariste">{{ userStats.productivite || 0 }}%</div>
              <div class="progress-ring-compact-Scenariste" :style="{ '--progress': userStats.productivite || 0 }">
                <svg width="50" height="50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#e0e0e0" stroke-width="3"/>
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#4CAF50" stroke-width="3" 
                          :stroke-dasharray="`${(userStats.productivite || 0) * 1.26} 126`" stroke-dashoffset="0"/>
                </svg>
              </div>
            </div>
            <div class="stat-subtext-Scenariste">Cette semaine</div>
          </div>
        </div>
      </div>

      <!-- Section Dernières activités -->
      <div class="recent-activity-compact-Scenariste">
        <div class="activity-header-compact-Scenariste">
          <h3 class="activity-title-compact-Scenariste">Dernières activités</h3>
          <button class="view-all-btn-compact-Scenariste" @click="viewAllActivities" title="Voir tout">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="activity-timeline-compact-Scenariste">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item-compact-Scenariste">
            <div class="activity-icon-compact-Scenariste" :class="getActivityTypeClass(activity.type)">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content-compact-Scenariste">
              <div class="activity-text-compact-Scenariste">
                {{ truncateText(activity.description, 50) }}
              </div>
              <div class="activity-time-compact-Scenariste">
                {{ formatActivityTime(activity.date) }}
              </div>
            </div>
          </div>
          
          <!-- TOUJOURS afficher au moins un message -->
          <div v-if="recentActivities.length === 0" class="no-activities-compact-Scenariste">
            <i class="fas fa-history"></i>
            <p>Chargement des activités...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTENU PRINCIPAL -->
    <div class="main-content-container">
      <main class="main-content-scenariste-Scenariste">
        <!-- Header avec bienvenue à gauche et barre de recherche à droite -->
        <div class="header-section-Scenariste">
          <div class="welcome-section-Scenariste">
            <h2>Bienvenue, {{ user?.nom }} !</h2>
            <p>Vous êtes connecté en tant que {{ isViewer ? 'Viewer' : user?.role }}</p>
          </div>

          <div class="search-container-right-Scenariste">
            <div class="search-input-wrapper-Scenariste" :class="{ expanded: isSearchExpanded }">
              <input 
                type="text" 
                v-model="globalSearchQuery" 
                @input="performGlobalSearch" 
                placeholder="Rechercher projets, épisodes, séquences, scènes..." 
                class="search-input-Scenariste"
                ref="searchInput"
              />
              <button v-if="globalSearchQuery" @click="clearGlobalSearch" class="clear-search-btn-Scenariste">
                <i class="fas fa-times"></i>
              </button>
              
              <button @click="toggleSearch" class="search-toggle-btn-Scenariste">
                <i class="fas fa-search"></i>
              </button>
            </div>  
          </div>
        </div>

        <!-- Section Statistiques (RESTE dans le contenu principal) -->
        <div class="stats-section-Scenariste">
          <div class="stats-grid-Scenariste">
            <!-- Pour les viewers, afficher seulement nombre de projets -->
            <div class="stat-card-Scenariste stat-projects">
              <div class="stat-icon-Scenariste">
                <i class="fas fa-film"></i>
              </div>
              <div class="stat-content-Scenariste">
                <div class="stat-value-Scenariste">{{ stats.projetsActifs || 0 }}</div>
                <div class="stat-label-Scenariste">Projets visibles</div>
              </div>
            </div>

            <!-- Pour les viewers, afficher seulement nombre de scènes -->
            <div class="stat-card-Scenariste stat-scenes">
              <div class="stat-icon-Scenariste">
                <i class="fas fa-scroll"></i>
              </div>
              <div class="stat-content-Scenariste">
                <div class="stat-value-Scenariste">{{ stats.scenesEcrites || 0 }}</div>
                <div class="stat-label-Scenariste">Scènes disponibles</div>
              </div>
            </div>

            <!-- Masquer les autres cartes pour les viewers -->
            <template v-if="!isViewer">
              <!-- Carte collaborations (masquée pour viewer) -->
              <div class="stat-card-Scenariste stat-collaborations">
                <div class="stat-icon-Scenariste">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-content-Scenariste">
                  <div class="stat-value-Scenariste">{{ stats.collaborations || 0 }}</div>
                  <div class="stat-label-Scenariste">Collaborations</div>
                  <div class="stat-subtext-Scenariste">Avec {{ stats.realisateursActifs || 0 }} réalisateurs</div>
                </div>
              </div>

              <!-- Carte échéances (masquée pour viewer) -->
              <div class="stat-card-Scenariste stat-deadlines">
                <div class="stat-icon-Scenariste">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-content-Scenariste">
                  <div class="stat-value-Scenariste">{{ stats.echeancesProches || 0 }}</div>
                  <div class="stat-label-Scenariste">Échéances proches</div>
                  <div class="stat-warning-Scenariste" v-if="stats.echeancesProches > 0">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ stats.urgentCount || 0 }} urgentes
                  </div>
                </div>
              </div>
            </template>
            
            <!-- Pour viewers, ajouter une carte spécifique -->
            <div v-if="isViewer" class="stat-card-Scenariste stat-deadlines">
              <div class="stat-icon-Scenariste">
                <i class="fas fa-eye"></i>
              </div>
              <div class="stat-content-Scenariste">
                <div class="stat-value-Scenariste">Lecture</div>
                <div class="stat-label-Scenariste">Mode viewer</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtres restants avec la phrase "Les projets existants" à gauche -->
        <div class="filters-section-Scenariste">
          <div class="filters-row-Scenariste">
            <h3 class="projects-label-Scenariste">Les projets existants</h3>
            <div class="filters-right-Scenariste">
              <div class="filter-group-scenariste">
                <select v-model="filterTimePeriod" class="filter-select-Scenariste">
                  <option value="all">Tous périodes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="this_week">Cette semaine</option>
                  <option value="this_month">Ce mois-ci</option>
                  <option value="this_year">Cette année</option>
                  <option value="recent">Récent (7 jours)</option>
                </select>
              </div>
              <div class="filter-group-scenariste">
                <select v-model="filterGenre" class="filter-select-Scenariste">
                  <option value="">Tous genre</option>
                  <option v-for="genre in genres" :key="genre.idGenre" :value="genre.nomGenre">{{ genre.nomGenre }}</option>
                </select>
              </div>
              <div class="filter-group-scenariste">
                <select v-model="filterStatut" class="filter-select-Scenariste">
                  <option value="">Tous statuts</option>
                  <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.nomStatutsProjet">{{ statut.nomStatutsProjet }}</option>
                </select>
              </div>
              <!-- Bouton centré -->
             <div class="add-project-center-Scenariste" v-if="!isViewer">
                <button class="add-project-btn-scenariste" @click="goToAddProject">
                  <i class="fas fa-plus-circle icon-Scenariste"></i> 
                  Nouveau Projet
                </button>
              </div>
              <div class="add-project-center-Scenariste" v-else>
                <!-- <button class="add-project-btn-scenariste disabled" disabled title="Non disponible en mode viewer">
                  <i class="fas fa-eye-slash"></i> 
                  Lecture seulement
                </button> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Résultats de recherche globale -->
        <div v-if="showGlobalSearchResults" class="global-search-results-Scenariste">
          <div class="search-results-header-Scenariste">
            <h3>Résultats de recherche ({{ totalResults }})</h3>
            <button @click="clearGlobalSearch" class="close-results-btn-Scenariste">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Résultats des projets -->
          <div v-if="globalSearchResults.projets.length > 0" class="search-results-group-Scenariste">
            <h4>Projets ({{ globalSearchResults.projets.length }})</h4>
            <div v-for="projet in globalSearchResults.projets" :key="projet.id" class="search-result-item-Scenariste">
              <div class="result-header-Scenariste" @click="toggleProjectDetails(projet)">
                <div class="result-main-info-Scenariste">
                  <i class="fas fa-film result-icon-Scenariste"></i>
                  <span class="result-title-Scenariste">{{ projet.titre }}</span>
                  <span class="result-statut-Scenariste" :class="getStatutClass(projet.statutNom)">
                    {{ projet.statutNom }}
                  </span>
                </div>
                <div class="result-actions-Scenariste">
                  <button @click.stop="navigateToEcranTravail(projet)" class="action-btn-Scenariste">
                    <i class="fas fa-external-link-alt"></i>
                  </button>
                  <i class="fas fa-chevron-down toggle-icon-Scenariste" :class="{ 'rotated': projet.showDetails }"></i>
                </div>
              </div>
              
              <!-- Contenu détaillé du projet -->
              <div v-if="projet.showDetails" class="project-details-Scenariste">
                <div v-if="projet.contenu">
                  <!-- Épisodes -->
                  <div v-if="projet.contenu.episodes.length > 0" class="content-section-Scenariste">
                    <h5>Épisodes</h5>
                    <div v-for="episode in projet.contenu.episodes" :key="episode.id" 
                         class="content-item-Scenariste" @click="navigateToEcranTravail(episode)">
                      <i class="fas fa-list-alt"></i>
                      <span>Épisode {{ episode.ordre }}: {{ episode.titre }}</span>
                    </div>
                  </div>
                  
                  <!-- Séquences -->
                  <div v-if="projet.contenu.sequences.length > 0" class="content-section-Scenariste">
                    <h5>Séquences</h5>
                    <div v-for="sequence in projet.contenu.sequences" :key="sequence.id" 
                         class="content-item-Scenariste" @click="navigateToEcranTravail(sequence)">
                      <i class="fas fa-layer-group"></i>
                      <span>Séquence {{ sequence.ordre }}: {{ sequence.titre }}</span>
                    </div>
                  </div>
                  
                  <!-- Scènes -->
                  <div v-if="projet.contenu.scenes.length > 0" class="content-section-Scenariste">
                    <h5>Scènes</h5>
                    <div v-for="scene in projet.contenu.scenes" :key="scene.id" 
                         class="content-item-Scenariste" @click="navigateToEcranTravail(scene)">
                      <i class="fas fa-clipboard"></i>
                      <span>Scène {{ scene.ordre }}: {{ scene.titre }}</span>
                    </div>
                  </div>
                </div>
                
                <div v-else class="loading-content-Scenariste">
                  Chargement du contenu...
                </div>
              </div>
            </div>
          </div>
          
          <!-- Autres résultats -->
          <div v-if="globalSearchResults.autres.length > 0" class="search-results-group-Scenariste">
            <h4>Autres éléments ({{ globalSearchResults.autres.length }})</h4>
            <div v-for="result in globalSearchResults.autres" :key="result.id" 
                 class="search-result-item-Scenariste" @click="navigateToEcranTravail(result)">
              <div class="result-main-info-Scenariste">
                <i :class="getResultIcon(result.type)" class="result-icon-Scenariste"></i>
                <span class="result-title-Scenariste">{{ result.titre }}</span>
                <span class="result-type-Scenariste">{{ getTypeLabel(result.type) }}</span>
                <span class="result-statut-Scenariste" :class="getStatutClass(result.statutNom)">
                  {{ result.statutNom }}
                </span>
              </div>
              <div class="result-actions-Scenariste">
                <button class="action-btn-Scenariste">
                  <i class="fas fa-external-link-alt"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="totalResults === 0" class="no-results-Scenariste">
            Aucun résultat trouvé pour "{{ globalSearchQuery }}"
          </div>
        </div>

        <!-- Grille des projets -->
        <div class="projects-library-Scenariste">
          <div 
            v-for="(project, index) in filteredProjects" 
            :key="project.id" 
            class="movie-card-Scenariste" 
            :style="{'--index': index + 1}"
            :data-genre="project.genreNom"
          >
            <!-- Header de la carte avec statut à gauche et actions à droite -->
            <div class="movie-card-header-Scenariste">
              <div class="movie-statut-Scenariste">
                <span class="statut-badge-Scenariste" :class="getStatutClass(project.statutNom)">
                  {{ project.statutNom }}
                </span>
              </div>
              <div class="movie-actions-Scenariste" v-if="!isViewer">
                <button class="action-btn-Scenariste edit-btn-Scenariste" @click.stop="startEdit(project)" title="Modifier">
                  <i class="fas fa-marker"></i>
                </button>
                <button class="action-btn-Scenariste delete-btn-Scenariste" @click.stop="confirmDeleteProject(project)" title="Supprimer">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <!-- <div class="movie-actions-Scenariste" v-else>
                <span class="viewer-badge-Scenariste">Viewer</span>
              </div> -->
            </div>
            
            <!-- Contenu de la carte -->
            <div class="movie-info-Scenariste">
              <h3 class="movie-title-Scenariste">{{ project.titre }}</h3>
              
              <div class="movie-synopsis" v-if="project.synopsis">
                <p>{{ truncateText(project.synopsis, 120) }}</p>
              </div>
                            
              <!-- Type et Date côte à côte avec séparateur (version compacte) -->
              <div class="movie-meta-Scenariste">
                <i class="fas fa-film"></i><span>{{ project.genreNom }}</span>
                <span class="meta-separator-Scenariste">|</span>
                <i class="fas fa-calendar"></i><span>{{ formatShortDate(project.creeLe) }}</span>
              </div>
              
              <!-- Actions en bas de carte -->
              <div class="movie-actions-bottom-Scenariste">
                <div class="actions-top-Scenariste">
                  <!-- Détails toujours accessible -->
                  <button class="action-btn-Scenariste accent-btn" @click="$router.push(`/projet/${project.id}`)" title="Détails">
                    <i class="fas fa-info-circle icon"></i>
                    <span>Détails</span>
                  </button>
                  
                  <!-- Écran de travail accessible à TOUS, mais avec paramètre viewer -->
                  <button class="action-btn-Scenariste" 
                          :class="isViewer ? 'viewer-btn' : 'primary-btn'" 
                          @click="goToEcranTravail(project)" 
                          :title="isViewer ? 'Lecture seule' : 'Écran de travail'">
                    <i :class="isViewer ? 'fas fa-eye' : 'fas fa-laptop'"></i>                    
                    <span>{{ isViewer ? 'Lecture' : 'Écran' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si aucun projet -->
        <div v-if="filteredProjects.length === 0" class="no-projects-Scenariste">
          <div class="no-projects-icon-Scenariste">
            <i class="fas fa-film"></i>
          </div>
          <h3>Aucun projet trouvé</h3>
          <p>Commencez par créer votre premier projet !</p>
          <button class="add-project-btn-large-Scenariste" @click="goToAddProject">
            <i class="fas fa-plus-circle"></i>
            Créer un projet
          </button>
        </div>

        <!-- Modal d'édition -->
        <div v-if="editingProject" class="edit-project-modal-Scenariste">
          <div class="modal-content-Scenariste">
            <div class="modal-header-Scenariste">
              <h3>Modifier le projet</h3>
              <button @click="cancelEdit" class="close-modal-btn-Scenariste">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="modal-body-Scenariste">
              <div v-if="editError" class="error-message-Scenariste">
                {{ editError }}
              </div>
              
              <div class="form-rows-container-Scenariste">
                <!-- Ligne 1 : Titre + Genre -->
                <div class="form-row-Scenariste">
                  <div class="form-group-Scenariste">
                    <label>Titre:</label>
                    <input v-model="editForm.titre" type="text" class="form-input-Scenariste">
                  </div>
                  
                  <div class="form-group-Scenariste">
                    <label>Genre:</label>
                    <select v-model="editForm.genreId" class="form-select-Scenariste">
                      <option value="">Sélectionnez un genre</option>
                      <option v-for="genre in genres" :key="genre.idGenre" :value="genre.idGenre">
                        {{ genre.nomGenre }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Ligne 2 : Statut + Date -->
                <div class="form-row-Scenariste">
                  <div class="form-group-Scenariste">
                    <label>Statut:</label>
                    <select v-model="editForm.statutId" class="form-select-Scenariste">
                      <option value="">Sélectionnez un statut</option>
                      <option v-for="statut in statuts" :key="statut.idStatutProjet" :value="statut.idStatutProjet">
                        {{ statut.nomStatutsProjet }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="form-group-Scenariste">
                    <label>Date de fin:</label>
                    <input v-model="editForm.dateFin" type="date" class="form-input-Scenariste">
                  </div>
                </div>
                
                <!-- Ligne 3 : Synopsis (pleine largeur) -->
                <div class="form-row-Scenariste">
                  <div class="form-group-Scenariste form-full-width-Scenariste">
                    <label>Synopsis:</label>
                    <textarea v-model="editForm.synopsis" class="form-textarea-Scenariste" rows="4"></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer-Scenariste">
              <button @click="cancelEdit" class="cancel-btn-Scenariste">Annuler</button>
              <button @click="submitEdit" :disabled="editLoading" class="save-btn-Scenariste">
                {{ editLoading ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <!-- Modal de confirmation de suppression -->
      <div v-if="showDeleteModal" class="delete-confirmation-modal-Scenariste">
        <div class="modal-overlay-Scenariste" @click="closeDeleteModal"></div>
        <div class="modal-content-confirm-Scenariste">
          <div class="modal-header-confirm-Scenariste">
            <h3><i class="fas fa-exclamation-triangle"></i> Confirmation de suppression</h3>
            <button @click="closeDeleteModal" class="close-modal-btn-Scenariste">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body-confirm-Scenariste">
            <div class="warning-icon-Scenariste">
              <i class="fas fa-trash"></i>
            </div>
            <p class="warning-text-Scenariste">
              Êtes-vous sûr de vouloir supprimer le projet <strong>"{{ projectToDelete?.titre }}"</strong> ?
            </p>
            <p class="warning-subtext-Scenariste">
              Cette action est irréversible. Tous les épisodes, séquences et scènes associés à ce projet seront également supprimés.
            </p>
            
            <div v-if="deleteError" class="error-message-Scenariste">
              {{ deleteError }}
            </div>
          </div>
          
          <div class="modal-footer-confirm-Scenariste">
            <button @click="closeDeleteModal" class="cancel-confirm-btn-Scenariste">
              <i class="fas fa-times"></i> Annuler
            </button>
            <button @click="executeDeleteProject" class="delete-confirm-btn-Scenariste" :disabled="isDeleting">
              <span v-if="isDeleting">Suppression...</span>
              <span v-else>Supprimer définitivement</span>
            </button>
          </div>
        </div>
      </div>


      <!-- Notification de succès/erreur -->
      <div v-if="message" :class="['message-crea-profile', message.type]" @click="clearMessage">
        <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ message.text }}
        <button class="message-close-crea-profile" @click.stop="clearMessage">
          <i class="fas fa-times"></i>
        </button>
      </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ScenaristeAccueilView',
  
  data() {
    return {
      showProfileMenu: false,
      user: null,
      projects: [],
      genres: [],
      statuts: [],
      filterTimePeriod: 'all',
      filterGenre: '',
      filterStatut: '',
      editingProject: null,
      editForm: {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateFin: ''
      },
      editLoading: false,
      editError: '',
      globalSearchQuery: '',
      searchStatut: '',
      searchDate: '',
      searchSpecificDate: '',
      globalSearchResults: {
        projets: [],
        autres: []
      },
      showGlobalSearchResults: false,
      globalSearchTimeout: null,
      allStatuts: [],
      expandedProjects: new Set(),
      isSearchExpanded: false,
      
      // Données pour les statistiques
      stats: {
        projetsActifs: 0,
        projetsVariation: 0,
        scenesEcrites: 0,
        scenesVariation: 0,
        collaborations: 0,
        realisateursActifs: 0,
        echeancesProches: 0,
        urgentCount: 0,
        tempsEcriture: '0h 00mn'
      },
      recentActivities: [],
      priorityProjects: [],
      
      // Statistiques personnelles
      userStats: {
        productivite: 0,
        scenesModifiees7j: 0,
        tendanceScenes: 0,
        tempsTotalMinutes: 0,
        moyenneQuotidienneMinutes: 0,
        sessionMoyenneMinutes: 0,
        objectifs: {
          scenesCompletees: 0,
          scenesCibles: 10,
          dialoguesEcrits: 0,
          dialoguesCibles: 50,
          progressionScenes: 0,
          progressionDialogues: 0
        }
      },
      
      // Statistiques d'écriture avancées
      writingStats: {
        tempsTotalMinutes: 0,
        tempsTotalFormate: '0h 00min',
        joursEcriture: 0,
        moyenneQuotidienneMinutes: 0,
        moyenneQuotidienneFormate: '0h 00min',
        motsAjoutes: 0,
        motsSupprimes: 0,
        motsNets: 0,
        motsParJour: 0,
        totalPages: 0,
        moyennePagesParJour: 0,
        motsParPage: 250,
        periodePreferee: 'Indéterminé',
        iconePeriode: 'fas fa-question',
        couleurFondPeriode: '#f0f8ff',
        distributionPeriodes: [],
        conseils: [],
        motsParType: [],
        productiviteMotsParMinute: 0,
        consistanceEcriture: 'Débutant',
        tendanceMots: 0
      },
      
      // Suivi en temps réel
      writingTimer: null,
      currentSession: {
        startTime: null,
        motsDepart: 0,
        projetId: null,
        typeContenu: null,
        contenuId: null
      },
      showDeleteModal: false,
      projectToDelete: null,
      isDeleting: false,
      deleteError: '',
      message: null,
      notificationTimeout: null,
      activityRefreshInterval: null
    };
  },
  
  computed: {

  isViewer() {
    return this.user?.role === 'UTILISATEUR';
  },
   isScenariste() {
    return this.user?.role === 'SCENARISTE';
  },
  
  isRealisateur() {
    return this.user?.role === 'REALISATEUR';
  },
  
  userInitials() {
    if (!this.user?.nom) return '?';
    const initials = this.user.nom
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
    return this.isViewer ? `${initials} (V)` : initials;
  },
    
    totalResults() {
      return this.globalSearchResults.projets.length + this.globalSearchResults.autres.length;
    },
    
    filteredProjects() {
      let list = this.projects;
      
      if (this.filterGenre) {
        list = list.filter(p => p.genreNom === this.filterGenre);
      }
      
      if (this.filterStatut) {
        list = list.filter(p => p.statutNom === this.filterStatut);
      }
      
      if (this.filterTimePeriod !== 'all') {
        list = this.filterByTimePeriod(list);
      }
      
      return list;
    }
  },
  
mounted() {
  this.initializeComponent();
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const allowedRoles = ['SCENARISTE', 'REALISATEUR', 'UTILISATEUR'];
      
      if (!user.role || !allowedRoles.includes(user.role)) {
        console.log(`Rôle ${user.role} non autorisé, redirection vers /accueil`);
        this.$router.push('/accueil');
        return;
      }
    } catch (error) {
      console.error("Erreur parsing user:", error);
      this.$router.push('/');
      return;
    }
  }
  
  // Rafraîchir les activités toutes les 30 secondes
  this.activityRefreshInterval = setInterval(() => {
    if (this.user && this.user.id_utilisateur) {
      console.log("🔄 Rafraîchissement automatique des activités");
      this.loadRecentActivities();
    }
  }, 30000); // 30 secondes
},
  
  beforeUnmount() {
    this.cleanupComponent();
    
    // Nettoyer l'intervalle
    if (this.activityRefreshInterval) {
      clearInterval(this.activityRefreshInterval);
    }
  },
  
  methods: {
    // =============================================
    // INITIALISATION ET NETTOYAGE
    // =============================================
    
    initializeComponent() {
      this.loadUser();
      this.fetchGenres();
      this.fetchStatuts();
      this.fetchProjects();
      this.loadAllStatuts();
      
      // Charger les statistiques après un petit délai
      setTimeout(async () => {
        await this.loadStats();
        
        // Charger d'abord les données de démo pour tester
        console.log("🔄 Chargement des activités (démo d'abord)");
        await this.loadRecentActivities();
        
        await this.loadPriorityProjects();
        await this.loadUserStatistics();
        await this.loadWritingStats();
      }, 100);
      
      // Ajouter les écouteurs d'événements
      document.addEventListener('click', this.handleClickOutside);
      document.addEventListener('click', this.handleClickOutsideSearch);
      
      // Rafraîchir les stats toutes les 10 minutes
      setInterval(() => {
        if (this.user && this.user.id_utilisateur) {
          this.loadWritingStats();
        }
      }, 600000);
    },
    
    cleanupComponent() {
      // Arrêter le timer d'écriture
      if (this.writingTimer) {
        clearInterval(this.writingTimer);
      }
      
      // Enregistrer la session en cours si elle existe
      if (this.currentSession.startTime) {
        this.stopWritingSession();
      }
      
      // Supprimer les écouteurs d'événements
      document.removeEventListener('click', this.handleClickOutside);
      document.removeEventListener('click', this.handleClickOutsideSearch);
    },
    
    // =============================================
    // GESTION UTILISATEUR
    // =============================================
    getUserId() {
      const user = this.user;
      
      if (!user) {
        console.warn("User non défini");
        return 4; // ID de test par défaut
      }
      
      // Cherchez l'ID dans différentes propriétés
      const possibleIds = [
        user.id_utilisateur,
        user.id,
        user.userId,
        user.ID,
        user.user_id
      ];
      
      for (const id of possibleIds) {
        if (id && !isNaN(id)) {
          console.log("ID trouvé:", id);
          return parseInt(id);
        }
      }
      
      console.warn("Aucun ID trouvé, utilisation par défaut (4)");
      return 4; // ID par défaut pour test
    },

    loadUser() {
      const userStr = localStorage.getItem('user');
      console.log("Raw user from localStorage:", userStr);
      
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
          console.log("Parsed user object:", this.user);
          
          // DEBUG: Vérifiez la structure
          console.log("User keys:", Object.keys(this.user));
          console.log("User id_utilisateur:", this.user.id_utilisateur);
          console.log("User id:", this.user.id);
          
          // Essayez différentes propriétés
          if (!this.user.id_utilisateur) {
            // Essayez d'autres noms de propriétés courantes
            this.user.id_utilisateur = this.user.id || this.user.userId || this.user.ID;
          }
          
          console.log("Final user ID for API:", this.user.id_utilisateur);
          
          if (!this.user.role) {
            console.error("Role non défini dans l'utilisateur");
            this.$router.push('/');
            return;
          }
          
           const allowedRoles = ['SCENARISTE', 'REALISATEUR', 'UTILISATEUR'];
            if (!allowedRoles.includes(this.user.role)) {
              console.log(`Rôle ${this.user.role} non autorisé, redirection vers /accueil`);
              this.$router.push('/accueil');
            }
          } catch (error) {
            console.error("Erreur parsing user:", error);
            localStorage.removeItem('user');
            this.$router.push('/');
          }
        } else {
          console.log("Pas d'utilisateur en localStorage, redirection");
          this.$router.push('/');
        }
      },
          
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    
    handleClickOutside(event) {
      if (!event.target.closest('.profile-section')) {
        this.showProfileMenu = false;
      }
    },
    
    seDeconnecter() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push('/');
    },
    
    // =============================================
    // GESTION DES PROJETS
    // =============================================
    
    async fetchProjects() {
      try {
        const response = await axios.get('/api/projets');
        this.projects = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      }
    },
    
    async fetchGenres() {
      try {
        const response = await axios.get('/api/genres');
        this.genres = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
      }
    },
    
    async fetchStatuts() {
      try {
        const response = await axios.get('/api/statuts-projet');
        this.statuts = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
      }
    },
    
    async loadAllStatuts() {
      try {
        const [projetStatuts, episodeStatuts, sequenceStatuts, sceneStatuts] = await Promise.all([
          axios.get('/api/statuts-projet'),
          axios.get('/api/statuts-episode'),
          axios.get('/api/statuts-sequence'),
          axios.get('/api/statuts-scene')
        ]);
        
        const allStatuts = new Set();
        projetStatuts.data.forEach(statut => allStatuts.add(statut.nomStatutsProjet));
        episodeStatuts.data.forEach(statut => allStatuts.add(statut.nomStatutsEpisode));
        sequenceStatuts.data.forEach(statut => allStatuts.add(statut.nomStatutsSequence));
        sceneStatuts.data.forEach(statut => allStatuts.add(statut.nomStatutsScene));
        
        this.allStatuts = Array.from(allStatuts).sort();
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
        this.allStatuts = [];
      }
    },
    
    startEdit(project) {
      this.editingProject = project;
      this.editForm = {
        titre: project.titre,
        synopsis: project.synopsis || '',
        genreId: project.genreId,
        statutId: this.getCurrentStatutId(project.statutNom),
        dateFin: project.dateFin
      };
    },
    
    getCurrentStatutId(statutNom) {
      const statut = this.statuts.find(s => s.nomStatutsProjet === statutNom);
      return statut ? statut.idStatutProjet : '';
    },
    
    async submitEdit() {
      this.editLoading = true;
      this.editError = '';
      
      try {
        const response = await axios.put(`/api/projets/${this.editingProject.id}`, this.editForm);
        if (response.status === 200) {
          await this.fetchProjects();
          await this.loadStats();
          
          // FORCER le rechargement des activités
          console.log("🔄 Rechargement des activités après modification");
          await this.loadRecentActivities();
          
          await this.loadUserStatistics();
          this.cancelEdit();
          
          this.showNotification('Projet modifié avec succès !', 'success');
        }
      } catch (error) {
        console.error('Erreur lors de la modification du projet:', error);
        this.editError = error.response?.data?.message || 'Erreur lors de la modification du projet';
      } finally {
        this.editLoading = false;
      }
    },
    
    cancelEdit() {
      this.editingProject = null;
      this.editForm = {
        titre: '',
        synopsis: '',
        genreId: '',
        statutId: '',
        dateFin: ''
      };
      this.editError = '';
    },

    confirmDeleteProject(project) {
      this.projectToDelete = project;
      this.showDeleteModal = true;
      this.deleteError = '';
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.projectToDelete = null;
      this.isDeleting = false;
      this.deleteError = '';
    },

    showNotification(text, type = 'success') {
      this.message = {
        text: text,
        type: type
      };
      
      // Annuler le timeout précédent s'il existe
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      
      // Masquer automatiquement après 5 secondes
      this.notificationTimeout = setTimeout(() => {
        this.clearMessage();
      }, 5000);
    },
    
    clearMessage() {
      this.message = null;
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = null;
      }
    },
    
    // Alias pour compatibilité
    hideNotification() {
      this.clearMessage();
    },

    async executeDeleteProject() {
      if (!this.projectToDelete) return;
      
      this.isDeleting = true;
      this.deleteError = '';
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          this.deleteError = 'Utilisateur non connecté';
          this.showNotification('Utilisateur non connecté', 'error');
          this.isDeleting = false;
          return;
        }

        // Utilisez getUserId() pour obtenir l'ID correct
        const userId = this.getUserId();
        
        console.log("DEBUG - User ID pour suppression:", userId);

        await axios.delete(`/api/projets/${this.projectToDelete.id}`, {
          headers: {
            'X-User-Id': userId
          }
        });
        
        await this.fetchProjects();
        await this.loadStats();
        
        // Recharger les activités après suppression
        console.log("🔄 Rechargement des activités après suppression");
        await this.loadRecentActivities();
        
        await this.loadUserStatistics();
        this.closeDeleteModal();

        // Afficher la notification de succès
        this.showNotification('Projet supprimé avec succès !', 'success');
        
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        
        // Amélioration du message d'erreur
        let errorMessage = 'Erreur lors de la suppression du projet';
        
        if (error.response) {
          console.error('Détails erreur:', error.response.data);
          console.error('Status erreur:', error.response.status);
          
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = 'Vous n\'êtes pas autorisé à supprimer ce projet';
          } else {
            errorMessage = error.response.data?.message || `Erreur serveur (${error.response.status})`;
          }
        } else if (error.request) {
          errorMessage = 'Pas de réponse du serveur';
        }
        
        this.deleteError = errorMessage;
        this.showNotification(errorMessage, 'error');
        this.isDeleting = false;
      }
    },

    showSuccessNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 9999;
        animation: fadeInOut 3s ease;
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    },
    
    goToProject(projectId) {
      if (projectId) {
        this.$router.push(`/projet/${projectId}`);
      }
    },
    
    goToAddProject() {
      this.$router.push('/add-project');
    },
    
    goToAddEpisode(projectId) {
      this.$router.push(`/projet/${projectId}/add-episode`);
    },
    
    viewAllActivities() {
      this.$router.push('/activites');
    },
    
    navigateToEcranTravail(result) {
      const queryParams = {};
      
      if (result.type === 'projet') {
        this.$router.push(`/projet/${result.projetId || result.id}/ecran-travail`);
      } else if (result.type === 'episode') {
        queryParams.episodeId = result.id;
        this.$router.push({
          path: `/projet/${result.projetId}/ecran-travail`,
          query: queryParams
        });
      } else if (result.type === 'sequence') {
        queryParams.episodeId = result.episodeId;
        queryParams.sequenceId = result.id;
        this.$router.push({
          path: `/projet/${result.projetId}/ecran-travail`,
          query: queryParams
        });
      } else if (result.type === 'scene') {
        queryParams.episodeId = result.episodeId;
        queryParams.sequenceId = result.sequenceId;
        queryParams.sceneId = result.id;
        this.$router.push({
          path: `/projet/${result.projetId}/ecran-travail`,
          query: queryParams
        });
      }
      
      this.clearGlobalSearch();
    },
    
    // =============================================
    // RECHERCHE GLOBALE
    // =============================================
    
    async performGlobalSearch() {
      if (this.globalSearchTimeout) {
        clearTimeout(this.globalSearchTimeout);
      }
      
      if (this.globalSearchQuery.trim().length < 2) {
        this.showGlobalSearchResults = false;
        this.globalSearchResults = { projets: [], autres: [] };
        return;
      }
      
      this.globalSearchTimeout = setTimeout(() => {
        this.executeGlobalSearch();
      }, 300);
    },
    
    async executeGlobalSearch() {
      try {
        const query = this.globalSearchQuery.trim();
        if (query.length < 2) return;
        
        const response = await axios.get('/api/recherche-globale', {
          params: {
            q: query,
            statut: this.searchStatut,
            specificDate: this.searchSpecificDate,
            date: this.searchDate
          }
        });
        
        const resultats = response.data;
        const projets = resultats.filter(r => r.type === 'projet');
        const autres = resultats.filter(r => r.type !== 'projet');
        
        const projetsAvecDetails = projets.map(projet => ({
          ...projet,
          showDetails: this.expandedProjects.has(projet.id),
          contenu: null
        }));
        
        this.globalSearchResults = {
          projets: projetsAvecDetails,
          autres: autres
        };
        this.showGlobalSearchResults = true;
        
      } catch (error) {
        console.error('Erreur lors de la recherche globale:', error);
        this.globalSearchResults = { projets: [], autres: [] };
        this.showGlobalSearchResults = true;
      }
    },
    
    clearGlobalSearch() {
      this.globalSearchQuery = '';
      this.searchStatut = '';
      this.searchDate = '';
      this.searchSpecificDate = '';
      this.globalSearchResults = { projets: [], autres: [] };
      this.showGlobalSearchResults = false;
      this.expandedProjects.clear();
    },
    
    async toggleProjectDetails(projet) {
      projet.showDetails = !projet.showDetails;
      
      if (projet.showDetails) {
        this.expandedProjects.add(projet.id);
        if (!projet.contenu) {
          await this.chargerContenuProjet(projet);
        }
      } else {
        this.expandedProjects.delete(projet.id);
      }
    },
    
    async chargerContenuProjet(projet) {
      try {
        const [episodesResponse, sequencesResponse, scenesResponse] = await Promise.all([
          axios.get(`/api/episodes/projet/${projet.id}`),
          axios.get(`/api/sequences/projet/${projet.id}`),
          axios.get(`/api/scenes/projet/${projet.id}`)
        ]);
        
        const episodesFormatted = (episodesResponse.data || []).map(episode => ({
          ...episode,
          type: 'episode',
          projetId: projet.id,
          id: episode.idEpisode || episode.id,
          titre: episode.titre,
          statutNom: episode.statutNom,
          modifieLe: episode.modifieLe,
          ordre: episode.ordre
        }));
        
        const sequencesFormatted = (sequencesResponse.data || []).map(sequence => ({
          ...sequence,
          type: 'sequence',
          projetId: projet.id,
          id: sequence.idSequence || sequence.id,
          episodeId: sequence.episodeId,
          titre: sequence.titre,
          statutNom: sequence.statutNom,
          modifieLe: sequence.modifieLe,
          ordre: sequence.ordre,
          ordreEpisode: sequence.episode?.ordre
        }));
        
        const scenesFormatted = (scenesResponse.data || []).map(scene => ({
          ...scene,
          type: 'scene',
          projetId: projet.id,
          id: scene.idScene || scene.id,
          sequenceId: scene.sequenceId,
          titre: scene.titre,
          statutNom: scene.statutNom,
          modifieLe: scene.modifieLe,
          ordre: scene.ordre,
          ordreSequence: scene.sequence?.ordre
        }));
        
        projet.contenu = {
          episodes: episodesFormatted,
          sequences: sequencesFormatted,
          scenes: scenesFormatted
        };
        
      } catch (error) {
        console.error('Erreur lors du chargement du contenu du projet:', error);
        projet.contenu = {
          episodes: [],
          sequences: [],
          scenes: []
        };
      }
    },
    
    handleClickOutsideSearch(event) {
      const searchContainer = event.target.closest('.search-and-filters-Scenariste');
      const resultsContainer = event.target.closest('.global-search-results-Scenariste');
      
      if (!searchContainer && !resultsContainer) {
        this.showGlobalSearchResults = false;
      }
    },
    
    toggleSearch() {
      this.isSearchExpanded = !this.isSearchExpanded;
      
      if (this.isSearchExpanded) {
        this.$nextTick(() => {
          this.$refs.searchInput.focus();
        });
      } else {
        if (!this.globalSearchQuery) {
          this.clearGlobalSearch();
        }
      }
    },
    
    // =============================================
    // STATISTIQUES
    // =============================================
    
    async loadStats() {
      try {
        console.log("🔍 DEBUG: Chargement stats générales pour userId:", this.user?.id_utilisateur);
        
        const userId = this.getUserId();
        const response = await axios.get('/api/scenariste/stats', {
          params: { userId: userId }
        });
        
        console.log("📊 DEBUG: Réponse API stats générales:", response.data);
        
        if (response.data && typeof response.data === 'object') {
          this.stats = {
            projetsActifs: response.data.projetsActifs || 0,
            projetsVariation: response.data.projetsVariation || 0,
            scenesEcrites: response.data.scenesEcrites || 0,
            scenesVariation: response.data.scenesVariation || 0,
            collaborations: response.data.collaborations || 0,
            realisateursActifs: response.data.realisateursActifs || 0,
            echeancesProches: response.data.echeancesProches || 0,
            urgentCount: response.data.urgentCount || 0,
            tempsEcriture: response.data.tempsEcriture || '0h 00mn'
          };
          console.log("✅ DEBUG: stats générales mises à jour:", this.stats);
        } else {
          console.warn("⚠️ DEBUG: Format de réponse inattendu, calcul local");
          this.calculateLocalStats();
        }
      } catch (error) {
        console.error('❌ DEBUG: Erreur chargement stats générales:', error.response?.data || error.message);
        this.calculateLocalStats();
      }
    },
    
    calculateLocalStats() {
      const now = new Date();
      
      const projetsActifs = this.projects.filter(p => 
        p.statutNom === 'En cours' || p.statutNom === 'En préparation'
      ).length;
      
      const scenesEcrites = this.projects.reduce((total, p) => {
        return total + (p.nombreScenes || 0);
      }, 0);
      
      const echeancesProches = this.projects.filter(p => {
        if (!p.dateFin) return false;
        const deadline = new Date(p.dateFin);
        const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      }).length;
      
      const urgentCount = this.projects.filter(p => {
        if (!p.dateFin) return false;
        const deadline = new Date(p.dateFin);
        const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return diffDays <= 2 && diffDays >= 0;
      }).length;
      
      const collaborations = Math.floor(this.projects.length * 0.5);
      
      this.stats = {
        projetsActifs,
        projetsVariation: 0,
        scenesEcrites,
        scenesVariation: 0,
        collaborations,
        realisateursActifs: collaborations,
        echeancesProches,
        urgentCount,
        tempsEcriture: this.formatTemps(scenesEcrites * 45)
      };
    },
    
    async loadUserStatistics() {
      
      try {
    // Pour les viewers, charger des statistiques simplifiées
    if (this.isViewer) {
      this.userStats = {
        productivite: 0,
        scenesModifiees7j: 0,
        tendanceScenes: 0,
        tempsTotalMinutes: 0,
        moyenneQuotidienneMinutes: 0,
        sessionMoyenneMinutes: 0,
        objectifs: {
          scenesCompletees: 0,
          scenesCibles: 0,
          dialoguesEcrits: 0,
          dialoguesCibles: 0,
          progressionScenes: 0,
          progressionDialogues: 0
        }
      };
      return;
    }
        
        console.log("✅ DEBUG: userStats mis à jour:", this.userStats);
        
      } catch (error) {
        console.error('❌ DEBUG: Erreur chargement stats personnelles', error.response?.data || error.message);
        this.calculateBasicStats();
      }
    },
    
    calculateBasicStats() {
      console.log("🔍 DEBUG: Calcul stats basiques pour projets:", this.projects.length);
      
      const now = new Date();
      const totalProjects = this.projects.length;
      const activeProjects = this.projects.filter(p => 
        p.statutNom === 'En cours' || p.statutNom === 'En préparation'
      ).length;
      
      // Productivité basée sur les projets actifs vs total
      const productivite = totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0;
      
      let totalScenes = 0;
      this.projects.forEach(p => {
        totalScenes += p.nombreScenes || 0;
      });
      
      const estimatedMinutes = totalScenes * 45;
      
      this.userStats = {
        productivite: productivite,
        scenesModifiees7j: Math.floor(totalScenes * 0.3),
        tendanceScenes: 0,
        tempsTotalMinutes: estimatedMinutes,
        moyenneQuotidienneMinutes: Math.floor(estimatedMinutes / 30),
        sessionMoyenneMinutes: 45,
        objectifs: {
          scenesCompletees: Math.floor(totalScenes * 0.5),
          scenesCibles: Math.max(totalScenes, 10),
          dialoguesEcrits: Math.floor(totalScenes * 3),
          dialoguesCibles: Math.max(totalScenes * 3, 50),
          progressionScenes: totalScenes > 0 ? Math.round((Math.floor(totalScenes * 0.5) / Math.max(totalScenes, 10)) * 100) : 0,
          progressionDialogues: totalScenes > 0 ? Math.round((Math.floor(totalScenes * 3) / Math.max(totalScenes * 3, 50)) * 100) : 0
        }
      };
      
      console.log("✅ DEBUG: Stats basiques calculées:", this.userStats);
    },
    
    async loadWritingStats() {
      try {
        const response = await axios.get('/api/scenariste/stats-ecriture', {
          params: { userId: this.user.id_utilisateur }
        });
        
        if (response.data && typeof response.data === 'object') {
          this.writingStats = {
            tempsTotalMinutes: response.data.tempsTotalMinutes || 0,
            tempsTotalFormate: response.data.tempsTotalFormate || '0h 00min',
            joursEcriture: response.data.joursEcriture || 0,
            moyenneQuotidienneMinutes: response.data.moyenneQuotidienneMinutes || 0,
            moyenneQuotidienneFormate: response.data.moyenneQuotidienneFormate || '0h 00min',
            motsAjoutes: response.data.motsAjoutes || 0,
            motsSupprimes: response.data.motsSupprimes || 0,
            motsNets: response.data.motsNets || 0,
            motsParJour: response.data.motsParJour || 0,
            totalPages: response.data.totalPages || 0,
            moyennePagesParJour: response.data.moyennePagesParJour || 0,
            motsParPage: response.data.motsParPage || 250,
            periodePreferee: response.data.periodePreferee || 'Indéterminé',
            iconePeriode: response.data.iconePeriode || 'fas fa-question',
            couleurFondPeriode: response.data.couleurFondPeriode || '#f0f8ff',
            distributionPeriodes: response.data.distributionPeriodes || [],
            conseils: response.data.conseils || [],
            motsParType: response.data.motsParType || [],
            productiviteMotsParMinute: response.data.productiviteMotsParMinute || 0,
            consistanceEcriture: response.data.consistanceEcriture || 'Débutant',
            tendanceMots: response.data.tendanceMots || 0
          };
        } else {
          this.setDefaultWritingStats();
        }
      } catch (error) {
        console.error('Erreur chargement stats écriture:', error);
        this.setDefaultWritingStats();
      }
    },
    
    setDefaultWritingStats() {
      this.writingStats = {
        tempsTotalMinutes: 0,
        tempsTotalFormate: '0h 00min',
        joursEcriture: 0,
        moyenneQuotidienneMinutes: 0,
        moyenneQuotidienneFormate: '0h 00min',
        motsAjoutes: 0,
        motsSupprimes: 0,
        motsNets: 0,
        motsParJour: 0,
        totalPages: 0,
        moyennePagesParJour: 0,
        motsParPage: 250,
        periodePreferee: 'Indéterminé',
        iconePeriode: 'fas fa-question',
        couleurFondPeriode: '#f0f8ff',
        distributionPeriodes: [],
        conseils: [
          'Commencez par écrire 15 minutes chaque jour',
          'Utilisez la technique Pomodoro pour rester concentré',
          'Relisez-vous le lendemain pour améliorer votre texte'
        ],
        motsParType: [],
        productiviteMotsParMinute: 0,
        consistanceEcriture: 'Débutant',
        tendanceMots: 0
      };
    },
    
    startWritingSession(projetId, typeContenu, contenuId, initialWordCount = 0) {
      this.currentSession = {
        startTime: new Date(),
        motsDepart: initialWordCount,
        projetId,
        typeContenu,
        contenuId
      };
      
      if (this.writingTimer) clearInterval(this.writingTimer);
      this.writingTimer = setInterval(() => {
        this.updateWritingStats();
      }, 300000);
    },
    
    async stopWritingSession(currentWordCount = 0) {
      if (!this.currentSession.startTime) return;
      
      const endTime = new Date();
      const dureeMs = endTime - this.currentSession.startTime;
      const dureeMinutes = Math.round(dureeMs / 60000);
      const motsAjoutes = Math.max(0, currentWordCount - this.currentSession.motsDepart);
      
      try {
        await axios.post('/api/scenariste/enregistrer-session', {
          userId: this.user.id_utilisateur,
          projetId: this.currentSession.projetId,
          typeContenu: this.currentSession.typeContenu,
          contenuId: this.currentSession.contenuId,
          dureeMinutes,
          motsAjoutes,
          motsSupprimes: 0,
          dateDebut: this.currentSession.startTime.toISOString(),
          dateFin: endTime.toISOString()
        });
        
        await this.loadWritingStats();
        
      } catch (error) {
        console.error('Erreur enregistrement session:', error);
      }
      
      this.currentSession = {
        startTime: null,
        motsDepart: 0,
        projetId: null,
        typeContenu: null,
        contenuId: null
      };
      
      if (this.writingTimer) {
        clearInterval(this.writingTimer);
        this.writingTimer = null;
      }
    },
    
    updateWritingStats() {
      if (this.user && this.user.id_utilisateur) {
        this.loadWritingStats();
      }
    },
    
    // =============================================
    // ACTIVITÉS ET PROJETS PRIORITAIRES
    // =============================================
    
    async loadRecentActivities() {
      console.log("🔍 DEBUG: Chargement activités pour userId:", this.user?.id_utilisateur);
      
      try {
        const userId = this.getUserId();
        console.log("🔍 DEBUG: ID utilisé pour API activités:", userId);
        
        const response = await axios.get('/api/scenariste/activites/recentes', {
          params: { 
            userId: userId,
            limit: 5 
          }
        });
        
        console.log("📊 DEBUG: Réponse brute API activités:", response);
        console.log("📊 DEBUG: Données API activités:", response.data);
        
        // IMPORTANT: Le backend retourne un objet avec une propriété "activities"
        const responseData = response.data;
        
        if (responseData && responseData.activities && Array.isArray(responseData.activities)) {
          // Les activités sont dans response.data.activities
          this.recentActivities = responseData.activities.map(activity => {
            // Si l'activité a déjà un format correct
            if (activity.description && activity.date) {
              return {
                id: activity.id || Math.random().toString(36).substr(2, 9),
                type: activity.type || 'edit',
                description: activity.description,
                date: activity.date,
                projetId: activity.projetId,
                projetTitre: activity.projetTitre
              };
            }
            
            // Sinon, formater pour l'affichage
            return {
              id: activity.id || Math.random().toString(36).substr(2, 9),
              type: activity.type || 'edit',
              description: this.formatActivityDescription(activity),
              date: activity.date || activity.timestamp || new Date().toISOString(),
              projetId: activity.projetId,
              projetTitre: activity.projetTitre || 'Projet'
            };
          });
          
          console.log("✅ DEBUG: Activités formatées:", this.recentActivities);
          
          // Si aucune activité n'est retournée, afficher un message
          if (this.recentActivities.length === 0) {
            console.log("ℹ️ Aucune activité récente trouvée");
          }
          
        } else {
          console.warn("⚠️ DEBUG: Format de réponse inattendu, génération basique");
          this.showExampleActivities();
        }
        
      } catch (error) {
        console.error('❌ DEBUG: Erreur chargement activités:', error);
        console.error('❌ DEBUG: Détails:', error.response?.data || error.message);
        
        // En cas d'erreur, afficher des exemples
        this.showExampleActivities();
      }
    },

    // Méthode pour afficher des exemples pendant le développement
    showExampleActivities() {
      console.log("🔄 Affichage d'exemples d'activités");
      
      const now = new Date();
      this.recentActivities = [
        {
          id: 'example-1',
          type: 'scene_modified',
          description: 'Scène "Le Rendez-vous" modifiée',
          date: new Date(now.getTime() - 30 * 60000).toISOString(), // Il y a 30 minutes
          projetId: 1,
          projetTitre: 'Mon Film'
        },
        {
          id: 'example-2',
          type: 'project_created',
          description: 'Projet "Nouvelle Série" créé',
          date: new Date(now.getTime() - 2 * 3600000).toISOString(), // Il y a 2 heures
          projetId: 2,
          projetTitre: 'Nouvelle Série'
        },
        {
          id: 'example-3',
          type: 'dialogue_created',
          description: 'Dialogue créé dans "Scène d\'ouverture"',
          date: new Date(now.getTime() - 1 * 24 * 3600000).toISOString(), // Il y a 1 jour
          projetId: 1,
          projetTitre: 'Mon Film'
        },
        {
          id: 'example-4',
          type: 'scene_created',
          description: 'Nouvelle scène "Rencontre" créée',
          date: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(), // Il y a 3 jours
          projetId: 1,
          projetTitre: 'Mon Film'
        },
        {
          id: 'example-5',
          type: 'status_changed',
          description: 'Statut du projet "Documentaire" mis à jour',
          date: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(), // Il y a 5 jours
          projetId: 3,
          projetTitre: 'Documentaire'
        }
      ];
      
      console.log("✅ Exemples d'activités chargés:", this.recentActivities);
    },

    // Formater la description d'une activité
    formatActivityDescription(activity) {
      const type = activity.type || '';
      const projetTitre = activity.projetTitre || 'un projet';
      
      switch(type) {
        case 'scene_created':
          return `Scène créée dans ${projetTitre}`;
        case 'scene_modified':
          return `Scène modifiée dans ${projetTitre}`;
        case 'project_created':
          return `Projet "${projetTitre}" créé`;
        case 'project_modified':
          return `Projet "${projetTitre}" modifié`;
        case 'dialogue_created':
          return `Dialogue créé dans ${projetTitre}`;
        case 'episode_created':
          return `Épisode créé dans ${projetTitre}`;
        case 'status_changed':
          return `Statut mis à jour dans ${projetTitre}`;
        default:
          return `Activité dans ${projetTitre}`;
      }
    },

    getActivityIcon(type) {
      const icons = {
        // Création
        'scene_created': 'fas fa-plus-circle',
        'dialogue_created': 'fas fa-plus-circle',
        'project_created': 'fas fa-plus-circle',
        'episode_created': 'fas fa-plus-circle',
        
        // Modification
        'scene_modified': 'fas fa-marker',
        'project_modified': 'fas fa-marker',
        'episode_modified': 'fas fa-marker',
        
        // Suppression
        'scene_deleted': 'fas fa-trash',
        'project_deleted': 'fas fa-trash',
        
        // Commentaires
        'comment': 'fas fa-comment',
        
        // Statut
        'status': 'fas fa-sync',
        'status_changed': 'fas fa-sync',
        
        // Par défaut
        'create': 'fas fa-plus-circle',
        'edit': 'fas fa-marker',
        'delete': 'fas fa-trash',
        'test_modified': 'fas fa-test'
      };
      
      // Retourne l'icône spécifique ou une icône par défaut
      return icons[type] || 'fas fa-circle';
    },
    
    getActivityTypeClass(type) {
      const typeClasses = {
        // Création - vert
        'scene_created': 'type-create',
        'dialogue_created': 'type-create',
        'project_created': 'type-create',
        'episode_created': 'type-create',
        'create': 'type-create',
        
        // Modification - bleu
        'scene_modified': 'type-edit',
        'project_modified': 'type-edit',
        'episode_modified': 'type-edit',
        'edit': 'type-edit',
        
        // Suppression - rouge
        'scene_deleted': 'type-delete',
        'project_deleted': 'type-delete',
        'delete': 'type-delete',
        
        // Commentaires - orange
        'comment': 'type-comment',
        
        // Statut - violet
        'status': 'type-status',
        'status_changed': 'type-status',
        
        // Test - gris
        'test_modified': 'type-default'
      };
      
      return typeClasses[type] || 'type-default';
    },

    getActivityTypeLabel(type) {
      const labels = {
        'scene_created': 'Créé',
        'dialogue_created': 'Créé',
        'project_created': 'Créé',
        'episode_created': 'Créé',
        'scene_modified': 'Modifié',
        'project_modified': 'Modifié',
        'scene_deleted': 'Supprimé',
        'project_deleted': 'Supprimé',
        'comment': 'Commentaire',
        'status': 'Statut',
        'collaboration': 'Collaboration'
      };
      
      return labels[type] || 'Activité';
    },
    
    async loadPriorityProjects() {
      try {
        const response = await axios.get('/api/scenariste/projets/prioritaires', {
          params: { 
            userId: this.user.id_utilisateur,
            limit: 3 
          }
        });
        
        if (response.data && response.data.projects) {
          this.priorityProjects = response.data.projects;
        } else if (Array.isArray(response.data)) {
          this.priorityProjects = response.data;
        } else {
          this.priorityProjects = [];
        }
      } catch (error) {
        console.error('Erreur chargement projets prioritaires:', error);
        this.calculatePriorityProjects();
      }
    },
    
    calculatePriorityProjects() {
      const now = new Date();
      this.priorityProjects = this.projects
        .map(project => {
          let priorite = 'low';
          let progress = Math.floor(Math.random() * 60) + 20;
          
          if (project.dateFin) {
            const deadline = new Date(project.dateFin);
            const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 3) priorite = 'high';
            else if (diffDays <= 7) priorite = 'medium';
          }
          
          return {
            ...project,
            priorite,
            progress
          };
        })
        .filter(p => p.priorite !== 'low')
        .slice(0, 3);
    },
    
    // =============================================
    // MÉTHODES UTILITAIRES
    // =============================================
    
    // Filtrage par période
    filterByTimePeriod(list) {
      const now = new Date();
      let startDate;
      
      switch (this.filterTimePeriod) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'this_week':
          const dayOfWeek = now.getDay();
          const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          startDate = new Date(now);
          startDate.setDate(now.getDate() - diffToMonday);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'recent':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        default:
          return list;
      }
      
      return list.filter(p => {
        const modifieLe = new Date(p.modifieLe);
        return modifieLe >= startDate;
      });
    },
    
    // Formatage
    formatTemps(minutes) {
      if (!minutes || minutes === 0) return '0min';
      const heures = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return heures > 0 ? `${heures}h${mins.toString().padStart(2, '0')}min` : `${mins}min`;
    },
    
    formatDate(date) {
      return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    formatShortDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    
    formatActivityTime(date) {
      if (!date) return 'Date inconnue';
      const now = new Date();
      const activityDate = new Date(date);
      const diffMinutes = Math.floor((now - activityDate) / (1000 * 60));
      
      if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
      if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)}h`;
      return activityDate.toLocaleDateString('fr-FR');
    },
    
    formatDeadline(date) {
      if (!date) return 'Non définie';
      const deadline = new Date(date);
      const now = new Date();
      const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Dépassée';
      if (diffDays === 0) return "Aujourd'hui";
      if (diffDays === 1) return 'Demain';
      if (diffDays < 7) return `Dans ${diffDays} jours`;
      return deadline.toLocaleDateString('fr-FR');
    },
    
    // Texte
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    calculateWordCount(text) {
      if (!text) return 0;
      const cleaned = text.trim().replace(/\s+/g, ' ');
      return cleaned.split(' ').filter(word => word.length > 0).length;
    },
    
    getStatutClass(statutNom) {
      const statutClasses = {
        'En cours': 'statut-en-cours',
        'Terminé': 'statut-termine',
        'En attente': 'statut-attente',
        'Annulé': 'statut-annule',
        'Planifié': 'statut-planifie',
        'En préparation': 'statut-preparation',
        'En tournage': 'statut-tournage',
        'Tourné': 'statut-tourne',
        'Monté': 'statut-monte',
        'Validé': 'statut-valide'
      };
      return statutClasses[statutNom] || 'statut-default';
    },
    
    getTypeLabel(type) {
      const labels = {
        'projet': 'Projet',
        'episode': 'Épisode',
        'sequence': 'Séquence',
        'scene': 'Scène'
      };
      return labels[type] || type;
    },
    
    getResultIcon(type) {
      const icons = {
        'projet': 'fas fa-film',
        'episode': 'fas fa-list-alt',
        'sequence': 'fas fa-layer-group',
        'scene': 'fas fa-clipboard'
      };
      return icons[type] || 'fas fa-file';
    },
    
    getPeriodeIcon(periode) {
      const icons = {
        'matin': 'fas fa-sun',
        'apres_midi': 'fas fa-sun',
        'soir': 'fas fa-moon',
        'nuit': 'fas fa-star'
      };
      return icons[periode] || 'fas fa-clock';
    },
    
    getPeriodeLabel(periode) {
      const labels = {
        'matin': 'Matin (6h-12h)',
        'apres_midi': 'Après-midi (12h-18h)',
        'soir': 'Soir (18h-22h)',
        'nuit': 'Nuit (22h-6h)'
      };
      return labels[periode] || periode;
    },
    
    getContentTypeIcon(type) {
      const icons = {
        'projet': 'fas fa-film',
        'episode': 'fas fa-list-alt',
        'sequence': 'fas fa-layer-group',
        'scene': 'fas fa-clipboard',
        'dialogue': 'fas fa-comment-alt'
      };
      return icons[type] || 'fas fa-file';
    },
    
    getContentTypeLabel(type) {
      const labels = {
        'projet': 'Projet',
        'episode': 'Épisode',
        'sequence': 'Séquence',
        'scene': 'Scène',
        'dialogue': 'Dialogue'
      };
      return labels[type] || type;
    },
    
    getPriorityLabel(priority) {
      const labels = {
        'high': 'Haute',
        'medium': 'Moyenne',
        'low': 'Basse'
      };
      return labels[priority] || priority;
    },
    
    getPriorityClass(priority) {
      return `priority-${priority}`;
    },
    
    calculatePercentage(value, array) {
      if (!array || array.length === 0) return 0;
      const total = array.reduce((sum, item) => sum + (item.minutes || 0), 0);
      return total > 0 ? Math.round((value / total) * 100) : 0;
    },
    
    // Autres
    isUrgent(date) {
      if (!date) return false;
      const deadline = new Date(date);
      const now = new Date();
      const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 2 && diffDays >= 0;
    },
    
    addToCalendar(project) {
      console.log('Ajouter au calendrier:', project.titre);
      alert(`"${project.titre}" a été ajouté à votre calendrier`);
    },
    
    setReminder(project) {
      console.log('Définir rappel pour:', project.titre);
      alert(`Rappel défini pour "${project.titre}" dans 1 jour`);
    },
    // Méthode pour naviguer vers l'écran de travail
    goToEcranTravail(project) {
      // Pour les viewers, ajouter un paramètre 'viewer=true'
      if (this.isViewer) {
        this.$router.push({
          path: `/projet/${project.id}/ecran-travail`,
          query: { viewer: 'true' }
        });
      } else {
        this.$router.push(`/projet/${project.id}/ecran-travail`);
      }
    }
  }
};
</script>

