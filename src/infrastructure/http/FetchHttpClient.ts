import { ErrorAplicacion } from '../../domain/errors/ErrorAplicacion';
import type { HttpClient, OpcionesPeticion } from './HttpClient';

export interface ConfigFetchHttpClient {
  baseUrl: string;
  obtenerToken: () => string | null;
  /** Se invoca cuando una petición autenticada recibe 401. */
  alNoAutorizado?: () => void;
  fetch?: typeof fetch;
}

const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: 'La solicitud no es válida.',
  401: 'Tu sesión expiró o tus credenciales no son válidas.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con datos existentes.',
  500: 'Error interno del servidor. Intenta más tarde.',
};

interface CuerpoErrorApi {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

const esCuerpoError = (valor: unknown): valor is CuerpoErrorApi =>
  typeof valor === 'object' && valor !== null && ('message' in valor || 'statusCode' in valor);

/** Convierte la respuesta de error `{statusCode, message, error}` del backend en ErrorAplicacion. */
export const traducirError = (estado: number, cuerpo: unknown): ErrorAplicacion => {
  if (esCuerpoError(cuerpo)) {
    const { message } = cuerpo;
    const mensajes = Array.isArray(message)
      ? message.filter((m): m is string => typeof m === 'string')
      : typeof message === 'string'
        ? [message]
        : [];
    if (mensajes.length > 0) return new ErrorAplicacion(mensajes, estado);
  }
  return new ErrorAplicacion(MENSAJES_POR_ESTADO[estado] ?? `Error inesperado (${estado}).`, estado);
};

const quitarBarraFinal = (url: string): string => url.replace(/\/+$/, '');

export class FetchHttpClient implements HttpClient {
  private readonly config: ConfigFetchHttpClient;

  constructor(config: ConfigFetchHttpClient) {
    this.config = { ...config, baseUrl: quitarBarraFinal(config.baseUrl) };
  }

  get<T>(ruta: string, opciones?: OpcionesPeticion): Promise<T> {
    return this.peticion<T>('GET', ruta, undefined, opciones);
  }

  post<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T> {
    return this.peticion<T>('POST', ruta, cuerpo, opciones);
  }

  patch<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T> {
    return this.peticion<T>('PATCH', ruta, cuerpo, opciones);
  }

  delete<T = void>(ruta: string, opciones?: OpcionesPeticion): Promise<T> {
    return this.peticion<T>('DELETE', ruta, undefined, opciones);
  }

  private construirUrl(ruta: string, query?: OpcionesPeticion['query']): string {
    const url = `${this.config.baseUrl}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
    if (!query) return url;
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(query)) {
      if (valor !== undefined && valor !== '') params.set(clave, String(valor));
    }
    const texto = params.toString();
    return texto ? `${url}?${texto}` : url;
  }

  private async peticion<T>(metodo: string, ruta: string, cuerpo: unknown, opciones: OpcionesPeticion = {}): Promise<T> {
    const autenticada = opciones.autenticada ?? true;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';
    const token = autenticada ? this.config.obtenerToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const fetchFn = this.config.fetch ?? globalThis.fetch.bind(globalThis);
    let respuesta: Response;
    try {
      respuesta = await fetchFn(this.construirUrl(ruta, opciones.query), {
        method: metodo,
        headers,
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      });
    } catch {
      throw new ErrorAplicacion('No se pudo conectar con el servidor. Revisa tu conexión.', 0);
    }

    const datos = await this.leerCuerpo(respuesta);

    if (!respuesta.ok) {
      if (respuesta.status === 401 && autenticada && token) this.config.alNoAutorizado?.();
      throw traducirError(respuesta.status, datos);
    }
    return datos as T;
  }

  private async leerCuerpo(respuesta: Response): Promise<unknown> {
    if (respuesta.status === 204) return undefined;
    const texto = await respuesta.text();
    if (!texto) return undefined;
    try {
      return JSON.parse(texto);
    } catch {
      return texto;
    }
  }
}
