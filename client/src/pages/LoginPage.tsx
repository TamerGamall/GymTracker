import type { FormEvent } from 'react';
import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SectionHeader } from '../components/SectionHeader';

export const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed.');
    }
  };

  return (
    <Row className="justify-content-center">
      <Col lg={10} xl={8}>
        <SectionHeader title="Welcome back" subtitle="Log in with your real account to access your private tracker." />
        <Row className="g-4">
          <Col md={7}>
            <Card className="surface-card">
              <Card.Body>
                <Form onSubmit={submit}>
                  <Row className="g-3">
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col xs={12} className="d-flex justify-content-between align-items-center gap-3">
                      <Button type="submit" variant="warning" className="fw-semibold" disabled={loading}>
                        {loading ? 'Signing in...' : 'Login'}
                      </Button>
                      <Link to="/register">Create account</Link>
                    </Col>
                  </Row>
                </Form>
                {(error || localError) ? <Alert variant="danger" className="mt-3 mb-0">{error ?? localError}</Alert> : null}
              </Card.Body>
            </Card>
          </Col>
          <Col md={5}>
            <Card className="surface-card h-100">
              <Card.Body>
                <Card.Title className="mb-3">Private Access</Card.Title>
                <p className="mb-0 text-muted">
                  Use your own email and password. No demo accounts are provided.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
