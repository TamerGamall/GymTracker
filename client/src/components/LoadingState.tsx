import { Spinner } from 'react-bootstrap';

export const LoadingState = ({ label = 'Loading...' }: { label?: string }) => {
  return (
    <div className="page-loading">
      <Spinner animation="border" variant="warning" />
      <div className="mt-3 text-muted">{label}</div>
    </div>
  );
};
