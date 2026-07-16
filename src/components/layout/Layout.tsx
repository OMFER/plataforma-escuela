import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavBar } from './TopNavBar';
import { BottomNav } from './BottomNav';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-lg">
      <Sidebar />
      <TopNavBar />
      <div className="pb-16 md:pb-0">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
};