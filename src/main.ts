import './styles.css';
import { createApp } from './components/App';

const appContainer = document.getElementById('app');
if (!appContainer) {
  throw new Error('App container not found');
}

const app = createApp();
appContainer.appendChild(app.el);
