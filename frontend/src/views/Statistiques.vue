<template>
  <div class="app-wrapper-global">
    <div class="statistiques-globales">
      
      <!-- Sidebar latérale pour les KPI -->
      <div class="statistiques-sidebar-statistiques">
        <div class="sidebar-header-statistiques">
          <h2 class="sidebar-title-statistiques">Indicateurs Clés</h2>
          <p class="sidebar-subtitle-statistiques">Vue d'ensemble globale</p>
        </div>

        <!-- Filtres dans la sidebar -->
        <div class="filter-section-statistiques">
          <h3 class="section-title-statistiques"><i class="fas fa-filter"></i> Filtres</h3>
          <div class="filter-group-statistiques">
            <div class="filter-select-group-statistiques">
              <label>Projet :</label>
              <select v-model="selectedProject" @change="loadStatistics" class="filter-select-statistiques">
                <option value="all">Tous les projets</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.nom }}
                </option>
              </select>
            </div>
            <div class="filter-select-group-statistiques">
              <label>Période :</label>
              <select v-model="selectedPeriod" @change="loadStatistics" class="filter-select-statistiques">
                <option value="all">Tout</option>
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
              </select>
            </div>
          </div>
        </div>

        <!-- KPI dans la sidebar -->
        <div class="kpi-sidebar-section-statistiques">
          <h3 class="section-title-statistiques"><i class="fas fa-chart-line"></i> KPI Globaux</h3>
          <div class="kpi-sidebar-grid-statistiques">
            <div class="kpi-sidebar-card-statistiques total-projects-statistiques">
              <div class="kpi-sidebar-icon-statistiques">
                <i class="fas fa-folder-open"></i>
              </div>
              <div class="kpi-sidebar-content-statistiques">
                <div class="kpi-sidebar-number-statistiques">{{ statistics.kpi?.totalProjets || 0 }}</div>
                <div class="kpi-sidebar-label-statistiques">Projets Actifs</div>
              </div>
            </div>

            <div class="kpi-sidebar-card-statistiques total-episodes-statistiques">
              <div class="kpi-sidebar-icon-statistiques">
                <i class="fas fa-film"></i>
              </div>
              <div class="kpi-sidebar-content-statistiques">
                <div class="kpi-sidebar-number-statistiques">{{ statistics.kpi?.totalEpisodes || 0 }}</div>
                <div class="kpi-sidebar-label-statistiques">Épisodes</div>
              </div>
            </div>

            <div class="kpi-sidebar-card-statistiques total-sequences-statistiques">
              <div class="kpi-sidebar-icon-statistiques">
                <i class="fas fa-video"></i>
              </div>
              <div class="kpi-sidebar-content-statistiques">
                <div class="kpi-sidebar-number-statistiques">{{ statistics.kpi?.totalSequences || 0 }}</div>
                <div class="kpi-sidebar-label-statistiques">Séquences</div>
              </div>
            </div>

            <div class="kpi-sidebar-card-statistiques total-scenes-statistiques">
              <div class="kpi-sidebar-icon-statistiques">
                <i class="fas fa-theater-masks"></i>
              </div>
              <div class="kpi-sidebar-content-statistiques">
                <div class="kpi-sidebar-number-statistiques">{{ statistics.kpi?.totalScenes || 0 }}</div>
                <div class="kpi-sidebar-label-statistiques">Scènes</div>
              </div>
            </div>

            <div class="kpi-sidebar-card-statistiques total-dialogues-statistiques">
              <div class="kpi-sidebar-icon-statistiques">
                <i class="fas fa-comment-dots"></i>
              </div>
              <div class="kpi-sidebar-content-statistiques">
                <div class="kpi-sidebar-number-statistiques">{{ statistics.kpi?.totalDialogues || 0 }}</div>
                <div class="kpi-sidebar-label-statistiques">Dialogues</div>
              </div>
            </div>

            <div class="kpi-sidebar-card-statistiques team-members-statistiques">
              <div class="kpi-sidebar-icon-statistiques">
                <i class="fas fa-users"></i>
              </div>
              <div class="kpi-sidebar-content-statistiques">
                <div class="kpi-sidebar-number-statistiques">{{ statistics.kpi?.totalEquipe || 0 }}</div>
                <div class="kpi-sidebar-label-statistiques">Équipe</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dernière mise à jour dans la sidebar -->
        <div class="sidebar-footer-statistiques">
          <div class="last-update-sidebar-statistiques">
            <i class="fas fa-clock"></i>
            <span>MAJ: {{ lastUpdate }}</span>
          </div>
        </div>
      </div>

      <!-- Contenu principal à droite -->
      <div class="statistiques-body-statistiques">
        <div class="statistiques-main-content-statistiques">
          
          <!-- En-tête principal -->
          <header class="main-header-statistiques">
            <h1 class="page-title-statistiques">
              <i class="fas fa-chart-pie"></i>
              Tableau de Bord Global
            </h1>
            <p class="page-subtitle-statistiques">Analyses détaillées et métriques avancées</p>
          </header>

          <!-- Indicateur de chargement -->
          <div v-if="isLoading" class="loading-statistiques">
            <i class="fas fa-spinner fa-spin"></i> Chargement des statistiques...
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="error-message-statistiques">
            {{ error }}
          </div>

          <!-- Section Totaux du Projet (maintenant dans le body) -->
          <div v-if="!isLoading && computedProjectTotals" class="totals-section-statistiques">
            <h3><i class="fas fa-layer-group"></i> Totaux du {{ computedProjectTotals.projetNom || 'Projet' }}</h3>
            <div class="totals-grid-statistiques">
              <div class="total-card-statistiques">
                <i class="fas fa-film"></i>
                <div class="total-number-statistiques">{{ computedProjectTotals.totalEpisodes }}</div>
                <div class="total-label-statistiques">Épisodes</div>
              </div>
              <div class="total-card-statistiques">
                <i class="fas fa-list-ol"></i>
                <div class="total-number-statistiques">{{ computedProjectTotals.totalSequences }}</div>
                <div class="total-label-statistiques">Séquences</div>
              </div>
              <div class="total-card-statistiques">
                <i class="fas fa-theater-masks"></i>
                <div class="total-number-statistiques">{{ computedProjectTotals.totalScenes }}</div>
                <div class="total-label-statistiques">Scènes</div>
              </div>
              <div class="total-card-statistiques">
                <i class="fas fa-comments"></i>
                <div class="total-number-statistiques">{{ computedProjectTotals.totalDialogues }}</div>
                <div class="total-label-statistiques">Dialogues</div>
              </div>
            </div>
          </div>

          <!-- Le reste du contenu reste inchangé -->
          <!-- Graphique: Répartition par Type -->
          <div v-if="!isLoading" class="chart-container-statistiques">
            <div class="chart-header-statistiques">
              <h3><i class="fas fa-chart-bar"></i> Répartition par Type</h3>
            </div>
            <div class="chart-content-statistiques">
              <div class="type-distribution-statistiques">
                <div v-for="type in computedTypeDistribution" :key="type.name" class="type-item-statistiques">
                  <div class="type-name-statistiques">{{ type.name }}</div>
                  <div class="type-bar-statistiques">
                    <div class="type-fill-statistiques" :style="{ width: type.percentage + '%' }"></div>
                  </div>
                  <div class="type-value-statistiques">{{ type.value }} ({{ type.percentage }}%)</div>
                </div>
                <div v-if="computedTypeDistribution.length === 0" class="no-data-statistiques">
                  Aucune donnée disponible
                </div>
              </div>
            </div>
          </div>

          <!-- Section Graphiques réorganisée -->
          <div v-if="!isLoading && statistics.statistics" class="charts-section-statistiques">
            
            <!-- Ligne 1: Top Projets et Progression Temporelle (même largeur) -->
            <div class="chart-row-statistiques">
              <!-- Top Projets -->
              <div class="chart-container-statistiques full-width-statistiques">
                <div class="chart-header-statistiques">
                  <h3><i class="fas fa-trophy"></i> Top Projets</h3>
                </div>
                <div class="chart-content-statistiques">
                  <div class="ranking-list-statistiques">
                    <div v-for="(project, index) in statistics.topProjects || []" :key="project.id" class="ranking-item-statistiques">
                      <div class="rank-number-statistiques">{{ index + 1 }}</div>
                      <div class="project-info-statistiques">
                        <div class="project-name-statistiques">{{ project.nom }}</div>
                        <div class="project-stats-statistiques">
                          <span class="stat-statistiques">{{ project.episodes }} épisodes</span>
                          <span class="stat-statistiques">{{ project.scenes }} scènes</span>
                          <span class="stat-statistiques">{{ project.progression }}% terminé</span>
                        </div>
                      </div>
                      <div class="progress-circle-statistiques" :style="{ '--progress': project.progression }">
                        <span>{{ Math.round(project.progression) }}%</span>
                      </div>
                    </div>
                    <div v-if="!statistics.topProjects || statistics.topProjects.length === 0" class="no-data-statistiques">
                      Aucun projet disponible
                    </div>
                  </div>
                </div>
              </div>

              <!-- Progression Temporelle -->
              <div class="chart-container-statistiques full-width-statistiques">
                <div class="chart-header-statistiques">
                  <h3><i class="fas fa-chart-line"></i> Progression Temporelle</h3>
                </div>
                <div class="chart-content-statistiques">
                  <div class="timeline-chart-statistiques">
                    <div class="timeline-bars-statistiques">
                      <div v-for="(item, index) in statistics.monthlyProgress || []" :key="index" class="timeline-item-statistiques">
                        <div class="timeline-label-statistiques">{{ formatMonth(item.mois) }}</div>
                        <div class="timeline-bar-statistiques">
                          <div class="bar-segment-statistiques episodes-statistiques"
                              :style="{ height: calculateBarHeight(item.episodes, 'episodes') + '%' }"
                              :title="item.episodes + ' épisodes'"></div>
                          <div class="bar-segment-statistiques sequences-statistiques"
                              :style="{ height: calculateBarHeight(item.sequences, 'sequences') + '%' }"
                              :title="item.sequences + ' séquences'"></div>
                          <div class="bar-segment-statistiques scenes-statistiques"
                              :style="{ height: calculateBarHeight(item.scenes, 'scenes') + '%' }"
                              :title="item.scenes + ' scènes'"></div>
                        </div>
                      </div>
                    </div>
                    <div class="timeline-legend-statistiques">
                      <span class="legend-item-statistiques"><span class="legend-color-statistiques episodes-statistiques"></span>Épisodes</span>
                      <span class="legend-item-statistiques"><span class="legend-color-statistiques sequences-statistiques"></span>Séquences</span>
                      <span class="legend-item-statistiques"><span class="legend-color-statistiques scenes-statistiques"></span>Scènes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ligne 2: Répartition des Statuts et Distribution de l'Équipe (même largeur) -->
            <div class="chart-row-statistiques">
              <!-- Répartition des Statuts -->
              <div class="chart-container-statistiques full-width-statistiques">
                <div class="chart-header-statistiques">
                  <h3><i class="fas fa-chart-pie"></i> Répartition des Statuts</h3>
                  <div class="chart-legend-statistiques">
                    <span class="legend-item-statistiques"><span class="legend-color-statistiques completed-statistiques"></span>Terminé</span>
                    <span class="legend-item-statistiques"><span class="legend-color-statistiques in-progress-statistiques"></span>En cours</span>
                    <span class="legend-item-statistiques"><span class="legend-color-statistiques planned-statistiques"></span>Planifié</span>
                    <span class="legend-item-statistiques"><span class="legend-color-statistiques to-do-statistiques"></span>À faire</span>
                  </div>
                </div>
                <div class="chart-content-statistiques">
                  <div class="pie-charts-grid-statistiques">
                    <div class="pie-chart-item-statistiques">
                      <h4>Épisodes</h4>
                      <div class="pie-chart-statistiques">
                        <div class="pie-slice-statistiques completed-statistiques" :style="{ '--percentage': piePercentages.episodes.TERMINE }"></div>
                        <div class="pie-slice-statistiques in-progress-statistiques" :style="{ '--percentage': piePercentages.episodes.EN_COURS + piePercentages.episodes.TERMINE }"></div>
                        <div class="pie-slice-statistiques planned-statistiques" :style="{ '--percentage': piePercentages.episodes.PLANIFIE + piePercentages.episodes.EN_COURS + piePercentages.episodes.TERMINE }"></div>
                        <div class="pie-slice-statistiques to-do-statistiques" :style="{ '--percentage': 100 }"></div>
                        <div class="pie-center-statistiques">
                          <div class="pie-total-statistiques">{{ statistics.statistics.episodes?.total || 0 }}</div>
                          <div class="pie-label-statistiques">total</div>
                        </div>
                      </div>
                    </div>

                    <div class="pie-chart-item-statistiques">
                      <h4>Séquences</h4>
                      <div class="pie-chart-statistiques">
                        <div class="pie-slice-statistiques completed-statistiques" :style="{ '--percentage': piePercentages.sequences.TERMINE }"></div>
                        <div class="pie-slice-statistiques in-progress-statistiques" :style="{ '--percentage': piePercentages.sequences.EN_COURS + piePercentages.sequences.TERMINE }"></div>
                        <div class="pie-slice-statistiques planned-statistiques" :style="{ '--percentage': piePercentages.sequences.PLANIFIE + piePercentages.sequences.EN_COURS + piePercentages.sequences.TERMINE }"></div>
                        <div class="pie-slice-statistiques to-do-statistiques" :style="{ '--percentage': 100 }"></div>
                        <div class="pie-center-statistiques">
                          <div class="pie-total-statistiques">{{ statistics.statistics.sequences?.total || 0 }}</div>
                          <div class="pie-label-statistiques">total</div>
                        </div>
                      </div>
                    </div>

                    <div class="pie-chart-item-statistiques">
                      <h4>Scènes</h4>
                      <div class="pie-chart-statistiques">
                        <div class="pie-slice-statistiques completed-statistiques" :style="{ '--percentage': piePercentages.scenes.TERMINE }"></div>
                        <div class="pie-slice-statistiques in-progress-statistiques" :style="{ '--percentage': piePercentages.scenes.EN_COURS + piePercentages.scenes.TERMINE }"></div>
                        <div class="pie-slice-statistiques planned-statistiques" :style="{ '--percentage': piePercentages.scenes.PLANIFIE + piePercentages.scenes.EN_COURS + piePercentages.scenes.TERMINE }"></div>
                        <div class="pie-slice-statistiques to-do-statistiques" :style="{ '--percentage': 100 }"></div>
                        <div class="pie-center-statistiques">
                          <div class="pie-total-statistiques">{{ statistics.statistics.scenes?.total || 0 }}</div>
                          <div class="pie-label-statistiques">total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Distribution de l'Équipe -->
              <div class="chart-container-statistiques full-width-statistiques">
                <div class="chart-header-statistiques">
                  <h3><i class="fas fa-user-friends"></i> Distribution de l'Équipe</h3>
                </div>
                <div class="chart-content-statistiques">
                  <div class="team-distribution-statistiques">
                    <div class="distribution-chart-statistiques">
                      <div v-for="role in statistics.teamDistribution || []" :key="role.nom" class="distribution-item-statistiques">
                        <div class="role-info-statistiques">
                          <span class="role-name-statistiques">{{ formatRoleName(role.nom) }}</span>
                          <span class="role-count-statistiques">{{ role.count }} personnes</span>
                        </div>
                        <div class="distribution-bar-statistiques">
                          <div class="distribution-fill-statistiques" :style="{ width: role.percentage + '%' }"></div>
                        </div>
                        <span class="role-percentage-statistiques">{{ role.percentage }}%</span>
                      </div>
                      <div v-if="!statistics.teamDistribution || statistics.teamDistribution.length === 0" class="no-data-statistiques">
                        Aucune donnée d'équipe disponible
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Tableau détaillé des projets -->
          <div v-if="!isLoading && statistics.projectsDetail" class="projects-table-section-statistiques">
            <h3><i class="fas fa-table"></i> Détail par Projet</h3>
            <div class="table-container-statistiques">
              <table class="projects-table-statistiques">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Épisodes</th>
                    <th>Séquences</th>
                    <th>Scènes</th>
                    <th>Dialogues</th>
                    <th>Progression</th>
                    <th>Équipe</th>
                    <th>Dernière MAJ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="project in statistics.projectsDetail" :key="project.id">
                    <td class="project-name-cell-statistiques">
                      <strong>{{ project.nom }}</strong>
                      <!-- <div class="project-description-statistiques">{{ project.description || 'Aucune description' }}</div> -->
                    </td>
                    <td class="number-cell-statistiques">
                      <span class="stat-number-statistiques">{{ project.episodes }}</span>
                      <div class="stat-detail-statistiques">
                        <span class="stat-badge-statistiques completed-statistiques">{{ project.episodesTermines }} term.</span>
                      </div>
                    </td>
                    <td class="number-cell-statistiques">{{ project.sequences }}</td>
                    <td class="number-cell-statistiques">
                      <span class="stat-number-statistiques">{{ project.scenes }}</span>
                      <div class="stat-detail-statistiques">
                        <span class="stat-badge-statistiques completed-statistiques">{{ project.scenesTerminees }} term.</span>
                      </div>
                    </td>
                    <td class="number-cell-statistiques">{{ project.dialogues }}</td>
                    <td class="progress-cell-statistiques">
                      <div class="progress-bar-statistiques">
                        <div class="progress-fill-statistiques" :style="{ width: project.progression + '%' }"></div>
                      </div>
                      <span class="progress-text-statistiques">{{ Math.round(project.progression) }}%</span>
                    </td>
                    <td class="team-cell-statistiques">
                      <div class="team-avatars-statistiques">
                        <span v-for="member in project.equipe || []" :key="member.id" 
                              class="avatar-statistiques" :title="member.nom">
                          {{ getInitials(member.nom) }}
                        </span>
                        <span v-if="!project.equipe || project.equipe.length === 0" class="no-team-statistiques">
                          -
                        </span>
                      </div>
                    </td>
                    <td class="date-cell-statistiques">{{ formatDate(project.lastUpdate) }}</td>
                  </tr>
                  <tr v-if="!statistics.projectsDetail || statistics.projectsDetail.length === 0">
                    <td colspan="8" class="no-data-statistiques">Aucun projet disponible</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const isLoading = ref(false)
const error = ref('')
const statistics = ref({})
const projects = ref([])
const selectedProject = ref('all')
const selectedPeriod = ref('all')

const lastUpdate = computed(() => {
  return new Date().toLocaleString('fr-FR', {
    timeZone: 'Indian/Antananarivo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Les computed properties et méthodes restent identiques...
// (piePercentages, computedProjectTotals, computedTypeDistribution, etc.)

const piePercentages = computed(() => {
  const result = { episodes: {}, sequences: {}, scenes: {} }
  const stats = statistics.value.statistics || {}

  const calc = (type, key) => {
    const total = stats[type]?.total || 0
    const count = stats[type]?.counts?.[key] || 0
    return total > 0 ? Math.round((count / total) * 1000) / 10 : 0
  }

  ;['episodes', 'sequences', 'scenes'].forEach(type => {
    result[type].TERMINE = calc(type, 'TERMINE') || calc(type, 'TERMINES')
    result[type].EN_COURS = calc(type, 'EN_COURS')
    result[type].PLANIFIE = calc(type, 'PLANIFIE') || calc(type, 'PLANIFIES')
    result[type].A_FAIRE = calc(type, 'A_FAIRE') || 100 - (result[type].TERMINE + result[type].EN_COURS + result[type].PLANIFIE)
  })

  return result
})

const computedProjectTotals = computed(() => {
  if (!statistics.value.projectsDetail || statistics.value.projectsDetail.length === 0) {
    return null
  }
  
  if (selectedProject.value !== 'all') {
    const project = statistics.value.projectsDetail.find(p => p.id === parseInt(selectedProject.value))
    if (project) {
      return {
        projetNom: project.nom,
        totalEpisodes: project.episodes || 0,
        totalSequences: project.sequences || 0,
        totalScenes: project.scenes || 0,
        totalDialogues: project.dialogues || 0
      }
    }
  }
  
  const totals = statistics.value.projectsDetail.reduce((acc, project) => {
    acc.totalEpisodes += project.episodes || 0
    acc.totalSequences += project.sequences || 0
    acc.totalScenes += project.scenes || 0
    acc.totalDialogues += project.dialogues || 0
    return acc
  }, {
    projetNom: 'Tous les Projets',
    totalEpisodes: 0,
    totalSequences: 0,
    totalScenes: 0,
    totalDialogues: 0
  })
  
  return totals
})

const computedTypeDistribution = computed(() => {
  if (!statistics.value.kpi) return []
  
  const kpi = statistics.value.kpi
  const total = (kpi.totalEpisodes || 0) + (kpi.totalSequences || 0) + (kpi.totalScenes || 0) + (kpi.totalDialogues || 0)
  
  if (total === 0) return []
  
  return [
    {
      name: 'Épisodes',
      value: kpi.totalEpisodes || 0,
      percentage: Math.round(((kpi.totalEpisodes || 0) / total) * 100)
    },
    {
      name: 'Séquences',
      value: kpi.totalSequences || 0,
      percentage: Math.round(((kpi.totalSequences || 0) / total) * 100)
    },
    {
      name: 'Scènes',
      value: kpi.totalScenes || 0,
      percentage: Math.round(((kpi.totalScenes || 0) / total) * 100)
    },
    {
      name: 'Dialogues',
      value: kpi.totalDialogues || 0,
      percentage: Math.round(((kpi.totalDialogues || 0) / total) * 100)
    }
  ].filter(item => item.value > 0)
})

const loadStatistics = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const params = new URLSearchParams()
    if (selectedProject.value !== 'all') params.append('projetId', selectedProject.value)
    if (selectedPeriod.value !== 'all') params.append('periode', selectedPeriod.value)

    const response = await axios.get(`/api/statistics/global?${params}`)
    statistics.value = response.data

    if (statistics.value.projectsDetail) {
      projects.value = statistics.value.projectsDetail.map(p => ({ id: p.id, nom: p.nom }))
    }

  } catch (err) {
    error.value = `Erreur: ${err.response?.data?.message || err.message}`
    console.error('Erreur stats:', err)
  } finally {
    isLoading.value = false
  }
}

const formatMonth = (monthStr) => {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

const calculateBarHeight = (value, type) => {
  if (!statistics.value.monthlyProgress?.length) return 0
  const maxValues = {
    episodes: Math.max(...statistics.value.monthlyProgress.map(i => i.episodes || 0)),
    sequences: Math.max(...statistics.value.monthlyProgress.map(i => i.sequences || 0)),
    scenes: Math.max(...statistics.value.monthlyProgress.map(i => i.scenes || 0))
  }
  const max = maxValues[type] || 1
  return Math.max((value / max) * 80, 5)
}

const formatRoleName = (role) => ({
  'REALISATEUR': 'Réalisateurs',
  'SCENARISTE': 'Scénaristes',
  'ADMIN': 'Administrateurs'
}[role] || role)

const getInitials = (name) => name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?'

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { timeZone: 'Indian/Antananarivo' })
  } catch {
    return dateStr
  }
}

onMounted(() => {
  loadStatistics()
})
</script>
