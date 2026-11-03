import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useMenuLateral } from '../../hooks/useMenuLateral';
import { BotonVolverProvider } from '../../providers/BotonVolverProvider';
import { CargandoPagina } from '../common/CargandoPagina';
import { ScrollAlInicio } from './ScrollAlInicio';
import { Sidebar } from './Sidebar';
import { TopNavBar } from './TopNavBar';
import { BottomNav } from './BottomNav';

export const Layout = () => {
  const menu = useMenuLateral();

  return (
    <BotonVolverProvider>
    <ScrollAlInicio />
    <div className="min-h-screen bg-background text-on-surface font-body-lg">
      <Sidebar abierto={menu.abierto} alCerrar={menu.cerrar} alNavegar={menu.alNavegar} />
      <div className={`min-h-screen flex flex-col transition-[padding] duration-200 ${menu.abierto ? 'md:pl-64' : ''}`}>
        <TopNavBar menuAbierto={menu.abierto} alAlternarMenu={menu.alternar} />
        <div className="flex-1 pb-16 md:pb-0">
          {/* La barra lateral se queda visible mientras se descarga la pantalla. */}
          <Suspense fallback={<CargandoPagina />}>
            <Outlet />
          </Suspense>
        </div>
      </div>

      <BottomNav />
    </div>
    </BotonVolverProvider>
  );
};
