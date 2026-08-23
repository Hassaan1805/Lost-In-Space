import { AccentFrame } from './AccentFrame';
import { ScrollReveal } from './ScrollReveal';

export const SaturnStory = () => (
  <section className="saturn-story" aria-label="Saturn">
    <ScrollReveal
      id="saturn-story"
      start="top 75%"
      end="bottom 25%"
      direction="up"
      className="orbit-story__reveal"
    >
      {(isActive) => (
        <div className="orbit-story__content">
          <p className="orbit-story__eyebrow">06 / 09 — SATURN</p>
          <h2 className="orbit-story__title">SATURN</h2>
          <p className="orbit-story__copy">
            The ringed giant, a world of ice, gas, and impossible scale.
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
            <strong>~1.2 BILLION KM</strong>
            <span>ORBITAL PERIOD 29.5 YEARS</span>
          </AccentFrame>
        </div>
      )}
    </ScrollReveal>
  </section>
);
