import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Officers from './pages/officers/Officers';
import StatusOverview from './pages/officers/StatusOverview';
import Designations from './pages/designations/Designations';
import Duties from './pages/duties/Duties';
import DutyHistory from './pages/duties/DutyHistory';
import Holidays from './pages/holidays/Holidays';
import Admins from './pages/admins/Admins';
import ActiveOfficers from './pages/stats/ActiveOfficers';
import AvailableOfficers from './pages/stats/AvailableOfficers';
import OnDutyOfficers from './pages/stats/OnDutyOfficers';
import OnHolidayOfficers from './pages/stats/OnHolidayOfficers';
import SpecialDutyOfficers from './pages/stats/SpecialDutyOfficers';
import OfficerHistory from './pages/officers/OfficerHistory';
import Settings from './pages/settings/Settings';

const ProtectedRoute = ({ children }) => {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { admin } = useAuth();

  return (
    <Routes>
      <Route path="/" element={admin ? <Navigate to="/dashboard" replace /> : <Welcome />} />
      <Route path="/login" element={admin ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/officers" element={<Officers />} />
                <Route path="/status-overview" element={<StatusOverview />} />
                <Route path="/designations" element={<Designations />} />
                <Route path="/duties" element={<Duties />} />
                <Route path="/duty-history" element={<DutyHistory />} />
                <Route path="/holidays" element={<Holidays />} />
                <Route path="/admins" element={<Admins />} />
                <Route path="/stats/active-officers" element={<ActiveOfficers />} />
                <Route path="/stats/available" element={<AvailableOfficers />} />
                <Route path="/stats/on-duty" element={<OnDutyOfficers />} />
                <Route path="/stats/on-holiday" element={<OnHolidayOfficers />} />
                <Route path="/officers/:id/history" element={<OfficerHistory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/stats/deputed" element={<SpecialDutyOfficers />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: '14px', fontFamily: 'Segoe UI, sans-serif' },
            success: { iconTheme: { primary: '#090884', secondary: 'white' } },
            error: { iconTheme: { primary: '#fe0808', secondary: 'white' } },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;


