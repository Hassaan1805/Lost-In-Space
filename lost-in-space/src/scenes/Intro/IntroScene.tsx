import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { useCameraController } from '../../systems/CameraController';
import { LightingManager } from '../../systems/LightingManager';
import { useScrollController } from '../../systems/ScrollController';
import { Starfield } from './Starfield';
import { Earth } from './Earth';
import { EARTH_JOURNEY_END, PHASE_FOUR_START, ORBIT_STABLE_START, PHASE_FIVE_START, PHASE_SIX_START, PHASE_SEVEN_START, PHASE_EIGHT_START, PHASE_NINE_START, PHASE_TEN_START, PHASE_ELEVEN_START, OrbitSequence } from './OrbitSequence';
import { MoonSequence } from './MoonSequence';
import { MarsSequence } from './MarsSequence';
import { JupiterSequence } from './JupiterSequence';
import { SaturnSequence } from './SaturnSequence';
import { UranusSequence } from './UranusSequence';
import { NeptuneSequence } from './NeptuneSequence';
import { GalaxyEnvironment } from './GalaxyEnvironment';
import * as THREE from 'three';
import gsap from 'gsap';

export const IntroScene = () => {
  const cameraController = useCameraController();
  const scrollController = useScrollController();

  // Earth's position in the scene
  const earthPosition = useMemo(() => new THREE.Vector3(0, 0, -80), []);
  // Moon's position far out
  const moonPosition = useMemo(() => new THREE.Vector3(280, 20, -350), []);
  // Offset the camera target UP (positive Y) to push the Moon DOWN into the visual center
  const moonVisualTarget = useMemo(() => moonPosition.clone().add(new THREE.Vector3(0, 5, 0)), [moonPosition]);
  // Mars' position even further out
  const marsPosition = useMemo(() => new THREE.Vector3(800, -50, -900), []);
  // Offset target RIGHT (+X) to push Mars to the LEFT of the screen
  const marsVisualTarget = useMemo(() => marsPosition.clone().add(new THREE.Vector3(30, 0, 0)), [marsPosition]);
  // Jupiter's position in deep space
  const jupiterPosition = useMemo(() => new THREE.Vector3(2000, -100, -2500), []);
  // Offset target LEFT (-X) to push Jupiter to the RIGHT of the screen
  const jupiterVisualTarget = useMemo(() => jupiterPosition.clone().add(new THREE.Vector3(-45, 0, 0)), [jupiterPosition]);
  // Saturn's position in deep space
  const saturnPosition = useMemo(() => new THREE.Vector3(3800, -200, -4500), []);
  // Offset target RIGHT (+X) to push Saturn to the LEFT of the screen
  const saturnVisualTarget = useMemo(() => saturnPosition.clone().add(new THREE.Vector3(35, 0, 0)), [saturnPosition]);
  // Uranus's position further in deep space
  const uranusPosition = useMemo(() => new THREE.Vector3(6000, -300, -7500), []);
  // Offset target LEFT (-X) to push Uranus to the RIGHT of the screen
  const uranusVisualTarget = useMemo(() => uranusPosition.clone().add(new THREE.Vector3(-30, 0, 0)), [uranusPosition]);
  // Neptune's position further in deep space
  const neptunePosition = useMemo(() => new THREE.Vector3(8200, -400, -10500), []);
  // Offset target RIGHT (+X) to push Neptune to the LEFT of the screen
  const neptuneVisualTarget = useMemo(() => neptunePosition.clone().add(new THREE.Vector3(30, 0, 0)), [neptunePosition]);

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
    let postMoonOffset = new THREE.Vector3();
    if (fullJourneyProgress > PHASE_FIVE_START) {
      const moonProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_FIVE_START) / (PHASE_SIX_START - PHASE_FIVE_START)
      );

      const p1 = 0.10; // Pull back
      const p2 = 0.25; // Turn to Moon
      const p3 = 0.45; // Travel to Moon
      const p4 = 0.60; // Arrive at final offset

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
        currentTarget.lerpVectors(earthPosition, moonVisualTarget, ease);
        currentOffset.lerpVectors(pullBackOffset, offsetAtPullbackLookingAtMoon, ease);
      } else if (moonProgress < p3) {
        // Travel: fly to Moon
        const subP = (moonProgress - p2) / (p3 - p2);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(moonVisualTarget);
        currentOffset.lerpVectors(offsetAtPullbackLookingAtMoon, approachOffset, ease);
      } else if (moonProgress < p4) {
        const subP = (moonProgress - p3) / (p4 - p3);
        const ease = gsap.parseEase('power3.out')(subP);
        currentTarget.copy(moonVisualTarget);
        currentOffset.lerpVectors(approachOffset, finalMoonOffset, ease);
      } else {
        const subP = (moonProgress - p4) / (1 - p4);
        currentTarget.copy(moonVisualTarget);
        const driftOffset = finalMoonOffset.clone().multiplyScalar(0.95);
        currentOffset.lerpVectors(finalMoonOffset, driftOffset, subP);
      }
      postMoonOffset.copy(currentOffset);
    }
    currentOffset.copy(postMoonOffset.lengthSq() > 0 ? postMoonOffset : currentOffset);

    // Phase 6: Mars Approach
    let postMarsOffset = new THREE.Vector3();
    if (fullJourneyProgress > PHASE_SIX_START) {
      const marsProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_SIX_START) / (PHASE_SEVEN_START - PHASE_SIX_START)
      );

      const p1 = 0.10; // Pull back
      const p2 = 0.25; // Turn to Mars
      const p3 = 0.45; // Travel to Mars
      const p4 = 0.60; // Arrive at final offset

      // Base values at end of Moon sequence
      const finalMoonOffset = new THREE.Vector3(5, 3, 35);
      const pullBackOffset = new THREE.Vector3(40, 20, 80);

      const absCameraAtPullback = moonPosition.clone().add(pullBackOffset);
      const offsetAtPullbackLookingAtMars = absCameraAtPullback.clone().sub(marsVisualTarget);

      const approachOffset = new THREE.Vector3(60, 15, 30);
      const finalMarsOffset = new THREE.Vector3(15, 5, 60);

      if (marsProgress < p1) {
        const subP = marsProgress / p1;
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(moonVisualTarget);
        currentOffset.lerpVectors(finalMoonOffset, pullBackOffset, ease);
      } else if (marsProgress < p2) {
        const subP = (marsProgress - p1) / (p2 - p1);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.lerpVectors(moonVisualTarget, marsVisualTarget, ease);
        currentOffset.lerpVectors(pullBackOffset, offsetAtPullbackLookingAtMars, ease);
      } else if (marsProgress < p3) {
        const subP = (marsProgress - p2) / (p3 - p2);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(marsVisualTarget);
        currentOffset.lerpVectors(offsetAtPullbackLookingAtMars, approachOffset, ease);
      } else if (marsProgress < p4) {
        const subP = (marsProgress - p3) / (p4 - p3);
        const ease = gsap.parseEase('power3.out')(subP);
        currentTarget.copy(marsVisualTarget);
        currentOffset.lerpVectors(approachOffset, finalMarsOffset, ease);
      } else {
        const subP = (marsProgress - p4) / (1 - p4);
        currentTarget.copy(marsVisualTarget);
        const driftOffset = finalMarsOffset.clone().multiplyScalar(0.95);
        currentOffset.lerpVectors(finalMarsOffset, driftOffset, subP);
      }
      postMarsOffset.copy(currentOffset);
    }
    currentOffset.copy(postMarsOffset.lengthSq() > 0 ? postMarsOffset : currentOffset);

    // Phase 7: Jupiter Approach
    let postJupiterOffset = new THREE.Vector3();
    if (fullJourneyProgress > PHASE_SEVEN_START) {
      const jupiterProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_SEVEN_START) / (PHASE_EIGHT_START - PHASE_SEVEN_START)
      );

      const p1 = 0.10; // Pull back
      const p2 = 0.25; // Turn to Jupiter
      const p3 = 0.45; // Travel to Jupiter
      const p4 = 0.60; // Arrive at final offset

      // Base values at end of Mars sequence
      const finalMarsOffset = new THREE.Vector3(15, 5, 60);
      const pullBackOffset = new THREE.Vector3(60, 20, 180);

      const absCameraAtPullback = marsPosition.clone().add(pullBackOffset);
      const offsetAtPullbackLookingAtJupiter = absCameraAtPullback.clone().sub(jupiterVisualTarget);

      // Travel starts far and swoops in
      const approachOffset = new THREE.Vector3(250, 40, 750);
      // Final framing: closer to make Jupiter slightly larger (dist 360)
      const finalJupiterOffset = new THREE.Vector3(0, 5, 360);

      if (jupiterProgress < p1) {
        const subP = jupiterProgress / p1;
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(marsPosition);
        currentOffset.lerpVectors(finalMarsOffset, pullBackOffset, ease);
      } else if (jupiterProgress < p2) {
        const subP = (jupiterProgress - p1) / (p2 - p1);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.lerpVectors(marsPosition, jupiterVisualTarget, ease);
        currentOffset.lerpVectors(pullBackOffset, offsetAtPullbackLookingAtJupiter, ease);
      } else if (jupiterProgress < p3) {
        const subP = (jupiterProgress - p2) / (p3 - p2);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(jupiterVisualTarget);
        currentOffset.lerpVectors(offsetAtPullbackLookingAtJupiter, approachOffset, ease);
      } else if (jupiterProgress < p4) {
        const subP = (jupiterProgress - p3) / (p4 - p3);
        const ease = gsap.parseEase('power3.out')(subP);
        currentTarget.copy(jupiterVisualTarget);
        currentOffset.lerpVectors(approachOffset, finalJupiterOffset, ease);
      } else {
        const subP = (jupiterProgress - p4) / (1 - p4);
        currentTarget.copy(jupiterVisualTarget);
        const driftOffset = finalJupiterOffset.clone().multiplyScalar(0.95);
        currentOffset.lerpVectors(finalJupiterOffset, driftOffset, subP);
      }
      postJupiterOffset.copy(currentOffset);
    }
    currentOffset.copy(postJupiterOffset.lengthSq() > 0 ? postJupiterOffset : currentOffset);

    // Phase 8: Saturn Approach
    let postSaturnOffset = new THREE.Vector3();
    if (fullJourneyProgress > PHASE_EIGHT_START) {
      const saturnProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_EIGHT_START) / (PHASE_NINE_START - PHASE_EIGHT_START)
      );

      const p1 = 0.10; // Pull back
      const p2 = 0.25; // Turn to Saturn
      const p3 = 0.45; // Travel to Saturn
      const p4 = 0.60; // Arrive at final offset

      // Base values at end of Jupiter sequence
      const finalJupiterOffset = new THREE.Vector3(0, 5, 450);
      const pullBackOffset = new THREE.Vector3(80, 30, 200);

      const absCameraAtPullback = jupiterPosition.clone().add(pullBackOffset);
      const offsetAtPullbackLookingAtSaturn = absCameraAtPullback.clone().sub(saturnVisualTarget);

      // Travel starts far and swoops in
      const approachOffset = new THREE.Vector3(300, 60, 600);
      // Final framing: much closer to make Saturn command the scene (approx twice as large)
      const finalSaturnOffset = new THREE.Vector3(0, 10, 130);

      if (saturnProgress < p1) {
        const subP = saturnProgress / p1;
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(jupiterVisualTarget);
        currentOffset.lerpVectors(finalJupiterOffset, pullBackOffset, ease);
      } else if (saturnProgress < p2) {
        const subP = (saturnProgress - p1) / (p2 - p1);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.lerpVectors(jupiterVisualTarget, saturnVisualTarget, ease);
        currentOffset.lerpVectors(pullBackOffset, offsetAtPullbackLookingAtSaturn, ease);
      } else if (saturnProgress < p3) {
        const subP = (saturnProgress - p2) / (p3 - p2);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(saturnVisualTarget);
        currentOffset.lerpVectors(offsetAtPullbackLookingAtSaturn, approachOffset, ease);
      } else if (saturnProgress < p4) {
        const subP = (saturnProgress - p3) / (p4 - p3);
        const ease = gsap.parseEase('power3.out')(subP);
        currentTarget.copy(saturnVisualTarget);
        currentOffset.lerpVectors(approachOffset, finalSaturnOffset, ease);
      } else {
        const subP = (saturnProgress - p4) / (1 - p4);
        currentTarget.copy(saturnVisualTarget);
        const driftOffset = finalSaturnOffset.clone().multiplyScalar(0.95);
        currentOffset.lerpVectors(finalSaturnOffset, driftOffset, subP);
      }
      postSaturnOffset.copy(currentOffset);
    }
    currentOffset.copy(postSaturnOffset.lengthSq() > 0 ? postSaturnOffset : currentOffset);
    
    // Phase 9: Uranus Approach
    if (fullJourneyProgress > PHASE_NINE_START) {
      const uranusProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_NINE_START) / (PHASE_TEN_START - PHASE_NINE_START)
      );

      const p1 = 0.10; // Pull back
      const p2 = 0.25; // Turn to Uranus
      const p3 = 0.45; // Travel to Uranus
      const p4 = 0.60; // Arrive at final offset

      // Base values at end of Saturn sequence
      const finalSaturnOffset = new THREE.Vector3(0, 10, 130);
      const pullBackOffset = new THREE.Vector3(100, 40, 250);

      const absCameraAtPullback = saturnPosition.clone().add(pullBackOffset);
      const offsetAtPullbackLookingAtUranus = absCameraAtPullback.clone().sub(uranusVisualTarget);

      // Travel starts far and swoops in
      const approachOffset = new THREE.Vector3(400, 80, 800);
      // Final framing: similar to Saturn
      const finalUranusOffset = new THREE.Vector3(0, 10, 180);

      if (uranusProgress < p1) {
        const subP = uranusProgress / p1;
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(saturnVisualTarget);
        currentOffset.lerpVectors(finalSaturnOffset, pullBackOffset, ease);
      } else if (uranusProgress < p2) {
        const subP = (uranusProgress - p1) / (p2 - p1);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.lerpVectors(saturnVisualTarget, uranusVisualTarget, ease);
        currentOffset.lerpVectors(pullBackOffset, offsetAtPullbackLookingAtUranus, ease);
      } else if (uranusProgress < p3) {
        const subP = (uranusProgress - p2) / (p3 - p2);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(uranusVisualTarget);
        currentOffset.lerpVectors(offsetAtPullbackLookingAtUranus, approachOffset, ease);
      } else if (uranusProgress < p4) {
        const subP = (uranusProgress - p3) / (p4 - p3);
        const ease = gsap.parseEase('power3.out')(subP);
        currentTarget.copy(uranusVisualTarget);
        currentOffset.lerpVectors(approachOffset, finalUranusOffset, ease);
      } else {
        const subP = (uranusProgress - p4) / (1 - p4);
        currentTarget.copy(uranusVisualTarget);
        const driftOffset = finalUranusOffset.clone().multiplyScalar(0.95);
        currentOffset.lerpVectors(finalUranusOffset, driftOffset, subP);
      }
    }

    // Phase 10: Neptune Approach
    if (fullJourneyProgress > PHASE_TEN_START) {
      const neptuneProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_TEN_START) / (PHASE_ELEVEN_START - PHASE_TEN_START)
      );

      const p1 = 0.10; // Pull back
      const p2 = 0.25; // Turn to Neptune
      const p3 = 0.45; // Travel to Neptune
      const p4 = 0.60; // Arrive at final offset

      // Base values at end of Uranus sequence
      const finalUranusOffset = new THREE.Vector3(0, 10, 180);
      const pullBackOffset = new THREE.Vector3(100, 40, 250);

      const absCameraAtPullback = uranusPosition.clone().add(pullBackOffset);
      const offsetAtPullbackLookingAtNeptune = absCameraAtPullback.clone().sub(neptuneVisualTarget);

      // Travel starts far and swoops in
      const approachOffset = new THREE.Vector3(400, 80, 800);
      // Final framing: similar to Uranus, but pulled back to decrease size by 1.5x
      const finalNeptuneOffset = new THREE.Vector3(0, 10, 270);

      if (neptuneProgress < p1) {
        const subP = neptuneProgress / p1;
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(uranusVisualTarget);
        currentOffset.lerpVectors(finalUranusOffset, pullBackOffset, ease);
      } else if (neptuneProgress < p2) {
        const subP = (neptuneProgress - p1) / (p2 - p1);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.lerpVectors(uranusVisualTarget, neptuneVisualTarget, ease);
        currentOffset.lerpVectors(pullBackOffset, offsetAtPullbackLookingAtNeptune, ease);
      } else if (neptuneProgress < p3) {
        const subP = (neptuneProgress - p2) / (p3 - p2);
        const ease = gsap.parseEase('power2.inOut')(subP);
        currentTarget.copy(neptuneVisualTarget);
        currentOffset.lerpVectors(offsetAtPullbackLookingAtNeptune, approachOffset, ease);
      } else if (neptuneProgress < p4) {
        const subP = (neptuneProgress - p3) / (p4 - p3);
        const ease = gsap.parseEase('power3.out')(subP);
        currentTarget.copy(neptuneVisualTarget);
        currentOffset.lerpVectors(approachOffset, finalNeptuneOffset, ease);
      } else {
        const subP = (neptuneProgress - p4) / (1 - p4);
        currentTarget.copy(neptuneVisualTarget);
        const driftOffset = finalNeptuneOffset.clone().multiplyScalar(0.95);
        currentOffset.lerpVectors(finalNeptuneOffset, driftOffset, subP);
      }
    }

    // Phase 11: Beyond — camera slowly pulls away from Neptune into deep space
    if (fullJourneyProgress > PHASE_ELEVEN_START) {
      const beyondProgress = Math.min(
        1,
        (fullJourneyProgress - PHASE_ELEVEN_START) / (1 - PHASE_ELEVEN_START)
      );

      // Neptune's final camera state (must match the drift endpoint above)
      const finalNeptuneOffset = new THREE.Vector3(0, 10, 270);

      // Slowly pull away — camera recedes into deep space
      // The final offset is very far from Neptune, making it a distant speck
      const deepSpaceOffset = new THREE.Vector3(0, 60, 12000);

      const ease = gsap.parseEase('power1.inOut')(beyondProgress);
      currentTarget.copy(neptuneVisualTarget);
      currentOffset.lerpVectors(finalNeptuneOffset, deepSpaceOffset, ease);
    }

    cameraController.setTarget(currentTarget, 0.05);
    cameraController.setOffset(currentOffset, 0.05);
  });

  return (
    <>
      <GalaxyEnvironment />
      <Starfield />
      <Earth position={earthPosition.toArray()} />
      <OrbitSequence earthPosition={earthPosition} />
      <MoonSequence moonPosition={moonPosition} />
      <MarsSequence marsPosition={marsPosition} />
      <JupiterSequence jupiterPosition={jupiterPosition} />
      <SaturnSequence saturnPosition={saturnPosition} />
      <UranusSequence uranusPosition={uranusPosition} />
      <NeptuneSequence neptunePosition={neptunePosition} />
      <LightingManager />
    </>
  );
};
