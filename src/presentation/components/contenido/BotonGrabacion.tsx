import { esUrlHttp } from '../../../domain/rules/urls';
import { APP_TEXTS } from '../../constants/textos';
import { estilos } from '../common/estilos';

export const BotonGrabacion = ({ url, descripcion }: { url?: string; descripcion?: string }) => {
  if (!url || !esUrlHttp(url)) {
    return (
      <div className="flex flex-col gap-1">
        <button type="button" disabled className={estilos.botonSecundario} aria-describedby="sin-grabacion">
          <span className="material-symbols-outlined text-[20px]">history</span>
          {APP_TEXTS.semana.verGrabacion}
        </button>
        <p id="sin-grabacion" className="text-[12px] text-on-surface-variant">
          {APP_TEXTS.semana.sinGrabacion}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <a href={url} target="_blank" rel="noopener noreferrer" className={estilos.botonSecundario}>
        <span className="material-symbols-outlined text-[20px]">history</span>
        {APP_TEXTS.semana.verGrabacion}
      </a>
      {descripcion && <p className="text-[12px] text-on-surface-variant">{descripcion}</p>}
    </div>
  );
};
