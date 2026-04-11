import './assets/css/chronicle.css';
import Popup from './pages/Popup.vue';
import { createApp } from 'vue';
import i18n from './plugins/i18n';

const app = createApp(Popup);
app.use(i18n);
app.mount('body');
