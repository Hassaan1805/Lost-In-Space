import { useEffect, useRef, useState } from 'react';
import { useScrollController } from '../systems/ScrollController';

interface ScrollRevealProps {
  children: React.ReactNode | ((isActive: boolean) => React.ReactNode);
  id?: string;
  start?: string;
  end?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  className?: string;
  offset?: number;
}

export const ScrollReveal = ({ 
  children, 
  id, 
  start = 'top 80%', 
  end = 'bottom 20%',
  direction = 'up',
  delay = 0,
  className = '',
  offset = 0
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const scrollController = useScrollController();
  const [isVisible, setIsVisible] = useState(false);
  
  // Auto-generate an ID if none is provided
  const componentId = useRef(id || `scroll-reveal-${Math.random().toString(36).substr(2, 9)}`).current;

  useEffect(() => {
    if (!ref.current) return;

    scrollController.registerSection({
      id: componentId,
      element: ref.current,
      start,
      end,
      onEnter: () => setIsVisible(true),
      onLeaveBack: () => setIsVisible(false), // Re-hide when scrolling up past it
    });

    return () => scrollController.unregisterSection(componentId);
  }, [componentId, start, end, scrollController]);

  // If a render prop is passed, we let the child handle its own styling/animations
  if (typeof children === 'function') {
    return (
      <div ref={ref} className={className} style={{ position: 'relative', top: offset }}>
        {children(isVisible)}
      </div>
    );
  }

  // Determine initial transform based on direction for standard nodes
  let transform = 'none';
  if (!isVisible) {
    switch (direction) {
      case 'up': transform = 'translateY(40px)'; break;
      case 'down': transform = 'translateY(-40px)'; break;
      case 'left': transform = 'translateX(40px)'; break;
      case 'right': transform = 'translateX(-40px)'; break;
    }
  }

  return (
    <div 
      ref={ref} 
      className={className}
      style={{
        position: 'relative',
        top: offset,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0, 0)' : transform,
        transition: `opacity 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
};
