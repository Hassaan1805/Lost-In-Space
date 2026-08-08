import { useMemo } from 'react';
import { Vector2 } from 'three';

export const LightingManager = () => {
  const lights = useMemo(() => [
    // Ambient light for overall illumination
    <ambientLight key="ambient" color={0xffffff} intensity={0.5} />,
    // Hemisphere light for natural sky/ground tones
    <hemisphereLight key="hemi" color={0x87ceeb} groundColor={0x444444} intensity={0.6} />,
    // Directional light acting as sun
    <directionalLight
      key="directional"
      color={0xffffff}
      intensity={1}
      position={[5, 10, 7.5]}
      castShadow
      // @ts-ignore
      shadowMapSize={new Vector2(2048, 2048)}
      shadowCameraNear={0.5}
      shadowCameraFar={50}
      shadowCameraLeft={-10}
      shadowCameraRight={10}
      shadowCameraTop={10}
      shadowCameraBottom={-10}
    />,
  ], []);

  return <>{lights}</>;
};