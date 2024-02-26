import { createStore } from 'vuex';
import VuexPersistence from 'vuex-persist';
import axios from 'axios';
// Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, push } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCmNYiSAjjU_lH93K8NE7FwitK-cvJKc1A",
    authDomain: "rankmate-f5d6e.firebaseapp.com",
    databaseURL: "https://rankmate-84324-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "rankmate-f5d6e",
    storageBucket: "rankmate-f5d6e.appspot.com",
    messagingSenderId: "583399211457",
    appId: "1:583399211457:web:b993b072d55a7fedd0ef40",
    measurementId: "G-MMEJ0GKQ1C"
};
  
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

// Function to generate a unique code
async function generateUniqueCode(db) {
  let uniqueCode;
  let codeExists = true;

  while (codeExists) {
    uniqueCode = Math.random().toString(36).slice(2, 9);
    const groupRef = ref(db, 'groups/' + uniqueCode);
    const snapshot = await get(groupRef);
    codeExists = snapshot.exists();
  }

  return uniqueCode;
}

export default createStore({
  state: {
    groups: [],
    users: [],
    currentUser: null,
    profiles: {},
  },
  mutations: {
    async createGroup(state, group) {
      const uniqueCode = await generateUniqueCode(db);
      const newGroup = { ...group, code: uniqueCode };
      state.groups = [...state.groups, newGroup]; // Add the new group to the groups array first
      const groupRef = ref(db, 'groups/' + group.id);
      await set(groupRef, newGroup); // Then create the group in Firebase
    },
    async joinGroup(state, { group, user }) {
      const groupToJoin = state.groups.find(g => g.code === group.code);
      if (groupToJoin) {
        if (!groupToJoin.members.includes(user.id)) { // Check if the user's ID is already in the group's members
          groupToJoin.members.push(user.id); // Add the user's ID to the group's members
          const groupRef = ref(db, 'groups/' + groupToJoin.id); // Use the group's ID as the key
          await update(groupRef, { members: groupToJoin.members }); // Update the group's members in Firebase
  
          // Fetch the user's profile and add it to the store
          // this.dispatch('fetchProfile', { summonerName: user.summonerName, tag: user.tag, idUser: user.id });
        }
      }
    },
    addUserToState(state, user) {
      const userExists = state.users.find(existingUser => existingUser.id === user.id);
      console.log('userfirebase= ',user)
      if (!userExists) {

        state.users.push(user);
      }
    },
    setUsers(state, users) {
      state.users = users;
      // state.currentUser = users;
    },
    setProfiles(state, profiles) {
      state.profiles = profiles;
    },
    setCurrentUser(state, user) {
      state.currentUser = user;
    },
    setGroups(state, groups) {
        state.groups = groups;
    },
    async setProfile(state, { idUser, summonerName, tag, data }) {
      const profileRef = ref(db, 'profiles/' + idUser);
      let snapshot = await get(profileRef);
      
      // Si les données de profil n'existent pas dans Firebase, ajoutez-les
      if (!snapshot.exists()) {
        console.log('Adding profile to Firebase')
        await set(profileRef, data);
        snapshot = await get(profileRef); // Récupérez à nouveau les données pour vous assurer qu'elles ont été ajoutées
        state.profiles[idUser] = { id: idUser, ...snapshot.val() }; // Ajoutez le profil au store `profiles`
        console.log('le profil est ajouté dans le store')
        console.log('state.profiles[idUser]=',state.profiles[idUser])
        console.log('state.profiles=',state.profiles) // Add this line
      } else {
        // Si les données de profil existent déjà, mettez-les à jour avec les nouvelles données
        console.log('Updating profile in Firebase')
        await update(profileRef, data);
        snapshot = await get(profileRef); // Récupérez à nouveau les données pour vous assurer qu'elles ont été mises à jour
        state.profiles[idUser] = { id: idUser, ...snapshot.val() }; // Mettez à jour le profil dans le store `profiles`
        console.log('state.profiles=',state.profiles) // Add this line
      }
    },
    setFreeChampions(state, champions) {
      state.freeChampions = champions;
    },
    resetState(state) {
        // Reset all state properties to their initial values
        console.log('Resetting state');
        state.groups = [];
        state.users = [];
        state.currentUser = null;
        state.profiles = {};
    },
    resetCurrentUser(state) {
      state.currentUser = null;
    },
    resetFreeChampions(state) {
      state.freeChampions = [];
    },
  },
  actions: {
    async subscribeToDataUpdates({ commit }) {
      const groupsRef = ref(db, 'groups');
      onValue(groupsRef, (snapshot) => {
        const data = snapshot.val();
        const groupsArray = Object.values(data || {}); // Convert data to array
        commit('setGroups', groupsArray);
      });
  
      const usersRef = ref(db, 'users');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        const usersArray = Object.entries(data || {}).map(([id, userData]) => ({
          id,
          ...userData
        }));
        commit('setUsers', usersArray); // Replace the entire users state
      });


      const profilesRef = ref(db, 'profiles');
      onValue(profilesRef, (snapshot) => {
        const data = snapshot.val();
        const profilesArray = Object.entries(data || {}).map(([id, profileData]) => ({
          id,
          ...profileData
        }));
        commit('setProfiles', profilesArray); // Replace the entire profiles state
      });
    },
    async addUser({ commit, state }, newUser) {
      const encodedSummonerName = encodeURIComponent(newUser.pseudo);
      const cleanedTag = newUser.tag.replace('#', '');
      const usersRef = ref(db, 'users');
      const apiKey = import.meta.env.VITE_APP_API_KEY;
    
      try {
        const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedSummonerName}/${cleanedTag}`, {
          headers: {
            'X-Riot-Token': apiKey
          }
        });
    
        if (response.status === 200) {
          // Le joueur existe, vous pouvez continuer
          // Check if a user with the same pseudo and tag already exists
          const existingUser = state.users.find(user => 
            user.pseudo === newUser.pseudo && user.tag === newUser.tag
          );
        
          if (!existingUser) {
            console.log('Adding new user to Firebase');
            const newUserRef = push(usersRef);
            newUser.id = newUserRef.key;
            await set(newUserRef, newUser);
            commit('addUserToState', newUser);
            commit('setCurrentUser', newUser);
            this.dispatch('fetchProfile', { summonerName: newUser.pseudo, tag: newUser.tag, idUser: newUser.id });
          } else {
            console.log('A user with the same pseudo and tag already exists');
            console.log('User:', existingUser);
            commit('addUserToState', existingUser);
            commit('setCurrentUser', existingUser);
          }
        } else {
          // Le joueur n'existe pas, vous pouvez gérer cette situation
          console.error('The player does not exist');
          console.log('le joueur n existe pas');
        }
      } catch (error) {
        return "Le joueur n'existe pas";
      }
    },
    async fetchProfile({ commit }, { summonerName, tag, idUser }) {
      console.log('fetchProfile')
      if (!tag || !summonerName) {
        return;
      }
  
      const apiKey = import.meta.env.VITE_APP_API_KEY;
      const encodedSummonerName = encodeURIComponent(summonerName);
      const cleanedTag = tag.startsWith('#') ? tag.substring(1) : tag;
      const url = `https://cors-anywhere.herokuapp.com/https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedSummonerName}/${cleanedTag}`;
  
      try {
        const response = await axios.get(url, {
          headers: {
            'X-Riot-Token': apiKey
          }
        });
  
        const puuid = response.data.puuid;
        const secondUrl = `https://cors-anywhere.herokuapp.com/https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  
        const secondResponse = await axios.get(secondUrl, {
          headers: {
            'X-Riot-Token': apiKey
          }
        });
  
        const summonerId = secondResponse.data.id;
        const profileIconId = secondResponse.data.profileIconId;
        const summonerLevel = secondResponse.data.summonerLevel;
        const pseudo = secondResponse.data.name;
  
        const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        const latestVersion = versionsResponse.data[0];
        const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${profileIconId}.png`;
  
        const rankResponse = await axios.get(`https://cors-anywhere.herokuapp.com/https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`, {
          headers: {
            'X-Riot-Token': apiKey
          }
        });
  
        if (Array.isArray(rankResponse.data) && rankResponse.data.length > 0) {
          const soloRankData = rankResponse.data.filter(item => item.queueType === 'RANKED_SOLO_5x5');
          let tier = 'Unranked';
          let rank = '';
          let leaguePoints = '';
          let wins = '';
          let losses = '';
  
          if (soloRankData.length > 0) {
            tier = soloRankData[0].tier;
            rank = soloRankData[0].rank;
            leaguePoints = soloRankData[0].leaguePoints;
            wins = soloRankData[0].wins;
            losses = soloRankData[0].losses;
          }
  
          commit('setProfile', {
            idUser,
            summonerName,
            tag,
            data: {
              tier,
              rank,
              leaguePoints,
              pseudo,
              summonerLevel,
              wins,
              losses,
              profileIconUrl,
            },
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async fetchFreeChampions({ commit }) {
      try {
        const response = await axios.get('https://cors-anywhere.herokuapp.com/https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations', {
          headers: {
            'X-Riot-Token': import.meta.env.VITE_APP_API_KEY
          }
        });
        const freeChampionIds = response.data.freeChampionIds;
    
        const versionsResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        const gameVersion = versionsResponse.data[0];
    
        const championsResponse = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${gameVersion}/data/en_US/champion.json`);
        const championsData = championsResponse.data.data;
    
        const freeChampions = freeChampionIds.map(id => {
          const champion = Object.values(championsData).find(champion => champion.key === id.toString());
          return {
            id,
            name: champion.name,
            imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`,
            imageX: champion.image.x,
            imageY: champion.image.y,
            imageW: champion.image.w,
            imageH: champion.image.h
          };
        });
    
        const championsRef = ref(db, 'freeChampions');
        await set(championsRef, freeChampions);
    
        commit('setFreeChampions', freeChampions);
      } catch (error) {
        console.error(error);
      }
    },
  },
  plugins: [vuexLocal.plugin]
});

export { db };