import { useEffect, useRef, useState } from 'react';
import { useScrollController } from '../systems/ScrollController';
import { EARTH_JOURNEY_END } from '../scenes/Intro/OrbitSequence';

export const AudioManager = () => {
  const scrollController = useScrollController();
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const sweepRef = useRef<HTMLAudioElement | null>(null);
  const whooshRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    ambienceRef.current = new Audio('/audio/spaceradio.mp3');
    ambienceRef.current.loop = true;
    ambienceRef.current.volume = 0.2;

    sweepRef.current = new Audio('/audio/freesound_community-space-sweep-87377.mp3');
    sweepRef.current.volume = 0.4;
    
    whooshRef.current = new Audio('/audio/floraphonic-scifi-anime-whoosh-39-205026.mp3');
    whooshRef.current.volume = 0.3;

    return () => {
      ambienceRef.current?.pause();
      sweepRef.current?.pause();
      whooshRef.current?.pause();
    };
  }, []);

  // Handle first interaction
  useEffect(() => {
    const startAudio = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        ambienceRef.current?.play().catch(() => {});
        // Remove listeners
        window.removeEventListener('click', startAudio);
        window.removeEventListener('wheel', startAudio);
        window.removeEventListener('touchstart', startAudio);
      }
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('wheel', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('wheel', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
  }, [hasInteracted]);

  // Handle scroll-based sound effects
  useEffect(() => {
    let triggeredEarthApproach = false;

    const unsubscribe = scrollController.onStateChange((state) => {
      if (state.progress > 0.4 * EARTH_JOURNEY_END && !triggeredEarthApproach) {
        triggeredEarthApproach = true;
        sweepRef.current?.play().catch(() => {});
      } else if (state.progress < 0.3 * EARTH_JOURNEY_END && triggeredEarthApproach) {
        // Reset if we scroll back up
        triggeredEarthApproach = false;
      }
    });

    return unsubscribe;
  }, [scrollController]);

  return null; // Audio manager has no UI
};
