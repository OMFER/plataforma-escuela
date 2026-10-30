import { Cargando } from './Cargando';

/** Indicador mientras se descarga el código de una pantalla. */
export const CargandoPagina = () => (
  <main className="min-h-[50vh] flex items-center justify-center p-gutter">
    <Cargando texto="Cargando página…" />
  </main>
);
