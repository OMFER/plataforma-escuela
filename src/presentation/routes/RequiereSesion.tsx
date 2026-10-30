import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSesion } from '../providers/SesionContext';
import { rutas } from './rutas';

/** Sin sesión → /login (recordando a dónde quería ir el usuario). */
export const RequiereSesion = () => {
  const { sesion } = useSesion();
  const location = useLocation();
  if (!sesion) return <Navigate to={rutas.login} replace state={{ desde: location.pathname }} />;
  return <Outlet />;
};
