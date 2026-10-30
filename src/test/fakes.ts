import { CerrarSesion } from '../application/auth/CerrarSesion';
import { IniciarSesion } from '../application/auth/IniciarSesion';
import { ObtenerSesionActual } from '../application/auth/ObtenerSesionActual';
import type { Dependencias } from '../application/CasosDeUso';
import { GuardarContenidoSemana } from '../application/contenido/GuardarContenidoSemana';
import { ObtenerContenidoSemana } from '../application/contenido/ObtenerContenidoSemana';
import { ActualizarExamen } from '../application/examenes/ActualizarExamen';
import { CrearExamen } from '../application/examenes/CrearExamen';
import { ObtenerExamen } from '../application/examenes/ObtenerExamen';
import { ObtenerExamenSemana } from '../application/examenes/ObtenerExamenSemana';
import { ObtenerIntentosExamen } from '../application/examenes/ObtenerIntentosExamen';
import { ResponderExamen } from '../application/examenes/ResponderExamen';
import { CrearMateria } from '../application/materias/CrearMateria';
import { DarDeBajaAlumno } from '../application/materias/DarDeBajaAlumno';
import { InscribirAlumnos } from '../application/materias/InscribirAlumnos';
import { ListarMaterias } from '../application/materias/ListarMaterias';
import { ObtenerAlumnosMateria } from '../application/materias/ObtenerAlumnosMateria';
import { ObtenerMateria } from '../application/materias/ObtenerMateria';
import { ObtenerMisMaterias } from '../application/materias/ObtenerMisMaterias';
import { CrearUsuario } from '../application/usuarios/CrearUsuario';
import { ListarUsuarios } from '../application/usuarios/ListarUsuarios';
import type { CambiosContenidoSemana, ContenidoSemana, NuevoContenidoSemana } from '../domain/entities/Contenido';
import type { CambiosExamen, Examen, IntentoAlumno, NuevoExamen, ResultadoIntento } from '../domain/entities/Examen';
import type { Materia, NuevaMateria } from '../domain/entities/Materia';
import type { NuevoUsuario, Rol, Sesion, Usuario } from '../domain/entities/Usuario';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import type { AuthRepository } from '../domain/repositories/AuthRepository';
import type { ContenidoRepository } from '../domain/repositories/ContenidoRepository';
import type { ExamenesRepository } from '../domain/repositories/ExamenesRepository';
import type { MateriasRepository } from '../domain/repositories/MateriasRepository';
import type { SesionRepository } from '../domain/repositories/SesionRepository';
import type { UsuariosRepository } from '../domain/repositories/UsuariosRepository';

export const usuarioAlumno: Usuario = { id: 'u1', nombre: 'Ana López', correo: 'ana@escuela.mx', rol: 'alumno' };
export const usuarioMaestro: Usuario = { id: 'u2', nombre: 'Carlos Ruiz', correo: 'carlos@escuela.mx', rol: 'maestro' };

export const materiaEjemplo: Materia = {
  id: 'm1',
  nombre: 'Creatividad e innovación tecnológica',
  grupo: '05',
  aula: '106',
  maestro: { id: 'u2', nombre: 'Carlos Ruiz' },
  fechaInicio: '2026-08-03T00:00:00.000Z',
  totalSemanas: 3,
  semanaActual: 2,
  semanas: [
    { numero: 1, inicio: '2026-08-03T00:00:00.000Z', fin: '2026-08-09T00:00:00.000Z', estado: 'completada' },
    { numero: 2, inicio: '2026-08-10T00:00:00.000Z', fin: '2026-08-16T00:00:00.000Z', estado: 'actual' },
    { numero: 3, inicio: '2026-08-17T00:00:00.000Z', fin: '2026-08-23T00:00:00.000Z', estado: 'futura' },
  ],
};

export class SesionEnMemoria implements SesionRepository {
  sesion: Sesion | null;
  constructor(inicial: Sesion | null = null) {
    this.sesion = inicial;
  }
  obtener() {
    return this.sesion;
  }
  guardar(sesion: Sesion) {
    this.sesion = sesion;
  }
  limpiar() {
    this.sesion = null;
  }
}

export class AuthFalso implements AuthRepository {
  usuarios: Record<string, { password: string; usuario: Usuario }> = {};
  async iniciarSesion(correo: string, password: string): Promise<Sesion> {
    const registro = this.usuarios[correo];
    if (!registro || registro.password !== password) throw new ErrorAplicacion('Credenciales inválidas', 401);
    return { token: `token-${registro.usuario.id}`, usuario: registro.usuario };
  }
}

export class UsuariosFalso implements UsuariosRepository {
  lista: Usuario[] = [];
  async obtenerActual() {
    return this.lista[0]!;
  }
  async listar(rol?: Rol) {
    return this.lista.filter((u) => !rol || u.rol === rol);
  }
  async crear(datos: NuevoUsuario) {
    if (this.lista.some((u) => u.correo === datos.correo)) throw new ErrorAplicacion('El correo ya existe', 409);
    const nuevo: Usuario = { id: `u${this.lista.length + 1}`, nombre: datos.nombre, correo: datos.correo, rol: datos.rol };
    this.lista.push(nuevo);
    return nuevo;
  }
}

export class MateriasFalso implements MateriasRepository {
  lista: Materia[] = [];
  alumnos: Record<string, Usuario[]> = {};
  async obtenerMias() {
    return this.lista;
  }
  async obtenerPorId(id: string) {
    return this.lista.find((m) => m.id === id) ?? null;
  }
  async listar() {
    return this.lista;
  }
  async crear(datos: NuevaMateria): Promise<Materia> {
    const materia: Materia = {
      ...materiaEjemplo,
      id: `m${this.lista.length + 1}`,
      nombre: datos.nombre,
      totalSemanas: datos.totalSemanas ?? 16,
    };
    this.lista.push(materia);
    return materia;
  }
  async listarAlumnos(materiaId: string) {
    return this.alumnos[materiaId] ?? [];
  }
  async inscribirAlumnos(materiaId: string, alumnoIds: string[]) {
    const actuales = this.alumnos[materiaId] ?? [];
    const nuevos = alumnoIds.map((id) => ({ id, nombre: id, correo: `${id}@x.mx`, rol: 'alumno' as const }));
    this.alumnos[materiaId] = [...actuales, ...nuevos];
    return this.alumnos[materiaId];
  }
  async darDeBajaAlumno(materiaId: string, alumnoId: string) {
    this.alumnos[materiaId] = (this.alumnos[materiaId] ?? []).filter((a) => a.id !== alumnoId);
  }
}

export class ContenidoFalso implements ContenidoRepository {
  lista: ContenidoSemana[] = [];
  creados: NuevoContenidoSemana[] = [];
  actualizados: { id: string; cambios: CambiosContenidoSemana }[] = [];
  async obtenerPorSemana(materiaId: string, semana: number) {
    return this.lista.find((c) => c.materiaId === materiaId && c.semana === semana) ?? null;
  }
  async crear(datos: NuevoContenidoSemana): Promise<ContenidoSemana> {
    this.creados.push(datos);
    const { materiaId, semana, ...resto } = datos;
    const nuevo: ContenidoSemana = { id: `c${this.lista.length + 1}`, materiaId, semana, ...resto };
    this.lista.push(nuevo);
    return nuevo;
  }
  async actualizar(id: string, cambios: CambiosContenidoSemana): Promise<ContenidoSemana> {
    this.actualizados.push({ id, cambios });
    const actual = this.lista.find((c) => c.id === id);
    if (!actual) throw new ErrorAplicacion('No existe', 404);
    Object.assign(actual, cambios);
    return actual;
  }
}

export class ExamenesFalso implements ExamenesRepository {
  lista: Examen[] = [];
  respuestasRecibidas: number[][] = [];
  actualizaciones: { id: string; cambios: CambiosExamen }[] = [];
  intentos: IntentoAlumno[] = [];
  async obtenerPorSemana(materiaId: string, semana: number) {
    return this.lista.find((e) => e.materiaId === materiaId && e.semana === semana) ?? null;
  }
  async obtenerPorId(id: string) {
    return this.lista.find((e) => e.id === id) ?? null;
  }
  async crear(datos: NuevoExamen): Promise<Examen> {
    const nuevo: Examen = {
      id: `e${this.lista.length + 1}`,
      materiaId: datos.materiaId,
      semana: datos.semana,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      tipo: datos.tipo ?? 'Semanal',
      fechaLimite: datos.fechaLimite,
      puntajeMaximo: datos.puntajeMaximo ?? 100,
      preguntas: datos.preguntas,
    };
    this.lista.push(nuevo);
    return nuevo;
  }
  async actualizar(id: string, cambios: CambiosExamen): Promise<Examen> {
    this.actualizaciones.push({ id, cambios });
    const actual = this.lista.find((e) => e.id === id);
    if (!actual) throw new ErrorAplicacion('No existe', 404);
    Object.assign(actual, cambios);
    return actual;
  }
  async responder(id: string, respuestas: number[]): Promise<ResultadoIntento> {
    this.respuestasRecibidas.push(respuestas);
    const examen = this.lista.find((e) => e.id === id);
    if (!examen) throw new ErrorAplicacion('No existe', 404);
    if (examen.miIntento) throw new ErrorAplicacion('Ya respondiste este examen', 409);
    const aciertos = examen.preguntas.filter((p, i) => p.respuestaCorrecta === respuestas[i]).length;
    const resultado: ResultadoIntento = {
      aciertos,
      totalPreguntas: examen.preguntas.length,
      calificacion: (aciertos / examen.preguntas.length) * examen.puntajeMaximo,
      fecha: '2026-08-12T15:00:00.000Z',
    };
    examen.miIntento = resultado;
    return resultado;
  }
  async obtenerIntentos() {
    return this.intentos;
  }
}

export interface Repositorios {
  sesiones: SesionEnMemoria;
  auth: AuthFalso;
  usuarios: UsuariosFalso;
  materias: MateriasFalso;
  contenido: ContenidoFalso;
  examenes: ExamenesFalso;
}

export const crearRepositoriosFalsos = (sesion: Sesion | null = null): Repositorios => ({
  sesiones: new SesionEnMemoria(sesion),
  auth: new AuthFalso(),
  usuarios: new UsuariosFalso(),
  materias: new MateriasFalso(),
  contenido: new ContenidoFalso(),
  examenes: new ExamenesFalso(),
});

/** Mismo cableado que el composition root, pero con repositorios en memoria. */
export const crearDependenciasFalsas = (r: Repositorios): Dependencias & { expirarSesion: () => void } => {
  const oyentes = new Set<() => void>();
  return {
    casosDeUso: {
      iniciarSesion: new IniciarSesion(r.auth, r.sesiones),
      cerrarSesion: new CerrarSesion(r.sesiones),
      obtenerSesionActual: new ObtenerSesionActual(r.sesiones),
      listarUsuarios: new ListarUsuarios(r.usuarios),
      crearUsuario: new CrearUsuario(r.usuarios),
      obtenerMisMaterias: new ObtenerMisMaterias(r.materias),
      obtenerMateria: new ObtenerMateria(r.materias),
      listarMaterias: new ListarMaterias(r.materias),
      crearMateria: new CrearMateria(r.materias),
      obtenerAlumnosMateria: new ObtenerAlumnosMateria(r.materias),
      inscribirAlumnos: new InscribirAlumnos(r.materias),
      darDeBajaAlumno: new DarDeBajaAlumno(r.materias),
      obtenerContenidoSemana: new ObtenerContenidoSemana(r.contenido),
      guardarContenidoSemana: new GuardarContenidoSemana(r.contenido),
      obtenerExamenSemana: new ObtenerExamenSemana(r.examenes),
      obtenerExamen: new ObtenerExamen(r.examenes),
      responderExamen: new ResponderExamen(r.examenes),
      crearExamen: new CrearExamen(r.examenes),
      actualizarExamen: new ActualizarExamen(r.examenes),
      obtenerIntentosExamen: new ObtenerIntentosExamen(r.examenes),
    },
    eventosSesion: {
      alExpirar: (oyente) => {
        oyentes.add(oyente);
        return () => oyentes.delete(oyente);
      },
    },
    expirarSesion: () => {
      r.sesiones.limpiar();
      oyentes.forEach((o) => o());
    },
  };
};
