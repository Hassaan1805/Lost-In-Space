import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { AccentFrame } from './AccentFrame';

export const UranusStory = () => {
  return (
    <section className="uranus-story" id="uranus-section">
      <ScrollReveal className="orbit-story__reveal">
      {(isActive) => (
        <div className="orbit-story__content">
          <div className="orbit-story__eyebrow">07 / 09 — URANUS</div>
          <h2 className="orbit-story__title">URANUS</h2>
          <p className="orbit-story__description">
            A tilted world of ice, storms, and an atmosphere unlike any other.
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
            style={{ marginTop: '2rem' }}
          >
            <span>DISTANCE TO EARTH</span>
            <strong>~2.6 BILLION KM</strong>
            <span>ORBITAL PERIOD 84 YEARS</span>
          </AccentFrame>
        </div>
      )}
      </ScrollReveal>
    </section>
  );
};
