import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          <Route path="/curso/:id" element={<CourseDetail />} />
          <Route path="/openclass" element={<OpenClass />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;