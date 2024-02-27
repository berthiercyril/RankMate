<template>
    <div class="col-sm-3 mb-4 card-champion" v-for="champion in freeChampions" :key="champion.id" data-aos="zoom-in">
        <div class="card-img rounded-top">
            <div class="img-inner" :style="{ 'background-image': `url(${champion.imageUrl})`}"></div>
        </div>
        <div class="card-text rounded-bottom ps-3"><span class="inner-text">{{ champion.name }}</span></div>
    </div>
</template>

<script>
import AOS from 'aos';
import 'aos/dist/aos.css'; // Importez le CSS de AOS

export default {
  name: 'ChampionCard',

  data() {
    return {
      freeChampions: [] // Votre tableau de champions ici
    }
  },

    mounted() {
        this.$store.dispatch('fetchFreeChampions');
        AOS.init();
    },
    
    computed: {
        freeChampions() {
            return this.$store.state.freeChampions;
        },
    },

}
</script>

<style scoped>
.card-champion {
  width: 260px;
  overflow: hidden; 
}

.card-img {
  height: 295px;
  width: 100%;
  overflow: hidden;
}

.img-inner {
  height: 100%;
  width: 100%;
  background-size: cover; 
  background-repeat: no-repeat; 
  background-position: 72%;
  transition: transform 0.3s ease-in-out;
  /* clip-path: polygon(90% 0, 100% 8%, 100% 100%, 50% 100%, 0 100%, 0 0); */
}

.card-champion:hover .img-inner {
  transform: scale(1.1);
  transition: transform 0.4s ease-in-out;
}

.card-text {
  color: #F7EBEC;
  background-color: hsl(199, 100%, 12%);
  font-size: 20px;
  width: 100%;
  padding: 10px;
  text-transform: uppercase;
  font-family: 'Beaufort for LOL', sans-serif;
  font-style: italic;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.card-champion:hover .card-text {
  background-color: #005266;
}

.card-text .inner-text {
  display: inline-block;
  transition: transform 0.3s ease-in-out;
  
}

.card-champion:hover .card-text .inner-text {
  transform: translateX(10px);
}
</style>
