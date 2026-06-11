import { Container, Button, Badge } from 'react-bootstrap';
import { Outlet, NavLink } from 'react-router-dom';
import { FiMoon, FiSun } from 'react-icons/fi';

interface PublicLayoutProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const PublicLayout = ({ theme, onToggleTheme }: PublicLayoutProps) => {
  return (
    <div className="auth-shell">
      <header className="auth-topbar">
        <Container fluid="lg" className="d-flex justify-content-between align-items-center py-3">
          <NavLink to="/login" className="brand-mark">
            Gym Friends Tracker <Badge bg="warning" text="dark" className="ms-2">Social</Badge>
          </NavLink>
          <Button variant="outline-light" className="theme-btn" onClick={onToggleTheme}>
            {theme === 'dark' ? <FiSun /> : <FiMoon />} <span className="ms-2 d-none d-sm-inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </Button>
        </Container>
      </header>
      <Container fluid="lg" className="py-4 app-content">
        <Outlet />
      </Container>
    </div>
  );
};
