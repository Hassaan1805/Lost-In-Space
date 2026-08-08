import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import { OrbitControls, Box, Sphere, Html, Center } from '@react-three/drei';
import { LightingManager } from '../systems/LightingManager';
import { CameraController } from '../systems/CameraController';
import { ScrollController } from '../systems/ScrollController';

const PlaceholderObjects = () => {
  return (
    <>
      {/* TODO: Replace with actual models/assets */}
      <Center>
        <Box position={[-2, 0, 0]} args={[1, 1, 1]} color="#ff6b6b" castShadow receiveShadow />
      </Center>
      <Center>
        <Sphere position={[2, 0, 0]} args={[0.8, 32, 32]} color="#4ecdc4" castShadow receiveShadow />
      </Center>
    </>
  );
};

export const Scene = () => {
  const scrollRef = useRef(0);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={(gl) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
    >
      <Suspense fallback={<Html center>Loading...</Html>}>
        <LightingManager />
        <PlaceholderObjects />
        <CameraController target={new (require('three').Vector3)(0,0,0)} />
        <OrbitControls enablePan={false} enableZoom={true} />
      </Suspense>
      <ScrollController onScroll={(progress) => (scrollRef.current = progress)} />
    </Canvas>
  );
};