import type { Exam } from '../../types';
import { COURSE_TEXTS } from '../../constants/texts';

interface ExamsTableProps {
  exams: Exam[];
}

export const ExamsTable = ({ exams }: ExamsTableProps) => {
  const renderStatusAction = (exam: Exam) => {
    switch (exam.status) {
      case 'pending':
        return <span className="material-symbols-outlined text-outline-variant">pending</span>;
      case 'active':
        return <button className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-label-caps font-label-caps hover:bg-primary-container transition-all">{COURSE_TEXTS.exams.startBtn}</button>;
      case 'completed':
        return <span className="material-symbols-outlined text-[#2e7d32]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>;
      case 'locked':
        return <span className="material-symbols-outlined text-outline-variant">lock</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-surface-container-low text-label-caps font-label-caps text-on-surface-variant">
          <tr>
            {COURSE_TEXTS.exams.tableHeaders.map((header, idx) => (
              <th key={idx} className="px-6 py-4">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {exams.map((exam) => (
            <tr key={exam.id} className="hover:bg-surface-bright transition-colors group">
              <td className="px-6 py-4 text-body-sm text-on-surface-variant">{exam.section}</td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {/* Si tiene score, mostramos el gráfico circular simplificado */}
                    {exam.score !== undefined && (
                      <div className="relative w-8 h-8 flex items-center justify-center bg-surface-container rounded-full text-[10px] font-bold text-primary">
                        {exam.score}%
                      </div>
                    )}
                    <span className="text-primary-container font-semibold group-hover:underline cursor-pointer">
                      {exam.title}
                    </span>
                    {exam.isOptional && (
                      <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold rounded text-on-surface-variant">
                        {COURSE_TEXTS.exams.optionalLabel}
                      </span>
                    )}
                  </div>
                  {/* Stats (inscritos, tiempo) */}
                  {exam.stats && (
                    <div className="flex items-center gap-3 text-[12px] text-on-surface-variant mt-1">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">group</span> {exam.stats.enrolled} inscritos</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer</span> {exam.stats.durationMin} min</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                {exam.dueDate || COURSE_TEXTS.exams.noDate}
              </td>
              <td className="px-6 py-4">
                {renderStatusAction(exam)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};