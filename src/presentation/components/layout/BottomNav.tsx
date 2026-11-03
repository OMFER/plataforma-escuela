import { Link, useLocation } from 'react-router-dom';
import { navegacionPorRol } from '../../constants/navegacion';
import { useUsuarioActual } from '../../providers/SesionContext';

export const BottomNav = () => {
  const location = useLocation();
  const usuario = useUsuarioActual();

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
    </nav>
  );
};
