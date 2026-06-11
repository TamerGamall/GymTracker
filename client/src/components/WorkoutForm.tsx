import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';

interface WorkoutFormProps {
  onSubmit: (payload: { type: string; date: string; duration: number }) => Promise<void> | void;
}

const workoutTypes = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'HIIT', 'Full Body', 'Core', 'Stretch'];
const defaultWorkoutType = workoutTypes[0] ?? 'Workout';

export const WorkoutForm = ({ onSubmit }: WorkoutFormProps) => {
  const [type, setType] = useState(defaultWorkoutType);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState(45);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ type, date, duration });
      setDuration(45);
      setDate(new Date().toISOString().slice(0, 10));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="surface-card">
      <Card.Body>
        <Card.Title className="mb-3">Log Workout</Card.Title>
        <Form onSubmit={submit}>
          <Row className="g-3">
            <Col md={5}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select value={type} onChange={(event) => setType(event.target.value)}>
                  {workoutTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Duration</Form.Label>
                <Form.Control type="number" min={5} step={1} value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Button type="submit" variant="warning" className="fw-semibold" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Workout'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};
