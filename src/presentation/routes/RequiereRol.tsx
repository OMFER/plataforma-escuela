import { Navigate, Outlet } from 'react-router-dom';
import type { Rol } from '../../domain/entities/Usuario';
import { useUsuarioActual } from '../providers/SesionContext';
import { inicioPorRol } from './rutas';

/** Si el rol no está permitido, lleva al inicio de su propio rol. */
export const RequiereRol = ({ roles }: { roles: Rol[] }) => {
  const usuario = useUsuarioActual();
  if (!roles.includes(usuario.rol)) return <Navigate to={inicioPorRol(usuario.rol)} replace />;
  return <Outlet />;
};
