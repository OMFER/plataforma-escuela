import type { Week } from '../../styles/index';

// Tipamos nuestro array de semanas
const WEEKS: Week[] = [
  { id: 1, num: "1", date: "04-11 mayo", status: "completed" },
  { id: 2, num: "2", date: "11-18 mayo", status: "active" },
  { id: 3, num: "3", date: "18-25 mayo", status: "future" },
  // ... las demás semanas
];

export const WeekSelector = () => {
  return (
    <div className="grid grid-cols-7 border border-outline-variant rounded-lg overflow-hidden mt-6">
      {WEEKS.map((week) => {
        const isActive = week.status === 'active';
        const isCompleted = week.status === 'completed';

        return (
          <div key={week.id} className={`flex flex-col border-r border-outline-variant ${week.status === 'future' ? 'bg-surface-container-low opacity-50' : 'cursor-pointer'}`}>
            <div className={`p-3 ${isActive ? 'bg-on-primary-fixed' : isCompleted ? 'bg-error-container/30' : ''}`}>
              <p className={`text-title-md font-bold ${isActive ? 'text-on-primary' : isCompleted ? 'text-error' : 'text-outline'}`}>
                {week.num}
              </p>
              <p className={`text-[9px] font-medium flex items-center gap-1 ${isActive ? 'text-on-primary/70' : isCompleted ? 'text-error' : 'text-outline'}`}>
                {week.date}
              </p>
            </div>
            <div className={`p-2 flex justify-center text-white ${isActive ? 'bg-primary' : isCompleted ? 'bg-error' : 'bg-outline-variant/40 text-outline'}`}>
              <span className="material-symbols-outlined text-[16px]">
                {week.status === 'future' ? 'description' : 'check_box'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};