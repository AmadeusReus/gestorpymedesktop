// src/components/Common/Card.tsx

import React from 'react';
import '../../styles/components/Card.css';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  noPadding = false,
  elevated = false
}) => {
  return (
    <div className={`card ${elevated ? 'card--elevated' : ''} ${className}`}>
      {(title || subtitle) && (
        <div className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
      )}

      <div className={`card__content ${noPadding ? 'card__content--no-padding' : ''}`}>
        {children}
      </div>

      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
};

export default Card;
