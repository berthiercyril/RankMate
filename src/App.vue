<script>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar,
  },
  setup() {
    const store = useStore();

    onMounted(() => {
      store.dispatch('subscribeToDataUpdates');
    });
  },
};
</script>

<template>
    <Navbar /> 

    <div class="container-fluid">
        <router-view></router-view>
    </div>

</template>

<style scoped>

</style>
