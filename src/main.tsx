import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@react-spectrum/s2/page.css';
import './index.css';
import { AppRoot } from './AppRoot';
import reportWebVitals from './reportWebVitals.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);

reportWebVitals();
