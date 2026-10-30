import type { Sesion } from '../entities/Usuario';

export interface AuthRepository {
  iniciarSesion(correo: string, password: string): Promise<Sesion>;
}
