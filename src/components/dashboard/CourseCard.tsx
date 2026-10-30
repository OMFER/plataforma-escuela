import { APP_TEXTS } from '../../constants/texts';
import type { Course } from '../../styles/index';
import { WeekSelector } from './WeekSelector';

// Definimos la interfaz para las props de este componente específico
interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  if (!course.isPrimary) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-high opacity-80 hover:scale-100 hover:opacity-100 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-title-md font-headline-lg text-on-surface">{course.title}</h3>
            <p className="text-body-sm text-outline">{course.room}</p>
          </div>
          <button className="bg-primary-container text-on-primary px-6 py-2 rounded-lg font-bold flex items-center gap-2">
            {APP_TEXTS.dashboard.goToCourse}
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-high">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-title-md font-headline-lg text-on-surface mb-1">{course.title}</h3>
          <p className="text-body-sm text-outline">{course.room}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-label-caps font-label-caps text-on-surface-variant">{course.evaluation}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="px-3 py-1 bg-surface-container text-on-surface rounded-full text-label-caps font-bold border border-outline-variant">
            {APP_TEXTS.dashboard.currentGrade} <span className="text-primary">{course.grade}</span>
          </span>
          <button className="bg-primary-container text-on-primary px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90">
            {APP_TEXTS.dashboard.goToCourse}
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h4 className="text-label-caps font-bold text-on-surface uppercase">{APP_TEXTS.dashboard.weeklyProgress}</h4>
          <span className="text-title-md font-bold text-primary">{course.progress}%</span>
        </div>
        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-primary-container rounded-full" style={{ width: `${course.progress}%` }}></div>
        </div>

        <WeekSelector />
      </div>
    </div>
  );
};