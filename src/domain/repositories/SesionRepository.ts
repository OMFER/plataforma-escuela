import type { Sesion } from '../entities/Usuario';

/** Persistencia local de la sesión del usuario. */
export interface SesionRepository {
  obtener(): Sesion | null;
  guardar(sesion: Sesion): void;
  limpiar(): void;
}
