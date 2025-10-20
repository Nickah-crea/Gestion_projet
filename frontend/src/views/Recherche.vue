<template>
  <div class="recherche-avancee">
    <!-- En-tête -->
    <div class="header">
      <h1>🔍 Recherche Avancée</h1>
      <p>Trouvez des scènes, personnages, lieux et plateaux selon vos critères</p>
    </div>

    <!-- Formulaire de recherche -->
    <div class="search-form">
      <div class="form-card">
        <!-- Terme de recherche principal -->
        <div class="form-group">
          <label for="termeRecherche">Mot-clé :</label>
          <input
            id="termeRecherche"
            v-model="criteres.termeRecherche"
            type="text"
            placeholder="Rechercher des personnages, lieux, dialogues..."
            class="search-input"
          />
        </div>

        <!-- Types de recherche -->
        <div class="form-group">
          <label>Types à rechercher :</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input
                v-model="criteres.typesRecherche"
                type="checkbox"
                value="scenes"
              />
              🎬 Scènes
            </label>
            <label class="checkbox-label">
              <input
                v-model="criteres.typesRecherche"
                type="checkbox"
                value="personnages"
              />
              👥 Personnages
            </label>
            <label class="checkbox-label">
              <input
                v-model="criteres.typesRecherche"
                type="checkbox"
                value="lieux"
              />
              🏛️ Lieux
            </label>
            <label class="checkbox-label">
              <input
                v-model="criteres.typesRecherche"
                type="checkbox"
                value="plateaux"
              />
              🎭 Plateaux
            </label>
          </div>
        </div>

        <!-- Période de tournage -->
        <div class="form-row">
          <div class="form-group">
            <label for="dateDebut">Date de début :</label>
            <input
              id="dateDebut"
              v-model="criteres.dateDebut"
              type="date"
              class="date-input"
            />
          </div>
          <div class="form-group">
            <label for="dateFin">Date de fin :</label>
            <input
              id="dateFin"
              v-model="criteres.dateFin"
              type="date"
              class="date-input"
            />
          </div>
        </div>

        <!-- Statuts -->
        <div class="form-group">
          <label>Statuts des scènes :</label>
          <div class="checkbox-group">
            <label
              v-for="statut in statutsDisponibles"
              :key="statut"
              class="checkbox-label"
            >
              <input
                v-model="criteres.statuts"
                type="checkbox"
                :value="statut"
              />
              {{ formatStatut(statut) }}
            </label>
          </div>
        </div>

        <!-- Regroupement -->
        <div class="form-group">
          <label for="regroupement">Regrouper par :</label>
          <select
            id="regroupement"
            v-model="criteres.regroupement"
            class="select-input"
          >
            <option value="">Aucun regroupement</option>
            <option value="plateau">🎭 Plateau</option>
            <option value="lieu">🏛️ Lieu</option>
            <option value="personnage">👥 Personnage</option>
            <option value="statut">📊 Statut</option>
          </select>
        </div>

        <!-- Boutons d'action -->
        <div class="form-actions">
          <button @click="rechercher" class="btn-primary" :disabled="chargement">
            {{ chargement ? 'Recherche en cours...' : '🔍 Lancer la recherche' }}
          </button>
          <button @click="reinitialiser" class="btn-secondary">
            🗑️ Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Résultats -->
    <div class="results-section">
      <div v-if="resultats.length === 0 && !chargement" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Aucun résultat</h3>
        <p>Utilisez le formulaire ci-dessus pour lancer une recherche</p>
      </div>

      <div v-else-if="chargement" class="loading-state">
        <div class="spinner"></div>
        <p>Recherche en cours...</p>
      </div>

      <div v-else class="results-container">
        <div class="results-header">
          <h2>📋 Résultats ({{ resultats.length }})</h2>
          <div class="results-info">
            Groupés par : <strong>{{ getRegroupementLabel() }}</strong>
          </div>
        </div>

        <!-- Liste des résultats groupés -->
        <div class="results-list">
          <div
            v-for="(groupe, index) in resultatsGroupes"
            :key="index"
            class="result-group"
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
              class="result-item"
              :class="'type-' + resultat.type"
            >
              <!-- Lien vers la page de détails -->
              <router-link 
                :to="getDetailLink(resultat)"
                class="result-link"
              >
                <div class="result-content">
                  
                  <!-- Scène -->
                  <div v-if="resultat.type === 'scene'" class="scene-result">
                    <div class="result-header">
                      <span class="result-type-badge scene-badge">🎬 Scène</span>
                      <h3 class="result-title">{{ resultat.titre }}</h3>
                      <span class="result-status" :class="'status-' + resultat.statut">
                        {{ formatStatut(resultat.statut) }}
                      </span>
                    </div>
                    
                    <div class="result-details">
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
                    <div v-if="resultat.dialogues && resultat.dialogues.length > 0" class="dialogues-section">
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
                    <div class="hierarchy">
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
                    <div class="result-header">
                      <span class="result-type-badge personnage-badge">👥 Personnage</span>
                      <h3 class="result-title">{{ resultat.titre }}</h3>
                    </div>
                    <div class="result-details">
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
                    <div class="result-header">
                      <span class="result-type-badge lieu-badge">🏛️ Lieu</span>
                      <h3 class="result-title">{{ resultat.titre }}</h3>
                    </div>
                    <div class="result-details">
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
                    <div class="result-header">
                      <span class="result-type-badge plateau-badge">🎭 Plateau</span>
                      <h3 class="result-title">{{ resultat.titre }}</h3>
                    </div>
                    <div class="result-details">
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
import { rechercheAvancee, getStatutsDisponibles } from '../service/rechercheService'

export default {
  name: 'RechercheAvancee',
  data() {
    return {
      criteres: {
        termeRecherche: '',
        typesRecherche: ['scenes', 'personnages', 'lieux', 'plateaux'],
        dateDebut: null,
        dateFin: null,
        statuts: [],
        regroupement: '',
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
    await this.chargerStatuts()
  },
  methods: {
    async chargerStatuts() {
      try {
        this.statutsDisponibles = await getStatutsDisponibles()
      } catch (error) {
        console.error('Erreur chargement statuts:', error)
        this.statutsDisponibles = ['planifie', 'confirme', 'en_cours', 'termine', 'reporte']
      }
    },
    async rechercher() {
      this.chargement = true
      try {
        // Nettoyer les critères vides
        const criteresNettoyes = { ...this.criteres }
        if (!criteresNettoyes.termeRecherche) delete criteresNettoyes.termeRecherche
        if (criteresNettoyes.statuts.length === 0) delete criteresNettoyes.statuts
        if (!criteresNettoyes.regroupement) delete criteresNettoyes.regroupement

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
        page: 0,
        taille: 50
      }
      this.resultats = []
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
    // NOUVELLE MÉTHODE : Générer le lien vers la page de détails
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

<style scoped>
.recherche-avancee {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 1.1em;
}

/* Formulaire */
.search-form {
  margin-bottom: 40px;
}

.form-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.form-group {
  margin-bottom: 25px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.search-input, .date-input, .select-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus, .date-input:focus, .select-input:focus {
  outline: none;
  border-color: #3498db;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background-color: #f8f9fa;
}

.checkbox-label input {
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

/* Résultats */
.results-section {
  min-height: 400px;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e1e8ed;
}

.results-info {
  color: #7f8c8d;
  font-size: 14px;
}

/* Groupes */
.result-group {
  margin-bottom: 30px;
}

.group-header {
  padding: 15px 20px;
  margin-bottom: 15px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-header-plateau { background: #e8f4fd; color: #2980b9; border-left: 4px solid #3498db; }
.group-header-lieu { background: #e8f6f3; color: #27ae60; border-left: 4px solid #2ecc71; }
.group-header-personnage { background: #fef9e7; color: #f39c12; border-left: 4px solid #f1c40f; }
.group-header-statut { background: #f4ecf7; color: #8e44ad; border-left: 4px solid #9b59b6; }

.group-icon {
  font-size: 18px;
}

.group-count {
  font-weight: normal;
  opacity: 0.8;
}

/* Items de résultat */
.result-item {
  background: white;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e8ed;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 3px solid transparent;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  background-color: #f8f9fa;
}

/* NOUVEAU CSS : Styles pour les liens */
.result-link {
  text-decoration: none;
  color: inherit;
  display: block;
  padding: 20px;
}

.result-content {
  transition: all 0.3s ease;
}

/* Indicateur de clic */
.view-details {
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px dashed #e1e8ed;
  text-align: right;
}

.view-details-text {
  color: #3498db;
  font-size: 0.9em;
  font-weight: 600;
  transition: color 0.3s;
}

.result-link:hover .view-details-text {
  color: #2980b9;
}

/* En-tête des résultats */
.result-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.result-type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.scene-badge { background: #e8f4fd; color: #2980b9; }
.personnage-badge { background: #fef9e7; color: #f39c12; }
.lieu-badge { background: #e8f6f3; color: #27ae60; }
.plateau-badge { background: #f4ecf7; color: #8e44ad; }

.result-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2em;
}

.result-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-planifie { background: #fff3cd; color: #856404; }
.status-confirme { background: #cce7ff; color: #004085; }
.status-en_cours { background: #fff3cd; color: #856404; }
.status-termine { background: #d4edda; color: #155724; }
.status-reporte { background: #f8d7da; color: #721c24; }

.result-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.detail-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
}

.comedien {
  color: #7f8c8d;
  font-style: italic;
}

/* Dialogues */
.dialogues-section {
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.dialogues-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #2c3e50;
}

.dialogue-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #3498db;
  font-style: italic;
}

/* Hiérarchie */
.hierarchy {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e1e8ed;
}

.hierarchy-item {
  font-size: 12px;
  color: #7f8c8d;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .recherche-avancee {
    padding: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .hierarchy {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

