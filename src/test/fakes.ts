import type { Dependencias } from '../application/CasosDeUso';
import { crearCasosDeUso } from '../application/crearCasosDeUso';
import type { CalificacionesAlumno } from '../domain/entities/Calificaciones';
import type { CambiosContenidoSemana, ContenidoSemana, NuevoContenidoSemana } from '../domain/entities/Contenido';
import type {
  CambiosExamen,
  Examen,
  ExamenGrupo,
  IntentoAlumno,
  NuevoExamen,
  Pregunta,
  PreguntaRevisada,
  ResultadoConRevision,
  ResumenExamen,
} from '../domain/entities/Examen';
import type { Grupo, NuevoGrupo } from '../domain/entities/Grupo';
import type { CambiosMateria, Materia, NuevaMateria } from '../domain/entities/Materia';
import type { NuevoUsuario, Rol, Sesion, Usuario } from '../domain/entities/Usuario';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import type { AuthRepository } from '../domain/repositories/AuthRepository';
import type { ContenidoRepository } from '../domain/repositories/ContenidoRepository';
import type { ExamenesGrupoRepository } from '../domain/repositories/ExamenesGrupoRepository';
import type { ExamenesRepository } from '../domain/repositories/ExamenesRepository';
import type { GruposRepository } from '../domain/repositories/GruposRepository';
import type { MateriasRepository } from '../domain/repositories/MateriasRepository';
import type { SesionRepository } from '../domain/repositories/SesionRepository';
import type { UsuariosRepository } from '../domain/repositories/UsuariosRepository';

export const usuarioAlumno: Usuario = { id: 'u1', nombre: 'Ana López', correo: 'ana@escuela.mx', rol: 'alumno' };
export const usuarioMaestro: Usuario = { id: 'u2', nombre: 'Carlos Ruiz', correo: 'carlos@escuela.mx', rol: 'maestro' };
export const usuarioAdmin: Usuario = { id: 'u3', nombre: 'Rosa Díaz', correo: 'rosa@escuela.mx', rol: 'admin' };

export const materiaEjemplo: Materia = {
  id: 'm1',
  nombre: 'Creatividad e innovación tecnológica',
  totalSemanas: 3,
};

export const grupoEjemplo: Grupo = {
  id: 'g1',
  nombre: '05',
  periodo: '2026-B',
  aula: '106',
  fechaInicio: '2026-08-03T00:00:00.000Z',
  materia: materiaEjemplo,
  maestro: { id: 'u2', nombre: 'Carlos Ruiz', correo: 'carlos@escuela.mx' },
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
  /** Ids de materias que tienen grupos: eliminarlas responde 409 como el backend. */
  conGrupos = new Set<string>();
  creadas: NuevaMateria[] = [];
  actualizaciones: { id: string; cambios: CambiosMateria }[] = [];
  async listar() {
    return [...this.lista];
  }
  async crear(datos: NuevaMateria): Promise<Materia> {
    this.creadas.push(datos);
    const materia: Materia = { id: `m${this.lista.length + 1}`, nombre: datos.nombre, totalSemanas: datos.totalSemanas ?? 16 };
    if (datos.descripcion) materia.descripcion = datos.descripcion;
    this.lista.push(materia);
    return materia;
  }
  async actualizar(id: string, cambios: CambiosMateria): Promise<Materia> {
    this.actualizaciones.push({ id, cambios });
    const actual = this.lista.find((m) => m.id === id);
    if (!actual) throw new ErrorAplicacion('No existe', 404);
    Object.assign(actual, cambios);
    return actual;
  }
  async eliminar(id: string) {
    if (this.conGrupos.has(id)) {
      throw new ErrorAplicacion('No se puede eliminar la materia porque tiene grupos.', 409);
    }
    this.lista = this.lista.filter((m) => m.id !== id);
  }
}

export class GruposFalso implements GruposRepository {
  lista: Grupo[] = [];
  alumnos: Record<string, Usuario[]> = {};
  calificaciones: Record<string, CalificacionesAlumno[]> = {};
  creados: NuevoGrupo[] = [];
  async obtenerMios() {
    return [...this.lista];
  }
  async listar() {
    return [...this.lista];
  }
  async obtenerPorId(id: string) {
    return this.lista.find((g) => g.id === id) ?? null;
  }
  async crear(datos: NuevoGrupo): Promise<Grupo> {
    this.creados.push(datos);
    const grupo: Grupo = {
      ...grupoEjemplo,
      id: `g${this.lista.length + 1}`,
      nombre: datos.nombre,
      periodo: datos.periodo,
      aula: datos.aula,
      fechaInicio: datos.fechaInicio,
    };
    this.lista.push(grupo);
    return grupo;
  }
  async eliminar(id: string) {
    this.lista = this.lista.filter((g) => g.id !== id);
  }
  async listarAlumnos(grupoId: string) {
    return this.alumnos[grupoId] ?? [];
  }
  async inscribirAlumnos(grupoId: string, alumnoIds: string[]) {
    const actuales = this.alumnos[grupoId] ?? [];
    const nuevos = alumnoIds.map((id) => ({ id, nombre: id, correo: `${id}@x.mx`, rol: 'alumno' as const }));
    this.alumnos[grupoId] = [...actuales, ...nuevos];
    return this.alumnos[grupoId];
  }
  async darDeBajaAlumno(grupoId: string, alumnoId: string) {
    this.alumnos[grupoId] = (this.alumnos[grupoId] ?? []).filter((a) => a.id !== alumnoId);
  }
  async obtenerCalificaciones(grupoId: string) {
    return this.calificaciones[grupoId] ?? [];
  }
}

export class ContenidoFalso implements ContenidoRepository {
  lista: ContenidoSemana[] = [];
  creados: NuevoContenidoSemana[] = [];
  actualizados: { id: string; cambios: CambiosContenidoSemana }[] = [];
  eliminados: string[] = [];
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
  async eliminar(id: string) {
    this.eliminados.push(id);
    this.lista = this.lista.filter((c) => c.id !== id);
  }
}

export class ExamenesFalso implements ExamenesRepository {
  lista: Examen[] = [];
  creados: NuevoExamen[] = [];
  actualizaciones: { id: string; cambios: CambiosExamen }[] = [];
  /** Si se define, eliminar responde con este error (p. ej. el 409 de un Semanal con Reposición). */
  errorAlEliminar: ErrorAplicacion | null = null;
  async obtenerPorId(id: string) {
    return this.lista.find((e) => e.id === id) ?? null;
  }
  async crear(datos: NuevoExamen): Promise<Examen> {
    this.creados.push(datos);
    const repetido = this.lista.some(
      (e) => e.materiaId === datos.materiaId && e.tipo === datos.tipo && (datos.tipo === 'Final' || e.semana === datos.semana),
    );
    if (repetido) throw new ErrorAplicacion('Ya existe un examen de ese tipo en esa semana.', 409);
    const nuevo: Examen = {
      id: `e${this.lista.length + 1}`,
      materiaId: datos.materiaId,
      tipo: datos.tipo,
      ...(datos.semana !== undefined ? { semana: datos.semana } : {}),
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      puntajeMaximo: datos.puntajeMaximo ?? 100,
      diasExtra: datos.diasExtra ?? 0,
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
  async eliminar(id: string) {
    if (this.errorAlEliminar) throw this.errorAlEliminar;
    this.lista = this.lista.filter((e) => e.id !== id);
  }
}

/** Examen sembrado en un grupo, con las preguntas completas (las respuestas solo se exponen en la revisión). */
export interface ExamenSembrado {
  grupoId: string;
  resumen: ResumenExamen;
  preguntas: Pregunta[];
  /** Respuestas del alumno si ya respondió. */
  respuestas?: number[];
}

const revisar = (preguntas: Pregunta[], respuestas: number[]): PreguntaRevisada[] =>
  preguntas.map((p, i) => ({
    id: p.id ?? `p${i + 1}`,
    enunciado: p.enunciado,
    opciones: p.opciones,
    respuestaCorrecta: p.respuestaCorrecta,
    miRespuesta: respuestas[i] ?? -1,
    acierto: respuestas[i] === p.respuestaCorrecta,
  }));

/** Simula la vista del alumno: mismas reglas de ventana, intento único y revisión que el backend. */
export class ExamenesGrupoFalso implements ExamenesGrupoRepository {
  lista: ExamenSembrado[] = [];
  respuestasRecibidas: number[][] = [];
  intentos: IntentoAlumno[] = [];

  private buscar(grupoId: string, examenId: string) {
    return this.lista.find((e) => e.grupoId === grupoId && e.resumen.id === examenId);
  }

  async listar(grupoId: string) {
    return this.lista.filter((e) => e.grupoId === grupoId).map((e) => e.resumen);
  }

  async obtenerPorSemana(grupoId: string, semana: number) {
    const deLaSemana = this.lista.filter((e) => e.grupoId === grupoId && e.resumen.semana === semana);
    return {
      semanal: deLaSemana.find((e) => e.resumen.tipo === 'Semanal')?.resumen ?? null,
      reposicion: deLaSemana.find((e) => e.resumen.tipo === 'Reposicion')?.resumen ?? null,
    };
  }

  async obtener(grupoId: string, examenId: string): Promise<ExamenGrupo | null> {
    const examen = this.buscar(grupoId, examenId);
    if (!examen) return null;
    const { resumen, preguntas, respuestas } = examen;
    if (resumen.miIntento && respuestas) return { ...resumen, preguntas: revisar(preguntas, respuestas) };
    if (resumen.ventana.estado !== 'abierta') return { ...resumen, preguntas: [] };
    return {
      ...resumen,
      preguntas: preguntas.map((p, i) => ({ id: p.id ?? `p${i + 1}`, enunciado: p.enunciado, opciones: p.opciones })),
    };
  }

  async responder(grupoId: string, examenId: string, respuestas: number[]): Promise<ResultadoConRevision> {
    this.respuestasRecibidas.push(respuestas);
    const examen = this.buscar(grupoId, examenId);
    if (!examen) throw new ErrorAplicacion('No existe', 404);
    if (examen.resumen.ventana.estado === 'cerrada') throw new ErrorAplicacion('El examen ya cerró', 403);
    if (examen.resumen.ventana.estado === 'proxima') throw new ErrorAplicacion('El examen todavía no abre', 403);
    if (examen.resumen.miIntento) throw new ErrorAplicacion('Ya respondiste este examen', 409);
    if (respuestas.length !== examen.preguntas.length) throw new ErrorAplicacion('Cantidad de respuestas incorrecta', 400);
    const revision = revisar(examen.preguntas, respuestas);
    const aciertos = revision.filter((p) => p.acierto).length;
    const resultado = {
      aciertos,
      totalPreguntas: examen.preguntas.length,
      calificacion: (aciertos / examen.preguntas.length) * examen.resumen.puntajeMaximo,
      fecha: '2026-08-12T15:00:00.000Z',
    };
    examen.resumen = { ...examen.resumen, miIntento: resultado };
    examen.respuestas = respuestas;
    return { ...resultado, revision };
  }

  async obtenerIntentos(_grupoId: string, examenId: string) {
    return this.intentos.filter((i) => i.examenId === examenId);
  }
}

export interface Repositorios {
  sesiones: SesionEnMemoria;
  auth: AuthFalso;
  usuarios: UsuariosFalso;
  materias: MateriasFalso;
  grupos: GruposFalso;
  contenido: ContenidoFalso;
  examenes: ExamenesFalso;
  examenesGrupo: ExamenesGrupoFalso;
}

export const crearRepositoriosFalsos = (sesion: Sesion | null = null): Repositorios => ({
  sesiones: new SesionEnMemoria(sesion),
  auth: new AuthFalso(),
  usuarios: new UsuariosFalso(),
  materias: new MateriasFalso(),
  grupos: new GruposFalso(),
  contenido: new ContenidoFalso(),
  examenes: new ExamenesFalso(),
  examenesGrupo: new ExamenesGrupoFalso(),
});

/** Mismo cableado que el composition root, pero con repositorios en memoria. */
export const crearDependenciasFalsas = (r: Repositorios): Dependencias & { expirarSesion: () => void } => {
  const oyentes = new Set<() => void>();
  return {
    casosDeUso: crearCasosDeUso(r),
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
