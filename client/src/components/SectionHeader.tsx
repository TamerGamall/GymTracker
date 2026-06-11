import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const SectionHeader = ({ title, subtitle, action }: SectionHeaderProps) => {
  return (
    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
      <div>
        <h2 className="section-title mb-1">{title}</h2>
        {subtitle ? <p className="section-subtitle mb-0">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
};
