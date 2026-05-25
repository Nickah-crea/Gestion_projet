// export/utils.js

export function formatDate(date) {
  if (!date) return 'Non spécifiée';
  try {
    return new Date(date).toLocaleDateString('fr-FR');
  } catch (error) {
    return 'Date invalide';
  }
}

export function formatDateTime(dateTime) {
  if (!dateTime) return 'Non spécifié';
  try {
    return new Date(dateTime).toLocaleString('fr-FR');
  } catch (error) {
    return 'Date invalide';
  }
}

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

export function compterMots(texte) {
  if (!texte) return 0;
  return texte.split(/\s+/).filter(word => word.length > 0).length;
}

export function estimerDuree(texte) {
  const mots = compterMots(texte);
  const minutes = Math.ceil(mots / 150);
  return minutes > 0 ? `${minutes}min` : '< 1min';
}

export function getTypeLabel(type) {
  const labels = {
    scene: 'Scène',
    personnage: 'Personnage',
    lieu: 'Lieu',
    plateau: 'Plateau'
  };
  return labels[type] || type;
}

export function getTypeFromDescription(description) {
  if (!description) return 'Non spécifié';
  if (description.toLowerCase().includes('intérieur')) return 'Intérieur';
  if (description.toLowerCase().includes('extérieur')) return 'Extérieur';
  if (description.toLowerCase().includes('studio')) return 'Studio';
  return 'Non spécifié';
}

