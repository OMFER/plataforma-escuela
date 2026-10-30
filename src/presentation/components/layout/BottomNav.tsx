import { Link, useLocation } from 'react-router-dom';
import { APP_TEXTS } from '../../constants/textos';
import { navegacionPorRol } from '../../constants/navegacion';
import { useSesion, useUsuarioActual } from '../../providers/SesionContext';

export const BottomNav = () => {
  const location = useLocation();
  const usuario = useUsuarioActual();
  const { cerrarSesion } = useSesion();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant px-gutter py-2 flex justify-around items-center z-50">
      {navegacionPorRol(usuario.rol).map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
      <button type="button" onClick={cerrarSesion} className="flex flex-col items-center gap-1 text-on-surface-variant">
        <span className="material-symbols-outlined">logout</span>
        <span className="text-[10px] font-bold">{APP_TEXTS.nav.logout}</span>
      </button>
    </nav>
  );
};
