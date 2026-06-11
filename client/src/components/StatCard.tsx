import { Card } from 'react-bootstrap';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}

export const StatCard = ({ label, value, hint, accent = 'accent-default' }: StatCardProps) => {
  return (
    <Card className={`stat-card ${accent}`}>
      <Card.Body>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint ? <div className="stat-hint">{hint}</div> : null}
      </Card.Body>
    </Card>
  );
};
