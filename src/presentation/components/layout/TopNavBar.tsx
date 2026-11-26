import { useGrupoEnPantalla } from '../../hooks/useParametrosGrupo';
import { BotonMenuLateral } from './BotonMenuLateral';
import { LogoEscuela } from './LogoEscuela';
import { MenuUsuario } from './MenuUsuario';

interface TopNavBarProps {
  menuAbierto: boolean;
  /** Sin esta función no se muestra el botón de hamburguesa (menú lateral apagado). */
  alAlternarMenu?: () => void;
}

export const TopNavBar = ({ menuAbierto, alAlternarMenu }: TopNavBarProps) => {
  const grupo = useGrupoEnPantalla();

  return (
    <header className="sticky top-0 w-full z-30 bg-surface shadow-sm">
      <div className="max-w-[1440px] mx-auto flex items-center gap-3 px-gutter py-4">
        {/* Con el menú abierto, la hamburguesa vive dentro del menú lateral. */}
        {!menuAbierto && alAlternarMenu && <BotonMenuLateral menuAbierto={false} alAlternar={alAlternarMenu} />}

        {/* El logo va hasta la izquierda; si el menú está abierto ya aparece dentro de él. */}
        {!menuAbierto && <LogoEscuela compacto className="shrink-0" />}

        {grupo && (
          <p
            className={`text-title-md font-bold text-on-surface truncate min-w-0 ${menuAbierto ? '' : 'border-l border-outline-variant pl-3'}`}
            title={grupo.materia.nombre}
          >
            {grupo.materia.nombre}
          </p>
        )}

        <div className="ml-auto shrink-0">
          <MenuUsuario />
        </div>
      </div>
    </header>
  );
};
