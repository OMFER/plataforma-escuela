import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Las páginas se cargan en diferido (React.lazy): con la máquina cargada tardan más del segundo por defecto
configure({ asyncUtilTimeout: 5000 });

// jsdom no implementa el scroll de la ventana
window.scrollTo = vi.fn() as typeof window.scrollTo;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
