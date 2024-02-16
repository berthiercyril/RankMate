<template>
    <!-- La section template contient le HTML du composant -->
    <div>
      <h1>{{ titre }}</h1>
      <p>{{ contenu }}</p>
    </div>
  </template>
  
  <script>
  // La section script contient la logique JavaScript du composant
  export default {
    // Les propriétés du composant
    props: {
      titre: String,
      contenu: String
    },
    // Les données du composant
    data() {
      return {
        // Les données locales du composant
      };
    },
    // Les méthodes du composant
    methods: {
      // Les méthodes du composant
    },
    // Les hooks de cycle de vie du composant
    mounted() {
      // Le code à exécuter lorsque le composant est monté
    },
    // Les autres options du composant
  };
  </script>
  
  <style scoped>
  /* La section style contient les styles CSS du composant */
  </style>
  