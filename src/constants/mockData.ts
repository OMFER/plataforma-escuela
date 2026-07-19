import type { OpenClassSession } from '../types';
import type { User, Course } from '../styles/index';
import type { Exam, CourseDetails } from '../types';

export const USER: User = {
  fullName: "Jose Fernando Otañez Gonzalez",
  shortName: "Jose Fernando",
  role: "Estudiante Pregrado",
  avatar: "https://lh3.googleusercontent.com/..."
};

export const COURSES: Course[] = [
  {
    id: 1,
    title: "Creatividad e innovación tecnológica",
    room: "Aula 106 | Grupo 05",
    evaluation: "EXAMEN",
    grade: 0,
    progress: 28,
    isPrimary: true
  },
  {
    id: 2,
    title: "Desarrollo sustentable y ética ambiental",
    room: "Aula 106 | Grupo 05",
    evaluation: "EXAMEN",
    grade: 0,
    progress: 25,
    isPrimary: true
  }
];

export const CURRENT_COURSE: CourseDetails = {
  id: "1",
  title: "Creatividad e innovación tecnológica",
  description: "Gestione sus evaluaciones, realice exámenes de práctica y siga su progreso académico detallado.",
  examsCompleted: 8,
  totalExams: 12
};

export const EXAMS_DATA: Exam[] = [
  {
    id: "ex1",
    section: "Contenido",
    title: "Puntos extra 1 autocalificable",
    dueDate: null,
    status: "pending",
    isOptional: true
  },
  {
    id: "ex2",
    section: "Evaluación",
    title: "Examen primer parcial (Segunda vuelta)",
    dueDate: "25 de junio de 2026, 23:55",
    status: "active",
    stats: { enrolled: 124, durationMin: 60 }
  },
  {
    id: "ex3",
    section: "Semanal",
    title: "Modalidad de exámenes | Semana 1",
    dueDate: "11 de mayo de 2026, 23:55",
    status: "completed",
    score: 75
  },
  {
    id: "ex4",
    section: "Contenido",
    title: "Examen segundo parcial (Segunda vuelta)",
    dueDate: "25 de junio de 2026, 23:55",
    status: "locked"
  }
];


export const OPENCLASS_SESSIONS: OpenClassSession[] = [
  {
    id: "oc-1",
    weekLabel: "SEMANA 2",
    instructor: "Dr. Héctor Hugo Rodríguez Santoyo",
    title: "Taller Mentes curiosas - Creatividad Aplicada",
    date: "sáb, 23-may-2026",
    time: "10:00 AM",
    status: "upcoming"
  },
  {
    id: "oc-2",
    weekLabel: "SEMANA 3",
    instructor: "Norma Gabriela Farias Huizar",
    title: "Estrategias de Innovación en Mercados Globales",
    date: "sáb, 23-may-2026",
    time: "08:00 AM",
    status: "upcoming"
  },
  {
    id: "oc-3",
    weekLabel: "FINALIZADA",
    instructor: "Héctor Noel Gonzalez Garcia",
    title: "Análisis y tendencias tecnológicas en la empresa",
    date: "vie, 22-may-2026",
    time: "10:00 AM",
    status: "finished"
  },
  {
    id: "oc-4",
    weekLabel: "SEMANA 4",
    instructor: "Alfonso Mondragon Almeria",
    title: "Semana 3. Análisis y tendencias tecnológicas",
    date: "mié, 20-may-2026",
    time: "07:00 PM",
    status: "upcoming"
  }
];