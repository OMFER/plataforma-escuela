import { Link, useLocation } from 'react-router-dom';
import { APP_TEXTS } from '../../constants/textos';
import { navegacionPorRol } from '../../constants/navegacion';
import { useSesion, useUsuarioActual } from '../../providers/SesionContext';

export const Sidebar = () => {
  const location = useLocation();
  const usuario = useUsuarioActual();
  const { cerrarSesion } = useSesion();

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
        {navegacionPorRol(usuario.rol).map((item) => {
          const isActive =
            item.path === '/' ? location.pathname === '/' || location.pathname.startsWith('/materias') : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
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
        <button
          type="button"
          onClick={cerrarSesion}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant rounded-lg"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-caps font-label-caps">{APP_TEXTS.nav.logout}</span>
        </button>
      </div>
    </aside>
  );
};
