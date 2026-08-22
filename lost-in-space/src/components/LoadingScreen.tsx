import React, { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';

export const LoadingScreen = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Html center>
      <div style={{
        fontFamily: 'monospace',
        color: '#00ffcc',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        fontSize: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        whiteSpace: 'nowrap'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2px solid rgba(0, 255, 204, 0.2)',
          borderTopColor: '#00ffcc',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        INITIALIZING NAVIGATION{dots}
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Html>
  );
};
