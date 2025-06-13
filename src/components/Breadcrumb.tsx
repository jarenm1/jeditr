import React from 'react';

interface BreadcrumbProps {
  path: string;
  onPathClick?: (path: string) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onPathClick }) => {
  const segments = path.split('/').filter(Boolean);

  const handleClick = (index: number) => {
    if (onPathClick) {
      const newPath = segments.slice(0, index + 1).join('/');
      onPathClick(newPath);
    }
  };

  return (
    <div className="breadcrumb">
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          <button
            className="breadcrumb-segment"
            onClick={() => handleClick(index)}
            title={segments.slice(0, index + 1).join('/')}
          >
            {segment}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb; 