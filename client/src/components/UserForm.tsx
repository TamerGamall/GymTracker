import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import type { Gender } from '../types';

interface UserFormProps {
  onSubmit: (payload: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: Gender;
    height: number;
    weight: number;
  }) => Promise<void> | void;
  submitLabel?: string;
}

const initialState = {
  name: '',
  email: '',
  password: '',
  age: 25,
  gender: 'Male' as Gender,
  height: 175,
  weight: 75,
};

export const UserForm = ({ onSubmit, submitLabel = 'Create Account' }: UserFormProps) => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm(initialState);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="surface-card">
      <Card.Body>
        <Card.Title className="mb-3">Create Profile</Card.Title>
        <Form onSubmit={submit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control value={form.name} required onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={form.email} required onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={form.password} required onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Age</Form.Label>
                <Form.Control type="number" min={10} max={100} value={form.age} onChange={(event) => setForm((current) => ({ ...current, age: Number(event.target.value) }))} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Gender</Form.Label>
                <Form.Select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value as Gender }))}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Height (cm)</Form.Label>
                <Form.Control type="number" min={120} max={230} value={form.height} onChange={(event) => setForm((current) => ({ ...current, height: Number(event.target.value) }))} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Weight (kg)</Form.Label>
                <Form.Control type="number" min={30} max={250} value={form.weight} onChange={(event) => setForm((current) => ({ ...current, weight: Number(event.target.value) }))} />
              </Form.Group>
            </Col>
            <Col xs={12} className="d-flex align-items-center justify-content-between gap-3">
              <div className="auth-helper">Sample accounts are seeded so you can log in immediately after startup.</div>
              <Button type="submit" variant="warning" className="fw-semibold" disabled={submitting}>
                {submitting ? 'Saving...' : submitLabel}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};
