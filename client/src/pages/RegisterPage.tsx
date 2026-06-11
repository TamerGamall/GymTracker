import { Alert, Col, Row, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SectionHeader } from '../components/SectionHeader';
import { UserForm } from '../components/UserForm';

export const RegisterPage = () => {
  const { register, loading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (payload: { name: string; email: string; password: string; age: number; gender: 'Male' | 'Female'; height: number; weight: number }) => {
    setLocalError(null);
    try {
      await register(payload);
      navigate('/', { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Registration failed.');
    }
  };

  return (
    <Row className="justify-content-center">
      <Col lg={10} xl={8}>
        <SectionHeader title="Create your account" subtitle="Add your profile once, then use the app like a social fitness platform." />
        <UserForm onSubmit={submit} submitLabel={loading ? 'Creating...' : 'Create Account'} />
        {(error || localError) ? <Alert variant="danger" className="mt-3 mb-0">{error ?? localError}</Alert> : null}
        <Card className="surface-card mt-3">
          <Card.Body>
            <p className="mb-0">
              Already have an account? <Link to="/login">Sign in here</Link>.
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};
