import { Container, Nav, Navbar, Button, Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

interface AppNavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const AppNavbar = ({ theme, onToggleTheme }: AppNavbarProps) => {
  const { user, logout } = useAuth();

  return (
    <Navbar expand="lg" className="app-navbar py-3">
      <Container fluid="lg">
        <Navbar.Brand as={NavLink} to="/" className="brand-mark">
          Gym Friends Tracker <Badge bg="warning" text="dark" className="ms-2">Social</Badge>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-lg-center gap-lg-2">
            <Nav.Link as={NavLink} to="/" end>
              My Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/profile">
              My Profile
            </Nav.Link>
            <Nav.Link as={NavLink} to="/workouts">
              My Workouts
            </Nav.Link>
            <Nav.Link as={NavLink} to="/leaderboard">
              Leaderboard
            </Nav.Link>
            {user?.role === 'admin' ? (
              <Nav.Link as={NavLink} to="/admin">
                Admin Dashboard
              </Nav.Link>
            ) : null}
            <Button variant="outline-light" className="ms-lg-2 theme-btn" onClick={onToggleTheme}>
              {theme === 'dark' ? <FiSun /> : <FiMoon />} <span className="ms-2 d-none d-sm-inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </Button>
            {user ? (
              <div className="nav-user-chip ms-lg-2">
                <span>{user.name}</span>
                <Button variant="outline-warning" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
