<template>
  <div class="app-wrapper-global">
    <!-- Sidebar latérale à gauche -->
    <div class="sidebar-right-resultat-recherche">
      <div class="sidebar-header-resultat-recherche">
        <h3 class="sidebar-title-resultat-recherche">
          <i class="fas fa-info-circle"></i>
          Informations
        </h3>
      </div>

      <!-- Section Critères de recherche -->
      <div class="sidebar-section-resultat-recherche">
        <h4 class="section-title-resultat-recherche">
          <i class="fas fa-search"></i>
          Critères utilisés
        </h4>
        <div class="criteria-sidebar-list-resultat-recherche">
          <div v-if="criteresRecherche?.termeRecherche" class="criterion-sidebar-resultat-recherche">
            <span class="criterion-label-sidebar-resultat-recherche">Mot-clé :</span>
            <span class="criterion-value-sidebar-resultat-recherche">{{ criteresRecherche.termeRecherche }}</span>
          </div>
          <div v-if="criteresRecherche?.typesRecherche && criteresRecherche.typesRecherche.length" class="criterion-sidebar-resultat-recherche">
            <span class="criterion-label-sidebar-resultat-recherche">Types :</span>
            <span class="criterion-value-sidebar-resultat-recherche">{{ formatTypes(criteresRecherche.typesRecherche) }}</span>
          </div>
          <div v-if="criteresRecherche?.dateDebut || criteresRecherche?.dateFin" class="criterion-sidebar-resultat-recherche">
            <span class="criterion-label-sidebar-resultat-recherche">Période :</span>
            <span class="criterion-value-sidebar-resultat-recherche">
              {{ formatDate(criteresRecherche.dateDebut) || 'Début' }}
              → 
              {{ formatDate(criteresRecherche.dateFin) || 'Fin' }}
            </span>
          </div>
          <div v-if="criteresRecherche?.statuts && criteresRecherche.statuts.length" class="criterion-sidebar-resultat-recherche">
            <span class="criterion-label-sidebar-resultat-recherche">Statuts :</span>
            <span class="criterion-value-sidebar-resultat-recherche">{{ criteresRecherche.statuts.join(', ') }}</span>
          </div>
          <div v-if="!criteresRecherche" class="no-criteria-resultat-recherche">
            <i class="fas fa-info"></i>
            <span>Aucun critère spécifique</span>
          </div>
        </div>
      </div>

      <!-- Section Actions rapides -->
      <div class="sidebar-section-resultat-recherche">
        <h4 class="section-title-resultat-recherche">
          <i class="fas fa-bolt"></i>
          Actions rapides
        </h4>
        <div class="quick-actions-resultat-recherche">
          <button @click="exporterPDF" class="quick-action-btn-resultat-recherche" :disabled="exportEnCours">
            <i class="fas" :class="exportEnCours ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i>
            PDF
          </button>
          <button @click="ouvrirDialogueEmail" class="quick-action-btn-resultat-recherche" :disabled="exportEnCours">
            <i class="fas" :class="exportEnCours ? 'fa-spinner fa-spin' : 'fa-envelope'"></i>
            Email
          </button>
          <button @click="naviguerVersEcranTravail" class="quick-action-btn-resultat-recherche">
            <i class="fas fa-external-link-alt"></i>
            Projet
          </button>
          <button @click="copierLien" class="quick-action-btn-resultat-recherche">
            <i class="fas fa-link"></i>
            Lien
          </button>
        </div>
      </div>

      <!-- Section Structure du projet -->
      <div v-if="resultat" class="sidebar-section-resultat-recherche">
        <h4 class="section-title-resultat-recherche">
          <i class="fas fa-sitemap"></i>
          Structure du projet
        </h4>
        <div class="project-structure-resultat-recherche">
          <div v-if="resultat.projetTitre" class="structure-item-resultat-recherche">
            <i class="fas fa-folder structure-icon-resultat-recherche"></i>
            <div class="structure-info-resultat-recherche">
              <span class="structure-type-resultat-recherche">Projet</span>
              <span class="structure-name-resultat-recherche">{{ resultat.projetTitre }}</span>
            </div>
          </div>
          <div v-if="resultat.episodeTitre" class="structure-item-resultat-recherche">
            <i class="fas fa-play-circle structure-icon-resultat-recherche"></i>
            <div class="structure-info-resultat-recherche">
              <span class="structure-type-resultat-recherche">Épisode</span>
              <span class="structure-name-resultat-recherche">{{ resultat.episodeTitre }}</span>
            </div>
          </div>
          <div v-if="resultat.sequenceTitre" class="structure-item-resultat-recherche">
            <i class="fas fa-layer-group structure-icon-resultat-recherche"></i>
            <div class="structure-info-resultat-recherche">
              <span class="structure-type-resultat-recherche">Séquence</span>
              <span class="structure-name-resultat-recherche">{{ resultat.sequenceTitre }}</span>
            </div>
          </div>
          <div v-if="!resultat.projetTitre && !resultat.episodeTitre && !resultat.sequenceTitre" class="no-structure-resultat-recherche">
            <i class="fas fa-info"></i>
            <span>Structure non disponible</span>
          </div>
        </div>
      </div>

      <!-- Section Métadonnées -->
      <div v-if="resultat" class="sidebar-section-resultat-recherche">
        <h4 class="section-title-resultat-recherche">
          <i class="fas fa-database"></i>
          Métadonnées
        </h4>
        <div class="metadata-list-resultat-recherche">
          <div class="metadata-item-resultat-recherche">
            <span class="metadata-label-resultat-recherche">Type :</span>
            <span class="metadata-value-resultat-recherche">
              <span class="type-badge-small-resultat-recherche" :class="'type-' + resultat.type">
                {{ getTypeLabel(resultat.type) }}
              </span>
            </span>
          </div>
          <div class="metadata-item-resultat-recherche">
            <span class="metadata-label-resultat-recherche">ID :</span>
            <span class="metadata-value-resultat-recherche">{{ resultat.id }}</span>
          </div>
          <div class="metadata-item-resultat-recherche">
            <span class="metadata-label-resultat-recherche">Modifié le :</span>
            <span class="metadata-value-resultat-recherche">{{ formatDateTime(resultat.modifieLe) }}</span>
          </div>
          <div v-if="resultat.statut" class="metadata-item-resultat-recherche">
            <span class="metadata-label-resultat-recherche">Statut :</span>
            <span class="metadata-value-resultat-recherche">
              <span class="status-badge-small-resultat-recherche" :class="'status-' + resultat.statut">
                {{ formatStatut(resultat.statut) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal à droite -->
    <div class="main-content-resultat-recherche">
      <div class="resultat-recherche-container">
        <!-- En-tête avec navigation -->
        <div class="header-resultat-recherche">
          <router-link to="/recherche" class="back-link-resultat-recherche">
            <i class="fas fa-arrow-left"></i> Retour aux résultats
          </router-link>
          <h1 class="page-title-resultat-recherche">
            <i class="fas fa-file-alt"></i> Détails du résultat
          </h1>
          <div v-if="resultat" class="result-type-header-resultat-recherche" :class="'type-' + resultat.type">
            <div class="type-badge-resultat-recherche">
              <span class="type-icon-resultat-recherche">{{ getTypeIcon(resultat.type) }}</span>
              <span class="type-label-resultat-recherche">{{ getTypeLabel(resultat.type) }}</span>
            </div>
            
            <!-- Boutons d'export séparés -->
            <div class="export-buttons-resultat-recherche">
              <button @click="naviguerVersEcranTravail" class="btn-ecran-travail-resultat-recherche">
                <i class="fas fa-external-link-alt"></i>
                {{ getEcranTravailButtonText() }}
              </button>
              
              <button @click="exporterPDF" class="btn-export-pdf-resultat-recherche" :disabled="exportEnCours">
                <i class="fas" :class="exportEnCours ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i>
                {{ exportEnCours ? 'Génération...' : 'Télécharger PDF' }}
              </button>
              <button @click="ouvrirDialogueEmail" class="btn-send-email-resultat-recherche" :disabled="exportEnCours">
                <i class="fas" :class="exportEnCours ? 'fa-spinner fa-spin' : 'fa-envelope'"></i>
                {{ exportEnCours ? 'Envoi...' : 'Envoyer par email' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Dialogue d'envoi d'email -->
        <div v-if="emailDialogVisible" class="modal-overlay-resultat-recherche">
          <div class="modal-content-resultat-recherche">
            <div class="modal-header-resultat-recherche">
              <h3>
                <i class="fas fa-envelope"></i>
                Envoyer le PDF par email
              </h3>
              <button @click="fermerDialogueEmail" class="modal-close-btn-resultat-recherche">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="modal-body-resultat-recherche">
              <!-- Destinataires multiples -->
              <div class="form-group-resultat-recherche">
                <label for="toEmail">Destinataires *</label>
                <div class="emails-input-container-resultat-recherche">
                  <div class="email-tags-resultat-recherche">
                    <span 
                      v-for="(email, index) in emailForm.toEmails" 
                      :key="index" 
                      class="email-tag-resultat-recherche"
                    >
                      {{ email }}
                      <button 
                        type="button" 
                        @click="supprimerEmail(index)" 
                        class="email-tag-remove-resultat-recherche"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </span>
                  </div>
                  <input
                    id="toEmail"
                    v-model="nouvelEmail"
                    type="email"
                    placeholder="Ajouter un email (exemple@email.com)"
                    class="email-input-multiple-resultat-recherche"
                    @keydown.enter="ajouterEmail"
                    @blur="ajouterEmail"
                  />
                </div>
                <small class="help-text-resultat-recherche">
                  Appuyez sur Entrée, Tab ou cliquez en dehors pour ajouter un email
                </small>
              </div>
              
              <div class="form-group-resultat-recherche">
                <label for="subject">Sujet</label>
                <input
                  id="subject"
                  v-model="emailForm.subject"
                  type="text"
                  class="form-input-resultat-recherche"
                />
              </div>
              
              <div class="form-group-resultat-recherche">
                <label for="message">Message</label>
                <textarea
                  id="message"
                  v-model="emailForm.message"
                  rows="4"
                  class="form-textarea-resultat-recherche"
                ></textarea>
              </div>

              <!-- Liste des destinataires -->
              <div v-if="emailForm.toEmails.length > 0" class="destinataires-list-resultat-recherche">
                <h4>Destinataires ({{ emailForm.toEmails.length }}) :</h4>
                <ul class="emails-list-resultat-recherche">
                  <li v-for="(email, index) in emailForm.toEmails" :key="index" class="email-item-resultat-recherche">
                    <span class="email-address-resultat-recherche">{{ email }}</span>
                    <button 
                      type="button" 
                      @click="supprimerEmail(index)" 
                      class="email-remove-btn-resultat-recherche"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="modal-footer-resultat-recherche">
              <button 
                @click="fermerDialogueEmail" 
                class="cancel-btn-resultat-recherche"
                :disabled="exportEnCours"
              >
                Annuler
              </button>
              <button 
                @click="envoyerEmailAvecPDF" 
                class="submit-btn-resultat-recherche"
                :disabled="exportEnCours || emailForm.toEmails.length === 0"
              >
                <i class="fas" :class="exportEnCours ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                {{ exportEnCours ? 'Envoi en cours...' : `Envoyer à ${emailForm.toEmails.length} personne(s)` }}
              </button>
            </div>
          </div>
        </div>

        <!-- Chargement -->
        <div v-if="chargement" class="loading-state-resultat-recherche">
          <i class="fas fa-spinner fa-spin"></i>
          <h3>Chargement des détails...</h3>
          <p>Veuillez patienter</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="erreur" class="error-state-resultat-recherche">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Erreur de chargement</h3>
          <p>{{ erreur }}</p>
          <button @click="chargerDetails" class="btn-retry-resultat-recherche">
            <i class="fas fa-redo"></i> Réessayer
          </button>
        </div>

        <!-- Affichage des détails en cartes individuelles -->
        <div v-else-if="resultat" class="details-container-resultat-recherche">
          
          <!-- Carte Informations principales -->
          <div class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h2 class="result-title-resultat-recherche">{{ resultat.titre }}</h2>
              <div class="header-actions-resultat-recherche">
                <span class="last-modified-resultat-recherche">
                  <i class="fas fa-calendar-alt"></i>
                  Modifié le : {{ formatDateTime(resultat.modifieLe) }}
                </span>
              </div>
            </div>
            <div class="card-content-resultat-recherche">
              <!-- Contenu selon le type -->
              <div v-if="resultat.type === 'scene'" class="scene-details-resultat-recherche">
                <!-- Informations de base pour scène -->
                <div class="detail-section-resultat-recherche">
                  <div class="details-grid-resultat-recherche">
                    <div class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-calendar"></i> Date :</span>
                      <span class="detail-value-resultat-recherche">{{ formatDate(resultat.dateTournage) }}</span>
                    </div>
                    <div class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-clock"></i> Heure début :</span>
                      <span class="detail-value-resultat-recherche">{{ resultat.heureDebut || 'Non spécifiée' }}</span>
                    </div>
                    <div class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-clock"></i> Heure fin :</span>
                      <span class="detail-value-resultat-recherche">{{ resultat.heureFin || 'Non spécifiée' }}</span>
                    </div>
                    <div class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-chart-bar"></i> Statut :</span>
                      <span class="detail-value-resultat-recherche status-badge-resultat-recherche" :class="'status-' + resultat.statut">
                        {{ formatStatut(resultat.statut) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="resultat.type === 'personnage'" class="personnage-details-resultat-recherche">
                <!-- Informations de base pour personnage -->
                <div class="detail-section-resultat-recherche">
                  <div class="details-grid-resultat-recherche">
                    <div class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-theater-masks"></i> Comédien :</span>
                      <span class="detail-value-resultat-recherche">{{ resultat.comedienNom || 'Non spécifié' }}</span>
                    </div>
                    <div v-if="resultatDetails.informationsComplementaires?.age" class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-birthday-cake"></i> Âge :</span>
                      <span class="detail-value-resultat-recherche">{{ resultatDetails.informationsComplementaires.age }}</span>
                    </div>
                    <div v-if="resultatDetails.informationsComplementaires?.typePersonnage" class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-tag"></i> Type :</span>
                      <span class="detail-value-resultat-recherche">{{ resultatDetails.informationsComplementaires.typePersonnage }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="resultat.type === 'lieu'" class="lieu-details-resultat-recherche">
                <!-- Informations de base pour lieu -->
                <div class="detail-section-resultat-recherche">
                  <div class="details-grid-resultat-recherche">
                    <div class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-tag"></i> Type :</span>
                      <span class="detail-value-resultat-recherche">{{ resultat.description ? getTypeFromDescription(resultat.description) : 'Non spécifié' }}</span>
                    </div>
                    <div v-if="resultatDetails.informationsComplementaires?.adresse" class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-map-marker-alt"></i> Adresse :</span>
                      <span class="detail-value-resultat-recherche">{{ resultatDetails.informationsComplementaires.adresse }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="resultat.type === 'plateau'" class="plateau-details-resultat-recherche">
                <!-- Informations de base pour plateau -->
                <div class="detail-section-resultat-recherche">
                  <div class="details-grid-resultat-recherche">
                    <div class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-tag"></i> Type :</span>
                      <span class="detail-value-resultat-recherche">{{ resultat.description ? getTypeFromDescription(resultat.description) : 'Non spécifié' }}</span>
                    </div>
                    <div v-if="resultat.lieuNom" class="detail-item-resultat-recherche">
                      <span class="detail-label-resultat-recherche"><i class="fas fa-landmark"></i> Lieu :</span>
                      <span class="detail-value-resultat-recherche">{{ resultat.lieuNom }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Informations de tournage (pour les scènes) -->
          <div v-if="resultat.type === 'scene'" class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-film"></i> Informations de tournage</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="details-grid-resultat-recherche">
                <div class="detail-item-resultat-recherche">
                  <span class="detail-label-resultat-recherche"><i class="fas fa-hourglass-half"></i> Durée estimée :</span>
                  <span class="detail-value-resultat-recherche">{{ calculerDureeScene(resultat.heureDebut, resultat.heureFin) }}</span>
                </div>
                <div v-if="resultat.lieuNom" class="detail-item-resultat-recherche">
                  <span class="detail-label-resultat-recherche"><i class="fas fa-landmark"></i> Lieu :</span>
                  <span class="detail-value-resultat-recherche">{{ resultat.lieuNom }}</span>
                </div>
                <div v-if="resultat.plateauNom" class="detail-item-resultat-recherche">
                  <span class="detail-label-resultat-recherche"><i class="fas fa-theater-masks"></i> Plateau :</span>
                  <span class="detail-value-resultat-recherche">{{ resultat.plateauNom }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Synopsis/Description -->
          <div v-if="resultat.description" class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3 v-if="resultat.type === 'scene'"><i class="fas fa-align-left"></i> Synopsis</h3>
              <h3 v-else><i class="fas fa-align-left"></i> Description</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="description-content-resultat-recherche">
                {{ resultat.description }}
              </div>
            </div>
          </div>

          <!-- Carte Dialogues (pour TOUS les types) -->
          <div v-if="resultat.dialogues && resultat.dialogues.length > 0" class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-comments"></i> Dialogues associés ({{ resultat.dialogues.length }})</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="dialogues-list-compact-resultat-recherche">
                <div
                  v-for="(dialogue, index) in resultat.dialogues.slice(0, 10)"
                  :key="index"
                  class="dialogue-compact-item-resultat-recherche"
                >
                  <span class="dialogue-text-compact-resultat-recherche">"{{ dialogue }}"</span>
                </div>
              </div>
              
              <div v-if="resultat.dialogues.length > 10" class="dialogues-more-resultat-recherche">
                <p>... et {{ resultat.dialogues.length - 10 }} dialogues supplémentaires</p>
              </div>
            </div>
          </div>

          <!-- Carte Structure du projet -->
          <div class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-folder"></i> Structure du projet</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="hierarchy-path-resultat-recherche">
                <div v-if="resultat.projetTitre" class="hierarchy-level-resultat-recherche">
                  <span class="level-icon-resultat-recherche"><i class="fas fa-folder"></i></span>
                  <span class="level-label-resultat-recherche">Projet :</span>
                  <span class="level-value-resultat-recherche">{{ resultat.projetTitre }}</span>
                </div>
                <div v-if="resultat.episodeTitre" class="hierarchy-level-resultat-recherche">
                  <span class="level-icon-resultat-recherche"><i class="fas fa-play-circle"></i></span>
                  <span class="level-label-resultat-recherche">Épisode :</span>
                  <span class="level-value-resultat-recherche">{{ resultat.episodeTitre }}</span>
                </div>
                <div v-if="resultat.sequenceTitre" class="hierarchy-level-resultat-recherche">
                  <span class="level-icon-resultat-recherche"><i class="fas fa-layer-group"></i></span>
                  <span class="level-label-resultat-recherche">Séquence :</span>
                  <span class="level-value-resultat-recherche">{{ resultat.sequenceTitre }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Personnages impliqués -->
          <div v-if="resultatDetails.personnages && resultatDetails.personnages.length > 0" class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-users"></i> Personnages impliqués ({{ resultatDetails.personnages.length }})</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="personnages-detailed-list-resultat-recherche">
                <div
                  v-for="personnage in resultatDetails.personnages"
                  :key="personnage.id"
                  class="personnage-detailed-item-resultat-recherche"
                >
                  <div class="personnage-main-info-resultat-recherche">
                    <span class="personnage-nom-resultat-recherche">{{ personnage.nom }}</span>
                    <span v-if="personnage.comedien" class="personnage-comedien-resultat-recherche">
                      ({{ personnage.comedien }})
                    </span>
                  </div>
                  <div class="personnage-stats-resultat-recherche">
                    <span class="personnage-dialogues-resultat-recherche">{{ personnage.nbDialogues }} dialogues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Dialogues complets (SCÈNES) - PLEINE LARGEUR -->
          <div v-if="resultat.type === 'scene' && resultatDetails.dialoguesComplets && resultatDetails.dialoguesComplets.length > 0" 
               class="section-card-resultat-recherche dialogue-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-comments"></i> Dialogues complets ({{ resultatDetails.dialoguesComplets.length }})</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="dialogues-stats-resultat-recherche">
                <span class="stat-item-resultat-recherche"><i class="fas fa-chart-bar"></i> Total mots : {{ compterMotsDialoguesComplets(resultatDetails.dialoguesComplets) }}</span>
                <span class="stat-item-resultat-recherche"><i class="fas fa-clock"></i> Durée estimée : {{ estimerDureeDialoguesComplets(resultatDetails.dialoguesComplets) }}</span>
              </div>
              <div class="dialogues-complets-list-resultat-recherche">
                <div
                  v-for="(dialogue, index) in resultatDetails.dialoguesComplets"
                  :key="dialogue.id || index"
                  class="dialogue-complet-item-resultat-recherche"
                >
                  <div class="dialogue-header-resultat-recherche">
                    <span class="dialogue-personnage-resultat-recherche">
                      <strong>{{ dialogue.personnageNom || 'Narrateur' }}:</strong>
                    </span>
                    <span class="dialogue-ordre-resultat-recherche">#{{ dialogue.ordre || index + 1 }}</span>
                  </div>
                  <div class="dialogue-text-resultat-recherche">"{{ dialogue.texte }}"</div>
                  <div v-if="dialogue.observation" class="dialogue-observation-resultat-recherche">
                    <i class="fas fa-lightbulb"></i> {{ dialogue.observation }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Statistiques (pour personnages) -->
          <div v-if="resultat.type === 'personnage' && resultatDetails.statistiques" class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-chart-bar"></i> Statistiques</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="details-grid-resultat-recherche">
                <div v-if="resultatDetails.statistiques.nbScenes" class="detail-item-resultat-recherche">
                  <span class="detail-label-resultat-recherche"><i class="fas fa-film"></i> Scènes :</span>
                  <span class="detail-value-resultat-recherche">{{ resultatDetails.statistiques.nbScenes }}</span>
                </div>
                <div v-if="resultatDetails.statistiques.nbDialogues" class="detail-item-resultat-recherche">
                  <span class="detail-label-resultat-recherche"><i class="fas fa-comments"></i> Dialogues :</span>
                  <span class="detail-value-resultat-recherche">{{ resultatDetails.statistiques.nbDialogues }}</span>
                </div>
                <div v-if="resultatDetails.statistiques.totalMots" class="detail-item-resultat-recherche">
                  <span class="detail-label-resultat-recherche"><i class="fas fa-font"></i> Total mots :</span>
                  <span class="detail-value-resultat-recherche">{{ resultatDetails.statistiques.totalMots }}</span>
                </div>
                <div v-if="resultatDetails.statistiques.pourcentageDialogues" class="detail-item-resultat-recherche">
                  <span class="detail-label-resultat-recherche"><i class="fas fa-chart-line"></i> Part des dialogues :</span>
                  <span class="detail-value-resultat-recherche">{{ Math.round(resultatDetails.statistiques.pourcentageDialogues * 100) / 100 }}%</span>
                </div>
                <div v-if="resultatDetails.statistiques.dureeTotale" class="detail-item-resultat-recherche">
                  <span class="detail-label-resultat-recherche"><i class="fas fa-clock"></i> Durée totale :</span>
                  <span class="detail-value-resultat-recherche">{{ resultatDetails.statistiques.dureeTotale }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Planning de tournage (PERSONNAGES) -->
          <div v-if="resultat.type === 'personnage' && resultatDetails.scenes && resultatDetails.scenes.length > 0" class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-calendar-alt"></i> Planning de tournage des scènes</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="scenes-planning-list-resultat-recherche">
                <div
                  v-for="scene in scenesAvecPlanning"
                  :key="scene.id"
                  class="scene-planning-item-resultat-recherche"
                >
                  <div class="scene-planning-header-resultat-recherche">
                    <span class="scene-titre-resultat-recherche">{{ scene.titre }}</span>
                    <span class="scene-statut-resultat-recherche" :class="'status-' + (scene.statut || 'planifie')">
                      {{ formatStatut(scene.statut || 'planifie') }}
                    </span>
                  </div>
                  
                  <div class="scene-planning-details-resultat-recherche">
                    <div class="planning-info-grid-resultat-recherche">
                      <div class="planning-info-item-resultat-recherche">
                        <span class="detail-label-resultat-recherche"><i class="fas fa-calendar"></i> Date :</span>
                        <span class="detail-value-resultat-recherche">{{ formatDate(scene.dateTournage) }}</span>
                      </div>
                      <div class="planning-info-item-resultat-recherche">
                        <span class="detail-label-resultat-recherche"><i class="fas fa-clock"></i> Heure début :</span>
                        <span class="detail-value-resultat-recherche">{{ scene.heureDebut || 'Non spécifiée' }}</span>
                      </div>
                      <div class="planning-info-item-resultat-recherche">
                        <span class="detail-label-resultat-recherche"><i class="fas fa-clock"></i> Heure fin :</span>
                        <span class="detail-value-resultat-recherche">{{ scene.heureFin || 'Non spécifiée' }}</span>
                      </div>
                      <div class="planning-info-item-resultat-recherche">
                        <span class="detail-label-resultat-recherche"><i class="fas fa-hourglass-half"></i> Durée estimée :</span>
                        <span class="detail-value-resultat-recherche">{{ calculerDureeScene(scene.heureDebut, scene.heureFin) }}</span>
                      </div>
                    </div>
                    
                    <div class="scene-planning-location-resultat-recherche">
                      <span v-if="scene.lieuNom" class="location-item-resultat-recherche">
                        <i class="fas fa-landmark"></i>
                        {{ scene.lieuNom }}
                      </span>
                      <span v-if="scene.plateauNom" class="location-item-resultat-recherche">
                        <i class="fas fa-theater-masks"></i>
                        {{ scene.plateauNom }}
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="scene.nbDialogues" class="scene-dialogues-info-resultat-recherche">
                    <span class="dialogues-count-resultat-recherche"><i class="fas fa-comments"></i> {{ scene.nbDialogues }} dialogues dans cette scène</span>
                  </div>
                </div>
              </div>
              
              <div v-if="scenesAvecPlanning.length === 0" class="no-planning-resultat-recherche">
                <p><i class="fas fa-calendar"></i> Aucun planning de tournage disponible pour ce personnage</p>
              </div>
            </div>
          </div>

          <!-- Carte Tous les dialogues (PERSONNAGES) - PLEINE LARGEUR -->
          <div v-if="resultat.type === 'personnage' && resultatDetails.dialogues && resultatDetails.dialogues.length > 0" 
               class="section-card-resultat-recherche dialogue-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-comments"></i> Tous les dialogues ({{ resultatDetails.dialogues.length }})</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="dialogues-stats-resultat-recherche">
                <span class="stat-item-resultat-recherche"><i class="fas fa-chart-bar"></i> Total mots : {{ resultatDetails.statistiques?.totalMots || compterMotsDialoguesPersonnage(resultatDetails.dialogues) }}</span>
                <span class="stat-item-resultat-recherche"><i class="fas fa-clock"></i> Durée estimée : {{ estimerDureeDialoguesPersonnage(resultatDetails.dialogues) }}</span>
              </div>

              <!-- Filtres et tri -->
              <div class="dialogues-controls-resultat-recherche">
                <div class="filter-group-resultat-recherche">
                  <label>Trier par :</label>
                  <select v-model="triDialogues" @change="trierDialogues" class="form-select-resultat-recherche">
                    <option value="ordre">Ordre chronologique</option>
                    <option value="scene">Scène</option>
                    <option value="longueur">Longueur</option>
                  </select>
                </div>
                <div class="search-group-resultat-recherche">
                  <div class="search-input-container-resultat-recherche">
                    <i class="fas fa-search search-icon-resultat-recherche"></i>
                    <input 
                      v-model="rechercheDialogue" 
                      type="text" 
                      placeholder="Rechercher dans les dialogues..." 
                      class="search-input-resultat-recherche"
                    />
                  </div>
                </div>
              </div>

              <div class="dialogues-list-resultat-recherche">
                <div
                  v-for="(dialogue, index) in dialoguesFiltres"
                  :key="dialogue.id || index"
                  class="dialogue-item-resultat-recherche"
                >
                  <div class="dialogue-header-resultat-recherche">
                    <span class="dialogue-number-resultat-recherche">Dialogue #{{ index + 1 }}</span>
                    <span class="dialogue-context-resultat-recherche">
                      <strong>Scène:</strong> {{ dialogue.sceneTitre || 'Non spécifiée' }}
                      <span v-if="dialogue.sequenceTitre"> • <strong>Séquence:</strong> {{ dialogue.sequenceTitre }}</span>
                      <span v-if="dialogue.episodeTitre"> • <strong>Épisode:</strong> {{ dialogue.episodeTitre }}</span>
                    </span>
                  </div>
                  
                  <div class="dialogue-text-resultat-recherche">"{{ dialogue.texte }}"</div>
                  
                  <div class="dialogue-footer-resultat-recherche">
                    <span class="dialogue-info-resultat-recherche">
                      <i class="fas fa-font"></i> {{ compterMots(dialogue.texte) }} mots • <i class="fas fa-clock"></i> {{ estimerDuree(dialogue.texte) }}
                    </span>
                    <span v-if="dialogue.observation" class="dialogue-observation-resultat-recherche">
                      <i class="fas fa-lightbulb"></i> {{ dialogue.observation }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="dialoguesFiltres.length > 10" class="pagination-resultat-recherche">
                <button @click="pageDialogues--" :disabled="pageDialogues === 1" class="pagination-btn-resultat-recherche">
                  <i class="fas fa-chevron-left"></i> Précédent
                </button>
                <span>Page {{ pageDialogues }} sur {{ totalPagesDialogues }}</span>
                <button @click="pageDialogues++" :disabled="pageDialogues === totalPagesDialogues" class="pagination-btn-resultat-recherche">
                  Suivant <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Carte Scènes associées (LIEUX et PLATEAUX) -->
          <div v-if="(resultat.type === 'lieu' || resultat.type === 'plateau') && resultatDetails.scenes && resultatDetails.scenes.length > 0" class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-film"></i> Scènes tournées ici ({{ resultatDetails.scenes.length }})</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="scenes-list-resultat-recherche">
                <div
                  v-for="scene in resultatDetails.scenes"
                  :key="scene.id"
                  class="scene-item-resultat-recherche"
                >
                  <div class="scene-header-resultat-recherche">
                    <span class="scene-titre-resultat-recherche">{{ scene.titre }}</span>
                    <span class="scene-statut-resultat-recherche" :class="'status-' + scene.statut">
                      {{ formatStatut(scene.statut) }}
                    </span>
                  </div>
                  <div class="scene-details-resultat-recherche">
                    <span class="scene-date-resultat-recherche"><i class="fas fa-calendar"></i> {{ formatDate(scene.dateTournage) }}</span>
                    <span class="scene-heure-resultat-recherche"><i class="fas fa-clock"></i> {{ scene.heureDebut }} - {{ scene.heureFin }}</span>
                    <span v-if="resultat.type === 'lieu'" class="scene-personnages-resultat-recherche"><i class="fas fa-users"></i> {{ scene.nbPersonnages }} pers.</span>
                    <span v-if="resultat.type === 'plateau'" class="scene-dialogues-resultat-recherche"><i class="fas fa-comments"></i> {{ scene.nbDialogues }} dialogues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Critères de recherche -->
          <!-- <div v-if="criteresRecherche" class="section-card-resultat-recherche">
            <div class="card-header-resultat-recherche">
              <h3><i class="fas fa-search"></i> Critères de recherche utilisés</h3>
            </div>
            <div class="card-content-resultat-recherche">
              <div class="criteria-list-resultat-recherche">
                <div v-if="criteresRecherche.termeRecherche" class="criterion-resultat-recherche">
                  <span class="criterion-label-resultat-recherche">Mot-clé :</span>
                  <span class="criterion-value-resultat-recherche">{{ criteresRecherche.termeRecherche }}</span>
                </div>
                <div v-if="criteresRecherche.typesRecherche && criteresRecherche.typesRecherche.length" class="criterion-resultat-recherche">
                  <span class="criterion-label-resultat-recherche">Types recherchés :</span>
                  <span class="criterion-value-resultat-recherche">{{ formatTypes(criteresRecherche.typesRecherche) }}</span>
                </div>
                <div v-if="criteresRecherche.dateDebut || criteresRecherche.dateFin" class="criterion-resultat-recherche">
                  <span class="criterion-label-resultat-recherche">Période :</span>
                  <span class="criterion-value-resultat-recherche">
                    {{ formatDate(criteresRecherche.dateDebut) || 'Début non spécifié' }}
                    → 
                    {{ formatDate(criteresRecherche.dateFin) || 'Fin non spécifiée' }}
                  </span>
                </div>
                <div v-if="criteresRecherche.statuts && criteresRecherche.statuts.length" class="criterion-resultat-recherche">
                  <span class="criterion-label-resultat-recherche">Statuts :</span>
                  <span class="criterion-value-resultat-recherche">{{ criteresRecherche.statuts.join(', ') }}</span>
                </div>
              </div>
            </div>
          </div> -->

        </div>

        <!-- État vide si pas de résultat -->
        <div v-else class="empty-state-resultat-recherche">
          <i class="fas fa-question-circle"></i>
          <h3>Aucun détail disponible</h3>
          <p>Impossible de charger les détails de ce résultat</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// IMPORT DES VRAIS SERVICES
import { getResultatDetails, getResultatDetailsComplets } from '../service/rechercheService'

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
      exportEnCours: false,
      emailDialogVisible: false,
      emailForm: {
        toEmails: [], 
        subject: 'Export PDF - Détails du résultat',
        message: 'Veuillez trouver ci-joint le PDF contenant les détails du résultat de recherche.'
      },
      nouvelEmail: '',
      generatedPdfBlob: null
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

    scenesAvecPlanning() {
      if (!this.resultatDetails.scenes) return [];
      return this.resultatDetails.scenes.filter(scene => scene.dateTournage);
    }
  },
  async mounted() {
    await this.chargerDetails()
  },
  methods: {
    // NOUVELLE MÉTHODE : Copier le lien
    copierLien() {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert('Lien copié dans le presse-papier !');
      }).catch(err => {
        console.error('Erreur lors de la copie du lien:', err);
        alert('Erreur lors de la copie du lien');
      });
    },

    // NOUVELLE MÉTHODE : Navigation vers écran de travail
    naviguerVersEcranTravail() {
      if (!this.resultat) return
      
      let routePath = ''
      let queryParams = {}
      
      switch (this.resultat.type) {
        case 'scene':
          routePath = `/projet/${this.resultat.projetId}/ecran-travail`
          queryParams = {
            episodeId: this.resultat.episodeId,
            sequenceId: this.resultat.sequenceId
          }
          break
          
        case 'personnage':
          routePath = `/projet/${this.resultat.projetId}/ecran-travail`
          queryParams = {
            filterPersonnage: this.resultat.id
          }
          break
          
        case 'lieu':
          routePath = `/projet/${this.resultat.projetId}/ecran-travail`
          queryParams = {
            filterLieu: this.resultat.id
          }
          break
          
        case 'plateau':
          routePath = `/projet/${this.resultat.projetId}/ecran-travail`
          queryParams = {
            filterPlateau: this.resultat.id
          }
          break
          
        default:
          routePath = `/projet/${this.resultat.projetId}/ecran-travail`
      }
      
      this.$router.push({
        path: routePath,
        query: queryParams
      })
    },

    getEcranTravailButtonText() {
      if (!this.resultat) return 'Voir dans le projet'
      
      switch (this.resultat.type) {
        case 'scene': return 'Voir la scène dans le projet'
        case 'personnage': return 'Voir le personnage dans le projet'
        case 'lieu': return 'Voir le lieu dans le projet'
        case 'plateau': return 'Voir le plateau dans le projet'
        default: return 'Voir dans le projet'
      }
    },

    async chargerDetails() {
      this.chargement = true
      this.erreur = null
      
      try {
        const { type, id } = this.$route.params
        
        if (this.$route.query.recherche) {
          try {
            this.criteresRecherche = JSON.parse(this.$route.query.recherche)
          } catch (e) {
            console.warn('Erreur parsing critères recherche:', e)
            this.criteresRecherche = null
          }
        }
        
        this.resultat = await getResultatDetails(type, id)
        this.resultatDetails = await getResultatDetailsComplets(type, id)
        
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error)
        this.erreur = error.message || 'Erreur lors du chargement des détails'
      } finally {
        this.chargement = false
      }
    },

    ajouterEmail() {
      if (this.nouvelEmail && this.estEmailValide(this.nouvelEmail)) {
        if (!this.emailForm.toEmails.includes(this.nouvelEmail.trim().toLowerCase())) {
          this.emailForm.toEmails.push(this.nouvelEmail.trim().toLowerCase());
          this.nouvelEmail = '';
        } else {
          alert('Cet email est déjà dans la liste des destinataires.');
        }
      } else if (this.nouvelEmail) {
        alert('Veuillez saisir une adresse email valide.');
      }
    },

    supprimerEmail(index) {
      this.emailForm.toEmails.splice(index, 1);
    },
    
    estEmailValide(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    
    ouvrirDialogueEmail() {
      this.exportEnCours = true;
      
      try {
        const pdf = this.genererPDF();
        const pdfBlob = pdf.output('blob');
        this.generatedPdfBlob = pdfBlob;
        this.emailDialogVisible = true;
        
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Erreur lors de la préparation du PDF pour l\'envoi');
      } finally {
        this.exportEnCours = false;
      }
    },
    
    fermerDialogueEmail() {
      this.emailDialogVisible = false;
      this.resetEmailForm();
    },
 
    async exporterPDF() {
      this.exportEnCours = true;
      
      try {
        const pdf = this.genererPDF();
        pdf.save(`${this.resultat.type}_${this.resultat.titre}_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error('Erreur lors de l\'export PDF:', error);
        alert('Erreur lors de la génération du PDF');
      } finally {
        this.exportEnCours = false;
      }
    },
     
    genererPDF() {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Détails du ${this.getTypeLabel(this.resultat.type)}`, margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Export généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
      yPosition += 15;
      
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
      
      if (this.resultat.type === 'personnage') {
        this.exporterPDFPersonnage(pdf, margin, yPosition, contentWidth);
      } else if (this.resultat.type === 'scene') {
        this.exporterPDFScene(pdf, margin, yPosition, contentWidth);
      } else if (this.resultat.type === 'lieu') {
        this.exporterPDFLieu(pdf, margin, yPosition, contentWidth);
      } else if (this.resultat.type === 'plateau') {
        this.exporterPDFPlateau(pdf, margin, yPosition, contentWidth);
      }
      
      return pdf;
    },

    async envoyerEmailAvecPDF() {
      if (this.emailForm.toEmails.length === 0) {
        alert('Veuillez ajouter au moins un destinataire');
        return;
      }

      this.exportEnCours = true;
      
      try {
        const reader = new FileReader();
        reader.readAsDataURL(this.generatedPdfBlob);
        
        reader.onload = async () => {
          const base64Data = reader.result.split(',')[1];
          const pdfData = this.base64ToArrayBuffer(base64Data);
          
          const promises = this.emailForm.toEmails.map(async (email) => {
            const emailRequest = {
              toEmail: email,
              subject: this.emailForm.subject,
              message: this.emailForm.message,
              attachmentName: `${this.resultat.type}_${this.resultat.titre}_${new Date().toISOString().split('T')[0]}.pdf`,
              pdfData: Array.from(pdfData)
            };

            const response = await fetch('/api/export/send-pdf-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailRequest)
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status} pour ${email}`);
            }

            return response.json();
          });

          const results = await Promise.allSettled(promises);
          
          const succes = results.filter(result => result.status === 'fulfilled' && result.value.success);
          const echecs = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success));
          
          if (echecs.length === 0) {
            alert(`✅ PDF envoyé avec succès à ${succes.length} destinataire(s) !`);
            this.fermerDialogueEmail();
          } else {
            let message = `📧 Résultat de l'envoi :\n`;
            message += `✅ ${succes.length} email(s) envoyé(s) avec succès\n`;
            message += `❌ ${echecs.length} email(s) en échec\n\n`;
            
            if (echecs.length > 0) {
              message += `Échecs :\n`;
              echecs.forEach((echec, index) => {
                if (echec.status === 'rejected') {
                  message += `${index + 1}. ${this.emailForm.toEmails[index]} - ${echec.reason}\n`;
                } else {
                  message += `${index + 1}. ${this.emailForm.toEmails[index]} - ${echec.value.message}\n`;
                }
              });
            }
            
            alert(message);
            
            if (succes.length > 0) {
              this.fermerDialogueEmail();
            }
          }
        };
        
      } catch (error) {
        console.error('Erreur lors de l\'envoi des emails:', error);
        alert('Erreur lors de l\'envoi des emails: ' + error.message);
      } finally {
        this.exportEnCours = false;
      }
    },

    base64ToArrayBuffer(base64) {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    },

    resetEmailForm() {
      this.emailForm = {
        toEmails: [],
        subject: 'Export PDF - Détails du résultat',
        message: 'Veuillez trouver ci-joint le PDF contenant les détails du résultat de recherche.'
      };
      this.nouvelEmail = '';
    },

    // Méthodes d'export PDF (restaurées depuis l'original)
    exporterPDFPersonnage(pdf, margin, yPosition, contentWidth) {
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
        
        for (const dialogue of this.resultatDetails.dialogues.slice(0, 50)) {
          if (currentY > 250) {
            pdf.addPage();
            currentY = 20;
          }
          
          const sceneInfo = dialogue.sceneTitre ? ` (Scène: ${dialogue.sceneTitre})` : '';
          const dialogueText = `"${dialogue.texte}"`;
          
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

    exporterPDFScene(pdf, margin, yPosition, contentWidth) {
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

    exporterPDFLieu(pdf, margin, yPosition, contentWidth) {
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
        
        for (const scene of this.resultatDetails.scenes.slice(0, 20)) {
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

    exporterPDFPlateau(pdf, margin, yPosition, contentWidth) {
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

<style scoped>
/* Le CSS sera importé depuis le fichier externe */
</style>
