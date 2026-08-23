import { useEffect, useState } from 'react';
import { useScrollController } from '../systems/ScrollController';
import '../style.css';
import { EARTH_JOURNEY_END } from '../scenes/Intro/OrbitSequence';

export const IntroOverlay = () => {
  const scrollController = useScrollController();
  const [opacity, setOpacity] = useState(1);

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

      {/* Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '3rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        opacity: 0.6,
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: '0.2em',
        fontSize: '0.75rem',
        textTransform: 'uppercase'
      }}>
        <span>SCROLL TO EXPLORE</span>
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
