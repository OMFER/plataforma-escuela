import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import type { Sesion } from '../../domain/entities/Usuario';
import { useDependencias } from './DependenciasContext';
import { SesionContext, type ValorSesion } from './SesionContext';

const AVISO_EXPIRADA = 'Tu sesión expiró. Vuelve a iniciar sesión.';

export const SesionProvider = ({ children }: { children: ReactNode }) => {
  const { casosDeUso, eventosSesion } = useDependencias();
  const queryClient = useQueryClient();
  const [sesion, setSesion] = useState<Sesion | null>(() => casosDeUso.obtenerSesionActual.ejecutar());
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(
    () =>
      eventosSesion.alExpirar(() => {
        setSesion(null);
        setAviso(AVISO_EXPIRADA);
        queryClient.clear();
      }),
    [eventosSesion, queryClient],
  );

  const valor: ValorSesion = {
    sesion,
    usuario: sesion?.usuario ?? null,
    aviso,
    iniciarSesion: async (correo, password) => {
      const nueva = await casosDeUso.iniciarSesion.ejecutar(correo, password);
      queryClient.clear();
      setAviso(null);
      setSesion(nueva);
      return nueva;
    },
    cerrarSesion: () => {
      casosDeUso.cerrarSesion.ejecutar();
      queryClient.clear();
      setAviso(null);
      setSesion(null);
    },
  };

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
};
