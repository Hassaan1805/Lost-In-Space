import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ScrollController = ({
  onScroll,
}: {
  onScroll?: (progress: number) => void;
}) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    if (onScroll) {
      lenis.on('scroll', ({ scroll, limit }: { scroll: number; limit: number }) => {
        onScroll(scroll / limit);
      });
    }

    return () => {
      lenis.destroy();
      gsap.ticker.remove(() => lenis.raf);
    };
  }, [onScroll]);

  return null;
};