import { AccentFrame } from './AccentFrame';
import { ScrollReveal } from './ScrollReveal';

export const JupiterStory = () => (
  <section className="jupiter-story" aria-label="Jupiter">
    <ScrollReveal
      id="jupiter-story"
      start="top 75%"
      end="bottom 25%"
      direction="up"
      className="orbit-story__reveal"
    >
      {(isActive) => (
        <div className="orbit-story__content">
          <p className="orbit-story__eyebrow">05 / 09 — JUPITER</p>
          <h2 className="orbit-story__title">JUPITER</h2>
          <p className="orbit-story__copy">
            A behemoth of gas and storms, reigning supreme as the largest planet in our solar system.
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
            <strong>628,000,000 KM</strong>
            <span>ORBITAL PERIOD 12 YEARS</span>
          </AccentFrame>
        </div>
      )}
    </ScrollReveal>
  </section>
);
