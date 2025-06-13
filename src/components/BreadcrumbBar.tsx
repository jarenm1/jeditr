import React from 'react';
import './BreadcrumbBar.css';

interface BreadcrumbBarProps {
  path: string;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({ path }) => {
  const parts = path.split('/').filter(Boolean);

  return (
    <div className="breadcrumb-bar">
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="separator">/</span>}
          <span className="part">{part}</span>
        </React.Fragment>
      ))}
    </div>
  );
}; 