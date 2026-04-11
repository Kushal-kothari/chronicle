import '../assets/css/chronicle.css';
import { createApp, Component } from 'vue';
import i18n from '../plugins/i18n';

export function mountApp(RootComponent: Component): void {
  const app = createApp(RootComponent);
  app.use(i18n);
  app.mount('body');
}
