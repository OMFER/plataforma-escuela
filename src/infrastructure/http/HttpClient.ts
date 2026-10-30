export interface OpcionesPeticion {
  /** false para rutas públicas (login): no se envía token ni se dispara el cierre de sesión por 401. */
  autenticada?: boolean;
  query?: Record<string, string | number | undefined>;
}

export interface HttpClient {
  get<T>(ruta: string, opciones?: OpcionesPeticion): Promise<T>;
  post<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T>;
  patch<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T>;
  delete<T = void>(ruta: string, opciones?: OpcionesPeticion): Promise<T>;
}
