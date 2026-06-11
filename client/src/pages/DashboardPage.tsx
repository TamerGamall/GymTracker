import { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';
import { StatCard } from '../components/StatCard';
import { SectionHeader } from '../components/SectionHeader';
import { LoadingState } from '../components/LoadingState';
import type { DashboardResponse } from '../types';
import { formatDate, formatDateTime } from '../utils/format';

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await dashboardApi.get();
        if (active) {
          setData(response);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (error || !data) {
    return <Card className="surface-card"><Card.Body className="text-danger">{error ?? 'Unable to load dashboard.'}</Card.Body></Card>;
  }

  const { me, platformStats, leaderboard, recentWorkouts } = data;

  return (
    <div>
      <SectionHeader
        title={`Welcome back, ${me.user.name}`}
        subtitle="Your monthly activity, platform stats, and leaderboard position live in one place."
        action={
          <Link to="/profile" className="btn btn-warning fw-semibold">
            Open Profile
          </Link>
        }
      />

      <Row className="g-3 mb-4">
        <Col md={3}>
          <StatCard label="My Workouts" value={me.stats.totalWorkouts} hint="All-time sessions" accent="accent-gold" />
        </Col>
        <Col md={3}>
          <StatCard label="My Hours" value={me.stats.totalWorkoutHours} hint="All-time training hours" accent="accent-blue" />
        </Col>
        <Col md={3}>
          <StatCard label="Calories Burned" value={me.stats.totalCaloriesBurned} hint="All-time estimate" accent="accent-green" />
        </Col>
        <Col md={3}>
          <StatCard
            label="Platform Users"
            value={platformStats.totalUsers}
            hint={platformStats.mostActiveUser ? `Most active: ${platformStats.mostActiveUser.name}` : 'No leaderboard yet'}
            accent="accent-red"
          />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={7}>
          <Card className="surface-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">Monthly Leaderboard Preview</Card.Title>
                <Badge bg="warning" text="dark">Current Month</Badge>
              </div>
              <div className="table-responsive">
                <Table hover className="align-middle leaderboard-table mb-0">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Days</th>
                      <th>Minutes</th>
                      <th>Calories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row) => (
                      <tr key={row.user.id} className={row.rank <= 3 ? `top-rank rank-${row.rank}` : ''}>
                        <td>#{row.rank}</td>
                        <td>{row.user.name}</td>
                        <td>{row.totalWorkoutDays}</td>
                        <td>{row.totalWorkoutMinutes}</td>
                        <td>{row.totalCaloriesBurned}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="surface-card h-100">
            <Card.Body>
              <Card.Title className="mb-3">Quick Snapshot</Card.Title>
              <div className="profile-stack">
                <div><span>Name</span><strong>{me.user.name}</strong></div>
                <div><span>Role</span><strong>{me.user.role}</strong></div>
                <div><span>BMI</span><strong>{me.stats.bmi}</strong></div>
                <div><span>Last Refresh</span><strong>{formatDateTime(new Date())}</strong></div>
              </div>
              <div className="mt-3 d-flex gap-2 flex-wrap">
                <Link to="/workouts" className="btn btn-warning fw-semibold">
                  Log Workout
                </Link>
                <Link to="/leaderboard" className="btn btn-outline-light">
                  View Leaderboard
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <Card className="surface-card">
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
                    {recentWorkouts.map((workout) => (
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
        <Col lg={5}>
          <Card className="surface-card h-100">
            <Card.Body>
              <Card.Title className="mb-3">Platform Notes</Card.Title>
              <div className="small-stats">
                <span>{platformStats.totalWorkouts} total workouts stored</span>
                <span>Monthly ranking is sorted by workout days, minutes, then calories</span>
                <span>{platformStats.mostActiveUser ? `${platformStats.mostActiveUser.name} is leading the pack` : 'Add workouts to build the leaderboard'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
