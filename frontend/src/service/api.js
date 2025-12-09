// src/services/rechercheService.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

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

export default {
  rechercheAvancee,
  getStatutsDisponibles
}
