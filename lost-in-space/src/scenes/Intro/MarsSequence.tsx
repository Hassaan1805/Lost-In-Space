import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollController } from '../../systems/ScrollController';
import { PHASE_SIX_START } from './OrbitSequence';

interface MarsSequenceProps {
  marsPosition: THREE.Vector3;
}

export const MarsSequence = ({ marsPosition }: MarsSequenceProps) => {
  const scrollController = useScrollController();
  const marsRef = useRef<THREE.Group>(null);
  const keyLightRef = useRef<THREE.PointLight>(null);
  const fillLightRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  // Load Mars GLB
  const { scene } = useGLTF('/textures/planets/mars/mars.glb');

  const marsModel = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    // Center and scale the model based on its bounding box
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.001);

    clone.position.sub(center);
    // Scale it to be a bit smaller than Earth but larger than Moon (radius 8)
    // Scaled up by 1.5x (from 16 to 24)
    clone.scale.setScalar(24 / largestDimension);

    return clone;
  }, [scene]);

  useFrame(() => {
    if (marsRef.current) {
      // Very slow rotation
      marsRef.current.rotation.y += 0.0004;

      const progress = scrollController.getProgress();
      // Only show if we are near Phase 6
      marsRef.current.visible = progress > (PHASE_SIX_START - 0.2);

      // Smoothly fade Mars lighting in during Phase 6 transition
      const marsProgress = Math.max(0, (progress - PHASE_SIX_START) / (1 - PHASE_SIX_START));
      // Ramp over the first 40% of Phase 6, smoothstep eased
      const ramp = Math.min(1, marsProgress / 0.4);
      const lightFade = ramp * ramp * (3 - 2 * ramp);

      if (keyLightRef.current) {
        keyLightRef.current.intensity = 4.0 * lightFade;
      }
      if (fillLightRef.current) {
        fillLightRef.current.intensity = 1.0 * lightFade;
      }
      if (rimLightRef.current) {
        rimLightRef.current.intensity = 1.2 * lightFade;
      }
    }
  });

  return (
    <group ref={marsRef} position={marsPosition}>
      {/*
        Key light — PointLight so it radiates FROM its position (no target issue).
        Positioned in front/right/above Mars from the camera's perspective.
        Camera final offset is roughly (15, 5, 60) so the camera is at +Z.
      */}
      <pointLight
        ref={keyLightRef}
        position={[30, 20, 60]}
        intensity={0}
        color="#ffddcc" // Warmer sun light for Mars
        decay={0}
      />

      {/* Fill light — front-left, softer, red/orange-tinted to lift shadows */}
      <pointLight
        ref={fillLightRef}
        position={[-40, -10, 45]}
        intensity={0}
        color="#ffa888"
        decay={0}
      />

      {/* Rim light — behind Mars for subtle edge highlight */}
      <pointLight
        ref={rimLightRef}
        position={[-15, 25, -50]}
        intensity={0}
        color="#ffccaa"
        decay={0}
      />

      <primitive object={marsModel} />
    </group>
  );
};

// Preload the model
useGLTF.preload('/textures/planets/mars/mars.glb');
