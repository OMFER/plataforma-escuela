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
      alumno: 'Estas son las materias que cursas. Elige una semana para ver su contenido.',
      maestro: 'Estas son las materias que impartes. Elige una semana para publicar o revisar su contenido.',
      admin: '',
    } satisfies Record<Rol, string>,
    goToCourse: 'Ir a la semana actual',
    weeklyProgress: 'Calendario semanal',
    sinMaterias: 'Aún no tienes materias asignadas.',
  },
  semana: {
    sinContenido: 'El maestro aún no publica el contenido de esta semana',
    verGrabacion: 'Ver clase grabada',
    sinGrabacion: 'La grabación de esta clase aún no está disponible.',
    hacerExamen: 'Hacer examen',
    sinExamen: 'Sin examen esta semana',
  },
};

export const ETIQUETAS_ROL: Record<Rol, string> = {
  alumno: 'Alumno',
  maestro: 'Maestro',
  admin: 'Administrador',
};
