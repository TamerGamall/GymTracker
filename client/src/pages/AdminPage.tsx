import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { adminApi } from '../api/admin';
import { LoadingState } from '../components/LoadingState';
import { SectionHeader } from '../components/SectionHeader';
import type { PlatformStats, PublicUser, Workout } from '../types';
import { formatDate, formatDateTime } from '../utils/format';

export const AdminPage = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResponse, usersResponse, workoutsResponse] = await Promise.all([
        adminApi.stats(),
        adminApi.users(),
        adminApi.workouts(),
      ]);

      setStats(statsResponse);
      setUsers(usersResponse.users);
      setWorkouts(workoutsResponse.workouts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm('Delete this user and all of their workouts?');
    if (!confirmed) return;

    setDeletingUserId(userId);
    try {
      await adminApi.deleteUser(userId);
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading admin dashboard..." />;
  }

  if (error || !stats) {
    return (
      <Card className="surface-card">
        <Card.Body className="text-danger">{error ?? 'Admin dashboard unavailable.'}</Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Admin Dashboard"
        subtitle="Manage users and workouts, and monitor platform activity from one place."
      />

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="surface-card stat-mini h-100">
            <Card.Body>
              <span>Total Users</span>
              <strong>{stats.totalUsers}</strong>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="surface-card stat-mini h-100">
            <Card.Body>
              <span>Total Workouts</span>
              <strong>{stats.totalWorkouts}</strong>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="surface-card stat-mini h-100">
            <Card.Body>
              <span>Most Active User</span>
              <strong>{stats.mostActiveUser ? stats.mostActiveUser.name : 'N/A'}</strong>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={6}>
          <Card className="surface-card h-100">
            <Card.Body>
              <Card.Title className="mb-3">Users</Card.Title>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="fw-semibold">{user.name}</div>
                          <div className="text-muted small">{user.email}</div>
                        </td>
                        <td>
                          <Badge bg={user.role === 'admin' ? 'danger' : 'secondary'}>{user.role}</Badge>
                        </td>
                        <td>{formatDateTime(user.createdAt)}</td>
                        <td className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => void handleDeleteUser(user.id)}
                            disabled={deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
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

        <Col lg={6}>
          <Card className="surface-card h-100">
            <Card.Body>
              <Card.Title className="mb-3">Workouts</Card.Title>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workouts.slice(0, 12).map((workout) => (
                      <tr key={workout.id}>
                        <td>{formatDate(workout.date)}</td>
                        <td>{workout.user?.name ?? workout.userId}</td>
                        <td>{workout.type}</td>
                        <td>{workout.duration} min</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Alert variant="warning" className="mb-0">
        The admin dashboard is read/write for platform management, while profile access stays private to each user.
      </Alert>
    </div>
  );
};
