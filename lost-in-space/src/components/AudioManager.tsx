import { useEffect, useRef, useState } from 'react';
import { useScrollController } from '../systems/ScrollController';
import { 
  PHASE_FOUR_START, PHASE_FIVE_START, PHASE_SIX_START, 
  PHASE_SEVEN_START, PHASE_EIGHT_START, PHASE_NINE_START, 
  PHASE_TEN_START, PHASE_ELEVEN_START 
} from '../scenes/Intro/OrbitSequence';

type AudioMap = { [key: string]: HTMLAudioElement };

export const AudioManager = () => {
  const scrollController = useScrollController();
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioMapRef = useRef<AudioMap>({});

  // Initialize all 18 audio files
  useEffect(() => {
    const urls = {
      ambientEarth: '/audio/spaceradio.mp3',
      ambientShip: '/audio/dragon-studio-spaceship-interior-5-min-584742.mp3',
      ambientDeep: '/audio/u_7hpxkdroz2-space-461600.mp3',
      ambientBeyond: '/audio/freesound_community-space-sweep-87377.mp3',
      launch: '/audio/49053354-rocket-launch-306441.mp3',
      whoosh: '/audio/floraphonic-scifi-anime-whoosh-39-205026.mp3',
      hover: '/audio/freesound_community-hover-engine-6391.mp3',
      alienRoar: '/audio/fnx_sound-alien-spaceship-roar-287340.mp3',
      success: '/audio/successconfirm.mp3',
      rewind: '/audio/reversedigitalfade.mp3',
      loading: '/audio/loading.mp3',
      notif1: '/audio/notif.mp3',
      notif2: '/audio/notif2.mp3',
      blip: '/audio/softelectronicblip.mp3',
      typing: '/audio/u_jww7bj79ux-binary-code-interface-sound-effects-sci-fi-computer-ui-sounds-209403.mp3',
      click: '/audio/buttonclck.mp3',
      modal: '/audio/modalopen.mp3',
      error: '/audio/error.mp3'
    };

    const map = audioMapRef.current;
    Object.entries(urls).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      map[key] = audio;
    });

    // Configure loops and base volumes
    map.ambientEarth.loop = true;
    map.ambientEarth.volume = 0.2;
    
    map.ambientShip.loop = true;
    map.ambientShip.volume = 0; 
    
    map.ambientDeep.loop = true;
    map.ambientDeep.volume = 0;
    
    map.ambientBeyond.loop = true;
    map.ambientBeyond.volume = 0;
    
    map.hover.loop = true;
    map.hover.volume = 0;
    
    map.launch.volume = 0.4;
    map.whoosh.volume = 0.8; // Increased from 0.3 for better audibility during transitions
    map.alienRoar.volume = 0.5;
    map.rewind.volume = 0.6;
    map.typing.loop = true;
    map.typing.volume = 0.3;

    return () => {
      Object.values(map).forEach(a => {
        a.pause();
        a.removeAttribute('src');
      });
    };
  }, []);

  // Handle first interaction unlock pattern
  useEffect(() => {
    const startAudio = () => {
      if (!hasInteracted) {
        const map = audioMapRef.current;

        // Try playing the main ambient track to see if the browser allows it
        const playPromise = map.ambientEarth.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Success! The browser allowed audio playback.
            setHasInteracted(true);
            
            map.ambientShip.play().catch(() => {});
            map.ambientDeep.play().catch(() => {});
            map.ambientBeyond.play().catch(() => {});
            
            map.loading.volume = 0.5;
            map.loading.play().catch(() => {});

            // Unlock all other audio contexts by playing and immediately pausing
            const unlockAudio = (audio: HTMLAudioElement) => {
              if (!audio) return;
              const origVol = audio.volume;
              audio.volume = 0;
              audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = origVol;
              }).catch(() => {});
            };

            Object.values(map).forEach(audio => {
              if (!audio.loop && audio !== map.loading) unlockAudio(audio);
            });

            // Remove listeners now that we have successfully unlocked
            window.removeEventListener('click', startAudio);
            window.removeEventListener('pointerdown', startAudio);
            window.removeEventListener('touchstart', startAudio);
            window.removeEventListener('keydown', startAudio);
            window.removeEventListener('wheel', startAudio);
          }).catch(() => {
            // Failed due to autoplay policy (likely a wheel event). 
            // Do not set hasInteracted so we can try again on the next event.
          });
        }
      }
    };

    // Wheel events are famously bad for unlocking audio in Chrome/Safari.
    // However, some browsers or high-MEI scores allow it, so we should attempt it.
    window.addEventListener('click', startAudio);
    window.addEventListener('pointerdown', startAudio);
    window.addEventListener('touchstart', startAudio);
    window.addEventListener('keydown', startAudio);
    window.addEventListener('wheel', startAudio);

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('pointerdown', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('wheel', startAudio);
    };
  }, [hasInteracted]);

  // Handle UI custom events (play-ui-sound)
  useEffect(() => {
    const handleUISound = (e: Event) => {
      if (!hasInteracted) return;
      const customEvent = e as CustomEvent<string>;
      const soundId = customEvent.detail;
      const audio = audioMapRef.current[soundId];
      if (audio) {
        if (soundId === 'typing' && (e as any).action === 'stop') {
          audio.pause();
          return;
        }
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    window.addEventListener('play-ui-sound', handleUISound);
    return () => window.removeEventListener('play-ui-sound', handleUISound);
  }, [hasInteracted]);

  // Handle scroll-based sound effects and crossfading
  useEffect(() => {
    if (!hasInteracted) return;
    const map = audioMapRef.current;

    let triggeredLaunch = false;
    let lastPhase = 'EARTH';
    let wasRewound = false;

    const handleScrollState = (state: any) => {
      // Smoothly crossfade ambients based on progress
      const p = state.progress;
      
      // Helper function to safely play/pause and set volume
      const setAudio = (audio: HTMLAudioElement, vol: number) => {
        // Clamp volume to 0-1 just to be safe
        const safeVol = Math.max(0, Math.min(1, vol));
        audio.volume = safeVol;
        
        if (safeVol > 0 && audio.paused) {
          audio.play().catch(() => {});
        } else if (safeVol === 0 && !audio.paused) {
          audio.pause();
        }
      };
      
      // Earth (0 -> PHASE_FOUR_START)
      const earthFade = 1 - Math.min(1, Math.max(0, p / PHASE_FOUR_START));
      setAudio(map.ambientEarth, 0.2 * earthFade);
      
      // Ship Rumble (PHASE_FOUR_START -> PHASE_EIGHT_START)
      let shipVol = 0;
      if (p > PHASE_FOUR_START && p <= PHASE_EIGHT_START) {
        shipVol = 0.4;
      } else if (p > PHASE_EIGHT_START) {
        shipVol = 0.4 * (1 - Math.min(1, (p - PHASE_EIGHT_START) / (PHASE_NINE_START - PHASE_EIGHT_START)));
      }
      setAudio(map.ambientShip, shipVol);

      // Deep Space (PHASE_SEVEN_START -> PHASE_TEN_START)
      let deepVol = 0;
      if (p > PHASE_SIX_START) {
        deepVol = 0.3 * Math.min(1, (p - PHASE_SIX_START) / (PHASE_SEVEN_START - PHASE_SIX_START));
      }
      if (p > PHASE_TEN_START) {
        deepVol = 0.3 * (1 - Math.min(1, (p - PHASE_TEN_START) / (PHASE_ELEVEN_START - PHASE_TEN_START)));
      }
      setAudio(map.ambientDeep, deepVol);

      // Beyond Void Sweep (PHASE_ELEVEN_START -> 1.0)
      if (p >= PHASE_TEN_START) {
        setAudio(map.ambientBeyond, 0.5 * Math.min(1, (p - PHASE_TEN_START) / (PHASE_ELEVEN_START - PHASE_TEN_START)));
      } else {
        setAudio(map.ambientBeyond, 0);
      }

      // Dynamic Transit Engine Sound (Based on scroll velocity)
      let hoverVol = 0;
      if (p > PHASE_FOUR_START && p < PHASE_TEN_START) {
        const vel = Math.abs(state.velocity || 0);
        // Fade in based on velocity, maxing out at 0.5 volume for fast scrolling
        hoverVol = Math.min(0.5, vel / 30);
      }
      setAudio(map.hover, hoverVol);

      // One-Shot Triggers
      // 1. Launch
      if (p > 0.05 && !triggeredLaunch && !wasRewound) {
        triggeredLaunch = true;
        map.launch.currentTime = 0;
        map.launch.play().catch(() => {});
      }

      // Detect Phase changes for whooshes and events
      if (state.phase.id !== lastPhase) {
        // Play notification when new phase/UI panel is reached
        if (state.phase.id !== 'EARTH') {
          map.notif1.currentTime = 0;
          map.notif1.play().catch(() => {});
        }

        // Entering Giant Planets
        if (state.phase.id === 'JUPITER' || state.phase.id === 'SATURN') {
          map.alienRoar.currentTime = 0;
          map.alienRoar.play().catch(() => {});
        }
        
        // Entering Beyond
        if (state.phase.id === 'BEYOND') {
          map.success.currentTime = 0;
          map.success.play().catch(() => {});
        }

        // Generic Transit Whoosh
        if (state.phase.id !== 'EARTH' && state.phase.id !== 'BEYOND') {
          map.whoosh.currentTime = 0;
          map.whoosh.play().catch(() => {});
        }

        lastPhase = state.phase.id;
      }

      // Detect Rewind / Loop Reset
      if (p === 0 && triggeredLaunch && state.velocity < -5) {
        // Just rewound to top
        map.rewind.currentTime = 0;
        map.rewind.play().catch(() => {});
        triggeredLaunch = false;
        wasRewound = true;
        
        // Reset rewind flag after 2 seconds
        setTimeout(() => { wasRewound = false; }, 2000);
      }
    };

    const unsubscribe = scrollController.onStateChange(handleScrollState);
    
    // Apply initial state immediately upon interaction!
    handleScrollState(scrollController.getState());

    // Global click listener for generic UI sounds
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        map.click.currentTime = 0;
        map.click.play().catch(() => {});
      }
    };
    window.addEventListener('click', handleGlobalClick);

    return () => {
      unsubscribe();
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [scrollController, hasInteracted]);

  return null; // Audio manager has no UI
};
