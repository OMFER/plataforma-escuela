import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavBar } from './TopNavBar';
import { BottomNav } from './BottomNav';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-lg">
      <Sidebar />
      <div className="md:pl-64 min-h-screen flex flex-col">
        <TopNavBar />
        <div className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};