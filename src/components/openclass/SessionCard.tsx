import type { OpenClassSession } from '../../types';
import { OPENCLASS_TEXTS } from '../../constants/texts';

interface SessionCardProps {
  session: OpenClassSession;
}

export const SessionCard = ({ session }: SessionCardProps) => {
  const isUpcoming = session.status === 'upcoming';

  if (!isUpcoming) {
    return (
      <div className="group bg-surface-container/50 p-6 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row md:items-center gap-6 opacity-80">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-outline-variant text-on-surface-variant text-[11px] font-bold tracking-wider rounded-full uppercase">
              {session.weekLabel}
            </span>
            <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">person</span>
              {session.instructor}
            </span>
          </div>
          <h4 className="text-title-md font-bold text-on-surface-variant">{session.title}</h4>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:justify-end">
          <div className="text-right">
            <p className="text-body-sm font-bold text-on-surface-variant">{session.date}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-surface-variant text-on-surface-variant rounded-lg font-bold text-[13px]">
              {session.time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-variant text-on-surface-variant rounded-lg font-bold cursor-not-allowed text-body-sm">
              <span className="material-symbols-outlined text-[20px]">history</span>
              {OPENCLASS_TEXTS.sessions.watchRecording}
            </button>
            <div className="flex gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">description</span>
              <span className="material-symbols-outlined text-[20px]">forum</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-primary/20 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold tracking-wider rounded-full uppercase">
            {session.weekLabel}
          </span>
          <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">person</span>
            {session.instructor}
          </span>
        </div>
        <h4 className="text-title-md font-bold text-on-surface group-hover:text-primary transition-colors">{session.title}</h4>
      </div>

      <div className="flex flex-wrap items-center gap-6 md:justify-end">
        <div className="text-right">
          <p className="text-body-sm font-bold text-on-surface">{session.date}</p>
          <span className="inline-block mt-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-[13px]">
            {session.time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-all text-body-sm shadow-md">
            <span className="material-symbols-outlined text-[20px]">event_available</span>
            {OPENCLASS_TEXTS.sessions.addToCalendar}
          </button>
          <button className="p-2.5 text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-all">
            <span className="material-symbols-outlined">live_tv</span>
          </button>
        </div>
      </div>
    </div>
  );
};