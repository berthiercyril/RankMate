import 'bootstrap/dist/css/bootstrap.css'
import 'jquery'
import 'popper.js'
import 'bootstrap'
import './assets/main.css'
import './assets/base.css'

import { createApp, onMounted } from 'vue' // Import onMounted from 'vue'
import { useStore } from 'vuex' // Import useStore from 'vuex'
import App from './App.vue'
import router from './router'
import store from './store';

const app = createApp(App)

app.use(router)

app.use(store)

app.mount('#app')

// Access the store
const storeInstance = useStore();

// Load groups when the app is mounted
onMounted(() => {
  storeInstance.dispatch('loadGroups');
});