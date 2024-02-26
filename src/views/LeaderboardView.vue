<script setup>
import UserProfileBar from '../components/UserProfileBar.vue'
import Navbar from '../components/Navbar.vue';
import { ref, computed, watchEffect, onMounted, watch} from 'vue';
import { useStore } from 'vuex';
import { getDatabase, ref as firebaseRef, push as dbPush, set as dbSet } from 'firebase/database'; 
import { db } from '../store/index'; // Assurez-vous que c'est le bon chemin vers votre instance Firebase

const store = useStore();
const groupName = ref('');
const groupCode = ref('');

console.log(store.state);


const createGroup = async () => {
  const group = {
    name: groupName.value,
    members: [store.state.currentUser.id], // Ajoutez l'UID de l'utilisateur actuel au groupe
    // Ajoutez ici d'autres propriétés du groupe si nécessaire
  };

  try {
    const groupsRef = firebaseRef(db, 'groups');
    const newGroupRef = dbPush(groupsRef);
    group.id = newGroupRef.key; // Set the Firebase-generated ID on the group
    store.commit('createGroup', group); // Add the group to the store first
    console.log("Document written with ID: ", newGroupRef.key);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const joinGroup = () => {
  const groupToJoin = store.state.groups.find(g => g.code === groupCode.value);
  if (groupToJoin) {
    console.log(store.state.currentUser.id)
    store.commit('joinGroup', { group: groupToJoin, user: { id: store.state.currentUser.id } });
  } else {
    console.log('No such group!');
  }
};


const userGroups = computed(() => {
  console.log('Evaluating userGroups');
  return store.state.groups.filter(group => {
    console.log('Checking group', group);
    return group.members.includes(store.state.currentUser.id);
  });
});

const tierValues = {
  'IRON': 1,
  'BRONZE': 2,
  'SILVER': 3,
  'GOLD': 4,
  'PLATINUM': 5,
  'EMERALD': 6,
  'DIAMOND': 7,
  'MASTER': 8,
  'GRANDMASTER': 9,
  'CHALLENGER': 10
};

const rankValues = {
  'IV': 1,
  'III': 2,
  'II': 3,
  'I': 4
};


const groupMembersDetails = computed(() => {
  const usersById = Object.fromEntries(store.state.users.map(user => [user.id, user]));

  return store.state.groups.map(group => {
    const members = group.members
      .map(userId => {
        const user = usersById[userId];
        if (!user) {
          // Si l'utilisateur n'existe pas, retournez null
          return null;
        }
        return {
          pseudo: user.pseudo,
          tag: user.tag,
          id: user.id
        };
      })
      .filter(Boolean); // Filtrer les valeurs null

    return members;
  });
});


// trie les utilisateurs par tier, rank et leaguePoints chaque fois que les profils ou les groupes changent
let sortedUsers = ref([]);

watchEffect(() => {
  console.log('Members:', store.state.groups[0].members);
  console.log('Users:', store.state.users);
  console.log('Profiles:', store.state.profiles);

  if (Object.keys(store.state.profiles).length > 0 && store.state.groups.length > 0) {
    console.log('test', store.state.profiles);
    sortedUsers.value = store.state.groups[0].members
      .map(memberId =>{
        const user = store.state.users.find(user => user.id === memberId);
        const profile = store.state.profiles.find(profile => profile.id === memberId);
        if (user && profile) {

          return {
            id: user.id,
            pseudo: user.pseudo,
            tag: user.tag,
            tier: profile.tier === 'Unranked' ? -1 : tierValues[profile.tier.toUpperCase()],
            rank: profile.rank === '' ? -1 : rankValues[profile.rank],
            leaguePoints: profile.leaguePoints === '' ? -1 : profile.leaguePoints,
            medal: ''
          };
        } else {
          console.log(`No user or profile found for member ${memberId}`);
          if (!user) {
            console.log(`User not found for member ${memberId}`);
          }
          if (!profile) {
            console.log(`Profile not found for member ${memberId}`);
          }
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        const tierComparison = b.tier - a.tier;
        if (tierComparison !== 0) {
          return tierComparison;
        }

        const rankComparison = b.rank - a.rank;
        if (rankComparison !== 0) {
          return rankComparison;
        }

        const pointsComparison = b.leaguePoints - a.leaguePoints;
        return pointsComparison;
      });

      // Attribution des médailles après le tri
      if (sortedUsers.value.length > 0) {
        sortedUsers.value[0].medal = 'gold';
      }
      if (sortedUsers.value.length > 1) {
        sortedUsers.value[1].medal = 'silver';
      }
      if (sortedUsers.value.length > 2) {
        sortedUsers.value[2].medal = 'bronze';
      }

    console.log('Sorted users:', sortedUsers.value);
  }
});


const displayedUsers = computed(() => {
  const usersByGroup = {};

  if (sortedUsers.value.length > 0) {
    userGroups.value.forEach(group => {
      usersByGroup[group.id] = sortedUsers.value.filter(user => group.members.includes(user.id));
    });
  } else {
    userGroups.value.forEach(group => {
      usersByGroup[group.id] = groupMembersDetails.value.filter(user => group.members.includes(user.id));
    });
  }
  console.log('Users by group:', usersByGroup)
  return usersByGroup;
});


const activeGroupId = ref(null);

watchEffect(() => {
  if (userGroups.value.length > 0) {
    activeGroupId.value = userGroups.value[0].id;
  }
});

const currentUser = store.state.currentUser;
const currentUserProfile = currentUser ? store.state.profiles.find(profile => profile.id === currentUser.id) : null;

</script>


<template>
  <Navbar :profileIconUrl="currentUserProfile ? currentUserProfile.profileIconUrl : ''" :pseudo="currentUser ? currentUser.pseudo : ''" />  
  <main>
    <div class="container pt-5">
      <h1 class="mb-5">Classements</h1>

      <div class="row justify-content-end">
        <div class="col-3">
          <div class="input-group mb-3">
            <input v-model="groupName" type="username" class="form-control" placeholder="Nom du groupe" aria-label="groupname" aria-describedby="basic-addon1">
            <div class="input-group-append">
              <button @click="createGroup" type="button" class="btn-custom btn">Créer</button>
            </div>
          </div>
        </div>

        <div class="col-3">
          <div class="input-group mb-3">
            <input v-model="groupCode" type="password" class="form-control" placeholder="Code du groupe" aria-label="groupcode" aria-describedby="basic-addon1">
            <div class="input-group-append">
              <button @click="joinGroup" type="button" class="btn-custom btn">Rejoindre</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Nav tabs -->
      <div class="d-flex justify-content-between nav-group">
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation" v-for="group in userGroups" :key="group.id">
            <button class="nav-link" :class="{ active: activeGroupId === group.id }" @click="activeGroupId = group.id">
              {{ group.name }}
            </button>
          </li>
        </ul>
        <button class="btn refresh" @click="fetchData">
          actualiser les données <i class="fa-solid fa-rotate-right"></i>
        </button>
      </div>

      <div class="tab-content">
        <div v-for="(group, groupIndex) in userGroups" :key="group.id" 
            :class="['tab-pane', { active: activeGroupId === group.id }]" 
            role="tabpanel" 
            tabindex="0">
            <UserProfileBar 
              v-for="(user, userIndex) in displayedUsers[group.id]" 
              :key="userIndex" 
              :summonerName="user.pseudo"
              :tag="user.tag"
              :idUser="user.id"
              :medal="user.medal"
            />
        </div>
      </div>
    </div>
  </main>
</template>


<style scoped>
  .nav-link {
    color: #F7EBEC;
    background-color: #0E6BA8;
  }

  .nav-link.active {
    background-color: #1395ec;
    color: #F7EBEC;
    border: none;
  }

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

  .refresh {
    color: #F7EBEC;
    background-color: #0E6BA8;
    border: none;
  }

  .refresh:hover {
    color: #F7EBEC;
    background-color: #1395ec;
    border: none;
  }

  .nav-group {
    border-bottom: 1px solid #dadfed50;
  }

</style>