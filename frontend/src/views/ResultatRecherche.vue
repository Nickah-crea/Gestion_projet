<template>
  <div class="resultat-recherche">
    <!-- En-tête avec navigation -->
    <div class="header">
      <router-link to="/recherche" class="back-link">
        ← Retour aux résultats
      </router-link>
      <h1>📖 Détails du résultat</h1>
      <div v-if="resultat" class="result-type-header" :class="'type-' + resultat.type">
        <span class="type-icon">{{ getTypeIcon(resultat.type) }}</span>
        <span class="type-label">{{ getTypeLabel(resultat.type) }}</span>
        <!-- Bouton d'export PDF -->
        <button @click="exporterPDF" class="btn-export-pdf" :disabled="exportEnCours">
          📄 {{ exportEnCours ? 'Génération...' : 'Exporter PDF' }}
        </button>
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="chargement" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des détails...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="erreur" class="error-state">
      <div class="error-icon">❌</div>
      <h3>Erreur de chargement</h3>
      <p>{{ erreur }}</p>
      <button @click="chargerDetails" class="btn-retry">Réessayer</button>
    </div>

    <!-- Affichage des détails -->
    <div v-else-if="resultat" class="details-container">
      
      <!-- Carte principale -->
      <div class="main-card">
        <div class="card-header">
          <h2 class="result-title">{{ resultat.titre }}</h2>
          <div class="header-actions">
            <span class="last-modified">
              📅 Modifié le : {{ formatDateTime(resultat.modifieLe) }}
            </span>
          </div>
        </div>

        <!-- Détails selon le type -->
        <div class="card-content">
          
          <!-- SCÈNE - DÉTAILS COMPLETS -->
          <div v-if="resultat.type === 'scene'" class="scene-details">
            
            <!-- Informations de tournage -->
            <div class="detail-section">
              <h3>🎬 Informations de tournage</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">📅 Date :</span>
                  <span class="detail-value">{{ formatDate(resultat.dateTournage) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">🕒 Heure début :</span>
                  <span class="detail-value">{{ resultat.heureDebut || 'Non spécifiée' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">🕒 Heure fin :</span>
                  <span class="detail-value">{{ resultat.heureFin || 'Non spécifiée' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">📊 Statut :</span>
                  <span class="detail-value status-badge" :class="'status-' + resultat.statut">
                    {{ formatStatut(resultat.statut) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">⏱️ Durée estimée :</span>
                  <span class="detail-value">{{ calculerDureeScene(resultat.heureDebut, resultat.heureFin) }}</span>
                </div>
              </div>
            </div>

            <!-- Synopsis -->
            <div v-if="resultat.description" class="detail-section">
              <h3>📝 Synopsis</h3>
              <div class="description-content">
                {{ resultat.description }}
              </div>
            </div>

            <!-- Structure du projet -->
            <div class="detail-section">
              <h3>📁 Structure du projet</h3>
              <div class="hierarchy-path">
                <div v-if="resultat.projetTitre" class="hierarchy-level">
                  <span class="level-icon">📁</span>
                  <span class="level-label">Projet :</span>
                  <span class="level-value">{{ resultat.projetTitre }}</span>
                </div>
                <div v-if="resultat.episodeTitre" class="hierarchy-level">
                  <span class="level-icon">▶️</span>
                  <span class="level-label">Épisode :</span>
                  <span class="level-value">{{ resultat.episodeTitre }}</span>
                </div>
                <div v-if="resultat.sequenceTitre" class="hierarchy-level">
                  <span class="level-icon">🎞️</span>
                  <span class="level-label">Séquence :</span>
                  <span class="level-value">{{ resultat.sequenceTitre }}</span>
                </div>
              </div>
            </div>

            <!-- Localisation -->
            <div class="detail-section">
              <h3>📍 Localisation</h3>
              <div class="details-grid">
                <div v-if="resultat.lieuNom" class="detail-item">
                  <span class="detail-label">🏛️ Lieu :</span>
                  <span class="detail-value">{{ resultat.lieuNom }}</span>
                </div>
                <div v-if="resultat.plateauNom" class="detail-item">
                  <span class="detail-label">🎭 Plateau :</span>
                  <span class="detail-value">{{ resultat.plateauNom }}</span>
                </div>
              </div>
            </div>

            <!-- Personnages impliqués avec DÉTAILS -->
            <div v-if="resultatDetails.personnages && resultatDetails.personnages.length > 0" class="detail-section">
              <h3>👥 Personnages impliqués ({{ resultatDetails.personnages.length }})</h3>
              <div class="personnages-detailed-list">
                <div
                  v-for="personnage in resultatDetails.personnages"
                  :key="personnage.id"
                  class="personnage-detailed-item"
                >
                  <div class="personnage-main-info">
                    <span class="personnage-nom">{{ personnage.nom }}</span>
                    <span v-if="personnage.comedien" class="personnage-comedien">
                      ({{ personnage.comedien }})
                    </span>
                  </div>
                  <div class="personnage-stats">
                    <span class="personnage-dialogues">{{ personnage.nbDialogues }} dialogues</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TOUS LES DIALOGUES COMPLETS DE LA SCÈNE -->
            <div v-if="resultatDetails.dialoguesComplets && resultatDetails.dialoguesComplets.length > 0" class="detail-section">
              <h3>💬 Dialogues complets ({{ resultatDetails.dialoguesComplets.length }})</h3>
              <div class="dialogues-stats">
                <span class="stat-item">📊 Total mots : {{ compterMotsDialoguesComplets(resultatDetails.dialoguesComplets) }}</span>
                <span class="stat-item">⏱️ Durée estimée : {{ estimerDureeDialoguesComplets(resultatDetails.dialoguesComplets) }}</span>
              </div>
              <div class="dialogues-complets-list">
                <div
                  v-for="(dialogue, index) in resultatDetails.dialoguesComplets"
                  :key="dialogue.id || index"
                  class="dialogue-complet-item"
                >
                  <div class="dialogue-header">
                    <span class="dialogue-personnage">
                      <strong>{{ dialogue.personnageNom || 'Narrateur' }}:</strong>
                    </span>
                    <span class="dialogue-ordre">#{{ dialogue.ordre || index + 1 }}</span>
                  </div>
                  <div class="dialogue-text">"{{ dialogue.texte }}"</div>
                  <div v-if="dialogue.observation" class="dialogue-observation">
                    💡 {{ dialogue.observation }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="resultat.dialogues && resultat.dialogues.length > 0" class="detail-section">
              <h3>💬 Dialogues ({{ resultat.dialogues.length }})</h3>
              <div class="dialogues-list-simple">
                <div
                  v-for="(dialogue, index) in resultat.dialogues"
                  :key="index"
                  class="dialogue-simple-item"
                >
                  <div class="dialogue-text">"{{ dialogue }}"</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PERSONNAGE - DÉTAILS COMPLETS -->
          <div v-else-if="resultat.type === 'personnage'" class="personnage-details">
            
            <!-- Informations de base -->
            <div class="detail-section">
              <h3>👤 Informations du personnage</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">🎭 Comédien :</span>
                  <span class="detail-value">{{ resultat.comedienNom || 'Non spécifié' }}</span>
                </div>
                <div v-if="resultatDetails.informationsComplementaires?.age" class="detail-item">
                  <span class="detail-label">🎂 Âge :</span>
                  <span class="detail-value">{{ resultatDetails.informationsComplementaires.age }}</span>
                </div>
                <div v-if="resultatDetails.informationsComplementaires?.typePersonnage" class="detail-item">
                  <span class="detail-label">📝 Type :</span>
                  <span class="detail-value">{{ resultatDetails.informationsComplementaires.typePersonnage }}</span>
                </div>
              </div>
            </div>

            <!-- Statistiques -->
            <div v-if="resultatDetails.statistiques" class="detail-section">
              <h3>📊 Statistiques</h3>
              <div class="details-grid">
                <div v-if="resultatDetails.statistiques.nbScenes" class="detail-item">
                  <span class="detail-label">🎬 Scènes :</span>
                  <span class="detail-value">{{ resultatDetails.statistiques.nbScenes }}</span>
                </div>
                <div v-if="resultatDetails.statistiques.nbDialogues" class="detail-item">
                  <span class="detail-label">💬 Dialogues :</span>
                  <span class="detail-value">{{ resultatDetails.statistiques.nbDialogues }}</span>
                </div>
                <div v-if="resultatDetails.statistiques.totalMots" class="detail-item">
                  <span class="detail-label">📝 Total mots :</span>
                  <span class="detail-value">{{ resultatDetails.statistiques.totalMots }}</span>
                </div>
                <div v-if="resultatDetails.statistiques.pourcentageDialogues" class="detail-item">
                  <span class="detail-label">📈 Part des dialogues :</span>
                  <span class="detail-value">{{ Math.round(resultatDetails.statistiques.pourcentageDialogues * 100) / 100 }}%</span>
                </div>
                <div v-if="resultatDetails.statistiques.dureeTotale" class="detail-item">
                  <span class="detail-label">⏱️ Durée totale :</span>
                  <span class="detail-value">{{ resultatDetails.statistiques.dureeTotale }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="resultat.description" class="detail-section">
              <h3>📝 Description</h3>
              <div class="description-content">
                {{ resultat.description }}
              </div>
            </div>

            <!-- Structure du projet -->
            <div class="detail-section">
              <h3>📁 Projet</h3>
              <div class="hierarchy-path">
                <div v-if="resultat.projetTitre" class="hierarchy-level">
                  <span class="level-icon">📁</span>
                  <span class="level-label">Projet :</span>
                  <span class="level-value">{{ resultat.projetTitre }}</span>
                </div>
              </div>
            </div>

            <!-- 🎬 PLANNING DE TOURNAGE RÉEL DES SCÈNES -->
            <div v-if="resultatDetails.scenes && resultatDetails.scenes.length > 0" class="detail-section">
              <h3>🎬 Planning de tournage des scènes</h3>
              <div class="scenes-planning-list">
                <div
                  v-for="scene in scenesAvecPlanning"
                  :key="scene.id"
                  class="scene-planning-item"
                >
                  <div class="scene-planning-header">
                    <span class="scene-titre">{{ scene.titre }}</span>
                    <span class="scene-statut" :class="'status-' + (scene.statut || 'planifie')">
                      {{ formatStatut(scene.statut || 'planifie') }}
                    </span>
                  </div>
                  
                  <div class="scene-planning-details">
                    <div class="planning-info-grid">
                      <div class="planning-info-item">
                        <span class="detail-label">📅 Date :</span>
                        <span class="detail-value">{{ formatDate(scene.dateTournage) }}</span>
                      </div>
                      <div class="planning-info-item">
                        <span class="detail-label">🕒 Heure début :</span>
                        <span class="detail-value">{{ scene.heureDebut || 'Non spécifiée' }}</span>
                      </div>
                      <div class="planning-info-item">
                        <span class="detail-label">🕒 Heure fin :</span>
                        <span class="detail-value">{{ scene.heureFin || 'Non spécifiée' }}</span>
                      </div>
                      <div class="planning-info-item">
                        <span class="detail-label">⏱️ Durée estimée :</span>
                        <span class="detail-value">{{ calculerDureeScene(scene.heureDebut, scene.heureFin) }}</span>
                      </div>
                    </div>
                    
                    <div class="scene-planning-location">
                      <span v-if="scene.lieuNom" class="location-item">
                        <span class="location-icon">🏛️</span>
                        {{ scene.lieuNom }}
                      </span>
                      <span v-if="scene.plateauNom" class="location-item">
                        <span class="location-icon">🎭</span>
                        {{ scene.plateauNom }}
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="scene.nbDialogues" class="scene-dialogues-info">
                    <span class="dialogues-count">💬 {{ scene.nbDialogues }} dialogues dans cette scène</span>
                  </div>
                </div>
              </div>
              
              <div v-if="scenesAvecPlanning.length === 0" class="no-planning">
                <p>📅 Aucun planning de tournage disponible pour ce personnage</p>
              </div>
            </div>

            <!-- TOUS LES DIALOGUES RÉELS DU PERSONNAGE -->
            <div v-if="resultatDetails.dialogues && resultatDetails.dialogues.length > 0" class="detail-section">
              <h3>💬 Tous les dialogues ({{ resultatDetails.dialogues.length }})</h3>
              
              <div class="dialogues-stats">
                <span class="stat-item">📊 Total mots : {{ resultatDetails.statistiques?.totalMots || compterMotsDialoguesPersonnage(resultatDetails.dialogues) }}</span>
                <span class="stat-item">⏱️ Durée estimée : {{ estimerDureeDialoguesPersonnage(resultatDetails.dialogues) }}</span>
              </div>

              <!-- Filtres et tri -->
              <div class="dialogues-controls">
                <div class="filter-group">
                  <label>Trier par :</label>
                  <select v-model="triDialogues" @change="trierDialogues" class="select-input">
                    <option value="ordre">Ordre chronologique</option>
                    <option value="scene">Scène</option>
                    <option value="longueur">Longueur</option>
                  </select>
                </div>
                <div class="search-group">
                  <input 
                    v-model="rechercheDialogue" 
                    type="text" 
                    placeholder="Rechercher dans les dialogues..." 
                    class="search-input"
                  />
                </div>
              </div>

              <div class="dialogues-list">
                <div
                  v-for="(dialogue, index) in dialoguesFiltres"
                  :key="dialogue.id || index"
                  class="dialogue-item"
                >
                  <div class="dialogue-header">
                    <span class="dialogue-number">Dialogue #{{ index + 1 }}</span>
                    <span class="dialogue-context">
                      <strong>Scène:</strong> {{ dialogue.sceneTitre || 'Non spécifiée' }}
                      <span v-if="dialogue.sequenceTitre"> • <strong>Séquence:</strong> {{ dialogue.sequenceTitre }}</span>
                      <span v-if="dialogue.episodeTitre"> • <strong>Épisode:</strong> {{ dialogue.episodeTitre }}</span>
                    </span>
                  </div>
                  
                  <div class="dialogue-text">"{{ dialogue.texte }}"</div>
                  
                  <div class="dialogue-footer">
                    <span class="dialogue-info">
                      📝 {{ compterMots(dialogue.texte) }} mots • ⏱️ {{ estimerDuree(dialogue.texte) }}
                    </span>
                    <span v-if="dialogue.observation" class="dialogue-observation">
                      💡 {{ dialogue.observation }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Pagination si beaucoup de dialogues -->
              <div v-if="dialoguesFiltres.length > 10" class="pagination">
                <button @click="pageDialogues--" :disabled="pageDialogues === 1" class="pagination-btn">← Précédent</button>
                <span>Page {{ pageDialogues }} sur {{ totalPagesDialogues }}</span>
                <button @click="pageDialogues++" :disabled="pageDialogues === totalPagesDialogues" class="pagination-btn">Suivant →</button>
              </div>
            </div>

            <div v-else class="no-dialogues">
              <p>📝 Ce personnage n'a aucun dialogue.</p>
            </div>

            <!-- Scènes associées (version simplifiée) -->
            <div v-if="resultatDetails.scenes && resultatDetails.scenes.length > 0" class="detail-section">
              <h3>🎬 Toutes les scènes associées ({{ resultatDetails.scenes.length }})</h3>
              <div class="scenes-overview">
                <div
                  v-for="scene in resultatDetails.scenes"
                  :key="scene.id"
                  class="scene-overview-item"
                >
                  <div class="scene-overview-header">
                    <span class="scene-titre">{{ scene.titre }}</span>
                    <span class="scene-statut" :class="'status-' + (scene.statut || 'planifie')">
                      {{ formatStatut(scene.statut || 'planifie') }}
                    </span>
                  </div>
                  <div class="scene-overview-details">
                    <span v-if="scene.dateTournage" class="scene-date">📅 {{ formatDate(scene.dateTournage) }}</span>
                    <span v-if="scene.lieuNom" class="scene-lieu">📍 {{ scene.lieuNom }}</span>
                    <span class="scene-dialogues">💬 {{ scene.nbDialogues }} dialogues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- LIEU - DÉTAILS COMPLETS -->
          <div v-else-if="resultat.type === 'lieu'" class="lieu-details">
            <div class="detail-section">
              <h3>🏛️ Informations du lieu</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">📝 Type :</span>
                  <span class="detail-value">{{ resultat.description ? getTypeFromDescription(resultat.description) : 'Non spécifié' }}</span>
                </div>
                <div v-if="resultatDetails.informationsComplementaires?.adresse" class="detail-item">
                  <span class="detail-label">🏠 Adresse :</span>
                  <span class="detail-value">{{ resultatDetails.informationsComplementaires.adresse }}</span>
                </div>
              </div>
            </div>

            <div v-if="resultat.description" class="detail-section">
              <h3>📝 Description</h3>
              <div class="description-content">
                {{ resultat.description }}
              </div>
            </div>

            <!-- Scènes tournées à ce lieu -->
            <div v-if="resultatDetails.scenes && resultatDetails.scenes.length > 0" class="detail-section">
              <h3>🎬 Scènes tournées ici ({{ resultatDetails.scenes.length }})</h3>
              <div class="scenes-list">
                <div
                  v-for="scene in resultatDetails.scenes"
                  :key="scene.id"
                  class="scene-item"
                >
                  <div class="scene-header">
                    <span class="scene-titre">{{ scene.titre }}</span>
                    <span class="scene-statut" :class="'status-' + scene.statut">
                      {{ formatStatut(scene.statut) }}
                    </span>
                  </div>
                  <div class="scene-details">
                    <span class="scene-date">{{ formatDate(scene.dateTournage) }}</span>
                    <span class="scene-heure">{{ scene.heureDebut }} - {{ scene.heureFin }}</span>
                    <span class="scene-personnages">👥 {{ scene.nbPersonnages }} pers.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PLATEAU - DÉTAILS COMPLETS -->
          <div v-else-if="resultat.type === 'plateau'" class="plateau-details">
            <div class="detail-section">
              <h3>🎭 Informations du plateau</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">📝 Type :</span>
                  <span class="detail-value">{{ resultat.description ? getTypeFromDescription(resultat.description) : 'Non spécifié' }}</span>
                </div>
                <div v-if="resultat.lieuNom" class="detail-item">
                  <span class="detail-label">🏛️ Lieu :</span>
                  <span class="detail-value">{{ resultat.lieuNom }}</span>
                </div>
              </div>
            </div>

            <div v-if="resultat.description" class="detail-section">
              <h3>📝 Description</h3>
              <div class="description-content">
                {{ resultat.description }}
              </div>
            </div>

            <!-- Scènes tournées sur ce plateau -->
            <div v-if="resultatDetails.scenes && resultatDetails.scenes.length > 0" class="detail-section">
              <h3>🎬 Scènes tournées ici ({{ resultatDetails.scenes.length }})</h3>
              <div class="scenes-list">
                <div
                  v-for="scene in resultatDetails.scenes"
                  :key="scene.id"
                  class="scene-item"
                >
                  <div class="scene-header">
                    <span class="scene-titre">{{ scene.titre }}</span>
                    <span class="scene-statut" :class="'status-' + scene.statut">
                      {{ formatStatut(scene.statut) }}
                    </span>
                  </div>
                  <div class="scene-details">
                    <span class="scene-date">{{ formatDate(scene.dateTournage) }}</span>
                    <span class="scene-heure">{{ scene.heureDebut }} - {{ scene.heureFin }}</span>
                    <span class="scene-dialogues">💬 {{ scene.nbDialogues }} dialogues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Critères de recherche utilisés -->
      <div v-if="criteresRecherche" class="search-criteria-card">
        <h3>🔍 Critères de recherche utilisés</h3>
        <div class="criteria-list">
          <div v-if="criteresRecherche.termeRecherche" class="criterion">
            <span class="criterion-label">Mot-clé :</span>
            <span class="criterion-value">{{ criteresRecherche.termeRecherche }}</span>
          </div>
          <div v-if="criteresRecherche.typesRecherche && criteresRecherche.typesRecherche.length" class="criterion">
            <span class="criterion-label">Types recherchés :</span>
            <span class="criterion-value">{{ formatTypes(criteresRecherche.typesRecherche) }}</span>
          </div>
          <div v-if="criteresRecherche.dateDebut || criteresRecherche.dateFin" class="criterion">
            <span class="criterion-label">Période :</span>
            <span class="criterion-value">
              {{ formatDate(criteresRecherche.dateDebut) || 'Début non spécifié' }}
              → 
              {{ formatDate(criteresRecherche.dateFin) || 'Fin non spécifiée' }}
            </span>
          </div>
          <div v-if="criteresRecherche.statuts && criteresRecherche.statuts.length" class="criterion">
            <span class="criterion-label">Statuts :</span>
            <span class="criterion-value">{{ criteresRecherche.statuts.join(', ') }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- État vide si pas de résultat -->
    <div v-else class="empty-state">
      <div class="empty-icon">❓</div>
      <h3>Aucun détail disponible</h3>
      <p>Impossible de charger les détails de ce résultat</p>
    </div>
  </div>
</template>

<script>
// IMPORT DES VRAIS SERVICES
import { getResultatDetails, getResultatDetailsComplets } from '../service/rechercheService'
import '../assets/css/resultat_search.css';

// Import pour l'export PDF
import jsPDF from 'jspdf';

export default {
  name: 'ResultatRecherche',
  data() {
    return {
      resultat: null,
      resultatDetails: {},
      criteresRecherche: null,
      chargement: true,
      erreur: null,
      triDialogues: 'ordre',
      rechercheDialogue: '',
      pageDialogues: 1,
      dialoguesParPage: 10,
      exportEnCours: false
    }
  },
  computed: {
    dialoguesFiltres() {
      let dialogues = this.resultatDetails.dialogues || [];
      
      // Filtre par recherche
      if (this.rechercheDialogue) {
        const terme = this.rechercheDialogue.toLowerCase();
        dialogues = dialogues.filter(d => 
          d.texte.toLowerCase().includes(terme) ||
          (d.observation && d.observation.toLowerCase().includes(terme)) ||
          (d.sceneTitre && d.sceneTitre.toLowerCase().includes(terme))
        );
      }
      
      // Tri
      switch (this.triDialogues) {
        case 'scene':
          dialogues.sort((a, b) => (a.sceneTitre || '').localeCompare(b.sceneTitre || ''));
          break;
        case 'longueur':
          dialogues.sort((a, b) => this.compterMots(b.texte) - this.compterMots(a.texte));
          break;
        case 'ordre':
        default:
          dialogues.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
          break;
      }
      
      // Pagination
      const start = (this.pageDialogues - 1) * this.dialoguesParPage;
      const end = start + this.dialoguesParPage;
      return dialogues.slice(start, end);
    },
    
    totalPagesDialogues() {
      const total = this.resultatDetails.dialogues?.length || 0;
      return Math.ceil(total / this.dialoguesParPage);
    },

    // CORRECTION : Computed property pour filtrer les scènes avec planning
    scenesAvecPlanning() {
      if (!this.resultatDetails.scenes) return [];
      return this.resultatDetails.scenes.filter(scene => scene.dateTournage);
    }
  },
  async mounted() {
    await this.chargerDetails()
  },
  methods: {
    async chargerDetails() {
      this.chargement = true
      this.erreur = null
      
      try {
        const { type, id } = this.$route.params
        
        // Récupérer les critères de recherche depuis l'URL
        if (this.$route.query.recherche) {
          this.criteresRecherche = JSON.parse(this.$route.query.recherche)
        }
        
        // APPELS API RÉELS
        // 1. Détails de base
        this.resultat = await getResultatDetails(type, id)
        
        // 2. Détails complets selon le type
        this.resultatDetails = await getResultatDetailsComplets(type, id)
        
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error)
        this.erreur = error.message || 'Erreur lors du chargement des détails'
      } finally {
        this.chargement = false
      }
    },
    
    // NOUVELLE MÉTHODE : Export PDF
    async exporterPDF() {
      this.exportEnCours = true;
      
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        let yPosition = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        
        // En-tête du PDF
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Détails du ${this.getTypeLabel(this.resultat.type)}`, margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Export généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
        yPosition += 15;
        
        // Informations principales
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Informations principales', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Titre : ${this.resultat.titre}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`Type : ${this.getTypeLabel(this.resultat.type)}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`Dernière modification : ${this.formatDateTime(this.resultat.modifieLe)}`, margin, yPosition);
        yPosition += 15;
        
        // Contenu spécifique selon le type
        if (this.resultat.type === 'personnage') {
          await this.exporterPDFPersonnage(pdf, margin, yPosition, contentWidth);
        } else if (this.resultat.type === 'scene') {
          await this.exporterPDFScene(pdf, margin, yPosition, contentWidth);
        } else if (this.resultat.type === 'lieu') {
          await this.exporterPDFLieu(pdf, margin, yPosition, contentWidth);
        } else if (this.resultat.type === 'plateau') {
          await this.exporterPDFPlateau(pdf, margin, yPosition, contentWidth);
        }
        
        // Sauvegarde du PDF
        pdf.save(`${this.resultat.type}_${this.resultat.titre}_${new Date().toISOString().split('T')[0]}.pdf`);
        
      } catch (error) {
        console.error('Erreur lors de l\'export PDF:', error);
        alert('Erreur lors de la génération du PDF');
      } finally {
        this.exportEnCours = false;
      }
    },
    
    // Export PDF pour les personnages
    async exporterPDFPersonnage(pdf, margin, yPosition, contentWidth) {
      let currentY = yPosition;
      
      // Informations du personnage
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('👤 Informations du personnage', margin, currentY);
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Comédien : ${this.resultat.comedienNom || 'Non spécifié'}`, margin, currentY);
      currentY += 5;
      
      if (this.resultatDetails.informationsComplementaires?.age) {
        pdf.text(`Âge : ${this.resultatDetails.informationsComplementaires.age}`, margin, currentY);
        currentY += 5;
      }
      
      if (this.resultatDetails.informationsComplementaires?.typePersonnage) {
        pdf.text(`Type : ${this.resultatDetails.informationsComplementaires.typePersonnage}`, margin, currentY);
        currentY += 5;
      }
      
      currentY += 5;
      
      // Structure du projet
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📁 Projet', margin, currentY);
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (this.resultat.projetTitre) {
        pdf.text(`Projet : ${this.resultat.projetTitre}`, margin, currentY);
        currentY += 5;
      }
      currentY += 5;
      
      // Statistiques
      if (this.resultatDetails.statistiques) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📊 Statistiques', margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const stats = this.resultatDetails.statistiques;
        if (stats.nbScenes) {
          pdf.text(`Scènes : ${stats.nbScenes}`, margin, currentY);
          currentY += 5;
        }
        if (stats.nbDialogues) {
          pdf.text(`Dialogues : ${stats.nbDialogues}`, margin, currentY);
          currentY += 5;
        }
        if (stats.totalMots) {
          pdf.text(`Total mots : ${stats.totalMots}`, margin, currentY);
          currentY += 5;
        }
        if (stats.pourcentageDialogues) {
          pdf.text(`Part des dialogues : ${Math.round(stats.pourcentageDialogues * 100) / 100}%`, margin, currentY);
          currentY += 5;
        }
        if (stats.dureeTotale) {
          pdf.text(`Durée totale : ${stats.dureeTotale}`, margin, currentY);
          currentY += 5;
        }
        currentY += 5;
      }
      
      // Planning de tournage
      if (this.scenesAvecPlanning.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🎬 Planning de tournage des scènes', margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        for (const scene of this.scenesAvecPlanning) {
          // Vérifier si on doit ajouter une nouvelle page
          if (currentY > 250) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`• ${scene.titre}`, margin, currentY);
          currentY += 5;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`  Statut : ${this.formatStatut(scene.statut || 'planifie')}`, margin, currentY);
          currentY += 4;
          pdf.text(`  Date : ${this.formatDate(scene.dateTournage)}`, margin, currentY);
          currentY += 4;
          pdf.text(`  Heure : ${scene.heureDebut || 'N/A'} - ${scene.heureFin || 'N/A'}`, margin, currentY);
          currentY += 4;
          pdf.text(`  Durée : ${this.calculerDureeScene(scene.heureDebut, scene.heureFin)}`, margin, currentY);
          currentY += 4;
          
          if (scene.lieuNom) {
            pdf.text(`  Lieu : ${scene.lieuNom}`, margin, currentY);
            currentY += 4;
          }
          
          if (scene.nbDialogues) {
            pdf.text(`  Dialogues : ${scene.nbDialogues}`, margin, currentY);
            currentY += 4;
          }
          
          currentY += 5;
        }
        currentY += 5;
      }
      
      // Dialogues
      if (this.resultatDetails.dialogues && this.resultatDetails.dialogues.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('💬 Tous les dialogues', margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        for (const dialogue of this.resultatDetails.dialogues.slice(0, 50)) { // Limiter à 50 dialogues
          // Vérifier si on doit ajouter une nouvelle page
          if (currentY > 250) {
            pdf.addPage();
            currentY = 20;
          }
          
          const sceneInfo = dialogue.sceneTitre ? ` (Scène: ${dialogue.sceneTitre})` : '';
          const dialogueText = `"${dialogue.texte}"`;
          
          // Diviser le texte long en plusieurs lignes
          const lines = pdf.splitTextToSize(`${dialogue.personnageNom || 'Narrateur'}: ${dialogueText}${sceneInfo}`, contentWidth);
          
          lines.forEach(line => {
            pdf.text(line, margin, currentY);
            currentY += 4;
          });
          
          currentY += 3;
        }
        
        if (this.resultatDetails.dialogues.length > 50) {
          pdf.text(`... et ${this.resultatDetails.dialogues.length - 50} dialogues supplémentaires`, margin, currentY);
          currentY += 5;
        }
      }
    },
    
    // Export PDF pour les scènes
    async exporterPDFScene(pdf, margin, yPosition, contentWidth) {
      let currentY = yPosition;
      
      // Informations de tournage
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎬 Informations de tournage', margin, currentY);
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date : ${this.formatDate(this.resultat.dateTournage)}`, margin, currentY);
      currentY += 5;
      pdf.text(`Heure début : ${this.resultat.heureDebut || 'Non spécifiée'}`, margin, currentY);
      currentY += 5;
      pdf.text(`Heure fin : ${this.resultat.heureFin || 'Non spécifiée'}`, margin, currentY);
      currentY += 5;
      pdf.text(`Statut : ${this.formatStatut(this.resultat.statut)}`, margin, currentY);
      currentY += 5;
      pdf.text(`Durée estimée : ${this.calculerDureeScene(this.resultat.heureDebut, this.resultat.heureFin)}`, margin, currentY);
      currentY += 10;
      
      // Structure du projet
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📁 Structure du projet', margin, currentY);
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (this.resultat.projetTitre) {
        pdf.text(`Projet : ${this.resultat.projetTitre}`, margin, currentY);
        currentY += 5;
      }
      if (this.resultat.episodeTitre) {
        pdf.text(`Épisode : ${this.resultat.episodeTitre}`, margin, currentY);
        currentY += 5;
      }
      if (this.resultat.sequenceTitre) {
        pdf.text(`Séquence : ${this.resultat.sequenceTitre}`, margin, currentY);
        currentY += 5;
      }
      currentY += 5;
      
      // Localisation
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📍 Localisation', margin, currentY);
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (this.resultat.lieuNom) {
        pdf.text(`Lieu : ${this.resultat.lieuNom}`, margin, currentY);
        currentY += 5;
      }
      if (this.resultat.plateauNom) {
        pdf.text(`Plateau : ${this.resultat.plateauNom}`, margin, currentY);
        currentY += 5;
      }
      currentY += 5;
      
      // Personnages
      if (this.resultatDetails.personnages && this.resultatDetails.personnages.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('👥 Personnages impliqués', margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        for (const personnage of this.resultatDetails.personnages) {
          const info = `${personnage.nom}${personnage.comedien ? ` (${personnage.comedien})` : ''} - ${personnage.nbDialogues} dialogues`;
          pdf.text(`• ${info}`, margin, currentY);
          currentY += 5;
        }
        currentY += 5;
      }
      
      // Dialogues complets
      if (this.resultatDetails.dialoguesComplets && this.resultatDetails.dialoguesComplets.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('💬 Dialogues complets', margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        for (const dialogue of this.resultatDetails.dialoguesComplets) {
          if (currentY > 250) {
            pdf.addPage();
            currentY = 20;
          }
          
          const dialogueText = `"${dialogue.texte}"`;
          const lines = pdf.splitTextToSize(`${dialogue.personnageNom || 'Narrateur'}: ${dialogueText}`, contentWidth);
          
          lines.forEach(line => {
            pdf.text(line, margin, currentY);
            currentY += 4;
          });
          
          if (dialogue.observation) {
            pdf.text(`💡 ${dialogue.observation}`, margin, currentY);
            currentY += 4;
          }
          
          currentY += 5;
        }
      }
    },
    
    // Export PDF pour les lieux (simplifié)
    async exporterPDFLieu(pdf, margin, yPosition, contentWidth) {
      let currentY = yPosition;
      
      // Informations du lieu
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🏛️ Informations du lieu', margin, currentY);
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Type : ${this.resultat.description ? this.getTypeFromDescription(this.resultat.description) : 'Non spécifié'}`, margin, currentY);
      currentY += 5;
      
      if (this.resultatDetails.informationsComplementaires?.adresse) {
        pdf.text(`Adresse : ${this.resultatDetails.informationsComplementaires.adresse}`, margin, currentY);
        currentY += 5;
      }
      currentY += 5;
      
      // Scènes associées
      if (this.resultatDetails.scenes && this.resultatDetails.scenes.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🎬 Scènes tournées ici', margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        for (const scene of this.resultatDetails.scenes.slice(0, 20)) { // Limiter à 20 scènes
          if (currentY > 250) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.text(`• ${scene.titre}`, margin, currentY);
          currentY += 4;
          pdf.text(`  Date: ${this.formatDate(scene.dateTournage)} | Statut: ${this.formatStatut(scene.statut)}`, margin, currentY);
          currentY += 4;
          pdf.text(`  Personnages: ${scene.nbPersonnages} | Heure: ${scene.heureDebut}-${scene.heureFin}`, margin, currentY);
          currentY += 6;
        }
      }
    },
    
    // Export PDF pour les plateaux (similaire aux lieux)
    async exporterPDFPlateau(pdf, margin, yPosition, contentWidth) {
      let currentY = yPosition;
      
      // Informations du plateau
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎭 Informations du plateau', margin, currentY);
      currentY += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Type : ${this.resultat.description ? this.getTypeFromDescription(this.resultat.description) : 'Non spécifié'}`, margin, currentY);
      currentY += 5;
      
      if (this.resultat.lieuNom) {
        pdf.text(`Lieu : ${this.resultat.lieuNom}`, margin, currentY);
        currentY += 5;
      }
      currentY += 5;
      
      // Scènes associées
      if (this.resultatDetails.scenes && this.resultatDetails.scenes.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🎬 Scènes tournées ici', margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        for (const scene of this.resultatDetails.scenes.slice(0, 20)) {
          if (currentY > 250) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.text(`• ${scene.titre}`, margin, currentY);
          currentY += 4;
          pdf.text(`  Date: ${this.formatDate(scene.dateTournage)} | Statut: ${this.formatStatut(scene.statut)}`, margin, currentY);
          currentY += 4;
          pdf.text(`  Dialogues: ${scene.nbDialogues} | Heure: ${scene.heureDebut}-${scene.heureFin}`, margin, currentY);
          currentY += 6;
        }
      }
    },
    
    // Méthodes utilitaires
    getTypeIcon(type) {
      const icons = {
        scene: '🎬',
        personnage: '👤',
        lieu: '🏛️',
        plateau: '🎭'
      }
      return icons[type] || '📄'
    },
    
    getTypeLabel(type) {
      const labels = {
        scene: 'Scène',
        personnage: 'Personnage',
        lieu: 'Lieu',
        plateau: 'Plateau'
      }
      return labels[type] || type
    },
    
    formatDate(date) {
      if (!date) return 'Non spécifiée'
      try {
        return new Date(date).toLocaleDateString('fr-FR')
      } catch (error) {
        return 'Date invalide'
      }
    },
    
    formatDateTime(dateTime) {
      if (!dateTime) return 'Non spécifié'
      try {
        return new Date(dateTime).toLocaleString('fr-FR')
      } catch (error) {
        return 'Date invalide'
      }
    },
    
    formatStatut(statut) {
      const statuts = {
        'planifie': 'Planifié',
        'confirme': 'Confirmé',
        'en_cours': 'En cours',
        'termine': 'Terminé',
        'reporte': 'Reporté',
        'annule': 'Annulé',
        'tourne': 'Tourné',
        'monte': 'Monté',
        'valide': 'Validé',
        'a_planifier': 'À planifier'
      }
      return statuts[statut] || statut
    },
    
    formatTypes(types) {
      const labels = {
        'scenes': 'Scènes',
        'personnages': 'Personnages', 
        'lieux': 'Lieux',
        'plateaux': 'Plateaux'
      }
      return types.map(type => labels[type] || type).join(', ')
    },
    
    calculerDureeScene(debut, fin) {
      if (!debut || !fin) return 'Non spécifiée'
      try {
        const [debutHeures, debutMinutes] = debut.split(':').map(Number)
        const [finHeures, finMinutes] = fin.split(':').map(Number)
        
        const debutTotalMinutes = debutHeures * 60 + debutMinutes
        const finTotalMinutes = finHeures * 60 + finMinutes
        const dureeMinutes = finTotalMinutes - debutTotalMinutes
        
        if (dureeMinutes <= 0) return 'Non spécifiée'
        
        const heures = Math.floor(dureeMinutes / 60)
        const minutes = dureeMinutes % 60
        
        if (heures > 0) {
          return `${heures}h ${minutes}min`
        } else {
          return `${minutes}min`
        }
      } catch (error) {
        return 'Non spécifiée'
      }
    },
    
    compterMots(texte) {
      if (!texte) return 0
      return texte.split(/\s+/).filter(word => word.length > 0).length
    },
    
    compterMotsDialoguesComplets(dialogues) {
      if (!dialogues) return 0
      return dialogues.reduce((total, dialogue) => total + this.compterMots(dialogue.texte), 0)
    },
    
    compterMotsDialoguesPersonnage(dialogues) {
      if (!dialogues) return 0
      return dialogues.reduce((total, dialogue) => total + this.compterMots(dialogue.texte), 0)
    },
    
    estimerDuree(texte) {
      const mots = this.compterMots(texte)
      const minutes = Math.ceil(mots / 150)
      return minutes > 0 ? `${minutes}min` : '< 1min'
    },
    
    estimerDureeDialoguesComplets(dialogues) {
      const totalMots = this.compterMotsDialoguesComplets(dialogues)
      const minutes = Math.ceil(totalMots / 150)
      return minutes > 60 
        ? `${Math.floor(minutes / 60)}h ${minutes % 60}min`
        : `${minutes}min`
    },
    
    estimerDureeDialoguesPersonnage(dialogues) {
      const totalMots = this.compterMotsDialoguesPersonnage(dialogues)
      const minutes = Math.ceil(totalMots / 150)
      return minutes > 60 
        ? `${Math.floor(minutes / 60)}h ${minutes % 60}min`
        : `${minutes}min`
    },
    
    getTypeFromDescription(description) {
      if (!description) return 'Non spécifié'
      if (description.toLowerCase().includes('intérieur')) return 'Intérieur'
      if (description.toLowerCase().includes('extérieur')) return 'Extérieur'
      if (description.toLowerCase().includes('studio')) return 'Studio'
      return 'Non spécifié'
    },
    
    trierDialogues() {
      this.pageDialogues = 1
    }
  },
  watch: {
    '$route.params': {
      handler: 'chargerDetails',
      deep: true
    },
    rechercheDialogue() {
      this.pageDialogues = 1
    }
  }
}
</script>


