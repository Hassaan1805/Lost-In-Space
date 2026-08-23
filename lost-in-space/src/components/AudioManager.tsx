import { useEffect, useRef, useState } from 'react';
import { useScrollController } from '../systems/ScrollController';
import { EARTH_JOURNEY_END, PHASE_FIVE_START, PHASE_SIX_START, PHASE_SEVEN_START } from '../scenes/Intro/OrbitSequence';

export const AudioManager = () => {
  const scrollController = useScrollController();
  const [hasInteracted, setHasInteracted] = useState(false);

  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const sweepRef = useRef<HTMLAudioElement | null>(null);
  const whooshRef = useRef<HTMLAudioElement | null>(null);
  const hoverRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    ambienceRef.current = new Audio('/audio/spaceradio.mp3');
    ambienceRef.current.loop = true;
    ambienceRef.current.volume = 0.2;

    sweepRef.current = new Audio('/audio/freesound_community-space-sweep-87377.mp3');
    sweepRef.current.volume = 0.4;

    whooshRef.current = new Audio('/audio/floraphonic-scifi-anime-whoosh-39-205026.mp3');
    whooshRef.current.volume = 0.3;

    hoverRef.current = new Audio('/audio/freesound_community-hover-engine-6391.mp3');
    hoverRef.current.volume = 0.4;
    hoverRef.current.loop = true;

    return () => {
      ambienceRef.current?.pause();
      sweepRef.current?.pause();
      whooshRef.current?.pause();
      hoverRef.current?.pause();
    };
  }, []);

  // Handle first interaction unlock pattern
  useEffect(() => {
    const startAudio = () => {
      if (!hasInteracted) {
        setHasInteracted(true);

        // Start background ambience
        ambienceRef.current?.play().catch(() => { });

        // Unlock all other audio contexts by playing and immediately pausing
        const unlockAudio = (audio: HTMLAudioElement | null) => {
          if (audio) {
            audio.volume = 0;
            audio.play().then(() => {
              audio.pause();
              audio.currentTime = 0;
              // Restore volume based on which element it is
              if (audio === sweepRef.current || audio === hoverRef.current) audio.volume = 0.4;
              if (audio === whooshRef.current) audio.volume = 0.3;
            }).catch(() => { });
          }
        };

        unlockAudio(sweepRef.current);
        unlockAudio(whooshRef.current);
        unlockAudio(hoverRef.current);

        // Remove listeners
        window.removeEventListener('click', startAudio);
        window.removeEventListener('wheel', startAudio);
        window.removeEventListener('touchstart', startAudio);
        window.removeEventListener('keydown', startAudio);
      }
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('wheel', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('wheel', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
  }, [hasInteracted]);

  // Handle scroll-based sound effects
  useEffect(() => {
    let triggeredEarthApproach = false;
    let triggeredOrbitDeparture = false;
    let triggeredMoonArrival = false;

    const unsubscribe = scrollController.onStateChange((state) => {
      // 1. Approaching Earth
      if (state.progress > 0.4 * EARTH_JOURNEY_END && !triggeredEarthApproach) {
        triggeredEarthApproach = true;
        if (hasInteracted) sweepRef.current?.play().catch(() => { });
      } else if (state.progress < 0.3 * EARTH_JOURNEY_END && triggeredEarthApproach) {
        triggeredEarthApproach = false;
      }

      // 2. Leaving Earth Orbit (Phase 5 start)
      if (state.progress > PHASE_FIVE_START && !triggeredOrbitDeparture) {
        triggeredOrbitDeparture = true;
        if (hasInteracted) {
          whooshRef.current?.play().catch(() => { });
        }
      } else if (state.progress < PHASE_FIVE_START - 0.05 && triggeredOrbitDeparture) {
        triggeredOrbitDeparture = false;
      }

      // 3. Moon Arrival (Travel phase ends around PHASE_FIVE_START + (1-PHASE_FIVE_START)*0.7)
      const moonTravelEnd = PHASE_FIVE_START + (PHASE_SIX_START - PHASE_FIVE_START) * 0.7;
      if (state.progress > moonTravelEnd && !triggeredMoonArrival) {
        triggeredMoonArrival = true;
        if (hasInteracted) hoverRef.current?.play().catch(() => { });
      } else if (state.progress < moonTravelEnd - 0.05 && triggeredMoonArrival) {
        triggeredMoonArrival = false;
        hoverRef.current?.pause();
      }

      // 4. Leaving Moon (Phase 6 start)
      if (state.progress > PHASE_SIX_START && !triggeredMoonArrival) {
        // We reuse the whoosh and sweep for transit
        if (hasInteracted) {
          sweepRef.current?.play().catch(() => { });
          whooshRef.current?.play().catch(() => { });
        }
      }

      // 5. Leaving Mars (Phase 7 start)
      if (state.progress > PHASE_SEVEN_START) {
        if (hasInteracted) {
          sweepRef.current?.play().catch(() => { });
          whooshRef.current?.play().catch(() => { });
        }
      }
    });

    return unsubscribe;
  }, [scrollController, hasInteracted]);

  return null; // Audio manager has no UI
};
