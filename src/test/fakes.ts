import type { Dependencias } from '../application/CasosDeUso';
import { crearCasosDeUso } from '../application/crearCasosDeUso';
import type { CalificacionesGrupo } from '../domain/entities/Calificaciones';
import type { CambiosContenidoSemana, ContenidoSemana, NuevoContenidoSemana } from '../domain/entities/Contenido';
import type {
  CambiosExamen,
  Examen,
  ExamenGrupo,
  NuevoExamen,
  Pregunta,
  PreguntaRevisada,
  ResultadoConRevision,
  ResumenExamen,
} from '../domain/entities/Examen';
import type { Grupo, NuevoGrupo } from '../domain/entities/Grupo';
import type { CambiosMateria, Materia, MateriaConMaestro, MateriaEnPlan, NuevaMateria } from '../domain/entities/Materia';
import type { CambioPlan, NuevoPlan, Plan, PlanDetallado, RevisionPlan } from '../domain/entities/Plan';
import type { NuevoUsuario, Rol, Sesion, Usuario } from '../domain/entities/Usuario';
import { ErrorAplicacion } from '../domain/errors/ErrorAplicacion';
import type { AuthRepository } from '../domain/repositories/AuthRepository';
import type { ContenidoRepository } from '../domain/repositories/ContenidoRepository';
import type { ExamenesGrupoRepository } from '../domain/repositories/ExamenesGrupoRepository';
import type { ExamenesRepository } from '../domain/repositories/ExamenesRepository';
import type { GruposRepository } from '../domain/repositories/GruposRepository';
import type { MateriasRepository } from '../domain/repositories/MateriasRepository';
import type { PlanesRepository } from '../domain/repositories/PlanesRepository';
import type { SesionRepository } from '../domain/repositories/SesionRepository';
import type { UsuariosRepository } from '../domain/repositories/UsuariosRepository';

export const usuarioAlumno: Usuario = { id: 'u1', nombre: 'Ana López', correo: 'ana@escuela.mx', rol: 'alumno' };
export const usuarioMaestro: Usuario = { id: 'u2', nombre: 'Carlos Ruiz', correo: 'carlos@escuela.mx', rol: 'maestro' };
export const usuarioAdmin: Usuario = { id: 'u3', nombre: 'Rosa Díaz', correo: 'rosa@escuela.mx', rol: 'admin' };

export const planEjemplo: Plan = {
  id: 'p1',
  nombre: 'Prepa intensiva',
  version: 1,
  estado: 'publicado',
  publicadoEn: '2026-07-01T12:00:00.000Z',
};

const maestro = { id: 'u2', nombre: 'Carlos Ruiz', correo: 'carlos@escuela.mx' };

export const materiasEjemplo: MateriaConMaestro[] = [
  { id: 'm1', planId: 'p1', nombre: 'Matemáticas', bloque: 1, maestroId: 'u2', maestro },
  { id: 'm2', planId: 'p1', nombre: 'Historia', bloque: 1 },
  { id: 'm3', planId: 'p1', nombre: 'Química', bloque: 2, maestroId: 'u2', maestro },
];

/** Grupo que va en su semana 2 (bloque 1): Matemáticas e Historia; Química viene en las semanas 3 y 4. */
export const grupoEjemplo: Grupo = {
  id: 'g1',
  nombre: 'Generación agosto',
  fechaInicio: '2026-08-03T06:00:00.000Z',
  plan: planEjemplo,
  materias: materiasEjemplo,
  semanaActual: 2,
  semanas: [
    { numero: 1, inicio: '2026-08-03T06:00:00.000Z', fin: '2026-08-09T06:00:00.000Z', estado: 'completada', bloque: 1, semanaDeMateria: 1 },
    { numero: 2, inicio: '2026-08-10T06:00:00.000Z', fin: '2026-08-16T06:00:00.000Z', estado: 'actual', bloque: 1, semanaDeMateria: 2 },
    { numero: 3, inicio: '2026-08-17T06:00:00.000Z', fin: '2026-08-23T06:00:00.000Z', estado: 'futura', bloque: 2, semanaDeMateria: 1 },
    { numero: 4, inicio: '2026-08-24T06:00:00.000Z', fin: '2026-08-30T06:00:00.000Z', estado: 'futura', bloque: 2, semanaDeMateria: 2 },
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

/** Planes y materias en memoria, con las mismas reglas de borrador y publicado que el backend. */
export class PlanesFalso implements PlanesRepository {
  lista: Plan[] = [];
  materias: MateriaConMaestro[] = [];
  /** Lo que le falta a cada plan para publicarse (por id). */
  pendientes: Record<string, string[]> = {};
  cambios: Record<string, CambioPlan[]> = {};
  conGrupos = new Set<string>();
  creados: NuevoPlan[] = [];

  async listar() {
    return [...this.lista];
  }
  async obtener(id: string): Promise<PlanDetallado | null> {
    const plan = this.lista.find((p) => p.id === id);
    return plan ? { ...plan, materias: this.materias.filter((m) => m.planId === id) } : null;
  }
  async crear(datos: NuevoPlan): Promise<Plan> {
    this.creados.push(datos);
    const plan: Plan = { id: `p${this.lista.length + 1}`, ...datos, version: 1, estado: 'borrador' };
    this.lista.push(plan);
    return plan;
  }
  async actualizar(id: string, cambios: { descripcion: string }) {
    const plan = this.buscar(id);
    Object.assign(plan, cambios);
    return plan;
  }
  async eliminar(id: string) {
    if (this.conGrupos.has(id)) throw new ErrorAplicacion('El plan tiene grupos; elimínalos antes de borrar el plan', 409);
    this.lista = this.lista.filter((p) => p.id !== id);
  }
  async revisar(id: string): Promise<RevisionPlan> {
    const pendientes = this.pendientes[id] ?? [];
    return { listo: pendientes.length === 0, pendientes };
  }
  async publicar(id: string) {
    const plan = this.buscar(id);
    const pendientes = this.pendientes[id] ?? [];
    if (pendientes.length) throw new ErrorAplicacion(['El plan aún no se puede publicar', ...pendientes], 400);
    Object.assign(plan, { estado: 'publicado', publicadoEn: '2026-08-01T12:00:00.000Z' });
    return plan;
  }
  async crearNuevaVersion(id: string) {
    const origen = this.buscar(id);
    const version = Math.max(...this.lista.filter((p) => p.nombre === origen.nombre).map((p) => p.version)) + 1;
    const nuevo: Plan = { id: `p${this.lista.length + 1}`, nombre: origen.nombre, version, estado: 'borrador' };
    this.lista.push(nuevo);
    this.materias.push(
      ...this.materias.filter((m) => m.planId === id).map((m, i) => ({ ...m, id: `${nuevo.id}-m${i + 1}`, planId: nuevo.id })),
    );
    return nuevo;
  }
  async listarCambios(id: string) {
    return this.cambios[id] ?? [];
  }
  private buscar(id: string): Plan {
    const plan = this.lista.find((p) => p.id === id);
    if (!plan) throw new ErrorAplicacion('Plan de estudios no encontrado', 404);
    return plan;
  }
}

export class MateriasFalso implements MateriasRepository {
  creadas: NuevaMateria[] = [];
  actualizaciones: { id: string; cambios: CambiosMateria }[] = [];

  private readonly planes: PlanesFalso;

  constructor(planes: PlanesFalso) {
    this.planes = planes;
  }

  private enPlan(materia: Materia): MateriaEnPlan {
    const plan = this.planes.lista.find((p) => p.id === materia.planId);
    if (!plan) throw new ErrorAplicacion('Plan de estudios no encontrado', 404);
    return { ...materia, plan };
  }
  private estructuraEditable(planId: string) {
    if (this.planes.lista.find((p) => p.id === planId)?.estado === 'publicado') {
      throw new ErrorAplicacion('El plan ya está publicado: solo admite correcciones', 409);
    }
  }
  async listarMias() {
    return this.planes.materias.filter((m) => m.maestroId === usuarioMaestro.id).map((m) => this.enPlan(m));
  }
  async obtener(id: string) {
    const materia = this.planes.materias.find((m) => m.id === id);
    return materia ? this.enPlan(materia) : null;
  }
  async crear(datos: NuevaMateria): Promise<Materia> {
    this.estructuraEditable(datos.planId);
    this.creadas.push(datos);
    const materia: Materia = { id: `m${this.planes.materias.length + 1}`, ...datos };
    this.planes.materias.push(materia);
    return materia;
  }
  async actualizar(id: string, cambios: CambiosMateria): Promise<Materia> {
    this.actualizaciones.push({ id, cambios });
    const actual = this.planes.materias.find((m) => m.id === id);
    if (!actual) throw new ErrorAplicacion('Materia no encontrada', 404);
    if (cambios.bloque !== undefined && cambios.bloque !== actual.bloque) this.estructuraEditable(actual.planId);
    const { maestroId, ...resto } = cambios;
    Object.assign(actual, resto, maestroId === undefined ? {} : { maestroId: maestroId ?? undefined });
    return actual;
  }
  async eliminar(id: string) {
    const actual = this.planes.materias.find((m) => m.id === id);
    if (actual) this.estructuraEditable(actual.planId);
    this.planes.materias = this.planes.materias.filter((m) => m.id !== id);
  }
}

export class GruposFalso implements GruposRepository {
  lista: Grupo[] = [];
  alumnos: Record<string, Usuario[]> = {};
  calificaciones: Record<string, CalificacionesGrupo> = {};
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
    const grupo: Grupo = { ...grupoEjemplo, id: `g${this.lista.length + 1}`, nombre: datos.nombre, fechaInicio: datos.fechaInicio };
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
    return this.calificaciones[grupoId] ?? { materias: [], boletas: [] };
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
  async listarPorMateria(materiaId: string) {
    return this.lista.filter((c) => c.materiaId === materiaId);
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
  importaciones: { materiaId: string; csv: string }[] = [];
  /** Si se define, importar responde con este error (p. ej. los errores por fila de la hoja). */
  errorAlImportar: ErrorAplicacion | null = null;
  async obtenerPorId(id: string) {
    return this.lista.find((e) => e.id === id) ?? null;
  }
  async listarPorMateria(materiaId: string) {
    return this.lista.filter((e) => e.materiaId === materiaId);
  }
  async crear(datos: NuevoExamen): Promise<Examen> {
    this.creados.push(datos);
    const repetido = this.lista.some(
      (e) => e.materiaId === datos.materiaId && e.semana === datos.semana && e.numero === datos.numero,
    );
    if (repetido) throw new ErrorAplicacion(`La semana ${datos.semana} ya tiene examen ${datos.numero}`, 409);
    const nuevo: Examen = {
      id: `e${this.lista.length + 1}`,
      materiaId: datos.materiaId,
      semana: datos.semana,
      numero: datos.numero,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
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
    this.lista = this.lista.filter((e) => e.id !== id);
  }
  async importar(materiaId: string, csv: string) {
    this.importaciones.push({ materiaId, csv });
    if (this.errorAlImportar) throw this.errorAlImportar;
    return this.lista.filter((e) => e.materiaId === materiaId);
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

// Como el backend: la respuesta correcta solo viaja cuando el examen ya cerró en el grupo
const revisar = (preguntas: Pregunta[], respuestas: number[], cerrado: boolean): PreguntaRevisada[] =>
  preguntas.map((p, i) => ({
    id: p.id ?? `p${i + 1}`,
    enunciado: p.enunciado,
    opciones: p.opciones,
    ...(cerrado ? { respuestaCorrecta: p.respuestaCorrecta } : {}),
    miRespuesta: respuestas[i] ?? -1,
    acierto: respuestas[i] === p.respuestaCorrecta,
  }));

/** Simula la vista del alumno: mismas reglas de ventana, intento único y revisión que el backend. */
export class ExamenesGrupoFalso implements ExamenesGrupoRepository {
  lista: ExamenSembrado[] = [];
  respuestasRecibidas: number[][] = [];

  private buscar(grupoId: string, examenId: string) {
    return this.lista.find((e) => e.grupoId === grupoId && e.resumen.id === examenId);
  }

  async listar(grupoId: string) {
    return this.lista.filter((e) => e.grupoId === grupoId).map((e) => e.resumen);
  }

  async obtenerDeSemana(grupoId: string, materiaId: string, semana: number) {
    return this.lista
      .filter((e) => e.grupoId === grupoId && e.resumen.materia.id === materiaId && e.resumen.semana === semana)
      .map((e) => e.resumen);
  }

  async obtener(grupoId: string, examenId: string): Promise<ExamenGrupo | null> {
    const examen = this.buscar(grupoId, examenId);
    if (!examen) return null;
    const { resumen, preguntas, respuestas } = examen;
    if (resumen.miIntento && respuestas) {
      return { ...resumen, preguntas: revisar(preguntas, respuestas, resumen.ventana.estado === 'cerrada') };
    }
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
    const revision = revisar(examen.preguntas, respuestas, false);
    const aciertos = revision.filter((p) => p.acierto).length;
    const resultado = {
      aciertos,
      totalPreguntas: examen.preguntas.length,
      calificacion: Math.round((aciertos / examen.preguntas.length) * 1000) / 100,
      fecha: '2026-08-12T15:00:00.000Z',
    };
    examen.resumen = { ...examen.resumen, miIntento: resultado };
    examen.respuestas = respuestas;
    return { ...resultado, revision, ventana: examen.resumen.ventana };
  }
}

export interface Repositorios {
  sesiones: SesionEnMemoria;
  auth: AuthFalso;
  usuarios: UsuariosFalso;
  planes: PlanesFalso;
  materias: MateriasFalso;
  grupos: GruposFalso;
  contenido: ContenidoFalso;
  examenes: ExamenesFalso;
  examenesGrupo: ExamenesGrupoFalso;
}

export const crearRepositoriosFalsos = (sesion: Sesion | null = null): Repositorios => {
  const planes = new PlanesFalso();
  return {
    sesiones: new SesionEnMemoria(sesion),
    auth: new AuthFalso(),
    usuarios: new UsuariosFalso(),
    planes,
    materias: new MateriasFalso(planes),
    grupos: new GruposFalso(),
    contenido: new ContenidoFalso(),
    examenes: new ExamenesFalso(),
    examenesGrupo: new ExamenesGrupoFalso(),
  };
};

/** Siembra el plan de ejemplo (publicado) con sus tres materias. */
export const sembrarPlan = (r: Repositorios, cambios: Partial<Plan> = {}): Plan => {
  const plan = { ...planEjemplo, ...cambios };
  r.planes.lista.push(plan);
  r.planes.materias.push(...materiasEjemplo.map((m) => ({ ...m, planId: plan.id })));
  return plan;
};

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
