import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { workoutsApi } from '../api/workouts';
import { LoadingState } from '../components/LoadingState';
import { SectionHeader } from '../components/SectionHeader';
import { WorkoutForm } from '../components/WorkoutForm';
import type { Workout } from '../types';
import { formatDate } from '../utils/format';

export const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadWorkouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutsApi.listMine();
      setWorkouts(response.workouts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workouts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkouts();
  }, []);

  const summary = useMemo(() => {
    const minutes = workouts.reduce((sum, workout) => sum + workout.duration, 0);
    const calories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
    return {
      count: workouts.length,
      hours: Number((minutes / 60).toFixed(1)),
      calories: Number(calories.toFixed(1)),
    };
  }, [workouts]);

  const handleCreateWorkout = async (payload: { type: string; date: string; duration: number }) => {
    setSaving(true);
    try {
      await workoutsApi.create(payload);
      await loadWorkouts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (workoutId: string) => {
    try {
      await workoutsApi.remove(workoutId);
      await loadWorkouts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workout.');
    }
  };

  if (loading) return <LoadingState label="Loading workouts..." />;
  if (error) return <Card className="surface-card"><Card.Body className="text-danger">{error}</Card.Body></Card>;

  return (
    <div>
      <SectionHeader
        title="Workouts"
        subtitle="Add sessions to your account and track your training history."
        action={<Badge bg="warning" text="dark">My Activity</Badge>}
      />
      <Row className="g-3 mb-4">
        <Col md={4}><Card className="surface-card stat-mini"><Card.Body><span>Total Workouts</span><strong>{summary.count}</strong></Card.Body></Card></Col>
        <Col md={4}><Card className="surface-card stat-mini"><Card.Body><span>Total Hours</span><strong>{summary.hours}</strong></Card.Body></Card></Col>
        <Col md={4}><Card className="surface-card stat-mini"><Card.Body><span>Total Calories</span><strong>{summary.calories}</strong></Card.Body></Card></Col>
      </Row>
      <Row className="g-4">
        <Col lg={4}>
          <WorkoutForm onSubmit={handleCreateWorkout} />
          {saving ? <Alert variant="warning" className="mt-3 mb-0">Saving workout...</Alert> : null}
        </Col>
        <Col lg={8}>
          <Card className="surface-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">Recent Sessions</Card.Title>
                <Link to="/profile" className="btn btn-outline-light btn-sm">
                  Open Profile
                </Link>
              </div>
              <div className="table-responsive">
                <Table hover className="align-middle workout-table mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Calories</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {workouts.map((workout) => (
                      <tr key={workout.id}>
                        <td>{formatDate(workout.date)}</td>
                        <td>{workout.type}</td>
                        <td>{workout.duration} min</td>
                        <td>{workout.calories}</td>
                        <td className="text-end">
                          <Button variant="outline-warning" size="sm" onClick={() => void handleDelete(workout.id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
