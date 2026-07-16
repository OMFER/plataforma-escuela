export const APP_TEXTS = {
  brand: {
    name: "EduFlow",
    subtitle: "Portal Académico"
  },
  nav: {
    dashboard: "Dashboard",
    courses: "Cursos",
    exams: "Exámenes",
    openClass: "OpenClass",
    grades: "Calificaciones",
    newQuery: "Nueva Consulta",
    settings: "Configuración",
    logout: "Cerrar Sesión"
  },
  dashboard: {
    greeting: "¡Hola",
    greetingSubtitle: "Aquí tienes una lista de las asignaturas que cursas actualmente.",
    searchPlaceholder: "Buscar cursos, tareas...",
    currentGrade: "Calificación actual:",
    goToCourse: "Ir a la asignatura",
    evaluationMode: "Modalidad de evaluación:",
    weeklyProgress: "Avance semanal",
    servicesTitle: "Servicios disponibles para ti:",
    newsTitle: "Avisos Escolares"
  }
};

export const COURSE_TEXTS = {
  tabs: ["Curso", "Participantes", "Exámenes", "Calificaciones", "OpenClass"],
  exams: {
    title: "Próximas Evaluaciones",
    viewHistory: "Ver historial completo",
    tableHeaders: ["Sección", "Nombre del Examen", "Fecha de Cierre", "Estado"],
    noDate: "Sin fecha de cierre",
    startBtn: "Iniciar",
    optionalLabel: "OPCIONAL"
  },
  widgets: {
    progressTitle: "Progreso General",
    completedExams: "Exámenes Completados",
    recommendationTitle: "Para tu examen",
    recommendationText: "Basado en tus resultados previos, te recomendamos repasar la Unidad 3: Metodologías de Innovación.",
    reviewBtn: "Repasar ahora"
  }
};

export const NAVIGATION = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/cursos', label: 'Cursos', icon: 'school' },
  { path: '/curso/1', label: 'Exámenes', icon: 'assignment_late' },
  { path: '/openclass', label: 'OpenClass', icon: 'calendar_month' },
  { path: '/calificaciones', label: 'Calificaciones', icon: 'grade' },
];

export const TOPBAR_TEXTS = {
  searchPlaceholder: "Buscar cursos, tareas...",
  role: "Estudiante Pregrado"
};

export const OPENCLASS_TEXTS = {
  breadcrumbs: ["Inicio", "Administración del curso", "Openclass"],
  title: "Calendario Open Class",
  notice: {
    text: "Recuerda elegir tu zona horaria para ver los horarios exactos de tus sesiones.",
    link: "Revisar recomendaciones de asistencia"
  },
  sessions: {
    title: "Próximas Sesiones",
    timezones: [
      "México/Mexico_City (GMT-6)",
      "Madrid/Spain (GMT+1)",
      "Bogotá/Colombia (GMT-5)"
    ],
    addToCalendar: "Agregar a calendario",
    watchRecording: "Ver Grabación"
  },
  footer: {
    copyright: "© 2026 EduFlow Academic Portal. Todos los derechos reservados.",
    links: ["Términos y Condiciones", "Privacidad", "Soporte"]
  },
  fabSupport: "Soporte en línea"
};