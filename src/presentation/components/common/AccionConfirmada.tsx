import { useMutation } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { MensajeError } from './MensajeError';
import { estilos } from './estilos';

interface AccionConfirmadaProps<T> {
  /** Texto del botón, p. ej. "Publicar plan". */
  etiqueta: string;
  icono: string;
  titulo: string;
  textoConfirmar: string;
  textoOcupado?: string;
  /** Explicación de lo que va a pasar. */
  children: ReactNode;
  principal?: boolean;
  deshabilitado?: boolean;
  alConfirmar: () => Promise<T>;
  alTerminar?: (resultado: T) => void;
}

/** Botón que pide confirmación antes de una acción importante; si el servidor la rechaza, muestra por qué. */
export const AccionConfirmada = <T,>({
  etiqueta,
  icono,
  titulo,
  textoConfirmar,
  textoOcupado,
  children,
  principal = false,
  deshabilitado = false,
  alConfirmar,
  alTerminar,
}: AccionConfirmadaProps<T>) => {
  const [abierto, setAbierto] = useState(false);
  const accion = useMutation({
    mutationFn: alConfirmar,
    onSuccess: (resultado) => {
      setAbierto(false);
      alTerminar?.(resultado);
    },
  });

  return (
    <>
      <button
        type="button"
        className={principal ? estilos.botonPrimario : estilos.botonSecundario}
        disabled={deshabilitado}
        onClick={() => {
          accion.reset();
          setAbierto(true);
        }}
      >
        <span className="material-symbols-outlined text-[20px]">{icono}</span>
        {etiqueta}
      </button>
      <ConfirmDialog
        abierto={abierto}
        titulo={titulo}
        textoConfirmar={textoConfirmar}
        textoOcupado={textoOcupado}
        ocupado={accion.isPending}
        alConfirmar={() => accion.mutate()}
        alCancelar={() => setAbierto(false)}
      >
        {children}
        {accion.error && <MensajeError error={accion.error} />}
      </ConfirmDialog>
    </>
  );
};
