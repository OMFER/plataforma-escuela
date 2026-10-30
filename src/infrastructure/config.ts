const URL_API_POR_DEFECTO = 'http://localhost:3000';

export const obtenerUrlApi = (): string => {
  const valor: unknown = import.meta.env.VITE_API_URL;
  return typeof valor === 'string' && valor.trim() ? valor.trim() : URL_API_POR_DEFECTO;
};
