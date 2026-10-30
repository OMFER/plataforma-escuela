import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Sesion } from '../domain/entities/Usuario';
import { AppProviders } from '../presentation/providers/AppProviders';
import { AppRoutes } from '../presentation/routes/AppRoutes';
import { crearDependenciasFalsas, crearRepositoriosFalsos, type Repositorios } from './fakes';

interface OpcionesRender {
  sesion?: Sesion | null;
  /** Permite sembrar datos en los repositorios antes de renderizar. */
  preparar?: (repos: Repositorios) => void;
}

/** Renderiza la app completa (rutas incluidas) con repositorios en memoria. */
export const renderApp = (ruta: string, { sesion = null, preparar }: OpcionesRender = {}) => {
  const repos = crearRepositoriosFalsos(sesion);
  preparar?.(repos);
  const dependencias = crearDependenciasFalsas(repos);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const utils = render(
    <MemoryRouter initialEntries={[ruta]}>
      <AppProviders dependencias={dependencias} queryClient={queryClient}>
        <AppRoutes />
      </AppProviders>
    </MemoryRouter>,
  );
  return { ...utils, repos, dependencias };
};
