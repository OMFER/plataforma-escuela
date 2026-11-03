/** Lleva la ventana hasta arriba, sin animación (al abrir una pantalla o mostrar un resultado). */
export const irArribaDeLaPagina = (): void => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};
