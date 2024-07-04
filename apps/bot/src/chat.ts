import { createApp } from 'vue';
import pinia from '@/store/index';
import i18n from '@/i18n/i18n';
// import PtUI from '@/components/ptengine-ui/components/index';
import Chat from './Chat.vue';

const app = createApp(Chat);

app.use(pinia).use(i18n).mount('#app');
// .use(PtUI)

