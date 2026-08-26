import { useEffect, useState } from 'react';
import { useScrollController } from '../systems/ScrollController';
import '../style.css';
import { EARTH_JOURNEY_END } from '../scenes/Intro/OrbitSequence';

export const IntroOverlay = () => {
  const scrollController = useScrollController();
  const [opacity, setOpacity] = useState(1);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // We want the intro text to fade out as the user starts scrolling
    // Disappear completely by 15% scroll
    const unsubscribe = scrollController.onStateChange((state) => {
      const introEnd = 0.15 * EARTH_JOURNEY_END;
      if (state.progress < introEnd) {
        // Map 0 -> 0.15 to opacity 1 -> 0
        const newOpacity = 1 - (state.progress / introEnd);
        setOpacity(Math.max(0, newOpacity));
      } else {
        setOpacity(0);
      }
    });

    return unsubscribe;
  }, [scrollController]);

  if (opacity === 0) return null;

  return (
    <div className="intro-overlay" style={{ opacity }}>
      <h1 className="intro-title">LOST IN SPACE</h1>
      <p className="intro-subtitle">A JOURNEY THROUGH THE UNKNOWN</p>

      {/* Action Area */}
      <div style={{
        position: 'absolute',
        bottom: '3rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: '0.2em',
        fontSize: '0.75rem',
        textTransform: 'uppercase'
      }}>
        {!isStarted && (
          <button 
            onClick={() => setIsStarted(true)}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: 'inherit',
              transition: 'all 0.3s ease',
              outline: 'none',
              marginBottom: '1rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
          >
            ENABLE AUDIO
          </button>
        )}
        
        <span style={{ opacity: 0.6 }}>SCROLL TO EXPLORE</span>
        <div style={{
          width: '1px',
          height: '40px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))',
          animation: 'pulse 2s infinite'
        }} />
      </div>
    </div>
  );
};
