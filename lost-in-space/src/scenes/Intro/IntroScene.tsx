import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { useCameraController } from '../../systems/CameraController';
import { LightingManager } from '../../systems/LightingManager';
import { useScrollController } from '../../systems/ScrollController';
import { Starfield } from './Starfield';
import { Earth } from './Earth';
import { EARTH_JOURNEY_END, PHASE_FOUR_START, ORBIT_STABLE_START, PHASE_FIVE_START, OrbitSequence } from './OrbitSequence';
import { MoonSequence } from './MoonSequence';
import * as THREE from 'three';
import gsap from 'gsap';

export const IntroScene = () => {
  const cameraController = useCameraController();
  const scrollController = useScrollController();

  // Earth's position in the scene
  const earthPosition = useMemo(() => new THREE.Vector3(0, 0, -80), []);
  // Moon's position far out
  const moonPosition = useMemo(() => new THREE.Vector3(280, 20, -350), []);

  useFrame(() => {
    const fullJourneyProgress = scrollController.getProgress();
    const progress = Math.min(fullJourneyProgress / EARTH_JOURNEY_END, 1);

    // Default/start positions for Earth approach
    const startOffset = new THREE.Vector3(0, 10, 250);
    const endOffset = new THREE.Vector3(0, 5, 40); // Earth Orbiting distance
    const currentOffset = new THREE.Vector3();
    const currentTarget = new THREE.Vector3();

    // Base target is always Earth initially
    currentTarget.copy(earthPosition);

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
      // Final approach to Earth orbit
      const subProgress = (progress - 0.7) / 0.3;
      const ease = gsap.parseEase('power3.out')(subProgress);
      currentOffset.lerpVectors(new THREE.Vector3(0, 8, 100), endOffset, ease);
    }

    // Phase 4: Earth Orbit Sequence
    let postEarthOffset = new THREE.Vector3().copy(currentOffset);
    if (fullJourneyProgress > PHASE_FOUR_START) {
      const orbitProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_FOUR_START) / (ORBIT_STABLE_START - PHASE_FOUR_START)
      );
      const ease = gsap.parseEase('power2.inOut')(orbitProgress);
      postEarthOffset.lerpVectors(endOffset, new THREE.Vector3(28, 12, 28), ease);
    }
    currentOffset.copy(postEarthOffset);

    // Phase 5: Moon Approach
    if (fullJourneyProgress > PHASE_FIVE_START) {
      const moonProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_FIVE_START) / (1 - PHASE_FIVE_START)
      );

      const p1 = 0.10; // Pull back
      const p2 = 0.25; // Turn to Moon
      const p3 = 0.70; // Travel to Moon

      const earthOrbitOffset = new THREE.Vector3(28, 12, 28);
      const pullBackOffset = new THREE.Vector3(60, 20, 60);

      const absCameraAtPullback = earthPosition.clone().add(pullBackOffset);
      const offsetAtPullbackLookingAtMoon = absCameraAtPullback.clone().sub(moonPosition);

      const approachOffset = new THREE.Vector3(40, 12, 20); // Arriving from side
      const finalMoonOffset = new THREE.Vector3(5, 3, 35); // Nearly centered — camera in front of Moon

      if (moonProgress < p1) {
        // Departure: pull back from Earth
        const subP = moonProgress / p1;
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(earthPosition);
        currentOffset.lerpVectors(earthOrbitOffset, pullBackOffset, ease);
      } else if (moonProgress < p2) {
        // Turn: pan target to Moon, keeping absolute camera position fixed
        const subP = (moonProgress - p1) / (p2 - p1);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.lerpVectors(earthPosition, moonPosition, ease);
        currentOffset.lerpVectors(pullBackOffset, offsetAtPullbackLookingAtMoon, ease);
      } else if (moonProgress < p3) {
        // Travel: fly to Moon
        const subP = (moonProgress - p2) / (p3 - p2);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(moonPosition);
        currentOffset.lerpVectors(offsetAtPullbackLookingAtMoon, approachOffset, ease);
      } else {
        // Arrival: settle into orbit around Moon
        const subP = (moonProgress - p3) / (1 - p3);
        const ease = gsap.parseEase('power3.out')(subP);
        currentTarget.copy(moonPosition);
        currentOffset.lerpVectors(approachOffset, finalMoonOffset, ease);
      }
    }

    cameraController.setTarget(currentTarget, 0.05);
    cameraController.setOffset(currentOffset, 0.05);
  });

  return (
    <>
      <Starfield />
      <Earth position={earthPosition.toArray()} />
      <OrbitSequence earthPosition={earthPosition} />
      <MoonSequence moonPosition={moonPosition} />
      <LightingManager />
    </>
  );
};
