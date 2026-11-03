import { Link } from 'react-router-dom';
import { APP_TEXTS } from '../../constants/textos';
import { useUsuarioActual } from '../../providers/SesionContext';
import { inicioPorRol } from '../../routes/rutas';

interface LogoEscuelaProps {
  /** Muestra el subtítulo "Portal Académico" debajo del nombre. */
  conSubtitulo?: boolean;
  /** En celular muestra solo el ícono para ahorrar espacio. */
  compacto?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Logo de la escuela; siempre lleva a la pantalla de inicio del usuario. */
export const LogoEscuela = ({ conSubtitulo = false, compacto = false, onClick, className = '' }: LogoEscuelaProps) => {
  const usuario = useUsuarioActual();

  return (
    <Link
      to={inicioPorRol(usuario.rol)}
      onClick={onClick}
      aria-label={`${APP_TEXTS.brand.name}, ${APP_TEXTS.nav.irInicio}`}
      title={APP_TEXTS.nav.irInicio}
      className={`flex items-center gap-3 min-w-0 rounded-lg hover:opacity-80 transition-opacity ${className}`}
    >
      <span className="w-10 h-10 shrink-0 rounded-lg bg-primary-container flex items-center justify-center" aria-hidden="true">
        <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          school
        </span>
      </span>
      <span className={`min-w-0 ${compacto ? 'hidden md:block' : ''}`}>
        <span className="block text-title-md font-headline-lg font-bold text-primary leading-tight">{APP_TEXTS.brand.name}</span>
        {conSubtitulo && (
          <span className="block text-label-caps font-label-caps text-on-surface-variant">{APP_TEXTS.brand.subtitle}</span>
        )}
      </span>
    </Link>
  );
};
