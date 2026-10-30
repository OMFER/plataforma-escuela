import { esRol, type Sesion } from '../../domain/entities/Usuario';
import type { SesionRepository } from '../../domain/repositories/SesionRepository';

const CLAVE = 'portal-academico.sesion';

const esSesion = (valor: unknown): valor is Sesion => {
  if (typeof valor !== 'object' || valor === null) return false;
  const { token, usuario } = valor as Partial<Sesion>;
  return (
    typeof token === 'string' &&
    token.length > 0 &&
    typeof usuario === 'object' &&
    usuario !== null &&
    typeof usuario.id === 'string' &&
    typeof usuario.nombre === 'string' &&
    esRol(usuario.rol)
  );
};

/** Guarda la sesión en localStorage. Si el almacenamiento no está disponible, la conserva en memoria. */
export class LocalStorageSesionRepository implements SesionRepository {
  private enMemoria: Sesion | null = null;
  private readonly almacen: () => Storage;

  constructor(almacen: () => Storage = () => window.localStorage) {
    this.almacen = almacen;
  }

  obtener(): Sesion | null {
    try {
      const texto = this.almacen().getItem(CLAVE);
      if (!texto) return this.enMemoria;
      const valor: unknown = JSON.parse(texto);
      return esSesion(valor) ? valor : null;
    } catch {
      return this.enMemoria;
    }
  }

  guardar(sesion: Sesion): void {
    this.enMemoria = sesion;
    try {
      this.almacen().setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      // Almacenamiento bloqueado (modo privado, cuota): la sesión vive solo en memoria.
    }
  }

  limpiar(): void {
    this.enMemoria = null;
    try {
      this.almacen().removeItem(CLAVE);
    } catch {
      // Nada que limpiar si el almacenamiento no está disponible.
    }
  }
}
