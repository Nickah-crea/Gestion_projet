import axios from 'axios';

class RaccordsService {
  constructor() {
    this.baseURL = '/api/raccords';
  }

  // Récupérer toutes les vérifications
  async getVerifications() {
    try {
      const response = await axios.get(`${this.baseURL}/verifications`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération vérifications:', error);
      throw error;
    }
  }

  // Récupérer les types de raccords
  async getTypesRaccord() {
    try {
      const response = await axios.get(`${this.baseURL}/types`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération types:', error);
      throw error;
    }
  }

  // Exporter le rapport
  async exporterRapport(filters = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/verifications/rapport`, {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur export rapport:', error);
      throw error;
    }
  }

  // Télécharger les preuves
  async telechargerPreuves(verificationId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/verifications/${verificationId}/preuves/zip`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur téléchargement preuves:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une vérification
  async mettreAJourStatut(verificationId, nouveauStatut, notes = '') {
    try {
      const response = await axios.put(
        `${this.baseURL}/verifications/${verificationId}/statut`,
        { statut: nouveauStatut, notes }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      throw error;
    }
  }

  // Récupérer les détails complets d'une vérification
  async getDetailsVerification(verificationId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/verifications/${verificationId}/details`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération détails:', error);
      throw error;
    }
  }

  // Récupérer les statistiques globales
  async getStatistiques() {
    try {
      const response = await axios.get(`${this.baseURL}/verifications/statistiques`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      throw error;
    }
  }

  // Rechercher des vérifications
  async rechercherVerifications(term, filters = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/verifications/recherche`, {
        params: { term, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche vérifications:', error);
      throw error;
    }
  }
}

export default new RaccordsService();