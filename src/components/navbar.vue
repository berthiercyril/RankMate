<template>
    <nav  :class="['navbar sticky-top', { 'opacity-75': isScrolled }]">
    <div id="nav" class="container-fluid">
        <router-link class="navbar-brand text-white rankmate" to="/">
          <i class="fa-solid fa-shield-halved" style="color: #00c6ba;"></i>
          <span class="rank ms-2">Rank</span>
          <span class="mate">mate</span>
        </router-link>
        <form class="d-flex" role="search">
          <!-- <router-link class="navbar-brand text-menu me-4" to="/">Accueil</router-link> -->
          <!-- <router-link class="navbar-brand text-menu me-4" to="#">Champions</router-link> -->
          <router-link class="navbar-brand text-menu me-5" to="/leaderboard" v-if="currentUser?.pseudo && currentUserProfile?.profileIconUrl">Classements</router-link>
          <div class="dropdown" v-if="currentUser?.pseudo && currentUserProfile?.profileIconUrl">
            <div class="text-uppercase d-flex align-items-center" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span class="me-3">{{ currentUser.pseudo }}</span>
              <img class="profile-img" :src="currentUserProfile.profileIconUrl" alt="">
            </div>
            <ul class="dropdown-menu center-dropdown p-0">
              <li><a class="dropdown-item" @click="logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Déconnexion</a></li>
            </ul>
          </div>
        </form>
    </div>
    </nav>
  </template>
  
  <script>
  import { mapState, mapMutations } from 'vuex';
  import { useRouter } from 'vue-router';
  export default {

    data() {
      return {
        isScrolled: false,
      };
    },
    created() {
      window.addEventListener('scroll', this.handleScroll);
    },
    destroyed() {
      window.removeEventListener('scroll', this.handleScroll);
    },

    computed: {
      ...mapState({
        currentUser: state => state.currentUser,
        currentUserProfile: state => state.profiles.find(profile => profile.id === state.currentUser.id),
      }),
    },

    watch: {
      currentUser(newCurrentUser) {
        if (!newCurrentUser) {
          this.logout();
        }
      },
    },

    methods: {
      ...mapMutations(['resetCurrentUser']),

      logout() {
        this.resetCurrentUser();
        this.$router.push('/');
        this.resetCurrentUser();
      },

      handleScroll() {
        this.isScrolled = window.scrollY > 0;
      },

      // logout() {
      //   this.$store.commit('resetCurrentUser');
      // },
    },
  };
  </script>
  
  <style scoped>
    .navbar{
      border-bottom: 1px solid #dadfed50;
      background-color: #010a14;
    }

    .mate {
      color: #00c6ba;
    }

    .rankmate {
      font-family: Roboto;
      font-size: 30px;
      font-style: normal;
      font-weight: 900;
      line-height: normal;
    }

    .text-menu:hover {
      color: #00c6ba;
    }

    .text-menu {
      color: #F7EBEC;
      font-family: 'Beaufort for LOL', sans-serif;
      font-style: normal;
      font-weight: 700;
    }

    .profile-img {
      position: relative;
      width: 40px; /* Ajustez à la taille de votre image */
      height: 40px; /* Ajustez à la taille de votre image */
      border-radius: 50%;
      overflow: hidden;
      display: block;
      max-width: 100%;
      max-height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .dropdown{
      color: #F7EBEC;
      font-family: 'Beaufort for LOL', sans-serif;
      font-style: normal;
      font-weight: 700;
      position: relative;
    }

    .dropdown-menu{
      background-color: #0E6BA8;
      border: F7EBEC 1px solid;
      position: absolute;
      top: 125%;
      left: 0;
      cursor: pointer;
    }

    /* .dropdown-menu:hover{
      background-color: #00c6ba;
    } */

    .dropdown-item{
      color: #F7EBEC;
      font-family: 'Beaufort for LOL', sans-serif;
      font-style: normal;
      font-weight: 700;
    }

    .dropdown-item:hover{
      background-color: #1395ec;
    }

    .center-dropdown {
      left: 50%;
      transform: translateX(-50%);
    }


  </style>
  