<template>
  <div class="calendrier-tournage">
    <div class="calendrier-header">
      <h2>📅 Calendrier de Tournage</h2>
      <div class="filters">
        <select v-model="filtreProjet" @change="chargerTournages">
          <option value="">Tous les projets</option>
          <option v-for="projet in projets" :key="projet.id" :value="projet.id">
            {{ projet.titre }}
          </option>
        </select>
        
        <select v-model="filtreStatut" @change="chargerTournages">
          <option value="">Tous les statuts</option>
          <option value="planifie">Planifié</option>
          <option value="confirme">Confirmé</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="reporte">Reporté</option>
        </select>
        
        <input type="date" v-model="filtreDate" @change="chargerTournages">
      </div>
    </div>
    
    <div class="calendrier-view">
      <!-- Vue Calendrier -->
      <div class="calendar-grid">
        <div class="calendar-header">
          <div class="calendar-nav">
            <button @click="moisPrecedent">←</button>
            <h3>{{ moisCourant }}</h3>
            <button @click="moisSuivant">→</button>
          </div>
          <div class="week-days">
            <div v-for="day in joursSemaine" :key="day" class="week-day">{{ day }}</div>
          </div>
        </div>
        
        <div class="calendar-days">
          <div v-for="day in joursCalendrier" :key="day.date" 
               :class="['calendar-day', { 'other-month': !day.isCurrentMonth }]">
            <div class="day-header">{{ day.day }}</div>
            <div class="tournages-list">
              <div v-for="tournage in day.tournages" :key="tournage.id"
                   :class="`tournage-item statut-${tournage.statutTournage}`"
                   @click="ouvrirDetailsTournage(tournage)">
                <div class="tournage-time">{{ tournage.heureDebut }}</div>
                <div class="tournage-title">{{ tournage.sceneTitre }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      tournages: [],
      projets: [],
      filtreProjet: '',
      filtreStatut: '',
      filtreDate: '',
      dateCourante: new Date(),
      joursSemaine: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    }
  },
  
  computed: {
    moisCourant() {
      return this.dateCourante.toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
      });
    },
    
    joursCalendrier() {
      const year = this.dateCourante.getFullYear();
      const month = this.dateCourante.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
      
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (7 - lastDay.getDay()));
      
      const days = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const tournagesDuJour = this.tournages.filter(t => {
          console.log(`Comparaison: ${t.dateTournage} === ${dateStr}`, t.dateTournage === dateStr);
          return t.dateTournage === dateStr;
        });
        
        console.log(`Date: ${dateStr}, Tournages:`, tournagesDuJour);
        
        days.push({
          date: dateStr,
          day: currentDate.getDate(),
          isCurrentMonth: currentDate.getMonth() === month,
          tournages: tournagesDuJour
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return days;
    }
  },
  
  methods: {
   async chargerTournages() {
  try {
    let url = '/api/scene-tournage/periode';
    const params = new URLSearchParams();
    
    // Calcul des dates de début et fin du mois
    const startDate = new Date(this.dateCourante.getFullYear(), this.dateCourante.getMonth(), 1);
    const endDate = new Date(this.dateCourante.getFullYear(), this.dateCourante.getMonth() + 1, 0);
    
    params.append('startDate', startDate.toISOString().split('T')[0]);
    params.append('endDate', endDate.toISOString().split('T')[0]);
    
    // Ajouter le filtre projet si sélectionné
    if (this.filtreProjet) {
      params.append('projetId', this.filtreProjet);
    }
    
    console.log('Chargement tournages avec params:', params.toString());
    
    const response = await axios.get(`${url}?${params}`);
    console.log('Données reçues:', response.data);
    this.tournages = response.data;
  } catch (error) {
    console.error('Erreur chargement tournages:', error);
    // Afficher un message d'erreur à l'utilisateur
    alert('Erreur lors du chargement du calendrier: ' + error.message);
  }
},
    
    async chargerProjets() {
      try {
        const response = await axios.get('/api/projets');
        this.projets = response.data;
      } catch (error) {
        console.error('Erreur chargement projets:', error);
      }
    },
    
    moisPrecedent() {
      this.dateCourante = new Date(this.dateCourante.getFullYear(), this.dateCourante.getMonth() - 1, 1);
      this.chargerTournages();
    },
    
    moisSuivant() {
      this.dateCourante = new Date(this.dateCourante.getFullYear(), this.dateCourante.getMonth() + 1, 1);
      this.chargerTournages();
    },
    
    ouvrirDetailsTournage(tournage) {
      // Ouvrir une modal avec les détails du tournage
      alert(`Détails du tournage: ${tournage.sceneTitre}\nStatut: ${tournage.statutTournageLibelle}`);
    }
  },
  
  mounted() {
    this.chargerTournages();
    this.chargerProjets();
  }
}
</script>

<style scoped>
.calendrier-tournage {
  padding: 20px;
  width: 1300px;
  margin: auto;
}

.calendrier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
}

.filters select, .filters input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.calendar-grid {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
}

.calendar-nav button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #e9ecef;
}

.week-day {
  padding: 10px;
  text-align: center;
  font-weight: bold;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  border: 1px solid #e9ecef;
  padding: 5px;
  background-color: white;
}

.calendar-day.other-month {
  background-color: #f8f9fa;
  color: #6c757d;
}

.day-header {
  font-weight: bold;
  margin-bottom: 5px;
}

.tournages-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tournage-item {
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tournage-item:hover {
  opacity: 0.8;
}

.statut-planifie { background-color: #fff3cd; }
.statut-confirme { background-color: #d1ecf1; }
.statut-en_cours { background-color: #d4edda; }
.statut-termine { background-color: #d1e7dd; }
.statut-reporte { background-color: #f8d7da; }

.tournage-time {
  font-weight: bold;
}

.tournage-title {
  font-size: 9px;
}
</style>