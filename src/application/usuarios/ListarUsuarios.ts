import type { Rol, Usuario } from '../../domain/entities/Usuario';
import type { UsuariosRepository } from '../../domain/repositories/UsuariosRepository';

export class ListarUsuarios {
  private readonly usuarios: UsuariosRepository;

  constructor(usuarios: UsuariosRepository) {
    this.usuarios = usuarios;
  }

  ejecutar(rol?: Rol): Promise<Usuario[]> {
    return this.usuarios.listar(rol);
  }
}
