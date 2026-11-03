import { APP_TEXTS } from '../../constants/textos';
import { ID_MENU_LATERAL } from '../../constants/navegacion';
import { estilos } from '../common/estilos';

interface BotonMenuLateralProps {
  menuAbierto: boolean;
  alAlternar: () => void;
}

/** Botón de hamburguesa: vive dentro del menú cuando está abierto y en el header cuando está oculto. */
export const BotonMenuLateral = ({ menuAbierto, alAlternar }: BotonMenuLateralProps) => {
  const etiqueta = menuAbierto ? APP_TEXTS.nav.cerrarMenu : APP_TEXTS.nav.abrirMenu;
  return (
    <button
      type="button"
      onClick={alAlternar}
      aria-expanded={menuAbierto}
      aria-controls={ID_MENU_LATERAL}
      aria-label={etiqueta}
      title={etiqueta}
      className={`${estilos.botonIcono} shrink-0`}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {menuAbierto ? 'menu_open' : 'menu'}
      </span>
    </button>
  );
};
