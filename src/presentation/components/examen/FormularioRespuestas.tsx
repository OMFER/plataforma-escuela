import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ExamenGrupo, ResultadoConRevision } from '../../../domain/entities/Examen';
import { contarRespondidas, estanTodasRespondidas } from '../../../domain/rules/examen';
import { claves } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { PreguntaExamen } from './PreguntaExamen';

interface FormularioRespuestasProps {
  grupoId: string;
  examen: ExamenGrupo;
  alTerminar: (resultado: ResultadoConRevision) => void;
}

export const FormularioRespuestas = ({ grupoId, examen, alTerminar }: FormularioRespuestasProps) => {
  const { responderExamen } = useCasosDeUso();
  const queryClient = useQueryClient();
  const total = examen.preguntas.length;
  const [respuestas, setRespuestas] = useState<(number | null)[]>(() => Array.from({ length: total }, () => null));
  const [confirmando, setConfirmando] = useState(false);

  const envio = useMutation({
    mutationFn: () => responderExamen.ejecutar({ grupoId, examenId: examen.id, respuestas, totalPreguntas: total }),
    onSuccess: (resultado) => {
      setConfirmando(false);
      alTerminar(resultado);
      void queryClient.invalidateQueries({ queryKey: claves.datosGrupo(grupoId) });
    },
    onError: () => setConfirmando(false),
  });

  const completas = estanTodasRespondidas(respuestas, total);
  const respondidas = contarRespondidas(respuestas);

  const elegir = (pregunta: number, opcion: number) =>
    setRespuestas((previas) => previas.map((r, i) => (i === pregunta ? opcion : r)));

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (completas) setConfirmando(true);
      }}
    >
      {examen.preguntas.map((pregunta, i) => (
        <PreguntaExamen
          key={pregunta.id}
          indice={i}
          pregunta={pregunta}
          seleccion={respuestas[i] ?? null}
          deshabilitada={envio.isPending}
          alElegir={(opcion) => elegir(i, opcion)}
        />
      ))}

      {envio.error && <MensajeError error={envio.error} />}

      <div className="sticky bottom-16 md:bottom-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-body-sm text-on-surface-variant" aria-live="polite">
          Respondidas: {respondidas} de {total}
        </p>
        <button type="submit" className={estilos.botonPrimario} disabled={!completas || envio.isPending}>
          <span className="material-symbols-outlined text-[20px]">send</span>
          Enviar respuestas
        </button>
      </div>

      <ConfirmDialog
        abierto={confirmando}
        titulo="¿Enviar tus respuestas?"
        textoConfirmar="Sí, enviar"
        ocupado={envio.isPending}
        alConfirmar={() => envio.mutate()}
        alCancelar={() => setConfirmando(false)}
      >
        <p>Solo tienes un intento. Una vez enviado no podrás cambiar tus respuestas.</p>
      </ConfirmDialog>
    </form>
  );
};
