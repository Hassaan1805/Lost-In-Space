import React, { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TOTAL_SCROLL_VH = 4100;
export const PHASE_FOUR_START = 480 / TOTAL_SCROLL_VH;
export const PHASE_FIVE_START = 680 / TOTAL_SCROLL_VH;
export const PHASE_SIX_START = 1100 / TOTAL_SCROLL_VH;
export const PHASE_SEVEN_START = 1600 / TOTAL_SCROLL_VH;
export const PHASE_EIGHT_START = 2100 / TOTAL_SCROLL_VH;
export const PHASE_NINE_START = 2600 / TOTAL_SCROLL_VH;
export const PHASE_TEN_START = 3100 / TOTAL_SCROLL_VH;
export const PHASE_ELEVEN_START = 3600 / TOTAL_SCROLL_VH;

export interface CinematicPhase {
  id: 'EARTH' | 'ORBIT' | 'MOON' | 'MARS' | 'JUPITER' | 'SATURN' | 'URANUS' | 'NEPTUNE' | 'BEYOND';
  index: number;
  label: string;
  status: string;
}

export const getActivePhase = (progress: number): CinematicPhase => {
  if (progress >= PHASE_ELEVEN_START) return { id: 'BEYOND', index: 9, label: '09 / 09 — BEYOND', status: 'JOURNEY COMPLETE' };
  if (progress >= PHASE_TEN_START) return { id: 'NEPTUNE', index: 8, label: '08 / 09 — NEPTUNE', status: 'OUTERMOST PLANET' };
  if (progress >= PHASE_NINE_START) return { id: 'URANUS', index: 7, label: '07 / 09 — URANUS', status: 'ICE GIANT' };
  if (progress >= PHASE_EIGHT_START) return { id: 'SATURN', index: 6, label: '06 / 09 — SATURN', status: 'RINGED GIANT' };
  if (progress >= PHASE_SEVEN_START) return { id: 'JUPITER', index: 5, label: '05 / 09 — JUPITER', status: 'GAS GIANT' };
  if (progress >= PHASE_SIX_START) return { id: 'MARS', index: 4, label: '04 / 09 — MARS', status: 'ORBITAL LOCK' };
  if (progress >= PHASE_FIVE_START) return { id: 'MOON', index: 3, label: '03 / 09 — MOON', status: 'TRANSIT' };
  if (progress >= PHASE_FOUR_START) return { id: 'ORBIT', index: 2, label: '02 / 09 — ORBIT', status: 'ORBITAL LOCK' };
  return { id: 'EARTH', index: 1, label: '01 / 09 — EARTH', status: 'APPROACHING' };
};

export interface SectionConfig {
  id: string;
  element: HTMLElement | null;
  start?: string;
  end?: string;
  pin?: boolean;
  scrub?: number | boolean;
  snap?: number | ((progress: number) => number);
  onEnter?: (progress: number) => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
  onUpdate?: (progress: number) => void;
}

export interface ScrollState {
  scroll: number;
  limit: number;
  progress: number;
  direction: 'up' | 'down' | 'none';
  velocity: number;
  currentSection: string | null;
  isSmooth: boolean;
  phase: CinematicPhase;
}

const DEFAULT_STATE: ScrollState = {
  scroll: 0,
  limit: 0,
  progress: 0,
  direction: 'none',
  velocity: 0,
  currentSection: null,
  isSmooth: true,
  phase: getActivePhase(0),
};

const ScrollContext = createContext<ScrollControllerAPI | null>(null);

export const useScrollController = () => {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error('useScrollController must be used within ScrollControllerProvider');
  return ctx;
};

export interface ScrollControllerAPI {
  registerSection: (config: SectionConfig) => void;
  unregisterSection: (id: string) => void;
  scrollTo: (sectionId: string, options?: { duration?: number; offset?: number }) => Promise<void>;
  getProgress: (sectionId?: string) => number;
  getDirection: () => 'up' | 'down' | 'none';
  onSectionEnter: (id: string, callback: (progress: number) => void) => () => void;
  onSectionLeave: (id: string, callback: () => void) => () => void;
  setSmooth: (enabled: boolean) => void;
  destroy: () => void;
  getState: () => ScrollState;
  onStateChange: (callback: (state: ScrollState) => void) => () => void;
}

class ScrollControllerClass implements ScrollControllerAPI {
  private lenis: Lenis | null = null;
  private state: ScrollState = { ...DEFAULT_STATE };
  private subscribers: Set<(state: ScrollState) => void> = new Set();
  private sections: Map<string, { config: SectionConfig; trigger: ScrollTrigger | null }> = new Map();
  private sectionEnterCallbacks: Map<string, Set<(progress: number) => void>> = new Map();
  private sectionLeaveCallbacks: Map<string, Set<() => void>> = new Map();
  private rafId: number | null = null;
  private wheelListener: ((e: WheelEvent) => void) | null = null;

  init() {
    if (this.lenis) return;

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 2,
    });

    this.lenis.on('scroll', (lenis: Lenis) => {
      this.updateState(lenis);
      ScrollTrigger.update();
    });

    gsap.ticker.add((time: number) => {
      if (this.lenis) {
        this.lenis.raf(time * 1000);
      }
    });
    gsap.ticker.lagSmoothing(0);

    // Add listener to loop back to the beginning when scrolling past the very end
    this.wheelListener = (e: WheelEvent) => {
      if (!this.lenis) return;
      if (this.state.progress >= 0.999 && e.deltaY > 0) {
        // Jump back to start immediately for a loop transition
        this.lenis.scrollTo(0, { immediate: true });
      }
    };
    window.addEventListener('wheel', this.wheelListener, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.lenis) return;
      if (this.state.progress >= 0.999) {
        const touchEndY = e.touches[0].clientY;
        if (touchStartY - touchEndY > 20) {
          // Swiping up (scrolling down)
          this.lenis.scrollTo(0, { immediate: true });
        }
      }
    }, { passive: true });

    this.startRafLoop();
  }

  private startRafLoop() {
    const loop = () => {
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  private updateState(lenis: Lenis) {
    this.state.scroll = lenis.scroll;
    this.state.limit = lenis.limit;
    this.state.progress = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
    this.state.velocity = lenis.velocity;
    this.state.direction = lenis.direction === 1 ? 'down' : lenis.direction === -1 ? 'up' : 'none';
    this.state.phase = getActivePhase(this.state.progress);

    this.checkSectionChanges();
    this.notify();
  }

  private checkSectionChanges() {
    this.sections.forEach(({ config }, id) => {
      if (!config.element) return;
      const rect = config.element.getBoundingClientRect();
      const isInView = rect.bottom > 0 && rect.top < window.innerHeight;
      const wasInView = this.state.currentSection === id;

      if (isInView && !wasInView) {
        this.state.currentSection = id;
        this.sectionEnterCallbacks.get(id)?.forEach(cb => cb(this.state.progress));
      } else if (!isInView && wasInView) {
        this.sectionLeaveCallbacks.get(id)?.forEach(cb => cb());
        if (this.state.currentSection === id) {
          this.state.currentSection = null;
        }
      }
    });
  }

  private notify() {
    this.subscribers.forEach(cb => cb({ ...this.state }));
  }

  registerSection(config: SectionConfig) {
    if (!this.lenis) this.init();

    const trigger = ScrollTrigger.create({
      trigger: config.element,
      start: config.start || 'top bottom',
      end: config.end || 'bottom top',
      pin: config.pin,
      scrub: config.scrub,
      snap: config.snap,
      onEnter: () => config.onEnter?.(this.state.progress),
      onLeave: () => config.onLeave?.(),
      onEnterBack: () => config.onEnterBack?.(),
      onLeaveBack: () => config.onLeaveBack?.(),
      onUpdate: (self) => config.onUpdate?.(self.progress),
    });

    this.sections.set(config.id, { config, trigger });

    if (!this.sectionEnterCallbacks.has(config.id)) {
      this.sectionEnterCallbacks.set(config.id, new Set());
    }
    if (!this.sectionLeaveCallbacks.has(config.id)) {
      this.sectionLeaveCallbacks.set(config.id, new Set());
    }
  }

  unregisterSection(id: string) {
    const section = this.sections.get(id);
    if (section?.trigger) {
      section.trigger.kill();
    }
    this.sections.delete(id);
    this.sectionEnterCallbacks.delete(id);
    this.sectionLeaveCallbacks.delete(id);
  }

  async scrollTo(sectionId: string, options: { duration?: number; offset?: number } = {}) {
    const section = this.sections.get(sectionId);
    if (!section?.config.element) {
      console.warn(`Section ${sectionId} not found`);
      return;
    }

    const { duration = 1, offset = 0 } = options;
    const targetScroll = section.config.element.getBoundingClientRect().top + window.scrollY + offset;

    return new Promise<void>((resolve) => {
      if (!this.lenis) {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        setTimeout(resolve, duration * 1000);
        return;
      }

      this.lenis.scrollTo(targetScroll, {
        duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        onComplete: () => resolve(),
      });
    });
  }

  getProgress(sectionId?: string): number {
    if (sectionId) {
      const section = this.sections.get(sectionId);
      if (section?.trigger) {
        return section.trigger.progress;
      }
      return 0;
    }
    return this.state.progress;
  }

  getDirection(): 'up' | 'down' | 'none' {
    return this.state.direction;
  }

  onSectionEnter(id: string, callback: (progress: number) => void) {
    const callbacks = this.sectionEnterCallbacks.get(id);
    if (callbacks) {
      callbacks.add(callback);
    }
    return () => callbacks?.delete(callback);
  }

  onSectionLeave(id: string, callback: () => void) {
    const callbacks = this.sectionLeaveCallbacks.get(id);
    if (callbacks) {
      callbacks.add(callback);
    }
    return () => callbacks?.delete(callback);
  }

  setSmooth(enabled: boolean) {
    this.state.isSmooth = enabled;
    if (this.lenis) {
      // Approximate smooth by adjusting lerp; lower lerp = smoother
      // @ts-ignore - lerp not exposed publicly, but we can set via private if needed
      // For now just keep state.
    }
    this.notify();
  }

  getState(): ScrollState {
    return { ...this.state };
  }

  onStateChange(callback: (state: ScrollState) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.sections.forEach(({ trigger }) => trigger?.kill());
    this.sections.clear();
    this.sectionEnterCallbacks.clear();
    this.sectionLeaveCallbacks.clear();
    this.subscribers.clear();
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }
    if (this.wheelListener) {
      window.removeEventListener('wheel', this.wheelListener);
      this.wheelListener = null;
    }
    gsap.ticker.remove(() => { });
  }
}

export const ScrollController = new ScrollControllerClass();

interface ScrollControllerProviderProps {
  children: React.ReactNode;
  autoInit?: boolean;
}

export const ScrollControllerProvider: React.FC<ScrollControllerProviderProps> = ({
  children,
  autoInit = true,
}) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (autoInit && !initialized) {
      ScrollController.init();
      setInitialized(true);
    }
    return () => {
      if (initialized) {
        ScrollController.destroy();
      }
    };
  }, [autoInit, initialized]);

  return (
    <ScrollContext.Provider value={ScrollController}>
      {children}
    </ScrollContext.Provider>
  );
};