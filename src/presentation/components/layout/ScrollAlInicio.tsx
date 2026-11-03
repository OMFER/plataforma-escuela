import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { irArribaDeLaPagina } from '../../utils/scroll';

/**
 * Al cambiar de pantalla, la página empieza desde arriba
 * (si no, el navegador conserva el scroll de la pantalla anterior).
 */
export const ScrollAlInicio = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    irArribaDeLaPagina();
  }, [pathname]);
  return null;
};
