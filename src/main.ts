import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import { router } from './router';
import { useAuthStore } from './stores/auth';
import './style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Block first render until we know whether a Firebase session already exists,
// so route guards never briefly redirect to /login before restoring it.
useAuthStore()
  .init()
  .finally(() => {
    app.mount('#app');
  });
