import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { useCameraController } from '../../systems/CameraController';
import { LightingManager } from '../../systems/LightingManager';
import { useScrollController } from '../../systems/ScrollController';
import { Starfield } from './Starfield';
import { Earth } from './Earth';
import { EARTH_JOURNEY_END, PHASE_FOUR_START, OrbitSequence } from './OrbitSequence';
import * as THREE from 'three';
import gsap from 'gsap';

export const IntroScene = () => {
  const cameraController = useCameraController();
  const scrollController = useScrollController();
  
  // Earth's position in the scene
  const earthPosition = useMemo(() => new THREE.Vector3(0, 0, -80), []);

  useFrame(() => {
    const fullJourneyProgress = scrollController.getProgress();
    // Keep Phases 1–3 at the same physical scroll positions after the orbit chapter.
    const progress = Math.min(fullJourneyProgress / EARTH_JOURNEY_END, 1);
    
    // We map the 0-1 progress to specific camera positions
    // Progress mapping:
    // 0.00 -> Far deep space (intro)
    // 0.45 -> Start approaching Earth
    // 0.70 -> Approaching fast
    // 1.00 -> Orbit position
    
    // Default/start positions
    const startOffset = new THREE.Vector3(0, 10, 250); 
    const endOffset = new THREE.Vector3(0, 5, 40); // Orbiting distance
    
    // Calculate current offset using an ease for cinematic feel
    const currentOffset = new THREE.Vector3();
    
    if (progress < 0.25) {
      // Very slow drift initially
      const subProgress = progress / 0.25;
      currentOffset.lerpVectors(startOffset, new THREE.Vector3(0, 10, 230), subProgress);
    } else if (progress < 0.7) {
      // Faster approach as Earth appears
      const subProgress = (progress - 0.25) / 0.45;
      const ease = gsap.parseEase('power2.inOut')(subProgress);
      currentOffset.lerpVectors(new THREE.Vector3(0, 10, 230), new THREE.Vector3(0, 8, 100), ease);
    } else {
      // Final approach to orbit
      const subProgress = (progress - 0.7) / 0.3;
      const ease = gsap.parseEase('power3.out')(subProgress);
      currentOffset.lerpVectors(new THREE.Vector3(0, 8, 100), endOffset, ease);
    }

    if (fullJourneyProgress > PHASE_FOUR_START) {
      const orbitProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_FOUR_START) / (1 - PHASE_FOUR_START),
      );
      const ease = gsap.parseEase('power2.inOut')(orbitProgress);
      currentOffset.lerpVectors(endOffset, new THREE.Vector3(28, 12, 28), ease);
    }

    cameraController.setTarget(earthPosition, 0.05);
    cameraController.setOffset(currentOffset, 0.05);
  });

  return (
    <>
      <Starfield />
      <Earth position={[0, 0, -80]} />
      <OrbitSequence earthPosition={earthPosition} />
      <LightingManager />
    </>
  );
};
