import React, { useState, useRef, MouseEvent } from 'react';

export type CutType = 'full' | 'chip' | 'relief';

interface CardSimulatorProps {
  imageUrl?: string;
  className?: string;
  cutType?: CutType;
}

export default function CardSimulator({ imageUrl, className = '', cutType = 'chip' }: CardSimulatorProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    
    const rotateX = y * -35; 
    const rotateY = x * 35;
    
    setTiltStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `rotateX(0deg) rotateY(0deg)`,
      transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });
  };

  return (
    <div 
      className={`card-simulator ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
    >
      <div className="card-simulator-inner" style={tiltStyle}>
        {imageUrl ? (
          <img src={imageUrl} alt="Sticker Preview" className={`card-sticker-image cut-${cutType}`} />
        ) : (
          <div className="card-placeholder">
            <span>Select a sticker</span>
          </div>
        )}
        
        {(cutType === 'chip') && (
          <div className="card-chip">
            <svg viewBox="0 0 100 80" className="chip-svg" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="80" rx="10" fill="#d4af37" />
              <path d="M 0 20 L 30 20 M 0 40 L 30 40 M 0 60 L 30 60" stroke="#b3912a" strokeWidth="2" />
              <path d="M 100 20 L 70 20 M 100 40 L 70 40 M 100 60 L 70 60" stroke="#b3912a" strokeWidth="2" />
              <path d="M 30 0 L 30 80" stroke="#b3912a" strokeWidth="2" />
              <path d="M 70 0 L 70 80" stroke="#b3912a" strokeWidth="2" />
              <rect x="30" y="20" width="40" height="40" rx="5" fill="none" stroke="#b3912a" strokeWidth="2" />
            </svg>
          </div>
        )}

        <div className="card-gloss"></div>
        
        {!imageUrl && (
          <div className="card-logo-placeholder">
             <div className="circle red"></div>
             <div className="circle yellow"></div>
          </div>
        )}
      </div>
    </div>
  );
}
