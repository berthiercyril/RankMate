<script setup>
import ChampionCard from '../components/ChampionCard.vue';
import Navbar from '../components/Navbar.vue';


import AOS from 'aos';
import 'aos/dist/aos.css'; // Importez le CSS de AOS

import { useStore } from 'vuex';
import { ref, push, set } from "firebase/database";
import { db } from "../store/index"; // Assurez-vous que ce chemin d'importation est correct
import { ref as vueRef, watch } from 'vue';



const store = useStore();
console.log(store.state);

let showJoinButton = vueRef(!store.state.currentUser);

// store.commit('resetCurrentUser');
// store.commit('resetFreeChampions');
// store.dispatch('subscribeToDataUpdates');

const resetStore = () => {
  store.commit('resetCurrentUser');
  console.log("le store a été réinitialisé");
  console.log(store.state);
};

const pseudo = vueRef(''); // Create a reactive variable for the pseudo
const tag = vueRef(''); // Create a reactive variable for the tag
const message = vueRef(''); // Create a reactive variable for the message

const createUser = async () => {
  const user = { pseudo: pseudo.value, tag: tag.value };
  message.value = await store.dispatch('addUser', user);

};

console.log(store.state.profiles);


const currentUser = store.state.currentUser;
const currentUserProfile = currentUser ? store.state.profiles.find(profile => profile.id === currentUser.id) : null;

// Expose createUser and pseudo to the template
const expose = { createUser, pseudo, showJoinButton, message };

watch(() => store.state.currentUser, (newVal, oldVal) => {
  console.log('currentUser changed from', oldVal, 'to', newVal);
  showJoinButton.value = !newVal;
  // Si newVal (le nouvel utilisateur actuel) n'est pas null, dispatch initializeData
  // if (newVal) {
  //   console.log('New user detected, initializing data');
  //   store.dispatch('initializeData');
  // }
});

</script>

<template>
  <Navbar :profileIconUrl="currentUserProfile ? currentUserProfile.profileIconUrl : ''" :pseudo="currentUser ? currentUser.pseudo : ''" />  
  <main>
    <div class="text-center py-custom background-image" data-aos="fade-up">
      <div class="content">
        <h1 class="fw-bold text-white mt-3" data-aos="zoom-in" data-aos-delay="100">Bienvenue sur Rank<span class="text-green fw-bold">mate</span> !</h1>
        <div class="container">
          <p class="mt-4 text-white fw-semibold" data-aos="fade-up" data-aos-delay="400">Rejoignez ou créez un groupe sur notre application web League of Legends pour suivre le classement de vos amis. Restez compétitif et amusez-vous en visualisant les progrès de chacun. Que vous soyez un vétéran de la ligue ou un débutant, il n'a jamais été aussi facile de rester connecté et engagé avec vos amis !</p>
        </div>
        <button type="button" class="btn-custom btn mt-3" data-aos="fade-up" data-aos-delay="500" data-bs-toggle="modal" data-bs-target="#registerModal" v-if="showJoinButton">Rejoignez-nous</button>
        <button @click="resetStore" class="btn-custom btn mt-3 ms-5" data-aos="fade-up" data-aos-delay="500">Reset CurrentUser</button>
      </div>
    </div>



    <div class="container text-start py-5">
      <h2 class="mb-5 " data-aos="fade-up" data-aos-delay="800">Rotation champions gratuit</h2>
      <div class="row">
        <ChampionCard/>
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

<!-- Modal register user -->
<div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
        <!-- <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Créer un groupe</h1>
        <button type="button" class="btn" data-bs-dismiss="modal" aria-label="Close"><i class="fa-solid fa-xmark" style="color: #ffffff;"></i></button>
        </div> -->
        <div class="modal-body">
          <div class="input-group">
            <!-- <span class="input-group-text" id="basic-addon1">Code du groupe</span> -->
            <input v-model="pseudo" type="username" class="form-control fw-semibold input" placeholder="Pseudo" aria-label="pseudo" aria-describedby="basic-addon1">
            <span class="input-group-text hastag fw-bold">#</span>
            <input v-model="tag" type="tag" class="form-control fw-semibold input" placeholder="EUW" aria-describedby="basic-addon1">
            <button type="button" class="btn-custom btn" @click="createUser">Rejoindre</button>
          </div>
          <div class="alert p-0 m-0 text-danger" role="alert" v-if="message">
            <span class="fs-6"><i class="fa-solid fa-triangle-exclamation"></i> {{message}}</span>
          </div>

        </div>
    </div>
  </div>
</div>

</template>

<style scoped>

.btn-custom {
/* width: 40%; Ajustez cette valeur en fonction de vos besoins */
background-color: #0E6BA8;
color: #F7EBEC;
}

.btn-custom:hover {
/* width: 40%; Ajustez cette valeur en fonction de vos besoins */
background-color: #1395ec;
color: #F7EBEC;
}

.text-green {
color: #DFA253;
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
background: linear-gradient(to bottom, rgba(255,255,255,0) 90%, rgba(255,255,255,0) 0%, #021327 100%), 
            linear-gradient(to right, #021327, rgba(255,255,255,0) 30%, #021327),
            linear-gradient(to left, #021327, rgba(255,255,255,0) 30%, #021327),
            linear-gradient(to top, rgba(255,255,255,0) 90%, rgba(255,255,255,0) 0%, #021327 100%);
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
background-color: #010a14;
border: #F7EBEC 1px solid;
}

.modal-header {
border: none;
}

.modal-footer {
border: none;
}

.hastag{
background-color: #DFA253;
border-color: #DFA253;
color: #F7EBEC;
}

.input{
  box-shadow: none;
  border-color: #DFA253;
}



</style>
