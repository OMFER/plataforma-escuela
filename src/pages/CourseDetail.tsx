import { Link } from 'react-router-dom';
import { COURSE_TEXTS } from '../constants/texts';
import { EXAMS_DATA, CURRENT_COURSE } from '../constants/mockData';
import { ExamsTable } from '../components/course/ExamsTable';

export const CourseDetail = () => {

  // Calculamos el porcentaje de progreso general
  const progressPercent = Math.round((CURRENT_COURSE.examsCompleted / CURRENT_COURSE.totalExams) * 100);

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Imagina que aquí arriba está tu <TopNavBar /> */}

      <div className="max-w-[1200px] mx-auto px-gutter py-8 space-y-section-gap">

        {/* Cabecera del Curso y Navegación (Tabs) */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-primary text-body-sm flex items-center gap-1 mb-2 hover:underline w-fit">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Volver al Inicio
            </Link>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">{CURRENT_COURSE.title}</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">{CURRENT_COURSE.description}</p>
          </div>

          <div className="flex border-b border-outline-variant overflow-x-auto">
            {COURSE_TEXTS.tabs.map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 text-label-caps font-label-caps whitespace-nowrap border-b-2 transition-colors ${tab === 'Exámenes'
                    ? 'text-primary font-bold border-primary'
                    : 'text-on-surface-variant hover:text-primary border-transparent'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* Grid Principal */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

          {/* Columna Izquierda: Tabla */}
          <div className="lg:col-span-8 space-y-gutter">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-title-md font-headline-lg text-on-surface">{COURSE_TEXTS.exams.title}</h3>
              <button className="text-primary text-label-caps font-label-caps flex items-center gap-1 hover:underline">
                {COURSE_TEXTS.exams.viewHistory} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <ExamsTable exams={EXAMS_DATA} />
          </div>

          {/* Columna Derecha: Widgets (Sidebar) */}
          <div className="lg:col-span-4 space-y-gutter">

            {/* Widget de Progreso */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <h4 className="text-title-md font-headline-lg text-on-surface mb-4">{COURSE_TEXTS.widgets.progressTitle}</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-label-caps font-label-caps text-on-surface-variant">{COURSE_TEXTS.widgets.completedExams}</span>
                  <span className="text-title-md font-bold text-primary">{CURRENT_COURSE.examsCompleted}/{CURRENT_COURSE.totalExams}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <p className="text-body-sm text-on-surface-variant italic">
                  Te faltan {CURRENT_COURSE.totalExams - CURRENT_COURSE.examsCompleted} exámenes para completar el curso.
                </p>
              </div>
            </div>

            {/* Widget de Recomendación */}
            <div className="bg-secondary-container/30 p-6 rounded-xl border border-secondary-container">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                <h4 className="text-title-md font-headline-lg text-primary">{COURSE_TEXTS.widgets.recommendationTitle}</h4>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-4">{COURSE_TEXTS.widgets.recommendationText}</p>
              <button className="w-full py-2 bg-primary text-on-primary rounded-lg font-bold text-label-caps font-label-caps shadow-sm hover:opacity-90">
                {COURSE_TEXTS.widgets.reviewBtn}
              </button>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
};