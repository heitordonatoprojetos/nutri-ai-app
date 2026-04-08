import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CameraFlow from './pages/CameraFlow';
import Diet from './pages/Diet';
import Progress from './pages/Progress';
import BottomNav from './components/BottomNav';

function AppContent() {
  const location = useLocation();
  const hideNavOn = ['/', '/camera'];
  const showNav = !hideNavOn.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/camera" element={<CameraFlow />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
