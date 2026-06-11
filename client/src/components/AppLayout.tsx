import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from './AppNavbar';

interface AppLayoutProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const AppLayout = ({ theme, onToggleTheme }: AppLayoutProps) => {
  return (
    <div className="app-shell">
      <AppNavbar theme={theme} onToggleTheme={onToggleTheme} />
      <Container fluid="lg" className="py-4 app-content">
        <Outlet />
      </Container>
    </div>
  );
};
