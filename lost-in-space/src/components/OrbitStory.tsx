import { AccentFrame } from './AccentFrame';
import { ScrollReveal } from './ScrollReveal';

export const OrbitStory = () => (
  <section className="orbit-story" aria-label="Earth orbit">
    <ScrollReveal
      id="orbit-story"
      start="top 78%"
      end="bottom 28%"
      direction="up"
      className="orbit-story__reveal"
    >
      {(isActive) => (
        <div className="orbit-story__content">
          <p className="orbit-story__eyebrow">02 / 09 — HOME ORBIT</p>
          <h2 className="orbit-story__title">THE ORBIT</h2>
          <p className="orbit-story__copy">
            A thin boundary between home and the infinite.
          </p>

          <AccentFrame
            color="cyan"
            mode="duo"
            cornerLength={13}
            cornerThickness={1}
            hoverEffect="glow"
            glowIntensity="low"
            animated={isActive}
            className="orbit-readout"
          >
            <span>ORBITAL ALTITUDE</span>
            <strong>408 KM</strong>
            <span>VELOCITY 27,600 KM/H</span>
          </AccentFrame>
        </div>
      )}
    </ScrollReveal>
  </section>
);
