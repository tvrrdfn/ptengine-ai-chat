import { createApp, h } from 'vue';
// import { pinia } from '@/store';
// import router from '@router/router';
import App from './App.vue';
// import i18n from '@assets/i18n/index';

const app = createApp({
    render: () => h(App)
});


// app.use(pinia)
//     .use(router)
//     .use(i18n)
app.mount('#app');


