import { OPENCLASS_TEXTS, COURSE_TEXTS } from '../constants/texts';
import { CURRENT_COURSE, OPENCLASS_SESSIONS } from '../constants/mockData';
import { SessionCard } from '../components/openclass/SessionCard';
import { SupportFAB } from '../components/common/SupportFAB';

export const OpenClass = () => {
  return (
    <main className="p-container-margin md:p-12 pb-24 md:pb-12 bg-background min-h-screen">
      <div className="max-w-[1200px] mx-auto">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6">
          <span>{OPENCLASS_TEXTS.breadcrumbs[0]}</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>{OPENCLASS_TEXTS.breadcrumbs[1]}</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">{OPENCLASS_TEXTS.breadcrumbs[2]}</span>
        </nav>

        {/* Course Header & Tabs */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">{OPENCLASS_TEXTS.title}</h2>
              <p className="text-title-md text-primary font-semibold">{CURRENT_COURSE.title}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {COURSE_TEXTS.tabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-2 rounded-full font-label-caps transition-all ${tab.toUpperCase() === 'OPENCLASS'
                    ? 'bg-primary text-on-primary shadow-lg'
                    : 'border border-outline text-on-surface-variant hover:bg-surface-variant'
                    }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Notice Banner */}
          <div className="lg:col-span-12 bg-secondary-container/30 border-l-4 border-primary p-6 rounded-r-xl flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">info</span>
            <div>
              <p className="text-body-lg text-on-surface">{OPENCLASS_TEXTS.notice.text}</p>
              <a className="text-primary font-bold text-body-sm underline decoration-primary/30 cursor-pointer">
                {OPENCLASS_TEXTS.notice.link}
              </a>
            </div>
          </div>

          {/* Session List Container */}
          <div className="lg:col-span-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-title-md font-bold text-on-surface">{OPENCLASS_TEXTS.sessions.title}</h3>
              <div className="relative min-w-[240px]">
                <select className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 pr-10 text-body-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                  {OPENCLASS_TEXTS.sessions.timezones.map(tz => (
                    <option key={tz}>{tz}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
            </div>

            {/* Asymmetric Session List */}
            <div className="space-y-6">
              {OPENCLASS_SESSIONS.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>

        </div>

        {/* Footer Meta */}
        <footer className="mt-section-gap py-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-body-sm text-on-surface-variant">{OPENCLASS_TEXTS.footer.copyright}</p>
          <div className="flex gap-6">
            {OPENCLASS_TEXTS.footer.links.map(link => (
              <a key={link} className="text-body-sm font-bold text-on-surface-variant hover:text-primary transition-all cursor-pointer">
                {link}
              </a>
            ))}
          </div>
        </footer>

      </div>

      <SupportFAB />
    </main>
  );
};