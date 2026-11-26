import type { Rol } from '../../domain/entities/Usuario';

export const APP_TEXTS = {
  brand: {
    name: 'CES Ipalnemohuani',
    subtitle: 'Portal Académico',
  },
  nav: {
    logout: 'Cerrar sesión',
    abrirMenu: 'Mostrar menú',
    cerrarMenu: 'Ocultar menú',
    irInicio: 'Ir al inicio',
    opcionesCuenta: 'opciones de la cuenta',
  },
  dashboard: {
    greeting: '¡Hola',
    subtitulo: {
      alumno: 'Elige una semana para ver el contenido de tus materias y presentar sus exámenes.',
      maestro: 'Estas son las materias que tienes asignadas. Entra a una para corregir su contenido y sus exámenes.',
      admin: '',
    } satisfies Record<Rol, string>,
    goToCourse: 'Ir a la semana actual',
    weeklyProgress: 'Calendario semanal',
    sinGrupos: 'Aún no estás inscrito en un grupo.',
    sinMaterias: 'Aún no tienes materias asignadas.',
    calificaciones: 'Calificaciones',
    calificacionAcumulada: 'Promedio general',
    ayudaCalificacion: 'Promedio de tus materias. Cada materia es el promedio de sus 4 exámenes; lo que falta por presentar cuenta 0.',
  },
  semana: {
    sinContenido: 'Esta semana aún no tiene contenido',
    verGrabacion: 'Ver clase grabada',
    sinGrabacion: 'La grabación de esta clase aún no está disponible.',
    hacerExamen: 'Hacer examen',
    sinExamen: 'Examen no disponible',
  },
};

export const ETIQUETAS_ROL: Record<Rol, string> = {
  alumno: 'Alumno',
  maestro: 'Maestro',
  admin: 'Administrador',
};

export const ETIQUETAS_ESTADO_PLAN = {
  borrador: 'Borrador',
  publicado: 'Publicado',
} as const;
