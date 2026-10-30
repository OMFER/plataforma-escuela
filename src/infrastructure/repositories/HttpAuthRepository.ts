import type { Sesion } from '../../domain/entities/Usuario';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { HttpClient } from '../http/HttpClient';
import type { LoginDto } from '../mappers/dtos';
import { aUsuario } from '../mappers/mappers';

export class HttpAuthRepository implements AuthRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async iniciarSesion(correo: string, password: string): Promise<Sesion> {
    const dto = await this.http.post<LoginDto>('/auth/login', { correo, password }, { autenticada: false });
    return { token: dto.access_token, usuario: aUsuario(dto.usuario) };
  }
}
