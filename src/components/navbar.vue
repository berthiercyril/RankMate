<template>
    <nav  :class="['navbar sticky-top', { 'opacity-50': isScrolled }]">
    <div id="nav" class="container-fluid">
        <router-link class="navbar-brand text-white rankmate" to="#">
          <i class="fa-solid fa-shield-halved" style="color: #00c6ba;"></i>
          <span class="rank ms-2">Rank</span>
          <span class="mate">mate</span>
        </router-link>
        <form class="d-flex" role="search">
        <router-link class="navbar-brand text-menu me-4" to="/">Accueil</router-link>
        <router-link class="navbar-brand text-menu me-4" to="#">Champions</router-link>
        <router-link class="navbar-brand text-menu me-5" to="/leaderboard">Classements</router-link>
        <button class="btn btn-outline-success login" type="submit">Se connecter</button>
        </form>
    </div>
    </nav>
  </template>
  
  <script>
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
    methods: {
      handleScroll() {
        this.isScrolled = window.scrollY > 0;
      },
    },
  };
  </script>
  
  <style scoped>
    .navbar{
      border-bottom: 1px solid #dadfed50;
      background-color: #010a14;
    }

    .login {
      background-color: #2A2F39;
      color: #FFFFFF;
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
      color: #d3fbd8;
    }

    .text-menu {
      color: #ffffff;
    }


  </style>
  