import { useCallback, useEffect, useState } from 'react';

const CONSULTA_ESCRITORIO = '(min-width: 768px)';

/** En pantallas chicas el menú lateral flota sobre el contenido; en escritorio lo empuja. */
export const esPantallaChica = (): boolean =>
  typeof window.matchMedia === 'function' && !window.matchMedia(CONSULTA_ESCRITORIO).matches;

/** Estado del menú lateral: abierto por defecto en escritorio y cerrado en celular. */
export const useMenuLateral = () => {
  const [abierto, setAbierto] = useState(() => !esPantallaChica());

  const alternar = useCallback(() => setAbierto((a) => !a), []);
  const cerrar = useCallback(() => setAbierto(false), []);
  /** Al navegar en celular se cierra para dejar ver la pantalla nueva. */
  const alNavegar = useCallback(() => {
    if (esPantallaChica()) setAbierto(false);
  }, []);

  useEffect(() => {
    if (!abierto || !esPantallaChica()) return;
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [abierto]);

  return { abierto, alternar, cerrar, alNavegar };
};
