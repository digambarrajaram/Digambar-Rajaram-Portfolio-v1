import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isDev = typeof process !== 'undefined'
  ? process.env.NODE_ENV === 'development'
  : import.meta?.env?.MODE === 'development';

const devErrorFilter = (message: string) => {
  const normalized = message?.toLowerCase();
  return /websocket/.test(normalized) && /\b(?:vite|hmr|hot module replacement)\b/.test(normalized) && /\b(?:fail|failed|close|closed|disconnect|disconnected)\b/.test(normalized);
};

if (isBrowser && isDev) {
  const runtime = window as Window & { __sre_dev_error_filter_installed__?: boolean };
  if (!runtime.__sre_dev_error_filter_installed__) {
    runtime.__sre_dev_error_filter_installed__ = true;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === 'string'
        ? reason
        : reason?.message ?? String(reason ?? '');

      if (devErrorFilter(message)) {
        event.preventDefault();
        console.warn('🛡️ SRE Alert Filtered: Dev server HMR/WebSocket rejection suppressed.', message);
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      const message = event.message || '';

      if (devErrorFilter(message)) {
        event.preventDefault();
        console.warn('🛡️ SRE Alert Filtered: Dev server HMR/WebSocket error suppressed.', message);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleWindowError);
  }
}

const rootElement = isBrowser ? document.getElementById('root') : null;
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else if (isBrowser) {
  console.error('React root element not found: #root');
}

