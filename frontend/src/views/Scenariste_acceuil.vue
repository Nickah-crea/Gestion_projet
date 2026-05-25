<template>
  <div class="app-wrapper-global accueil-scenariste">
      <div class="sidebar-left-fixed-Scenariste" v-if="!isViewer">
        <!-- Section Productivité -->
        <div class="personal-stats-compact-Scenariste">
          <h3 class="section-title-compact-Scenariste">
            <i class="fas fa-chart-line"></i>
            Productivité
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
              <div class="stat-subtext-Scenariste">
                {{ userStats.scenesModifiees7j || 0 }} scène(s) cette semaine
              </div>
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

      <!-- Pour les VIEWERS: sidebar différente -->
      <div class="sidebar-left-fixed-Scenariste viewer-sidebar" v-else>
        <!-- Section simple pour viewers -->
        <div class="viewer-info-section">
          <h3 class="viewer-title">
            <i class="fas fa-eye"></i> Mode Lecture
          </h3>
          
          <div class="viewer-stats">
            <div class="viewer-stat-item">
              <i class="fas fa-film"></i>
              <div class="viewer-stat-content">
                <div class="viewer-stat-value">{{ stats.projetsActifs || 0 }}</div>
                <div class="viewer-stat-label">Projets disponibles</div>
              </div>
            </div>
            
            <div class="viewer-stat-item">
              <i class="fas fa-scroll"></i>
              <div class="viewer-stat-content">
                <div class="viewer-stat-value">{{ stats.scenesEcrites || 0 }}</div>
                <div class="viewer-stat-label">Scènes consultables</div>
              </div>
            </div>
          </div>
          
          <div class="viewer-message">
            <p><i class="fas fa-info-circle"></i> Vous êtes en mode consultation uniquement.</p>
            <p>Pas de modifications possibles.</p>
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

                <!-- NOUVEAU : Icône étoile pour les projets où l'utilisateur participe -->
                <span v-if="project.userParticipates" 
                      class="participation-badge-Scenariste" 
                      title="Vous participez à ce projet">
                  <i class="fas fa-star"></i>
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
      activityRefreshInterval: null,
      
      userParticipatingProjects: new Set()
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
      
      return list.map(project => ({
        ...project,
        userParticipates: this.userParticipatingProjects.has(project.id)
      }));
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
    
    this.activityRefreshInterval = setInterval(() => {
      if (this.user && this.user.id_utilisateur) {
        console.log("🔄 Rafraîchissement automatique des activités");
        this.loadRecentActivities();
        if (!this.isViewer) {
          this.loadUserStatistics();
        }
      }
    }, 30000);
  },
  
  beforeUnmount() {
    this.cleanupComponent();
    
    if (this.activityRefreshInterval) {
      clearInterval(this.activityRefreshInterval);
    }
  },
  
  methods: {
    initializeComponent() {
      this.loadUser();
      this.fetchGenres();
      this.fetchStatuts();
      
      if (this.isViewer) {
        this.fetchProjectsForViewer().then(() => {
          this.loadUserParticipatingProjects();
        });
      } else {
        this.fetchProjects().then(() => {
          this.loadUserParticipatingProjects();
        });
      }
      
      this.loadAllStatuts();
      
      setTimeout(async () => {
        await this.loadStats();
        console.log("🔄 Chargement des activités");
        await this.loadRecentActivities();
        
        if (!this.isViewer) {
          await this.loadPriorityProjects();
          await this.loadUserStatistics();
          await this.loadWritingStats();
        }
      }, 100);
      
      document.addEventListener('click', this.handleClickOutside);
      document.addEventListener('click', this.handleClickOutsideSearch);
      
      if (!this.isViewer) {
        setInterval(() => {
          if (this.user && this.user.id_utilisateur) {
            this.loadWritingStats();
          }
        }, 600000);
      }
    },
    
    cleanupComponent() {
      if (this.writingTimer) {
        clearInterval(this.writingTimer);
      }
      
      if (this.currentSession.startTime) {
        this.stopWritingSession();
      }
    
      document.removeEventListener('click', this.handleClickOutside);
      document.removeEventListener('click', this.handleClickOutsideSearch);
    },
    
    getUserId() {
      const user = this.user;
      
      if (!user) {
        console.warn("User non défini");
        return 4;
      }
      
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
      return 4;
    },

    loadUser() {
      const userStr = localStorage.getItem('user');
      console.log("Raw user from localStorage:", userStr);
      
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
          console.log("Parsed user object:", this.user);
          
          if (!this.user.id_utilisateur) {
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
    
    async fetchProjects() {
      try {
        const userId = this.getUserId();
        const response = await axios.get(`/api/projets/user/${userId}`);
         
        this.projects = response.data.map(project => ({
          ...project,
          estProjetPersonnel: this.isUserProject(project, userId),
          visibleParTousScenaristes: project.visibleParTousScenaristes || false
        }));
        
        console.log("Projets chargés:", this.projects.length);
        
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        this.fetchProjectsLegacy();
      }
    },

    async fetchProjectsLegacy() {
      try {
        const response = await axios.get('/api/projets');
        const userId = this.getUserId();
        
        this.projects = response.data.map(project => ({
          ...project,
          visibleParTousScenaristes: this.isProjectVisibleToAllScenaristes(project),
          estProjetPersonnel: this.isUserProject(project, userId)
        }));
      } catch (error) {
        console.error('Erreur:', error);
      }
    },

    isUserProject(project, userId) {
      return project.scenaristeIds?.includes(userId) || false;
    },
    
    isProjectVisibleToAllScenaristes(project) {
      if (project.statutNom === 'En cours') return true;
      if (project.genreNom === 'Documentaire') return true;
      if (project.creeLe) {
        const createdDate = new Date(project.creeLe);
        const now = new Date();
        const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) return true;
      }
      return false;
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
      
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      
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
    
    hideNotification() {
      this.clearMessage();
    },

    async executeDeleteProject() {
      if (!this.projectToDelete) return;
      
      this.isDeleting = true;
      this.deleteError = '';
      
      try {
        const userId = this.getUserId();

        await axios.delete(`/api/projets/${this.projectToDelete.id}`, {
          headers: {
            'X-User-Id': userId
          }
        });
        
        await this.fetchProjects();
        await this.loadStats();
        
        console.log("🔄 Rechargement des activités après suppression");
        await this.loadRecentActivities();
        
        await this.loadUserStatistics();
        this.closeDeleteModal();

        this.showNotification('Projet supprimé avec succès !', 'success');
        
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        
        let errorMessage = 'Erreur lors de la suppression du projet';
        
        if (error.response) {
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
    
    // ========== STATISTIQUES DE PRODUCTIVITÉ (NOUVELLE MÉTHODE) ==========
    
    async loadUserStatistics() {
      try {
        if (this.isViewer) {
          this.setDefaultUserStats();
          return;
        }
        
        const userId = this.getUserId();
        console.log("🔍 Chargement stats productivité pour userId:", userId);
        
        // Appel au nouvel endpoint /api/scenaristes/stats/productivite
        const response = await axios.get('/api/scenaristes/stats/productivite', {
          params: { userId: userId }
        });
        
        if (response.data) {
          const data = response.data;
          this.userStats = {
            productivite: data.productivite || 0,
            scenesModifiees7j: data.scenesModifiees7j || 0,
            tendanceScenes: data.tendanceScenes || 0,
            tempsTotalMinutes: data.tempsTotalMinutes || 0,
            moyenneQuotidienneMinutes: data.moyenneQuotidienneMinutes || 0,
            sessionMoyenneMinutes: data.sessionMoyenneMinutes || 45,
            objectifs: {
              scenesCompletees: data.scenesModifiees7j || 0,
              scenesCibles: 5,
              dialoguesEcrits: (data.scenesModifiees7j || 0) * 3,
              dialoguesCibles: 50,
              progressionScenes: Math.min(100, Math.round(((data.scenesModifiees7j || 0) / 5) * 100)),
              progressionDialogues: Math.min(100, Math.round((((data.scenesModifiees7j || 0) * 3) / 50) * 100))
            }
          };
          
          console.log("✅ Stats productivité chargées:", this.userStats);
        } else {
          this.calculateLocalStatsFromProjects();
        }
      } catch (error) {
        console.error('❌ Erreur chargement stats productivité:', error);
        console.error('Détails:', error.response?.data || error.message);
        this.calculateLocalStatsFromProjects();
      }
    },
    
    // Méthode de secours pour calculer les stats localement
    calculateLocalStatsFromProjects() {
      console.log("📊 Calcul local des stats productivité");
      
      let totalScenes = 0;
      this.projects.forEach(project => {
        totalScenes += project.nombreScenes || Math.floor(Math.random() * 10) + 1;
      });
      
      const scenesModifiees7j = Math.min(totalScenes, Math.floor(totalScenes * 0.3) + 1);
      const productivite = Math.min(100, Math.floor((scenesModifiees7j / 5) * 100));
      
      this.userStats = {
        productivite: productivite,
        scenesModifiees7j: scenesModifiees7j,
        tendanceScenes: Math.floor(Math.random() * 40) - 10,
        tempsTotalMinutes: scenesModifiees7j * 30,
        moyenneQuotidienneMinutes: Math.floor((scenesModifiees7j * 30) / 7),
        sessionMoyenneMinutes: 45,
        objectifs: {
          scenesCompletees: scenesModifiees7j,
          scenesCibles: 5,
          dialoguesEcrits: scenesModifiees7j * 3,
          dialoguesCibles: 50,
          progressionScenes: Math.min(100, Math.floor((scenesModifiees7j / 5) * 100)),
          progressionDialogues: Math.min(100, Math.floor(((scenesModifiees7j * 3) / 50) * 100))
        }
      };
      
      console.log("✅ Stats locales calculées:", this.userStats);
    },
    
    setDefaultUserStats() {
      this.userStats = {
        productivite: 0,
        scenesModifiees7j: 0,
        tendanceScenes: 0,
        tempsTotalMinutes: 0,
        moyenneQuotidienneMinutes: 0,
        sessionMoyenneMinutes: 0,
        objectifs: {
          scenesCompletees: 0,
          scenesCibles: 5,
          dialoguesEcrits: 0,
          dialoguesCibles: 50,
          progressionScenes: 0,
          progressionDialogues: 0
        }
      };
    },
    
    // ========== ACTIVITÉS RÉCENTES (MISE À JOUR) ==========
    
    async loadRecentActivities() {
      console.log("🔍 Chargement des activités récentes pour userId:", this.user?.id_utilisateur);
      
      try {
        const userId = this.getUserId();
        console.log("🔍 ID utilisé pour API activités:", userId);
        
        // Appel au nouvel endpoint /api/scenaristes/stats/activites-recentes
        const response = await axios.get('/api/scenaristes/stats/activites-recentes', {
          params: { 
            userId: userId,
            limit: 5 
          }
        });
        
        console.log("📊 Réponse API activités:", response.data);
        
        if (response.data && response.data.activities && Array.isArray(response.data.activities)) {
          this.recentActivities = response.data.activities.map(activity => ({
            id: activity.id || Math.random().toString(36).substr(2, 9),
            type: activity.type || 'edit',
            description: activity.description,
            date: activity.date,
            projetId: activity.projetId,
            projetTitre: activity.projetTitre
          }));
          
          console.log("✅ Activités chargées:", this.recentActivities.length);
        } else {
          console.warn("Format de réponse inattendu, génération d'exemples");
          this.showExampleActivities();
        }
        
      } catch (error) {
        console.error('❌ Erreur chargement activités:', error);
        this.showExampleActivities();
      }
    },

    showExampleActivities() {
      console.log("🔄 Affichage d'exemples d'activités");
      
      const now = new Date();
      this.recentActivities = [
        {
          id: 'example-1',
          type: 'scene_modified',
          description: 'Scène "Le Rendez-vous" modifiée',
          date: new Date(now.getTime() - 30 * 60000).toISOString(),
          projetId: 1,
          projetTitre: 'Mon Film'
        },
        {
          id: 'example-2',
          type: 'project_created',
          description: 'Projet "Nouvelle Série" créé',
          date: new Date(now.getTime() - 2 * 3600000).toISOString(),
          projetId: 2,
          projetTitre: 'Nouvelle Série'
        },
        {
          id: 'example-3',
          type: 'dialogue_created',
          description: 'Dialogue créé dans "Scène d\'ouverture"',
          date: new Date(now.getTime() - 1 * 24 * 3600000).toISOString(),
          projetId: 1,
          projetTitre: 'Mon Film'
        },
        {
          id: 'example-4',
          type: 'scene_created',
          description: 'Nouvelle scène "Rencontre" créée',
          date: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(),
          projetId: 1,
          projetTitre: 'Mon Film'
        },
        {
          id: 'example-5',
          type: 'status_changed',
          description: 'Statut du projet "Documentaire" mis à jour',
          date: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(),
          projetId: 3,
          projetTitre: 'Documentaire'
        }
      ];
      
      console.log("✅ Exemples d'activités chargés:", this.recentActivities);
    },

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
        'scene_created': 'fas fa-plus-circle',
        'dialogue_created': 'fas fa-plus-circle',
        'project_created': 'fas fa-plus-circle',
        'episode_created': 'fas fa-plus-circle',
        'scene_modified': 'fas fa-marker',
        'project_modified': 'fas fa-marker',
        'episode_modified': 'fas fa-marker',
        'scene_deleted': 'fas fa-trash',
        'project_deleted': 'fas fa-trash',
        'comment': 'fas fa-comment',
        'status': 'fas fa-sync',
        'status_changed': 'fas fa-sync',
        'create': 'fas fa-plus-circle',
        'edit': 'fas fa-marker',
        'delete': 'fas fa-trash'
      };
      
      return icons[type] || 'fas fa-circle';
    },
    
    getActivityTypeClass(type) {
      const typeClasses = {
        'scene_created': 'type-create',
        'dialogue_created': 'type-create',
        'project_created': 'type-create',
        'episode_created': 'type-create',
        'create': 'type-create',
        'scene_modified': 'type-edit',
        'project_modified': 'type-edit',
        'episode_modified': 'type-edit',
        'edit': 'type-edit',
        'scene_deleted': 'type-delete',
        'project_deleted': 'type-delete',
        'delete': 'type-delete',
        'comment': 'type-comment',
        'status': 'type-status',
        'status_changed': 'type-status'
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
    
    // ========== AUTRES MÉTHODES (INCHANGÉES) ==========
    
    async loadStats() {
      try {
        console.log("🔍 Chargement stats générales pour userId:", this.user?.id_utilisateur);
        
        const userId = this.getUserId();
      
        if (this.isViewer) {
          console.log("👁️ Mode VIEWER - Chargement stats simplifiées");
          await this.loadViewerStats();
          return;
        }
        
        const response = await axios.get('/api/scenariste/stats', {
          params: { userId: userId }
        });
        
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
          console.log("✅ stats générales mises à jour:", this.stats);
        } else {
          this.calculateLocalStats();
        }
      } catch (error) {
        console.error('❌ Erreur chargement stats générales:', error);
        this.calculateLocalStats();
      }
    },

    async loadViewerStats() {
      console.log("👁️ Calcul des statistiques pour viewer...");
      
      try {
        await this.fetchProjects();
        
        const totalProjets = this.projects.length;
        let totalScenes = 0;
        
        const scenePromises = this.projects.map(async (project) => {
          try {
            const response = await axios.get(`/api/scenes/projet/${project.id}`);
            return response.data.length || 0;
          } catch (error) {
            console.warn(`❌ Erreur chargement scènes projet ${project.id}:`, error.message);
            return 0;
          }
        });
        
        const sceneCounts = await Promise.all(scenePromises);
        totalScenes = sceneCounts.reduce((sum, count) => sum + count, 0);
        
        this.stats = {
          projetsActifs: totalProjets,
          projetsVariation: 0,
          scenesEcrites: totalScenes,
          scenesVariation: 0,
          collaborations: 0,
          realisateursActifs: 0,
          echeancesProches: 0,
          urgentCount: 0,
          tempsEcriture: '0h 00mn'
        };
        
        console.log("✅ Statistiques viewer:", this.stats);
        
      } catch (error) {
        console.error('❌ Erreur chargement stats viewer:', error);
        this.calculateViewerStatsFromProjects();
      }
    },

    calculateViewerStatsFromProjects() {
      const totalProjets = this.projects.length;
      const estimatedScenes = this.projects.reduce((total, p) => {
        return total + (p.nombreScenes || 5); 
      }, 0);
      
      this.stats = {
        projetsActifs: totalProjets,
        projetsVariation: 0,
        scenesEcrites: estimatedScenes,
        scenesVariation: 0,
        collaborations: 0,
        realisateursActifs: 0,
        echeancesProches: 0,
        urgentCount: 0,
        tempsEcriture: '0h 00mn'
      };
      
      console.log("📊 Statistiques estimées viewer:", this.stats);
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
    
    async fetchProjectsForViewer() {
      try {
        const response = await axios.get('/api/projets');
        
        this.projects = response.data.map(project => ({
          ...project,
          nombreScenes: project.nombreScenes || 0,
        }));
        
        console.log("📋 Projets chargés pour viewer:", this.projects.length);
        return this.projects;
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        this.projects = [];
        return [];
      }
    },
    
    async loadUserParticipatingProjects() {
      try {
        const userId = this.getUserId();
        console.log("🔍 Chargement des projets où l'utilisateur participe");
        
        const scenaristeResponse = await axios.get(`/api/scenaristes/user/${userId}`);
        const scenaristeId = scenaristeResponse.data.idScenariste;
        console.log("📝 Scénariste ID trouvé:", scenaristeId);
        
        const response = await axios.get(`/api/episodes/scenariste/${scenaristeId}`);
        
        const projectIds = new Set();
        
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(episode => {
            if (episode.projetId) {
              projectIds.add(episode.projetId);
            }
          });
        }
        
        this.userParticipatingProjects = projectIds;
        console.log("✅ Projets de participation chargés:", Array.from(projectIds));
        
        this.updateProjectsParticipation();
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des projets de participation:', error);
        await this.loadUserParticipatingProjectsFallback();
      }
    },

    async loadUserParticipatingProjectsFallback() {
      try {
        const userId = this.getUserId();
        console.log("🔄 Tentative fallback...");
        
        const response = await axios.get(`/api/episodes/utilisateur/${userId}`);
        
        const projectIds = new Set();
        
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(episode => {
            if (episode.projetId) {
              projectIds.add(episode.projetId);
            }
          });
        }
        
        this.userParticipatingProjects = projectIds;
        console.log("✅ Projets de participation (fallback):", Array.from(projectIds));
        
        this.updateProjectsParticipation();
        
      } catch (error) {
        console.error('❌ Erreur fallback:', error);
        this.detectLocalParticipation();
      }
    },

    detectLocalParticipation() {
      console.log("🔍 Détection locale de participation...");
      const userId = this.getUserId();
      const projectIds = new Set();
      
      this.projects.forEach(project => {
        if (project.scenaristeIds && project.scenaristeIds.includes(userId)) {
          projectIds.add(project.id);
        }
        if (project.createurId === userId) {
          projectIds.add(project.id);
        }
      });
      
      this.userParticipatingProjects = projectIds;
      this.updateProjectsParticipation();
      console.log("🎯 Participation locale détectée:", Array.from(projectIds));
    },

    updateProjectsParticipation() {
      if (this.projects && this.projects.length > 0) {
        this.projects = this.projects.map(project => ({
          ...project,
          userParticipates: this.userParticipatingProjects.has(project.id)
        }));
      }
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
    
    goToEcranTravail(project) {
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

