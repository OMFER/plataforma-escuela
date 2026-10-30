import { useMutation } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { MensajeError } from './MensajeError';
import { estilos } from './estilos';

interface AccionEliminarProps {
  /** Texto del botón, p. ej. "Eliminar examen". */
  etiqueta: string;
  titulo: string;
  /** Explicación de lo que se borra. */
  children: ReactNode;
  alEliminar: () => Promise<unknown>;
  alEliminado?: () => void;
}

/** Botón de eliminar con confirmación; si el servidor rechaza (p. ej. 409) muestra su mensaje en el diálogo. */
export const AccionEliminar = ({ etiqueta, titulo, children, alEliminar, alEliminado }: AccionEliminarProps) => {
  const [abierto, setAbierto] = useState(false);
  const eliminacion = useMutation({
    mutationFn: alEliminar,
    onSuccess: () => {
      setAbierto(false);
      alEliminado?.();
    },
  });

  return (
    <>
      <button
        type="button"
        className={estilos.botonPeligro}
        onClick={() => {
          eliminacion.reset();
          setAbierto(true);
        }}
      >
        <span className="material-symbols-outlined text-[20px]">delete</span>
        {etiqueta}
      </button>
      <ConfirmDialog
        abierto={abierto}
        titulo={titulo}
        textoConfirmar="Sí, eliminar"
        textoOcupado="Eliminando…"
        peligroso
        ocupado={eliminacion.isPending}
        alConfirmar={() => eliminacion.mutate()}
        alCancelar={() => setAbierto(false)}
      >
        {children}
        {eliminacion.error && <MensajeError error={eliminacion.error} />}
      </ConfirmDialog>
    </>
  );
};
