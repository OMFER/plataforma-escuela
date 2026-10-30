const formatoFechaHora = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatoFecha = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const esFechaValida = (fecha: Date): boolean => !Number.isNaN(fecha.getTime());

/** "25 de junio de 2026, 23:55" en la zona horaria del navegador. */
export const formatearFechaHora = (iso?: string): string => {
  if (!iso) return '';
  const fecha = new Date(iso);
  return esFechaValida(fecha) ? formatoFechaHora.format(fecha) : '';
};

/** Fecha de calendario (sin hora) tal como la guarda el backend. */
export const formatearFecha = (iso?: string): string => {
  if (!iso) return '';
  const fecha = new Date(iso);
  return esFechaValida(fecha) ? formatoFecha.format(fecha) : '';
};
