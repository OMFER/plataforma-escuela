import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { AdminPage } from '../pages/AdminPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EditorContenidoPage } from '../pages/EditorContenidoPage';
import { EditorExamenPage } from '../pages/EditorExamenPage';
import { ExamenPage } from '../pages/ExamenPage';
import { LoginPage } from '../pages/LoginPage';
import { SemanaPage } from '../pages/SemanaPage';
import { RequiereRol } from './RequiereRol';
import { RequiereSesion } from './RequiereSesion';

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<RequiereSesion />}>
      <Route element={<Layout />}>
        <Route element={<RequiereRol roles={['alumno', 'maestro']} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/materias/:materiaId/semanas/:semana" element={<SemanaPage />} />
        </Route>
        <Route element={<RequiereRol roles={['maestro']} />}>
          <Route path="/materias/:materiaId/semanas/:semana/contenido" element={<EditorContenidoPage />} />
          <Route path="/materias/:materiaId/semanas/:semana/examen" element={<EditorExamenPage />} />
        </Route>
        <Route element={<RequiereRol roles={['alumno']} />}>
          <Route path="/examenes/:examenId" element={<ExamenPage />} />
        </Route>
        <Route element={<RequiereRol roles={['admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Route>
  </Routes>
);
