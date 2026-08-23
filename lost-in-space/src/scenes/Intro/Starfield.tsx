import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollController } from '../../systems/ScrollController';
import { EARTH_JOURNEY_END, PHASE_FOUR_START, PHASE_ELEVEN_START } from './OrbitSequence';

const createStarPositions = (count: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Increase radius to comfortably surround the camera volume
    const radius = 50 + Math.random() * 800;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return positions;
};

const createStarSizes = (count: number) => {
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Some stars are much larger (closer) than others
    sizes[i] = Math.random() > 0.95 ? 2.0 + Math.random() * 2.5 : 0.5 + Math.random() * 1.0;
  }
  return sizes;
};

const createStarColors = (count: number) => {
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const variation = Math.random();
    let r = 1, g = 1, b = 1;

    // Very subtle color variations (mostly white, some faint blue/orange)
    if (variation > 0.9) {
      r = 0.8; g = 0.9; b = 1.0; // blue-ish
    } else if (variation < 0.1) {
      r = 1.0; g = 0.9; b = 0.8; // orange-ish
    } else {
      const brightness = 0.6 + Math.random() * 0.4;
      r = g = b = brightness;
    }

    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }
  return colors;
};

export const Starfield = () => {
  const starsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const initialPositions = useRef<Float32Array | null>(null);

  // Responsive star count
  const starCount = window.innerWidth < 768 ? 3000 : 8000;

  const positions = useMemo(() => createStarPositions(starCount), [starCount]);
  const sizes = useMemo(() => createStarSizes(starCount), [starCount]);
  const colors = useMemo(() => createStarColors(starCount), [starCount]);

  const scrollController = useScrollController();
  const { camera } = useThree();

  useFrame((state, delta) => {
    const points = starsRef.current;
    if (!points) return;

    // Cinematic forward drift + parallax based on scroll
    const fullJourneyProgress = scrollController.getProgress();
    const scrollProgress = Math.min(fullJourneyProgress / EARTH_JOURNEY_END, 1);
    const driftSpeed = 0.5 + (scrollProgress * 2.0); // Drift faster as we approach Earth

    // Phase 4 needs more visual breathing room than the approach sequence.
    const orbitProgress = Math.max(
      0,
      Math.min(1, (fullJourneyProgress - PHASE_FOUR_START) / (1 - PHASE_FOUR_START)),
    );
    if (materialRef.current) {
      materialRef.current.size = 1 - orbitProgress * 0.45;
      materialRef.current.opacity = 0.8 - orbitProgress * 0.2;
    }

    const pos = points.geometry.attributes.position;
    if (!initialPositions.current) {
      initialPositions.current = new Float32Array(pos.array);
    }

    // Beyond progress adds an accelerating baseline drift
    const beyondProgress = Math.max(0, Math.min(1, (fullJourneyProgress - PHASE_ELEVEN_START) / (1 - PHASE_ELEVEN_START)));
    const beyondDrift = beyondProgress * 15.0;

    // Wrap dimensions
    const wrapRange = 1600;
    const halfWrap = wrapRange / 2;
    const camX = camera.position.x;
    const camY = camera.position.y;
    const camZ = camera.position.z;

    for (let i = 0; i < pos.count; i++) {
      const idx = i * 3;

      // Multi-depth motion: pseudo-random speed per star based on its index
      // Creates parallax even when camera is still
      const depthMultiplier = 5 + (i % 15);
      const totalSpeed = (driftSpeed + beyondDrift) * depthMultiplier;

      // Update Z position (stars drift forward towards camera)
      (pos.array as Float32Array)[idx + 2] += totalSpeed * delta;

      // Wrap relative to camera to ensure stars are ALWAYS around the viewer
      let x = (pos.array as Float32Array)[idx];
      let y = (pos.array as Float32Array)[idx + 1];
      let z = (pos.array as Float32Array)[idx + 2];

      if (x > camX + halfWrap) x -= wrapRange;
      if (x < camX - halfWrap) x += wrapRange;
      if (y > camY + halfWrap) y -= wrapRange;
      if (y < camY - halfWrap) y += wrapRange;
      if (z > camZ + halfWrap) z -= wrapRange;
      if (z < camZ - halfWrap) z += wrapRange;

      (pos.array as Float32Array)[idx] = x;
      (pos.array as Float32Array)[idx + 1] = y;
      (pos.array as Float32Array)[idx + 2] = z;
    }
    pos.needsUpdate = true;

    // Slowly rotate the entire starfield
    points.rotation.y += delta * 0.02;
    points.rotation.z += delta * 0.01;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={1}
        sizeAttenuation
        transparent
        opacity={0.8}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
