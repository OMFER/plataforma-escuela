import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Examen } from '../../domain/entities/Examen';
import { preguntasIguales } from '../../domain/rules/examen';
import { Cargando } from '../components/common/Cargando';
import { MensajeError } from '../components/common/MensajeError';
import { EncabezadoSemana } from '../components/contenido/EncabezadoSemana';
import { FormularioExamen } from '../components/examen/FormularioExamen';
import { TablaIntentos } from '../components/examen/TablaIntentos';
import {
  aDatosGenerales,
  aPreguntasNuevas,
  valoresInicialesExamen,
  type FormularioExamenValores,
} from '../components/examen/esquemaExamen';
import { claves, useExamenSemana, useIntentosExamen } from '../hooks/consultas';
import { useParametrosSemana } from '../hooks/useParametrosSemana';
import { useCasosDeUso } from '../providers/DependenciasContext';
import { rutas } from '../routes/rutas';

export const EditorExamenPage = () => {
  const { materiaId, semana, materia } = useParametrosSemana();
  const { crearExamen, actualizarExamen } = useCasosDeUso();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const examen = useExamenSemana(materiaId, semana);
  const intentos = useIntentosExamen(examen.data?.id);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const volver = rutas.semana(materiaId, semana);

  const guardado = useMutation({
    mutationFn: (valores: FormularioExamenValores): Promise<Examen> => {
      const generales = aDatosGenerales(valores);
      const preguntas = aPreguntasNuevas(valores.preguntas);
      const actual = examen.data;
      if (!actual) return crearExamen.ejecutar({ materiaId, semana, ...generales, preguntas });
      // Solo se envían las preguntas si cambiaron: así se puede editar el resto aunque ya haya intentos.
      const cambiaron = !preguntasIguales(preguntas, actual.preguntas);
      return actualizarExamen.ejecutar(actual.id, { ...generales, ...(cambiaron ? { preguntas } : {}) });
    },
    onMutate: () => setGuardadoOk(false),
    onSuccess: (nuevo) => {
      queryClient.setQueryData(claves.examenSemana(materiaId, semana), nuevo);
      void queryClient.invalidateQueries({ queryKey: claves.examen(nuevo.id) });
      setGuardadoOk(true);
    },
  });

  const tieneIntentos = (intentos.data?.length ?? 0) > 0;

  return (
    <main className="min-h-screen">
      <div className="max-w-[900px] mx-auto p-gutter py-8 space-y-8">
        <EncabezadoSemana
          materiaId={materiaId}
          semana={semana}
          materia={materia}
          volverA={{ ruta: volver, texto: `Volver a la semana ${semana}` }}
        />
        <h2 className="text-title-md font-headline-lg text-on-surface">
          {examen.data ? 'Editar examen de la semana' : 'Crear examen de la semana'}
        </h2>

        {examen.isPending && <Cargando />}
        {examen.error && <MensajeError error={examen.error} alReintentar={() => void examen.refetch()} />}
        {guardadoOk && (
          <p role="status" className="bg-secondary-container/30 border-l-4 border-primary p-3 rounded-r-lg text-body-sm">
            Examen guardado correctamente.
          </p>
        )}

        {examen.data !== undefined && (
          <FormularioExamen
            key={examen.data?.id ?? 'nuevo'}
            valoresIniciales={valoresInicialesExamen(examen.data, semana)}
            esNuevo={!examen.data}
            tieneIntentos={tieneIntentos}
            error={guardado.error}
            guardando={guardado.isPending}
            alGuardar={(valores) => guardado.mutate(valores)}
            alCancelar={() => navigate(volver)}
          />
        )}

        {examen.data && (
          <section className="space-y-4" aria-labelledby="titulo-resultados">
            <h2 id="titulo-resultados" className="text-title-md font-headline-lg text-on-surface">
              Resultados de los alumnos
            </h2>
            {intentos.isPending && <Cargando texto="Cargando resultados…" />}
            {intentos.error && <MensajeError error={intentos.error} alReintentar={() => void intentos.refetch()} />}
            {intentos.data && <TablaIntentos intentos={intentos.data} puntajeMaximo={examen.data.puntajeMaximo} />}
          </section>
        )}
      </div>
    </main>
  );
};
