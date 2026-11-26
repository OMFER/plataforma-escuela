const FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** true si la fecha de calendario `YYYY-MM-DD` cae en lunes (no depende de la zona horaria). */
export const esLunes = (fecha: string): boolean => {
  const partes = FECHA.exec(fecha);
  if (!partes) return false;
  const dia = new Date(Date.UTC(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3])));
  return dia.getUTCDay() === 1;
};
