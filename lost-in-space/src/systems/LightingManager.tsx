import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2, DirectionalLight } from 'three';
import { Environment } from '@react-three/drei';
import { useScrollController } from './ScrollController';
import { PHASE_SIX_START, PHASE_ELEVEN_START } from '../scenes/Intro/OrbitSequence';

export const LightingManager = () => {
  const dirLightRef = useRef<DirectionalLight>(null);
  const scrollController = useScrollController();
  const { scene } = useThree();

  useFrame(() => {
    const p = scrollController.getProgress();
    
    // Default Earth/Moon/Mars intensity
    let dirIntensity = 2.5;
    let envIntensity = 1.0;
    
    // Dim the sun and HDRI as we travel to the outer solar system
    // (Jupiter, Saturn, Uranus, Neptune)
    if (p > PHASE_SIX_START) {
      const outerProgress = Math.min(1, (p - PHASE_SIX_START) / (PHASE_ELEVEN_START - PHASE_SIX_START));
      
      // Drop directional light from 2.5 down to 0.4 at the edge of the system
      dirIntensity = 2.5 - (2.1 * outerProgress);
      // Drop environment ambient contribution from 1.0 down to 0.2
      envIntensity = 1.0 - (0.8 * outerProgress);
    }
    
    if (dirLightRef.current) {
      dirLightRef.current.intensity = dirIntensity;
    }
    scene.environmentIntensity = envIntensity;
  });

  return (
    <>
      <ambientLight color={0xffffff} intensity={0.02} />
      
      <directionalLight
        ref={dirLightRef}
        color={0xffffff}
        intensity={2.5}
        position={[50, 10, -50]}
        castShadow
        // @ts-ignore
        shadowMapSize={new Vector2(2048, 2048)}
        shadowCameraNear={0.5}
        shadowCameraFar={500}
        shadowCameraLeft={-50}
        shadowCameraRight={50}
        shadowCameraTop={50}
        shadowCameraBottom={-50}
      />
      
      <Environment 
        files="/hdri/NightSkyHDRI003_4K/NightSkyHDRI003_4K_TONEMAPPED.jpg" 
        background={false} 
      />
    </>
  );
};