import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { AccentFrame } from './AccentFrame';

export const FinalStory = () => {
  return (
    <section className="final-story" id="final-section" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <ScrollReveal className="orbit-story__reveal">
      {(isActive) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
        <div className="orbit-story__content" style={{ justifyItems: 'center', textAlign: 'center' }}>
          <div className="orbit-story__eyebrow">09 / 09 — BEYOND</div>
          <h2 className="orbit-story__title">BEYOND</h2>
          <p className="orbit-story__description" style={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.55)', textAlign: 'center' }}>
            We came looking for the edge of space.
            <br />
            Perhaps the edge was never there.
          </p>
          <AccentFrame 
            color="cyan"
            mode="quad"
            cornerLength={16}
            cornerThickness={2}
            hoverEffect="glow"
            glowIntensity="medium"
            animated={isActive}
            className="orbit-readout"
            style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <span>MISSION STATUS</span>
            <strong>JOURNEY COMPLETE</strong>
          </AccentFrame>
        </div>
        </div>
      )}
      </ScrollReveal>
    </section>
  );
};
