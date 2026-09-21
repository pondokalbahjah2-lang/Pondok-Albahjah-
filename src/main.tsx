import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Mount React safely to root
const rootEl = document.getElementById('root');
if (rootEl) {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (mountErr) {
    console.error('Failed mounting root component:', mountErr);
  }
}

// Safely register PWA Service Worker non-blockingly without halting execution
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      import('virtual:pwa-register')
        .then(({ registerSW }) => {
          registerSW({
            immediate: true,
            onRegisterError(err) {
              console.warn('Service Worker registration skipped or failed:', err);
            },
          });
        })
        .catch((e) => {
          console.warn('Service worker module load ignored:', e);
        });
    } catch (swErr) {
      console.warn('Service worker check ignored:', swErr);
    }
  });
}

