import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { MAX_OPCIONES, MIN_OPCIONES } from '../../../domain/entities/Examen';
import { Campo } from '../common/Campo';
import { estilos } from '../common/estilos';
import type { FormularioExamenValores } from './esquemaExamen';

interface PreguntaEditorProps {
  indice: number;
  puedeQuitarse: boolean;
  alQuitar: () => void;
}

export const PreguntaEditor = ({ indice, puedeQuitarse, alQuitar }: PreguntaEditorProps) => {
  const {
    control,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<FormularioExamenValores>();
  const opciones = useFieldArray({ control, name: `preguntas.${indice}.opciones` });
  const errores = errors.preguntas?.[indice];
  const campoCorrecta = `preguntas.${indice}.respuestaCorrecta` as const;

  /** Mantiene marcada la misma opción correcta aunque cambie su posición. */
  const quitarOpcion = (j: number) => {
    const correcta = getValues(campoCorrecta);
    opciones.remove(j);
    if (j < correcta) setValue(campoCorrecta, correcta - 1, { shouldDirty: true });
    else if (j === correcta) setValue(campoCorrecta, 0, { shouldDirty: true });
  };

  return (
    <fieldset className="bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-4">
      <legend className="sr-only">Pregunta {indice + 1}</legend>
      <div className="flex items-center justify-between">
        <span aria-hidden="true" className="text-label-caps font-label-caps text-on-surface-variant uppercase">
          Pregunta {indice + 1}
        </span>
        <button
          type="button"
          className={`${estilos.botonIcono} hover:text-error`}
          onClick={alQuitar}
          disabled={!puedeQuitarse}
          aria-label={`Quitar pregunta ${indice + 1}`}
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>

      <Campo etiqueta="Enunciado" htmlFor={`pregunta-${indice}-enunciado`} error={errores?.enunciado?.message}>
        <textarea id={`pregunta-${indice}-enunciado`} rows={2} className={estilos.input} {...register(`preguntas.${indice}.enunciado`)} />
      </Campo>

      <div className="space-y-2">
        <p className={estilos.etiqueta}>Opciones (marca la correcta)</p>
        <Controller
          control={control}
          name={campoCorrecta}
          render={({ field }) => (
            <div role="radiogroup" aria-label={`Respuesta correcta de la pregunta ${indice + 1}`} className="space-y-2">
              {opciones.fields.map((opcion, j) => (
                <div key={opcion.id} className="flex items-start gap-3">
                  <input
                    type="radio"
                    name={`pregunta-${indice}-correcta`}
                    checked={field.value === j}
                    onChange={() => field.onChange(j)}
                    className="accent-primary w-4 h-4 mt-3"
                    aria-label={`Marcar opción ${j + 1} como correcta`}
                  />
                  <div className="flex-1">
                    <input
                      className={estilos.input}
                      placeholder={`Opción ${j + 1}`}
                      aria-label={`Opción ${j + 1} de la pregunta ${indice + 1}`}
                      {...register(`preguntas.${indice}.opciones.${j}.texto`)}
                    />
                    {errores?.opciones?.[j]?.texto?.message && (
                      <p className="mt-1 text-[12px] text-error">{errores.opciones[j]?.texto?.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={estilos.botonIcono}
                    onClick={() => quitarOpcion(j)}
                    disabled={opciones.fields.length <= MIN_OPCIONES}
                    aria-label={`Quitar opción ${j + 1}`}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        />
        {(errores?.respuestaCorrecta?.message || errores?.opciones?.root?.message || errores?.opciones?.message) && (
          <p role="alert" className="text-[12px] text-error">
            {errores?.respuestaCorrecta?.message ?? errores?.opciones?.root?.message ?? errores?.opciones?.message}
          </p>
        )}
        <button
          type="button"
          className="text-primary font-bold text-body-sm flex items-center gap-1 hover:underline disabled:opacity-40 disabled:no-underline"
          onClick={() => opciones.append({ texto: '' })}
          disabled={opciones.fields.length >= MAX_OPCIONES}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Añadir opción
        </button>
      </div>
    </fieldset>
  );
};
