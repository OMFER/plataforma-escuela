import { USER } from '../../constants/mockData';
import { TOPBAR_TEXTS } from '../../constants/texts';

export const TopNavBar = () => {
  return (
    <header className="sticky top-0 w-full z-30 bg-surface shadow-sm md:pl-64">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-gutter py-4">

        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={TOPBAR_TEXTS.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-body-sm focus:ring-2 focus:ring-primary"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-outline-variant">
            <div className="text-right hidden sm:block">
              <p className="text-label-caps font-bold text-on-surface">{USER.shortName}</p>
              <p className="text-[10px] text-on-surface-variant">{USER.role}</p>
            </div>
            <img
              src={USER.avatar}
              alt={`Foto de perfil de ${USER.shortName}`}
              className="w-10 h-10 rounded-full border-2 border-primary-fixed object-cover"
            />
          </div>
        </div>

      </div>
    </header>
  );
};