import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { TIPOS_EXAMEN } from '../../../domain/entities/Examen';
import { Campo } from '../common/Campo';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { PreguntaEditor } from './PreguntaEditor';
import { esquemaExamen, preguntaVacia, type FormularioExamenValores } from './esquemaExamen';

const ETIQUETAS_TIPO: Record<(typeof TIPOS_EXAMEN)[number], string> = {
  Semanal: 'Semanal',
  Parcial: 'Parcial',
  Final: 'Final',
  PuntoExtra: 'Punto extra',
};

interface FormularioExamenProps {
  valoresIniciales: FormularioExamenValores;
  esNuevo: boolean;
  tieneIntentos: boolean;
  error: unknown;
  guardando: boolean;
  alGuardar: (valores: FormularioExamenValores) => void;
  alCancelar: () => void;
}

export const FormularioExamen = ({
  valoresIniciales,
  esNuevo,
  tieneIntentos,
  error,
  guardando,
  alGuardar,
  alCancelar,
}: FormularioExamenProps) => {
  const metodos = useForm<FormularioExamenValores>({
    resolver: zodResolver(esquemaExamen),
    defaultValues: valoresIniciales,
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = metodos;
  const preguntas = useFieldArray({ control, name: 'preguntas' });

  return (
    <FormProvider {...metodos}>
      <form onSubmit={handleSubmit(alGuardar)} noValidate className="space-y-8">
        <section className={`${estilos.tarjeta} space-y-5`}>
          <Campo etiqueta="Título" htmlFor="titulo" error={errors.titulo?.message}>
            <input id="titulo" className={estilos.input} {...register('titulo')} />
          </Campo>
          <Campo etiqueta="Descripción (opcional)" htmlFor="descripcion">
            <textarea id="descripcion" rows={3} className={estilos.input} {...register('descripcion')} />
          </Campo>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Campo etiqueta="Tipo" htmlFor="tipo">
              <select id="tipo" className={estilos.input} {...register('tipo')}>
                {TIPOS_EXAMEN.map((t) => (
                  <option key={t} value={t}>
                    {ETIQUETAS_TIPO[t]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Fecha límite (opcional)" htmlFor="fechaLimite">
              <input id="fechaLimite" type="datetime-local" className={estilos.input} {...register('fechaLimite')} />
            </Campo>
            <Campo etiqueta="Puntaje máximo" htmlFor="puntajeMaximo" error={errors.puntajeMaximo?.message}>
              <input
                id="puntajeMaximo"
                type="number"
                min={1}
                step="any"
                className={estilos.input}
                {...register('puntajeMaximo', { valueAsNumber: true })}
              />
            </Campo>
          </div>
        </section>

        <section className={`${estilos.tarjeta} space-y-5`} aria-labelledby="titulo-preguntas">
          <div className="flex items-center justify-between">
            <h2 id="titulo-preguntas" className="text-title-md font-headline-lg text-on-surface">
              Preguntas
            </h2>
            <button type="button" className={estilos.botonSecundario} onClick={() => preguntas.append(preguntaVacia())}>
              <span className="material-symbols-outlined text-[20px]">add</span>
              Añadir pregunta
            </button>
          </div>
          {tieneIntentos && (
            <p className="bg-secondary-container/30 border-l-4 border-primary p-3 rounded-r-lg text-body-sm">
              Este examen ya tiene respuestas de alumnos: si cambias las preguntas, el servidor rechazará el cambio.
              Puedes seguir editando título, descripción, fecha límite y puntaje.
            </p>
          )}
          {errors.preguntas?.root?.message && <p className="text-[12px] text-error">{errors.preguntas.root.message}</p>}
          {errors.preguntas?.message && <p className="text-[12px] text-error">{errors.preguntas.message}</p>}
          {preguntas.fields.map((campo, i) => (
            <PreguntaEditor
              key={campo.id}
              indice={i}
              puedeQuitarse={preguntas.fields.length > 1}
              alQuitar={() => preguntas.remove(i)}
            />
          ))}
        </section>

        {error !== null && error !== undefined && <MensajeError error={error} />}

        <div className="flex justify-end gap-3">
          <button type="button" className={estilos.botonSecundario} onClick={alCancelar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className={estilos.botonPrimario} disabled={guardando}>
            <span className="material-symbols-outlined text-[20px]">save</span>
            {guardando ? 'Guardando…' : esNuevo ? 'Crear examen' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};
