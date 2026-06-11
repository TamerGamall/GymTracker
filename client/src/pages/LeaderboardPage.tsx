import { useEffect, useState } from 'react';
import { Badge, Card, Table } from 'react-bootstrap';
import { leaderboardApi } from '../api/leaderboard';
import { LoadingState } from '../components/LoadingState';
import { SectionHeader } from '../components/SectionHeader';
import type { LeaderboardRow } from '../types';
import { formatNumber } from '../utils/format';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await leaderboardApi.list();
        if (active) setLeaderboard(response.leaderboard);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load leaderboard.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState label="Loading leaderboard..." />;
  if (error) return <Card className="surface-card"><Card.Body className="text-danger">{error}</Card.Body></Card>;

  return (
    <div>
      <SectionHeader title="Leaderboard" subtitle="Read-only monthly ranking based on workout days, minutes, and calories burned." />
      <Card className="surface-card">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle leaderboard-table mb-0">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Workout Days</th>
                  <th>Total Minutes</th>
                  <th>Total Hours</th>
                  <th>Calories</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.user.id} className={row.rank <= 3 ? `top-rank rank-${row.rank}` : ''}>
                    <td>
                      <Badge bg={row.rank === 1 ? 'warning' : row.rank === 2 ? 'secondary' : row.rank === 3 ? 'dark' : 'light'} text={row.rank <= 3 ? 'dark' : undefined}>
                        #{row.rank}
                      </Badge>
                    </td>
                    <td>{row.user.name}</td>
                    <td>{row.user.gender}</td>
                    <td>{row.totalWorkoutDays}</td>
                    <td>{row.totalWorkoutMinutes}</td>
                    <td>{formatNumber(row.totalWorkoutHours, 1)}</td>
                    <td>{row.totalCaloriesBurned}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
