import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { AdminPage } from '../pages/AdminPage';
import { CalificacionesPage } from '../pages/CalificacionesPage';
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
          <Route path="/grupos/:grupoId/semanas/:semana" element={<SemanaPage />} />
          <Route path="/grupos/:grupoId/calificaciones" element={<CalificacionesPage />} />
        </Route>
        <Route element={<RequiereRol roles={['maestro']} />}>
          <Route path="/grupos/:grupoId/semanas/:semana/contenido" element={<EditorContenidoPage />} />
          <Route path="/grupos/:grupoId/examenes/nuevo" element={<EditorExamenPage />} />
          <Route path="/grupos/:grupoId/examenes/:examenId/editar" element={<EditorExamenPage />} />
        </Route>
        <Route element={<RequiereRol roles={['alumno']} />}>
          <Route path="/grupos/:grupoId/examenes/:examenId" element={<ExamenPage />} />
        </Route>
        <Route element={<RequiereRol roles={['admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Route>
  </Routes>
);
