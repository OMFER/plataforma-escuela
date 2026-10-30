/** Clases compartidas para mantener el estilo visual consistente. */
export const estilos = {
  tarjeta: 'bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-surface-container-high',
  input:
    'w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-60',
  botonPrimario:
    'inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed',
  botonSecundario:
    'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold border border-outline-variant text-primary hover:bg-surface-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  botonPeligro:
    'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold border border-error/40 text-error hover:bg-error-container/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  botonPeligroLleno:
    'inline-flex items-center justify-center gap-2 bg-error text-on-primary px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed',
  botonIcono:
    'p-2 rounded-lg text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
  enlaceVolver: 'text-primary text-body-sm flex items-center gap-1 hover:underline w-fit',
  etiqueta: 'block text-label-caps font-label-caps text-on-surface-variant uppercase mb-1.5',
};
