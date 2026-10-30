/** Error de negocio o de comunicación, independiente del transporte. */
export class ErrorAplicacion extends Error {
  readonly estado: number | null;
  readonly mensajes: string[];

  constructor(mensajes: string | string[], estado: number | null = null) {
    const lista = (Array.isArray(mensajes) ? mensajes : [mensajes]).filter(Boolean);
    super(lista.join('\n') || 'Ocurrió un error inesperado.');
    this.name = 'ErrorAplicacion';
    this.estado = estado;
    this.mensajes = lista.length > 0 ? lista : [this.message];
  }

  get esNoAutorizado(): boolean {
    return this.estado === 401;
  }

  get esNoEncontrado(): boolean {
    return this.estado === 404;
  }

  get esConflicto(): boolean {
    return this.estado === 409;
  }
}

export const esErrorAplicacion = (e: unknown): e is ErrorAplicacion => e instanceof ErrorAplicacion;

export const mensajeDeError = (e: unknown): string => {
  if (e instanceof ErrorAplicacion) return e.message;
  if (e instanceof Error && e.message) return e.message;
  return 'Ocurrió un error inesperado.';
};
