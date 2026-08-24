import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { AccentFrame } from './AccentFrame';

export const FinalStory = () => {
  return (
    <section className="final-story" id="final-section" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <ScrollReveal className="orbit-story__reveal">
      {(isActive) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto', width: '100%' }}>
        <div className="orbit-story__content" style={{ justifyItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div className="orbit-story__eyebrow" style={{ fontSize: '1.2rem', letterSpacing: '0.25em', marginBottom: '0.5rem' }}>09 / 09 — BEYOND</div>
          <h2 className="orbit-story__title" style={{ fontSize: 'clamp(4.2rem, 10.5vw, 9rem)', lineHeight: 1 }}>BEYOND</h2>
          <p className="orbit-story__description" style={{ fontSize: 'clamp(1.5rem, 2.7vw, 1.8rem)', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.55)', textAlign: 'center', marginTop: '1rem', maxWidth: '80vw', lineHeight: 1.4 }}>
            We came looking for the edge of space.
            <br />
            Perhaps the edge was never there.
          </p>
          <div style={{ marginTop: '3rem', transform: 'scale(1.3)', transformOrigin: 'top center' }}>
            <AccentFrame 
              color="cyan"
              mode="quad"
              cornerLength={16}
              cornerThickness={2}
              hoverEffect="glow"
              glowIntensity="medium"
              animated={isActive}
              className="orbit-readout"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 0 }}
            >
              <span>MISSION STATUS</span>
              <strong>JOURNEY COMPLETE</strong>
            </AccentFrame>
          </div>
        </div>
        </div>
      )}
      </ScrollReveal>
    </section>
  );
};
