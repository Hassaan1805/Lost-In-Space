import { Canvas, extend } from '@react-three/fiber';
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';

// Extend Three.js classes for R3F
extend({ Scene, PerspectiveCamera, WebGLRenderer });

export const SceneManager = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      // TODO: Add performance monitoring, pixelRatio handling
    >
      {children}
    </Canvas>
  );
};