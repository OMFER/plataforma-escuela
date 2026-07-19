import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CourseDetail } from './pages/CourseDetail';
import { OpenClass } from './pages/OpenClass';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* El Layout envuelve todas las rutas que estén dentro */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cursos" element={<Dashboard />} />
          <Route path="/curso/:id" element={<CourseDetail />} />
          <Route path="/openclass" element={<OpenClass />} />
          <Route path="/calificaciones" element={<CourseDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;