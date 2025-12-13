// src/utils/exportUtils.js
import axios from 'axios';

export const formatDate = (date) => {
  if (!date) return 'Non planifié';
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getBase64FromUrl = async (filename) => {
  if (!filename || filename.includes('undefined') || filename === 'undefined') {
    console.warn('Nom de fichier invalide:', filename);
    return null;
  }

  try {
    const staticUrl = `http://localhost:8080/api/images/raccords/${filename}`;
    console.log('URL statique:', staticUrl);
    
    const staticResponse = await axios.get(staticUrl, {
      responseType: 'blob',
      timeout: 5000
    });
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(staticResponse.data);
    });
  } catch (staticError) {
    console.warn('Erreur avec serveur statique:', staticError.message);
    
    // Fallback vers l'API
    try {
      const apiUrl = `http://localhost:8080/api/api/images/raccord/${filename}`;
      console.log('URL API:', apiUrl);
      
      const apiResponse = await axios.get(apiUrl, {
        responseType: 'blob',
        timeout: 5000
      });
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(apiResponse.data);
      });
    } catch (apiError) {
      console.warn('Échec des deux méthodes pour:', filename, apiError.message);
      return null;
    }
  }
};


