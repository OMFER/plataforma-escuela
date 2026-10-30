import { PASSWORD_MIN, esRol, type NuevoUsuario, type Usuario } from '../../domain/entities/Usuario';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { UsuariosRepository } from '../../domain/repositories/UsuariosRepository';

export class CrearUsuario {
  private readonly usuarios: UsuariosRepository;

  constructor(usuarios: UsuariosRepository) {
    this.usuarios = usuarios;
  }

  async ejecutar(datos: NuevoUsuario): Promise<Usuario> {
    const limpio: NuevoUsuario = {
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim().toLowerCase(),
      password: datos.password,
      rol: datos.rol,
    };
    const errores: string[] = [];
    if (!limpio.nombre) errores.push('El nombre es obligatorio.');
    if (!limpio.correo) errores.push('El correo es obligatorio.');
    if (limpio.password.length < PASSWORD_MIN) {
      errores.push(`La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`);
    }
    if (!esRol(limpio.rol)) errores.push('Rol inválido.');
    if (errores.length > 0) throw new ErrorAplicacion(errores, 400);
    return this.usuarios.crear(limpio);
  }
}
