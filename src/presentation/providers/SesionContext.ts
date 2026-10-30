import { createContext, useContext } from 'react';
import type { Sesion, Usuario } from '../../domain/entities/Usuario';

export interface ValorSesion {
  sesion: Sesion | null;
  usuario: Usuario | null;
  /** Mensaje a mostrar en el login cuando la sesión expiró (401). */
  aviso: string | null;
  iniciarSesion(correo: string, password: string): Promise<Sesion>;
  cerrarSesion(): void;
}

export const SesionContext = createContext<ValorSesion | null>(null);

export const useSesion = (): ValorSesion => {
  const valor = useContext(SesionContext);
  if (!valor) throw new Error('useSesion debe usarse dentro de <SesionProvider>.');
  return valor;
};

/** Usuario autenticado; solo usar dentro de rutas protegidas. */
export const useUsuarioActual = (): Usuario => {
  const { usuario } = useSesion();
  if (!usuario) throw new Error('No hay usuario autenticado.');
  return usuario;
};
