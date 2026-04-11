import './assets/css/chronicle.css';
import Dashboard from './pages/Dashboard.vue';
import { createApp } from 'vue';
import i18n from './plugins/i18n';

const app = createApp(Dashboard);
app.use(i18n);
app.mount('body');
