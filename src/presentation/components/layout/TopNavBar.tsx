import { Link } from 'react-router-dom';
import { useGrupoEnPantalla } from '../../hooks/useParametrosGrupo';
import { useDestinoVolver } from '../../providers/BotonVolverContext';
import { estilos } from '../common/estilos';
import { BotonMenuLateral } from './BotonMenuLateral';
import { LogoEscuela } from './LogoEscuela';
import { MenuUsuario } from './MenuUsuario';

interface TopNavBarProps {
  menuAbierto: boolean;
  alAlternarMenu: () => void;
}

export const TopNavBar = ({ menuAbierto, alAlternarMenu }: TopNavBarProps) => {
  const grupo = useGrupoEnPantalla();
  const volver = useDestinoVolver();

  return (
    <header className="sticky top-0 w-full z-30 bg-surface shadow-sm">
      <div className="max-w-[1440px] mx-auto flex items-center gap-3 px-gutter py-4">
        {/* Con el menú abierto, la hamburguesa vive dentro del menú lateral. */}
        {!menuAbierto && <BotonMenuLateral menuAbierto={false} alAlternar={alAlternarMenu} />}

        <div className="flex items-center gap-3 min-w-0">
          {/* Cada pantalla declara su regreso con useBotonVolver; siempre se muestra aquí. */}
          {volver && (
            <Link to={volver.ruta} className={`${estilos.enlaceVolver} shrink-0`} title={volver.texto}>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
              <span className="sr-only sm:not-sr-only">{volver.texto}</span>
            </Link>
          )}
          {grupo && (
            <p className={`text-title-md font-bold text-on-surface truncate ${volver ? 'border-l border-outline-variant pl-3' : ''}`} title={grupo.materia.nombre}>
              {grupo.materia.nombre}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto shrink-0">
          {!menuAbierto && <LogoEscuela compacto />}
          <div className="pl-3 border-l border-outline-variant">
            <MenuUsuario />
          </div>
        </div>
      </div>
    </header>
  );
};
