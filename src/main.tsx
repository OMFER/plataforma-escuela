import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { crearContenedor } from './di/container';
import { AppProviders } from './presentation/providers/AppProviders';
import { AppRoutes } from './presentation/routes/AppRoutes';
import './presentation/theme.css';

// Composition root: se arma el contenedor una sola vez y se inyecta en la presentación.
const dependencias = crearContenedor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders dependencias={dependencias}>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);
