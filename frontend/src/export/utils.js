// export/utils.js

/**
 * Formate une date
 */
export function formatDate(date) {
  if (!date) return 'Non spécifiée';
  try {
    return new Date(date).toLocaleDateString('fr-FR');
  } catch (error) {
    return 'Date invalide';
  }
}

/**
 * Formate une date et heure
 */
export function formatDateTime(dateTime) {
  if (!dateTime) return 'Non spécifié';
  try {
    return new Date(dateTime).toLocaleString('fr-FR');
  } catch (error) {
    return 'Date invalide';
  }
}

/**
 * Formate un statut
 */
export function formatStatut(statut) {
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
  };
  return statuts[statut] || statut;
}

/**
 * Calcule la durée d'une scène
 */
export function calculerDureeScene(debut, fin) {
  if (!debut || !fin) return 'Non spécifiée';
  try {
    const [debutHeures, debutMinutes] = debut.split(':').map(Number);
    const [finHeures, finMinutes] = fin.split(':').map(Number);
    const debutTotalMinutes = debutHeures * 60 + debutMinutes;
    const finTotalMinutes = finHeures * 60 + finMinutes;
    const dureeMinutes = finTotalMinutes - debutTotalMinutes;
    if (dureeMinutes <= 0) return 'Non spécifiée';
    const heures = Math.floor(dureeMinutes / 60);
    const minutes = dureeMinutes % 60;
    return heures > 0 ? `${heures}h ${minutes}min` : `${minutes}min`;
  } catch (error) {
    return 'Non spécifiée';
  }
}

/**
 * Compte le nombre de mots dans un texte
 */
export function compterMots(texte) {
  if (!texte) return 0;
  return texte.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estime la durée de lecture
 */
export function estimerDuree(texte) {
  const mots = compterMots(texte);
  const minutes = Math.ceil(mots / 150);
  return minutes > 0 ? `${minutes}min` : '< 1min';
}

/**
 * Obtient le libellé du type
 */
export function getTypeLabel(type) {
  const labels = {
    scene: 'Scène',
    personnage: 'Personnage',
    lieu: 'Lieu',
    plateau: 'Plateau'
  };
  return labels[type] || type;
}

/**
 * Obtient le type à partir de la description
 */
export function getTypeFromDescription(description) {
  if (!description) return 'Non spécifié';
  if (description.toLowerCase().includes('intérieur')) return 'Intérieur';
  if (description.toLowerCase().includes('extérieur')) return 'Extérieur';
  if (description.toLowerCase().includes('studio')) return 'Studio';
  return 'Non spécifié';
}

