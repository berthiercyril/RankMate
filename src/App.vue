<script>
import { onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'App',
  setup() {
    const store = useStore();

    onMounted(() => {
      store.dispatch('subscribeToDataUpdates');

    });
  },
};
</script>

<template>
    <div class="container-fluid">
        <router-view></router-view>
    </div>
</template>

<style scoped>

</style>
