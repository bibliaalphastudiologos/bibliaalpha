import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './components/AuthProvider.tsx';
import LoginGuard from './components/LoginGuard.tsx';

// Remove qualquer Service Worker antigo registrado em versoes anteriores
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('[SW] Service Worker desregistrado:', registration.scope);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <LoginGuard>
      <App />
    </LoginGuard>
  </AuthProvider>,
);
