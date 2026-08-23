import React, { useEffect, useState } from 'react';
import { AccentFrame } from './AccentFrame';
import { useScrollController } from '../systems/ScrollController';
import { PHASE_FOUR_START, PHASE_FIVE_START } from '../scenes/Intro/OrbitSequence';

export const HUD = () => {
  const scrollController = useScrollController();
  const [chapter, setChapter] = useState<'EARTH' | 'ORBIT' | 'MOON'>('EARTH');

  useEffect(() => scrollController.onStateChange((state) => {
    if (state.progress >= PHASE_FIVE_START) {
      setChapter('MOON');
    } else if (state.progress >= PHASE_FOUR_START) {
      setChapter('ORBIT');
    } else {
      setChapter('EARTH');
    }
  }), [scrollController]);

  const destination = chapter === 'MOON' ? '03 / 09 MOON' : (chapter === 'ORBIT' ? '02 / 09 ORBIT' : '01 / 09 EARTH');
  const status = chapter === 'MOON' ? 'TRANSIT' : (chapter === 'ORBIT' ? 'ORBITAL LOCK' : 'APPROACHING');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 20,
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'system-ui, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      fontSize: '0.7rem',
      color: 'rgba(255, 255, 255, 0.5)'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ paddingTop: '1.5rem', paddingLeft: '1.5rem' }}>LOST IN SPACE</div>
        <AccentFrame 
          color="cyan" 
          mode="quad" 
          cornerLength={8} 
          cornerThickness={1} 
          hoverEffect="flicker"
          glowIntensity="low"
          style={{ padding: '0.5rem 1rem' }}
        >
          {destination}
        </AccentFrame>
      </div>

      {/* Bottom Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <AccentFrame 
          color="cyan" 
          mode="duo" 
          cornerLength={12} 
          hoverEffect="trace"
          animated={true}
          style={{ padding: '0.5rem 1rem' }}
        >
          SYSTEM NOMINAL
        </AccentFrame>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
          <div style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: '#00ffcc',
            boxShadow: '0 0 10px #00ffcc',
            animation: 'pulse 2s infinite'
          }} />
          {status}
        </div>
      </div>
    </div>
  );
};
