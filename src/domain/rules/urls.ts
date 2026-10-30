/** true solo para URLs absolutas http(s); evita esquemas peligrosos como `javascript:`. */
export const esUrlHttp = (valor: string): boolean => {
  try {
    const url = new URL(valor.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};
