import type { Sesion } from '../../domain/entities/Usuario';
import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { SesionRepository } from '../../domain/repositories/SesionRepository';

export class IniciarSesion {
  private readonly auth: AuthRepository;
  private readonly sesiones: SesionRepository;

  constructor(auth: AuthRepository, sesiones: SesionRepository) {
    this.auth = auth;
    this.sesiones = sesiones;
  }

  async ejecutar(correo: string, password: string): Promise<Sesion> {
    const correoLimpio = correo.trim().toLowerCase();
    if (!correoLimpio || !password) {
      throw new ErrorAplicacion('Escribe tu correo y tu contraseña.', 400);
    }
    const sesion = await this.auth.iniciarSesion(correoLimpio, password);
    this.sesiones.guardar(sesion);
    return sesion;
  }
}
