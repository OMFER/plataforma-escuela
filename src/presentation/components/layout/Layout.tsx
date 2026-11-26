import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { MENU_LATERAL_HABILITADO } from '../../constants/navegacion';
import { useMenuLateral } from '../../hooks/useMenuLateral';
import { CargandoPagina } from '../common/CargandoPagina';
import { ScrollAlInicio } from './ScrollAlInicio';
import { Sidebar } from './Sidebar';
import { TopNavBar } from './TopNavBar';
import { BottomNav } from './BottomNav';

export const Layout = () => {
  const menu = useMenuLateral();
  // Con el menú lateral apagado se comporta como si siempre estuviera cerrado.
  const menuAbierto = MENU_LATERAL_HABILITADO && menu.abierto;

  return (
    <>
    <ScrollAlInicio />
    <div className="min-h-screen bg-background text-on-surface font-body-lg">
      {MENU_LATERAL_HABILITADO && <Sidebar abierto={menu.abierto} alCerrar={menu.cerrar} alNavegar={menu.alNavegar} />}
      <div className={`min-h-screen flex flex-col transition-[padding] duration-200 ${menuAbierto ? 'md:pl-64' : ''}`}>
        <TopNavBar
          menuAbierto={menuAbierto}
          alAlternarMenu={MENU_LATERAL_HABILITADO ? menu.alternar : undefined}
        />
        <div className="flex-1 pb-16 md:pb-0">
          {/* La barra lateral se queda visible mientras se descarga la pantalla. */}
          <Suspense fallback={<CargandoPagina />}>
            <Outlet />
          </Suspense>
        </div>
      </div>

      <BottomNav />
    </div>
    </>
  );
};
