import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { usersApi } from '../api/users';
import { workoutsApi } from '../api/workouts';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/LoadingState';
import { SectionHeader } from '../components/SectionHeader';
import { WorkoutForm } from '../components/WorkoutForm';
import type { UserProfileResponse } from '../types';
import { formatDate } from '../utils/format';

export const UserStatsPage = () => {
  const { user: currentUser, setUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightSaving, setWeightSaving] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.me();
      setProfile(response);
      const latestWeight = response.user.weightHistory.at(-1)?.weight ?? response.user.weight;
      setWeightInput(String(latestWeight));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const stats = profile?.stats;
  const weightHistory = profile?.user.weightHistory ?? [];
  const latestWeight = weightHistory.at(-1)?.weight ?? profile?.user.weight ?? 0;
  const workoutRows = useMemo(() => profile?.recentWorkouts ?? [], [profile]);

  const handleAddWorkout = async (payload: { type: string; date: string; duration: number }) => {
    setSavingWorkout(true);
    try {
      await workoutsApi.create(payload);
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout.');
    } finally {
      setSavingWorkout(false);
    }
  };

  const handleUpdateWeight = async (event: FormEvent) => {
    event.preventDefault();
    setWeightSaving(true);
    setWeightError(null);
    try {
      const response = await usersApi.updateWeight({ weight: Number(weightInput) });
      setUser(response.user);
      setShowWeightModal(false);
      await loadProfile();
    } catch (err) {
      setWeightError(err instanceof Error ? err.message : 'Failed to update weight.');
    } finally {
      setWeightSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading profile..." />;
  if (error || !profile || !currentUser) return <Card className="surface-card"><Card.Body className="text-danger">{error ?? 'Profile unavailable.'}</Card.Body></Card>;

  const chartSource = weightHistory.length ? weightHistory : [{ weight: latestWeight, date: profile.user.createdAt }];
  const weightChartData = chartSource.map((entry) => ({
    date: formatDate(entry.date),
    weight: entry.weight,
  }));

  return (
    <div>
      <SectionHeader
        title="My Profile"
        subtitle="Your private stats, weight history, and recent training history."
        action={
          <div className="d-flex flex-wrap gap-2">
            <Link to="/workouts" className="btn btn-warning fw-semibold">
              Log Workout
            </Link>
            <Button variant="outline-light" onClick={() => setShowWeightModal(true)}>
              Update Weight
            </Button>
          </div>
        }
      />

      <Row className="g-3">
        <Col lg={4}>
          <Card className="surface-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <Card.Title className="mb-1">{profile.user.name}</Card.Title>
                  <div className="text-muted">{profile.user.email}</div>
                </div>
                <Badge bg={profile.user.role === 'admin' ? 'danger' : 'secondary'}>{profile.user.role}</Badge>
              </div>
              <div className="profile-stack mt-3">
                <div><span>Age</span><strong>{profile.user.age}</strong></div>
                <div><span>Gender</span><strong>{profile.user.gender}</strong></div>
                <div><span>Height</span><strong>{profile.user.height} cm</strong></div>
                <div><span>Current Weight</span><strong>{latestWeight} kg</strong></div>
                <div><span>BMI</span><strong>{stats?.bmi}</strong></div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Row className="g-3">
            <Col md={4}><Card className="surface-card stat-mini"><Card.Body><span>Total Workouts</span><strong>{stats?.totalWorkouts}</strong></Card.Body></Card></Col>
            <Col md={4}><Card className="surface-card stat-mini"><Card.Body><span>Total Hours</span><strong>{stats?.totalWorkoutHours}</strong></Card.Body></Card></Col>
            <Col md={4}><Card className="surface-card stat-mini"><Card.Body><span>Total Calories</span><strong>{stats?.totalCaloriesBurned}</strong></Card.Body></Card></Col>
          </Row>
          {savingWorkout ? <Alert variant="warning" className="mt-3 mb-0">Saving workout...</Alert> : null}
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col lg={6}>
          <Card className="surface-card h-100">
            <Card.Body>
              <Card.Title className="mb-3">Weight Progress</Card.Title>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#f7c948" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="surface-card h-100">
            <Card.Body>
              <Card.Title className="mb-3">Recent Workouts</Card.Title>
              <div className="table-responsive">
                <Table hover className="align-middle workout-table mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Duration</th>
                      <th>Calories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workoutRows.map((workout) => (
                      <tr key={workout.id}>
                        <td>{formatDate(workout.date)}</td>
                        <td>{workout.type}</td>
                        <td>{workout.duration} min</td>
                        <td>{workout.calories}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showWeightModal} onHide={() => setShowWeightModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Weight</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(event) => void handleUpdateWeight(event)}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>New weight (kg)</Form.Label>
              <Form.Control type="number" min={30} max={250} value={weightInput} onChange={(event) => setWeightInput(event.target.value)} />
            </Form.Group>
            {weightError ? <Alert variant="danger" className="mt-3 mb-0">{weightError}</Alert> : null}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-light" onClick={() => setShowWeightModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="warning" className="fw-semibold" disabled={weightSaving}>
              {weightSaving ? 'Saving...' : 'Save Weight'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};
