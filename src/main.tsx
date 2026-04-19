import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './components/AuthProvider.tsx';
import LoginGuard from './components/LoginGuard.tsx';

window.addEventListener('error', (e: ErrorEvent) => {
  const msg = e.message || '';
  if (msg.includes('Loading chunk') || msg.includes('Failed to fetch dynamically imported module') || msg.includes('Importing a module script failed')) {
    if (!sessionStorage.getItem('__chunk_reload')) {
      sessionStorage.setItem('__chunk_reload', '1');
      location.reload();
    }
  }
});
window.addEventListener('load', () => sessionStorage.removeItem('__chunk_reload'));

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <LoginGuard>
      <App />
    </LoginGuard>
  </AuthProvider>,
);
