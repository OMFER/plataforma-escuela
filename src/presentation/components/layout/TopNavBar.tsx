import { APP_TEXTS, ETIQUETAS_ROL } from '../../constants/textos';
import { useUsuarioActual } from '../../providers/SesionContext';

const iniciales = (nombre: string): string =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export const TopNavBar = () => {
  const usuario = useUsuarioActual();

  return (
    <header className="sticky top-0 w-full z-30 bg-surface shadow-sm">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-gutter py-4">
        <div className="flex items-center gap-2 md:hidden">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <span className="text-title-md font-headline-lg font-bold text-primary">{APP_TEXTS.brand.name}</span>
        </div>

        <div className="flex items-center gap-3 ml-auto pl-4 border-l border-outline-variant">
          <div className="text-right">
            <p className="text-label-caps font-bold text-on-surface">{usuario.nombre}</p>
            <p className="text-[10px] text-on-surface-variant">{ETIQUETAS_ROL[usuario.rol]}</p>
          </div>
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-full border-2 border-primary-fixed bg-primary-container text-on-primary flex items-center justify-center font-bold text-body-sm"
          >
            {iniciales(usuario.nombre)}
          </div>
        </div>
      </div>
    </header>
  );
};
