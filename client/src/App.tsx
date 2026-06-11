import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';
import { PublicLayout } from './components/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { UserStatsPage } from './pages/UserStatsPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminRoute } from './components/AdminRoute';

const THEME_STORAGE_KEY = 'gym-friends-tracker-theme';

const AppRoutes = ({ theme, onToggleTheme }: { theme: 'dark' | 'light'; onToggleTheme: () => void }) => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<PublicLayout theme={theme} onToggleTheme={onToggleTheme} />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout theme={theme} onToggleTheme={onToggleTheme} />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<UserStatsPage />} />
          <Route path="workouts" element={<WorkoutsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export const App = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
      </AuthProvider>
    </BrowserRouter>
  );
};
