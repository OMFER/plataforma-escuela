import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useId, useState, type ChangeEvent } from 'react';
import { claves } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';

/** Plantilla que llenan los maestros en Google Sheets (Archivo → Descargar → CSV). */
export const URL_PLANTILLA_EXAMENES = '/plantilla-examenes.csv';

/** Carga los exámenes de la materia desde el CSV de la plantilla; con un error no se guarda nada. */
export const ImportarExamenes = ({ materiaId }: { materiaId: string }) => {
  const { importarExamenes } = useCasosDeUso();
  const queryClient = useQueryClient();
  const idArchivo = useId();
  const [archivo, setArchivo] = useState<File | null>(null);

  const importacion = useMutation({
    mutationFn: async (elegido: File) => importarExamenes.ejecutar(materiaId, await elegido.text()),
    onSuccess: () => {
      setArchivo(null);
      void queryClient.invalidateQueries({ queryKey: claves.datosMateria(materiaId) });
    },
  });

  const alElegir = (evento: ChangeEvent<HTMLInputElement>) => {
    importacion.reset();
    setArchivo(evento.target.files?.[0] ?? null);
  };

  return (
    <section className={`${estilos.tarjeta} space-y-4`} aria-labelledby={`${idArchivo}-titulo`}>
      <h2 id={`${idArchivo}-titulo`} className="text-title-md font-headline-lg text-on-surface">
        Importar exámenes desde la plantilla
      </h2>
      <ol className="list-decimal pl-5 space-y-1 text-body-sm text-on-surface-variant">
        <li>
          Descarga la{' '}
          <a href={URL_PLANTILLA_EXAMENES} download className="text-primary font-bold underline">
            plantilla de ejemplo
          </a>{' '}
          y ábrela en Google Sheets (una fila por pregunta).
        </li>
        <li>
          Llena las columnas: semana (1 o 2), examen (1 o 2), pregunta, opcion_a … opcion_f y correcta (la letra de la opción).
        </li>
        <li>En Google Sheets: Archivo → Descargar → Valores separados por comas (.csv), y súbelo aquí.</li>
      </ol>
      <p className="text-body-sm text-on-surface-variant">
        Los exámenes que vengan en la hoja reemplazan a los que ya existían con la misma semana y número. Si la hoja tiene
        algún error no se guarda nada y te decimos qué fila corregir.
      </p>
      <form
        className="flex flex-col sm:flex-row sm:items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (archivo) importacion.mutate(archivo);
        }}
      >
        <label htmlFor={idArchivo} className="flex-1 space-y-1">
          <span className={estilos.etiqueta}>Archivo CSV</span>
          <input id={idArchivo} type="file" accept=".csv,text/csv" onChange={alElegir} className={estilos.input} />
        </label>
        <button type="submit" className={estilos.botonPrimario} disabled={!archivo || importacion.isPending}>
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          {importacion.isPending ? 'Importando…' : 'Importar'}
        </button>
      </form>
      {importacion.error && <MensajeError error={importacion.error} />}
      {importacion.isSuccess && (
        <p role="status" className="text-body-sm text-primary font-bold">
          Se importaron {importacion.data.length} {importacion.data.length === 1 ? 'examen' : 'exámenes'}.
        </p>
      )}
    </section>
  );
};
