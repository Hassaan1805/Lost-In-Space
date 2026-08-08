import { useMemo } from 'react';
import { AmbientLight, DirectionalLight, HemisphereLight } from 'three';

export const LightingManager = () => {
  const lights = useMemo(() => [
    // Ambient light for overall illumination
    <AmbientLight key="ambient" color={0xffffff} intensity={0.5} />,
    // Hemisphere light for natural sky/ground tones
    <HemisphereLight key="hemi" skyColor={0x87ceeb} groundColor={0x444444} intensity={0.6} />,
    // Directional light acting as sun
    <DirectionalLight
      key="directional"
      color={0xffffff}
      intensity={1}
      position={[5, 10, 7.5]}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.5}
      shadow-camera-far={50}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
    />,
  ], []);

  return <>{lights}</>;
};