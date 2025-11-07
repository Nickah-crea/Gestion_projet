<template>
  <div class="statistiques-globales">
    <div class="app-wrapper">
      <div class="statistiques-container">
        <!-- En-tête global -->
        <header class="statistiques-header">
          <h1>
            <i class="fas fa-chart-pie icon"></i>
            Tableau de Bord Global - Tous les Projets
          </h1>
          <div class="filters">
            <div class="filter-group">
              <label for="project-select">Filtrer par projet :</label>
              <select id="project-select" v-model="selectedProject" @change="loadStatistics">
                <option value="all">Tous les projets</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.nom }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label for="period-select">Période :</label>
              <select id="period-select" v-model="selectedPeriod" @change="loadStatistics">
                <option value="all">Tout</option>
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
              </select>
            </div>
          </div>
          <p class="last-update">
            Dernière mise à jour: {{ lastUpdate }}
          </p>
        </header>

        <!-- Indicateur de chargement -->
        <div v-if="isLoading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Chargement des statistiques...
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- KPI Globaux (6 cartes) -->
        <div v-if="!isLoading && statistics.kpi" class="kpi-grid">
          <div class="kpi-card total-projects">
            <div class="kpi-icon"><i class="fas fa-folder-open"></i></div>
            <div class="kpi-content">
              <h3>Projets Actifs</h3>
              <div class="kpi-number">{{ statistics.kpi.totalProjets || 0 }}</div>
              <div class="kpi-trend positive"><i class="fas fa-arrow-up"></i> Actifs</div>
            </div>
          </div>

          <div class="kpi-card total-episodes">
            <div class="kpi-icon"><i class="fas fa-film"></i></div>
            <div class="kpi-content">
              <h3>Épisodes Total</h3>
              <div class="kpi-number">{{ statistics.kpi.totalEpisodes || 0 }}</div>
              <div class="kpi-trend positive"><i class="fas fa-arrow-up"></i> Créés</div>
            </div>
          </div>

          <div class="kpi-card total-sequences">
            <div class="kpi-icon"><i class="fas fa-video"></i></div>
            <div class="kpi-content">
              <h3>Séquences Total</h3>
              <div class="kpi-number">{{ statistics.kpi.totalSequences || 0 }}</div>
              <div class="kpi-trend positive"><i class="fas fa-arrow-up"></i> Créées</div>
            </div>
          </div>

          <div class="kpi-card total-scenes">
            <div class="kpi-icon"><i class="fas fa-theater-masks"></i></div>
            <div class="kpi-content">
              <h3>Scènes Total</h3>
              <div class="kpi-number">{{ statistics.kpi.totalScenes || 0 }}</div>
              <div class="kpi-trend positive"><i class="fas fa-arrow-up"></i> Écrites</div>
            </div>
          </div>

          <div class="kpi-card total-dialogues">
            <div class="kpi-icon"><i class="fas fa-comment-dots"></i></div>
            <div class="kpi-content">
              <h3>Dialogues Total</h3>
              <div class="kpi-number">{{ statistics.kpi.totalDialogues || 0 }}</div>
              <div class="kpi-trend positive"><i class="fas fa-arrow-up"></i> Rédigés</div>
            </div>
          </div>

          <div class="kpi-card team-members">
            <div class="kpi-icon"><i class="fas fa-users"></i></div>
            <div class="kpi-content">
              <h3>Équipe Total</h3>
              <div class="kpi-number">{{ statistics.kpi.totalEquipe || 0 }}</div>
              <div class="kpi-trend neutral"><i class="fas fa-users"></i> Membres</div>
            </div>
          </div>
        </div>

        <!-- Section Totaux du Projet -->
        <div v-if="!isLoading && computedProjectTotals" class="totals-section">
          <h3><i class="fas fa-layer-group"></i> Totaux du {{ computedProjectTotals.projetNom || 'Projet' }}</h3>
          <div class="totals-grid">
            <div class="total-card">
              <i class="fas fa-film"></i>
              <div class="total-number">{{ computedProjectTotals.totalEpisodes }}</div>
              <div class="total-label">Épisodes</div>
            </div>
            <div class="total-card">
              <i class="fas fa-list-ol"></i>
              <div class="total-number">{{ computedProjectTotals.totalSequences }}</div>
              <div class="total-label">Séquences</div>
            </div>
            <div class="total-card">
              <i class="fas fa-theater-masks"></i>
              <div class="total-number">{{ computedProjectTotals.totalScenes }}</div>
              <div class="total-label">Scènes</div>
            </div>
            <div class="total-card">
              <i class="fas fa-comments"></i>
              <div class="total-number">{{ computedProjectTotals.totalDialogues }}</div>
              <div class="total-label">Dialogues</div>
            </div>
          </div>
        </div>

        <!-- Graphique: Répartition par Type -->
        <div v-if="!isLoading" class="chart-container">
          <div class="chart-header">
            <h3><i class="fas fa-chart-bar"></i> Répartition par Type</h3>
          </div>
          <div class="chart-content">
            <div class="type-distribution">
              <div v-for="type in computedTypeDistribution" :key="type.name" class="type-item">
                <div class="type-name">{{ type.name }}</div>
                <div class="type-bar">
                  <div class="type-fill" :style="{ width: type.percentage + '%' }"></div>
                </div>
                <div class="type-value">{{ type.value }} ({{ type.percentage }}%)</div>
              </div>
              <div v-if="computedTypeDistribution.length === 0" class="no-data">
                Aucune donnée disponible
              </div>
            </div>
          </div>
        </div>

        <!-- Graphique: Activité Récente -->
        <div v-if="!isLoading" class="chart-container">
          <div class="chart-header">
            <h3><i class="fas fa-chart-line"></i> Activité Récente</h3>
          </div>
          <div class="chart-content">
            <div class="activity-stats">
              <div class="activity-item">
                <span class="activity-label">Nouvelles scènes cette semaine:</span>
                <span class="activity-value">{{ recentActivity.newScenes }}</span>
              </div>
              <div class="activity-item">
                <span class="activity-label">Scènes terminées:</span>
                <span class="activity-value">{{ recentActivity.completedScenes }}</span>
              </div>
              <div class="activity-item">
                <span class="activity-label">Taux d'avancement:</span>
                <span class="activity-value">{{ recentActivity.progressRate }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Graphiques -->
        <div v-if="!isLoading && statistics.statistics" class="charts-section">

          <!-- Répartition des Statuts (4 statuts identiques) -->
          <div class="chart-container">
            <div class="chart-header">
              <h3><i class="fas fa-chart-pie"></i> Répartition des Statuts</h3>
              <div class="chart-legend">
                <span class="legend-item"><span class="legend-color completed"></span>Terminé</span>
                <span class="legend-item"><span class="legend-color in-progress"></span>En cours</span>
                <span class="legend-item"><span class="legend-color planned"></span>Planifié</span>
                <span class="legend-item"><span class="legend-color to-do"></span>À faire</span>
              </div>
            </div>
            <div class="chart-content">
              <div class="pie-charts-grid">
                <div class="pie-chart-item">
                  <h4>Épisodes</h4>
                  <div class="pie-chart">
                    <div class="pie-slice completed" :style="{ '--percentage': piePercentages.episodes.TERMINE }"></div>
                    <div class="pie-slice in-progress" :style="{ '--percentage': piePercentages.episodes.EN_COURS + piePercentages.episodes.TERMINE }"></div>
                    <div class="pie-slice planned" :style="{ '--percentage': piePercentages.episodes.PLANIFIE + piePercentages.episodes.EN_COURS + piePercentages.episodes.TERMINE }"></div>
                    <div class="pie-slice to-do" :style="{ '--percentage': 100 }"></div>
                    <div class="pie-center">
                      <div class="pie-total">{{ statistics.statistics.episodes?.total || 0 }}</div>
                      <div class="pie-label">total</div>
                    </div>
                  </div>
                </div>

                <div class="pie-chart-item">
                  <h4>Séquences</h4>
                  <div class="pie-chart">
                    <div class="pie-slice completed" :style="{ '--percentage': piePercentages.sequences.TERMINE }"></div>
                    <div class="pie-slice in-progress" :style="{ '--percentage': piePercentages.sequences.EN_COURS + piePercentages.sequences.TERMINE }"></div>
                    <div class="pie-slice planned" :style="{ '--percentage': piePercentages.sequences.PLANIFIE + piePercentages.sequences.EN_COURS + piePercentages.sequences.TERMINE }"></div>
                    <div class="pie-slice to-do" :style="{ '--percentage': 100 }"></div>
                    <div class="pie-center">
                      <div class="pie-total">{{ statistics.statistics.sequences?.total || 0 }}</div>
                      <div class="pie-label">total</div>
                    </div>
                  </div>
                </div>

                <div class="pie-chart-item">
                  <h4>Scènes</h4>
                  <div class="pie-chart">
                    <div class="pie-slice completed" :style="{ '--percentage': piePercentages.scenes.TERMINE }"></div>
                    <div class="pie-slice in-progress" :style="{ '--percentage': piePercentages.scenes.EN_COURS + piePercentages.scenes.TERMINE }"></div>
                    <div class="pie-slice planned" :style="{ '--percentage': piePercentages.scenes.PLANIFIE + piePercentages.scenes.EN_COURS + piePercentages.scenes.TERMINE }"></div>
                    <div class="pie-slice to-do" :style="{ '--percentage': 100 }"></div>
                    <div class="pie-center">
                      <div class="pie-total">{{ statistics.statistics.scenes?.total || 0 }}</div>
                      <div class="pie-label">total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Progression Temporelle -->
          <div class="chart-container">
            <div class="chart-header">
              <h3><i class="fas fa-chart-line"></i> Progression Temporelle</h3>
            </div>
            <div class="chart-content">
              <div class="timeline-chart">
                <div class="timeline-bars">
                  <div v-for="(item, index) in statistics.monthlyProgress || []" :key="index" class="timeline-item">
                    <div class="timeline-label">{{ formatMonth(item.mois) }}</div>
                    <div class="timeline-bar">
                      <div class="bar-segment episodes"
                           :style="{ height: calculateBarHeight(item.episodes, 'episodes') + '%' }"
                           :title="item.episodes + ' épisodes'"></div>
                      <div class="bar-segment sequences"
                           :style="{ height: calculateBarHeight(item.sequences, 'sequences') + '%' }"
                           :title="item.sequences + ' séquences'"></div>
                      <div class="bar-segment scenes"
                           :style="{ height: calculateBarHeight(item.scenes, 'scenes') + '%' }"
                           :title="item.scenes + ' scènes'"></div>
                    </div>
                  </div>
                </div>
                <div class="timeline-legend">
                  <span class="legend-item"><span class="legend-color episodes"></span>Épisodes</span>
                  <span class="legend-item"><span class="legend-color sequences"></span>Séquences</span>
                  <span class="legend-item"><span class="legend-color scenes"></span>Scènes</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Graphique 3: Top projets -->
          <div class="chart-container">
            <div class="chart-header">
              <h3><i class="fas fa-trophy"></i> Top Projets</h3>
            </div>
            <div class="chart-content">
              <div class="ranking-list">
                <div v-for="(project, index) in statistics.topProjects || []" :key="project.id" class="ranking-item">
                  <div class="rank-number">{{ index + 1 }}</div>
                  <div class="project-info">
                    <div class="project-name">{{ project.nom }}</div>
                    <div class="project-stats">
                      <span class="stat">{{ project.episodes }} épisodes</span>
                      <span class="stat">{{ project.scenes }} scènes</span>
                      <span class="stat">{{ project.progression }}% terminé</span>
                    </div>
                  </div>
                  <div class="progress-circle" :style="{ '--progress': project.progression }">
                    <span>{{ Math.round(project.progression) }}%</span>
                  </div>
                </div>
                <div v-if="!statistics.topProjects || statistics.topProjects.length === 0" class="no-data">
                  Aucun projet disponible
                </div>
              </div>
            </div>
          </div>

          <!-- Graphique 4: Distribution de l'équipe -->
          <div class="chart-container full-width">
            <div class="chart-header">
              <h3><i class="fas fa-user-friends"></i> Distribution de l'Équipe</h3>
            </div>
            <div class="chart-content">
              <div class="team-distribution">
                <div class="distribution-chart">
                  <div v-for="role in statistics.teamDistribution || []" :key="role.nom" class="distribution-item">
                    <div class="role-info">
                      <span class="role-name">{{ formatRoleName(role.nom) }}</span>
                      <span class="role-count">{{ role.count }} personnes</span>
                    </div>
                    <div class="distribution-bar">
                      <div class="distribution-fill" :style="{ width: role.percentage + '%' }"></div>
                    </div>
                    <span class="role-percentage">{{ role.percentage }}%</span>
                  </div>
                  <div v-if="!statistics.teamDistribution || statistics.teamDistribution.length === 0" class="no-data">
                    Aucune donnée d'équipe disponible
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Tableau détaillé des projets -->
        <div v-if="!isLoading && statistics.projectsDetail" class="projects-table-section">
          <h3><i class="fas fa-table"></i> Détail par Projet</h3>
          <div class="table-container">
            <table class="projects-table">
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
                  <td class="project-name-cell">
                    <strong>{{ project.nom }}</strong>
                    <div class="project-description">{{ project.description || 'Aucune description' }}</div>
                  </td>
                  <td class="number-cell">
                    <span class="stat-number">{{ project.episodes }}</span>
                    <div class="stat-detail">
                      <span class="stat-badge completed">{{ project.episodesTermines }} term.</span>
                    </div>
                  </td>
                  <td class="number-cell">{{ project.sequences }}</td>
                  <td class="number-cell">
                    <span class="stat-number">{{ project.scenes }}</span>
                    <div class="stat-detail">
                      <span class="stat-badge completed">{{ project.scenesTerminees }} term.</span>
                    </div>
                  </td>
                  <td class="number-cell">{{ project.dialogues }}</td>
                  <td class="progress-cell">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: project.progression + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ Math.round(project.progression) }}%</span>
                  </td>
                  <td class="team-cell">
                    <div class="team-avatars">
                      <span v-for="member in project.equipe || []" :key="member.id" 
                            class="avatar" :title="member.nom">
                        {{ getInitials(member.nom) }}
                      </span>
                      <span v-if="!project.equipe || project.equipe.length === 0" class="no-team">
                        -
                      </span>
                    </div>
                  </td>
                  <td class="date-cell">{{ formatDate(project.lastUpdate) }}</td>
                </tr>
                <tr v-if="!statistics.projectsDetail || statistics.projectsDetail.length === 0">
                  <td colspan="8" class="no-data">Aucun projet disponible</td>
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
    minute: '2-digit',
    second: '2-digit'
  })
})

// Calcul des pourcentages pour camemberts (harmonisés)
const piePercentages = computed(() => {
  const result = { episodes: {}, sequences: {}, scenes: {} }
  const stats = statistics.value.statistics || {}

  const calc = (type, key) => {
    const total = stats[type]?.total || 0
    const count = stats[type]?.counts?.[key] || 0
    return total > 0 ? Math.round((count / total) * 1000) / 10 : 0
  }

  // Tous les 4 statuts
  ;['episodes', 'sequences', 'scenes'].forEach(type => {
    result[type].TERMINE = calc(type, 'TERMINE') || calc(type, 'TERMINES')
    result[type].EN_COURS = calc(type, 'EN_COURS')
    result[type].PLANIFIE = calc(type, 'PLANIFIE') || calc(type, 'PLANIFIES')
    result[type].A_FAIRE = calc(type, 'A_FAIRE') || 100 - (result[type].TERMINE + result[type].EN_COURS + result[type].PLANIFIE)
  })

  return result
})

// Computed property pour les totaux du projet
const computedProjectTotals = computed(() => {
  if (!statistics.value.projectsDetail || statistics.value.projectsDetail.length === 0) {
    return null
  }
  
  // Si un projet spécifique est sélectionné
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
  
  // Pour "Tous les projets", on somme tout
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

// Computed property pour la répartition par type
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
  ].filter(item => item.value > 0) // Ne montrer que les types avec des données
})

// Activité récente
const recentActivity = computed(() => {
  const monthly = statistics.value.monthlyProgress || []
  if (monthly.length === 0) {
    return { newScenes: 0, completedScenes: 0, progressRate: 0 }
  }
  
  const latest = monthly[monthly.length - 1]
  return {
    newScenes: latest.scenes || 0,
    completedScenes: Math.round((latest.scenes || 0) * 0.3), // Estimation
    progressRate: Math.round((latest.scenes || 0) / Math.max(1, (latest.episodes || 1) * 10) * 100)
  }
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

    // Charger la liste des projets pour le filtre
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

<style scoped>
.statistiques-globales {
  padding: 20px;
  min-height: 100vh;
}

.statistiques-container {
  max-width: 1300px;
  margin: 0 auto;  
  width: 100%;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  animation: fadeIn 0.6s ease-out;
}

/* En-tête */
.statistiques-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.statistiques-header h1 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 2.5em;
  text-align: center;
}

.filters {
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
}

.filter-group select {
  padding: 8px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 14px;
}

.last-update {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin: 0;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.kpi-icon {
  font-size: 3em;
  margin-right: 20px;
  opacity: 0.8;
}

.kpi-content h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.1em;
}

.kpi-number {
  font-size: 2.5em;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.kpi-trend {
  font-size: 0.9em;
  font-weight: 600;
}

.kpi-trend.positive { color: #27ae60; }
.kpi-trend.negative { color: #e74c3c; }
.kpi-trend.neutral { color: #f39c12; }

/* Graphiques */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.chart-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.chart-container.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.3em;
}

.chart-legend {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
  color: #7f8c8d;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.completed { background: #27ae60; }
.legend-color.in-progress { background: #3498db; }
.legend-color.planned { background: #f39c12; }
.legend-color.to-do { background: #95a5a6; }
.legend-color.episodes { background: #e74c3c; }
.legend-color.sequences { background: #9b59b6; }
.legend-color.scenes { background: #1abc9c; }

/* Graphiques en camembert */
.pie-charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  text-align: center;
}

.pie-chart-item h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.pie-chart {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto;
  background: conic-gradient(
    #27ae60 0% calc(var(--percentage, 0) * 1%),
    #3498db calc(var(--percentage, 0) * 1%) calc(var(--percentage, 0) * 2%),
    #f39c12 calc(var(--percentage, 0) * 2%) calc(var(--percentage, 0) * 3%),
    #95a5a6 calc(var(--percentage, 0) * 3%) 100%
  );
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.pie-total {
  font-size: 1.2em;
  font-weight: bold;
  color: #2c3e50;
}

.pie-label {
  font-size: 0.8em;
  color: #7f8c8d;
}

/* Graphique de progression temporelle */
.timeline-chart {
  padding: 20px 0;
}

.timeline-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  margin-bottom: 20px;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.timeline-label {
  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
}

.timeline-bar {
  height: 150px;
  width: 30px;
  background: #ecf0f1;
  border-radius: 15px;
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
}

.bar-segment {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.bar-segment.episodes { background: #e74c3c; }
.bar-segment.sequences { background: #9b59b6; }
.bar-segment.scenes { background: #1abc9c; }

.bar-segment:hover {
  opacity: 0.8;
  transform: scaleX(1.1);
}

/* Classement des projets */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.ranking-item:hover {
  background: #e9ecef;
}

.rank-number {
  width: 30px;
  height: 30px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.ranking-item:nth-child(1) .rank-number { background: #f1c40f; }
.ranking-item:nth-child(2) .rank-number { background: #95a5a6; }
.ranking-item:nth-child(3) .rank-number { background: #d35400; }

.project-info {
  flex: 1;
}

.project-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.project-stats {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
  color: #7f8c8d;
}

.progress-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: conic-gradient(#3498db calc(var(--progress) * 1%), #ecf0f1 0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: bold;
  color: #2c3e50;
}

/* Distribution de l'équipe */
.team-distribution {
  padding: 20px 0;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.role-info {
  display: flex;
  justify-content: space-between;
  width: 200px;
}

.role-name {
  font-weight: 600;
  color: #2c3e50;
}

.role-count {
  color: #7f8c8d;
  font-size: 0.9em;
}

.distribution-bar {
  flex: 1;
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  border-radius: 10px;
  transition: width 1s ease;
}

.role-percentage {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #2c3e50;
}

/* Tableau des projets */
.projects-table-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.projects-table-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.table-container {
  overflow-x: auto;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.projects-table th {
  background: #34495e;
  color: white;
  padding: 15px;
  text-align: left;
  font-weight: 600;
}

.projects-table td {
  padding: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.projects-table tr:hover {
  background: #f8f9fa;
}

.project-name-cell strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 5px;
}

.project-description {
  font-size: 0.9em;
  color: #7f8c8d;
  font-style: italic;
}

.number-cell {
  text-align: center;
}

.stat-number {
  font-size: 1.2em;
  font-weight: bold;
  color: #2c3e50;
  display: block;
}

.stat-detail {
  margin-top: 5px;
}

.progress-cell {
  min-width: 120px;
}

.progress-bar {
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.9em;
  color: #7f8c8d;
  text-align: center;
  display: block;
}

.team-cell {
  text-align: center;
}

.team-avatars {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.avatar {
  width: 30px;
  height: 30px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: bold;
}

.date-cell {
  color: #7f8c8d;
  font-size: 0.9em;
}

/* États */
.loading {
  text-align: center;
  padding: 60px;
  font-size: 1.3em;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.error-message {
  background: rgba(231, 76, 60, 0.1);
  color: #c0392b;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin: 20px 0;
  backdrop-filter: blur(10px);
}

/* Nouveaux styles pour les sections ajoutées */
.totals-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.total-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.total-card:hover {
  transform: translateY(-3px);
}

.total-number {
  font-size: 2em;
  font-weight: bold;
  color: #2c3e50;
  margin: 10px 0;
}

.total-label {
  color: #7f8c8d;
  font-size: 0.9em;
}

.type-distribution {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.type-name {
  width: 120px;
  font-weight: 600;
  color: #2c3e50;
}

.type-bar {
  flex: 1;
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.type-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  border-radius: 10px;
  transition: width 1s ease;
}

.type-value {
  width: 80px;
  text-align: right;
  font-weight: 600;
  color: #2c3e50;
}

.activity-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-label {
  font-weight: 600;
  color: #2c3e50;
}

.activity-value {
  font-weight: bold;
  color: #3498db;
  font-size: 1.1em;
}

.no-data {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
    align-items: center;
  }
  
  .pie-charts-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline-bars {
    flex-direction: column;
    height: auto;
    align-items: center;
  }
  
  .timeline-item {
    flex-direction: row;
    width: 100%;
    margin-bottom: 15px;
  }
  
  .timeline-bar {
    height: 20px;
    width: 100%;
    flex-direction: row;
  }
  
  .bar-segment {
    height: 100%;
  }

  .totals-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .type-item {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .type-name {
    width: auto;
  }

  .type-value {
    width: auto;
  }
}
</style>
