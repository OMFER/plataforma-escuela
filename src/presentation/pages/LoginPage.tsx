import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { APP_TEXTS } from '../constants/textos';
import { Campo } from '../components/common/Campo';
import { MensajeError } from '../components/common/MensajeError';
import { estilos } from '../components/common/estilos';
import { useSesion } from '../providers/SesionContext';
import { inicioPorRol } from '../routes/rutas';

const esquema = z.object({
  correo: z.email({ error: 'Escribe un correo válido.' }),
  password: z.string().min(1, 'Escribe tu contraseña.'),
});

type DatosLogin = z.infer<typeof esquema>;

interface EstadoNavegacion {
  desde?: string;
}

export const LoginPage = () => {
  const { sesion, aviso, iniciarSesion } = useSesion();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosLogin>({ resolver: zodResolver(esquema), defaultValues: { correo: '', password: '' } });

  if (sesion) return <Navigate to={inicioPorRol(sesion.usuario.rol)} replace />;

  const desde = (location.state as EstadoNavegacion | null)?.desde;

  const enviar = handleSubmit(async ({ correo, password }) => {
    setError(null);
    try {
      const nueva = await iniciarSesion(correo, password);
      navigate(desde && desde !== '/login' ? desde : inicioPorRol(nueva.usuario.rol), { replace: true });
    } catch (e) {
      setError(e);
    }
  });

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-gutter">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div>
            <h1 className="text-headline-lg-mobile font-headline-lg text-primary">{APP_TEXTS.brand.name}</h1>
            <p className="text-label-caps font-label-caps text-on-surface-variant">{APP_TEXTS.brand.subtitle}</p>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-title-md text-on-surface">Inicia sesión</h2>
          <p className="text-body-sm text-on-surface-variant">Usa la cuenta que te asignó la administración escolar.</p>
        </div>

        {aviso && !error && (
          <p role="status" className="bg-secondary-container/30 border-l-4 border-primary p-3 rounded-r-lg text-body-sm">
            {aviso}
          </p>
        )}
        {error !== null && <MensajeError error={error} />}

        <form onSubmit={enviar} noValidate className="space-y-5">
          <Campo etiqueta="Correo" htmlFor="correo" error={errors.correo?.message}>
            <input id="correo" type="email" autoComplete="username" className={estilos.input} {...register('correo')} />
          </Campo>
          <Campo etiqueta="Contraseña" htmlFor="password" error={errors.password?.message}>
            <input id="password" type="password" autoComplete="current-password" className={estilos.input} {...register('password')} />
          </Campo>
          <button type="submit" disabled={isSubmitting} className={`${estilos.botonPrimario} w-full`}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
};
