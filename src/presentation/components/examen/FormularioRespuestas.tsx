import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { Examen, ResultadoIntento } from '../../../domain/entities/Examen';
import { contarRespondidas, estanTodasRespondidas, fechaLimiteVencida } from '../../../domain/rules/examen';
import { claves } from '../../hooks/consultas';
import { useCasosDeUso } from '../../providers/DependenciasContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MensajeError } from '../common/MensajeError';
import { estilos } from '../common/estilos';
import { PreguntaExamen } from './PreguntaExamen';

interface FormularioRespuestasProps {
  examen: Examen;
  alTerminar: (resultado: ResultadoIntento) => void;
}

export const FormularioRespuestas = ({ examen, alTerminar }: FormularioRespuestasProps) => {
  const { responderExamen } = useCasosDeUso();
  const queryClient = useQueryClient();
  const total = examen.preguntas.length;
  const [respuestas, setRespuestas] = useState<(number | null)[]>(() => Array.from({ length: total }, () => null));
  const [confirmando, setConfirmando] = useState(false);

  const envio = useMutation({
    mutationFn: () => responderExamen.ejecutar(examen.id, respuestas, total),
    onSuccess: (resultado) => {
      setConfirmando(false);
      void queryClient.invalidateQueries({ queryKey: claves.examenes });
      alTerminar(resultado);
    },
    onError: () => setConfirmando(false),
  });

  const completas = estanTodasRespondidas(respuestas, total);
  const vencido = fechaLimiteVencida(examen.fechaLimite);
  const respondidas = contarRespondidas(respuestas);

  const elegir = (pregunta: number, opcion: number) =>
    setRespuestas((previas) => previas.map((r, i) => (i === pregunta ? opcion : r)));

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (completas && !vencido) setConfirmando(true);
      }}
    >
      {examen.preguntas.map((pregunta, i) => (
        <PreguntaExamen
          key={pregunta.id ?? i}
          indice={i}
          pregunta={pregunta}
          seleccion={respuestas[i] ?? null}
          deshabilitada={envio.isPending || vencido}
          alElegir={(opcion) => elegir(i, opcion)}
        />
      ))}

      {envio.error && <MensajeError error={envio.error} />}

      <div className="sticky bottom-16 md:bottom-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-body-sm text-on-surface-variant" aria-live="polite">
          {vencido ? 'La fecha límite ya pasó; no es posible enviar.' : `Respondidas: ${respondidas} de ${total}`}
        </p>
        <button type="submit" className={estilos.botonPrimario} disabled={!completas || vencido || envio.isPending}>
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
        Solo tienes un intento. Una vez enviado no podrás cambiar tus respuestas.
      </ConfirmDialog>
    </form>
  );
};
