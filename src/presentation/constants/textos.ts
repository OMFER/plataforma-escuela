import type { TipoExamen } from '../../domain/entities/Examen';
import type { Rol } from '../../domain/entities/Usuario';

export const APP_TEXTS = {
  brand: {
    name: 'EduFlow',
    subtitle: 'Portal Académico',
  },
  nav: {
    logout: 'Cerrar sesión',
  },
  dashboard: {
    greeting: '¡Hola',
    subtitulo: {
      alumno: 'Estos son los grupos en los que estás inscrito. Elige una semana para ver su contenido.',
      maestro: 'Estos son los grupos que impartes. Elige una semana para publicar o revisar su contenido.',
      admin: '',
    } satisfies Record<Rol, string>,
    goToCourse: 'Ir a la semana actual',
    weeklyProgress: 'Calendario semanal',
    sinGrupos: 'Aún no tienes grupos asignados.',
    calificaciones: 'Calificaciones',
  },
  semana: {
    sinContenido: 'El maestro aún no publica el contenido de esta semana',
    verGrabacion: 'Ver clase grabada',
    sinGrabacion: 'La grabación de esta clase aún no está disponible.',
    hacerExamen: 'Hacer examen',
    sinExamen: 'Sin examen esta semana',
    hacerReposicion: 'Reposición',
    sinReposicion: 'Sin reposición esta semana',
  },
};

export const ETIQUETAS_ROL: Record<Rol, string> = {
  alumno: 'Alumno',
  maestro: 'Maestro',
  admin: 'Administrador',
};

export const ETIQUETAS_TIPO_EXAMEN: Record<TipoExamen, string> = {
  Semanal: 'Semanal',
  Reposicion: 'Reposición',
  Final: 'Final',
};

/** "Examen semanal", "Reposición" o "Examen final". */
export const NOMBRE_TIPO_EXAMEN: Record<TipoExamen, string> = {
  Semanal: 'Examen semanal',
  Reposicion: 'Reposición',
  Final: 'Examen final',
};
