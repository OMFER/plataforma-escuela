import { Link, useLocation } from 'react-router-dom';
import { ID_MENU_LATERAL, navegacionPorRol } from '../../constants/navegacion';
import { useUsuarioActual } from '../../providers/SesionContext';
import { BotonMenuLateral } from './BotonMenuLateral';
import { LogoEscuela } from './LogoEscuela';

interface SidebarProps {
  abierto: boolean;
  alCerrar: () => void;
  alNavegar: () => void;
}

export const Sidebar = ({ abierto, alCerrar, alNavegar }: SidebarProps) => {
  const location = useLocation();
  const usuario = useUsuarioActual();

  return (
    <>
      {/* En celular el menú flota: un fondo oscuro permite cerrarlo tocando fuera. */}
      {abierto && <div aria-hidden="true" onClick={alCerrar} className="md:hidden fixed inset-0 z-40 bg-black/40" />}
      <aside
        id={ID_MENU_LATERAL}
        className={`${abierto ? 'flex' : 'hidden'} flex-col h-full p-gutter fixed left-0 top-0 z-50 md:z-40 w-64 bg-surface-container border-r border-outline-variant shadow-lg md:shadow-none`}
      >
        <div className="mb-8 flex items-center justify-between gap-2">
          <LogoEscuela conSubtitulo onClick={alNavegar} className="px-2" />
          <BotonMenuLateral menuAbierto alAlternar={alCerrar} />
        </div>

        <nav className="flex-1 space-y-1">
          {navegacionPorRol(usuario.rol).map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/' || location.pathname.startsWith('/grupos')
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={alNavegar}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary font-bold bg-secondary-container active:scale-[0.98]'
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-label-caps font-label-caps">{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
};
