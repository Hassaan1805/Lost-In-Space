import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { AccentFrame } from './AccentFrame';

export const NeptuneStory = () => {
  return (
    <section className="neptune-story" id="neptune-section">
      <ScrollReveal className="orbit-story__reveal">
      {(isActive) => (
        <div className="orbit-story__content">
          <div className="orbit-story__eyebrow">08 / 09 — NEPTUNE</div>
          <h2 className="orbit-story__title">NEPTUNE</h2>
          <p className="orbit-story__description">
            A distant blue world of violent winds, deep atmosphere, and the edge of our planetary journey.
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
            <strong>~4.3 BILLION KM</strong>
            <span>ORBITAL PERIOD 164.8 YEARS</span>
          </AccentFrame>
        </div>
      )}
      </ScrollReveal>
    </section>
  );
};
