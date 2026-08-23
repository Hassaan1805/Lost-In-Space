import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollController } from '../../systems/ScrollController';
import { PHASE_FIVE_START } from './OrbitSequence';

interface MoonSequenceProps {
  moonPosition: THREE.Vector3;
}

export const MoonSequence = ({ moonPosition }: MoonSequenceProps) => {
  const scrollController = useScrollController();
  const moonRef = useRef<THREE.Group>(null);
  const keyLightRef = useRef<THREE.PointLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  // Load Moon GLB
  const { scene } = useGLTF('/textures/moon/moon.glb');

  const moonModel = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    // Center and scale the model based on its bounding box
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.001);

    clone.position.sub(center);
    // Scale it to be a bit smaller than Earth (Earth is radius 10, so let's make Moon diameter 14 => radius 7)
    clone.scale.setScalar(14 / largestDimension);

    return clone;
  }, [scene]);

  useFrame(() => {
    if (moonRef.current) {
      // Very slow rotation
      moonRef.current.rotation.y += 0.0005;

      const progress = scrollController.getProgress();
      // Only show if we are near Phase 5
      moonRef.current.visible = progress > (PHASE_FIVE_START - 0.2);

      // Smoothly fade Moon lighting in during Phase 5 transition
      const moonProgress = Math.max(0, (progress - PHASE_FIVE_START) / (1 - PHASE_FIVE_START));
      // Ramp over the first 40% of Phase 5, smoothstep eased
      const ramp = Math.min(1, moonProgress / 0.4);
      const lightFade = ramp * ramp * (3 - 2 * ramp);

      if (keyLightRef.current) {
        keyLightRef.current.intensity = 3.5 * lightFade;
      }
      if (fillLightRef.current) {
        fillLightRef.current.intensity = 1.2 * lightFade;
      }
      if (rimLightRef.current) {
        rimLightRef.current.intensity = 1.0 * lightFade;
      }
    }
  });

  return (
    <group ref={moonRef} position={moonPosition}>
      {/*
        Key light — PointLight so it radiates FROM its position (no target issue).
        Positioned in front/right/above the Moon from the camera's perspective.
        Camera final offset is roughly (5, 3, 35) so the camera is at +Z.
        decay=0 prevents distance attenuation, giving uniform coverage.
      */}
      <pointLight
        ref={keyLightRef}
        position={[15, 25, 45]}
        intensity={0}
        color="#ffeedd"
        decay={0}
      />

      {/* Fill light — front-left, softer, cool-tinted to lift shadows */}
      <pointLight
        ref={fillLightRef}
        position={[-30, -5, 35]}
        intensity={0}
        color="#aaccff"
        decay={0}
      />

      {/* Rim light — behind the Moon for subtle edge highlight */}
      <pointLight
        ref={rimLightRef}
        position={[-10, 15, -40]}
        intensity={0}
        color="#ccddff"
        decay={0}
      />

      <primitive object={moonModel} />
    </group>
  );
};

// Preload the model
useGLTF.preload('/textures/moon/moon.glb');

