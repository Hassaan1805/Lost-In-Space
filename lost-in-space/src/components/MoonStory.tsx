import { AccentFrame } from './AccentFrame';
import { ScrollReveal } from './ScrollReveal';

export const MoonStory = () => (
  <section className="moon-story" aria-label="Earth's Moon">
    <ScrollReveal
      id="moon-story"
      start="top 75%"
      end="bottom 25%"
      direction="up"
      className="orbit-story__reveal"
    >
      {(isActive) => (
        <div className="orbit-story__content">
          <p className="orbit-story__eyebrow">03 / 09 — LUNA</p>
          <h2 className="orbit-story__title">THE MOON</h2>
          <p className="orbit-story__copy">
            A silent sentinel holding the memories of our earliest ambitions.
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
            <strong>384,400 KM</strong>
            <span>ORBITAL PERIOD 27.3 DAYS</span>
          </AccentFrame>
        </div>
      )}
    </ScrollReveal>
  </section>
);
