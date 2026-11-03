import { APP_TEXTS, ETIQUETAS_ROL } from '../../constants/textos';
import { useMenuDesplegable } from '../../hooks/useMenuDesplegable';
import { useSesion, useUsuarioActual } from '../../providers/SesionContext';

const ID_MENU_USUARIO = 'menu-usuario';

const iniciales = (nombre: string): string =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

/** Nombre y avatar del usuario; al hacer clic despliega las opciones de su cuenta. */
export const MenuUsuario = () => {
  const usuario = useUsuarioActual();
  const { cerrarSesion } = useSesion();
  const { abierto, alternar, cerrar, contenedor } = useMenuDesplegable();

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={alternar}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={ID_MENU_USUARIO}
        aria-label={`${usuario.nombre}, ${APP_TEXTS.nav.opcionesCuenta}`}
        className="flex items-center gap-3 rounded-lg p-1 sm:pl-2 hover:bg-surface-variant transition-colors"
      >
        <span className="text-right hidden sm:block">
          <span className="block text-label-caps font-bold text-on-surface">{usuario.nombre}</span>
          <span className="block text-[10px] text-on-surface-variant">{ETIQUETAS_ROL[usuario.rol]}</span>
        </span>
        <span
          aria-hidden="true"
          className="w-10 h-10 rounded-full border-2 border-primary-fixed bg-primary-container text-on-primary flex items-center justify-center font-bold text-body-sm"
        >
          {iniciales(usuario.nombre)}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant hidden sm:block" aria-hidden="true">
          {abierto ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {abierto && (
        <div
          id={ID_MENU_USUARIO}
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-lg bg-surface-container-lowest border border-outline-variant shadow-lg py-1 z-50"
        >
          <div className="px-4 py-2 border-b border-outline-variant sm:hidden">
            <p className="text-label-caps font-bold text-on-surface truncate">{usuario.nombre}</p>
            <p className="text-[10px] text-on-surface-variant">{ETIQUETAS_ROL[usuario.rol]}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              cerrar();
              cerrarSesion();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined" aria-hidden="true">logout</span>
            <span className="text-label-caps font-label-caps">{APP_TEXTS.nav.logout}</span>
          </button>
        </div>
      )}
    </div>
  );
};
