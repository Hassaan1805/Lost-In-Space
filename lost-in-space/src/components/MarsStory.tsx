import { AccentFrame } from './AccentFrame';
import { ScrollReveal } from './ScrollReveal';

export const MarsStory = () => (
  <section className="mars-story" aria-label="Mars">
    <ScrollReveal
      id="mars-story"
      start="top 75%"
      end="bottom 25%"
      direction="up"
      className="orbit-story__reveal"
    >
      {(isActive) => (
        <div className="orbit-story__content">
          <p className="orbit-story__eyebrow">04 / 09 — MARS</p>
          <h2 className="orbit-story__title">MARS</h2>
          <p className="orbit-story__copy">
            A dusty and desolate world that beckons exploration, the next great frontier.
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
            <strong>225,000,000 KM</strong>
            <span>ORBITAL PERIOD 687 DAYS</span>
          </AccentFrame>
        </div>
      )}
    </ScrollReveal>
  </section>
);
