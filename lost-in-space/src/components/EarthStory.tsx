import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { AccentFrame } from './AccentFrame';
import RadialOrbitalTimeline from './RadialOrbitalTimeline';
import { useScrollController } from '../systems/ScrollController';
import { PHASE_FOUR_START } from '../scenes/Intro/OrbitSequence';

export const EarthStory = () => {
  const scrollController = useScrollController();
  const [isOrbitChapter, setIsOrbitChapter] = React.useState(false);

  React.useEffect(() => scrollController.onStateChange((state) => {
    setIsOrbitChapter(state.progress >= PHASE_FOUR_START);
  }), [scrollController]);

  return (
    <div style={{
      position: 'absolute',
      top: '150vh', // Starts halfway down the scroll
      left: 0,
      width: '100%',
      height: '350vh', // Takes up the rest of the scroll space
      // The timeline is part of this layer. Keeping the parent interactive
      // prevents browser hit-testing from dropping its children after scroll.
      pointerEvents: 'auto',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 10vw'
    }}>
      <ScrollReveal 
        id="earth-story-1" 
        start="top 70%" 
        end="bottom 30%"
        direction="up"
        className="story-block"
      >
        {(isActive) => (
          <AccentFrame
            color="cyan"
            mode="quad"
            cornerLength={16}
            cornerThickness={2}
            hoverEffect="glow"
            animated={isActive}
            style={{
              padding: '2rem 3rem',
              backgroundColor: 'rgba(10, 10, 10, 0.4)',
              backdropFilter: 'blur(8px)',
              transform: isActive ? 'translateY(0)' : 'translateY(40px)',
              opacity: isActive ? 1 : 0,
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'center'
            }}
          >
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 200,
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              color: '#fff'
            }}>
              Earth
            </h2>
            <p style={{
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '600px',
              lineHeight: 1.6
            }}>
              Our home. A fragile sphere of water and atmosphere floating in the vastness of the cosmos.
            </p>
          </AccentFrame>
        )}
      </ScrollReveal>

      <ScrollReveal 
        id="earth-story-2" 
        start="top 70%" 
        end="bottom 30%"
        direction="up"
        className="story-block"
      >
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 300,
          fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
          color: '#fff',
          maxWidth: '800px',
          textAlign: 'center',
          lineHeight: 1.5,
          fontStyle: 'italic'
        }}>
          "From here, everything you have ever known, everyone you have ever loved, lived out their lives on a mote of dust suspended in a sunbeam."
        </p>
      </ScrollReveal>

      {/* Radial Timeline */}
      <ScrollReveal 
        id="earth-story-timeline" 
        start="top 90%" 
        end="bottom 10%"
        direction="up"
        className="story-block"
      >
        <div
          style={{
            pointerEvents: isOrbitChapter ? 'none' : 'auto',
            opacity: isOrbitChapter ? 0 : 1,
            transform: isOrbitChapter ? 'scale(0.96)' : 'scale(1)',
            transition: 'opacity 700ms ease, transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <RadialOrbitalTimeline />
        </div>
      </ScrollReveal>
    </div>
  );
};
