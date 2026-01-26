<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale - Nouveau style -->
    <div class="creation-sidebar-stats-admin">
      <div class="sidebar-header-stats-admin">
        <h2 class="sidebar-title-stats-admin">Indicateurs Clés</h2>
        <p class="sidebar-subtitle-stats-admin">Vue d'ensemble globale</p>
      </div>

      <!-- Filtres dans la sidebar -->
      <div class="sidebar-section-stats-admin">
        <h3 class="section-title-stats-admin"><i class="fas fa-filter"></i> Filtres</h3>
        <div class="filter-group-stats-admin">
          <div class="filter-item-stats-admin">
            <label>Projet :</label>
            <select v-model="selectedProject" @change="loadStatistics" class="filter-select-stats-admin">
              <option value="all">Tous les projets</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.nom }}
              </option>
            </select>
          </div>
          <div class="filter-item-stats-admin">
            <label>Période :</label>
            <select v-model="selectedPeriod" @change="loadStatistics" class="filter-select-stats-admin">
              <option value="all">Tout</option>
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="90days">90 derniers jours</option>
            </select>
          </div>
        </div>
      </div>

      <!-- KPI dans la sidebar -->
      <div class="sidebar-section-stats-admin">
        <h3 class="section-title-stats-admin"><i class="fas fa-chart-line"></i> KPI Globaux</h3>
        <div class="stats-kpi-stats-admin">
          <div class="stat-item-stats-admin">
            <span class="stat-number-stats-admin">{{ statistics.kpi?.totalProjets || 0 }}</span>
            <span class="stat-label-stats-admin">Projets Actifs</span>
          </div>
          <div class="stat-item-stats-admin">
            <span class="stat-number-stats-admin">{{ statistics.kpi?.totalEpisodes || 0 }}</span>
            <span class="stat-label-stats-admin">Épisodes</span>
          </div>
          <div class="stat-item-stats-admin">
            <span class="stat-number-stats-admin">{{ statistics.kpi?.totalSequences || 0 }}</span>
            <span class="stat-label-stats-admin">Séquences</span>
          </div>
          <div class="stat-item-stats-admin">
            <span class="stat-number-stats-admin">{{ statistics.kpi?.totalScenes || 0 }}</span>
            <span class="stat-label-stats-admin">Scènes</span>
          </div>
          <div class="stat-item-stats-admin">
            <span class="stat-number-stats-admin">{{ statistics.kpi?.totalDialogues || 0 }}</span>
            <span class="stat-label-stats-admin">Dialogues</span>
          </div>
          <div class="stat-item-stats-admin">
            <span class="stat-number-stats-admin">{{ statistics.kpi?.totalEquipe || 0 }}</span>
            <span class="stat-label-stats-admin">Équipe</span>
          </div>
        </div>
      </div>

      <!-- Dernière mise à jour dans la sidebar -->
      <div class="sidebar-footer-stats-admin">
        <div class="last-update-stats-admin">
          <i class="fas fa-clock"></i>
          <span>MAJ: {{ lastUpdate }}</span>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="creation-body-stats-admin">
      <div class="creation-main-content-stats-admin">
        
        <!-- En-tête principal - Nouveau style -->
        <header class="main-header-stats-admin">
          <h1 class="page-title-stats-admin">
            <i class="fas fa-chart-pie"></i>
            Tableau de Bord Global
          </h1>
          <p class="page-subtitle-stats-admin">Analyses détaillées et métriques avancées</p>
        </header>

        <!-- Indicateur de chargement -->
        <div v-if="isLoading" class="loading-stats-admin">
          <i class="fas fa-spinner fa-spin"></i> Chargement des statistiques...
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="error-message-stats-admin">
          {{ error }}
        </div>

        <!-- Section Totaux du Projet -->
        <div v-if="!isLoading && computedProjectTotals" class="totals-section-stats-admin">
          <h3><i class="fas fa-layer-group"></i> Totaux du {{ computedProjectTotals.projetNom || 'Projet' }}</h3>
          <div class="totals-grid-stats-admin">
            <div class="total-card-stats-admin">
              <i class="fas fa-film"></i>
              <div class="total-number-stats-admin">{{ computedProjectTotals.totalEpisodes }}</div>
              <div class="total-label-stats-admin">Épisodes</div>
            </div>
            <div class="total-card-stats-admin">
              <i class="fas fa-list-ol"></i>
              <div class="total-number-stats-admin">{{ computedProjectTotals.totalSequences }}</div>
              <div class="total-label-stats-admin">Séquences</div>
            </div>
            <div class="total-card-stats-admin">
              <i class="fas fa-theater-masks"></i>
              <div class="total-number-stats-admin">{{ computedProjectTotals.totalScenes }}</div>
              <div class="total-label-stats-admin">Scènes</div>
            </div>
            <div class="total-card-stats-admin">
              <i class="fas fa-comments"></i>
              <div class="total-number-stats-admin">{{ computedProjectTotals.totalDialogues }}</div>
              <div class="total-label-stats-admin">Dialogues</div>
            </div>
          </div>
        </div>

        <!-- Graphique: Répartition par Type -->
        <div v-if="!isLoading" class="chart-container-stats-admin">
          <div class="chart-header-stats-admin">
            <h3><i class="fas fa-chart-bar"></i> Répartition par Type</h3>
          </div>
          <div class="chart-content-stats-admin">
            <div class="type-distribution-stats-admin">
              <div v-for="type in computedTypeDistribution" :key="type.name" class="type-item-stats-admin">
                <div class="type-name-stats-admin">{{ type.name }}</div>
                <div class="type-bar-stats-admin">
                  <div class="type-fill-stats-admin" :style="{ width: type.percentage + '%' }"></div>
                </div>
                <div class="type-value-stats-admin">{{ type.value }} ({{ type.percentage }}%)</div>
              </div>
              <div v-if="computedTypeDistribution.length === 0" class="no-data-stats-admin">
                Aucune donnée disponible
              </div>
            </div>
          </div>
        </div>

        <!-- Section Graphiques -->
        <div v-if="!isLoading && statistics.statistics" class="charts-section-stats-admin">
          
          <!-- Ligne 1: Top Projets et Progression Temporelle -->
          <div class="chart-row-stats-admin">
            <!-- Top Projets -->
            <div class="chart-container-stats-admin full-width-stats-admin">
              <div class="chart-header-stats-admin">
                <h3><i class="fas fa-trophy"></i> Top Projets</h3>
              </div>
              <div class="chart-content-stats-admin">
                <div class="ranking-list-stats-admin">
                  <div v-for="(project, index) in statistics.topProjects || []" :key="project.id" class="ranking-item-stats-admin">
                    <div class="rank-number-stats-admin">{{ index + 1 }}</div>
                    <div class="project-info-stats-admin">
                      <div class="project-name-stats-admin">{{ project.nom }}</div>
                      <div class="project-stats-stats-admin">
                        <span class="stat-stats-admin">{{ project.episodes }} épisodes</span>
                        <span class="stat-stats-admin">{{ project.scenes }} scènes</span>
                        <span class="stat-stats-admin">{{ project.progression }}% terminé</span>
                      </div>
                    </div>
                    <div class="progress-circle-stats-admin" :style="{ '--progress': project.progression }">
                      <span>{{ Math.round(project.progression) }}%</span>
                    </div>
                  </div>
                  <div v-if="!statistics.topProjects || statistics.topProjects.length === 0" class="no-data-stats-admin">
                    Aucun projet disponible
                  </div>
                </div>
              </div>
            </div>

            <!-- Progression Temporelle -->
            <div class="chart-container-stats-admin full-width-stats-admin">
              <div class="chart-header-stats-admin">
                <h3><i class="fas fa-chart-line"></i> Progression Temporelle</h3>
              </div>
              <div class="chart-content-stats-admin">
                <div class="timeline-chart-stats-admin">
                  <div class="timeline-bars-stats-admin">
                    <div v-for="(item, index) in statistics.monthlyProgress || []" :key="index" class="timeline-item-stats-admin">
                      <div class="timeline-label-stats-admin">{{ formatMonth(item.mois) }}</div>
                      <div class="timeline-bar-stats-admin">
                        <div class="bar-segment-stats-admin episodes-stats-admin"
                            :style="{ height: calculateBarHeight(item.episodes, 'episodes') + '%' }"
                            :title="item.episodes + ' épisodes'"></div>
                        <div class="bar-segment-stats-admin sequences-stats-admin"
                            :style="{ height: calculateBarHeight(item.sequences, 'sequences') + '%' }"
                            :title="item.sequences + ' séquences'"></div>
                        <div class="bar-segment-stats-admin scenes-stats-admin"
                            :style="{ height: calculateBarHeight(item.scenes, 'scenes') + '%' }"
                            :title="item.scenes + ' scènes'"></div>
                      </div>
                    </div>
                  </div>
                  <div class="timeline-legend-stats-admin">
                    <span class="legend-item-stats-admin"><span class="legend-color-stats-admin episodes-stats-admin"></span>Épisodes</span>
                    <span class="legend-item-stats-admin"><span class="legend-color-stats-admin sequences-stats-admin"></span>Séquences</span>
                    <span class="legend-item-stats-admin"><span class="legend-color-stats-admin scenes-stats-admin"></span>Scènes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ligne 2: Répartition des Statuts et Distribution de l'Équipe -->
          <div class="chart-row-stats-admin">
            <!-- Répartition des Statuts -->
            <div class="chart-container-stats-admin full-width-stats-admin">
              <div class="chart-header-stats-admin">
                <h3><i class="fas fa-chart-pie"></i> Répartition des Statuts</h3>
                <div class="chart-legend-stats-admin">
                  <span class="legend-item-stats-admin"><span class="legend-color-stats-admin completed-stats-admin"></span>Terminé</span>
                  <span class="legend-item-stats-admin"><span class="legend-color-stats-admin in-progress-stats-admin"></span>En cours</span>
                  <span class="legend-item-stats-admin"><span class="legend-color-stats-admin planned-stats-admin"></span>Planifié</span>
                  <span class="legend-item-stats-admin"><span class="legend-color-stats-admin to-do-stats-admin"></span>À faire</span>
                </div>
              </div>
              <div class="chart-content-stats-admin">
                <div class="pie-charts-grid-stats-admin">
                  <div class="pie-chart-item-stats-admin">
                    <h4>Épisodes</h4>
                    <div class="pie-chart-stats-admin">
                      <div class="pie-slice-stats-admin completed-stats-admin" :style="{ '--percentage': piePercentages.episodes.TERMINE }"></div>
                      <div class="pie-slice-stats-admin in-progress-stats-admin" :style="{ '--percentage': piePercentages.episodes.EN_COURS + piePercentages.episodes.TERMINE }"></div>
                      <div class="pie-slice-stats-admin planned-stats-admin" :style="{ '--percentage': piePercentages.episodes.PLANIFIE + piePercentages.episodes.EN_COURS + piePercentages.episodes.TERMINE }"></div>
                      <div class="pie-slice-stats-admin to-do-stats-admin" :style="{ '--percentage': 100 }"></div>
                      <div class="pie-center-stats-admin">
                        <div class="pie-total-stats-admin">{{ statistics.statistics.episodes?.total || 0 }}</div>
                        <div class="pie-label-stats-admin">total</div>
                      </div>
                    </div>
                  </div>

                  <div class="pie-chart-item-stats-admin">
                    <h4>Séquences</h4>
                    <div class="pie-chart-stats-admin">
                      <div class="pie-slice-stats-admin completed-stats-admin" :style="{ '--percentage': piePercentages.sequences.TERMINE }"></div>
                      <div class="pie-slice-stats-admin in-progress-stats-admin" :style="{ '--percentage': piePercentages.sequences.EN_COURS + piePercentages.sequences.TERMINE }"></div>
                      <div class="pie-slice-stats-admin planned-stats-admin" :style="{ '--percentage': piePercentages.sequences.PLANIFIE + piePercentages.sequences.EN_COURS + piePercentages.sequences.TERMINE }"></div>
                      <div class="pie-slice-stats-admin to-do-stats-admin" :style="{ '--percentage': 100 }"></div>
                      <div class="pie-center-stats-admin">
                        <div class="pie-total-stats-admin">{{ statistics.statistics.sequences?.total || 0 }}</div>
                        <div class="pie-label-stats-admin">total</div>
                      </div>
                    </div>
                  </div>

                  <div class="pie-chart-item-stats-admin">
                    <h4>Scènes</h4>
                    <div class="pie-chart-stats-admin">
                      <div class="pie-slice-stats-admin completed-stats-admin" :style="{ '--percentage': piePercentages.scenes.TERMINE }"></div>
                      <div class="pie-slice-stats-admin in-progress-stats-admin" :style="{ '--percentage': piePercentages.scenes.EN_COURS + piePercentages.scenes.TERMINE }"></div>
                      <div class="pie-slice-stats-admin planned-stats-admin" :style="{ '--percentage': piePercentages.scenes.PLANIFIE + piePercentages.scenes.EN_COURS + piePercentages.scenes.TERMINE }"></div>
                      <div class="pie-slice-stats-admin to-do-stats-admin" :style="{ '--percentage': 100 }"></div>
                      <div class="pie-center-stats-admin">
                        <div class="pie-total-stats-admin">{{ statistics.statistics.scenes?.total || 0 }}</div>
                        <div class="pie-label-stats-admin">total</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Distribution de l'Équipe -->
            <div class="chart-container-stats-admin full-width-stats-admin">
              <div class="chart-header-stats-admin">
                <h3><i class="fas fa-user-friends"></i> Distribution de l'Équipe</h3>
              </div>
              <div class="chart-content-stats-admin">
                <div class="team-distribution-stats-admin">
                  <div class="distribution-chart-stats-admin">
                    <div v-for="role in statistics.teamDistribution || []" :key="role.nom" class="distribution-item-stats-admin">
                      <div class="role-info-stats-admin">
                        <span class="role-name-stats-admin">{{ formatRoleName(role.nom) }}</span>
                        <span class="role-count-stats-admin">{{ role.count }} personnes</span>
                      </div>
                      <div class="distribution-bar-stats-admin">
                        <div class="distribution-fill-stats-admin" :style="{ width: role.percentage + '%' }"></div>
                      </div>
                      <span class="role-percentage-stats-admin">{{ role.percentage }}%</span>
                    </div>
                    <div v-if="!statistics.teamDistribution || statistics.teamDistribution.length === 0" class="no-data-stats-admin">
                      Aucune donnée d'équipe disponible
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Tableau détaillé des projets -->
        <div v-if="!isLoading && statistics.projectsDetail" class="projects-table-section-stats-admin">
          <h3><i class="fas fa-table"></i> Détail par Projet</h3>
          <div class="table-container-stats-admin">
            <table class="projects-table-stats-admin">
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
                  <td class="project-name-cell-stats-admin">
                    <strong>{{ project.nom }}</strong>
                  </td>
                  <td class="number-cell-stats-admin">
                    <span class="stat-number-stats-admin">{{ project.episodes }}</span>
                    <div class="stat-detail-stats-admin">
                      <span class="stat-badge-stats-admin completed-stats-admin">{{ project.episodesTermines }} term.</span>
                    </div>
                  </td>
                  <td class="number-cell-stats-admin">{{ project.sequences }}</td>
                  <td class="number-cell-stats-admin">
                    <span class="stat-number-stats-admin">{{ project.scenes }}</span>
                    <div class="stat-detail-stats-admin">
                      <span class="stat-badge-stats-admin completed-stats-admin">{{ project.scenesTerminees }} term.</span>
                    </div>
                  </td>
                  <td class="number-card-stats-admin">{{ project.dialogues }}</td>
                  <td class="progress-cell-stats-admin">
                    <div class="progress-bar-stats-admin">
                      <div class="progress-fill-stats-admin" :style="{ width: project.progression + '%' }"></div>
                    </div>
                    <span class="progress-text-stats-admin">{{ Math.round(project.progression) }}%</span>
                  </td>
                  <td class="team-cell-stats-admin">
                    <div class="team-avatars-stats-admin">
                      <span v-for="member in project.equipe || []" :key="member.id" 
                            class="avatar-stats-admin" :title="member.nom">
                        {{ getInitials(member.nom) }}
                      </span>
                      <span v-if="!project.equipe || project.equipe.length === 0" class="no-team-stats-admin">
                        -
                      </span>
                    </div>
                  </td>
                  <td class="date-cell-stats-admin">{{ formatDate(project.lastUpdate) }}</td>
                </tr>
                <tr v-if="!statistics.projectsDetail || statistics.projectsDetail.length === 0">
                  <td colspan="8" class="no-data-stats-admin">Aucun projet disponible</td>
                </tr>
              </tbody>
            </table>
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

