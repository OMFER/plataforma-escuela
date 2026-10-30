import type { NuevoUsuario, Rol, Usuario } from '../entities/Usuario';

export interface UsuariosRepository {
  obtenerActual(): Promise<Usuario>;
  listar(rol?: Rol): Promise<Usuario[]>;
  crear(datos: NuevoUsuario): Promise<Usuario>;
}
