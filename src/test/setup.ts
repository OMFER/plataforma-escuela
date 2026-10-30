import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

// Las páginas se cargan en diferido (React.lazy): con la máquina cargada tardan más del segundo por defecto
configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
