<template>
  <div id="app">
    <Navbar v-if="showNavbar" />
    <router-view />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  },
  computed: {
    showNavbar() {
      // Ne pas afficher la navbar sur la page de connexion
      return this.$route.path !== '/';
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Hauora', sans-serif;
  background-color: #23364a;
  color: #333;
}

#app {
  min-height: 100vh;
}

.app-wrapper-global {
  margin-left: 190px; /* Largeur de la sidebar ouverte */
  transition: margin-left var(--transition);
  min-height: 100vh;
  width: calc(100% - 190px);
  background: #fff;
}

.sidebar.collapsed ~ .app-wrapper-global {
  margin-left: 50px; /* Largeur de la sidebar fermée */
  width: calc(100% - 50px);
}

</style>


