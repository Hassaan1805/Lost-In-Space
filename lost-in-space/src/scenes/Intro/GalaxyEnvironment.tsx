import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollController } from '../../systems/ScrollController';
import { PHASE_ELEVEN_START } from './OrbitSequence';

/**
 * A large environment sphere textured with a Milky Way panorama.
 * Fades in during Phase 11 (Beyond) as Neptune recedes.
 * Follows the camera so it always appears as a distant background.
 */
export const GalaxyEnvironment = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const scrollController = useScrollController();
  const { camera } = useThree();

  const texture = useTexture('/hdri/NightSkyHDRI008_4K/NightSkyHDRI008_4K_TONEMAPPED.jpg');

  // Configure texture once
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  // Large inverted sphere geometry — created once
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(4500, 64, 32);
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const fullJourneyProgress = scrollController.getProgress();

    // Calculate Beyond progress (0 at PHASE_ELEVEN_START, 1 at end)
    const beyondProgress = Math.max(
      0,
      Math.min(1, (fullJourneyProgress - PHASE_ELEVEN_START) / (1 - PHASE_ELEVEN_START))
    );

    const mat = materialRef.current;
    if (mat) {
      // Fade in smoothly as we leave Neptune (max 75% opacity per user request)
      mat.opacity = beyondProgress * 0.75;
    }

    // Follow camera position so the sphere always surrounds the viewer
    meshRef.current.position.copy(camera.position);

    // Keep the sphere oriented so the galactic core is visible.
    // We add a tiny scroll-based drift for parallax.
    // Crucially: we add a very slow continuous rotation using the clock
    // so the galaxy feels alive even when not scrolling.
    meshRef.current.rotation.y = Math.PI + (beyondProgress * 0.15) + (state.clock.getElapsedTime() * 0.02);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        side={THREE.BackSide}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
        color={new THREE.Color(1.5, 1.5, 1.5)} // Slight brightness boost to ensure it pops
      />
    </mesh>
  );
};

// Preload the texture
useTexture.preload('/hdri/NightSkyHDRI008_4K/NightSkyHDRI008_4K_TONEMAPPED.jpg');
