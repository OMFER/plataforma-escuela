import { useCallback, useEffect, useRef, useState } from 'react';

/** Estado de un menú desplegable: se cierra al hacer clic fuera de él o con Escape. */
export const useMenuDesplegable = <T extends HTMLElement = HTMLDivElement>() => {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<T>(null);

  const alternar = useCallback(() => setAbierto((a) => !a), []);
  const cerrar = useCallback(() => setAbierto(false), []);

  useEffect(() => {
    if (!abierto) return;
    const alHacerClic = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', alHacerClic);
    document.addEventListener('keydown', alPresionar);
    return () => {
      document.removeEventListener('mousedown', alHacerClic);
      document.removeEventListener('keydown', alPresionar);
    };
  }, [abierto]);

  return { abierto, alternar, cerrar, contenedor };
};
