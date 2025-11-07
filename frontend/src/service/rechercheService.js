// src/services/rechercheService.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export const rechercheAvancee = async (criteres) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/recherche-avancee`, criteres)
    return response.data
  } catch (error) {
    console.error('Erreur recherche avancée:', error)
    throw error
  }
}

export const getStatutsDisponibles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recherche-avancee/statuts`)
    return response.data
  } catch (error) {
    console.error('Erreur chargement statuts:', error)
    throw error
  }
}

export const getResultatDetails = async (type, id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recherche-avancee/details/${type}/${id}`)
    return response.data
  } catch (error) {
    console.error('Erreur chargement détails:', error)
    throw error
  }
}

// CORRECTION : Changé "complet" en "complets" pour correspondre au backend
export const getResultatDetailsComplets = async (type, id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recherche-avancee/details/${type}/${id}/complets`)
    return response.data
  } catch (error) {
    console.error('Erreur chargement détails complets:', error)
    throw error
  }
}

// NOUVELLE FONCTION : Récupérer les statistiques
export const getStatistiques = async (type, id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recherche-avancee/statistiques/${type}/${id}`)
    return response.data
  } catch (error) {
    console.error('Erreur chargement statistiques:', error)
    throw error
  }
}

// NOUVELLE MÉTHODE : Récupérer la liste des projets
export const getProjets = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projets`);
    return response.data;
  } catch (error) {
    console.error('Erreur chargement projets:', error);
    throw error;
  }
};


export default {
  rechercheAvancee,
  getStatutsDisponibles,
  getResultatDetails,
  getResultatDetailsComplets,
  getStatistiques,
  getProjets
}

