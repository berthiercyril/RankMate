<template>
  <div v-if="summonerName && tag">
    <!-- Affiche le loader si isLoading est true -->
    <div v-if="isLoading">
      <div class="d-flex justify-content-center mt-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <!-- Affiche les données si isLoading est false -->
    <div v-else >
      <div class="d-flex justify-content-between align-items-center mt-4 profile">
        <div class="d-flex align-items-start">
          <div class="image-wrapper">
              <div class="image-container d-flex justify-content-center align-items-center">
                <img :src="profileIconUrl" class="rounded-circle profil-image" alt="Photo de profil" style="width:80px; height:80px;">
              </div>
              <span class="level position-absolute bottom-0 start-50 translate-middle-x text-white"> {{ summonerLevel }} </span>
            </div>
          <div class="ms-3 mt-2">
            <span class="pseudo">{{ pseudo }}</span>
            <i v-if="medal === 'gold'" class="fa-solid fa-medal ms-2" style="color: #FFD700;"></i>
            <i v-if="medal === 'silver'" class="fa-solid fa-medal ms-2" style="color: #C0C0C0;"></i>
            <i v-if="medal === 'bronze'" class="fa-solid fa-medal ms-2" style="color: #CD7F32;"></i>
            <div>
              <span class="me-1"> {{ tier }} </span>
              <span class="me-3">  {{ rank }} </span>
              <span v-if="tier !== 'Unranked'" class="me-1 number"> {{ leaguePoints }}</span>
              <span v-if="tier !== 'Unranked'" class="number">LP</span>
            </div>
            <div v-if="tier !== 'Unranked'" class="number">
              <span> {{ wins }} </span>
              <span class="me-2">W</span>
              <span> {{ losses }} </span>
              <span>L</span>
            </div>
          </div>
        </div>
        <!-- <button class="btn refresh" @click="fetchData">
          <i class="fa-solid fa-rotate-right"></i>
        </button> -->
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapActions, mapState } from 'vuex';

export default {
  props: ['summonerName', 'tag', 'idUser', 'medal'],


//   data() {
//     return {
//       apiKey: import.meta.env.VITE_APP_API_KEY,
//       tier: '',
//       rank: '',
//       leaguePoints: '',
//       pseudo: '',
//       summonerLevel: '',
//       profileIconId: '',
//       profileIconUrl: '',
//       isLoading: true,
//     };
//   },
// methods: {
//   fetchData() {
//     // Si tag ou summonerName est undefined, ne rien faire
//     if (!this.tag || !this.summonerName) {
//       this.isLoading = false;
//       return;
//     }
//     console.log('pseudo'+this.summonerName);
//     console.log('tag'+this.tag);

//     this.isLoading = true;

//     const encodedSummonerName = encodeURIComponent(this.summonerName);
//     const cleanedTag = this.tag.startsWith('#') ? this.tag.substring(1) : this.tag;
//     const url = `https://cors-anywhere.herokuapp.com/https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedSummonerName}/${cleanedTag}`;

//     axios.get(url, {
//       headers: {
//         'X-Riot-Token': this.apiKey
//       }
//     })
//       .then(response => {
//         const puuid = response.data.puuid;
//         console.log('puuid: ', puuid); // Log puuid
//         const secondUrl = `https://cors-anywhere.herokuapp.com/https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;

//         return axios.get(secondUrl, {
//           headers: {
//             'X-Riot-Token': this.apiKey
//           }
//         });
//       })
//       .then(response => {
//         const summonerId = response.data.id;
//         const profileIconId = response.data.profileIconId;
//         this.summonerLevel = response.data.summonerLevel;
//         this.pseudo = response.data.name;

//         // Fetch the latest version here
//         axios.get('https://ddragon.leagueoflegends.com/api/versions.json')
//           .then(response => {
//             const latestVersion = response.data[0];
//             this.profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${profileIconId}.png`;
//             console.log('profileIconUrl: ', this.profileIconUrl); // Log the profile icon URL
//           })


//         return axios.get(`https://cors-anywhere.herokuapp.com/https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`, {
//           headers: {
//             'X-Riot-Token': this.apiKey
//           }
//         });
//       })
//       .then(response => {
//         console.log(response.data); // Logs the data from the third API call to the console
//         if (Array.isArray(response.data) && response.data.length > 0) {
//           const soloRankData = response.data.filter(item => item.queueType === 'RANKED_SOLO_5x5');
//           if (soloRankData.length > 0) {
//             this.tier = soloRankData[0].tier; // Définissez 'tier' ici
//             this.rank = soloRankData[0].rank; // Définissez 'rank' ici
//             this.leaguePoints = soloRankData[0].leaguePoints; // Définissez 'leaguePoints' ici
//           } else {
//             this.tier = 'Unranked'; // Si il n'y a pas de RANKED_SOLO_5x5, définir tier à unranked
//           }
//           this.isLoading = false;
//         } else {
//           console.error('Response data is not an array or is empty');
//         }
//       })
//       .catch(error => {
//         console.error(error);
//       });
//   } 
// },
data() {
    return {
      isLoading: true,
    };
  },

  computed: {
    profile() {
      return this.$store.state.profiles[this.idUser];
    },

    profileIconUrl() {
      return this.profile?.profileIconUrl;
    },

    pseudo() {
      return this.profile?.pseudo;
    },

    tier() {
      return this.profile?.tier;
    },

    rank() {
      return this.profile?.rank;
    },

    leaguePoints() {
      return this.profile?.leaguePoints;
    },

    summonerLevel() {
      return this.profile?.summonerLevel;
    },
    wins() {
      return this.profile?.wins;
    },
    losses() {
      return this.profile?.losses;
    },
  },

  methods: {
    ...mapActions(['fetchProfile']),

    async fetchData() {
      if (!this.tag || !this.summonerName) {
        this.isLoading = false;
        return;
      }

      this.isLoading = true;

      try {
        await this.fetchProfile({ summonerName: this.summonerName, tag: this.tag, idUser: this.idUser});
        this.isLoading = false;
      } catch (error) {
        console.error(error);
      }
    },
  },



  async created() {
    await this.fetchData();
  },
};
</script>


<style scoped>
.option {
  color: #F7EBEC;
  font-size: 24px;
}

.image-container {
  position: relative;
  width: 85px; /* Ajustez à la taille de votre image */
  height: 85px; /* Ajustez à la taille de votre image */
  border-radius: 50%;
  overflow: hidden;
  background: #996515; background: linear-gradient(to bottom, #996515 0%, #8A5606 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #996515), color-stop(100%, #8A5606)); background: -webkit-linear-gradient(top, #996515 0%, #8A5606 100%); background: -moz-linear-gradient(top, #996515 0%, #8A5606 100%); background: -o-linear-gradient(top, #996515 0%, #8A5606 100%); background: -ms-linear-gradient(top, #996515 0%, #8A5606 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#996515', endColorstr='#8A5606', GradientType=0); border: 1px solid #7B4700; box-shadow: inset 0 1px 0 #A87424; -webkit-box-shadow: inset 0 1px 0 #A87424; -moz-box-shadow: inset 0 1px 0 #A87424;
  background-position: center; /* Centrer le background */
}



.image-wrapper {
  height: 103px; /* Ajustez à la taille souhaitée */
  position: relative;
}

.level {
  position: relative;
  padding: 8px;
  background: #996515; background: linear-gradient(to bottom, #996515 0%, #8A5606 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #996515), color-stop(100%, #8A5606)); background: -webkit-linear-gradient(top, #996515 0%, #8A5606 100%); background: -moz-linear-gradient(top, #996515 0%, #8A5606 100%); background: -o-linear-gradient(top, #996515 0%, #8A5606 100%); background: -ms-linear-gradient(top, #996515 0%, #8A5606 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#996515', endColorstr='#8A5606', GradientType=0); border: 1px solid #7B4700; box-shadow: inset 0 1px 0 #A87424; -webkit-box-shadow: inset 0 1px 0 #A87424; -moz-box-shadow: inset 0 1px 0 #A87424;
  clip-path: polygon(85% 0, 100% 30%, 85% 60%, 15% 60%, 0 30%, 15% 0);
  display: flex; /* Ajouté pour centrer le texte */
  justify-content: center; /* Ajouté pour centrer le texte horizontalement */
  align-items: flex-end; /* Ajouté pour centrer le texte verticalement */
  width: 40px; /* Ajustez à la taille souhaitée */
  height: 30px; /* Ajustez à la taille souhaitée */
  font-family: 'Beaufort for LOL';
  font-style: normal;
  font-weight: 700;
  font-size: 12pt;
  letter-spacing: 0.02em;
  line-height: 20pt;
}

.level::before {
  content: "";
  position: absolute;
  top: 1%; /* Ajusté pour centrer .level::before dans .level */
  left: 2%; /* Ajusté pour centrer .level::before dans .level */
  width: 95%; /* Ajusté pour être plus petit que .level */
  height: 94%; /* Ajusté pour être plus petit que .level */
  background-color: #2d343c; /* Couleur de la bordure */
  clip-path: polygon(85% 0, 100% 30%, 85% 60%, 15% 60%, 0 30%, 15% 0);
  z-index: -1;
}

.pseudo {
  font-size: 20px;
  font-weight: 700;
}

.profile{
  border-bottom: 1px solid #dadfed50;
}

</style>
