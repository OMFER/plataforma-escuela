import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CargandoPagina } from '../components/common/CargandoPagina';
import { Layout } from '../components/layout/Layout';
import { RequiereRol } from './RequiereRol';
import { RequiereSesion } from './RequiereSesion';

// Cada pantalla se descarga solo cuando se visita (code splitting por ruta).
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SemanaPage = lazy(() => import('../pages/SemanaPage').then((m) => ({ default: m.SemanaPage })));
const CalificacionesPage = lazy(() => import('../pages/CalificacionesPage').then((m) => ({ default: m.CalificacionesPage })));
const EditorContenidoPage = lazy(() => import('../pages/EditorContenidoPage').then((m) => ({ default: m.EditorContenidoPage })));
const EditorExamenPage = lazy(() => import('../pages/EditorExamenPage').then((m) => ({ default: m.EditorExamenPage })));
const ExamenPage = lazy(() => import('../pages/ExamenPage').then((m) => ({ default: m.ExamenPage })));
const AdminPage = lazy(() => import('../pages/AdminPage').then((m) => ({ default: m.AdminPage })));

export const AppRoutes = () => (
  <Suspense fallback={<CargandoPagina />}>
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
  </Suspense>
);
