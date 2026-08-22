import { useMemo } from 'react';
import { Vector2 } from 'three';
import { Environment } from '@react-three/drei';

export const LightingManager = () => {
  const lights = useMemo(() => [
    // Very dim ambient light for deep space
    <ambientLight key="ambient" color={0xffffff} intensity={0.02} />,
    
    // Directional light acting as the strong sun
    <directionalLight
      key="directional"
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
    />,
  ], []);

  return (
    <>
      {lights}
      <Environment 
        files="/hdri/NightSkyHDRI003_4K/NightSkyHDRI003_4K_TONEMAPPED.jpg" 
        background={false} 
      />
    </>
  );
};