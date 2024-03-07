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

      // Join the group after it's created
      await this.commit('joinGroup', { group: newGroup, user: { id: newGroup.members[0]} });
    },
    async joinGroup(state, { group, user }) {
      console.log('Joining group:', group, 'User:', user)
      const groupToJoin = state.groups.find(g => g.code === group.code);
      if (groupToJoin) {
        if (!groupToJoin.members.includes(user.id)) { // Check if the user's ID is already in the group's members
          groupToJoin.members.push(user.id); // Add the user's ID to the group's members
          const groupRef = ref(db, 'groups/' + groupToJoin.id); // Use the group's ID as the key
          await update(groupRef, { members: groupToJoin.members }); // Update the group's members in Firebase
        }
    
        // Fetch the user's data from Firebase
        const userRef = ref(db, 'users/' + user.id);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
    
        // Add the group's ID to the user's groups
        if (!userData.groups) {
          userData.groups = [];
        }
        if (!userData.groups.includes(groupToJoin.id)) {
          userData.groups.push(groupToJoin.id);
        }
    
        // Update the user's data in Firebase
        await update(userRef, userData);
        console.log('User joined group:', groupToJoin);
        // Fetch the user's profile and add it to the store
        // this.dispatch('fetchProfile', { summonerName: user.summonerName, tag: user.tag, idUser: user.id });
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
        state.profiles.push({ id: idUser, ...snapshot.val() }); // Ajoutez le profil au tableau `profiles`
        console.log('le profil est ajouté dans le store')
        console.log('state.profiles=',state.profiles) // Add this line
      } else {
        // Si les données de profil existent déjà, mettez-les à jour avec les nouvelles données
        console.log('Updating profile in Firebase')
        await update(profileRef, data);
        snapshot = await get(profileRef); // Récupérez à nouveau les données pour vous assurer qu'elles ont été mises à jour
        const index = state.profiles.findIndex(profile => profile.id === idUser); // Trouvez l'index du profil à mettre à jour
        if (index !== -1) {
          state.profiles[index] = { id: idUser, ...snapshot.val() }; // Mettez à jour le profil dans le tableau `profiles`
        }
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
    async initializeData({ commit, state }) {
      console.log('initializeData')
      const db = getDatabase();
      
      // Récupérer l'ID de l'utilisateur actuel
      const currentUserId = state.currentUser.id;
    
      // Récupérer l'utilisateur actuel de Firebase
      const userRef = ref(db, '/users/' + currentUserId);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        throw new Error('No user data available');
      }
      const currentUser = userSnapshot.val();
    
      // Récupérer le profil de l'utilisateur actuel de Firebase
      const profileRef = ref(db, '/profiles/' + currentUserId);
      console.log('profileRef=',profileRef)
      const profileSnapshot = await get(profileRef);
      console.log('profileSnapshot=',profileSnapshot)
      if (!profileSnapshot.exists()) {
        console.log('No profile data available');
        return;
      }
      const currentProfile = profileSnapshot.val();
    
      // Si l'utilisateur actuel n'a pas de groupes, récupérer seulement les données de l'utilisateur et du profil
      if (!currentUser.groups || currentUser.groups.length === 0) {
        console.log('No groups available');
        console.log('currentUser=',currentUser)
        console.log('currentProfile=',currentProfile)
        console.log('state.users=',state)
        commit('setUsers', [currentUser]);
        commit('setProfiles', [currentProfile]);
        return;
      }
    
      // Récupérer les groupes de l'utilisateur actuel de Firebase
      const groupPromises = currentUser.groups.map(groupId => {
        const groupRef = ref(db, '/groups/' + groupId);
        return get(groupRef);
      });
      console.log('groupPromises=',groupPromises)
      const groupSnapshots = await Promise.all(groupPromises);
    
      // Vérifier si chaque snapshot existe avant d'utiliser snapshot.val()
      const currentUserGroups = groupSnapshots.reduce((groups, snapshot) => {
        if (snapshot && snapshot.exists()) {
          groups.push(snapshot.val());
        }
        return groups;
      }, []);
    
      // Récupérer les ID des membres de tous les groupes de l'utilisateur actuel
      const memberIds = currentUserGroups.flatMap(group => group.members);
    
      // Récupérer tous les utilisateurs et profils de Firebase
      const usersRef = ref(db, '/users');
      const usersSnapshot = await get(usersRef);
      if (!usersSnapshot.exists()) {
        throw new Error('No users data available');
      }
      const users = Object.values(usersSnapshot.val());
    
      const profilesRef = ref(db, '/profiles');
      const profilesSnapshot = await get(profilesRef);
      if (!profilesSnapshot.exists()) {
        throw new Error('No profiles data available');
      }
    
      // Convertir profilesSnapshot.val() en un tableau
      const profilesData = profilesSnapshot.val();
      const profiles = Object.keys(profilesData).map(key => ({
        id: key,
        ...profilesData[key]
      }));
    
      // Filtrer les utilisateurs et les profils qui ont un ID dans la liste des membres
      const filteredUsers = users.filter(user => memberIds.includes(user.id));
      const filteredProfiles = profiles.filter(profile => memberIds.includes(profile.id));
    
      // Commit les mutations pour remplacer les utilisateurs, les groupes et les profils dans le store
      commit('setUsers', filteredUsers);
      commit('setGroups', currentUserGroups);
      commit('setProfiles', filteredProfiles);
      console.log('filteredGroups=',currentUserGroups);
      console.log('state.users=',state)
    },
    async subscribeToDataUpdates({ commit, state }) {
      const db = getDatabase();
      const currentUserId = state.currentUser.id;
    
      // Subscribe to updates of the current user's groups
      const userRef = ref(db, '/users/' + currentUserId);
      onValue(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const currentUserGroups = userData.groups || [];
          console.log('Current user groups:', currentUserGroups);
    
          // Get the IDs of all members in the current user's groups
          const groupPromises = currentUserGroups.map(async groupId => {
            const groupRef = ref(db, '/groups/' + groupId);
            const snapshot = await get(groupRef);
            if (snapshot.exists()) {
              const groupData = snapshot.val();
              console.log('Group data for group ID ' + groupId + ':', groupData);
              commit('setGroups', groupData); // You need to create this mutation
              return groupData.members || [];
            } else {
              console.log('No data for group ID ' + groupId);
              return [];
            }
          });

          const memberIds = await Promise.all(groupPromises)
            .then(groupMembers => groupMembers.flat());
          console.log('Member IDs:', memberIds);
    
          // Subscribe to updates of the users and profiles in the current user's groups
          const usersRef = ref(db, '/users');
          onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            const usersArray = Object.values(data || {}).filter(userData => memberIds.includes(userData.id));
            console.log('Users array:', usersArray);
            commit('setUsers', usersArray);
          });

          const profilesRef = ref(db, '/profiles');
          onValue(profilesRef, (snapshot) => {
            const data = snapshot.val();
            const profilesArray = Object.values(data || {}).filter(profileData => memberIds.includes(profileData.id));
            console.log('Profiles array:', profilesArray);
            commit('setProfiles', profilesArray);
          });
        }
      });
    },
    async addUser({ commit, state }, newUser) {
      console.log('addUser')
      const encodedSummonerName = encodeURIComponent(newUser.pseudo);
      const cleanedTag = newUser.tag.replace('#', '');
      const usersRef = ref(db, 'users');
      const apiKey = import.meta.env.VITE_APP_API_KEY;
      console.log('apiKey=',apiKey, 'test')
    
      try {
        const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedSummonerName}/${cleanedTag}`,
          {
            headers: {
              'X-Riot-Token': apiKey,
              'x-requested-with': 'XMLHttpRequest'
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
    async fetchProfile({ commit, state }, { summonerName, tag, idUser, groupId = null }) {
      console.log('fetchProfile')
      console.log('groupId=',groupId)
      // Récupérer l'heure actuelle
      const now = Date.now();
    
      // Vérifier si le profil existe déjà
      const existingProfile = state.profiles.find(profile => profile.id === idUser);
      if (existingProfile) {
        console.log('Existing profile:', existingProfile); // Ajoutez cette ligne
        // Si le dernier fetch a été fait il y a moins de 5 minutes, ne pas fetch à nouveau
        let lastFetch = existingProfile.lastFetch;
        console.log('lastFetch:', lastFetch); // Ajoutez cette ligne
        console.log('now:', now); // Ajoutez cette ligne
        console.log('Difference in minutes:', (now - lastFetch) / (60 * 1000)); // Ajoutez cette ligne
        if (lastFetch && now - lastFetch < 5 * 60 * 1000) {
          console.log('Less than 5 minutes since last fetch, returning...'); // Ajoutez cette ligne
          return;
        }
      }
    
      // Si un groupId est fourni, vérifier l'appartenance au groupe
      if (groupId) {
        const groupRef = ref(db, 'groups/' + groupId);
        const snapshot = await get(groupRef);

        if (snapshot.exists()) {
          const groupData = snapshot.val();

          // Vérifier si l'utilisateur fait partie du groupe
          if (!groupData.members.includes(idUser)) {
            return;
          }
        }
      }


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
            'X-Riot-Token': apiKey,
            'x-requested-with': 'XMLHttpRequest'
          }
        });
  
        const puuid = response.data.puuid;
        const secondUrl = `https://cors-anywhere.herokuapp.com/https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  
        const secondResponse = await axios.get(secondUrl, {
          headers: {
            'X-Riot-Token': apiKey,
            'x-requested-with': 'XMLHttpRequest'
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
            'X-Riot-Token': apiKey,
            'x-requested-with': 'XMLHttpRequest'
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
              lastFetch: now,
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