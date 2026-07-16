import { Link, useLocation } from 'react-router-dom';
import { APP_TEXTS, NAVIGATION } from '../../constants/texts';

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col h-full p-gutter fixed left-0 top-0 z-40 w-64 bg-surface-container border-r border-outline-variant">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        </div>
        <div>
          <h1 className="text-title-md font-headline-lg font-bold text-primary">{APP_TEXTS.brand.name}</h1>
          <p className="text-label-caps font-label-caps text-on-surface-variant">{APP_TEXTS.brand.subtitle}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAVIGATION.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'text-primary font-bold bg-secondary-container active:scale-[0.98]'
                  : 'text-on-surface-variant hover:bg-surface-variant'
                }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="text-label-caps font-label-caps">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 pt-4 border-t border-outline-variant">
        <button className="w-full mb-4 py-3 px-4 bg-primary-container text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined">add_circle</span>
          {APP_TEXTS.nav.newQuery}
        </button>
        <Link to="/configuracion" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-label-caps font-label-caps">{APP_TEXTS.nav.settings}</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-caps font-label-caps">{APP_TEXTS.nav.logout}</span>
        </button>
      </div>
    </aside>
  );
};