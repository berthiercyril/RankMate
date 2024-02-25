<script setup>
import UserProfileBar from '../components/UserProfileBar.vue'
import { useStore } from 'vuex';
import { ref, push, set } from "firebase/database";
import { db } from "../store/index"; // Assurez-vous que ce chemin d'importation est correct
import { ref as vueRef } from 'vue';

const store = useStore();
console.log(store.state);
// store.commit('resetCurrentUser');
// store.dispatch('subscribeToDataUpdates');

const resetStore = () => {
  store.commit('resetState');
  console.log("le store a été réinitialisé");
  console.log(store.state);
};

const pseudo = vueRef(''); // Create a reactive variable for the pseudo
const tag = vueRef(''); // Create a reactive variable for the tag

const createUser = () => {
  const user = { pseudo: pseudo.value, tag: tag.value };
  store.dispatch('addUser', user);
  store.commit('setCurrentUser', user);
};

// Expose createUser and pseudo to the template
const expose = { createUser, pseudo };

const currentUser = store.state.currentUser;

</script>

<template>
  <main>
    <div class="text-center py-custom background-image">
      <div class="content">
        <h1 class="fw-bold text-white mt-3">Bienvenue sur Rank<span class="text-green fw-bold">mate</span> !
        </h1>
        <div class="container">
          <p class="mt-4 text-white fw-semibold">Rejoignez ou créez un groupe sur notre application web League of Legends pour suivre le classement de vos amis. Restez compétitif et amusez-vous en visualisant les progrès de chacun. Que vous soyez un vétéran de la ligue ou un débutant, il n'a jamais été aussi facile de rester connecté et engagé avec vos amis !</p>
        </div>
        <!-- <button type="button" class="btn-custom btn mt-3 me-5">Rejoindre un groupe</button> -->
        <!-- <button type="button" class="btn-custom btn mt-3 me-5" data-bs-toggle="modal" data-bs-target="#joinGroupModal">Rejoindre un groupe</button> -->

        <!-- <button type="button" class="btn-custom btn mt-3 ms-5">Créer un groupe</button> -->
        <!-- <button type="button" class="btn-custom btn mt-3 ms-5" data-bs-toggle="modal" data-bs-target="#createGroupModal">Créer un groupe</button> -->
        <button type="button" class="btn-custom btn mt-3" data-bs-toggle="modal" data-bs-target="#registerModal">Rejoignez-nous</button>
        <button @click="resetStore" class="btn-custom btn mt-3 ms-5">Reset Store</button>
        

      </div>
    </div>

    <div class="container text-start py-5">
      <h2 class="mb-5 ">Rotation champions gratuit</h2>
      <div class="row">
        <div class="col-sm-2 mb-5 card-champion" v-for="n in 10" :key="n">
          <div class="card-img"></div>
          <div class="card-text ps-3"><span class="inner-text">Aatrox</span></div>
        </div>
      </div>
    </div>


  </main>


<!-- <div class="modal fade" id="joinGroupModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog modal-dialog-centered">
    <div class="modal-content">
        <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Rejoindre un groupe</h1>
        <button type="button" class="btn" data-bs-dismiss="modal" aria-label="Close"><i class="fa-solid fa-xmark" style="color: #ffffff;"></i></button>
        </div>
        <div class="modal-body">
          <div class="input-group mb-3">
            <input type="password" class="form-control" placeholder="Code du groupe" aria-label="groupcode" aria-describedby="basic-addon1">
            <button type="button" class="btn-custom btn">Rejoindre</button>
          </div>
        </div>
    </div>
  </div>
</div>

<div class="modal fade" id="createGroupModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog modal-dialog-centered">
    <div class="modal-content">
        <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Créer un groupe</h1>
        <button type="button" class="btn" data-bs-dismiss="modal" aria-label="Close"><i class="fa-solid fa-xmark" style="color: #ffffff;"></i></button>
        </div>
        <div class="modal-body">
          <div class="input-group mb-3">
            <input type="username" class="form-control" placeholder="Nom du groupe" aria-label="groupname" aria-describedby="basic-addon1">
            <button type="button" class="btn-custom btn">Créer</button>
          </div>
        </div>
    </div>
  </div>
</div> -->

<!-- Modal register group -->
<div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog modal-dialog-centered">
    <div class="modal-content">
        <!-- <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Créer un groupe</h1>
        <button type="button" class="btn" data-bs-dismiss="modal" aria-label="Close"><i class="fa-solid fa-xmark" style="color: #ffffff;"></i></button>
        </div> -->
        <div class="modal-body">
          <div class="input-group">
            <!-- <span class="input-group-text" id="basic-addon1">Code du groupe</span> -->
            <input v-model="pseudo" type="username" class="form-control fw-semibold" placeholder="Pseudo" aria-label="pseudo" aria-describedby="basic-addon1">
            <span class="input-group-text hastag fw-bold">#</span>
            <input v-model="tag" type="tag" class="form-control fw-semibold" placeholder="EUW" aria-describedby="basic-addon1">
            <button type="button" class="btn-custom btn" @click="createUser">Rejoindre</button>
          </div>
        </div>
    </div>
  </div>
</div>

</template>

<style scoped>
.btn-custom {
/* width: 40%; Ajustez cette valeur en fonction de vos besoins */
background-color: #00c6ba;
color: white;
}

.btn-custom:hover {
/* width: 40%; Ajustez cette valeur en fonction de vos besoins */
background-color: #05aca0;
color: rgb(255, 255, 255);
}

.text-green {
color: #00c6ba;
}

.background-image{
position: relative;
background-image: url('../assets/images/lol-yone-kindred-illaoi-veigar-caitlyn-hd-wallpaper-uhdpaper.com-638@1@n.jpg');
background-repeat: no-repeat;
background-size: cover;
}

.background-image::after {
content: '';
display: block;
position: absolute;
top: 0;
right: 0;
bottom: 0;
left: 0;
background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 50%, #070B12 100%), 
            linear-gradient(to right, #070B12, rgba(255,255,255,0) 50%, #070B12),
            linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 50%, #070B12 100%);
background-color: rgba(0, 0, 0, 0.5);
}

.content {
position: relative;
z-index: 2;
}

.py-custom{
padding-top: 8%;
padding-bottom: 8%;
}

.modal-content {
background-color: #070b1200;
/* border-color: white; */
}

.modal-header {
border: none;
}

.modal-footer {
border: none;
}

.hastag{
background-color: #00c6ba;
border-color: #00c6ba;
color: white;
}

.card-img {
  background-position: 80% center;
  transition: transform 0.3s ease-in-out; /* Ajoute une transition */
  /* background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg'); */
  background-size: cover; 
  background-repeat: no-repeat; 
  height: 280px;
  width: 200px;
}

.card-text {
  color: #e8e6e3;
  background-color: #05161e;
  font-size: 20px;
  width: 200px;
  padding: 10px;
  text-transform: uppercase;
  font-style: italic;
  /* font-family: "Beaufort for LOL"; */
  font-weight: 800;
  letter-spacing: 0.08em;
}

.card-champion:hover .card-text {
  background-color: #005266;
}

.card-text .inner-text {
  display: inline-block;
  transition: transform 0.3s ease-in-out; /* Ajoute une transition */
}

.card-champion:hover .card-text .inner-text {
  transform: translateX(10px); /* Décale le texte lors du survol */
}


.card-champion .card-img {
  position: relative;
  overflow: hidden; /* Cache les parties de l'image qui dépassent */
}

.card-champion .card-img::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 80% center;
  transition: transform 0.3s ease-in-out;
  clip-path: polygon(90% 0, 100% 8%, 100% 100%, 50% 100%, 0 100%, 0 0);
}

.card-champion:hover .card-img::before {
  transform: scale(1.1); /* Réduit la taille de l'image lors du survol */
}



</style>
