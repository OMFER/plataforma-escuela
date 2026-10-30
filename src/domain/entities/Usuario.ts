export const ROLES = ['alumno', 'maestro', 'admin'] as const;
export type Rol = (typeof ROLES)[number];

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  materias?: string[];
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface NuevoUsuario {
  nombre: string;
  correo: string;
  password: string;
  rol: Rol;
}

export const PASSWORD_MIN = 6;

export const esRol = (valor: unknown): valor is Rol =>
  typeof valor === 'string' && (ROLES as readonly string[]).includes(valor);
