import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Campo } from '../common/Campo';
import { estilos } from '../common/estilos';
import type { FormularioContenidoValores } from './esquemaContenido';

interface RecursoEditorProps {
  indice: number;
  total: number;
  register: UseFormRegister<FormularioContenidoValores>;
  errores?: FieldErrors<FormularioContenidoValores['recursos'][number]>;
  alSubir: () => void;
  alBajar: () => void;
  alQuitar: () => void;
}

export const RecursoEditor = ({ indice, total, register, errores, alSubir, alBajar, alQuitar }: RecursoEditorProps) => {
  const id = (campo: string) => `recurso-${indice}-${campo}`;
  return (
    <fieldset className="bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-4">
      <legend className="sr-only">Recurso {indice + 1}</legend>
      <div className="flex items-center justify-between">
        <span aria-hidden="true" className="text-label-caps font-label-caps text-on-surface-variant uppercase">Recurso {indice + 1}</span>
        <div className="flex gap-1">
          <button type="button" className={estilos.botonIcono} onClick={alSubir} disabled={indice === 0} aria-label={`Subir recurso ${indice + 1}`}>
            <span className="material-symbols-outlined">arrow_upward</span>
          </button>
          <button type="button" className={estilos.botonIcono} onClick={alBajar} disabled={indice === total - 1} aria-label={`Bajar recurso ${indice + 1}`}>
            <span className="material-symbols-outlined">arrow_downward</span>
          </button>
          <button type="button" className={`${estilos.botonIcono} hover:text-error`} onClick={alQuitar} aria-label={`Quitar recurso ${indice + 1}`}>
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
        <Campo etiqueta="Tipo" htmlFor={id('tipo')}>
          <select id={id('tipo')} className={estilos.input} {...register(`recursos.${indice}.tipo`)}>
            <option value="web">Página web</option>
            <option value="pdf">PDF</option>
            <option value="youtube">YouTube</option>
          </select>
        </Campo>
        <Campo etiqueta="Título" htmlFor={id('titulo')} error={errores?.titulo?.message}>
          <input id={id('titulo')} className={estilos.input} {...register(`recursos.${indice}.titulo`)} />
        </Campo>
      </div>
      <Campo etiqueta="URL" htmlFor={id('url')} error={errores?.url?.message}>
        <input id={id('url')} type="url" placeholder="https://" className={estilos.input} {...register(`recursos.${indice}.url`)} />
      </Campo>
      <Campo etiqueta="Descripción (opcional)" htmlFor={id('descripcion')}>
        <input id={id('descripcion')} className={estilos.input} {...register(`recursos.${indice}.descripcion`)} />
      </Campo>
    </fieldset>
  );
};
