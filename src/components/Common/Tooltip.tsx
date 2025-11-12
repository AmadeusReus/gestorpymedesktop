// src/components/Common/Tooltip.tsx

import React, { useState } from 'react';
import '../../styles/components/Tooltip.css';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="tooltip-container">
      <button
        className="tooltip-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        title="Haz clic para más información"
      >
        ?
      </button>
      {isVisible && (
        <div className="tooltip-content">
          {text}
          {children}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
